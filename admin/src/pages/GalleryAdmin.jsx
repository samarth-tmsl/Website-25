import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUploadCloud, FiX, FiFolder, FiFolderPlus, FiArrowLeft } from 'react-icons/fi';

function GalleryAdmin() {
  const [albums, setAlbums] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null); // Expanded view of album images
  const [albumImages, setAlbumImages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  
  // Album form data
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    academicYear: '',
    displayOrder: 999,
    active: true
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [deleteOldCover, setDeleteOldCover] = useState(false);

  // Bulk Upload states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]); // Array of { file, preview, caption, progress, status }

  useEffect(() => {
    loadAlbums();
  }, []);

  async function loadAlbums() {
    try {
      setLoading(true);
      setError('');
      const [allAlbums, years] = await Promise.all([
        api.getGalleryAlbums(),
        api.getAcademicYears()
      ]);
      setAlbums(allAlbums);
      setAcademicYears(years);
    } catch (err) {
      setError(err.message || 'Failed to load gallery albums.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExpandAlbum(album) {
    setSelectedAlbum(album);
    setIsUploadOpen(false);
    setUploadFiles([]);
    try {
      setImagesLoading(true);
      const images = await api.getGalleryAlbumImages(album.id);
      setAlbumImages(images);
    } catch (err) {
      setError('Failed to load album images: ' + err.message);
    } finally {
      setImagesLoading(false);
    }
  }

  const handleOpenAddAlbum = () => {
    setEditingAlbum(null);
    setAlbumForm({
      title: '',
      description: '',
      academicYear: academicYears.find(y => y.isCurrent)?.year || (academicYears[0]?.year || ''),
      displayOrder: albums.length + 1,
      active: true
    });
    setCoverPhoto(null);
    setDeleteOldCover(false);
    setIsAlbumModalOpen(true);
  };

  const handleOpenEditAlbum = (album) => {
    setEditingAlbum(album);
    setAlbumForm({
      title: album.title,
      description: album.description,
      academicYear: album.academicYear,
      displayOrder: album.displayOrder,
      active: album.active === true || album.active === "TRUE" || album.active === 1
    });
    setCoverPhoto(null);
    setDeleteOldCover(false);
    setIsAlbumModalOpen(true);
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      const payload = {
        ...albumForm,
        coverImage: coverPhoto,
        deleteOldImage: deleteOldCover
      };

      if (editingAlbum) {
        payload.id = editingAlbum.id;
        await api.updateAlbum(payload);
        setMessage('Album updated successfully!');
      } else {
        await api.createAlbum(payload);
        setMessage('Album created successfully!');
      }
      
      setIsAlbumModalOpen(false);
      await loadAlbums();
    } catch (err) {
      setError(err.message || 'Failed to save album.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (album) => {
    const confirmHard = window.confirm(`Deactivate album "${album.title}"?\nClick OK to soft-delete, or click Cancel to permanently delete.`);
    let hardDelete = false;
    
    if (!confirmHard) {
      const confirmPerm = window.confirm(`PERMANENTLY delete "${album.title}" and ALL ${albumImages.length} images inside it from Google Drive?\nWARNING: This cannot be undone.`);
      if (!confirmPerm) return;
      hardDelete = true;
    }

    try {
      setLoading(true);
      await api.deleteAlbum(album.id, hardDelete);
      setMessage(hardDelete ? 'Album and all contents permanently deleted.' : 'Album deactivated.');
      setSelectedAlbum(null);
      await loadAlbums();
    } catch (err) {
      setError(err.message || 'Failed to delete album.');
    } finally {
      setLoading(false);
    }
  };

  // Image upload handling
  const handleFileDrop = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newUploads = files.map(file => {
      return {
        file,
        preview: URL.createObjectURL(file),
        caption: 'Event@Samarth',
        status: 'pending', // pending, uploading, success, error
        progress: 0,
        error: ''
      };
    });

    setUploadFiles([...uploadFiles, ...newUploads]);
  };

  const handleRemoveUploadItem = (index) => {
    const updated = [...uploadFiles];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setUploadFiles(updated);
  };

  const handleCaptionChange = (index, value) => {
    const updated = [...uploadFiles];
    updated[index].caption = value;
    setUploadFiles(updated);
  };

  const handleBulkUpload = async () => {
    if (!selectedAlbum) return;
    setSubmitting(true);
    setError('');
    
    for (let i = 0; i < uploadFiles.length; i++) {
      if (uploadFiles[i].status === 'success') continue;
      
      const updated = [...uploadFiles];
      updated[i].status = 'uploading';
      setUploadFiles([...updated]);

      try {
        const item = uploadFiles[i];
        
        // Convert file to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        const uploadPayload = {
          base64: base64Data,
          fileName: item.file.name,
          mimeType: item.file.type,
          caption: item.caption,
          displayOrder: albumImages.length + i + 1
        };

        await api.uploadGalleryImage(selectedAlbum.id, uploadPayload);

        const currentUploads = [...uploadFiles];
        currentUploads[i].status = 'success';
        currentUploads[i].progress = 100;
        setUploadFiles([...currentUploads]);
      } catch (err) {
        const currentUploads = [...uploadFiles];
        currentUploads[i].status = 'error';
        currentUploads[i].error = err.message || 'Upload failed.';
        setUploadFiles([...currentUploads]);
      }
    }
    
    setSubmitting(false);
    // Reload album images
    await handleExpandAlbum(selectedAlbum);
  };

  const handleDeleteImage = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to permanently delete image "${name}" from Drive?`);
    if (!confirm) return;

    try {
      setImagesLoading(true);
      await api.deleteGalleryImage(id);
      setMessage('Image deleted.');
      // Refresh
      const images = await api.getGalleryAlbumImages(selectedAlbum.id);
      setAlbumImages(images);
    } catch (err) {
      setError(err.message || 'Failed to delete image.');
    } finally {
      setImagesLoading(false);
    }
  };

  return (
    <div>
      {/* Expanded view */}
      {selectedAlbum ? (
        <div>
          <div className="page-header">
            <button className="btn btn-secondary" onClick={() => setSelectedAlbum(null)}>
              <FiArrowLeft /> Back to Albums
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setIsUploadOpen(!isUploadOpen)}>
                <FiUploadCloud /> {isUploadOpen ? 'Close Upload' : 'Upload Images'}
              </button>
              <button className="btn btn-secondary" style={{ color: 'var(--danger-color)' }} onClick={() => handleDeleteAlbum(selectedAlbum)}>
                <FiTrash2 /> Delete Album
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3>{selectedAlbum.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{selectedAlbum.description || 'No description provided.'}</p>
            <div style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '600', marginTop: '8px' }}>
              Year: {selectedAlbum.academicYear} | Total Photos: {albumImages.length}
            </div>
          </div>

          {/* Bulk Upload Section */}
          {isUploadOpen && (
            <div className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--accent-color)' }}>
              <h4>Bulk Photo Uploader</h4>
              <div style={{ marginTop: '16px' }}>
                <input 
                  type="file" 
                  id="bulk-files" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileDrop} 
                  style={{ display: 'none' }} 
                />
                <label 
                  htmlFor="bulk-files" 
                  className="upload-zone"
                  style={{ display: 'block', marginTop: '0' }}
                >
                  <FiUploadCloud style={{ fontSize: '40px', color: 'var(--accent-color)', marginBottom: '8px' }} />
                  <p style={{ fontWeight: '600' }}>Click to select files or drag images here</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG, JPEG, WEBP allowed (Max 10MB per image)</p>
                </label>
              </div>

              {uploadFiles.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div className="preview-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    {uploadFiles.map((item, index) => (
                      <div key={index} className="glass-card" style={{ padding: '8px', position: 'relative' }}>
                        <button 
                          type="button" 
                          className="preview-remove" 
                          onClick={() => handleRemoveUploadItem(index)}
                          style={{ zIndex: '10' }}
                        >
                          <FiX />
                        </button>
                        <div style={{ height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Caption" 
                          value={item.caption} 
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          style={{ marginTop: '8px', padding: '6px' }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{
                            color: item.status === 'success' ? 'var(--success-color)' :
                                   item.status === 'error' ? 'var(--danger-color)' :
                                   item.status === 'uploading' ? 'var(--accent-color)' : 'var(--text-muted)'
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                          <span>{item.file.name.substring(0, 15)}...</span>
                        </div>
                        {item.status === 'error' && (
                          <div style={{ fontSize: '10px', color: 'var(--danger-color)', marginTop: '4px' }}>{item.error}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button className="btn btn-secondary" onClick={() => setUploadFiles([])}>Clear All</button>
                    <button className="btn btn-primary" onClick={handleBulkUpload} disabled={submitting}>
                      {submitting ? 'Uploading...' : 'Start Upload'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Album Photos List */}
          {imagesLoading ? (
            <div className="spinner"></div>
          ) : (
            <div className="glass-card">
              <h4>Album Photos</h4>
              <div className="preview-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {albumImages.length === 0 ? (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>This album is currently empty. Upload photos to see them here.</p>
                ) : (
                  albumImages.map((img) => (
                    <div key={img.id} className="glass-card" style={{ padding: '8px', position: 'relative' }}>
                      <button 
                        className="preview-remove" 
                        style={{ background: 'var(--danger-color)' }}
                        onClick={() => handleDeleteImage(img.id, img.fileName)}
                      >
                        <FiTrash2 />
                      </button>
                      <div style={{ height: '130px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={img.imageUrl} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '8px 4px 4px 4px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {img.caption || 'No Caption'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Order: {img.displayOrder}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Albums Grid View
        <div>
          <div className="page-header">
            <div>
              <h2>Gallery Albums</h2>
              <div className="page-title-desc">Create and manage event photo albums.</div>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAddAlbum}>
              <FiFolderPlus /> Create Album
            </button>
          </div>

          {message && <div className="badge badge-success" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{message}</div>}
          {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="preview-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {albums.length === 0 ? (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No gallery albums exist yet.</p>
              ) : (
                albums.map((album) => {
                  const isActive = album.active === true || album.active === "TRUE" || album.active === 1;
                  return (
                    <div key={album.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '160px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        {album.coverImageId ? (
                          <img src={album.coverImageUrl} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--text-muted)' }}><FiFolder /></div>
                        )}
                        <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`} style={{ position: 'absolute', top: '8px', right: '8px' }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: '16px', flexGrow: '1' }}>
                        <h4 style={{ fontSize: '18px' }}>{album.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', lineBreak: 'anywhere' }}>
                          {album.description ? album.description.substring(0, 80) + '...' : 'No description.'}
                        </p>
                        <div style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: '600', marginTop: '8px' }}>
                          Year: {album.academicYear} | Order: {album.displayOrder}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                        <button className="btn btn-primary" style={{ flexGrow: '1', padding: '8px' }} onClick={() => handleExpandAlbum(album)}>
                          <FiEye /> View Photos
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEditAlbum(album)}>
                          <FiEdit2 />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Album Add/Edit Modal */}
      {isAlbumModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '20px' }}>{editingAlbum ? 'Edit Album' : 'Create Album'}</h3>
            <form onSubmit={handleAlbumSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Album Title</label>
                  <input 
                    type="text" 
                    value={albumForm.title} 
                    onChange={(e) => setAlbumForm({...albumForm, title: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label>Academic Year</label>
                  <select 
                    value={albumForm.academicYear} 
                    onChange={(e) => setAlbumForm({...albumForm, academicYear: e.target.value})}
                    required
                  >
                    {academicYears.map(y => (
                      <option key={y.id} value={y.year}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={albumForm.description} 
                  onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Cover Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setCoverPhoto({ base64: reader.result, fileName: file.name, mimeType: file.type });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
                <div>
                  {editingAlbum && editingAlbum.coverImageId && (
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ display: 'inline' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 'auto', display: 'inline', margin: '0 6px 0 0' }} 
                          checked={deleteOldCover} 
                          onChange={(e) => setDeleteOldCover(e.target.checked)} 
                        />
                        Delete old cover photo from Drive
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Display Order</label>
                  <input 
                    type="number" 
                    value={albumForm.displayOrder} 
                    onChange={(e) => setAlbumForm({...albumForm, displayOrder: parseInt(e.target.value) || 999})} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
                  <label style={{ display: 'inline', margin: '0' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto', display: 'inline', margin: '0 8px 0 0' }} 
                      checked={albumForm.active} 
                      onChange={(e) => setAlbumForm({...albumForm, active: e.target.checked})} 
                    />
                    Active (visible on website)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAlbumModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryAdmin;

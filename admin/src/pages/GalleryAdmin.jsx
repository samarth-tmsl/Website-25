import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiTrash2, FiImage, FiUploadCloud, FiX } from 'react-icons/fi';

function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Bulk Upload states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]); // Array of { file, preview, caption }

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      setLoading(true);
      setError('');
      const list = await api.getGalleryAlbumImages("GENERAL");
      setImages(list);
    } catch (err) {
      setError(err.message || 'Failed to load media gallery photos.');
    } finally {
      setLoading(false);
    }
  }

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
    setSubmitting(true);
    setError('');
    setMessage('');
    
    let uploadedCount = 0;

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
          displayOrder: images.length + i + 1
        };

        // We pass "GENERAL" as a default placeholder albumId under the new single-gallery model
        await api.uploadGalleryImage("GENERAL", uploadPayload);

        const currentUploads = [...uploadFiles];
        currentUploads[i].status = 'success';
        currentUploads[i].progress = 100;
        setUploadFiles([...currentUploads]);
        uploadedCount++;
      } catch (err) {
        const currentUploads = [...uploadFiles];
        currentUploads[i].status = 'error';
        currentUploads[i].error = err.message || 'Upload failed.';
        setUploadFiles([...currentUploads]);
      }
    }
    
    setSubmitting(false);
    setMessage(`Successfully uploaded ${uploadedCount} photos.`);
    setUploadFiles([]);
    setIsUploadOpen(false);
    await loadImages();
  };

  const handleDeleteImage = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to permanently delete image "${name}" from Google Drive?\nThis cannot be undone.`);
    if (!confirm) return;

    try {
      setLoading(true);
      await api.deleteGalleryImage(id);
      setMessage('Image deleted successfully.');
      await loadImages();
    } catch (err) {
      setError(err.message || 'Failed to delete image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Media Gallery</h2>
          <div className="page-title-desc">Upload and manage flat photos displayed on the main website gallery.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadOpen(!isUploadOpen)}>
          <FiUploadCloud /> {isUploadOpen ? 'Close Upload' : 'Upload Images'}
        </button>
      </div>

      {message && <div className="badge badge-success" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{message}</div>}
      {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

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

      {/* Media Photos Grid */}
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="glass-card">
          <h3>Media Photos ({images.length})</h3>
          <div className="preview-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginTop: '20px' }}>
            {images.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No photos uploaded yet.</p>
            ) : (
              images.map((img) => (
                <div key={img.id} className="glass-card" style={{ padding: '8px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <button 
                    className="preview-remove" 
                    style={{ background: 'var(--danger-color)' }}
                    onClick={() => handleDeleteImage(img.id, img.fileName)}
                  >
                    <FiTrash2 />
                  </button>
                  <div style={{ height: '130px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={img.imageUrl || img.img} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '8px 4px 4px 4px', flexGrow: '1' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={img.caption}>
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
  );
}

export default GalleryAdmin;

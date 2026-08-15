import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiArrowUp, FiArrowDown } from 'react-icons/fi';

function GuestsAdmin() {
  const [guests, setGuests] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [events, setEvents] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    organization: '',
    description: '',
    eventId: '',
    academicYear: '',
    displayOrder: 999,
    active: true
  });
  const [photoPayload, setPhotoPayload] = useState(null);
  const [deleteOldImage, setDeleteOldImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [allGuests, years, allEvents] = await Promise.all([
        api.getGuests(),
        api.getAcademicYears(),
        api.getEvents()
      ]);
      setGuests(allGuests);
      setAcademicYears(years);
      setEvents(allEvents);
      
      const activeYear = years.find(y => y.isCurrent)?.year || (years[0]?.year || '');
      setSelectedYear(activeYear);
    } catch (err) {
      setError(err.message || 'Failed to load guest data.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      designation: '',
      organization: '',
      description: '',
      eventId: events[0]?.id || '',
      academicYear: selectedYear || (academicYears[0]?.year || ''),
      displayOrder: guests.length + 1,
      active: true
    });
    setPhotoPayload(null);
    setDeleteOldImage(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      designation: guest.designation,
      organization: guest.organization,
      description: guest.description,
      eventId: guest.eventId,
      academicYear: guest.academicYear,
      displayOrder: guest.displayOrder,
      active: guest.active === true || guest.active === "TRUE" || guest.active === 1
    });
    setPhotoPayload(null);
    setDeleteOldImage(false);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPayload({
        base64: reader.result,
        fileName: file.name,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      const payload = {
        ...formData,
        image: photoPayload,
        deleteOldImage
      };

      if (editingGuest) {
        payload.id = editingGuest.id;
        await api.updateGuest(payload);
        setMessage('Guest updated successfully!');
      } else {
        await api.createGuest(payload);
        setMessage('Guest added successfully!');
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save guest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmHard = window.confirm(`Deactivate guest speaker "${name}"?\nClick OK to soft-delete (deactivate), or click Cancel to permanently delete.`);
    let hardDelete = false;
    
    if (!confirmHard) {
      const confirmPerm = window.confirm(`PERMANENTLY delete "${name}" and remove photo from Google Drive?`);
      if (!confirmPerm) return;
      hardDelete = true;
    }

    try {
      setLoading(true);
      await api.deleteGuest(id, hardDelete);
      setMessage(hardDelete ? 'Guest permanently deleted.' : 'Guest deactivated.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (guest, direction) => {
    const filtered = filteredGuests;
    const index = filtered.findIndex(g => g.id === guest.id);
    if (index === -1) return;
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= filtered.length) return;
    
    const otherGuest = filtered[swapIndex];
    
    try {
      setLoading(true);
      const tempOrder = guest.displayOrder;
      await api.updateGuest({ id: guest.id, displayOrder: otherGuest.displayOrder });
      await api.updateGuest({ id: otherGuest.id, displayOrder: tempOrder });
      await loadData();
    } catch (err) {
      setError('Reordering failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter(g => !selectedYear || g.academicYear === selectedYear);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Guest Speakers</h2>
          <div className="page-title-desc">Manage profiles of visiting guest speakers.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Add Guest
        </button>
      </div>

      {message && <div className="badge badge-success" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{message}</div>}
      {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', maxWidth: '300px' }}>
        <label style={{ marginTop: '0' }}>Academic Year Filter</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All Years</option>
          {academicYears.map(y => (
            <option key={y.id} value={y.year}>{y.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="glass-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Designation / Org</th>
                  <th>Academic Year</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No guests registered for this year.</td>
                  </tr>
                ) : (
                  filteredGuests.map((g, index) => {
                    const isActive = g.active === true || g.active === "TRUE" || g.active === 1;
                    return (
                      <tr key={g.id}>
                        <td>
                          {g.imageFileId ? (
                            <img src={g.imageUrl} alt={g.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiImage /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>{g.name}</td>
                        <td>{g.designation} {g.organization ? `@ ${g.organization}` : ''}</td>
                        <td>{g.academicYear}</td>
                        <td>
                          <span style={{ marginRight: '12px' }}>{g.displayOrder}</span>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0', marginRight: '4px' }}
                            disabled={index === 0}
                            onClick={() => handleReorder(g, 'up')}
                          >
                            <FiArrowUp />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0' }}
                            disabled={index === filteredGuests.length - 1}
                            onClick={() => handleReorder(g, 'down')}
                          >
                            <FiArrowDown />
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(g)}>
                              <FiEdit2 />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)' }} onClick={() => handleDelete(g.id, g.name)}>
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '20px' }}>{editingGuest ? 'Edit Guest' : 'Add Guest'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label>Academic Year</label>
                  <select 
                    value={formData.academicYear} 
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    required
                  >
                    {academicYears.map(y => (
                      <option key={y.id} value={y.year}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Designation</label>
                  <input 
                    type="text" 
                    value={formData.designation} 
                    onChange={(e) => setFormData({...formData, designation: e.target.value})} 
                  />
                </div>
                <div>
                  <label>Organization</label>
                  <input 
                    type="text" 
                    value={formData.organization} 
                    onChange={(e) => setFormData({...formData, organization: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label>Associated Event</label>
                <select 
                  value={formData.eventId} 
                  onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                >
                  <option value="">None / Not specific</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title} ({ev.academicYear})</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Description / Biography</label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                  {photoPayload && (
                    <span style={{ fontSize: '11px', color: 'var(--success-color)' }}>New photo selected.</span>
                  )}
                </div>
                <div>
                  {editingGuest && editingGuest.imageFileId && (
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ display: 'inline', marginRight: '8px' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 'auto', display: 'inline', margin: '0 6px 0 0' }} 
                          checked={deleteOldImage} 
                          onChange={(e) => setDeleteOldImage(e.target.checked)} 
                        />
                        Delete old photo from Drive
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
                    value={formData.displayOrder} 
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 999})} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
                  <label style={{ display: 'inline', margin: '0' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto', display: 'inline', margin: '0 8px 0 0' }} 
                      checked={formData.active} 
                      onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                    />
                    Active (visible on website)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
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

export default GuestsAdmin;

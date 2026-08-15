import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiBell } from 'react-icons/fi';

function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    priority: 0,
    startDate: '',
    endDate: '',
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      link: '',
      priority: 0,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingAnnouncement(ann);
    
    // Format dates YYYY-MM-DD for input
    const format = (dStr) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      return d.toISOString().substring(0, 10);
    };

    setFormData({
      title: ann.title,
      content: ann.content,
      link: ann.link,
      priority: ann.priority,
      startDate: format(ann.startDate),
      endDate: format(ann.endDate),
      active: ann.active === true || ann.active === "TRUE" || ann.active === 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      if (editingAnnouncement) {
        await api.updateAnnouncement({
          id: editingAnnouncement.id,
          ...formData
        });
        setMessage('Announcement updated successfully!');
      } else {
        await api.createAnnouncement(formData);
        setMessage('Announcement published successfully!');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirm = window.confirm(`Permanently delete announcement "${title}"?`);
    if (!confirm) return;

    try {
      setLoading(true);
      await api.deleteAnnouncement(id);
      setMessage('Announcement deleted successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Announcements & Notifications</h2>
          <div className="page-title-desc">Publish temporary alerts or promo banners on the home page.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> New Announcement
        </button>
      </div>

      {message && <div className="badge badge-success" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{message}</div>}
      {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="glass-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Priority</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No announcements created.</td>
                  </tr>
                ) : (
                  announcements.map((ann) => {
                    const isActive = ann.active === true || ann.active === "TRUE" || ann.active === 1;
                    return (
                      <tr key={ann.id}>
                        <td style={{ fontWeight: '600' }}>
                          <div>{ann.title}</div>
                          {ann.link && (
                            <a href={ann.link} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--accent-color)', textDecoration: 'none' }}>
                              Link URL →
                            </a>
                          )}
                        </td>
                        <td>{ann.content}</td>
                        <td>{ann.priority}</td>
                        <td>{ann.startDate ? new Date(ann.startDate).toLocaleDateString() : 'Immediate'}</td>
                        <td>{ann.endDate ? new Date(ann.endDate).toLocaleDateString() : 'Forever'}</td>
                        <td>
                          <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(ann)}>
                              <FiEdit2 />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)' }} onClick={() => handleDelete(ann.id, ann.title)}>
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
            <h3 style={{ marginBottom: '20px' }}>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label>Content Description</label>
                <textarea 
                  rows="3" 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  required
                />
              </div>

              <div>
                <label>Action Link URL</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Priority Weight</label>
                  <input 
                    type="number" 
                    value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'inline', margin: '0' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: 'auto', display: 'inline', margin: '0 8px 0 0' }} 
                    checked={formData.active} 
                    onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                  />
                  Active (visible on website during start/end dates)
                </label>
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

export default AnnouncementsAdmin;

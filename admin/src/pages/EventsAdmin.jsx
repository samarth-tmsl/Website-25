import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiCalendar, FiArrowUp, FiArrowDown } from 'react-icons/fi';

function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    academicYear: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    registrationUrl: '',
    status: 'UPCOMING',
    displayOrder: 999,
    active: true
  });
  const [posterFile, setPosterFile] = useState(null);
  const [deleteOldPoster, setDeleteOldPoster] = useState(false);

  const statuses = ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [allEvents, years] = await Promise.all([
        api.getEvents(),
        api.getAcademicYears()
      ]);
      setEvents(allEvents);
      setAcademicYears(years);
      
      const activeYear = years.find(y => y.isCurrent)?.year || (years[0]?.year || '');
      setSelectedYear(activeYear);
    } catch (err) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }

  const handleTitleChange = (titleVal) => {
    // Generate clean slug from title if we are creating a new event
    if (!editingEvent) {
      const generatedSlug = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')        // replace spaces with dashes
        .replace(/-+/g, '-');        // reduce multiple dashes
      setFormData({
        ...formData,
        title: titleVal,
        slug: generatedSlug
      });
    } else {
      setFormData({
        ...formData,
        title: titleVal
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      academicYear: selectedYear || (academicYears[0]?.year || ''),
      date: '',
      startTime: '',
      endTime: '',
      venue: '',
      registrationUrl: '',
      status: 'UPCOMING',
      displayOrder: events.length + 1,
      active: true
    });
    setPosterFile(null);
    setDeleteOldPoster(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    
    // Format date YYYY-MM-DD for input field
    let formattedDate = '';
    if (ev.date) {
      const d = new Date(ev.date);
      formattedDate = d.toISOString().substring(0, 10);
    }
    
    setFormData({
      title: ev.title,
      slug: ev.slug,
      description: ev.description,
      academicYear: ev.academicYear,
      date: formattedDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      venue: ev.venue,
      registrationUrl: ev.registrationUrl,
      status: ev.status,
      displayOrder: ev.displayOrder,
      active: ev.active === true || ev.active === "TRUE" || ev.active === 1
    });
    setPosterFile(null);
    setDeleteOldPoster(false);
    setIsModalOpen(true);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPosterFile({
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
        poster: posterFile,
        deleteOldImage: deleteOldPoster
      };

      if (editingEvent) {
        payload.id = editingEvent.id;
        await api.updateEvent(payload);
        setMessage('Event updated successfully!');
      } else {
        await api.createEvent(payload);
        setMessage('Event added successfully!');
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmHard = window.confirm(`Deactivate event "${title}"?\nClick OK to soft-delete, or click Cancel to permanently delete.`);
    let hardDelete = false;
    
    if (!confirmHard) {
      const confirmPerm = window.confirm(`PERMANENTLY delete event "${title}" and remove poster from Drive?`);
      if (!confirmPerm) return;
      hardDelete = true;
    }

    try {
      setLoading(true);
      await api.deleteEvent(id, hardDelete);
      setMessage(hardDelete ? 'Event permanently deleted.' : 'Event deactivated.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete event.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (event, direction) => {
    const filtered = filteredEvents;
    const index = filtered.findIndex(e => e.id === event.id);
    if (index === -1) return;
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= filtered.length) return;
    
    const otherEvent = filtered[swapIndex];
    
    try {
      setLoading(true);
      const tempOrder = event.displayOrder;
      await api.updateEvent({ id: event.id, displayOrder: otherEvent.displayOrder });
      await api.updateEvent({ id: otherEvent.id, displayOrder: tempOrder });
      await loadData();
    } catch (err) {
      setError('Reordering failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => !selectedYear || e.academicYear === selectedYear);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Club Events</h2>
          <div className="page-title-desc">Schedule and detail technical and cultural fests.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Add Event
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
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events scheduled for this year.</td>
                  </tr>
                ) : (
                  filteredEvents.map((ev, index) => {
                    const isActive = ev.active === true || ev.active === "TRUE" || ev.active === 1;
                    return (
                      <tr key={ev.id}>
                        <td>
                          {ev.posterFileId ? (
                            <img src={ev.posterUrl} alt={ev.title} style={{ width: '40px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '50px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiImage /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          <div>{ev.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/{ev.slug}</div>
                        </td>
                        <td>{ev.date ? new Date(ev.date).toLocaleDateString() : 'TBA'}</td>
                        <td>{ev.venue}</td>
                        <td>
                          <span className={`badge ${
                            ev.status === 'ONGOING' ? 'badge-active' :
                            ev.status === 'UPCOMING' ? 'badge-warning' : 'badge-secondary'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ marginRight: '12px' }}>{ev.displayOrder}</span>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0', marginRight: '4px' }}
                            disabled={index === 0}
                            onClick={() => handleReorder(ev, 'up')}
                          >
                            <FiArrowUp />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0' }}
                            disabled={index === filteredEvents.length - 1}
                            onClick={() => handleReorder(ev, 'down')}
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
                            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(ev)}>
                              <FiEdit2 />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)' }} onClick={() => handleDelete(ev.id, ev.title)}>
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
            <h3 style={{ marginBottom: '20px' }}>{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Event Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => handleTitleChange(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label>URL Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                <div>
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
                <div>
                  <label>Start Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10:00 AM"
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                  />
                </div>
                <div>
                  <label>End Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4:00 PM"
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Venue</label>
                  <input 
                    type="text" 
                    value={formData.venue} 
                    onChange={(e) => setFormData({...formData, venue: e.target.value})} 
                  />
                </div>
                <div>
                  <label>Registration URL</label>
                  <input 
                    type="url" 
                    value={formData.registrationUrl} 
                    onChange={(e) => setFormData({...formData, registrationUrl: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Event Poster</label>
                  <input type="file" accept="image/*" onChange={handlePosterChange} />
                  {posterFile && (
                    <span style={{ fontSize: '11px', color: 'var(--success-color)' }}>New poster selected.</span>
                  )}
                </div>
                <div>
                  {editingEvent && editingEvent.posterFileId && (
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ display: 'inline' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 'auto', display: 'inline', margin: '0 6px 0 0' }} 
                          checked={deleteOldPoster} 
                          onChange={(e) => setDeleteOldPoster(e.target.checked)} 
                        />
                        Delete old poster from Drive
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

export default EventsAdmin;

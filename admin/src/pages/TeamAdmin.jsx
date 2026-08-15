import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiImage, FiArrowUp, FiArrowDown } from 'react-icons/fi';

function TeamAdmin() {
  const [members, setMembers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedWing, setSelectedWing] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    position: 'Member',
    wing: '',
    academicYear: '',
    bio: '',
    linkedin: '',
    github: '',
    instagram: '',
    email: '',
    displayOrder: 999,
    active: true
  });
  const [photoPayload, setPhotoPayload] = useState(null); // { base64, fileName, mimeType }
  const [deleteOldImage, setDeleteOldImage] = useState(false);

  const wings = ['All', 'Committee', 'Pravidhi', 'Web Development', 'Design', 'PR & Editorial', 'Operations', 'Alumni'];
  const positions = ['President', 'Vice President', 'General Secretary', 'Joint Secretary', 'Treasurer', 'Head', 'Co-Head', 'Member', 'Advisor'];

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError('');
      const [teamMembers, years] = await Promise.all([
        api.getTeam(),
        api.getAcademicYears()
      ]);
      setMembers(teamMembers);
      setAcademicYears(years);
      
      const activeYear = years.find(y => y.isCurrent)?.year || (years[0]?.year || '');
      setSelectedYear(activeYear);
    } catch (err) {
      setError(err.message || 'Failed to load team data.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: 'Member',
      wing: selectedWing !== 'All' ? selectedWing : 'Pravidhi',
      academicYear: selectedYear || (academicYears[0]?.year || ''),
      bio: '',
      linkedin: '',
      github: '',
      instagram: '',
      email: '',
      displayOrder: members.length + 1,
      active: true
    });
    setPhotoPayload(null);
    setDeleteOldImage(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      wing: member.wing,
      academicYear: member.academicYear,
      bio: member.bio,
      linkedin: member.linkedin,
      github: member.github,
      instagram: member.instagram,
      email: member.email,
      displayOrder: member.displayOrder,
      active: member.active === true || member.active === "TRUE" || member.active === 1
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
        deleteOldImage: deleteOldImage
      };

      if (editingMember) {
        payload.id = editingMember.id;
        await api.updateTeamMember(payload);
        setMessage('Team member updated successfully!');
      } else {
        await api.createTeamMember(payload);
        setMessage('Team member added successfully!');
      }
      
      setIsModalOpen(false);
      await loadInitialData();
    } catch (err) {
      setError(err.message || 'Failed to save team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmHard = window.confirm(`Deactivate team member "${name}"?\nClick OK to soft-delete (deactivate), or click Cancel if you want to permanently delete them.`);
    let hardDelete = false;
    
    if (!confirmHard) {
      const confirmPerm = window.confirm(`PERMANENTLY delete "${name}" and remove their photo from Google Drive?`);
      if (!confirmPerm) return;
      hardDelete = true;
    }

    try {
      setLoading(true);
      await api.deleteTeamMember(id, hardDelete);
      setMessage(hardDelete ? 'Member permanently deleted.' : 'Member deactivated.');
      await loadInitialData();
    } catch (err) {
      setError(err.message || 'Failed to delete member.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (member, direction) => {
    // Find index of this member in filtered list
    const filtered = filteredMembers;
    const index = filtered.findIndex(m => m.id === member.id);
    if (index === -1) return;
    
    const swapWithIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapWithIndex < 0 || swapWithIndex >= filtered.length) return;
    
    const otherMember = filtered[swapWithIndex];
    
    try {
      setLoading(true);
      // Swap display orders
      const tempOrder = member.displayOrder;
      await api.updateTeamMember({ id: member.id, displayOrder: otherMember.displayOrder });
      await api.updateTeamMember({ id: otherMember.id, displayOrder: tempOrder });
      await loadInitialData();
    } catch (err) {
      setError('Reordering failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filters
  const filteredMembers = members.filter(m => {
    const matchesYear = !selectedYear || m.academicYear === selectedYear;
    const matchesWing = selectedWing === 'All' || m.wing === selectedWing;
    return matchesYear && matchesWing;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Team Members</h2>
          <div className="page-title-desc">Manage student and advisor grids.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Add Member
        </button>
      </div>

      {message && <div className="badge badge-success" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{message}</div>}
      {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ marginTop: '0' }}>Academic Year</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.year}>{y.label} {y.isCurrent ? '(Current)' : ''}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ marginTop: '0' }}>Wing / Group</label>
          <select value={selectedWing} onChange={(e) => setSelectedWing(e.target.value)}>
            {wings.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
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
                  <th>Position</th>
                  <th>Wing</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No team members found for the selected criteria.</td>
                  </tr>
                ) : (
                  filteredMembers.map((m, index) => {
                    const isActive = m.active === true || m.active === "TRUE" || m.active === 1;
                    return (
                      <tr key={m.id}>
                        <td>
                          {m.imageFileId ? (
                            <img src={m.imageUrl} alt={m.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiImage /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>{m.name}</td>
                        <td>{m.position}</td>
                        <td>{m.wing}</td>
                        <td>
                          <span style={{ marginRight: '12px' }}>{m.displayOrder}</span>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0', marginRight: '4px' }}
                            disabled={index === 0}
                            onClick={() => handleReorder(m, 'up')}
                          >
                            <FiArrowUp />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0' }}
                            disabled={index === filteredMembers.length - 1}
                            onClick={() => handleReorder(m, 'down')}
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
                            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(m)}>
                              <FiEdit2 />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)' }} onClick={() => handleDelete(m.id, m.name)}>
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
            <h3 style={{ marginBottom: '20px' }}>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
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
                  <label>Position</label>
                  <select 
                    value={formData.position} 
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  >
                    {positions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Wing</label>
                  <select 
                    value={formData.wing} 
                    onChange={(e) => setFormData({...formData, wing: e.target.value})}
                  >
                    {wings.filter(w => w !== 'All').map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label>Biography</label>
                <textarea 
                  rows="3" 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                  {photoPayload && (
                    <span style={{ fontSize: '11px', color: 'var(--success-color)' }}>New photo selected: {photoPayload.fileName}</span>
                  )}
                </div>
                <div>
                  {editingMember && editingMember.imageFileId && (
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ display: 'inline', marginRight: '8px' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 'auto', display: 'inline', margin: '0 6px 0 0' }} 
                          checked={deleteOldImage} 
                          onChange={(e) => setDeleteOldImage(e.target.checked)} 
                        />
                        Delete old photo from Google Drive
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>LinkedIn URL</label>
                  <input 
                    type="url" 
                    value={formData.linkedin} 
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})} 
                  />
                </div>
                <div>
                  <label>GitHub URL</label>
                  <input 
                    type="url" 
                    value={formData.github} 
                    onChange={(e) => setFormData({...formData, github: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Instagram URL</label>
                  <input 
                    type="url" 
                    value={formData.instagram} 
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})} 
                  />
                </div>
                <div>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
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

export default TeamAdmin;

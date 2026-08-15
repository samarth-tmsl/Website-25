import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiArrowUp, FiArrowDown } from 'react-icons/fi';

function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    tier: 'Platinum',
    academicYear: '',
    displayOrder: 999,
    active: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [deleteOldLogo, setDeleteOldLogo] = useState(false);

  const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Media Partner', 'General'];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [allSponsors, years] = await Promise.all([
        api.getSponsors(),
        api.getAcademicYears()
      ]);
      setSponsors(allSponsors);
      setAcademicYears(years);
      
      const activeYear = years.find(y => y.isCurrent)?.year || (years[0]?.year || '');
      setSelectedYear(activeYear);
    } catch (err) {
      setError(err.message || 'Failed to load sponsors.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingSponsor(null);
    setFormData({
      name: '',
      website: '',
      description: '',
      tier: 'Platinum',
      academicYear: selectedYear || (academicYears[0]?.year || ''),
      displayOrder: sponsors.length + 1,
      active: true
    });
    setLogoFile(null);
    setDeleteOldLogo(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sp) => {
    setEditingSponsor(sp);
    setFormData({
      name: sp.name,
      website: sp.website,
      description: sp.description,
      tier: sp.tier || 'General',
      academicYear: sp.academicYear,
      displayOrder: sp.displayOrder,
      active: sp.active === true || sp.active === "TRUE" || sp.active === 1
    });
    setLogoFile(null);
    setDeleteOldLogo(false);
    setIsModalOpen(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLogoFile({
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
        logo: logoFile,
        deleteOldImage: deleteOldLogo
      };

      if (editingSponsor) {
        payload.id = editingSponsor.id;
        await api.updateSponsor(payload);
        setMessage('Sponsor updated successfully!');
      } else {
        await api.createSponsor(payload);
        setMessage('Sponsor added successfully!');
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save sponsor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmHard = window.confirm(`Deactivate sponsor "${name}"?\nClick OK to soft-delete, or click Cancel to permanently delete.`);
    let hardDelete = false;
    
    if (!confirmHard) {
      const confirmPerm = window.confirm(`PERMANENTLY delete sponsor "${name}" and remove logo from Drive?`);
      if (!confirmPerm) return;
      hardDelete = true;
    }

    try {
      setLoading(true);
      await api.deleteSponsor(id, hardDelete);
      setMessage(hardDelete ? 'Sponsor permanently deleted.' : 'Sponsor deactivated.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete sponsor.');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (sponsor, direction) => {
    const filtered = filteredSponsors;
    const index = filtered.findIndex(s => s.id === sponsor.id);
    if (index === -1) return;
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= filtered.length) return;
    
    const otherSponsor = filtered[swapIndex];
    
    try {
      setLoading(true);
      const tempOrder = sponsor.displayOrder;
      await api.updateSponsor({ id: sponsor.id, displayOrder: otherSponsor.displayOrder });
      await api.updateSponsor({ id: otherSponsor.id, displayOrder: tempOrder });
      await loadData();
    } catch (err) {
      setError('Reordering failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(s => !selectedYear || s.academicYear === selectedYear);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Club Sponsors & Partners</h2>
          <div className="page-title-desc">Manage sponsorships and partner logo grids.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Add Sponsor
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
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Tier</th>
                  <th>Academic Year</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSponsors.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sponsors registered for this year.</td>
                  </tr>
                ) : (
                  filteredSponsors.map((sp, index) => {
                    const isActive = sp.active === true || sp.active === "TRUE" || sp.active === 1;
                    return (
                      <tr key={sp.id}>
                        <td>
                          {sp.logoFileId ? (
                            <img src={sp.logoUrl} alt={sp.name} style={{ width: '60px', height: '40px', objectFit: 'contain', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '60px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiImage /></div>
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          <div>{sp.name}</div>
                          {sp.website && (
                            <a href={sp.website} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--accent-color)', textDecoration: 'none' }}>
                              {sp.website}
                            </a>
                          )}
                        </td>
                        <td>{sp.tier}</td>
                        <td>{sp.academicYear}</td>
                        <td>
                          <span style={{ marginRight: '12px' }}>{sp.displayOrder}</span>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0', marginRight: '4px' }}
                            disabled={index === 0}
                            onClick={() => handleReorder(sp, 'up')}
                          >
                            <FiArrowUp />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 6px', fontSize: '12px', minHeight: '0' }}
                            disabled={index === filteredSponsors.length - 1}
                            onClick={() => handleReorder(sp, 'down')}
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
                            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(sp)}>
                              <FiEdit2 />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger-color)' }} onClick={() => handleDelete(sp.id, sp.name)}>
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
            <h3 style={{ marginBottom: '20px' }}>{editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Sponsor Name</label>
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
                  <label>Website Link</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    value={formData.website} 
                    onChange={(e) => setFormData({...formData, website: e.target.value})} 
                  />
                </div>
                <div>
                  <label>Sponsorship Tier</label>
                  <select 
                    value={formData.tier} 
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  >
                    {tiers.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label>Sponsor Description / Info</label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Logo File</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                  {logoFile && (
                    <span style={{ fontSize: '11px', color: 'var(--success-color)' }}>New logo selected.</span>
                  )}
                </div>
                <div>
                  {editingSponsor && editingSponsor.logoFileId && (
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ display: 'inline' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 'auto', display: 'inline', margin: '0 6px 0 0' }} 
                          checked={deleteOldLogo} 
                          onChange={(e) => setDeleteOldLogo(e.target.checked)} 
                        />
                        Delete old logo from Drive
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

export default SponsorsAdmin;

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlus, FiEdit2, FiShield } from 'react-icons/fi';

function AcademicYearsAdmin() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);

  const [formData, setFormData] = useState({
    year: '',
    label: '',
    isCurrent: false,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAcademicYears();
      setYears(data);
    } catch (err) {
      setError(err.message || 'Failed to load academic years.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingYear(null);
    setFormData({
      year: '',
      label: '',
      isCurrent: false,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (yr) => {
    setEditingYear(yr);
    setFormData({
      year: yr.year,
      label: yr.label,
      isCurrent: yr.isCurrent === true || yr.isCurrent === "TRUE" || yr.isCurrent === 1,
      active: yr.active === true || yr.active === "TRUE" || yr.active === 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      if (editingYear) {
        await api.updateAcademicYear({
          id: editingYear.id,
          ...formData
        });
        setMessage('Academic year updated successfully!');
      } else {
        await api.createAcademicYear(formData);
        setMessage('Academic year added successfully!');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save academic year.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Academic Years</h2>
          <div className="page-title-desc">Configure academic calendar terms for historical team lists.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> New Academic Year
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
                  <th>Year Key</th>
                  <th>Display Label</th>
                  <th>Current Active Year</th>
                  <th>Access Allowed</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {years.map((yr) => {
                  const isActive = yr.active === true || yr.active === "TRUE" || yr.active === 1;
                  const isCurrent = yr.isCurrent === true || yr.isCurrent === "TRUE" || yr.isCurrent === 1;
                  return (
                    <tr key={yr.id}>
                      <td style={{ fontWeight: '600' }}>{yr.year}</td>
                      <td>{yr.label}</td>
                      <td>
                        <span className={`badge ${isCurrent ? 'badge-success' : 'badge-secondary'}`}>
                          {isCurrent ? 'Current Year' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {isActive ? 'Yes (Active)' : 'No'}
                        </span>
                      </td>
                      <td>{yr.createdAt ? new Date(yr.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(yr)}>
                          <FiEdit2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '20px' }}>{editingYear ? 'Edit Year' : 'New Year'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Year Key (Code)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2026-27"
                    value={formData.year} 
                    onChange={(e) => setFormData({...formData, year: e.target.value})} 
                    required 
                    disabled={!!editingYear}
                  />
                </div>
                <div>
                  <label>Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Year 2026-27"
                    value={formData.label} 
                    onChange={(e) => setFormData({...formData, label: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                <label style={{ display: 'inline', margin: '0' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: 'auto', display: 'inline', margin: '0 8px 0 0' }} 
                    checked={formData.isCurrent} 
                    onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})} 
                  />
                  Mark as Current Academic Year
                </label>

                <label style={{ display: 'inline', margin: '0' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: 'auto', display: 'inline', margin: '0 8px 0 0' }} 
                    checked={formData.active} 
                    onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                  />
                  Active (Allowed to be selected)
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

export default AcademicYearsAdmin;

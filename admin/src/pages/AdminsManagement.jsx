import React, { useState, useEffect } from 'react';
import { api, getAdminUser } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiShield } from 'react-icons/fi';

function AdminsManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const currentUser = getAdminUser();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'EDITOR',
    active: true
  });

  const roles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err.message || 'Failed to load administrator accounts. Note: This page is restricted to SUPER_ADMINs.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData({
      email: '',
      name: '',
      role: 'EDITOR',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (adm) => {
    setEditingAdmin(adm);
    setFormData({
      email: adm.email,
      name: adm.name,
      role: adm.role,
      active: adm.active === true || adm.active === "TRUE" || adm.active === 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      if (editingAdmin) {
        await api.updateAdmin({
          id: editingAdmin.id,
          ...formData
        });
        setMessage('Administrator updated successfully!');
      } else {
        await api.createAdmin(formData);
        setMessage('Administrator added successfully!');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save admin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (email.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim()) {
      alert("You cannot delete your own account.");
      return;
    }
    
    const confirm = window.confirm(`Remove admin access for "${email}"?`);
    if (!confirm) return;

    try {
      setLoading(true);
      await api.deleteAdmin(id);
      setMessage('Admin access removed.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete admin.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px', marginTop: '40px' }}>
        <FiShield style={{ fontSize: '48px', color: 'var(--danger-color)', marginBottom: '16px' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Only SUPER_ADMIN users may manage administrator accounts.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Administrator Settings</h2>
          <div className="page-title-desc">Configure dashboard system access and permissions.</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Register Admin
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Permission Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adm) => {
                  const isActive = adm.active === true || adm.active === "TRUE" || adm.active === 1;
                  const isSelf = adm.email.toLowerCase().trim() === currentUser?.email?.toLowerCase().trim();
                  return (
                    <tr key={adm.id}>
                      <td style={{ fontWeight: '600' }}>
                        {adm.name} {isSelf && <span style={{ fontSize: '11px', color: 'var(--accent-color)' }}>(You)</span>}
                      </td>
                      <td>{adm.email}</td>
                      <td>
                        <span className={`badge ${
                          adm.role === 'SUPER_ADMIN' ? 'badge-danger' : 
                          adm.role === 'ADMIN' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {adm.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => handleOpenEdit(adm)}>
                            <FiEdit2 />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '8px', color: isSelf ? 'rgba(255,255,255,0.1)' : 'var(--danger-color)' }} 
                            disabled={isSelf}
                            onClick={() => handleDelete(adm.id, adm.email)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
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
            <h3 style={{ marginBottom: '20px' }}>{editingAdmin ? 'Edit Admin' : 'Register Admin'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Admin User Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                  disabled={!!editingAdmin}
                />
              </div>

              <div>
                <label>Name / Label</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label>Access Role Scope</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  disabled={editingAdmin && editingAdmin.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()}
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'inline', margin: '0' }}>
                  <input 
                    type="checkbox" 
                    style={{ width: 'auto', display: 'inline', margin: '0 8px 0 0' }} 
                    checked={formData.active} 
                    onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                    disabled={editingAdmin && editingAdmin.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()}
                  />
                  Active (Allowed to sign in)
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

export default AdminsManagement;

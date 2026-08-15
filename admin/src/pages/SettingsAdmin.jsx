import React, { useState, useEffect } from 'react';
import { api, getApiUrl, setApiUrl, getAdminUser } from '../services/api';
import { FiSettings, FiCheck } from 'react-icons/fi';

function SettingsAdmin() {
  const [settings, setSettings] = useState([]);
  const [gasUrl, setGasUrl] = useState(getApiUrl());
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const currentUser = getAdminUser();

  // Form local states mapped dynamically
  const [formSettings, setFormSettings] = useState({
    site_name: 'Samarth',
    maintenance_mode: 'FALSE',
    gallery_enabled: 'TRUE',
    announcements_enabled: 'TRUE',
    sponsors_enabled: 'TRUE'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      
      const isSuper = currentUser?.role === 'SUPER_ADMIN';
      let data = [];
      if (isSuper) {
        data = await api.getSettings();
        setSettings(data);
      } else {
        // Fallback for ADMIN/EDITOR: load public settings
        const publicSettings = await api.getSettingsPublic();
        data = Object.keys(publicSettings).map(key => ({
          key,
          value: publicSettings[key],
          description: 'System setting key'
        }));
        setSettings(data);
      }
      
      // Parse settings array into formSettings object
      const sObj = {};
      data.forEach(s => {
        sObj[s.key] = s.value;
      });
      setFormSettings(prev => ({
        ...prev,
        ...sObj
      }));
    } catch (err) {
      setError(err.message || 'Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    if (!gasUrl) {
      setError('URL cannot be empty.');
      return;
    }
    setApiUrl(gasUrl);
    setMessage('API Server URL updated locally.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    
    try {
      await api.updateSettings(formSettings);
      setMessage('System configuration saved successfully!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save system settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBoolean = (key) => {
    setFormSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'TRUE' ? 'FALSE' : 'TRUE'
    }));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>System Settings</h2>
          <div className="page-title-desc">Configure client behaviors and backend connection settings.</div>
        </div>
      </div>

      {message && <div className="badge badge-success" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{message}</div>}
      {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Local API Server Settings */}
        <div className="glass-card">
          <h3>Connection Link</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Sets the API endpoint mapping the admin client UI directly to the Google Apps Script Web App.
          </p>
          <form onSubmit={handleSaveApiUrl} style={{ marginTop: '20px' }}>
            <div>
              <label>Google Apps Script Exec URL</label>
              <input 
                type="url" 
                placeholder="https://script.google.com/macros/s/.../exec"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} type="submit">
              Save Local URL
            </button>
          </form>
        </div>

        {/* System Settings Sheet (SUPER_ADMIN only for write, ADMIN for read) */}
        <div className="glass-card">
          <h3>System Variables</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Configure variables written directly to the database spreadsheet.
          </p>
          
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <form onSubmit={handleSaveSettings} style={{ marginTop: '20px' }}>
              <div>
                <label>Website Branding Name (site_name)</label>
                <input 
                  type="text" 
                  value={formSettings.site_name}
                  onChange={(e) => setFormSettings({...formSettings, site_name: e.target.value})}
                  disabled={currentUser?.role !== 'SUPER_ADMIN'}
                  required
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>Maintenance Mode</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Blocks general public access if active.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    checked={formSettings.maintenance_mode === 'TRUE'}
                    onChange={() => toggleBoolean('maintenance_mode')}
                    disabled={currentUser?.role !== 'SUPER_ADMIN'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>Enable Media Gallery</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Toggle general access to photo galleries.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    checked={formSettings.gallery_enabled === 'TRUE'}
                    onChange={() => toggleBoolean('gallery_enabled')}
                    disabled={currentUser?.role !== 'SUPER_ADMIN'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>Enable Homepage Announcements</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Display notification popups on the homepage.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    checked={formSettings.announcements_enabled === 'TRUE'}
                    onChange={() => toggleBoolean('announcements_enabled')}
                    disabled={currentUser?.role !== 'SUPER_ADMIN'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>Enable Sponsors Grid</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Show sponsors and brand support logs.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                    checked={formSettings.sponsors_enabled === 'TRUE'}
                    onChange={() => toggleBoolean('sponsors_enabled')}
                    disabled={currentUser?.role !== 'SUPER_ADMIN'}
                  />
                </div>
              </div>

              {currentUser?.role === 'SUPER_ADMIN' ? (
                <button className="btn btn-primary" style={{ marginTop: '32px' }} type="submit" disabled={submitting}>
                  {submitting ? 'Saving settings...' : 'Save System Settings'}
                </button>
              ) : (
                <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--danger-color)' }}>
                  Only SUPER_ADMIN users may modify database settings.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsAdmin;

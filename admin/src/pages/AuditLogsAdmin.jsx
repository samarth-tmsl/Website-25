import React, { useState, useEffect } from 'react';
import { api, getAdminUser } from '../services/api';
import { FiShield, FiFileText } from 'react-icons/fi';

function AuditLogsAdmin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = getAdminUser();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs. Note: This page is restricted to SUPER_ADMINs.');
    } finally {
      setLoading(false);
    }
  }

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px', marginTop: '40px' }}>
        <FiShield style={{ fontSize: '48px', color: 'var(--danger-color)', marginBottom: '16px' }} />
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Only SUPER_ADMIN users may view transaction audit logs.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>System Audit Logs</h2>
          <div className="page-title-desc">Monitor administrative mutation operations.</div>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>
          Refresh logs
        </button>
      </div>

      {error && <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="glass-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin Email</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>ID Affected</th>
                  <th>Transaction Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No logs captured yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.adminEmail}</td>
                      <td>
                        <span className={`badge ${
                          log.action.startsWith('CREATE') ? 'badge-success' : 
                          log.action.startsWith('UPDATE') ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.entity}</td>
                      <td><code style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px' }}>{log.entityId || 'N/A'}</code></td>
                      <td>{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsAdmin;

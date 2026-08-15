import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiUsers, FiAward, FiImage, FiCalendar, FiBell, FiLayers } from 'react-icons/fi';

function Dashboard() {
  const [stats, setStats] = useState({
    team: 0,
    guests: 0,
    albums: 0,
    events: 0,
    announcements: 0,
    sponsors: 0
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError('');
        
        // Fetch values
        const [team, guests, albums, events, announcements, sponsors, auditLogs] = await Promise.all([
          api.getTeam().catch(() => []),
          api.getGuests().catch(() => []),
          api.getGalleryAlbums().catch(() => []),
          api.getEvents().catch(() => []),
          api.getAnnouncements().catch(() => []),
          api.getSponsors().catch(() => []),
          api.getAuditLogs().catch(() => [])
        ]);

        setStats({
          team: team.length,
          guests: guests.length,
          albums: albums.length,
          events: events.length,
          announcements: announcements.length,
          sponsors: sponsors.length
        });
        
        setLogs(auditLogs.slice(0, 8)); // Top 8 recent actions
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="spinner" style={{ marginTop: '100px' }}></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="page-title-desc">Quick statistics and system overview.</div>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ padding: '12px', width: '100%', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><FiUsers /></div>
          <div>
            <div className="stat-value">{stats.team}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><FiAward /></div>
          <div>
            <div className="stat-value">{stats.guests}</div>
            <div className="stat-label">Guests & Speakers</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><FiImage /></div>
          <div>
            <div className="stat-value">{stats.albums}</div>
            <div className="stat-label">Gallery Albums</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><FiCalendar /></div>
          <div>
            <div className="stat-value">{stats.events}</div>
            <div className="stat-label">Club Events</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><FiBell /></div>
          <div>
            <div className="stat-value">{stats.announcements}</div>
            <div className="stat-label">Announcements</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><FiLayers /></div>
          <div>
            <div className="stat-value">{stats.sponsors}</div>
            <div className="stat-label">Sponsors</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Recent Administrative Logs</h3>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No activities logged yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
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
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

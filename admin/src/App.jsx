import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  FiLayout, FiUsers, FiAward, FiImage, FiCalendar, FiBell, 
  FiLayers, FiSettings, FiShield, FiFileText, FiLogOut 
} from 'react-icons/fi';
import { getAdminUser, getAuthToken, setAuthToken, setAdminUser } from './services/api';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamAdmin from './pages/TeamAdmin';
import GuestsAdmin from './pages/GuestsAdmin';
import GalleryAdmin from './pages/GalleryAdmin';
import EventsAdmin from './pages/EventsAdmin';
import AnnouncementsAdmin from './pages/AnnouncementsAdmin';
import SponsorsAdmin from './pages/SponsorsAdmin';
import AdminsManagement from './pages/AdminsManagement';
import AcademicYearsAdmin from './pages/AcademicYearsAdmin';
import AuditLogsAdmin from './pages/AuditLogsAdmin';
import SettingsAdmin from './pages/SettingsAdmin';

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const activeClass = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar">
      <div className="logo-container">
        <span className="logo-text">Samarth CMS</span>
      </div>
      
      <ul className="menu-list">
        <li>
          <Link to="/" className={`menu-item ${activeClass('/')}`}>
            <FiLayout /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/team" className={`menu-item ${activeClass('/team')}`}>
            <FiUsers /> Team Members
          </Link>
        </li>
        <li>
          <Link to="/guests" className={`menu-item ${activeClass('/guests')}`}>
            <FiAward /> Guest Speakers
          </Link>
        </li>
        <li>
          <Link to="/gallery" className={`menu-item ${activeClass('/gallery')}`}>
            <FiImage /> Media Gallery
          </Link>
        </li>
        <li>
          <Link to="/events" className={`menu-item ${activeClass('/events')}`}>
            <FiCalendar /> Club Events
          </Link>
        </li>
        <li>
          <Link to="/announcements" className={`menu-item ${activeClass('/announcements')}`}>
            <FiBell /> Announcements
          </Link>
        </li>
        <li>
          <Link to="/sponsors" className={`menu-item ${activeClass('/sponsors')}`}>
            <FiLayers /> Sponsors
          </Link>
        </li>
        <li>
          <Link to="/academic-years" className={`menu-item ${activeClass('/academic-years')}`}>
            <FiCalendar /> Academic Years
          </Link>
        </li>
        
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <li>
              <Link to="/admins" className={`menu-item ${activeClass('/admins')}`}>
                <FiShield /> Manage Admins
              </Link>
            </li>
            <li>
              <Link to="/audit-logs" className={`menu-item ${activeClass('/audit-logs')}`}>
                <FiFileText /> Audit Logs
              </Link>
            </li>
          </>
        )}
        
        <li>
          <Link to="/settings" className={`menu-item ${activeClass('/settings')}`}>
            <FiSettings /> Settings
          </Link>
        </li>
      </ul>

      <div className="user-info">
        <div className="user-name" title={user?.email}>{user?.name}</div>
        <div className="user-role">{user?.role}</div>
        <button 
          onClick={onLogout} 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '8px', fontSize: '13px', marginTop: '12px', justifyContent: 'center' }}
        >
          <FiLogOut /> Log Out
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState(getAdminUser());
  const [token, setToken] = useState(getAuthToken());

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setToken(getAuthToken());
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAdminUser(null);
    setUser(null);
    setToken('');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<TeamAdmin />} />
          <Route path="/guests" element={<GuestsAdmin />} />
          <Route path="/gallery" element={<GalleryAdmin />} />
          <Route path="/events" element={<EventsAdmin />} />
          <Route path="/announcements" element={<AnnouncementsAdmin />} />
          <Route path="/sponsors" element={<SponsorsAdmin />} />
          <Route path="/academic-years" element={<AcademicYearsAdmin />} />
          <Route path="/admins" element={<AdminsManagement />} />
          <Route path="/audit-logs" element={<AuditLogsAdmin />} />
          <Route path="/settings" element={<SettingsAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;

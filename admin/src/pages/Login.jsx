import React, { useState, useEffect } from 'react';
import { api, setApiUrl, getApiUrl, setAuthToken, setAdminUser } from '../services/api';

function Login({ onLoginSuccess }) {
  const [gasUrl, setGasUrl] = useState(getApiUrl());
  const [isUrlConfigured, setIsUrlConfigured] = useState(!!getApiUrl());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUrlConfigured && window.google) {
      /* global google */
      google.accounts.id.initialize({
        client_id: "777328659850-puj2h3t7kig8koc5b3cuc6mghvce8e4i.apps.googleusercontent.com", // Fallback or template client_id. The user can override it in settings.
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "dark", size: "large", width: "100%" }
      );
    }
  }, [isUrlConfigured]);

  const handleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const idToken = response.credential;
      const session = await api.verifySession(idToken);
      
      setAuthToken(idToken);
      setAdminUser(session.user);
      
      onLoginSuccess(session.user);
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (!gasUrl) {
      setError('Please provide a valid URL.');
      return;
    }
    if (!gasUrl.startsWith('https://script.google.com/')) {
      setError('URL must start with https://script.google.com/macros/s/...');
      return;
    }
    setApiUrl(gasUrl);
    setIsUrlConfigured(true);
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Samarth CMS</h2>
          <p style={{ color: 'var(--text-muted)' }}>Administrative Console Login</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {!isUrlConfigured ? (
          <form onSubmit={handleSaveUrl}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              To begin, configure your Google Apps Script Web App URL.
            </p>
            <div>
              <label>Google Apps Script Web App URL</label>
              <input 
                type="url" 
                placeholder="https://script.google.com/macros/s/..." 
                value={gasUrl} 
                onChange={(e) => setGasUrl(e.target.value)} 
                required 
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} type="submit">
              Save URL & Continue
            </button>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>
              Sign in with your registered Google administrator account.
            </p>
            
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <div id="google-signin-btn"></div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setIsUrlConfigured(false)}
              >
                Change API Server URL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

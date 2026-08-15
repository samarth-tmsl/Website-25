import React, { useState, useEffect } from 'react';
import { api, getApiUrl, setAuthToken, setAdminUser } from '../services/api';

function Login({ onLoginSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isUrlConfigured = !!getApiUrl();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const isClientIdConfigured = !!googleClientId;

  useEffect(() => {
    if (isUrlConfigured && isClientIdConfigured && window.google) {
      /* global google */
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "dark", size: "large", width: "100%" }
      );
    }
  }, [isUrlConfigured, isClientIdConfigured]);

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

        {!isUrlConfigured || !isClientIdConfigured ? (
          <div style={{ textAlign: 'center', color: 'var(--danger-color)', padding: '16px 0' }}>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>Configuration Error</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {!isUrlConfigured && "• VITE_API_URL is not configured."}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {!isClientIdConfigured && "• VITE_GOOGLE_CLIENT_ID is not configured."}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
              Please configure these environment variables inside your admin panel <code>.env</code> file before building.
            </p>
          </div>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

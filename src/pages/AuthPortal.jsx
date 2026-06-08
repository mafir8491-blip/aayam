import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPortal() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          name,
          email,
          password,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Authentication failed');
      }

      // Success - save user details to local storage and redirect
      if (json.success) {
        // Fetch fresh user payload to store in local storage
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user) {
            localStorage.setItem('user', JSON.stringify(meJson.user));
          }
        }
        
        // Use window location redirect to make sure all components reload their state
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#120c08', padding: '20px' }}>
      <div className="auth-card p-4 text-center" style={{ maxWidth: '400px', width: '100%', background: 'rgba(30, 21, 14, 0.7)', border: '1.5px solid rgba(166, 124, 82, 0.25)', borderRadius: '16px', position: 'relative' }}>
        <div style={{ height: '4px', background: 'var(--br)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '16px 16px 0 0' }}></div>

        <div className="mb-4">
          <img
            src="/images/aayam_img.jpg"
            alt="AAYAM"
            width="52"
            height="52"
            style={{ borderRadius: '14px', border: '2px solid rgba(166,124,82,0.4)', marginBottom: '12px' }}
          />
          <h2 className="text-white" style={{ fontFamily: 'var(--font-display, serif)', fontSize: '1.55rem', fontWeight: 800 }}>Welcome</h2>
          <p className="small text-muted mb-0">AAYAM Committee Portal</p>
        </div>

        {error && (
          <div className="alert alert-danger p-2 small mb-3" style={{ background: 'rgba(192,57,43,0.09)', border: '1px solid rgba(192,57,43,0.22)', color: '#c0392b', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="auth-tabs d-flex justify-content-center gap-2 mb-4">
          <button
            className={`auth-tab px-4 py-2 small fw-bold border-0 ${mode === 'login' ? 'active text-dark bg-warning' : 'text-white bg-dark'}`}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            style={{ borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            Login
          </button>
          <button
            className={`auth-tab px-4 py-2 small fw-bold border-0 ${mode === 'register' ? 'active text-dark bg-warning' : 'text-white bg-dark'}`}
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            style={{ borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="text-start">
          {mode === 'register' && (
            <div className="mb-3">
              <label className="form-label-custom">Full Name</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label-custom">Email Address</label>
            <input
              type="email"
              className="form-control-custom"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Password</label>
            <input
              type="password"
              className="form-control-custom"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-register w-100 py-2 fw-bold mb-3"
            style={{ borderRadius: '8px' }}
          >
            {submitting ? 'Please wait...' : 'Continue'}
          </button>
        </form>

        <div className="text-muted small my-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', lineHeight: '0.1em' }}>
          <span style={{ background: '#1c1510', padding: '0 10px' }}>OR</span>
        </div>

        {/* Google OAuth direct browser redirect */}
        <a
          href="/api/auth/google"
          className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 py-2 mt-3"
          style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', textDecoration: 'none' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </a>
      </div>
    </div>
  );
}

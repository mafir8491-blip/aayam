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
      </div>
    </div>
  );
}

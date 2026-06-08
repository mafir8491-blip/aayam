import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user) {
            localStorage.setItem('user', JSON.stringify(meJson.user));
          }
        }
        
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper d-flex flex-column min-vh-100" style={{ background: '#fdfaf2', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-body, "DM Sans", sans-serif)' }}>
      <Navbar />
      
      {/* Huge Watermark Background */}
      <div 
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '750px',
          height: '750px',
          backgroundImage: 'url("/images/aayam_img.jpg")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.035,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <style>{`
        .auth-card-custom {
          max-width: 440px;
          width: 100%;
          background: #f5ede0;
          border: 1.5px solid rgba(166, 124, 82, 0.35);
          border-radius: 28px;
          position: relative;
          padding: 40px 32px;
          box-shadow: 0 16px 40px rgba(166, 124, 82, 0.1);
          z-index: 1;
        }

        .auth-accent-bar {
          height: 6px;
          background: #6c4f37;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          border-radius: 28px 28px 0 0;
        }

        .auth-logo-box {
          display: inline-block;
          border: 1.5px solid rgba(166, 124, 82, 0.35);
          border-radius: 14px;
          padding: 6px;
          background: transparent;
          margin-bottom: 16px;
        }

        .auth-logo-img {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          object-fit: cover;
        }

        .auth-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.9rem;
          font-weight: 700;
          color: #3a2818;
          margin-bottom: 4px;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: #8c7355;
          margin-bottom: 24px;
        }

        .auth-error-box {
          background: #f8ded7;
          border: 1px solid #eba896;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 20px;
          color: #b03a2e;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-tabs-pill {
          background: #ece0ca;
          border-radius: 50px;
          padding: 4px;
          display: flex;
          gap: 4px;
          border: 1.5px solid rgba(166, 124, 82, 0.25);
          margin-bottom: 28px;
        }

        .auth-tab-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: #6c4f37;
          font-size: 0.92rem;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-tab-btn.active {
          background: #6c4f37;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(108, 79, 55, 0.2);
        }

        .form-label-custom-new {
          font-size: 0.76rem;
          font-weight: 800;
          color: #85664a;
          text-transform: uppercase;
          margin-bottom: 6px;
          letter-spacing: 0.06em;
          display: block;
        }

        .form-input-custom-new {
          background: #fffcf7;
          border: 1.5px solid rgba(166, 124, 82, 0.25);
          border-radius: 12px;
          padding: 12px 16px;
          color: #3a2818;
          width: 100%;
          font-size: 0.95rem;
          margin-bottom: 20px;
          transition: all 0.25s ease;
        }

        .form-input-custom-new::placeholder {
          color: #c2b5a3;
        }

        .form-input-custom-new:focus {
          border-color: #6c4f37;
          outline: none;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(108, 79, 55, 0.15);
        }

        .btn-continue-new {
          background: #6c4f37;
          color: #ffffff;
          border-radius: 50px;
          border: none;
          font-weight: 700;
          padding: 14px;
          width: 100%;
          font-size: 0.98rem;
          margin-top: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 6px 18px rgba(108, 79, 55, 0.18);
        }

        .btn-continue-new:hover {
          background: #563f2c;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(108, 79, 55, 0.25);
        }

        .btn-continue-new:disabled {
          background: #a39386;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>

      {/* Main container centering the card */}
      <div className="flex-fill d-flex align-items-center justify-content-center" style={{ zIndex: 1, padding: '60px 20px 80px 20px' }}>
        <div className="auth-card-custom">
          <div className="auth-accent-bar"></div>
          
          <div className="auth-logo-box">
            <img
              src="/images/aayam_img.jpg"
              alt="AAYAM Logo"
              className="auth-logo-img"
            />
          </div>

          <h2 className="auth-title">Welcome</h2>
          <p className="auth-subtitle">AAYAM Committee Portal</p>

          {/* Conditional Error message rendering matching red/pink banner style */}
          {error ? (
            <div className="auth-error-box">
              {error}
            </div>
          ) : (
            /* Empty pink/red styled spacer bar matching user screenshots */
            <div style={{ background: '#f8ded7', border: '1px solid #eba896', borderRadius: '10px', height: '36px', marginBottom: '20px' }}></div>
          )}

          {/* Toggle Tabs */}
          <div className="auth-tabs-pill">
            <button
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Login
            </button>
            <button
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="text-start">
            {mode === 'register' && (
              <div>
                <label className="form-label-custom-new">Full Name</label>
                <input
                  type="text"
                  className="form-input-custom-new"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label-custom-new">Email *</label>
              <input
                type="email"
                className="form-input-custom-new"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label-custom-new">Password *</label>
              <input
                type="password"
                className="form-input-custom-new"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-continue-new"
            >
              {submitting ? 'Please wait...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

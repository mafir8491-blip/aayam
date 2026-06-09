import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ReachOut() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [purpose, setPurpose] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [heardFrom, setHeardFrom] = useState('');
  
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          setUser(json.user);
          setName(json.user.name || '');
          setEmail(json.user.email || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!name || !email || !purpose || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/reachout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          contact,
          purpose,
          subject,
          message,
          heardFrom,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit contact request');
      }

      setSuccess(true);
      // Reset form fields except pre-filled contact if user logged in
      setContact('');
      setPurpose('');
      setSubject('');
      setMessage('');
      setHeardFrom('');
      if (!user) {
        setName('');
        setEmail('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <div className="reachout-wrapper container py-5">
      <div className="page-header text-center mb-4">
        <div className="section-label">Connect With Us</div>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-display, serif)', color: 'var(--br)' }}>Reach Out</h1>
        <p className="page-subtitle text-muted mt-2">Have an idea, feedback, or collaboration in mind? We'd love to hear from you.</p>
      </div>

      {isAdmin && (
        <div className="text-center mb-4">
          <Link to="/admin" className="btn btn-outline-secondary" style={{ borderColor: 'var(--br)', color: 'var(--br)', fontWeight: 750 }}>
            <i className="bi bi-inbox-fill me-1"></i> View All Submissions
          </Link>
        </div>
      )}

      {/* Info chips */}
      <div className="ro-info-chips d-flex justify-content-center flex-wrap gap-2 mb-4" style={{ fontSize: '0.78rem' }}>
        <div className="ro-chip px-3 py-2 border rounded-pill" style={{ background: 'rgba(166,124,82,0.06)', borderColor: 'rgba(166,124,82,0.16)', color: 'var(--tx-mid)' }}>
          <i className="bi bi-lightning-charge-fill me-1" style={{ color: 'var(--gold)' }}></i>
          Quick response within 24–48 hrs
        </div>
        <div className="ro-chip px-3 py-2 border rounded-pill" style={{ background: 'rgba(166,124,82,0.06)', borderColor: 'rgba(166,124,82,0.16)', color: 'var(--tx-mid)' }}>
          <i className="bi bi-shield-check-fill me-1" style={{ color: '#27ae60' }}></i>
          Your info stays private
        </div>
        <div className="ro-chip px-3 py-2 border rounded-pill" style={{ background: 'rgba(166,124,82,0.06)', borderColor: 'rgba(166,124,82,0.16)', color: 'var(--tx-mid)' }}>
          <i className="bi bi-people-fill me-1" style={{ color: 'var(--br)' }}></i>
          Open to everyone
        </div>
      </div>

      <div className="p-4 mx-auto" style={{ maxWidth: '680px', background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px', position: 'relative' }}>
        <div style={{ height: '3px', background: 'var(--br)', position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '12px 12px 0 0' }}></div>

        {success && (
          <div className="alert alert-success p-3 mb-4 d-flex align-items-center gap-3" style={{ background: 'rgba(39,174,96,0.09)', border: '1px solid rgba(39,174,96,0.24)', color: '#27ae60' }}>
            <span style={{ fontSize: '1.8rem' }}>🎉</span>
            <div>
              <div className="fw-bold mb-1" style={{ fontSize: '0.97rem' }}>Message sent successfully!</div>
              <div className="small opacity-85">We've received your submission and will get back to you soon.</div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger p-3 mb-4" style={{ background: 'rgba(192,57,43,0.09)', border: '1px solid rgba(192,57,43,0.24)', color: '#c0392b', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Form header */}
        <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-4" style={{ borderColor: 'var(--border-theme)' }}>
          <div className="d-flex align-items-center justify-content-center text-white" style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--br), var(--br-deep))', fontSize: '1.1rem', boxShadow: '0 6px 18px rgba(166,124,82,0.28)' }}>
            <i className="bi bi-send-fill"></i>
          </div>
          <div>
            <div className="fw-bold" style={{ fontFamily: 'var(--font-display, serif)', fontSize: '1.1rem' }}>Send Us a Message</div>
            <div className="small text-muted">Fill in the details below and we'll be in touch.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name + Email */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label-custom"><i className="bi bi-person me-1"></i> Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label-custom"><i className="bi bi-envelope me-1"></i> Email Address <span className="text-danger">*</span></label>
              <input
                type="email"
                className="form-control-custom"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Contact + Purpose */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label-custom"><i className="bi bi-telephone me-1"></i> Phone Number <span className="small text-muted">(optional)</span></label>
              <input
                type="tel"
                className="form-control-custom"
                placeholder="+91 XXXXX XXXXX"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label-custom"><i className="bi bi-tag me-1"></i> Purpose <span className="text-danger">*</span></label>
              <select className="form-select" value={purpose} onChange={(e) => setPurpose(e.target.value)} required>
                <option value="">— Select a purpose —</option>
                <option value="Event Feedback">💬 Event Feedback</option>
                <option value="Event Idea">💡 Event Idea</option>
                <option value="Collaboration">🤝 Collaboration</option>
                <option value="Sponsorship">💼 Sponsorship</option>
                <option value="Volunteer">🙋 Volunteer</option>
                <option value="General Query">❓ General Query</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-3">
            <label className="form-label-custom"><i className="bi bi-chat-square-text me-1"></i> Subject <span className="small text-muted">(optional)</span></label>
            <input
              type="text"
              className="form-control-custom"
              placeholder="Brief subject of your message"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="mb-3">
            <label className="form-label-custom"><i className="bi bi-pencil-square me-1"></i> Message <span className="text-danger">*</span></label>
            <textarea
              className="form-control-custom"
              rows="5"
              placeholder="Tell us what's on your mind — the more detail, the better!"
              value={message}
              onChange={(e) => setMessage(e.target.value.substring(0, 1000))}
              required
              style={{ minHeight: '130px' }}
            ></textarea>
            <div className="d-flex justify-content-between align-items-center mt-1">
              <span className="small text-muted" style={{ fontSize: '0.72rem' }}>Be as specific as possible — it helps us respond better.</span>
              <span className="small fw-semibold text-muted" style={{ fontSize: '0.72rem' }}>{message.length} / 1000</span>
            </div>
          </div>

          {/* How did you hear */}
          <div className="mb-4">
            <label className="form-label-custom"><i className="bi bi-megaphone me-1"></i> How did you hear about us? <span className="small text-muted">(optional)</span></label>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {['Instagram', 'WhatsApp', 'Word of Mouth', 'Notice Board', 'Faculty', 'Other'].map((opt) => (
                <label key={opt} className="cursor-pointer">
                  <input
                    type="radio"
                    name="heardFrom"
                    value={opt}
                    checked={heardFrom === opt}
                    onChange={(e) => setHeardFrom(e.target.value)}
                    className="d-none"
                  />
                  <span
                    className="badge rounded-pill border px-3 py-2 small"
                    style={{
                      borderColor: heardFrom === opt ? 'var(--br)' : 'var(--border-theme)',
                      color: heardFrom === opt ? 'var(--br)' : 'var(--text-muted-theme)',
                      background: heardFrom === opt ? 'rgba(166,124,82,0.1)' : 'transparent',
                    }}
                  >
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-register w-100 py-3 fw-bold mt-2"
            style={{ borderRadius: '8px' }}
          >
            {submitting ? (
              <span>Sending...</span>
            ) : (
              <span><i className="bi bi-send me-1"></i> Send Message</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

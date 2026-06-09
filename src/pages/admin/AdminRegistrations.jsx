import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function AdminRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');

  // Auto-refresh countdown state
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef(null);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`/api/admin/subevents/${id}/registrations`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate('/auth');
          return;
        }
        throw new Error('Failed to load registration details');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (!meJson.user || (meJson.user.role !== 'admin' && meJson.user.role !== 'superadmin')) {
          navigate('/auth');
          return;
        }
        setUser(meJson.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchUser();
  }, [id]);

  // Handle auto-refresh countdown
  useEffect(() => {
    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchRegistrations();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startTimer();

    // Pause timer on input focus, resume on blur
    const handleFocusIn = () => {
      clearInterval(timerRef.current);
      setCountdown(-1);
    };

    const handleFocusOut = () => {
      setCountdown(30);
      clearInterval(timerRef.current);
      startTimer();
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [id]);

  // Actions
  const handleVerify = async (regId) => {
    try {
      const res = await fetch(`/api/registrations/${regId}/verify`, { method: 'POST' });
      if (!res.ok) throw new Error('Verification failed');
      fetchRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePending = async (regId) => {
    try {
      const res = await fetch(`/api/registrations/${regId}/pending`, { method: 'POST' });
      if (!res.ok) throw new Error('Move to pending failed');
      fetchRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (regId) => {
    if (!confirm('Reject this registration?')) return;
    try {
      const res = await fetch(`/api/registrations/${regId}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Rejection failed');
      fetchRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (regId) => {
    if (!confirm('Permanently delete this registration record?')) return;
    try {
      const res = await fetch(`/api/registrations/${regId}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Delete failed');
      fetchRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving Participant Rosters...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Error Loading registrations</h3>
        <p className="text-muted">{error || 'Session registrations details not found'}</p>
        <Link to="/admin" className="btn-details">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const { subEvent, registrations } = data;

  const totalCount = registrations.length;
  const verifiedCount = registrations.filter((r) => r.status === 'verified').length;
  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  let displayedRegs = registrations;
  if (statusFilter !== 'all') {
    displayedRegs = registrations.filter((r) => r.status === statusFilter);
  }

  return (
    <div className="container py-5" style={{ color: 'var(--text-theme)' }}>
      
      {/* Header */}
      <div className="page-header text-start mb-4">
        {subEvent.eventId && (
          <Link to={`/events/${subEvent.eventId}`} className="btn-details mb-3" style={{ textDecoration: 'none' }}>
            <i className="bi bi-arrow-left me-1"></i> Back to Event
          </Link>
        )}
        <div className="section-label">Admin Panel</div>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-display, serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
          {subEvent.title}
        </h1>
        <p className="page-subtitle text-muted">Registration Management</p>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4 text-center">
        {[
          { label: 'Total', count: totalCount, border: 'rgba(166,124,82,0.22)', color: 'var(--br)' },
          { label: 'Verified', count: verifiedCount, border: 'rgba(39,174,96,0.22)', color: '#27ae60' },
          { label: 'Pending', count: pendingCount, border: 'rgba(241,196,15,0.28)', color: '#b8860b' },
          { label: 'Rejected', count: rejectedCount, border: 'rgba(192,57,43,0.22)', color: '#c0392b' },
        ].map((stat, idx) => (
          <div className="col-6 col-md-3" key={idx}>
            <div className="p-3 rounded" style={{ background: 'var(--bg-surface-theme)', border: `1px solid ${stat.border}` }}>
              <div className="h2 fw-bold mb-0" style={{ color: stat.color }}>{stat.count}</div>
              <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '1px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div className="d-flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All', count: totalCount },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'verified', label: 'Verified', count: verifiedCount },
            { id: 'rejected', label: 'Rejected', count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm ${statusFilter === tab.id ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(tab.id)}
              style={{ borderRadius: '20px', padding: '6px 16px', fontWeight: 600 }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="d-flex gap-3 align-items-center flex-wrap">
          {countdown > 0 ? (
            <div className="badge d-inline-flex align-items-center gap-2 px-3 py-2" style={{ background: 'rgba(39,174,96,0.09)', border: '1px solid rgba(39,174,96,0.22)', color: '#27ae60' }}>
              <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px', display: 'inline-block', animation: 'livePulse 2s infinite' }}></span>
              Live · <span>{countdown}</span>s
            </div>
          ) : (
            <div className="badge d-inline-flex align-items-center gap-2 px-3 py-2 bg-dark border border-secondary text-muted">
              ⏸ Paused
            </div>
          )}
          
          <a
            href={`/api/admin/subevents/${subEvent._id}/registrations/export`}
            className="btn btn-sm btn-outline-secondary"
            style={{ borderColor: 'var(--br)', color: 'var(--br)', padding: '6px 16px', borderRadius: '8px' }}
          >
            <i className="bi bi-download me-1"></i> Export CSV ({totalCount})
          </a>
        </div>
      </div>

      {/* Registration Cards */}
      <div className="d-flex flex-column gap-4">
        {displayedRegs.length === 0 ? (
          <div className="text-center p-5 rounded border border-dashed text-muted" style={{ background: 'var(--bg-surface-theme)', borderColor: 'var(--border-theme)' }}>
            <div className="fs-1 mb-2">📋</div>
            <p className="mb-0">No registrations found in this category.</p>
          </div>
        ) : (
          displayedRegs.map((reg, idx) => (
            <div
              key={reg._id}
              className="registration-card overflow-hidden"
              style={{
                background: 'var(--bg-surface-theme)',
                border: '1px solid var(--border-theme)',
                borderRadius: '16px',
              }}
            >
              {/* Card Header */}
              <div className="d-flex justify-content-between align-items-center p-3 flex-wrap gap-2 text-white" style={{ background: 'linear-gradient(135deg, var(--br), var(--br-deep))' }}>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.22)', fontSize: '0.85rem' }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{reg.participantName}</div>
                    <div className="small text-muted" style={{ opacity: 0.85 }}>
                      {reg.participantEmail} · {reg.participantPhone}
                    </div>
                    <div className="small" style={{ opacity: 0.65, fontSize: '0.7rem' }}>
                      Registered {new Date(reg.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <span
                  className="badge px-3 py-2 text-uppercase fw-bold"
                  style={{
                    background: reg.status === 'verified' ? 'rgba(39,174,96,0.18)' : reg.status === 'rejected' ? 'rgba(192,57,43,0.15)' : 'rgba(241,196,15,0.18)',
                    border: `1px solid ${reg.status === 'verified' ? '#27ae60' : reg.status === 'rejected' ? '#c0392b' : '#b8860b'}`,
                    color: reg.status === 'verified' ? '#27ae60' : reg.status === 'rejected' ? '#c0392b' : '#b8860b',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                  }}
                >
                  {reg.status === 'verified' ? '✓ Verified' : reg.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                </span>
              </div>

              {/* Custom responses */}
              {subEvent.formFields && subEvent.formFields.length > 0 && reg.responses && reg.responses.length > 0 && (
                <div className="border-bottom border-secondary">
                  {subEvent.formFields.slice().sort((a,b) => a.order - b.order).map((field) => {
                    const response = reg.responses.find((r) => r.fieldId?.toString() === field._id?.toString());
                    const val = response ? (Array.isArray(response.value) ? response.value.join(', ') : response.value) : '';
                    if (!val) return null;

                    return (
                      <div key={field._id} className="d-flex align-items-start gap-3 p-3 border-bottom small" style={{ borderColor: 'var(--border-theme)' }}>
                        <div className="text-uppercase fw-bold" style={{ width: '120px', color: 'var(--br)', fontSize: '0.71rem', letterSpacing: '0.8px' }}>
                          {field.label}
                        </div>
                        <div className="flex-fill">
                          {field.type === 'file' ? (
                            <a
                              href={val}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-secondary btn-sm"
                              style={{ borderColor: 'var(--border-theme)', color: 'var(--text-theme)', fontSize: '0.75rem', padding: '4px 10px' }}
                            >
                              <i className="bi bi-file-earmark"></i> View File
                            </a>
                          ) : (
                            val
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Team Members */}
              {subEvent.enableTeamMembers && reg.teamMembers && reg.teamMembers.length > 0 && (
                <div className="p-3 border-bottom border-secondary">
                  <div className="small fw-bold text-uppercase mb-3" style={{ color: 'var(--br)', letterSpacing: '1.4px' }}>
                    <i className="bi bi-people-fill me-1"></i> Team Members ({reg.teamMembers.length})
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {reg.teamMembers.map((member, mIdx) => (
                      <div key={mIdx} className="p-3 border rounded" style={{ background: 'var(--bg-base-theme)', borderColor: 'var(--border-theme)' }}>
                        <div className="small fw-bold text-uppercase mb-2 border-bottom pb-1" style={{ fontSize: '0.71rem', letterSpacing: '1.2px', borderColor: 'var(--border-theme)' }}>
                          Member {mIdx + 1}
                        </div>
                        <div className="small">
                          <div className="d-flex gap-2 py-1">
                            <span className="text-muted fw-bold" style={{ width: '80px', fontSize: '0.68rem' }}>NAME</span>
                            <span className="fw-bold">{member.name}</span>
                          </div>
                          {member.email && (
                            <div className="d-flex gap-2 py-1">
                              <span className="text-muted fw-bold" style={{ width: '80px', fontSize: '0.68rem' }}>EMAIL</span>
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="d-flex gap-2 py-1">
                              <span className="text-muted fw-bold" style={{ width: '80px', fontSize: '0.68rem' }}>PHONE</span>
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Receipt */}
              {reg.paymentScreenshot && (
                <div className="p-3 border-bottom border-secondary">
                  <div className="small fw-bold text-uppercase mb-2 text-warning" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>
                    <i className="bi bi-credit-card me-1"></i> Payment Screenshot
                  </div>
                  <a href={reg.paymentScreenshot} target="_blank" rel="noopener noreferrer">
                    <img
                      src={reg.paymentScreenshot}
                      alt="Receipt"
                      style={{ maxWidth: '220px', borderRadius: '8px', border: '1px solid var(--border-theme)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    />
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 p-3 flex-wrap align-items-center" style={{ background: 'var(--bg-base-theme)' }}>
                {reg.status !== 'verified' && (
                  <button
                    onClick={() => handleVerify(reg._id)}
                    className="btn btn-sm"
                    style={{ background: 'rgba(39,174,96,0.09)', borderColor: 'rgba(39,174,96,0.26)', color: '#27ae60' }}
                  >
                    <i className="bi bi-check-circle me-1"></i> Verify
                  </button>
                )}
                {reg.status !== 'pending' && (
                  <button
                    onClick={() => handlePending(reg._id)}
                    className="btn btn-sm"
                    style={{ background: 'rgba(241,196,15,0.09)', borderColor: 'rgba(241,196,15,0.28)', color: '#ffd700' }}
                  >
                    <i className="bi bi-clock me-1"></i> Move to Pending
                  </button>
                )}
                {reg.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(reg._id)}
                    className="btn btn-sm"
                    style={{ background: 'rgba(192,57,43,0.07)', borderColor: 'rgba(192,57,43,0.22)', color: '#c0392b' }}
                  >
                    <i className="bi bi-x-circle me-1"></i> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(reg._id)}
                  className="btn btn-sm ms-auto"
                  style={{ background: 'transparent', borderColor: 'rgba(192,57,43,0.16)', color: '#c0392b' }}
                >
                  <i className="bi bi-trash3 me-1"></i> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      <div className="text-center mt-5 small text-muted">
        Auto-refreshing in <span className="fw-bold" style={{ color: 'var(--br)' }}>{countdown > 0 ? countdown : '—'}</span>s
        &nbsp;·&nbsp;
        <button
          onClick={() => {
            setLoading(true);
            fetchRegistrations();
          }}
          className="btn btn-link btn-sm text-warning text-decoration-none p-0 fw-bold"
        >
          Refresh now
        </button>
      </div>

    </div>
  );
}

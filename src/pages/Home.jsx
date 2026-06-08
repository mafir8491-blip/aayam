import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [data, setData] = useState({
    whatWeDoImages: [],
    eventImages: [],
    promo: null,
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // File Upload State
  const [actFile, setActFile] = useState(null);
  const [actPreview, setActPreview] = useState('');
  const [evtFile, setEvtFile] = useState(null);
  const [evtPreview, setEvtPreview] = useState('');

  // Promo Form State
  const [promoForm, setPromoForm] = useState({
    label: 'Register Now',
    title: '',
    heading: '',
    description: '',
    link: '',
    eventDate: '',
  });

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    mins: '00',
    secs: '00',
    expired: false,
  });

  // Fetch Page Data & Session User
  const fetchData = async () => {
    try {
      const res = await fetch('/api');
      if (!res.ok) throw new Error('Failed to fetch home data');
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
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.user || null);
      }
    } catch (err) {
      console.error('Session fetch failed', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!data.promo || !data.promo.isActive || !data.promo.eventDate) return;

    const target = new Date(data.promo.eventDate).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown((prev) => ({ ...prev, expired: true }));
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const pad = (n) => (n < 10 ? '0' + n : '' + n);

      setCountdown({
        days: pad(d),
        hours: pad(h),
        mins: pad(m),
        secs: pad(s),
        expired: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data.promo]);

  // Image upload handler
  const handleUpload = async (section, file, setFileState, setPreviewState) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('section', section);
    formData.append('image', file);

    try {
      const res = await fetch('/api/home/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Upload failed');
      } else {
        alert('Image uploaded successfully');
        setFileState(null);
        setPreviewState('');
        fetchData();
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  // Image delete handler
  const handleDeleteImage = async (id) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    try {
      const res = await fetch(`/api/home/delete/${id}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Delete failed');
      } else {
        fetchData();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Add promo banner
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/home/promo/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to add promo banner');
      } else {
        alert('Promo banner published!');
        setPromoForm({
          label: 'Register Now',
          title: '',
          heading: '',
          description: '',
          link: '',
          eventDate: '',
        });
        fetchData();
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Toggle promo banner state
  const handlePromoToggle = async (id) => {
    try {
      const res = await fetch(`/api/home/promo/${id}/toggle`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Toggle failed');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete promo banner
  const handlePromoDelete = async (id) => {
    if (!confirm('Delete this promo banner?')) return;
    try {
      const res = await fetch(`/api/home/promo/${id}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle file select for previews
  const handleFileSelect = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelect = (setFile, setPreview) => {
    setFile(null);
    setPreview('');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Curating Premium Experience...</p>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <div className="home-wrapper">
      {/* HERO SECTION */}
      <section
        className="hs-hero"
        style={{
          background: `linear-gradient(rgba(18, 12, 8, 0.78), rgba(18, 12, 8, 0.78)), url('/images/committee_hero.jpg') no-repeat center center`,
          backgroundSize: 'cover',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          paddingTop: 'clamp(80px, 12vh, 140px)',
          paddingBottom: 'clamp(60px, 9vh, 100px)',
        }}
      >
        <div className="hero-grain" aria-hidden="true"></div>

        <div className="container hs-hero-inner text-center">
          <div
            style={{
              fontFamily: "var(--font-display, 'Georgia', serif)",
              fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)',
              color: '#fff',
              fontWeight: 400,
              marginBottom: '12px',
              letterSpacing: '0.5px',
            }}
          >
            Welcome to
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display, 'Georgia', serif)",
              fontSize: 'clamp(2.4rem, 7.5vw, 6rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#a67c52',
              marginBottom: '18px',
              lineHeight: 1.1,
            }}
          >
            AAYAM COMMITTEE
          </h1>

          <div
            style={{
              fontSize: 'clamp(1.1rem, 3vw, 2.1rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.5px',
              marginBottom: '18px',
            }}
          >
            Shaping Ideas. Building Tomorrow.
          </div>

          <p
            style={{
              fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
              color: 'rgba(255,255,255,0.78)',
              maxWidth: '680px',
              margin: '0 auto clamp(26px, 4vw, 42px)',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            AAYAM Committee is the official student body of Unitedworld Institute of Technology. We organize, manage and execute technical, cultural and creative events.
          </p>

          <div
            className="hero-cta-row"
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: 'clamp(30px, 5vw, 52px)',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/events"
              className="hero-cta-primary"
              style={{
                background: '#a67c52',
                color: '#120c08',
                fontWeight: 700,
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                boxShadow: '0 6px 18px rgba(166,124,82,0.3)',
                transition: 'transform 0.3s ease, background 0.3s ease',
              }}
            >
              <span>Explore Events</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
            <a
              href="#about"
              className="hero-cta-secondary"
              style={{
                border: '1.5px solid #a67c52',
                color: '#a67c52',
                background: 'transparent',
                fontWeight: 700,
                padding: '11px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
            >
              <span>Learn More</span>
              <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          <div
            className="hero-stats"
            style={{
              background: 'rgba(18, 12, 8, 0.70)',
              border: '1.5px solid rgba(166, 124, 82, 0.35)',
              borderRadius: '18px',
              padding: '22px 30px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              maxWidth: '820px',
              margin: '0 auto',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            {/* Stat 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', textAlign: 'left' }}>
              <div style={{ fontSize: '2.2rem', color: '#a67c52', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>40+</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                  Team Members
                </div>
              </div>
            </div>
            {/* Stat 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', textAlign: 'left', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '2.2rem', color: '#a67c52', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>25+</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                  Events Organized
                </div>
              </div>
            </div>
            {/* Stat 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', textAlign: 'left', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '2.2rem', color: '#a67c52', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-trophy-fill"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>15+</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                  National Wins
                </div>
              </div>
            </div>
            {/* Stat 4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', textAlign: 'left', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '2.2rem', color: '#a67c52', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-building"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>UIT</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                  Our Home
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll</span>
        </div>
      </section>

      {/* REGISTER NOW PROMO BANNER */}
      {data.promo && data.promo.isActive && !countdown.expired && (
        <div className="hpb-section" style={{ padding: 'clamp(32px, 5vw, 56px) 0 10px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="hpb-wrapper" id="heroPromoBanner">
            {data.promo.heading && data.promo.heading.trim() !== '' && (
              <div className="hpb-sub-heading">{data.promo.heading}</div>
            )}

            <div className="hpb-top-row">
              <span className="hpb-fire">🔥</span>
              <span className="hpb-register-heading">{data.promo.title}</span>
              <span className="hpb-fire">🔥</span>
            </div>

            <div className="hpb-event-title">{data.promo.label || 'REGISTER NOW'}</div>

            {data.promo.description && <div className="hpb-event-desc">{data.promo.description}</div>}

            {data.promo.eventDate && (
              <div className="hpb-countdown-row" id="heroCountdown">
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.days}</span>
                  <span className="hpb-cd-label">DAYS</span>
                </div>
                <span className="hpb-cd-colon">:</span>
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.hours}</span>
                  <span className="hpb-cd-label">HRS</span>
                </div>
                <span className="hpb-cd-colon">:</span>
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.mins}</span>
                  <span className="hpb-cd-label">MIN</span>
                </div>
                <span className="hpb-cd-colon">:</span>
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.secs}</span>
                  <span className="hpb-cd-label">SEC</span>
                </div>
              </div>
            )}

            {data.promo.link && data.promo.link.trim() !== '' && (
              <a href={data.promo.link} target="_blank" rel="noopener noreferrer" className="hpb-cta-btn">
                Register Now &rarr;
              </a>
            )}
          </div>
        </div>
      )}

      {/* ADMIN PROMO MANAGER */}
      {isAdmin && (
        <section className="hs-promo-admin" id="promoAdmin">
          <div className="container">
            <div className="promo-admin-card">
              <div className="promo-admin-header">
                <div className="promo-admin-icon">📣</div>
                <div>
                  <div className="promo-admin-title">Register Now Banner</div>
                  <div className="promo-admin-sub">Add a highlighted registration banner with countdown to the hero section</div>
                </div>
              </div>

              {/* Existing promo */}
              {data.promo && (
                <div className="promo-existing" style={{ marginBottom: '18px' }}>
                  <div className="promo-existing-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--tx)', fontSize: '0.95rem' }}>{data.promo.title}</div>
                      {data.promo.heading && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--br)', marginTop: '2px', fontWeight: 600 }}>
                          {data.promo.heading}
                        </div>
                      )}
                      {data.promo.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--tx-muted)', marginTop: '2px' }}>
                          {data.promo.description}
                        </div>
                      )}
                      {data.promo.eventDate && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--br)', marginTop: '3px', fontWeight: 600 }}>
                          <i className="bi bi-calendar-event"></i> Event Date:{' '}
                          {new Date(data.promo.eventDate).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handlePromoToggle(data.promo._id)}
                        className={data.promo.isActive ? 'btn-admin-warn' : 'btn-register'}
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                      >
                        {data.promo.isActive ? '⏸ Hide Banner' : '▶ Show Banner'}
                      </button>
                      <button
                        onClick={() => handlePromoDelete(data.promo._id)}
                        className="btn-admin-danger"
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      marginTop: '6px',
                      fontWeight: 700,
                      color: data.promo.isActive ? '#27ae60' : 'var(--tx-muted)',
                    }}
                  >
                    {data.promo.isActive ? '🟢 Banner is LIVE on home page' : '⭕ Banner is hidden'}
                  </div>
                </div>
              )}

              {/* Add / replace promo form */}
              <div className="promo-add-box">
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--br)',
                    marginBottom: '14px',
                  }}
                >
                  <i className="bi bi-plus-circle"></i> {data.promo ? 'Replace Banner' : 'Add New Banner'}
                </div>
                <form onSubmit={handlePromoSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Pill Label{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (e.g. "Register Now")
                        </span>
                      </label>
                      <input
                        type="text"
                        name="label"
                        className="form-control-custom"
                        placeholder="Register Now"
                        value={promoForm.label}
                        onChange={(e) => setPromoForm({ ...promoForm, label: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Event Name <span style={{ color: '#c0392b' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="form-control-custom"
                        placeholder="e.g. AAYAM Fest 2026"
                        required
                        value={promoForm.title}
                        onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label-custom">
                        Sub-Heading{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (shown below "REGISTER NOW", above countdown — e.g. "Inter-college Technical Fest")
                        </span>
                      </label>
                      <input
                        type="text"
                        name="heading"
                        className="form-control-custom"
                        placeholder="e.g. Inter-college Technical & Cultural Fest"
                        value={promoForm.heading}
                        onChange={(e) => setPromoForm({ ...promoForm, heading: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label-custom">
                        Short Description{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (optional — appears below event name)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="description"
                        className="form-control-custom"
                        placeholder="e.g. 3 days · 20+ events · Open to all colleges"
                        value={promoForm.description}
                        onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Registration Link{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="url"
                        name="link"
                        className="form-control-custom"
                        placeholder="https://forms.google.com/..."
                        value={promoForm.link}
                        onChange={(e) => setPromoForm({ ...promoForm, link: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Event Date &amp; Time{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (countdown target — auto-hides when reached)
                        </span>
                      </label>
                      <input
                        type="datetime-local"
                        name="eventDate"
                        className="form-control-custom"
                        value={promoForm.eventDate}
                        onChange={(e) => setPromoForm({ ...promoForm, eventDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-register" style={{ marginTop: '4px', fontSize: '0.88rem' }}>
                    <i className="bi bi-megaphone"></i> {data.promo ? 'Replace & Publish' : 'Publish Banner'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      <section className="hs-upcoming-events" style={{ padding: 'clamp(50px, 7vw, 90px) 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(24px, 4vw, 42px)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display, 'Georgia', serif)",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: 'var(--tx)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Upcoming <span style={{ color: '#a67c52' }}>Events</span>
            </h2>
            <Link
              to="/events"
              className="hero-cta-secondary"
              style={{
                border: '1.5px solid #a67c52',
                color: '#a67c52',
                background: 'transparent',
                padding: '10px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, background-color 0.2s',
              }}
            >
              <span>View All Events</span> <i class="bi bi-arrow-right"></i>
            </Link>
          </div>

          {data.upcomingEvents && data.upcomingEvents.length > 0 ? (
            <div className="upcoming-events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {data.upcomingEvents.map((evt, idx) => (
                <div
                  key={evt._id}
                  className="upcoming-event-card"
                  style={{
                    background: 'rgba(30, 21, 14, 0.45)',
                    border: '1.5px solid rgba(166, 124, 82, 0.16)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={evt.bannerImage || '/images/technovanza_banner.png'}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: '#a67c52',
                        color: '#120c08',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      {evt.category || 'Event'}
                    </div>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-body, sans-serif)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 0 10px',
                        lineHeight: 1.25,
                      }}
                    >
                      {evt.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 20px', lineHeight: 1.5, flex: 1 }}>
                      {evt.shortDescription || ''}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        borderTop: '1px solid rgba(166, 124, 82, 0.12)',
                        paddingTop: '14px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-calendar-event" style={{ color: '#a67c52', fontSize: '0.9rem' }}></i>
                        {new Date(evt.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-geo-alt" style={{ color: '#a67c52', fontSize: '0.9rem' }}></i>
                        {evt.location || 'SVNIT Surat'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: 'rgba(166, 124, 82, 0.35)' }}></i>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.55)', marginTop: '10px' }}>No upcoming events at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="hs-intro" id="about">
        <div className="container">
          <div className="hs-intro-grid">
            <div className="intro-content-col">
              <div className="section-label">Who We Are</div>
              <h2 className="hs-section-title">
                AAYAM &ndash; UIT Students' Committee, Karnavati University <em className="title-em"></em>
              </h2>
              <p className="hs-slogan">Empowering Students. Enabling Events. Enhancing Campus Life.</p>
              <p className="hs-body-text">
                AAYAM is the heartbeat of student life at the Unitedworld Institute of Technology, Karnavati University &mdash; the official Students' Committee that drives every event, every celebration, and every opportunity that shapes the UIT experience. From intimate club meetings to grand inter-college festivals, we are the force that makes it all happen.
              </p>
              <p className="hs-body-text">
                We plan, organize, and execute with precision and passion. Whether it's a technical symposium, cultural fest, sports tournament, or industry collaboration &mdash; AAYAM brings together student talent, faculty support, and institutional resources to build futures, one experience at a time.
              </p>
              <div className="intro-pillars">
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  Governance
                </div>
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Collaboration
                </div>
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Innovation
                </div>
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                  Excellence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR TEAMS */}
      <section className="hs-our-teams" style={{ padding: 'clamp(50px, 7vw, 90px) 0', borderTop: '1px solid rgba(166, 124, 82, 0.08)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(24px, 4vw, 42px)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display, 'Georgia', serif)",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: 'var(--tx)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Our <span style={{ color: '#a67c52' }}>Teams</span>
            </h2>
            <Link
              to="/team"
              className="hero-cta-secondary btn-view-all-teams"
              style={{
                border: '1.5px solid #a67c52',
                color: '#a67c52',
                background: 'transparent',
                padding: '10px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, background-color 0.2s',
              }}
            >
              <span>View All Teams</span> <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="teams-section-grid">
            <Link to="/team#core-committee" className="team-card-link">
              <div className="our-team-card">
                <div className="team-card-icon">
                  <i className="bi bi-shield-check" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title">Core</h3>
                <p className="team-card-subtitle">Committee</p>
              </div>
            </Link>

            <Link to="/team#management-team" className="team-card-link">
              <div className="our-team-card">
                <div className="team-card-icon">
                  <i className="bi bi-people" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title">Management</h3>
                <p className="team-card-subtitle">Team</p>
              </div>
            </Link>

            <Link to="/team#media-team" className="team-card-link">
              <div className="our-team-card">
                <div className="team-card-icon">
                  <i className="bi bi-camera" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title">Media</h3>
                <p className="team-card-subtitle">Team</p>
              </div>
            </Link>

            <Link to="/team#technical-and-creatives-team" className="team-card-link">
              <div className="our-team-card">
                <div className="team-card-icon">
                  <i className="bi bi-code-slash" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title" style={{ wordBreak: 'break-word' }}>Technical &amp; Creatives</h3>
                <p className="team-card-subtitle">Team</p>
              </div>
            </Link>

            <Link to="/team#sports-and-cultural-team" className="team-card-link">
              <div className="our-team-card">
                <div className="team-card-icon">
                  <i className="bi bi-trophy" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title" style={{ wordBreak: 'break-word' }}>Sports &amp; Cultural</h3>
                <p className="team-card-subtitle">Team</p>
              </div>
            </Link>

            <Link to="/team#communication-and-hospitality" className="team-card-link">
              <div className="our-team-card">
                <div className="team-card-icon">
                  <i className="bi bi-handshake" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title" style={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>Communication &amp; Hospitality</h3>
                <p className="team-card-subtitle">Team</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVITIES GALLERY */}
      <section className="hs-gallery" id="gallery">
        <div className="container">
          <div className="hs-section-header text-center">
            <div className="section-label">In Action</div>
            <h2 className="hs-section-title">Our Activities</h2>
            <p className="hs-section-desc">Every moment captured here is a testament to the energy, creativity, and spirit of the UIT student community.</p>
          </div>

          {data.whatWeDoImages && data.whatWeDoImages.length > 0 ? (
            <div className="hs-gallery-grid events-gallery">
              {data.whatWeDoImages.map((img) => (
                <div key={img._id} className="hs-gallery-item">
                  <div className="gallery-img-wrap">
                    <img src={img.image} loading="lazy" alt="AAYAM activity" />
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteImage(img._id)}
                        className="gallery-delete-btn"
                        title="Remove"
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p>No activity images yet.</p>
            </div>
          )}

          {isAdmin && (
            <div className="hs-upload-zone">
              <div className="upload-form">
                <label className="upload-area" htmlFor="actFile">
                  <div className="upload-icon">📁</div>
                  <p className="upload-text">Drop an activity image or <span className="upload-browse">browse</span></p>
                  <input
                    type="file"
                    id="actFile"
                    className="upload-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setActFile, setActPreview)}
                  />
                  <p className="upload-hint">PNG, JPG up to 10MB, only 4 photos can be added</p>
                </label>

                {actPreview && (
                  <div className="upload-preview" style={{ display: 'flex' }}>
                    <img src={actPreview} alt="Preview" className="upload-preview-img" />
                    <span className="upload-preview-name">{actFile?.name}</span>
                    <button type="button" className="upload-preview-clear" onClick={() => clearFileSelect(setActFile, setActPreview)}>
                      ✕ Clear
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="upload-submit-btn"
                  onClick={() => handleUpload('what_we_do', actFile, setActFile, setActPreview)}
                  disabled={!actFile}
                >
                  Upload Activity Image
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="hs-vision-mission">
        <div className="container">
          <div className="hs-section-header text-center">
            <div className="section-label">Our Compass</div>
            <h2 className="hs-section-title">Vision &amp; Mission</h2>
          </div>
          <div className="vm-grid">
            <div className="vm-panel vm-vision">
              <div className="vm-eyebrow">Our Direction</div>
              <div className="vm-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <h3 className="vm-title">Strategic Vision</h3>
              <p className="vm-body">
                We envision UIT as a benchmark of student-led excellence &mdash; a thriving campus ecosystem where every event is a launchpad, every collaboration a milestone, and every student an architect of their own future. We strive to build an institution where ambition meets opportunity at every corner.
              </p>
              <div className="vm-tag-row">
                <span className="vm-tag">Leadership</span>
                <span className="vm-tag">Innovation</span>
                <span className="vm-tag">Inclusion</span>
              </div>
            </div>

            <div className="vm-divider" aria-hidden="true">
              <div className="vm-divider-line"></div>
              <div className="vm-divider-diamond">◆</div>
              <div className="vm-divider-line"></div>
            </div>

            <div className="vm-panel vm-mission">
              <div className="vm-eyebrow">Our Purpose</div>
              <div className="vm-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="vm-title">Mission Objective</h3>
              <p className="vm-body">
                Our mission is to architect a structured, transparent, and inclusive framework that amplifies every student's voice. We are committed to organizing impactful events, fostering professional excellence, and building a campus culture where every student feels empowered to participate, lead, and grow beyond their limits.
              </p>
              <div className="vm-tag-row">
                <span className="vm-tag">Transparency</span>
                <span className="vm-tag">Structure</span>
                <span className="vm-tag">Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS GALLERY */}
      <section className="hs-events-section">
        <div className="container">
          <div className="hs-section-header text-center">
            <div className="section-label">Events &amp; Collaborations</div>
            <h2 className="hs-section-title">Moments That Matter</h2>
            <p className="hs-section-desc font-normal">From grand cultural fests to intimate technical workshops &mdash; AAYAM is the backbone behind every event that writes the story of UIT.</p>
            <div className="events-excellence-badge">
              <span className="badge-star">★</span> Powered by AAYAM Excellence <span className="badge-star">★</span>
            </div>
          </div>

          {data.eventImages && data.eventImages.length > 0 ? (
            <div className="hs-gallery-grid events-gallery">
              {data.eventImages.map((img) => (
                <div key={img._id} className="hs-gallery-item">
                  <div className="gallery-img-wrap">
                    <img src={img.image} loading="lazy" alt="AAYAM event" />
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteImage(img._id)}
                        className="gallery-delete-btn"
                        title="Remove"
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p>No event images yet.</p>
            </div>
          )}

          {isAdmin && (
            <div className="hs-upload-zone">
              <div className="upload-form">
                <label className="upload-area" htmlFor="evtFile">
                  <div className="upload-icon">📁</div>
                  <p className="upload-text">Drop an event image or <span className="upload-browse">browse</span></p>
                  <input
                    type="file"
                    id="evtFile"
                    className="upload-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setEvtFile, setEvtPreview)}
                  />
                  <p className="upload-hint">PNG, JPG up to 10MB</p>
                </label>

                {evtPreview && (
                  <div className="upload-preview" style={{ display: 'flex' }}>
                    <img src={evtPreview} alt="Preview" className="upload-preview-img" />
                    <span className="upload-preview-name">{evtFile?.name}</span>
                    <button type="button" className="upload-preview-clear" onClick={() => clearFileSelect(setEvtFile, setEvtPreview)}>
                      ✕ Clear
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="upload-submit-btn"
                  onClick={() => handleUpload('events', evtFile, setEvtFile, setEvtPreview)}
                  disabled={!evtFile}
                >
                  Upload Event Image
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

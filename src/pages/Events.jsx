import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ─── Design tokens (hard-coded so they work even if CSS vars aren't loaded) ─── */
const BR   = '#a67c52';   // brand brown
const BR_D = '#8a6240';   // darker brand
const BG_CARD = '#fdfaf6'; // card background
const BG_ACTIVE = 'linear-gradient(135deg,rgba(166,124,82,0.13),rgba(201,168,76,0.07))';
const BORDER_DEFAULT = '1.5px solid #e0d5c8';
const BORDER_ACTIVE  = '1.5px solid #a67c52';
const TX        = '#3a2a1a';
const TX_MUTED  = '#8a7a6a';

/* ─── Reusable status-card style builder ─── */
function cardStyle(isActive) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '22px 28px',
    borderRadius: '18px',
    border: isActive ? BORDER_ACTIVE : BORDER_DEFAULT,
    background: isActive ? BG_ACTIVE : BG_CARD,
    boxShadow: isActive
      ? '0 8px 28px rgba(166,124,82,0.18)'
      : '0 2px 10px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
    userSelect: 'none',
  };
}

export default function Events() {
  const [data, setData] = useState({
    events: [],
    liveEvents: [],
    upcomingEvents: [],
    pastEvents: [],
  });
  const [loading, setLoading]             = useState(true);
  const [user, setUser]                   = useState(null);
  const [error, setError]                 = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);   // null | 'upcoming' | 'live' | 'past'
  const [selectedCategory, setSelectedCategory] = useState('all');

  /* ── Admin add-event form state ── */
  const [type, setType]                   = useState('upcoming');
  const [category, setCategory]           = useState('Technical');
  const [location, setLocation]           = useState('SVNIT Surat');
  const [title, setTitle]                 = useState('');
  const [customDetails, setCustomDetails] = useState([]);
  const [actualDesc, setActualDesc]       = useState('');
  const [description, setDescription]     = useState('');
  const [about, setAbout]                 = useState('');
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [bannerFile, setBannerFile]       = useState(null);
  const [registrationLink, setRegistrationLink] = useState('');

  /* ── Data fetching ── */
  const fetchData = async () => {
    try {
      const res  = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
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
    } catch (err) { /* silent */ }
  };

  useEffect(() => { fetchData(); fetchUser(); }, []);

  /* ── Admin actions ── */
  const handleToggleVisibility = async (evtId) => {
    try {
      const res  = await fetch(`/api/events/toggle-visibility/${evtId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      alert('Event visibility updated!');
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteEvent = async (evtId) => {
    if (!confirm('Permanently delete this event, all its sub-events, and all registrations? This cannot be undone.')) return;
    try {
      const res  = await fetch(`/api/events/delete/${evtId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      alert('Event deleted successfully.');
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleStatusChange = async (evtId, newStatus) => {
    try {
      const res  = await fetch(`/api/events/change-status/${evtId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      alert('Event status updated!');
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleAddCustomDetail = () =>
    setCustomDetails([...customDetails, { key: '', value: '' }]);

  const handleCustomDetailChange = (index, field, value) => {
    const updated = [...customDetails];
    updated[index][field] = value;
    setCustomDetails(updated);
  };

  const handleRemoveCustomDetail = (index) =>
    setCustomDetails(customDetails.filter((_, i) => i !== index));

  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile) { alert('Please upload a banner image'); return; }

    let combinedShortDesc = `Category: ${category} | Location: ${location}`;
    customDetails.forEach((d) => {
      if (d.key.trim()) combinedShortDesc += ` | Detail: ${d.key.trim()}:${d.value.trim()}`;
    });
    combinedShortDesc += ` | ${actualDesc.trim()}`;

    const formData = new FormData();
    formData.append('type',             type);
    formData.append('title',            title);
    formData.append('shortDescription', combinedShortDesc);
    formData.append('description',      description);
    formData.append('about',            about);
    formData.append('startDate',        startDate);
    formData.append('endDate',          endDate);
    formData.append('bannerImage',      bannerFile);
    formData.append('registrationLink', registrationLink);
    formData.append('isPublic',         'true');

    try {
      const res  = await fetch('/api/events/add', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) { alert(json.error || 'Failed to add event'); }
      else {
        alert('Event added successfully!');
        setTitle(''); setActualDesc(''); setDescription(''); setAbout('');
        setStartDate(''); setEndDate(''); setBannerFile(null);
        setRegistrationLink(''); setCustomDetails([]);
        fetchData();
      }
    } catch (err) { alert(err.message); }
  };

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <div className="spinner-border" style={{ color: BR }} role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <p style={{ color: TX_MUTED, fontWeight: 600 }}>Loading events…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#c0392b', fontWeight: 600 }}>⚠ {error}</p>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  /* ── Filtered events ── */
  let displayedEvents = [];
  if (selectedStatus === 'upcoming') displayedEvents = data.upcomingEvents || [];
  else if (selectedStatus === 'live') displayedEvents = data.liveEvents    || [];
  else if (selectedStatus === 'past') displayedEvents = data.pastEvents     || [];
  if (selectedCategory !== 'all')
    displayedEvents = displayedEvents.filter((e) => e.category === selectedCategory);

  /* ── Status card data ── */
  const STATUS_CARDS = [
    {
      key:   'upcoming',
      label: 'Upcoming Events',
      icon:  'bi-calendar2-week',
      count: (data.upcomingEvents || []).length,
      color: BR,
    },
    {
      key:   'live',
      label: 'Live Events',
      icon:  'bi-play-circle-fill',
      count: (data.liveEvents || []).length,
      color: '#27ae60',
    },
    {
      key:   'past',
      label: 'Past Events',
      icon:  'bi-check-circle-fill',
      count: (data.pastEvents || []).length,
      color: BR,
    },
  ];

  const CATEGORIES = ['all', 'Technical', 'Cultural', 'Sports', 'Workshop'];

  return (
    <div className="container py-5">

      {/* ── Breadcrumb ── */}
      <nav style={{ fontSize: '0.82rem', color: TX_MUTED, marginBottom: '24px', fontWeight: 600 }}>
        <Link to="/" style={{ color: BR, textDecoration: 'none' }}>
          <i className="bi bi-house-door-fill me-1" />Home
        </Link>
        {' / '}
        <span style={{ color: TX }}>Events</span>
      </nav>

      {/* ── Page header ── */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-block', fontSize: '0.7rem', fontWeight: 800,
          letterSpacing: '2.5px', textTransform: 'uppercase',
          color: BR, background: 'rgba(166,124,82,0.09)',
          padding: '5px 16px', borderRadius: '20px', marginBottom: '14px',
        }}>
          Our Events
        </div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,5vw,3.2rem)',
          fontWeight: 900, color: BR, margin: '0 0 12px',
        }}>
          Events
        </h1>
        <p style={{ color: TX_MUTED, fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
          Select a category below to explore our exciting tech, cultural, sports, and workshop events.
        </p>
      </div>

      {/* ── Admin: Add Event ── */}
      {isAdmin && (
        <details style={{
          marginBottom: '40px', padding: '18px 24px',
          border: `1.5px dashed ${BR}`, borderRadius: '14px',
          background: 'rgba(166,124,82,0.04)',
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: BR, listStyle: 'none', outline: 'none' }}>
            ➕ Add New Event
          </summary>
          <form onSubmit={handleAddEventSubmit} className="mt-4">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: BR }}>Event Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: BR }}>Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option>Technical</option><option>Cultural</option>
                  <option>Sports</option><option>Workshop</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <input type="text" placeholder="Event Title" className="form-control"
                value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <input type="text" placeholder="Location (e.g. SVNIT Surat)" className="form-control"
                value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: BR }}>Custom Details (optional)</label>
              <div className="d-flex flex-column gap-2 mb-2">
                {customDetails.map((d, idx) => (
                  <div key={idx} className="d-flex gap-2 align-items-center">
                    <input type="text" placeholder="Key" className="form-control" value={d.key}
                      onChange={(e) => handleCustomDetailChange(idx, 'key', e.target.value)} />
                    <input type="text" placeholder="Value" className="form-control" value={d.value}
                      onChange={(e) => handleCustomDetailChange(idx, 'value', e.target.value)} />
                    <button type="button" onClick={() => handleRemoveCustomDetail(idx)}
                      className="btn btn-outline-danger btn-sm">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary"
                style={{ borderColor: BR, color: BR }} onClick={handleAddCustomDetail}>
                + Add Detail
              </button>
            </div>
            <div className="mb-3">
              <textarea placeholder="Short description summary" className="form-control" rows={2}
                value={actualDesc} onChange={(e) => setActualDesc(e.target.value)} required />
            </div>
            <div className="mb-3">
              <textarea placeholder="Full description" className="form-control" rows={4}
                value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="mb-3">
              <textarea placeholder="About the event (HTML supported)" className="form-control" rows={3}
                value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem', color: BR }}>Start Date</label>
                <input type="date" className="form-control" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem', color: BR }}>End Date</label>
                <input type="date" className="form-control" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="mb-3">
              <input type="file" className="form-control" accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])} required />
            </div>
            <div className="mb-4">
              <input type="url" placeholder="Registration Link (optional)" className="form-control"
                value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} />
            </div>
            <button type="submit" style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: BR, color: '#fff', border: 'none',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            }}>
              ➕ Add Event
            </button>
          </form>
        </details>
      )}

      {/* ══════════════════════════════════════════
          3 STATUS SELECTION CARDS
          ══════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        {STATUS_CARDS.map(({ key, label, icon, count, color }) => {
          const active = selectedStatus === key;
          return (
            <div
              key={key}
              onClick={() => { setSelectedStatus(key); setSelectedCategory('all'); }}
              style={cardStyle(active)}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(166,124,82,0.14)';
                  e.currentTarget.style.transform  = 'translateY(-3px)';
                  e.currentTarget.style.border     = BORDER_ACTIVE;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform  = 'none';
                  e.currentTarget.style.border     = BORDER_DEFAULT;
                }
              }}
            >
              {/* Icon */}
              <div style={{
                width: '54px', height: '54px', borderRadius: '14px',
                background: active ? `rgba(${color === '#27ae60' ? '39,174,96' : '166,124,82'},0.15)` : `rgba(${color === '#27ae60' ? '39,174,96' : '166,124,82'},0.08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', color: color, flexShrink: 0,
              }}>
                <i className={`bi ${icon}`} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.05rem', fontWeight: 800,
                  color: TX, margin: '0 0 4px',
                }}>
                  {label}
                </h3>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: TX_MUTED, margin: 0 }}>
                  {count} {count === 1 ? 'Event' : 'Events'}
                </p>
              </div>

              {/* Arrow */}
              <i className="bi bi-chevron-right" style={{
                fontSize: '1.1rem', color: active ? BR : TX_MUTED,
                opacity: active ? 1 : 0.45,
                transition: 'all 0.2s',
              }} />
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          EVENTS SECTION (shown after card click)
          ══════════════════════════════════════════ */}
      {selectedStatus && (
        <>
          {/* Section heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '4px', height: '28px', borderRadius: '3px', background: BR }} />
            <h2 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '1.4rem',
              fontWeight: 800, color: TX, margin: 0,
            }}>
              {selectedStatus === 'upcoming' ? 'Upcoming' : selectedStatus === 'live' ? 'Live' : 'Past'} Events
            </h2>
          </div>

          {/* Category filter tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '7px 18px', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.84rem', transition: 'all 0.2s',
                    border: isActive ? `1.5px solid ${BR}` : '1.5px solid #ddd',
                    background: isActive ? BR : 'transparent',
                    color: isActive ? '#fff' : TX_MUTED,
                  }}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              );
            })}
          </div>

          {/* Event cards grid */}
          {displayedEvents.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              {displayedEvents.map((evt) => (
                <div
                  key={evt._id}
                  style={{
                    borderRadius: '16px', border: '1px solid #e8dfd4',
                    background: BG_CARD, overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform  = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow  = '0 12px 28px rgba(166,124,82,0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Banner image */}
                  <Link to={`/events/${evt._id}`} style={{ display: 'block', position: 'relative', paddingBottom: '58%', background: '#f0e8df', overflow: 'hidden' }}>
                    {evt.bannerImage ? (
                      <img
                        src={evt.bannerImage}
                        alt={evt.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(166,124,82,0.3)', fontSize: '2.5rem' }}>
                        <i className="bi bi-calendar-event" />
                      </div>
                    )}
                  </Link>

                  {/* Card body */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Category badge */}
                    <span style={{
                      alignSelf: 'flex-start', fontSize: '0.68rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      padding: '3px 10px', borderRadius: '4px',
                      background: 'rgba(166,124,82,0.1)', color: BR,
                      marginBottom: '10px',
                    }}>
                      {evt.category || 'Event'}
                    </span>

                    {/* Title */}
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', fontWeight: 800, color: TX, margin: '0 0 10px', lineHeight: 1.35 }}>
                      <Link to={`/events/${evt._id}`} style={{ color: TX, textDecoration: 'none' }}>{evt.title}</Link>
                      {!evt.isPublic && isAdmin && (
                        <span style={{ fontSize: '0.7rem', marginLeft: '6px', color: '#c0392b' }}>🔒 Private</span>
                      )}
                    </h3>

                    {/* Date + Location */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: TX_MUTED }}>
                        <i className="bi bi-calendar3" style={{ color: BR }} />
                        {new Date(evt.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: TX_MUTED }}>
                        <i className="bi bi-geo-alt-fill" style={{ color: BR }} />
                        {evt.location || 'SVNIT Surat'}
                      </div>
                    </div>

                    {/* Short description */}
                    {evt.shortDescription && (
                      <p style={{ fontSize: '0.82rem', color: TX_MUTED, lineHeight: 1.5, marginBottom: '14px', flex: 1,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {evt.shortDescription}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                      <Link to={`/events/${evt._id}`} style={{
                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        gap: '5px', padding: '8px 14px', borderRadius: '20px',
                        border: '1.5px solid #ddd', color: TX_MUTED, background: 'transparent',
                        fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
                      }}>
                        View Details <i className="bi bi-arrow-right" />
                      </Link>
                      {evt.isPublic && (
                        evt.hasMainForm && evt.mainFormSubId ? (
                          <Link to={`/register/${evt.mainFormSubId}`} style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            gap: '5px', padding: '8px 14px', borderRadius: '20px',
                            background: BR, border: `1.5px solid ${BR}`, color: '#fff',
                            fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                          }}>
                            Register <i className="bi bi-pencil-square" />
                          </Link>
                        ) : evt.registrationLink ? (
                          <a href={evt.registrationLink} target="_blank" rel="noopener noreferrer" style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            gap: '5px', padding: '8px 14px', borderRadius: '20px',
                            background: BR, border: `1.5px solid ${BR}`, color: '#fff',
                            fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                          }}>
                            Register <i className="bi bi-box-arrow-up-right" />
                          </a>
                        ) : (
                          <Link to={`/events/${evt._id}/register`} style={{
                            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            gap: '5px', padding: '8px 14px', borderRadius: '20px',
                            background: BR, border: `1.5px solid ${BR}`, color: '#fff',
                            fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
                          }}>
                            Register <i className="bi bi-pencil-square" />
                          </Link>
                        )
                      )}
                    </div>

                    {/* Admin controls */}
                    {isAdmin && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0e8df', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: TX_MUTED }}>Status:</span>
                          <select
                            value={evt.type}
                            onChange={(e) => handleStatusChange(evt._id, e.target.value)}
                            style={{
                              fontSize: '0.75rem', padding: '3px 8px', borderRadius: '5px',
                              border: `1.5px solid ${BR}`, background: 'transparent',
                              color: TX, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="past">Past</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <Link to={`/events/edit/${evt._id}`} style={{
                            flex: 1, padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem',
                            fontWeight: 700, textDecoration: 'none', textAlign: 'center',
                            border: `1px solid ${BR}`, color: BR, background: 'transparent',
                          }}>
                            ✏ Edit
                          </Link>
                          <button onClick={() => handleToggleVisibility(evt._id)} style={{
                            flex: 1, padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem',
                            fontWeight: 700, border: '1px solid #e67e22', color: '#e67e22',
                            background: 'transparent', cursor: 'pointer',
                          }}>
                            {evt.isPublic ? '🔒 Private' : '🌐 Public'}
                          </button>
                          <button onClick={() => handleDeleteEvent(evt._id)} style={{
                            flex: 1, padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem',
                            fontWeight: 700, border: '1px solid #c0392b', color: '#c0392b',
                            background: 'transparent', cursor: 'pointer',
                          }}>
                            ✕ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              border: '1.5px dashed #ddd', borderRadius: '16px',
              color: TX_MUTED, fontSize: '0.95rem', fontStyle: 'italic',
            }}>
              <i className="bi bi-calendar-x" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px', opacity: 0.4 }} />
              No {selectedCategory !== 'all' ? `${selectedCategory} ` : ''}events found in{' '}
              {selectedStatus} category.
            </div>
          )}
        </>
      )}
    </div>
  );
}

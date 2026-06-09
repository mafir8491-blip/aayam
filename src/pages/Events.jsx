import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Events() {
  const [data, setData] = useState({
    events: [],
    liveEvents: [],
    upcomingEvents: [],
    pastEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState(null); // null, 'upcoming', 'live', 'past'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Admin Add Event Form States
  const [type, setType] = useState('upcoming');
  const [category, setCategory] = useState('Technical');
  const [location, setLocation] = useState('SVNIT Surat');
  const [title, setTitle] = useState('');
  const [customDetails, setCustomDetails] = useState([]);
  const [actualDesc, setActualDesc] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [registrationLink, setRegistrationLink] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/events');
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisibility = async (evtId) => {
    try {
      const res = await fetch(`/api/events/toggle-visibility/${evtId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to toggle visibility');
      alert('Event visibility updated!');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveToPast = async (evtId) => {
    if (!confirm('Are you sure you want to move this event to past events?')) return;
    try {
      const res = await fetch(`/api/events/move-to-past/${evtId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to move event');
      alert('Event moved to past!');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (evtId) => {
    if (!confirm('Are you sure you want to permanently delete this event, all its sub-events, and all registrations? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/events/delete/${evtId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete event');
      alert('Event deleted successfully.');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (evtId, newStatus) => {
    try {
      const res = await fetch(`/api/events/change-status/${evtId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to change status');
      alert('Event status updated!');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const handleAddCustomDetail = () => {
    setCustomDetails([...customDetails, { key: '', value: '' }]);
  };

  const handleCustomDetailChange = (index, field, value) => {
    const updated = [...customDetails];
    updated[index][field] = value;
    setCustomDetails(updated);
  };

  const handleRemoveCustomDetail = (index) => {
    setCustomDetails(customDetails.filter((_, i) => i !== index));
  };

  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile) {
      alert('Please upload a banner image');
      return;
    }

    // Combine metadata into shortDescription
    let combinedShortDesc = `Category: ${category} | Location: ${location}`;
    customDetails.forEach((detail) => {
      if (detail.key.trim()) {
        combinedShortDesc += ` | Detail: ${detail.key.trim()}:${detail.value.trim()}`;
      }
    });
    combinedShortDesc += ` | ${actualDesc.trim()}`;

    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title);
    formData.append('shortDescription', combinedShortDesc);
    formData.append('description', description);
    formData.append('about', about);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('bannerImage', bannerFile);
    formData.append('registrationLink', registrationLink);
    formData.append('isPublic', 'true');

    try {
      const res = await fetch('/api/events/add', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to add event');
      } else {
        alert('Event added successfully!');
        // Reset form
        setTitle('');
        setActualDesc('');
        setDescription('');
        setAbout('');
        setStartDate('');
        setEndDate('');
        setBannerFile(null);
        setRegistrationLink('');
        setCustomDetails([]);
        fetchData();
      }
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
        <p className="mt-3 text-muted">Retrieving Events Portfolio...</p>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  // Filter logic based on status and category
  let displayedEvents = [];
  if (selectedStatus === 'upcoming') {
    displayedEvents = data.upcomingEvents || [];
  } else if (selectedStatus === 'live') {
    displayedEvents = data.liveEvents || [];
  } else if (selectedStatus === 'past') {
    displayedEvents = data.pastEvents || [];
  }

  if (selectedCategory !== 'all') {
    displayedEvents = displayedEvents.filter((evt) => evt.category === selectedCategory);
  }

  return (
    <div className="container py-5">
      {/* Breadcrumbs */}
      <nav className="events-breadcrumb mb-4">
        <Link to="/" style={{ color: 'var(--br)', textDecoration: 'none' }}>
          <i className="bi bi-house-door-fill me-1"></i> Home
        </Link>{' '}
        / <span style={{ color: 'var(--tx)' }}>Events</span>
      </nav>

      <div className="page-header text-center mb-5">
        <div className="section-label">Our Events</div>
        <h1 className="page-title" style={{ fontFamily: "var(--font-display, serif)", color: 'var(--br)' }}>Events</h1>
        <p className="page-subtitle text-muted">Select a status below to explore our exciting tech, cultural, sports, and workshop events.</p>
      </div>

      {/* Admin form unified block */}
      {isAdmin && (
        <details className="admin-add-form mb-5" data-aos="fade-up">
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--br)', listStyle: 'none', outline: 'none', padding: '4px 0' }}>
            ➕ Add New Event
          </summary>
          <form onSubmit={handleAddEventSubmit} className="mt-4">
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>Event Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="upcoming">Upcoming Event</option>
                  <option value="live">Live Event</option>
                  <option value="past">Past Event</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Event Title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>Location</label>
              <input
                type="text"
                placeholder="Location (e.g. SVNIT Surat)"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Dynamic Custom Details Builder */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>Custom Event Details (optional)</label>
              <div className="d-flex flex-column gap-2 mb-2">
                {customDetails.map((detail, idx) => (
                  <div key={idx} className="d-flex gap-2 align-items-center">
                    <input
                      type="text"
                      placeholder="Detail Key (e.g. Fee)"
                      className="form-control"
                      value={detail.key}
                      onChange={(e) => handleCustomDetailChange(idx, 'key', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Detail Value (e.g. Free)"
                      className="form-control"
                      value={detail.value}
                      onChange={(e) => handleCustomDetailChange(idx, 'value', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomDetail(idx)}
                      className="btn-admin-danger"
                      style={{ width: '38px', height: '38px', padding: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleAddCustomDetail}
                style={{ borderColor: 'var(--br)', color: 'var(--br)' }}
              >
                + Add Custom Detail
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>Short Description Summary</label>
              <textarea
                placeholder="Enter short summary description"
                className="form-control"
                rows="2"
                value={actualDesc}
                onChange={(e) => setActualDesc(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>Full Description</label>
              <textarea
                placeholder="Full Description"
                className="form-control"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--br)' }}>About Event (Rich text/HTML)</label>
              <textarea
                placeholder="About the event (HTML supported)"
                className="form-control"
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              ></textarea>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--br)' }}>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--br)' }}>End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--br)' }}>Banner Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="url"
                placeholder="Registration Link (optional, e.g. https://forms.gle/...)"
                className="form-control"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-register w-100">
              ➕ Add Event
            </button>
          </form>
        </details>
      )}

      {/* Status Selection Boxes */}
      <div className="status-selection-container" data-aos="fade-up">
        <div
          className={`status-box ${selectedStatus === 'upcoming' ? 'active' : ''}`}
          id="box-upcoming"
          onClick={() => {
            setSelectedStatus('upcoming');
            setSelectedCategory('all');
          }}
        >
          <div className="status-box-icon">
            <i className="bi bi-calendar2-week"></i>
          </div>
          <div className="status-box-content">
            <h3 className="status-box-title">Upcoming Events</h3>
            <p className="status-box-count">{(data.upcomingEvents || []).length} Events</p>
          </div>
          <div className="status-box-arrow">
            <i className="bi bi-chevron-right"></i>
          </div>
        </div>

        <div
          className={`status-box ${selectedStatus === 'live' ? 'active' : ''}`}
          id="box-live"
          onClick={() => {
            setSelectedStatus('live');
            setSelectedCategory('all');
          }}
        >
          <div className="status-box-icon live-pulse-icon">
            <i className="bi bi-play-circle-fill"></i>
          </div>
          <div className="status-box-content">
            <h3 className="status-box-title">Live Events</h3>
            <p className="status-box-count">{(data.liveEvents || []).length} Events</p>
          </div>
          <div className="status-box-arrow">
            <i className="bi bi-chevron-right"></i>
          </div>
        </div>

        <div
          className={`status-box ${selectedStatus === 'past' ? 'active' : ''}`}
          id="box-past"
          onClick={() => {
            setSelectedStatus('past');
            setSelectedCategory('all');
          }}
        >
          <div className="status-box-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="status-box-content">
            <h3 className="status-box-title">Past Events</h3>
            <p className="status-box-count">{(data.pastEvents || []).length} Events</p>
          </div>
          <div className="status-box-arrow">
            <i className="bi bi-chevron-right"></i>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      {selectedStatus && (
        <div className="events-filter-bar d-flex justify-content-center gap-2 mb-4 flex-wrap">
          {['all', 'Technical', 'Cultural', 'Sports', 'Workshop'].map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Event Cards Grid */}
      {selectedStatus && (
        <div className="row g-4 justify-content-center">
          {displayedEvents.length > 0 ? (
            displayedEvents.map((evt) => (
              <div className="col-xl-3 col-lg-4 col-md-6 d-flex" key={evt._id}>
                <div className="grid-event-card flex-fill d-flex flex-column">
                  <Link to={`/events/${evt._id}`} className="card-img-wrap">
                    {evt.bannerImage ? (
                      <img
                        src={evt.bannerImage}
                        className="card-img"
                        alt={evt.title}
                      />
                    ) : (
                      <div className="card-img-placeholder">
                        <i className="bi bi-calendar-event"></i>
                      </div>
                    )}
                  </Link>

                  <div className="card-body-wrap">
                    <span className="category-badge">{evt.category || 'Event'}</span>
                    <h3 className="card-title">
                      <Link to={`/events/${evt._id}`}>{evt.title}</Link>
                      {!evt.isPublic && isAdmin && (
                        <span className="badge-private">🔒 Private</span>
                      )}
                    </h3>
                    <div className="card-info-row">
                      <div className="info-item">
                        <i className="bi bi-calendar3 info-icon"></i>
                        <span>
                          {new Date(evt.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="info-item">
                        <i className="bi bi-geo-alt-fill info-icon"></i>
                        <span>{evt.location || 'SVNIT Surat'}</span>
                      </div>
                    </div>
                    <p className="ev-desc-summary">{evt.shortDescription || ''}</p>

                    <div className="card-action-btns">
                      <Link to={`/events/${evt._id}`} className="btn-details-custom">
                        View Details <i className="bi bi-arrow-right"></i>
                      </Link>
                      {evt.isPublic && (
                        evt.hasMainForm && evt.mainFormSubId ? (
                          <Link to={`/register/${evt.mainFormSubId}`} className="btn-register-custom">
                            Register <i className="bi bi-pencil-square"></i>
                          </Link>
                        ) : evt.registrationLink ? (
                          <a href={evt.registrationLink} target="_blank" rel="noopener noreferrer" className="btn-register-custom">
                            Register <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        ) : (
                          <Link to={`/events/${evt._id}/register`} className="btn-register-custom">
                            Register <i className="bi bi-pencil-square"></i>
                          </Link>
                        )
                      )}
                    </div>

                    {isAdmin && (
                      <div className="card-admin-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', width: '100%', gap: '4px', marginBottom: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--tx-muted)', marginRight: '4px' }}>Status:</span>
                          <select
                            value={evt.type}
                            onChange={(e) => handleStatusChange(evt._id, e.target.value)}
                            className="form-control-custom"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              height: 'auto',
                              borderRadius: '4px',
                              border: '1.5px solid var(--br)',
                              background: 'transparent',
                              color: 'var(--text-theme)',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="past">Past</option>
                          </select>
                        </div>
                        <Link to={`/events/edit/${evt._id}`} className="btn-admin-action" style={{ flex: 1, textDecoration: 'none' }}>
                          ✏ Edit
                        </Link>
                        <button
                          onClick={() => handleToggleVisibility(evt._id)}
                          className="btn-admin-action btn-warn"
                          style={{ flex: 1 }}
                        >
                          {evt.isPublic ? '🔒 Private' : '🌐 Public'}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt._id)}
                          className="btn-admin-action btn-danger"
                          style={{ flex: 1 }}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted py-5">
              No {selectedCategory === 'all' ? '' : `${selectedCategory} `}events found in {selectedStatus}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

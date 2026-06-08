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
  const [selectedStatus, setSelectedStatus] = useState(null); // 'upcoming', 'live', 'past'
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
        <details className="admin-add-form mb-5 p-4" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px dashed var(--br)', borderRadius: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--br)' }}>
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
      <div className="status-selection-container d-flex flex-column flex-md-row gap-3 justify-content-center mb-4">
        <div
          className={`status-box flex-fill p-3 d-flex align-items-center justify-content-between cursor-pointer ${selectedStatus === 'upcoming' ? 'active' : ''}`}
          onClick={() => {
            setSelectedStatus('upcoming');
            setSelectedCategory('all');
          }}
          style={{
            background: 'rgba(30, 21, 14, 0.45)',
            border: selectedStatus === 'upcoming' ? '2px solid var(--br)' : '1px solid rgba(166, 124, 82, 0.15)',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="status-box-icon" style={{ fontSize: '1.8rem', color: 'var(--br)' }}>
              <i className="bi bi-calendar2-week"></i>
            </div>
            <div>
              <h3 className="status-box-title h5 mb-0" style={{ color: '#fff' }}>Upcoming Events</h3>
              <p className="status-box-count mb-0 text-muted">{(data.upcomingEvents || []).length} Events</p>
            </div>
          </div>
          <i className="bi bi-chevron-right text-muted"></i>
        </div>

        <div
          className={`status-box flex-fill p-3 d-flex align-items-center justify-content-between cursor-pointer ${selectedStatus === 'live' ? 'active' : ''}`}
          onClick={() => {
            setSelectedStatus('live');
            setSelectedCategory('all');
          }}
          style={{
            background: 'rgba(30, 21, 14, 0.45)',
            border: selectedStatus === 'live' ? '2px solid var(--br)' : '1px solid rgba(166, 124, 82, 0.15)',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="status-box-icon live-pulse-icon" style={{ fontSize: '1.8rem', color: 'var(--br)' }}>
              <i className="bi bi-play-circle-fill"></i>
            </div>
            <div>
              <h3 className="status-box-title h5 mb-0" style={{ color: '#fff' }}>Live Events</h3>
              <p className="status-box-count mb-0 text-muted">{(data.liveEvents || []).length} Events</p>
            </div>
          </div>
          <i className="bi bi-chevron-right text-muted"></i>
        </div>

        <div
          className={`status-box flex-fill p-3 d-flex align-items-center justify-content-between cursor-pointer ${selectedStatus === 'past' ? 'active' : ''}`}
          onClick={() => {
            setSelectedStatus('past');
            setSelectedCategory('all');
          }}
          style={{
            background: 'rgba(30, 21, 14, 0.45)',
            border: selectedStatus === 'past' ? '2px solid var(--br)' : '1px solid rgba(166, 124, 82, 0.15)',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="status-box-icon" style={{ fontSize: '1.8rem', color: 'var(--br)' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div>
              <h3 className="status-box-title h5 mb-0" style={{ color: '#fff' }}>Past Events</h3>
              <p className="status-box-count mb-0 text-muted">{(data.pastEvents || []).length} Events</p>
            </div>
          </div>
          <i className="bi bi-chevron-right text-muted"></i>
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
              style={{
                background: selectedCategory === cat ? 'var(--br)' : 'rgba(30,21,14,0.45)',
                color: selectedCategory === cat ? '#000' : 'var(--tx)',
                border: '1px solid var(--br)',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
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
                <div
                  className="grid-event-card flex-fill d-flex flex-column"
                  style={{
                    background: 'rgba(30, 21, 14, 0.45)',
                    border: '1px solid rgba(166, 124, 82, 0.15)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  <Link to={`/events/${evt._id}`} className="card-img-wrap" style={{ position: 'relative', display: 'block', height: '180px', overflow: 'hidden' }}>
                    {evt.bannerImage ? (
                      <img
                        src={evt.bannerImage}
                        className="card-img"
                        alt={evt.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="card-img-placeholder d-flex align-items-center justify-content-center h-100 text-muted bg-dark">
                        <i className="bi bi-calendar-event" style={{ fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <span
                      className="position-absolute bottom-2 start-2 badge"
                      style={{
                        bottom: '12px',
                        left: '12px',
                        background: 'var(--br)',
                        color: '#120c08',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {evt.category || 'Event'}
                    </span>
                  </Link>

                  <div className="card-body-wrap p-4 d-flex flex-column flex-fill">
                    <h3 className="h5 fw-bold mb-2" style={{ color: '#fff' }}>{evt.title}</h3>
                    <p className="text-muted small flex-fill mb-3">{evt.shortDescription || ''}</p>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="small text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(evt.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <Link to={`/events/${evt._id}`} className="btn-details" style={{ textDecoration: 'none', color: 'var(--br)', fontWeight: 700 }}>
                        Details <i className="bi bi-arrow-right-short"></i>
                      </Link>
                    </div>
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

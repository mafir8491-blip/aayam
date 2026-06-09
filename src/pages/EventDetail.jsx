import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Slideshow State
  const [activeSlide, setActiveSlide] = useState(0);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  // Active Schedule Modal State
  const [activeModalCard, setActiveModalCard] = useState(null);

  // Admin Meta Addition Form States
  const [speakerName, setSpeakerName] = useState('');
  const [speakerDetail, setSpeakerDetail] = useState('');
  const [speakerFile, setSpeakerFile] = useState(null);

  const [galleryName, setGalleryName] = useState('');
  const [galleryDetail, setGalleryDetail] = useState('');
  const [galleryFile, setGalleryFile] = useState(null);

  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');

  const [studCoordName, setStudCoordName] = useState('');
  const [studCoordEmail, setStudCoordEmail] = useState('');

  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docIsPublic, setDocIsPublic] = useState(true);

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to load event details');
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
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.user || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const res = await fetch(`/api/events/toggle-visibility/${id}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to toggle visibility');
      alert('Event visibility updated!');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to permanently delete this event, all its sub-events, and all registrations? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/events/delete/${id}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete event');
      alert('Event deleted successfully.');
      navigate('/events');
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    fetchUser();
  }, [id]);

  // Slideshow Actions
  const slideMove = (offset, total) => {
    setActiveSlide((prev) => {
      let next = prev + offset;
      if (next < 0) next = total - 1;
      if (next >= total) next = 0;
      return next;
    });
  };

  // Submit Review (Past Events)
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reviewName, message: reviewMessage }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to submit review');
      } else {
        alert('Review submitted successfully!');
        setReviewName('');
        setReviewMessage('');
        fetchEventDetails();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/events/${id}/reviews/${reviewId}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Document
  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!docFile) return;
    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('document', docFile);
    formData.append('isPublic', docIsPublic ? 'on' : 'off');

    try {
      const res = await fetch(`/api/events/${id}/documents`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Brochure upload failed');
      alert('Brochure uploaded successfully!');
      setDocTitle('');
      setDocFile(null);
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDoc = async (index) => {
    if (!confirm('Delete this brochure?')) return;
    try {
      const res = await fetch(`/api/events/${id}/documents/${index}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Coordinator
  const handleAddCoordinator = async (e, type) => {
    e.preventDefault();
    const endpoint = type === 'student' ? 'student-coordinators' : 'conducted-by';
    const payload = type === 'student' 
      ? { name: studCoordName, email: studCoordEmail }
      : { name: coordName, email: coordEmail };

    try {
      const res = await fetch(`/api/events/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add coordinator');
      if (type === 'student') {
        setStudCoordName('');
        setStudCoordEmail('');
      } else {
        setCoordName('');
        setCoordEmail('');
      }
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCoordinator = async (index, type) => {
    if (!confirm('Remove coordinator?')) return;
    const endpoint = type === 'student' ? 'student-coordinators' : 'conducted-by';
    try {
      const res = await fetch(`/api/events/${id}/${endpoint}/${index}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Remove failed');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Speaker
  const handleAddSpeaker = async (e) => {
    e.preventDefault();
    if (!speakerFile) return;
    const formData = new FormData();
    formData.append('speakerName', speakerName);
    formData.append('detail', speakerDetail);
    formData.append('speakerImages', speakerFile);

    try {
      const res = await fetch(`/api/events/${id}/speakers`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Speaker upload failed');
      setSpeakerName('');
      setSpeakerDetail('');
      setSpeakerFile(null);
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSpeaker = async (speakerId) => {
    if (!confirm('Remove this speaker?')) return;
    try {
      const res = await fetch(`/api/events/${id}/speakers/${speakerId}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Gallery Image
  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!galleryFile) return;
    const formData = new FormData();
    formData.append('speakerName', galleryName); // uses same speakerName fields for meta on backend
    formData.append('detail', galleryDetail);
    formData.append('galleryImages', galleryFile);

    try {
      const res = await fetch(`/api/events/${id}/gallery`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Gallery image upload failed');
      setGalleryName('');
      setGalleryDetail('');
      setGalleryFile(null);
      fetchEventDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteGallery = async (imageId) => {
    if (!confirm('Delete this gallery image?')) return;
    try {
      const res = await fetch(`/api/events/${id}/gallery/${imageId}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchEventDetails();
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
        <p className="mt-3 text-muted">Retrieving Event Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Error Loading Event</h3>
        <p className="text-muted">{error || 'Event not found'}</p>
        <Link to="/events" className="btn-details">
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const { event, isPast, reviews, subEvents, groupedSubEvents, mainRegSub } = data;
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  // Slides
  const allSlides = [];
  if (event.bannerImage) allSlides.push(event.bannerImage);
  if (event.posterSlides && event.posterSlides.length > 0) {
    allSlides.push(...event.posterSlides);
  }

  const hasSubEvents = subEvents && subEvents.length > 0;
  const hasExternalLink = event.registrationLink && event.registrationLink.trim() !== '';
  const showRegSection = !isPast || isAdmin;

  return (
    <div className="container py-5">
      {/* Admin action bar */}
      {isAdmin && (
        <div className="admin-action-bar p-3 mb-4 d-flex align-items-center gap-3 flex-wrap" style={{ background: 'rgba(30, 21, 14, 0.65)', border: '1px solid var(--br)', borderRadius: '12px' }}>
          <Link to={`/events/edit/${event._id}`} className="btn btn-outline-warning btn-sm d-flex align-items-center gap-2" style={{ textDecoration: 'none', borderColor: 'var(--br)', color: 'var(--br)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
            <i className="bi bi-pencil-square"></i> Edit Event
          </Link>
          <button
            onClick={handleToggleVisibility}
            className={`btn btn-sm ${event.isPublic === false ? 'btn-success' : 'btn-warning'} d-flex align-items-center gap-2`}
            style={{ fontSize: '0.88rem', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, color: event.isPublic === false ? '#fff' : '#000' }}
          >
            {event.isPublic === false ? '🌐 Make Public' : '🔒 Make Private'}
          </button>
          <button
            onClick={handleDeleteEvent}
            className="btn btn-danger btn-sm ms-md-auto d-flex align-items-center gap-2"
            style={{ fontSize: '0.88rem', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
          >
            🗑 Delete Event
          </button>
        </div>
      )}

      <div className="event-detail-content">
        {/* POSTER SLIDESHOW */}
        {allSlides.length > 0 && (
          <div className="slideshow-wrap mb-4 position-relative" style={{ height: '360px', overflow: 'hidden', borderRadius: '16px' }}>
            <div className="slideshow-track h-100">
              {allSlides.map((slide, si) => (
                <div
                  className="slide-item h-100"
                  key={si}
                  style={{ display: si === activeSlide ? 'block' : 'none', position: 'relative' }}
                >
                  <img
                    src={slide}
                    alt={`${event.title} poster ${si + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {si === 0 && isPast && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      <span className="badge bg-danger text-uppercase px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>
                        Completed
                      </span>
                    </div>
                  )}
                  {si === 0 && event.isPublic === false && isAdmin && (
                    <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                      <span className="badge bg-warning text-dark text-uppercase px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>
                        🔒 Private — Admin View
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {allSlides.length > 1 && (
              <>
                <button
                  className="btn btn-dark btn-sm position-absolute start-0 top-50 translate-middle-y"
                  onClick={() => slideMove(-1, allSlides.length)}
                  style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '0 8px 8px 0', fontSize: '1.5rem' }}
                >
                  &#8249;
                </button>
                <button
                  className="btn btn-dark btn-sm position-absolute end-0 top-50 translate-middle-y"
                  onClick={() => slideMove(1, allSlides.length)}
                  style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px 0 0 8px', fontSize: '1.5rem' }}
                >
                  &#8250;
                </button>
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
                  {allSlides.map((_, si) => (
                    <span
                      key={si}
                      onClick={() => setActiveSlide(si)}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: si === activeSlide ? 'var(--br)' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                      }}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Title & metadata */}
        <div className="mb-4">
          <h1 className="fw-bold mb-3" style={{ fontFamily: "var(--font-display, serif)", color: 'var(--br)' }}>{event.title}</h1>

          {event.startDate && event.endDate && (
            <div className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-3" style={{ background: 'rgba(166,124,82,0.08)', border: '1px solid rgba(166,124,82,0.2)', borderRadius: '20px' }}>
              <i className="bi bi-calendar3" style={{ color: 'var(--br)' }}></i>
              <span className="small fw-semibold text-muted">
                {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) ===
                new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : `${new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </span>
            </div>
          )}

          {event.customDetails && event.customDetails.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {event.customDetails.map((detail, idx) => (
                <div key={idx} className="d-inline-flex align-items-center gap-1 px-3 py-1" style={{ background: 'rgba(166,124,82,0.05)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '20px' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--br)' }}>{detail.key}:</strong>
                  <span className="small text-muted" style={{ fontSize: '0.8rem' }}>{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="event-description-body mb-4" dangerouslySetInnerHTML={{ __html: event.description }}></div>

          {event.about && (
            <div className="p-3 mb-4 border-start border-3" style={{ borderColor: 'var(--br)', background: 'rgba(166,124,82,0.05)', borderRadius: '0 8px 8px 0' }}>
              <div dangerouslySetInnerHTML={{ __html: event.about }}></div>
            </div>
          )}
        </div>

        {/* EVENT SCHEDULE CARDS */}
        {event.scheduleCards && event.scheduleCards.length > 0 && (
          <div className="detail-section mb-5">
            <h2 className="detail-section-title mb-3">
              <i className="bi bi-calendar2-week me-2" style={{ color: 'var(--br)' }}></i> Event Schedule
            </h2>
            <div className="d-flex gap-2 flex-wrap">
              {event.scheduleCards.slice().sort((a,b) => a.order - b.order).map((card) => (
                <button
                  key={card._id}
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() => setActiveModalCard(card)}
                  style={{ borderColor: 'var(--br)', color: 'var(--br)', background: 'rgba(30, 21, 14, 0.45)' }}
                >
                  <i className="bi bi-calendar-week"></i>
                  {card.heading}
                  <i className="bi bi-chevron-right small text-muted"></i>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Card Modal dialog */}
        {activeModalCard && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setActiveModalCard(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content text-white" style={{ background: '#1c1510', border: '1px solid var(--br)' }}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold" style={{ color: 'var(--br)' }}>
                    <i className="bi bi-calendar2-week me-2"></i>
                    {activeModalCard.heading}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setActiveModalCard(null)}></button>
                </div>
                <div className="modal-body">
                  {activeModalCard.body && (
                    <div className="mb-4 small text-muted" dangerouslySetInnerHTML={{ __html: activeModalCard.body }}></div>
                  )}
                  {activeModalCard.tableData && activeModalCard.tableData.columns && activeModalCard.tableData.columns.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-dark small">
                        <thead>
                          <tr>
                            {activeModalCard.tableData.columns.map((col, idx) => (
                              <th key={idx}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(activeModalCard.tableData.rows || []).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {activeModalCard.tableData.columns.map((_, cIdx) => (
                                <td key={cIdx}>{row[cIdx] || ''}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BROCHURES & DOCUMENTS */}
        {((event.documents && event.documents.length > 0) || isAdmin) && (
          <div className="detail-section mb-5">
            <h2 className="detail-section-title mb-3">Event Brochure</h2>
            <div className="d-flex flex-column gap-2">
              {event.documents && event.documents.length > 0 ? (
                event.documents.map((doc, idx) => {
                  if (doc.isPublic || isAdmin) {
                    return (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <div>
                          <div className="fw-semibold text-white">{doc.title}</div>
                          {!doc.isPublic && isAdmin && (
                            <span className="badge bg-warning text-dark text-uppercase" style={{ fontSize: '0.65rem' }}>Admin Only</span>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <a
                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.file)}&embedded=false`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary btn-sm"
                            style={{ borderColor: 'var(--br)', color: 'var(--br)' }}
                          >
                            👁 View
                          </a>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteDoc(idx)}
                              className="btn btn-danger btn-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                <p className="text-muted small">No brochures uploaded yet.</p>
              )}
            </div>
            {isAdmin && (
              <form onSubmit={handleAddDoc} className="mt-3 p-3" style={{ border: '1px dashed rgba(166,124,82,0.3)', borderRadius: '8px' }}>
                <div className="row g-2">
                  <div className="col-md-5">
                    <input
                      type="text"
                      placeholder="Brochure Title"
                      className="form-control form-control-sm"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) => setDocFile(e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <div className="form-check form-check-inline mt-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isPublicCheck"
                        checked={docIsPublic}
                        onChange={(e) => setDocIsPublic(e.target.checked)}
                      />
                      <label className="form-check-label text-muted small" htmlFor="isPublicCheck">Public</label>
                    </div>
                    <button type="submit" className="btn btn-secondary btn-sm w-100 mt-1" style={{ background: 'var(--br)', color: '#000', border: 'none' }}>
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* REGISTRATION */}
        {showRegSection && (
          <div className="detail-section mb-5 p-4" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166,124,82,0.25)', borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3 border-bottom pb-2" style={{ borderColor: 'rgba(166,124,82,0.18)' }}>
              <h2 className="detail-section-title m-0 border-0 p-0">Registration</h2>
              {isAdmin && (
                <div className="d-flex gap-2 flex-wrap">
                  {mainRegSub && (
                    <>
                      <Link
                        to={`/admin/subevents/${mainRegSub._id}/registrations`}
                        className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <i className="bi bi-people"></i> View Regs ({mainRegSub.registrationCount || 0})
                      </Link>
                      <a
                        href={`/api/admin/subevents/${mainRegSub._id}/registrations/export`}
                        className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <i className="bi bi-download"></i> Download CSV
                      </a>
                    </>
                  )}
                  {hasSubEvents && (
                    <a
                      href={`/api/admin/events/${event._id}/registrations/export-all`}
                      className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      <i className="bi bi-file-earmark-spreadsheet"></i> Export All CSV
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Case 1: Has custom form or external form and NO sub-events */}
            {((mainRegSub || hasExternalLink) && !hasSubEvents) && (
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-3" style={{ background: 'rgba(166,124,82,0.05)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '8px' }}>
                <div>
                  <div className="fw-bold mb-1">
                    {mainRegSub ? (
                      <span><i className="bi bi-pencil-square me-2" style={{ color: 'var(--br)' }}></i>Fill Registration Form</span>
                    ) : (
                      <span><i className="bi bi-link-45deg me-2" style={{ color: 'var(--br)' }}></i>Register via External Form</span>
                    )}
                  </div>
                  <span className="small text-muted">{mainRegSub ? 'Fill the secure registration form directly on this site' : 'Registration link opens in a new tab'}</span>
                </div>
                {mainRegSub ? (
                  <Link to={`/register/${mainRegSub._id}`} className="btn-register">
                    Register Now &rarr;
                  </Link>
                ) : (
                  <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="btn-register">
                    Register Now <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                )}
              </div>
            )}

            {/* Case 2: Event has Sub-Events/Sessions */}
            {hasSubEvents && (
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-3" style={{ background: 'rgba(166,124,82,0.05)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '8px' }}>
                <div>
                  <div className="fw-bold mb-1">
                    <i className="bi bi-calendar-event me-2" style={{ color: 'var(--br)' }}></i>Sessions &amp; Workshops
                  </div>
                  <span className="small text-muted">Select specific sub-events or session tracks to register</span>
                </div>
                <Link to={`/events/${event._id}/register`} className="btn-register">
                  Select Sessions &amp; Register &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* SPEAKERS / CONDUCTORS */}
        {((event.speakerImages && event.speakerImages.length > 0) || isAdmin) && (
          <div className="detail-section mb-5">
            <h2 className="detail-section-title mb-4">Speakers &amp; Conductors</h2>
            <div className="row g-4 justify-content-center">
              {event.speakerImages && event.speakerImages.length > 0 ? (
                event.speakerImages.map((spk) => (
                  <div className="col-lg-3 col-md-4 col-6 text-center" key={spk._id}>
                    <div className="team-member-card p-3 h-100 d-flex flex-column" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '12px' }}>
                      <div className="mb-3 mx-auto" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden' }}>
                        <img src={spk.url} alt={spk.speakerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <h4 className="h6 fw-bold text-white mb-1">{spk.speakerName}</h4>
                      <p className="small text-muted flex-fill mb-2">{spk.detail}</p>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteSpeaker(spk._id)}
                          className="btn btn-danger btn-sm w-100 mt-2"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center text-muted py-4 small">No speakers listed yet.</div>
              )}
            </div>
            {isAdmin && (
              <form onSubmit={handleAddSpeaker} className="mt-4 p-3" style={{ border: '1px dashed rgba(166,124,82,0.3)', borderRadius: '8px' }}>
                <h5 className="mb-3 text-white small fw-bold">➕ Add Speaker</h5>
                <div className="row g-2">
                  <div className="col-md-4">
                    <input
                      type="text"
                      placeholder="Speaker Name"
                      className="form-control form-control-sm"
                      value={speakerName}
                      onChange={(e) => setSpeakerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      placeholder="Title/Details"
                      className="form-control form-control-sm"
                      value={speakerDetail}
                      onChange={(e) => setSpeakerDetail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={(e) => setSpeakerFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary btn-sm mt-3 w-100" style={{ background: 'var(--br)', color: '#000', border: 'none' }}>
                  Upload Speaker Card
                </button>
              </form>
            )}
          </div>
        )}

        {/* EVENT GALLERY PHOTOS */}
        {((event.galleryImages && event.galleryImages.length > 0) || isAdmin) && (
          <div className="detail-section mb-5">
            <h2 className="detail-section-title mb-4">Event Gallery</h2>
            <div className="row g-3">
              {event.galleryImages && event.galleryImages.length > 0 ? (
                event.galleryImages.map((img) => (
                  <div className="col-lg-3 col-md-4 col-6" key={img._id}>
                    <div className="position-relative overflow-hidden" style={{ height: '160px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img
                        src={img.url}
                        alt={img.speakerName || 'Gallery Photo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                      />
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteGallery(img._id)}
                          className="btn btn-danger btn-sm position-absolute top-2 end-2"
                          style={{ top: '8px', right: '8px', zIndex: 10 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center text-muted py-4 small">No photos uploaded yet.</div>
              )}
            </div>
            {isAdmin && (
              <form onSubmit={handleAddGallery} className="mt-4 p-3" style={{ border: '1px dashed rgba(166,124,82,0.3)', borderRadius: '8px' }}>
                <h5 className="mb-3 text-white small fw-bold">➕ Add Gallery Image</h5>
                <div className="row g-2">
                  <div className="col-md-4">
                    <input
                      type="text"
                      placeholder="Photo Caption"
                      className="form-control form-control-sm"
                      value={galleryName}
                      onChange={(e) => setGalleryName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      placeholder="Photo Sub-detail"
                      className="form-control form-control-sm"
                      value={galleryDetail}
                      onChange={(e) => setGalleryDetail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={(e) => setGalleryFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary btn-sm mt-3 w-100" style={{ background: 'var(--br)', color: '#000', border: 'none' }}>
                  Upload Gallery Image
                </button>
              </form>
            )}
          </div>
        )}

        {/* COORDINATORS */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="detail-section h-100">
              <h2 className="detail-section-title">Faculty Conveners</h2>
              {event.conductedBy && event.conductedBy.length > 0 ? (
                event.conductedBy.map((coord, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div>
                      <div className="fw-semibold text-white">{coord.name}</div>
                      <span className="small text-muted">{coord.email}</span>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteCoordinator(idx, 'faculty')} className="btn btn-danger btn-sm">✕</button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted small">No faculty convener listed.</p>
              )}
              {isAdmin && (
                <form onSubmit={(e) => handleAddCoordinator(e, 'faculty')} className="mt-3 p-2 border border-1 border-dashed rounded">
                  <div className="row g-1">
                    <div className="col-5"><input type="text" placeholder="Name" className="form-control form-control-sm" value={coordName} onChange={(e) => setCoordName(e.target.value)} required /></div>
                    <div className="col-5"><input type="email" placeholder="Email" className="form-control form-control-sm" value={coordEmail} onChange={(e) => setCoordEmail(e.target.value)} required /></div>
                    <div className="col-2"><button type="submit" className="btn btn-secondary btn-sm w-100" style={{ background: 'var(--br)', color: '#000', border: 'none' }}>+</button></div>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="detail-section h-100">
              <h2 className="detail-section-title">Student Coordinators</h2>
              {event.studentCoordinators && event.studentCoordinators.length > 0 ? (
                event.studentCoordinators.map((coord, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div>
                      <div className="fw-semibold text-white">{coord.name}</div>
                      <span className="small text-muted">{coord.email}</span>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteCoordinator(idx, 'student')} className="btn btn-danger btn-sm">✕</button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted small">No student coordinators listed.</p>
              )}
              {isAdmin && (
                <form onSubmit={(e) => handleAddCoordinator(e, 'student')} className="mt-3 p-2 border border-1 border-dashed rounded">
                  <div className="row g-1">
                    <div className="col-5"><input type="text" placeholder="Name" className="form-control form-control-sm" value={studCoordName} onChange={(e) => setStudCoordName(e.target.value)} required /></div>
                    <div className="col-5"><input type="email" placeholder="Email" className="form-control form-control-sm" value={studCoordEmail} onChange={(e) => setStudCoordEmail(e.target.value)} required /></div>
                    <div className="col-2"><button type="submit" className="btn btn-secondary btn-sm w-100" style={{ background: 'var(--br)', color: '#000', border: 'none' }}>+</button></div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        {isPast && (
          <div className="detail-section mb-5">
            <h2 className="detail-section-title mb-4">Participant Testimonials</h2>
            <div className="d-flex flex-column gap-3 mb-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-3" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '8px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-white">{rev.name}</strong>
                      <span className="small text-muted">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="mb-0 text-muted small">{rev.message}</p>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="btn btn-danger btn-sm mt-2"
                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      >
                        🗑 Delete Review
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted small">No reviews submitted yet. Be the first to share your experience!</p>
              )}
            </div>

            <form onSubmit={handleAddReview} className="p-3" style={{ background: 'rgba(166, 124, 82, 0.04)', border: '1px solid rgba(166, 124, 82, 0.15)', borderRadius: '12px' }}>
              <h4 className="h6 fw-bold mb-3" style={{ color: 'var(--br)' }}>Add Your Review</h4>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="form-control"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  placeholder="Share your experience or testimonial..."
                  className="form-control"
                  rows="3"
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-register">
                Submit Testimonial
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

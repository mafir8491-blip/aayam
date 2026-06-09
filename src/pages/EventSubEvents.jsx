import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function EventSubEvents() {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Active Schedule Modal State
  const [activeModalCard, setActiveModalCard] = useState(null);

  const fetchSubEvents = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to load sub-events');
      }
      const json = await res.json();
      // If server wants to redirect (e.g. past event redirecting to event detail)
      if (json.redirect) {
        window.location.href = json.redirect;
        return;
      }
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
    fetchSubEvents();
    fetchUser();
  }, [eventId]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving Session Tracks...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Error Loading Sessions</h3>
        <p className="text-muted">{error || 'Session details not found'}</p>
        <Link to={`/events/${eventId}`} className="btn-details">
          &larr; Back to Event
        </Link>
      </div>
    );
  }

  const { event, subEvents, groupedSubEvents } = data;

  return (
    <div className="container py-5" style={{ maxWidth: '860px' }}>
      {/* Back link */}
      <div className="mb-4">
        <Link to={`/events/${event._id}`} className="btn-details" style={{ textDecoration: 'none' }}>
          <i className="bi bi-arrow-left me-1"></i> Back to Event
        </Link>
      </div>

      {/* Header */}
      <div className="page-header text-center mb-5">
        <div className="section-label">{event.title}</div>
        <h1 className="page-title" style={{ fontFamily: "var(--font-display, serif)", color: 'var(--br)' }}>Register for a Session</h1>
        {event.startDate && event.endDate && (
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mt-2" style={{ background: 'rgba(166,124,82,0.08)', border: '1px solid rgba(166,124,82,0.2)', borderRadius: '20px' }}>
            <i className="bi bi-calendar3" style={{ color: 'var(--br)' }}></i>
            <span className="small fw-semibold text-muted">
              {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} &rarr;{' '}
              {new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* EVENT SCHEDULE CARDS */}
      {event.scheduleCards && event.scheduleCards.length > 0 && (
        <div className="mb-5">
          <div className="small fw-bold text-uppercase mb-3" style={{ color: 'var(--br)', letterSpacing: '1.5px' }}>
            <i className="bi bi-calendar-week me-1"></i> Event Schedule
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {event.scheduleCards.map((card) => (
              <button
                key={card._id}
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => setActiveModalCard(card)}
                style={{ borderColor: 'var(--br)', color: 'var(--br)', background: 'rgba(30, 21, 14, 0.45)', borderRadius: '20px', padding: '8px 18px' }}
              >
                <i className="bi bi-calendar-week"></i>
                {card.heading}
                <i className="bi bi-chevron-right small text-muted"></i>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modals */}
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
                  <i className="bi bi-calendar-week me-2"></i>
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

      {/* External Registration Link Info */}
      {event.registrationLink && event.registrationLink.trim() !== '' && (
        <div className="d-flex align-items-center justify-content-between p-3 mb-4 flex-wrap gap-2" style={{ background: 'rgba(166,124,82,0.06)', border: '1px solid rgba(166,124,82,0.2)', borderRadius: '8px' }}>
          <div className="small fw-semibold text-muted">
            <i className="bi bi-link-45deg me-1" style={{ color: 'var(--br)' }}></i> External registration is also open
          </div>
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm"
            style={{ borderColor: 'var(--br)', color: 'var(--br)' }}
          >
            Open Form <i class="bi bi-box-arrow-up-right ms-1"></i>
          </a>
        </div>
      )}

      {/* Sub-events tracks listing */}
      {!subEvents || subEvents.length === 0 ? (
        <div className="text-center p-5 rounded border border-dashed text-muted" style={{ background: 'rgba(166,124,82,0.04)', borderColor: 'var(--br)' }}>
          <div className="fs-1 mb-2">📅</div>
          <p className="mb-0">No sessions available yet. Check back soon!</p>
        </div>
      ) : (
        groupedSubEvents.map((group) => (
          <div key={group.day} className="mb-4">
            {/* Day header */}
            {group.day > 0 && (
              <div className="d-flex align-items-center gap-3 my-4">
                <span className="badge px-3 py-2 text-uppercase" style={{ background: 'linear-gradient(135deg,var(--br),#6b3f1a)', color: '#fff', fontSize: '0.75rem', letterSpacing: '1px' }}>
                  Day {group.day}
                  {group.subEvents[0] && group.subEvents[0].eventDate && (
                    <span> · {new Date(group.subEvents[0].eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  )}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-l)' }}></div>
              </div>
            )}

            {/* List of sub events on this day */}
            <div className="d-flex flex-column gap-3">
              {group.subEvents.map((sub) => {
                const isFull = sub.maxParticipants && sub.registrationCount >= sub.maxParticipants;
                const regOpen = sub.registrationOpen !== false;
                const isClosed = !regOpen;
                const hasExternal = sub.externalRegistrationLink && sub.externalRegistrationLink.trim() !== '';

                return (
                  <div
                    key={sub._id}
                    className="p-3"
                    style={{
                      background: 'rgba(30, 21, 14, 0.45)',
                      border: '1px solid rgba(166, 124, 82, 0.15)',
                      borderRadius: '12px',
                      opacity: (isFull || isClosed) ? 0.75 : 1,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                      <div className="flex-fill">
                        <div className="h5 fw-bold text-white mb-2 d-flex align-items-center flex-wrap gap-2">
                          {sub.title}
                          {isFull && <span className="badge bg-danger small" style={{ fontSize: '0.65rem' }}>FULL</span>}
                          {isClosed && <span className="badge bg-secondary small" style={{ fontSize: '0.65rem' }}>CLOSED</span>}
                        </div>

                        {/* Pills */}
                        <div className="d-flex gap-2 flex-wrap mb-3" style={{ fontSize: '0.72rem' }}>
                          {(sub.startTime || sub.endTime) && (
                            <span className="badge" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#ffd700' }}>
                              <i className="bi bi-clock me-1"></i> {sub.startTime} {sub.endTime && `– ${sub.endTime}`}
                            </span>
                          )}
                          <span className="badge" style={{ background: 'rgba(166,124,82,0.08)', border: '1px solid rgba(166,124,82,0.2)', color: 'var(--br)' }}>
                            <i className={sub.isGroupEvent ? 'bi bi-people me-1' : 'bi bi-person me-1'}></i>
                            {sub.isGroupEvent ? `Team Size: ${sub.minTeamSize}-${sub.maxTeamSize}` : 'Individual'}
                          </span>
                          {sub.maxParticipants && (
                            <span className="badge" style={{ background: 'rgba(166,124,82,0.08)', border: '1px solid rgba(166,124,82,0.2)', color: 'var(--br)' }}>
                              <i className="bi bi-person-check me-1"></i> {sub.registrationCount}/{sub.maxParticipants} filled
                            </span>
                          )}
                          {sub.requirePaymentScreenshot && (
                            <span className="badge" style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.22)', color: '#27ae60' }}>
                              <i className="bi bi-credit-card me-1"></i> Payment Verification Req.
                            </span>
                          )}
                          {hasExternal && (
                            <span className="badge" style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.22)', color: '#27ae60' }}>
                              <i className="bi bi-box-arrow-up-right me-1"></i> External form
                            </span>
                          )}
                          {sub.registrationDeadline && (
                            <span className="badge" style={{ background: isClosed ? 'rgba(192,57,43,0.1)' : 'rgba(201,168,76,0.12)', border: isClosed ? '1px solid rgba(192,57,43,0.28)' : '1px solid rgba(201,168,76,0.35)', color: isClosed ? '#c0392b' : '#ffd700' }}>
                              <i className="bi bi-alarm me-1"></i>
                              {isClosed ? 'Registration Closed' : `Closes ${new Date(sub.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          )}
                        </div>

                        {sub.description && (
                          <div className="small text-muted mb-2">{sub.description}</div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div className="d-flex flex-column gap-2 align-items-end">
                        <div>
                          {isFull || isClosed ? (
                            <button className="btn btn-outline-secondary btn-sm disabled" style={{ opacity: 0.5 }}>
                              <i className="bi bi-lock me-1"></i> {isFull ? 'Full' : 'Closed'}
                            </button>
                          ) : hasExternal ? (
                            <a
                              href={sub.externalRegistrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-register btn-sm"
                              style={{ textDecoration: 'none' }}
                            >
                              Register <i className="bi bi-box-arrow-up-right ms-1"></i>
                            </a>
                          ) : (
                            <Link to={`/register/${sub._id}`} className="btn-register btn-sm" style={{ textDecoration: 'none' }}>
                              Register Now &rarr;
                            </Link>
                          )}
                        </div>
                        {user && (user.role === 'admin' || user.role === 'superadmin') && (
                          <div className="d-flex gap-2">
                            <Link
                              to={`/admin/subevents/${sub._id}/registrations`}
                              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            >
                              <i className="bi bi-people"></i> View Regs ({sub.registrationCount || 0})
                            </Link>
                            <a
                              href={`/api/admin/subevents/${sub._id}/registrations/export`}
                              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            >
                              <i className="bi bi-download"></i> CSV
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity visual bar */}
                    {sub.maxParticipants && (
                      <div className="mt-3">
                        <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${Math.min(100, Math.round((sub.registrationCount / sub.maxParticipants) * 100))}%`,
                              background: isFull ? 'linear-gradient(90deg,#c0392b,#e74c3c)' : 'linear-gradient(90deg,var(--br),var(--gold))',
                            }}
                            aria-valuenow={sub.registrationCount}
                            aria-valuemin="0"
                            aria-valuemax={sub.maxParticipants}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Sub-event Poster slide check */}
                    {sub.posterImage && (
                      <div className="mt-3 text-center border-top pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <img
                          src={sub.posterImage}
                          alt={`${sub.title} Poster`}
                          style={{ maxWidth: '400px', width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

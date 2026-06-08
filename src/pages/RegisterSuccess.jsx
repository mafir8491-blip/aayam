import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';

export default function RegisterSuccess() {
  const { subEventId } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuccessDetails = async () => {
    try {
      const res = await fetch(`/api/register/${subEventId}/success${window.location.search}`);
      if (!res.ok) throw new Error('Failed to load success details');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuccessDetails();
  }, [subEventId]);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Finalizing Registration Status...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Registration Status Unknown</h3>
        <p className="text-muted">{error || 'Session not found'}</p>
        <Link to="/events" className="btn-details">
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const { subEvent, already: alreadyRegistered } = data;
  const isAlready = alreadyRegistered || searchParams.get('already') === 'true';

  return (
    <div className="container py-5">
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '60px 0', textAlign: 'center' }}>
        {/* Success Icon */}
        <div
          className="mb-4 d-flex align-items-center justify-content-center mx-auto"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: isAlready ? 'rgba(243,156,18,0.08)' : 'rgba(39,174,96,0.08)',
            border: isAlready ? '1.5px solid rgba(243,156,18,0.22)' : '1.5px solid rgba(39,174,96,0.22)',
            boxShadow: isAlready ? '0 0 0 8px rgba(243,156,18,0.04)' : '0 0 0 8px rgba(39,174,96,0.04)',
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center text-white"
            style={{
              width: '52px',
              height: '52px',
              background: isAlready ? '#f39c12' : '#27ae60',
              borderRadius: '14px',
              fontSize: '2.2rem',
              boxShadow: isAlready ? '0 6px 16px rgba(243,156,18,0.4)' : '0 6px 16px rgba(39,174,96,0.4)',
            }}
          >
            <i className={isAlready ? 'bi bi-exclamation-triangle' : 'bi bi-check-lg'}></i>
          </div>
        </div>

        <div>
          <div className="section-label mb-2">
            {isAlready ? 'Duplicate Submission' : 'Registration Complete'}
          </div>
          <h1
            className="mb-3 text-white"
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
              fontWeight: 900,
            }}
          >
            {isAlready ? 'Already Registered Successfully!' : "You're Registered!"}
          </h1>

          <p className="text-muted mb-4 small" style={{ lineHeight: 1.8, maxWidth: '440px', margin: '0 auto 28px' }}>
            {isAlready ? (
              <span className="text-warning fw-semibold">
                You have already registered for this event. You cannot submit multiple registrations.
              </span>
            ) : (
              <span>
                Your registration for <strong className="text-white">{subEvent.title}</strong> has been received successfully. It will be reviewed shortly, if anything goes wrong we will inform you.
              </span>
            )}
          </p>
        </div>

        {/* Details Card */}
        <div
          className="p-4 mb-4 text-start"
          style={{
            background: 'rgba(30, 21, 14, 0.45)',
            border: '1px solid rgba(166, 124, 82, 0.15)',
            borderRadius: '12px',
            position: 'relative',
          }}
        >
          {/* Shimmer top bar */}
          <div
            className="w-100"
            style={{
              height: '3px',
              background: 'linear-gradient(90deg,var(--br-deep),var(--br),var(--gold),var(--br-light),var(--br))',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: '12px 12px 0 0',
            }}
          ></div>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--br)', marginBottom: '16px', marginTop: '4px' }}>
            <i className="bi bi-info-circle me-1"></i> Registration Details
          </div>

          {subEvent.eventId && (
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="small text-muted fw-semibold">Event</span>
              <span className="small text-white fw-bold text-end" style={{ maxWidth: '60%' }}>{subEvent.eventId.title}</span>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <span className="small text-muted fw-semibold">Session</span>
            <span className="small text-white fw-bold text-end" style={{ maxWidth: '60%' }}>{subEvent.title}</span>
          </div>

          {(subEvent.dayNumber || subEvent.startTime) && (
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="small text-muted fw-semibold">Schedule</span>
              <span className="small text-white fw-bold">
                {subEvent.dayNumber && `Day ${subEvent.dayNumber}`}
                {subEvent.startTime && ` · ${subEvent.startTime} ${subEvent.endTime ? `– ${subEvent.endTime}` : ''}`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          {subEvent.eventId && (
            <Link
              to={`/events/${subEvent.eventId._id}`}
              className="btn btn-outline-secondary"
              style={{ borderColor: 'var(--br)', color: 'var(--br)', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}
            >
              <i className="bi bi-calendar me-1"></i> View Event
            </Link>
          )}
          <Link
            to="/events"
            className="btn-register"
            style={{ padding: '10px 22px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}

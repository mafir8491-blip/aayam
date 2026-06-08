import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function Register() {
  const { subEventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [subEvent, setSubEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Core Form Fields
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');

  // Custom Form Fields Responses: { fieldId: value }
  const [responses, setResponses] = useState({});

  // Team Members: [ { name, email, phone, responses: { fieldId: value } } ]
  const [members, setMembers] = useState([]);

  // Files
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState('');

  const fetchFormDetails = async () => {
    try {
      const res = await fetch(`/api/register/${subEventId}${window.location.search}`);
      const json = await res.json();
      
      if (!res.ok) {
        if (json.redirect) {
          navigate(json.redirect);
          return;
        }
        throw new Error(json.error || 'Failed to load registration details');
      }

      setSubEvent(json.subEvent);
      
      // Auto-initialize first member if team members enabled
      if (json.subEvent.enableTeamMembers) {
        setMembers([{ name: '', email: '', phone: '', responses: {} }]);
      }
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
        if (json.user) {
          setUser(json.user);
          setParticipantName(json.user.name || '');
          setParticipantEmail(json.user.email || '');
        } else {
          // If not logged in, global guard should have caught it, but fallback redirect just in case
          navigate('/auth');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFormDetails();
    fetchUser();
  }, [subEventId]);

  // Form value changes
  const handleResponseChange = (fieldId, val) => {
    setResponses({ ...responses, [fieldId]: val });
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    const current = responses[fieldId] || [];
    let updated;
    if (checked) {
      updated = [...current, option];
    } else {
      updated = current.filter((o) => o !== option);
    }
    setResponses({ ...responses, [fieldId]: updated });
  };

  // File Field Helper
  const handleFileChange = (fieldId, file) => {
    setResponses({ ...responses, [fieldId]: file });
  };

  // Team Member addition
  const handleAddMember = () => {
    if (members.length >= subEvent.maxTeamSize) return;
    setMembers([...members, { name: '', email: '', phone: '', responses: {} }]);
  };

  const handleRemoveMember = (idx) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, field, value) => {
    const updated = [...members];
    updated[idx][field] = value;
    setMembers(updated);
  };

  const handleMemberResponseChange = (idx, fieldId, value) => {
    const updated = [...members];
    updated[idx].responses[fieldId] = value;
    setMembers(updated);
  };

  // Payment Screenshot helper
  const handlePaymentFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPaymentScreenshot(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (subEvent.requirePaymentScreenshot && !paymentScreenshot) {
      alert('Please upload your payment screenshot.');
      return;
    }

    // Validation checks for team size
    if (subEvent.enableTeamMembers) {
      const filledMembers = members.filter((m) => m.name.trim() !== '');
      const totalTeamSize = filledMembers.length + 1; // leader + members
      if (totalTeamSize < subEvent.minTeamSize || totalTeamSize > subEvent.maxTeamSize) {
        alert(`Team size must be between ${subEvent.minTeamSize} and ${subEvent.maxTeamSize} participants (including you).`);
        return;
      }
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('participantName', participantName);
    formData.append('participantEmail', participantEmail);
    formData.append('participantPhone', participantPhone);

    // Append responses
    Object.entries(responses).forEach(([fieldId, value]) => {
      if (value instanceof File) {
        formData.append(`responses[${fieldId}]`, value);
      } else if (Array.isArray(value)) {
        value.forEach((val) => {
          formData.append(`responses[${fieldId}][]`, val);
        });
      } else {
        formData.append(`responses[${fieldId}]`, value);
      }
    });

    // Append team members
    if (subEvent.enableTeamMembers) {
      members.forEach((m, idx) => {
        formData.append(`members[${idx}][name]`, m.name);
        formData.append(`members[${idx}][email]`, m.email);
        formData.append(`members[${idx}][phone]`, m.phone);
        Object.entries(m.responses).forEach(([fieldId, val]) => {
          formData.append(`members[${idx}][responses][${fieldId}]`, val);
        });
      });
    }

    // Append payment screenshot
    if (subEvent.requirePaymentScreenshot && paymentScreenshot) {
      formData.append('paymentScreenshot', paymentScreenshot);
    }

    try {
      const res = await fetch(`/api/register/${subEventId}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.redirect) {
          navigate(json.redirect);
        } else {
          alert(json.error || 'Failed to submit registration');
        }
      } else {
        navigate(`/register/${subEventId}/success`);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Preparing Form Assets...</p>
      </div>
    );
  }

  if (error || !subEvent) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Error Loading Registration Form</h3>
        <p className="text-muted">{error || 'Session not found'}</p>
        <Link to="/events" className="btn-details">
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const hasPoster = subEvent.posterImage && subEvent.posterImage.trim() !== '';
  const hasQR = subEvent.qrImage && subEvent.qrImage.trim() !== '';
  const isFull = subEvent.maxParticipants && subEvent.registrationCount >= subEvent.maxParticipants;
  const memberFields = (subEvent.formFields || [])
    .filter((f) => f.askForMembers && f.type !== 'file')
    .sort((a, b) => a.order - b.order);

  // Render error codes if query error parameters passed
  const queryErr = searchParams.get('error');
  const errorMsg = queryErr === 'full' ? '⚠ Sorry, registrations for this session are full.'
                 : queryErr === 'payment' ? '⚠ Please upload your payment screenshot.'
                 : queryErr === 'deadline' ? '⚠ Registration for this session has closed (deadline passed).'
                 : queryErr === 'required' ? '⚠ Please fill in all required fields.'
                 : null;

  return (
    <div className="container py-5">
      {/* Back link */}
      <div className="mb-4">
        {subEvent.eventId && (
          <Link to={`/events/${subEvent.eventId._id}/register`} className="btn-details" style={{ textDecoration: 'none' }}>
            <i className="bi bi-arrow-left me-1"></i> Back to Sessions
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="page-header text-center mb-5">
        <div className="section-label">{subEvent.eventId ? subEvent.eventId.title : 'Event Registration'}</div>
        <h1 className="page-title text-white" style={{ fontFamily: "var(--font-display, serif)", color: 'var(--br)' }}>{subEvent.title}</h1>
        {subEvent.description && <p className="page-subtitle text-muted mt-2">{subEvent.description}</p>}

        {(subEvent.startTime || subEvent.eventDate) && (
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mt-3" style={{ background: 'rgba(166,124,82,0.08)', border: '1px solid rgba(166,124,82,0.2)', borderRadius: '20px' }}>
            <i className="bi bi-clock" style={{ color: 'var(--br)' }}></i>
            <span className="small fw-semibold text-muted">
              {subEvent.dayNumber && `Day ${subEvent.dayNumber} · `}
              {subEvent.eventDate && `${new Date(subEvent.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · `}
              {subEvent.startTime} {subEvent.endTime && `– ${subEvent.endTime}`}
            </span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        {/* Error alert banner */}
        {errorMsg && (
          <div className="alert alert-danger p-3 mb-4" style={{ background: 'rgba(192,57,43,0.09)', border: '1px solid rgba(192,57,43,0.24)', color: '#c0392b', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {/* Capacity status block */}
        {subEvent.maxParticipants && (
          <div className="p-3 mb-4" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166, 124, 82, 0.15)', borderRadius: '8px' }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="small text-muted">Spots filled</span>
              <span className="small fw-bold" style={{ color: 'var(--br)' }}>{subEvent.registrationCount}/{subEvent.maxParticipants}</span>
            </div>
            <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(100, Math.round((subEvent.registrationCount / subEvent.maxParticipants) * 100))}%`,
                  background: isFull ? 'linear-gradient(90deg,#c0392b,#e74c3c)' : 'linear-gradient(90deg,var(--br),var(--gold))',
                }}
              ></div>
            </div>
            {isFull && <p className="text-danger small mt-2 fw-semibold mb-0">This session is full. Registrations are closed.</p>}
          </div>
        )}

        {/* Media Block (Poster & QR) */}
        {(hasPoster || hasQR) && (
          <div className="p-4 mb-4 text-center" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '12px' }}>
            {hasPoster && (
              <div className="mb-4">
                <img
                  src={subEvent.posterImage}
                  alt={`${subEvent.title} Poster`}
                  style={{ maxWidth: '400px', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            )}
            {hasQR && (
              <div className="border-top pt-4 mt-3 d-flex flex-column align-items-center">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--br)', marginBottom: '8px' }}>Payment Instructions</div>
                <p className="small text-muted mb-3">Scan the QR code to complete payment, then upload your screenshot receipt below.</p>
                <div className="p-2 bg-white rounded" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  <img src={subEvent.qrImage} alt="Payment QR" style={{ maxWidth: '180px', display: 'block' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {!isFull ? (
          <div className="p-4" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166, 124, 82, 0.25)', borderRadius: '12px' }}>
            <form onSubmit={handleSubmit}>
              {/* Leader/Participant Contact Details */}
              <div className="p-3 mb-4 rounded" style={{ background: 'rgba(166, 124, 82, 0.05)', border: '1px solid rgba(166, 124, 82, 0.16)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--br)', marginBottom: '14px' }}>
                  <i className="bi bi-person-fill me-1"></i>
                  {subEvent.enableTeamMembers ? 'Team Leader Details' : 'Participant Details'}
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control-custom"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Email Address <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control-custom bg-dark text-muted"
                    value={participantEmail}
                    readOnly
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label-custom">Phone Number <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    className="form-control-custom"
                    value={participantPhone}
                    onChange={(e) => setParticipantPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              {/* Custom Form Fields for Leader */}
              {subEvent.formFields && subEvent.formFields.length > 0 && (
                <div className="mb-4">
                  {subEvent.formFields.slice().sort((a,b) => a.order - b.order).map((field) => (
                    <div key={field._id} className="mb-3">
                      <label className="form-label-custom">
                        {field.label}
                        {field.required && <span className="text-danger ms-1">*</span>}
                        {field.askForMembers && subEvent.enableTeamMembers && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--br)', marginLeft: '6px', opacity: 0.8 }}>(asked per member too)</span>
                        )}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          className="form-control-custom"
                          placeholder={field.placeholder || ''}
                          value={responses[field._id] || ''}
                          onChange={(e) => handleResponseChange(field._id, e.target.value)}
                          required={field.required}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          className="form-control-custom"
                          rows="3"
                          placeholder={field.placeholder || ''}
                          value={responses[field._id] || ''}
                          onChange={(e) => handleResponseChange(field._id, e.target.value)}
                          required={field.required}
                        ></textarea>
                      )}

                      {field.type === 'dropdown' && (
                        <select
                          className="form-select"
                          value={responses[field._id] || ''}
                          onChange={(e) => handleResponseChange(field._id, e.target.value)}
                          required={field.required}
                        >
                          <option value="">— Select an option —</option>
                          {field.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="d-flex flex-column gap-2 py-1">
                          {field.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className="d-flex align-items-center gap-2 p-2 border rounded cursor-pointer"
                              style={{
                                borderColor: (responses[field._id] || []).includes(opt) ? 'var(--br)' : 'var(--border-l)',
                                background: (responses[field._id] || []).includes(opt) ? 'rgba(166,124,82,0.06)' : 'transparent',
                              }}
                            >
                              <input
                                type="checkbox"
                                value={opt}
                                checked={(responses[field._id] || []).includes(opt)}
                                onChange={(e) => handleCheckboxChange(field._id, opt, e.target.checked)}
                                style={{ accentColor: 'var(--br)' }}
                              />
                              <span className="small text-white">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === 'file' && (
                        <div
                          className="border border-dashed rounded p-3 text-center cursor-pointer"
                          style={{ borderColor: 'var(--br)' }}
                          onClick={() => document.getElementById(`file-${field._id}`).click()}
                        >
                          <i className="bi bi-paperclip fs-4 text-muted"></i>
                          <div className="small text-muted mt-1">Click to upload file</div>
                          <input
                            type="file"
                            id={`file-${field._id}`}
                            className="d-none"
                            onChange={(e) => handleFileChange(field._id, e.target.files[0])}
                            required={field.required}
                          />
                          {responses[field._id] && (
                            <div className="small text-white mt-2 fw-semibold">
                              Selected: {responses[field._id].name}
                            </div>
                          )}
                        </div>
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="form-control-custom"
                          value={responses[field._id] || ''}
                          onChange={(e) => handleResponseChange(field._id, e.target.value)}
                          required={field.required}
                        />
                      )}

                      {field.type === 'time' && (
                        <input
                          type="time"
                          className="form-control-custom"
                          value={responses[field._id] || ''}
                          onChange={(e) => handleResponseChange(field._id, e.target.value)}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Team Members List (If enabled) */}
              {subEvent.enableTeamMembers && (
                <div className="border-top pt-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-label-custom mb-0">
                      <i className="bi bi-people me-1"></i> Team Members
                      <span className="small text-muted ms-2">({subEvent.minTeamSize}-{subEvent.maxTeamSize} total members)</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {members.map((member, idx) => (
                      <div key={idx} className="border p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(166,124,82,0.2)' }}>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                          <span className="fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: 'var(--br)', letterSpacing: '1px' }}>
                            Member {idx + 1}
                          </span>
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                            onClick={() => handleRemoveMember(idx)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mb-2">
                          <label className="form-label-custom">Full Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            placeholder="Name"
                            className="form-control-custom form-control-sm"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            required
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label-custom">Email Address <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            placeholder="email@example.com"
                            className="form-control-custom form-control-sm"
                            value={member.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label-custom">Phone Number <span className="text-danger">*</span></label>
                          <input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            className="form-control-custom form-control-sm"
                            value={member.phone}
                            onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                            required
                          />
                        </div>

                        {/* Custom Member Fields (per member) */}
                        {memberFields.map((field) => (
                          <div key={field._id} className="mb-2">
                            <label className="form-label-custom">
                              {field.label}
                              {field.required && <span className="text-danger ms-1">*</span>}
                            </label>

                            {field.type === 'text' && (
                              <input
                                type="text"
                                className="form-control-custom form-control-sm"
                                placeholder={field.placeholder || ''}
                                value={member.responses[field._id] || ''}
                                onChange={(e) => handleMemberResponseChange(idx, field._id, e.target.value)}
                                required={field.required}
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                className="form-control-custom form-control-sm"
                                rows="2"
                                placeholder={field.placeholder || ''}
                                value={member.responses[field._id] || ''}
                                onChange={(e) => handleMemberResponseChange(idx, field._id, e.target.value)}
                                required={field.required}
                              ></textarea>
                            )}

                            {field.type === 'dropdown' && (
                              <select
                                className="form-select form-select-sm"
                                value={member.responses[field._id] || ''}
                                onChange={(e) => handleMemberResponseChange(idx, field._id, e.target.value)}
                                required={field.required}
                              >
                                <option value="">— Select —</option>
                                {field.options.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {members.length + 1 < subEvent.maxTeamSize && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm mt-3"
                      onClick={handleAddMember}
                      style={{ borderColor: 'var(--br)', color: 'var(--br)' }}
                    >
                      <i className="bi bi-plus me-1"></i> Add Member
                    </button>
                  )}
                </div>
              )}

              {/* Payment screenshot upload dropzone */}
              {subEvent.requirePaymentScreenshot && (
                <div className="border-top pt-4 mb-4">
                  <label className="form-label-custom mb-2">
                    <i className="bi bi-credit-card me-1"></i> Payment Screenshot <span className="text-danger">*</span>
                  </label>
                  <div
                    className="border border-dashed rounded p-4 text-center cursor-pointer"
                    style={{ borderColor: 'var(--br)', background: 'rgba(166,124,82,0.02)' }}
                    onClick={() => document.getElementById('paymentInput').click()}
                  >
                    <div className="fs-3 mb-2">🧾</div>
                    <div className="small text-muted">Click to upload screenshot receipt</div>
                    <div className="small text-muted opacity-50 mt-1" style={{ fontSize: '0.75rem' }}>JPG, PNG, WEBP — max 5MB</div>
                    <input
                      type="file"
                      id="paymentInput"
                      className="d-none"
                      accept="image/*"
                      onChange={handlePaymentFileSelect}
                      required
                    />
                    {paymentPreview && (
                      <div className="mt-3">
                        <img src={paymentPreview} alt="Receipt Preview" style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <div className="small text-white mt-2 fw-semibold">{paymentScreenshot?.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-register w-100 py-3 fw-bold mt-2"
                style={{ fontSize: '1rem', borderRadius: '8px' }}
              >
                {submitting ? (
                  <span>Submitting Receipt...</span>
                ) : (
                  <span>Submit Registration <i className="bi bi-arrow-right-short"></i></span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center p-5 rounded border border-dashed" style={{ background: 'rgba(166,124,82,0.04)', borderColor: 'var(--br)' }}>
            <div className="fs-1 mb-2">🔒</div>
            <p className="text-muted">Registrations for this session are full.</p>
            {subEvent.eventId && (
              <Link to={`/events/${subEvent.eventId._id}/register`} className="btn-details mt-3">
                &larr; View Other Sessions
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

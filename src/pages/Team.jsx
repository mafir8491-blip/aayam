import React, { useState, useEffect } from 'react';

export default function Team() {
  const [sections, setSections] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New section form state
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Fetch page data & user session
  const fetchData = async () => {
    try {
      const res = await fetch('/api/team');
      if (!res.ok) throw new Error('Failed to fetch team data');
      const json = await res.json();
      setSections(json.sections || []);
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

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    try {
      const res = await fetch('/api/team/section/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSectionTitle }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to add section');
      } else {
        setNewSectionTitle('');
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this section and all its members?')) return;
    try {
      const res = await fetch(`/api/team/section/delete/${id}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to delete section');
      } else {
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMember = async (e, sectionId) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/team/member/add', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to add member');
      } else {
        alert('Member added successfully!');
        form.reset();
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const res = await fetch(`/api/team/member/delete/${id}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to delete member');
      } else {
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
        <p className="mt-3 text-muted">Meeting the Team...</p>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <div className="container py-5">
      <div className="page-header text-center mb-5">
        <div className="section-label">Meet The People</div>
        <h1 className="page-title" style={{ fontFamily: "var(--font-display, serif)", color: 'var(--br)' }}>Our Team</h1>
        <p className="page-subtitle text-muted">The dedicated individuals driving AAYAM Committee forward</p>
      </div>

      {sections.map((section, si) => {
        const sectionId = section.title
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        return (
          <div className="team-section mb-5" id={sectionId} key={section._id}>
            <h2 className="team-section-title text-center mb-1">{section.title}</h2>
            <div className="team-section-underline mx-auto mb-4" style={{ width: '60px', height: '3px', background: 'var(--br)' }}></div>

            {isAdmin && (
              <div className="text-center mb-4 d-flex gap-2 justify-content-center flex-wrap">
                <button
                  onClick={() => handleDeleteSection(section._id)}
                  className="btn-admin-danger btn-sm"
                >
                  ✕ Delete Section
                </button>
              </div>
            )}

            <div className="row g-4 justify-content-center">
              {section.members && section.members.length > 0 ? (
                section.members.map((member, mi) => (
                  <div className="col-xl-2 col-lg-3 col-md-4 col-6 text-center" key={member._id}>
                    <div className="team-member-card p-3" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1px solid rgba(166,124,82,0.15)', borderRadius: '12px' }}>
                      <div className="team-member-img-wrap mb-3 mx-auto" style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden' }}>
                        <img
                          src={member.image}
                          alt={member.name}
                          className="team-member-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <p className="team-member-name fw-bold mb-1" style={{ color: '#fff' }}>{member.name}</p>
                      {member.position && (
                        <p className="team-member-position text-muted small mb-0">{member.position}</p>
                      )}
                      {isAdmin && (
                        <div className="d-flex gap-2 justify-content-center mt-2">
                          <button
                            onClick={() => handleDeleteMember(member._id)}
                            className="btn-admin-danger"
                            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          >
                            ✕ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center text-muted py-4">No members added yet.</div>
              )}
            </div>

            {isAdmin && (
              <div className="mt-4 d-flex justify-content-center">
                <details className="admin-add-form p-3" style={{ maxWidth: '480px', width: '100%', border: '1px dashed var(--br)', borderRadius: '8px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--br)' }}>
                    ➕ Add Member to {section.title}
                  </summary>
                  <form onSubmit={(e) => handleAddMember(e, section._id)} className="mt-3">
                    <input type="hidden" name="sectionId" value={section._id} />
                    <div className="mb-2">
                      <input
                        type="text"
                        name="name"
                        placeholder="Member name"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="text"
                        name="position"
                        placeholder="Position (e.g. Head of Committee)"
                        className="form-control"
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        accept="image/*"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-register w-100">
                      Upload Member
                    </button>
                  </form>
                </details>
              </div>
            )}
          </div>
        );
      })}

      {isAdmin && (
        <div className="text-center mt-5 pt-4 border-top" style={{ borderColor: 'var(--border-l)' }}>
          <h4 className="mb-3" style={{ color: '#fff' }}>Add New Team Section</h4>
          <form onSubmit={handleAddSection} className="d-inline-flex gap-2 align-items-center justify-content-center flex-wrap">
            <input
              type="text"
              placeholder="Section name (e.g., Core Team)"
              className="form-control"
              style={{ maxWidth: '280px' }}
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              required
            />
            <button type="submit" className="btn-register">
              ➕ Add Section
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings Panel Form States
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');

  // Invite Admin Form States
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');

  // Fetch session & dashboard data
  const checkAuthAndFetch = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        navigate('/auth');
        return;
      }
      const meJson = await meRes.ok ? await meRes.json() : { user: null };
      if (!meJson.user || (meJson.user.role !== 'admin' && meJson.user.role !== 'superadmin')) {
        navigate('/auth');
        return;
      }
      setUser(meJson.user);
      setProfileEmail(meJson.user.email || '');

      // Load tab details
      const res = await fetch(`/api/admin?tab=${activeTab}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate('/auth');
          return;
        }
        throw new Error('Failed to load dashboard data');
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

  useEffect(() => {
    checkAuthAndFetch();
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  // Handle Tab Change
  const handleTabSelect = (tabName) => {
    setLoading(true);
    setActiveTab(tabName);
    setMobileMenuOpen(false);
  };

  // Delete Action Helpers
  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event, all its sub-events, and registrations?')) return;
    try {
      const res = await fetch(`/api/events/delete/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Delete failed');
      alert('Event deleted successfully.');
      checkAuthAndFetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleEventVisibility = async (id) => {
    try {
      const res = await fetch(`/api/events/toggle-visibility/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Toggle failed');
      checkAuthAndFetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMessageToggleRead = async (id) => {
    try {
      const res = await fetch(`/api/admin/reachout/${id}/toggle-read`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to update status');
      checkAuthAndFetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMessageDelete = async (id) => {
    if (!confirm('Delete this message submission?')) return;
    try {
      const res = await fetch(`/api/admin/reachout/${id}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Delete failed');
      checkAuthAndFetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, password: invitePassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to invite admin');
      } else {
        alert('Admin added/upgraded successfully.');
        setInviteEmail('');
        setInvitePassword('');
        checkAuthAndFetch();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAdminStatus = async (adminId) => {
    try {
      const res = await fetch(`/api/admin/toggle/${adminId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Status change failed');
      } else {
        checkAuthAndFetch();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Remove this admin?')) return;
    try {
      const res = await fetch(`/api/admin/delete/${adminId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Delete failed');
      } else {
        checkAuthAndFetch();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMakeSuperAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to promote this admin to superadmin? This will demote you to standard admin.')) return;
    try {
      const res = await fetch(`/api/admin/make-super/${adminId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Promotion failed');
      } else {
        alert('Superadmin promoted successfully. Re-authenticating...');
        window.location.reload();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profileEmail,
          password: profilePassword,
          newPassword: profileNewPassword,
          confirmPassword: profileConfirmPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to update profile');
      } else {
        alert('Profile details updated successfully.');
        setProfilePassword('');
        setProfileNewPassword('');
        setProfileConfirmPassword('');
        checkAuthAndFetch();
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
        <p className="mt-3 text-muted">Securing Administrator Access...</p>
      </div>
    );
  }

  const chartDataConfig = data && data.chartData ? {
    labels: data.chartData.labels || [],
    datasets: [{
      label: 'Registrations',
      data: data.chartData.data || [],
      borderColor: '#c9a84c',
      backgroundColor: 'rgba(201, 168, 76, 0.1)',
      fill: true,
      tension: 0.3,
    }]
  } : null;

  return (
    <div className="admin-layout" style={{ background: 'var(--bg-base-theme)', color: 'var(--text-theme)' }}>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }
        
        .admin-mobile-header {
          display: none;
          background: var(--bg-surface-theme);
          border-bottom: 1px solid var(--border-theme);
          padding: 12px 20px;
          position: sticky;
          top: 0;
          z-index: 1000;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .admin-sidebar {
          width: 260px;
          background: var(--bg-surface-theme);
          border-right: 1px solid var(--border-theme);
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 999;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-main-container {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 991px) {
          .admin-layout {
            flex-direction: column;
          }
          
          .admin-mobile-header {
            display: flex;
          }

          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            height: 100vh;
            transform: translateX(-100%);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.55);
            z-index: 998;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            animation: fadeIn 0.25s ease;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className="admin-mobile-header">
        <div className="d-flex align-items-center gap-2">
          <img src="/images/aayam_img.jpg" alt="AAYAM" className="rounded" style={{ width: '28px', height: '28px', border: '1px solid var(--br)' }} />
          <span style={{ fontFamily: 'var(--font-display, serif)', fontSize: '1rem', fontWeight: 700, color: 'var(--br)', letterSpacing: '0.5px' }}>AAYAM CONTROL</span>
        </div>
        <button
          className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center p-2"
          onClick={() => setMobileMenuOpen(true)}
          style={{ border: '1px solid var(--border-theme)', background: 'transparent' }}
        >
          <i className="bi bi-list fs-4" style={{ color: 'var(--text-theme)' }}></i>
        </button>
      </div>

      {/* SIDEBAR OVERLAY */}
      {mobileMenuOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR NAVIGATION */}
      <nav className={`admin-sidebar p-3 d-flex flex-column justify-content-between ${mobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
            <div className="d-flex align-items-center gap-2">
              <img src="/images/aayam_img.jpg" alt="AAYAM" className="rounded" style={{ width: '32px', height: '32px', border: '1.5px solid var(--br)' }} />
              <span style={{ fontFamily: 'var(--font-display, serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--br)', letterSpacing: '1px' }}>AAYAM CONTROL</span>
            </div>
            {/* Close button for mobile menu */}
            <button
              className="btn btn-sm d-lg-none text-muted p-1"
              onClick={() => setMobileMenuOpen(false)}
              style={{ border: 'none', background: 'transparent' }}
            >
              <i className="bi bi-x-lg fs-5" style={{ color: 'var(--text-theme)' }}></i>
            </button>
          </div>

          <ul className="nav flex-column gap-2">
            {[
              { id: 'dashboard', label: 'Overview', icon: 'bi-grid-fill' },
              { id: 'events', label: 'Events List', icon: 'bi-calendar-event-fill' },
              { id: 'teams', label: 'Teams Section', icon: 'bi-people-fill' },
              { id: 'gallery', label: 'Gallery & Promo', icon: 'bi-images' },
              { id: 'messages', label: 'Messages', icon: 'bi-envelope-paper-fill' },
              { id: 'users', label: 'Users List', icon: 'bi-person-badge-fill' },
              { id: 'settings', label: 'Settings', icon: 'bi-gear-fill' },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  onClick={() => handleTabSelect(tab.id)}
                  className={`nav-link w-100 text-start border-0 py-2 px-3 fw-bold d-flex align-items-center gap-2 ${activeTab === tab.id ? 'bg-warning text-dark' : 'bg-transparent'}`}
                  style={activeTab === tab.id ? { borderRadius: '8px' } : { borderRadius: '8px', color: 'var(--text-muted-theme)' }}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-top pt-3" style={{ borderColor: 'var(--border-theme)' }}>
          <div className="small text-muted mb-2">Logged in as:</div>
          <div className="small fw-bold mb-2">{user?.email?.split('@')[0]}</div>
          <a href="/logout" className="btn btn-outline-danger btn-sm w-100">
            <i className="bi bi-box-arrow-right"></i> Logout
          </a>
        </div>
      </nav>

      {/* DASHBOARD CONTENT AREA */}
      <main className="admin-main-container p-4" style={{ overflowY: 'auto' }}>
        
        {/* STATS OVERVIEW CARDS */}
        {data && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Events', count: data.stats.eventsCount, icon: 'bi-calendar-event', color: 'var(--br)' },
              { label: 'Committee Members', count: data.stats.teamCount, icon: 'bi-people', color: 'var(--gold)' },
              { label: 'Feedback Inquiries', count: data.stats.reachOutCount, icon: 'bi-chat-left-text', color: '#27ae60' },
              { label: 'Registered Users', count: data.stats.userCount, icon: 'bi-person-check', color: '#2980b9' },
            ].map((stat, idx) => (
              <div className="col-sm-6 col-lg-3" key={idx}>
                <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                  <div>
                    <div className="small text-muted">{stat.label}</div>
                    <div className="h3 fw-bold mb-0">{stat.count}</div>
                  </div>
                  <i className={`${stat.icon} fs-2`} style={{ color: stat.color }}></i>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 1. OVERVIEW TAB PANEL */}
        {activeTab === 'dashboard' && data && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="p-4 mb-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-graph-up me-2"></i>Registration Overview</h3>
                {chartDataConfig && (
                  <div style={{ height: '300px' }}>
                    <Line
                      data={chartDataConfig}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { grid: { color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: document.body.classList.contains('dark-mode') ? '#a89070' : '#8c6a55' } },
                          x: { grid: { display: false }, ticks: { color: document.body.classList.contains('dark-mode') ? '#a89070' : '#8c6a55' } }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Recent Events */}
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-calendar-check me-2"></i>Recent Events Added</h3>
                <div className="table-responsive">
                  <table className="table table-striped small">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Start Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEvents.map((evt) => (
                        <tr key={evt._id}>
                          <td><Link to={`/events/${evt._id}`} className="text-warning text-decoration-none fw-bold">{evt.title}</Link></td>
                          <td>{evt.category || 'Technical'}</td>
                          <td>{new Date(evt.startDate).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className={`badge ${evt.type === 'live' ? 'bg-success' : evt.type === 'upcoming' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {evt.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px', minHeight: '100%' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-chat-left-dots-fill me-2"></i>Recent Messages</h3>
                <div className="d-flex flex-column gap-3">
                  {data.recentMessages.map((msg) => (
                    <div key={msg._id} className="p-2 border-bottom border-secondary">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{msg.name}</strong>
                        <span className="small text-muted">{msg.purpose}</span>
                      </div>
                      <p className="small text-muted mb-0 text-truncate">{msg.message}</p>
                    </div>
                  ))}
                  {data.recentMessages.length === 0 && (
                    <p className="text-muted small">No contact messages received.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. EVENTS TAB PANEL */}
        {activeTab === 'events' && data && (
          <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
            <h3 className="h5 fw-bold mb-3"><i className="bi bi-calendar2-week me-2"></i>Events Management</h3>
            <div className="table-responsive">
              <table className="table table-striped small align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Sub-Events (Sessions)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((evt) => {
                    const subs = data.allSubs.filter(s => s.eventId === evt._id || s.eventId?._id === evt._id);
                    return (
                      <tr key={evt._id}>
                        <td><Link to={`/events/${evt._id}`} className="text-warning text-decoration-none fw-bold">{evt.title}</Link></td>
                        <td>
                          <span className={`badge ${evt.type === 'live' ? 'bg-success' : evt.type === 'upcoming' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {evt.type}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            {subs.map(sub => (
                              <div key={sub._id} className="d-flex gap-2 align-items-center small text-muted justify-content-between">
                                <span>{sub.title}</span>
                                <Link
                                  to={`/admin/subevents/${sub._id}/registrations`}
                                  className="badge bg-secondary text-decoration-none"
                                >
                                  View Regs ({sub.registrationCount || 0})
                                </Link>
                              </div>
                            ))}
                            {subs.length === 0 && <span className="text-muted italic">No custom subevents build</span>}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link
                              to={`/events/edit/${evt._id}`}
                              className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                            >
                              📝 Edit
                            </Link>
                            <button
                              onClick={() => handleToggleEventVisibility(evt._id)}
                              className={`btn btn-sm ${evt.isPublic ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            >
                              {evt.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evt._id)}
                              className="btn btn-outline-danger btn-sm"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TEAMS TAB PANEL */}
        {activeTab === 'teams' && data && (
          <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
            <h3 className="h5 fw-bold mb-3"><i className="bi bi-people-fill me-2"></i>Teams &amp; Members Sections</h3>
            <p className="small text-muted mb-4">Admins can add/delete member listings directly inside the public <Link to="/team" className="text-warning fw-bold text-decoration-none">Team Page</Link>.</p>
          </div>
        )}

        {/* 4. GALLERY & PROMOS PANEL */}
        {activeTab === 'gallery' && data && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-images me-2"></i>Gallery Promo Uploads</h3>
                <p className="small text-muted mb-4">You can manage and add general gallery items directly in the <Link to="/" className="text-warning fw-bold text-decoration-none">Home Page</Link> view form panels.</p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-megaphone-fill me-2"></i>Active Promos History</h3>
                <div className="d-flex flex-column gap-3">
                  {data.promos.map((pr) => (
                    <div key={pr._id} className="p-2 border rounded border-secondary bg-dark">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{pr.title}</strong>
                        <span className={`badge ${pr.isActive ? 'bg-success' : 'bg-secondary'}`}>{pr.isActive ? 'Live' : 'Hidden'}</span>
                      </div>
                      <p className="small text-muted mb-0">{pr.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. MESSAGES PANEL */}
        {activeTab === 'messages' && data && (
          <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
            <h3 className="h5 fw-bold mb-3"><i className="bi bi-envelope-paper-fill me-2"></i>Inquiries Box</h3>
            <div className="table-responsive">
              <table className="table table-striped small align-middle">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Details</th>
                    <th>Purpose &amp; Subject</th>
                    <th>Message Body</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.messages.map((msg) => (
                    <tr key={msg._id} style={{ opacity: msg.isRead ? 0.75 : 1 }}>
                      <td><strong>{msg.name}</strong></td>
                      <td>
                        <div className="small text-muted">{msg.email}</div>
                        <div className="small text-muted">{msg.contact || 'No phone'}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-warning">{msg.purpose}</div>
                        <div className="small text-muted">{msg.subject || 'No subject'}</div>
                      </td>
                      <td><p className="mb-0 small" style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{msg.message}</p></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleMessageToggleRead(msg._id)}
                            className={`btn btn-sm ${msg.isRead ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                          >
                            {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleMessageDelete(msg._id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.messages.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No contact messages received.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. USERS LIST PANEL */}
        {activeTab === 'users' && data && (
          <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
            <h3 className="h5 fw-bold mb-3"><i className="bi bi-person-badge-fill me-2"></i>Users List</h3>
            <div className="table-responsive">
              <table className="table table-striped small">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regularUsers.map((regUser) => (
                    <tr key={regUser._id}>
                      <td>{regUser.name || 'Anonymous User'}</td>
                      <td>{regUser.email}</td>
                      <td>{new Date(regUser.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`badge ${regUser.isActive !== false ? 'bg-success' : 'bg-danger'}`}>
                          {regUser.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. SETTINGS PANEL */}
        {activeTab === 'settings' && data && (
          <div className="row g-4">
            
            {/* Update profile form */}
            <div className="col-lg-6">
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-shield-lock-fill me-2"></i>Update Admin Security Credentials</h3>
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label className="form-label-custom">Email Address</label>
                    <input
                      type="email"
                      className="form-control-custom"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-custom">Current Password (to save changes)</label>
                    <input
                      type="password"
                      className="form-control-custom"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-custom">New Password (optional)</label>
                    <input
                      type="password"
                      className="form-control-custom"
                      value={profileNewPassword}
                      onChange={(e) => setProfileNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label-custom">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control-custom"
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button type="submit" className="btn-register w-100">
                    Save Details
                  </button>
                </form>
              </div>
            </div>

            {/* Invite Admin & Admin list */}
            <div className="col-lg-6 d-flex flex-column gap-4">
              
              {/* Invite new admin */}
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-person-plus-fill me-2"></i>Invite / Upgrade Admin</h3>
                <form onSubmit={handleInviteAdmin}>
                  <div className="mb-3">
                    <input
                      type="email"
                      placeholder="Admin Email Address"
                      className="form-control-custom"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      placeholder="Password"
                      className="form-control-custom"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-register w-100">
                    ➕ Invite Admin
                  </button>
                </form>
              </div>

              {/* List of Admins */}
              <div className="p-4" style={{ background: 'var(--bg-surface-theme)', border: '1px solid var(--border-theme)', borderRadius: '12px' }}>
                <h3 className="h5 fw-bold mb-3"><i className="bi bi-people-fill me-2"></i>Administrator Board</h3>
                <div className="d-flex flex-column gap-2">
                  {data.admins.map((adm) => (
                    <div key={adm._id} className="d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
                      <div>
                        <div className="small fw-bold">
                          {adm.email}
                          <span className="badge bg-secondary ms-2 small" style={{ fontSize: '0.65rem' }}>{adm.role}</span>
                        </div>
                        <span className={`small ${adm.isActive ? 'text-success' : 'text-danger'}`}>
                          {adm.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      
                      {adm.role !== 'superadmin' && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleToggleAdminStatus(adm._id)}
                            className="btn btn-outline-warning btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            {adm.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {user?.role === 'superadmin' && (
                            <>
                              <button
                                onClick={() => handleMakeSuperAdmin(adm._id)}
                                className="btn btn-outline-success btn-sm"
                                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                              >
                                Promote
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(adm._id)}
                                className="btn btn-outline-danger btn-sm"
                                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

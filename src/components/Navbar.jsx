import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollScale, setScrollScale] = useState(0);

  // Sync state with localStorage or default to system preference/light theme
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Mock / session user state
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Fetch current user from session if available
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        // Fallback to localStorage check if API is not yet running
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch (e) {}
      });
  }, []);

  // Scroll handler for navbar background activation & scroll progress bar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          setScrollScale(docH > 0 ? window.scrollY / docH : 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Apply classes to body for dark mode
  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  // Handle body scrolling lock when mobile drawer is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-lock');
    } else {
      document.body.classList.remove('menu-lock');
    }
    return () => {
      document.body.classList.remove('menu-lock');
    };
  }, [isMobileMenuOpen]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const userEmailPrefix = user && user.email ? user.email.split('@')[0] : '';

  return (
    <>
      <style>{`
        /* ══ Individual logo hover — isolate each wrap, kill group-level effects ══ */
        .brand-logo-wrap:first-child img {
          width: 130px !important;
          height: 80px !important;
          max-width: unset !important;
          max-height: unset !important;
        }

        /* ── Mobile: shrink karnavati logo so "AAYAM" text stays visible ── */
        @media (max-width: 768px) {
          .brand-logo-wrap:first-child img {
            width: 100px !important;
            height: 80px !important;
          }
        }
        .nav-brand:hover .brand-logo-square,
        .nav-brand:hover .brand-logo-rect {
          transform: none !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }
        .nav-brand:hover .brand-logo-ring { opacity: 0 !important; }

        /* Each logo wrap is the hover parent */
        .brand-logo-wrap { position: relative; flex-shrink: 0; }

        .brand-logo-wrap img {
          transition: transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      box-shadow 0.3s ease;
          border-color: transparent !important;
        }

        /* Only the hovered wrap's image moves — others stay still */
        .brand-logo-wrap:hover .brand-logo-square,
        .brand-logo-wrap:hover .brand-logo-rect {
          transform: translateY(-4px) scale(1.1) !important;
          box-shadow: 0 10px 22px rgba(0,0,0,0.15) !important;
          border-color: transparent !important;
        }

        /* Remove brown/tan border from all logo images globally */
        .brand-logo,
        .brand-logo-rect,
        .brand-logo-square {
          border-color: transparent !important;
          outline: none !important;
        }

        /* Desktop theme toggle — thumb slide fix */
        #themeBtn .theme-thumb {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
      `}</style>

      <nav className={`glass-navbar nav-ready ${scrolled ? 'nav-scrolled' : ''}`} id="mainNav">
        <div className="nav-container">
          {/* Brand */}
          <Link className="nav-brand" to="/">
            <div className="brand-logos-group">
              <div className="brand-logo-wrap">
                <img
                  src="/images/karnavati_logo.png"
                  alt="KUAND NACC"
                  className="brand-logo brand-logo-rect"
                  width="150"
                  height="80"
                  loading="eager"
                  style={{ maxWidth: '82px', height: '56px', objectFit: 'contain' }}
                />
              </div>
              <div className="brand-logo-wrap">
                <img
                  src="/images/uit_logo.png"
                  alt="UIT"
                  className="brand-logo brand-logo-rect"
                  width="54"
                  height="36"
                  loading="eager"
                />
              </div>
              <div className="brand-logo-wrap brand-logo-wrap-main">
                <img
                  src="/images/aayam_img.jpg"
                  alt="AAYAM"
                  className="brand-logo brand-logo-square"
                  width="46"
                  height="46"
                  loading="eager"
                />
              </div>
            </div>
            <div className="brand-text">
              <span className="brand-name">AAYAM</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links" role="list">
            <li>
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/team">
                Teams
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/events">
                Events
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/reachout">
                Reach Out
              </NavLink>
            </li>
            <li>
              <NavLink className="nav-link" to="/gallery">
                Gallery
              </NavLink>
            </li>
          </ul>

          {/* Desktop Actions */}
          <div className="nav-actions">
            {user ? (
              <div className={`user-dropdown ${userDropdownOpen ? 'drop-open' : ''}`} id="userDropdown">
                <button
                  className="user-btn"
                  id="userDropBtn"
                  aria-haspopup="true"
                  aria-expanded={userDropdownOpen}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="user-name">{userEmailPrefix}</span>
                  <i className="bi bi-chevron-down drop-chevron"></i>
                </button>
                <div className="dropdown-panel" role="menu">
                  <div className="dropdown-inner">
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <>
                        <Link className="drop-item" to="/admin" role="menuitem">
                          <i className="bi bi-shield-lock-fill"></i>
                          <span>Admin Dashboard</span>
                        </Link>
                        <div className="drop-divider"></div>
                      </>
                    )}
                    <a className="drop-item drop-danger" href="/logout" role="menuitem">
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Logout</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <Link className="login-btn" to="/auth">
                <i className="bi bi-person" style={{ marginRight: '4px' }}></i>
                <span>User Login</span>
              </Link>
            )}

            <button
              className={`theme-btn ${theme === 'dark' ? 'theme-dark' : ''}`}
              id="themeBtn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="theme-track">
                <span
                  className="theme-thumb"
                  style={{
                    transform: theme === 'dark' ? 'translateX(25px)' : 'translateX(0px)',
                  }}
                >
                  <i className="bi bi-sun-fill sun-icon"></i>
                  <i className="bi bi-moon-fill moon-icon"></i>
                </span>
              </span>
            </button>
          </div>

          {/* Mobile cluster: hamburger only */}
          <div className="mobile-cluster">
            <button
              className={`ham-btn ${isMobileMenuOpen ? 'ham-open' : ''}`}
              id="hamBtn"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobileMenu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="ham-bar bar-1"></span>
              <span className="ham-bar bar-2"></span>
              <span className="ham-bar bar-3"></span>
            </button>
          </div>
        </div>
        <div
          className="scroll-progress"
          id="scrollProgress"
          aria-hidden="true"
          style={{ transform: `scaleX(${scrollScale})` }}
        ></div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`mobile-menu ${isMobileMenuOpen ? 'menu-open' : ''}`}
        id="mobileMenu"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="menu-backdrop" id="menuBackdrop" onClick={closeMobileMenu}></div>
        <nav className="menu-drawer">
          <div className="drawer-header">
            <Link className="drawer-brand" to="/" onClick={closeMobileMenu}>
              <img src="/images/aayam_img.jpg" alt="AAYAM" width="34" height="34" className="drawer-logo" />
              <span className="drawer-title">AAYAM COMMITTEE</span>
            </Link>
            <button className="drawer-close" id="drawerClose" aria-label="Close menu" onClick={closeMobileMenu}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <ul className="drawer-nav" role="list">
            <li className="drawer-item" style={{ '--i': 0 }}>
              <NavLink className="drawer-link" to="/" onClick={closeMobileMenu}>
                <span className="drawer-icon">
                  <i className="bi bi-house-fill"></i>
                </span>
                <span className="drawer-label">Home</span>
                <span className="drawer-arrow">
                  <i className="bi bi-chevron-right"></i>
                </span>
              </NavLink>
            </li>
            <li className="drawer-item" style={{ '--i': 1 }}>
              <NavLink className="drawer-link" to="/team" onClick={closeMobileMenu}>
                <span className="drawer-icon">
                  <i className="bi bi-people-fill"></i>
                </span>
                <span className="drawer-label">Teams</span>
                <span className="drawer-arrow">
                  <i className="bi bi-chevron-right"></i>
                </span>
              </NavLink>
            </li>
            <li className="drawer-item" style={{ '--i': 2 }}>
              <NavLink className="drawer-link" to="/events" onClick={closeMobileMenu}>
                <span className="drawer-icon">
                  <i className="bi bi-calendar-event-fill"></i>
                </span>
                <span className="drawer-label">Events</span>
                <span className="drawer-arrow">
                  <i className="bi bi-chevron-right"></i>
                </span>
              </NavLink>
            </li>
            <li className="drawer-item" style={{ '--i': 3 }}>
              <NavLink className="drawer-link" to="/reachout" onClick={closeMobileMenu}>
                <span className="drawer-icon">
                  <i className="bi bi-envelope-paper-fill"></i>
                </span>
                <span className="drawer-label">Reach Out</span>
                <span className="drawer-arrow">
                  <i className="bi bi-chevron-right"></i>
                </span>
              </NavLink>
            </li>
            <li className="drawer-item" style={{ '--i': 4 }}>
              <NavLink className="drawer-link" to="/gallery" onClick={closeMobileMenu}>
                <span className="drawer-icon">
                  <i className="bi bi-images"></i>
                </span>
                <span className="drawer-label">Gallery</span>
                <span className="drawer-arrow">
                  <i className="bi bi-chevron-right"></i>
                </span>
              </NavLink>
            </li>
            <li className="drawer-item drawer-theme-item" style={{ '--i': 6 }}>
              <div className="drawer-theme-row">
                <span className="drawer-icon">
                  <i className="bi bi-circle-half"></i>
                </span>
                <span className="drawer-label">Toggle Theme</span>
                <button
                  className={`theme-btn theme-btn-mobile ${theme === 'dark' ? 'theme-dark' : ''}`}
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <span className="theme-track">
                    <span
                      className="theme-thumb"
                      style={{
                        transform: theme === 'dark' ? 'translateX(25px)' : 'translateX(0px)',
                      }}
                    >
                      <i className="bi bi-sun-fill sun-icon"></i>
                      <i className="bi bi-moon-fill moon-icon"></i>
                    </span>
                  </span>
                </button>
              </div>
            </li>
          </ul>
          <div className="drawer-footer">
            {user ? (
              <>
                <div className="drawer-user">
                  <div className="drawer-user-avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="drawer-user-info">
                    <span className="drawer-user-name">{userEmailPrefix}</span>
                    <span className="drawer-user-role">{user.role}</span>
                  </div>
                </div>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <Link className="drawer-action-btn admin-btn" to="/admin" onClick={closeMobileMenu}>
                    <i className="bi bi-shield-lock-fill"></i> Admin Dashboard
                  </Link>
                )}
                <a className="drawer-action-btn logout-btn" href="/logout">
                  <i className="bi bi-box-arrow-right"></i> Logout
                </a>
              </>
            ) : (
              <Link className="drawer-action-btn login-action-btn" to="/auth" onClick={closeMobileMenu}>
                <i className="bi bi-person-fill"></i> Login to Account
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

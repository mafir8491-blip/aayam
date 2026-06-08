import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <style>{`
        /* 4-column desktop, tighter vertical rhythm */
        .footer-grid {
          grid-template-columns: 1.6fr 1.2fr 1fr 1.4fr !important;
          padding-bottom: clamp(16px, 2vw, 24px) !important;
          gap: clamp(14px, 2.5vw, 32px) !important;
        }

        .site-footer {
          padding-top: clamp(22px, 3vw, 40px) !important;
        }

        .footer-col-title {
          margin-bottom: 10px !important;
        }

        .footer-nav-list {
          gap: 7px !important;
        }

        /* Reach Us links — plain text style matching nav links, no button look */
        .footer-reach-link {
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          font-size: 0.84rem !important;
          color: var(--tx-muted) !important;
          text-decoration: none !important;
          background: none !important;
          border: none !important;
          border-radius: 0 !important;
          width: auto !important;
          height: auto !important;
          padding: 0 !important;
          box-shadow: none !important;
          transition: color 0.22s ease, transform 0.22s ease !important;
        }
        .footer-reach-link svg { opacity: 0.7; flex-shrink: 0; }
        .footer-reach-link:hover {
          color: var(--br) !important;
          transform: translateX(3px) !important;
          background: none !important;
          box-shadow: none !important;
        }
        .footer-insta-link:hover {
          color: #c15050 !important;
        }
        body.dark-mode .footer-reach-link {
          color: var(--dk-muted) !important;
          background: none !important;
        }
        body.dark-mode .footer-reach-link:hover { color: var(--br-light) !important; }
        body.dark-mode .footer-insta-link:hover  { color: #e07070 !important; }

        /* Tighten person cards */
        .footer-person {
          padding: 8px 10px !important;
          margin-bottom: 6px !important;
        }
        .footer-person:last-child { margin-bottom: 0 !important; }

        /* Bottom bar centered */
        .footer-bottom {
          justify-content: center !important;
          padding: 12px 0 !important;
        }

        /* ── Tablet: 2×2 grid ── */
        @media (max-width: 991.98px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 16px 24px !important;
            padding-bottom: 14px !important;
          }
          .site-footer { padding-top: 22px !important; }
        }

        /* ── Mobile: single column, very tight ── */
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding-bottom: 12px !important;
          }
          .site-footer { padding-top: 18px !important; }
          .footer-col-title { margin-bottom: 7px !important; }
          .footer-nav-list  { gap: 5px !important; }
        }
      `}</style>

      <footer className="site-footer">
        <div className="footer-glow" aria-hidden="true"></div>
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand-col">
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
            </div>

            {/* Reach Us Column */}
            <div className="footer-links-col">
              <h5 className="footer-col-title">Reach Us</h5>
              <ul className="footer-nav-list">
                <li>
                  <a
                    href="mailto:uitstudentscommittee@karnavatiuniversity.edu.in"
                    className="footer-nav-link footer-reach-link"
                    aria-label="Email us"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    aayam@uit.ac.in
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/uit_students_committee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-nav-link footer-reach-link footer-insta-link"
                    aria-label="Instagram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                    </svg>
                    @aayam_uit
                  </a>
                </li>
                <li>
                  <Link to="/reachout" className="footer-nav-link">
                    <i className="bi bi-send-fill"></i> Reach Out Form
                  </Link>
                </li>
              </ul>
            </div>

            {/* Navigation Column */}
            <div className="footer-links-col">
              <h5 className="footer-col-title">Navigation</h5>
              <ul className="footer-nav-list">
                <li>
                  <Link to="/" className="footer-nav-link">
                    <i className="bi bi-house-fill"></i> Home
                  </Link>
                </li>
                <li>
                  <Link to="/team" className="footer-nav-link">
                    <i className="bi bi-people-fill"></i> Team
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="footer-nav-link">
                    <i className="bi bi-calendar-event-fill"></i> Events
                  </Link>
                </li>
                <li>
                  <Link to="/reachout" className="footer-nav-link">
                    <i className="bi bi-chat-fill"></i> Reach Out
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="footer-contact-col">
              <h5 className="footer-col-title">Contact</h5>
              <div className="footer-person">
                <div className="footer-person-avatar">SC</div>
                <div className="footer-person-info">
                  <span className="footer-contact-name">Sumantu D. Chhatrodiya</span>
                  <span className="footer-contact-role">Student Coordinator</span>
                  <a href="tel:+916354532131" className="footer-phone">
                    <i className="bi bi-telephone-fill"></i> 6354532131
                  </a>
                </div>
              </div>
              <div className="footer-person">
                <div className="footer-person-avatar">JS</div>
                <div className="footer-person-info">
                  <span className="footer-contact-name">Jenil S. Sorathiya</span>
                  <span className="footer-contact-role">Student Coordinator</span>
                  <a href="tel:+919099063506" className="footer-phone">
                    <i className="bi bi-telephone-fill"></i> 9099063506
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 AAYAM · UIT Students' Committee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

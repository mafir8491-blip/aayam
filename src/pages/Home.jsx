import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [data, setData] = useState({
    whatWeDoImages: [],
    eventImages: [],
    promo: null,
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // File Upload State
  const [actFile, setActFile] = useState(null);
  const [actPreview, setActPreview] = useState('');
  const [evtFile, setEvtFile] = useState(null);
  const [evtPreview, setEvtPreview] = useState('');

  // Promo Form State
  const [promoForm, setPromoForm] = useState({
    label: 'Register Now',
    title: '',
    heading: '',
    description: '',
    link: '',
    eventDate: '',
  });

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    mins: '00',
    secs: '00',
    expired: false,
  });

  // Fetch Page Data & Session User
  const fetchData = async () => {
    try {
      const res = await fetch('/api');
      if (!res.ok) throw new Error('Failed to fetch home data');
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
      console.error('Session fetch failed', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!data.promo || !data.promo.isActive || !data.promo.eventDate) return;

    const target = new Date(data.promo.eventDate).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown((prev) => ({ ...prev, expired: true }));
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const pad = (n) => (n < 10 ? '0' + n : '' + n);

      setCountdown({
        days: pad(d),
        hours: pad(h),
        mins: pad(m),
        secs: pad(s),
        expired: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data.promo]);

  // Image upload handler
  const handleUpload = async (section, file, setFileState, setPreviewState) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('section', section);
    formData.append('image', file);

    try {
      const res = await fetch('/api/home/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Upload failed');
      } else {
        alert('Image uploaded successfully');
        setFileState(null);
        setPreviewState('');
        fetchData();
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  // Image delete handler
  const handleDeleteImage = async (id) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    try {
      const res = await fetch(`/api/home/delete/${id}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Delete failed');
      } else {
        fetchData();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Add promo banner
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/home/promo/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Failed to add promo banner');
      } else {
        alert('Promo banner published!');
        setPromoForm({
          label: 'Register Now',
          title: '',
          heading: '',
          description: '',
          link: '',
          eventDate: '',
        });
        fetchData();
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Toggle promo banner state
  const handlePromoToggle = async (id) => {
    try {
      const res = await fetch(`/api/home/promo/${id}/toggle`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Toggle failed');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete promo banner
  const handlePromoDelete = async (id) => {
    if (!confirm('Delete this promo banner?')) return;
    try {
      const res = await fetch(`/api/home/promo/${id}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle file select for previews
  const handleFileSelect = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelect = (setFile, setPreview) => {
    setFile(null);
    setPreview('');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Curating Premium Experience...</p>
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <div className="home-wrapper">
      <style>{`
        .hero-stats-new {
          background: rgba(18, 12, 8, 0.70);
          border: 1.5px solid rgba(166, 124, 82, 0.35);
          border-radius: 18px;
          padding: 22px 30px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 820px;
          margin: 0 auto;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (max-width: 992px) {
          .hero-stats-new {
            grid-template-columns: repeat(3, 1fr);
            padding: 20px;
            gap: 16px;
          }
          
          .hero-stat-item-new {
            border-left: none !important;
            padding-left: 0 !important;
          }
        }

        @media (max-width: 576px) {
          .hero-stats-new {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 12px;
          }
        }

        .upcoming-events-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .upcoming-events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .upcoming-events-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .promo-actions-grid-new {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 576px) {
          .promo-actions-grid-new {
            grid-template-columns: 1fr;
          }
        }

        .teams-section-grid-new {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
          margin-top: 24px;
        }

        @media (max-width: 1200px) {
          .teams-section-grid-new {
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
          }
        }

        @media (max-width: 768px) {
          .teams-section-grid-new {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
        }

        .team-card-link-new {
          text-decoration: none !important;
          display: block;
        }

        .our-team-card-new {
          background: rgba(30, 21, 14, 0.45);
          border: 1.5px solid rgba(166, 124, 82, 0.16);
          border-radius: 16px;
          padding: 35px 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          height: 100%;
        }

        .our-team-card-new:hover {
          transform: translateY(-6px);
          border-color: rgba(166, 124, 82, 0.45);
          box-shadow: 0 8px 30px rgba(166, 124, 82, 0.15);
        }

        .team-card-icon-new {
          margin-bottom: 18px;
          color: #a67c52;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 50px;
          transition: transform 0.3s ease;
        }

        .our-team-card-new:hover .team-card-icon-new {
          transform: scale(1.1);
        }

        .team-card-title-new {
          font-family: var(--font-body, sans-serif);
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 2px;
          line-height: 1.2;
        }

        .team-card-subtitle-new {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0;
        }
      `}</style>
      {/* ═══════════════════════════════════════
          GEN Z HERO BANNER
          ═══════════════════════════════════════ */}
      <style>{`
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-60px) scale(1.12); }
          66%      { transform: translate(-30px,40px) scale(0.92); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-50px,30px) scale(1.08); }
          66%      { transform: translate(60px,-50px) scale(0.95); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,50px) scale(1.15); }
        }
        @keyframes tagDrift {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes tagDrift2 {
          0%,100% { transform: translateY(0px) rotate(1deg); }
          50%      { transform: translateY(-18px) rotate(-3deg); }
        }
        @keyframes tagDrift3 {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 18px rgba(166,124,82,0.3); }
          50%      { box-shadow: 0 0 42px rgba(166,124,82,0.65), 0 0 80px rgba(166,124,82,0.2); }
        }
        @keyframes counterUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateY(0) translateX(-50%); }
          50%      { transform:translateY(8px) translateX(-50%); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .hero-new-cta-primary {
          background: linear-gradient(135deg, #a67c52, #c9a84c);
          color: #0d0905;
          font-weight: 800;
          border: none;
          padding: 14px 34px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          letter-spacing: 0.3px;
          animation: pulseGlow 2.5s ease-in-out infinite;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }
        .hero-new-cta-primary:hover { transform:scale(1.06); opacity:0.92; color:#0d0905; text-decoration:none; }
        .hero-new-cta-secondary {
          border: 2px solid rgba(166,124,82,0.6);
          color: #e8d0b0;
          background: rgba(166,124,82,0.07);
          backdrop-filter: blur(6px);
          font-weight: 700;
          padding: 13px 32px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          transition: all 0.28s ease;
        }
        .hero-new-cta-secondary:hover {
          background: rgba(166,124,82,0.18);
          border-color: #a67c52;
          color: #fff;
          text-decoration: none;
          transform: scale(1.04);
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: absolute;
          white-space: nowrap;
          user-select: none;
        }
        .stat-card-new {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(166,124,82,0.2);
          border-radius: 20px;
          padding: 22px 28px;
          text-align: center;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          flex: 1;
          min-width: 130px;
          animation: counterUp 0.7s ease both;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .stat-card-new:hover {
          transform: translateY(-6px);
          border-color: rgba(166,124,82,0.55);
        }
        @media (max-width: 768px) {
          .hero-tags-row { display: none !important; }
          .hero-new-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-new-cta-row { justify-content: center !important; }
          .hero-stats-strip { flex-wrap: wrap; gap: 12px !important; }
          .stat-card-new { min-width: calc(50% - 6px); }
        }
      `}</style>

      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #0d0a07 0%, #1a1108 45%, #0f0c09 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          paddingTop: 'clamp(100px, 14vh, 160px)',
          paddingBottom: 'clamp(60px, 10vh, 100px)',
        }}
      >
        {/* ── Ambient orbs ── */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{
            position:'absolute', top:'-10%', left:'-8%',
            width:'clamp(300px,50vw,700px)', height:'clamp(300px,50vw,700px)',
            borderRadius:'50%',
            background:'radial-gradient(circle, rgba(166,124,82,0.18) 0%, transparent 70%)',
            animation:'orbFloat1 14s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute', bottom:'-15%', right:'-10%',
            width:'clamp(250px,45vw,620px)', height:'clamp(250px,45vw,620px)',
            borderRadius:'50%',
            background:'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)',
            animation:'orbFloat2 18s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute', top:'40%', left:'45%',
            width:'clamp(150px,25vw,380px)', height:'clamp(150px,25vw,380px)',
            borderRadius:'50%',
            background:'radial-gradient(circle, rgba(166,100,52,0.1) 0%, transparent 65%)',
            animation:'orbFloat3 22s ease-in-out infinite',
          }}/>
          {/* Grid overlay */}
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'linear-gradient(rgba(166,124,82,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(166,124,82,0.04) 1px, transparent 1px)',
            backgroundSize:'60px 60px',
          }}/>
        </div>

        {/* ── Floating keyword tags ── */}
        <div aria-hidden="true" className="hero-tags-row">
          <span className="hero-tag" style={{
            top:'18%', left:'4%',
            background:'rgba(166,124,82,0.12)', border:'1px solid rgba(166,124,82,0.3)', color:'#c9a84c',
            animation:'tagDrift 6s ease-in-out infinite',
          }}>
            <i className="bi bi-lightning-charge-fill"/> Technical
          </span>
          <span className="hero-tag" style={{
            top:'28%', right:'5%',
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)',
            animation:'tagDrift2 8s ease-in-out infinite',
          }}>
            <i className="bi bi-music-note-beamed"/> Cultural
          </span>
          <span className="hero-tag" style={{
            bottom:'28%', left:'3%',
            background:'rgba(39,174,96,0.1)', border:'1px solid rgba(39,174,96,0.25)', color:'#5ddb8a',
            animation:'tagDrift3 7s ease-in-out infinite',
          }}>
            <i className="bi bi-trophy-fill"/> Sports
          </span>
          <span className="hero-tag" style={{
            bottom:'22%', right:'4%',
            background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.25)', color:'#a89dff',
            animation:'tagDrift 9s ease-in-out infinite 1s',
          }}>
            <i className="bi bi-tools"/> Workshops
          </span>
          <span className="hero-tag" style={{
            top:'55%', right:'7%',
            background:'rgba(255,100,100,0.08)', border:'1px solid rgba(255,100,100,0.2)', color:'#ff8a8a',
            animation:'tagDrift2 10s ease-in-out infinite 0.5s',
          }}>
            <i className="bi bi-people-fill"/> Community
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="container" style={{ position:'relative', zIndex:2, maxWidth:'1000px' }}>

          {/* Eyebrow */}
          <div style={{ textAlign:'center', marginBottom:'20px', animation:'slideUp 0.6s ease both' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'6px 20px', borderRadius:'100px',
              background:'rgba(166,124,82,0.12)', border:'1px solid rgba(166,124,82,0.35)',
              fontSize:'0.72rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'2.5px',
              color:'#c9a84c',
            }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#c9a84c', display:'inline-block', animation:'pulseGlow 1.8s infinite' }}/>
              Official Student Committee · UIT
            </span>
          </div>

          {/* Main headline */}
          <div style={{ textAlign:'center', marginBottom:'16px', animation:'slideUp 0.7s ease 0.1s both' }}>
            <h1 style={{
              fontFamily:"'Playfair Display', Georgia, serif",
              fontSize:'clamp(2.8rem, 9vw, 7.5rem)',
              fontWeight:900,
              lineHeight:1.0,
              letterSpacing:'-1px',
              margin:0,
              color:'#fff',
              position:'relative',
              display:'inline-block',
            }}>
              <span style={{
                background:'linear-gradient(135deg, #a67c52 0%, #c9a84c 40%, #e8d0b0 70%, #a67c52 100%)',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
                backgroundClip:'text',
                backgroundSize:'200%',
              }}>
                AAYAM
              </span>
            </h1>
            <div style={{
              fontSize:'clamp(0.8rem, 2.5vw, 1.15rem)',
              fontWeight:700,
              color:'rgba(255,255,255,0.35)',
              letterSpacing:'clamp(4px, 3vw, 18px)',
              textTransform:'uppercase',
              marginTop:'2px',
            }}>
              COMMITTEE
            </div>
          </div>

          {/* Animated underline */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'28px', animation:'slideUp 0.7s ease 0.15s both' }}>
            <div style={{
              height:'2px',
              width:'120px',
              background:'linear-gradient(90deg, transparent, #a67c52, #c9a84c, transparent)',
              borderRadius:'2px',
              animation:'lineGrow 1.2s ease 0.5s both',
            }}/>
          </div>

          {/* Tagline */}
          <p style={{
            textAlign:'center',
            fontSize:'clamp(1rem, 2.8vw, 1.5rem)',
            fontWeight:700,
            color:'rgba(255,255,255,0.85)',
            marginBottom:'12px',
            letterSpacing:'0.3px',
            animation:'slideUp 0.7s ease 0.2s both',
          }}>
            Shaping Ideas.{' '}
            <span style={{ color:'#c9a84c', fontStyle:'italic' }}>Building Tomorrow.</span>
          </p>

          <p style={{
            textAlign:'center',
            fontSize:'clamp(0.82rem, 1.6vw, 1rem)',
            color:'rgba(255,255,255,0.5)',
            maxWidth:'560px',
            margin:'0 auto 36px',
            lineHeight:1.75,
            animation:'slideUp 0.7s ease 0.25s both',
          }}>
            The official student body of Unitedworld Institute of Technology — organizing technical, cultural &amp; creative events that define campus life.
          </p>

          {/* CTA buttons */}
          <div
            className="hero-new-cta-row"
            style={{
              display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap',
              marginBottom:'56px',
              animation:'slideUp 0.7s ease 0.3s both',
            }}
          >
            <Link to="/events" className="hero-new-cta-primary">
              Explore Events <i className="bi bi-arrow-right-circle-fill"/>
            </Link>
            <a href="#about" className="hero-new-cta-secondary">
              Learn More <i className="bi bi-chevron-down"/>
            </a>
          </div>

          {/* Stats strip */}
          <div
            className="hero-stats-strip"
            style={{
              display:'flex', gap:'16px', justifyContent:'center',
              animation:'slideUp 0.7s ease 0.4s both',
            }}
          >
            {[
              { icon:'bi-people-fill',          num:'40+',   label:'Team Members',      color:'#c9a84c' },
              { icon:'bi-calendar-check-fill',   num:'25+',   label:'Events Organized',  color:'#c9a84c' },
              { icon:'bi-trophy-fill',           num:'15+',   label:'National Wins',     color:'#5ddb8a' },
              { icon:'bi-building',              num:'UIT',   label:'Our Home',          color:'#a89dff' },
            ].map((s, i) => (
              <div key={i} className="stat-card-new" style={{ animationDelay:`${0.45 + i*0.1}s` }}>
                <div style={{ fontSize:'1.6rem', color:s.color, marginBottom:'8px' }}>
                  <i className={`bi ${s.icon}`}/>
                </div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:'#fff', lineHeight:1 }}>{s.num}</div>
                <div style={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'1px', marginTop:'4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scroll hint ── */}
        <div aria-hidden="true" style={{
          position:'absolute', bottom:'28px', left:'50%',
          transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
          animation:'scrollBounce 2.2s ease-in-out infinite',
          opacity:0.45,
        }}>
          <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#a67c52' }}>Scroll</div>
          <i className="bi bi-chevron-compact-down" style={{ fontSize:'1.2rem', color:'#a67c52' }}/>
        </div>
      </section>

      {/* REGISTER NOW PROMO BANNER */}
      {data.promo && data.promo.isActive && !countdown.expired && (
        <div className="hpb-section" style={{ padding: 'clamp(32px, 5vw, 56px) 0 10px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="hpb-wrapper" id="heroPromoBanner">
            {data.promo.heading && data.promo.heading.trim() !== '' && (
              <div className="hpb-sub-heading">{data.promo.heading}</div>
            )}

            <div className="hpb-top-row">
              <span className="hpb-fire">🔥</span>
              <span className="hpb-register-heading">{data.promo.title}</span>
              <span className="hpb-fire">🔥</span>
            </div>

            <div className="hpb-event-title">{data.promo.label || 'REGISTER NOW'}</div>

            {data.promo.description && <div className="hpb-event-desc">{data.promo.description}</div>}

            {data.promo.eventDate && (
              <div className="hpb-countdown-row" id="heroCountdown">
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.days}</span>
                  <span className="hpb-cd-label">DAYS</span>
                </div>
                <span className="hpb-cd-colon">:</span>
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.hours}</span>
                  <span className="hpb-cd-label">HRS</span>
                </div>
                <span className="hpb-cd-colon">:</span>
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.mins}</span>
                  <span className="hpb-cd-label">MIN</span>
                </div>
                <span className="hpb-cd-colon">:</span>
                <div className="hpb-cd-block">
                  <span className="hpb-cd-num">{countdown.secs}</span>
                  <span className="hpb-cd-label">SEC</span>
                </div>
              </div>
            )}

            {data.promo.link && data.promo.link.trim() !== '' && (
              <a href={data.promo.link} target="_blank" rel="noopener noreferrer" className="hpb-cta-btn">
                Register Now &rarr;
              </a>
            )}
          </div>
        </div>
      )}

      {/* ADMIN PROMO MANAGER */}
      {isAdmin && (
        <section className="hs-promo-admin" id="promoAdmin">
          <div className="container">
            <div className="promo-admin-card">
              <div className="promo-admin-header">
                <div className="promo-admin-icon">📣</div>
                <div>
                  <div className="promo-admin-title">Register Now Banner</div>
                  <div className="promo-admin-sub">Add a highlighted registration banner with countdown to the hero section</div>
                </div>
              </div>

              {/* Existing promo */}
              {data.promo && (
                <div className="promo-existing" style={{ marginBottom: '18px' }}>
                  <div className="promo-existing-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--tx)', fontSize: '0.95rem' }}>{data.promo.title}</div>
                      {data.promo.heading && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--br)', marginTop: '2px', fontWeight: 600 }}>
                          {data.promo.heading}
                        </div>
                      )}
                      {data.promo.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--tx-muted)', marginTop: '2px' }}>
                          {data.promo.description}
                        </div>
                      )}
                      {data.promo.eventDate && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--br)', marginTop: '3px', fontWeight: 600 }}>
                          <i className="bi bi-calendar-event"></i> Event Date:{' '}
                          {new Date(data.promo.eventDate).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handlePromoToggle(data.promo._id)}
                        className={data.promo.isActive ? 'btn-admin-warn' : 'btn-register'}
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                      >
                        {data.promo.isActive ? '⏸ Hide Banner' : '▶ Show Banner'}
                      </button>
                      <button
                        onClick={() => handlePromoDelete(data.promo._id)}
                        className="btn-admin-danger"
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      marginTop: '6px',
                      fontWeight: 700,
                      color: data.promo.isActive ? '#27ae60' : 'var(--tx-muted)',
                    }}
                  >
                    {data.promo.isActive ? '🟢 Banner is LIVE on home page' : '⭕ Banner is hidden'}
                  </div>
                </div>
              )}

              {/* Add / replace promo form */}
              <div className="promo-add-box">
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--br)',
                    marginBottom: '14px',
                  }}
                >
                  <i className="bi bi-plus-circle"></i> {data.promo ? 'Replace Banner' : 'Add New Banner'}
                </div>
                <form onSubmit={handlePromoSubmit}>
                  <div className="promo-actions-grid-new">
                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Pill Label{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (e.g. "Register Now")
                        </span>
                      </label>
                      <input
                        type="text"
                        name="label"
                        className="form-control-custom"
                        placeholder="Register Now"
                        value={promoForm.label}
                        onChange={(e) => setPromoForm({ ...promoForm, label: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Event Name <span style={{ color: '#c0392b' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="form-control-custom"
                        placeholder="e.g. AAYAM Fest 2026"
                        required
                        value={promoForm.title}
                        onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label-custom">
                        Sub-Heading{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (shown below "REGISTER NOW", above countdown — e.g. "Inter-college Technical Fest")
                        </span>
                      </label>
                      <input
                        type="text"
                        name="heading"
                        className="form-control-custom"
                        placeholder="e.g. Inter-college Technical & Cultural Fest"
                        value={promoForm.heading}
                        onChange={(e) => setPromoForm({ ...promoForm, heading: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label-custom">
                        Short Description{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (optional — appears below event name)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="description"
                        className="form-control-custom"
                        placeholder="e.g. 3 days · 20+ events · Open to all colleges"
                        value={promoForm.description}
                        onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Registration Link{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="url"
                        name="link"
                        className="form-control-custom"
                        placeholder="https://forms.google.com/..."
                        value={promoForm.link}
                        onChange={(e) => setPromoForm({ ...promoForm, link: e.target.value })}
                      />
                    </div>

                    <div className="edit-field-group">
                      <label className="form-label-custom">
                        Event Date &amp; Time{' '}
                        <span style={{ fontWeight: 400, color: 'var(--tx-muted)', textTransform: 'none', fontSize: '0.72rem' }}>
                          (countdown target — auto-hides when reached)
                        </span>
                      </label>
                      <input
                        type="datetime-local"
                        name="eventDate"
                        className="form-control-custom"
                        value={promoForm.eventDate}
                        onChange={(e) => setPromoForm({ ...promoForm, eventDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-register" style={{ marginTop: '4px', fontSize: '0.88rem' }}>
                    <i className="bi bi-megaphone"></i> {data.promo ? 'Replace & Publish' : 'Publish Banner'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      <section className="hs-upcoming-events" style={{ padding: 'clamp(50px, 7vw, 90px) 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(24px, 4vw, 42px)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display, 'Georgia', serif)",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: 'var(--tx)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Upcoming <span style={{ color: '#a67c52' }}>Events</span>
            </h2>
            <Link
              to="/events"
              className="hero-cta-secondary"
              style={{
                border: '1.5px solid #a67c52',
                color: '#a67c52',
                background: 'transparent',
                padding: '10px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, background-color 0.2s',
              }}
            >
              <span>View All Events</span> <i class="bi bi-arrow-right"></i>
            </Link>
          </div>

          {data.upcomingEvents && data.upcomingEvents.length > 0 ? (
            <div className="upcoming-events-grid">
              {data.upcomingEvents.map((evt, idx) => (
                <div
                  key={evt._id}
                  className="upcoming-event-card"
                  style={{
                    background: 'rgba(30, 21, 14, 0.45)',
                    border: '1.5px solid rgba(166, 124, 82, 0.16)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={evt.bannerImage || '/images/technovanza_banner.png'}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: '#a67c52',
                        color: '#120c08',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      {evt.category || 'Event'}
                    </div>
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-body, sans-serif)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 0 10px',
                        lineHeight: 1.25,
                      }}
                    >
                      {evt.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 20px', lineHeight: 1.5, flex: 1 }}>
                      {evt.shortDescription || ''}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        borderTop: '1px solid rgba(166, 124, 82, 0.12)',
                        paddingTop: '14px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-calendar-event" style={{ color: '#a67c52', fontSize: '0.9rem' }}></i>
                        {new Date(evt.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <i className="bi bi-geo-alt" style={{ color: '#a67c52', fontSize: '0.9rem' }}></i>
                        {evt.location || 'SVNIT Surat'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: 'rgba(166, 124, 82, 0.35)' }}></i>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.55)', marginTop: '10px' }}>No upcoming events at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="hs-intro" id="about">
        <div className="container">
          <div className="hs-intro-grid">
            <div className="intro-content-col">
              <div className="section-label">Who We Are</div>
              <h2 className="hs-section-title">
                AAYAM &ndash; UIT Students' Committee, Karnavati University <em className="title-em"></em>
              </h2>
              <p className="hs-slogan">Empowering Students. Enabling Events. Enhancing Campus Life.</p>
              <p className="hs-body-text">
                AAYAM is the heartbeat of student life at the Unitedworld Institute of Technology, Karnavati University &mdash; the official Students' Committee that drives every event, every celebration, and every opportunity that shapes the UIT experience. From intimate club meetings to grand inter-college festivals, we are the force that makes it all happen.
              </p>
              <p className="hs-body-text">
                We plan, organize, and execute with precision and passion. Whether it's a technical symposium, cultural fest, sports tournament, or industry collaboration &mdash; AAYAM brings together student talent, faculty support, and institutional resources to build futures, one experience at a time.
              </p>
              <div className="intro-pillars">
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  Governance
                </div>
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Collaboration
                </div>
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Innovation
                </div>
                <div className="pillar-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                  Excellence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR TEAMS */}
      <section className="hs-our-teams" style={{ padding: 'clamp(50px, 7vw, 90px) 0', borderTop: '1px solid rgba(166, 124, 82, 0.08)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(24px, 4vw, 42px)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display, 'Georgia', serif)",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700,
                color: 'var(--tx)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Our <span style={{ color: '#a67c52' }}>Teams</span>
            </h2>
            <Link
              to="/team"
              className="hero-cta-secondary btn-view-all-teams"
              style={{
                border: '1.5px solid #a67c52',
                color: '#a67c52',
                background: 'transparent',
                padding: '10px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, background-color 0.2s',
              }}
            >
              <span>View All Teams</span> <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="teams-section-grid-new">
            {/* Management Team */}
            <Link to="/team#management" className="team-card-link-new">
              <div className="our-team-card-new">
                <div className="team-card-icon-new">
                  <i className="bi bi-people" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title-new">Management</h3>
                <p className="team-card-subtitle-new">Team</p>
              </div>
            </Link>

            {/* Creative Team */}
            <Link to="/team#creative" className="team-card-link-new">
              <div className="our-team-card-new">
                <div className="team-card-icon-new">
                  <i className="bi bi-palette" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title-new">Creative</h3>
                <p className="team-card-subtitle-new">Team</p>
              </div>
            </Link>

            {/* Technical Team */}
            <Link to="/team#technical" className="team-card-link-new">
              <div className="our-team-card-new">
                <div className="team-card-icon-new">
                  <i className="bi bi-code-slash" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title-new">Technical</h3>
                <p className="team-card-subtitle-new">Team</p>
              </div>
            </Link>

            {/* Events Team */}
            <Link to="/team#events" className="team-card-link-new">
              <div className="our-team-card-new">
                <div className="team-card-icon-new">
                  <i className="bi bi-calendar-event" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title-new">Events</h3>
                <p className="team-card-subtitle-new">Team</p>
              </div>
            </Link>

            {/* Design Team */}
            <Link to="/team#design" className="team-card-link-new">
              <div className="our-team-card-new">
                <div className="team-card-icon-new">
                  <i className="bi bi-pencil" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title-new">Design</h3>
                <p className="team-card-subtitle-new">Team</p>
              </div>
            </Link>

            {/* Media Team */}
            <Link to="/team#media" className="team-card-link-new">
              <div className="our-team-card-new">
                <div className="team-card-icon-new">
                  <i className="bi bi-camera" style={{ fontSize: '2.5rem', color: '#a67c52' }}></i>
                </div>
                <h3 className="team-card-title-new">Media</h3>
                <p className="team-card-subtitle-new">Team</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVITIES GALLERY */}
      <section className="hs-gallery" id="gallery">
        <div className="container">
          <div className="hs-section-header text-center">
            <div className="section-label">In Action</div>
            <h2 className="hs-section-title">Our Activities</h2>
            <p className="hs-section-desc">Every moment captured here is a testament to the energy, creativity, and spirit of the UIT student community.</p>
          </div>

          {data.whatWeDoImages && data.whatWeDoImages.length > 0 ? (
            <div className="hs-gallery-grid events-gallery">
              {data.whatWeDoImages.map((img) => (
                <div key={img._id} className="hs-gallery-item">
                  <div className="gallery-img-wrap">
                    <img src={img.image} loading="lazy" alt="AAYAM activity" />
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteImage(img._id)}
                        className="gallery-delete-btn"
                        title="Remove"
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p>No activity images yet.</p>
            </div>
          )}

          {isAdmin && (
            <div className="hs-upload-zone">
              <div className="upload-form">
                <label className="upload-area" htmlFor="actFile">
                  <div className="upload-icon">📁</div>
                  <p className="upload-text">Drop an activity image or <span className="upload-browse">browse</span></p>
                  <input
                    type="file"
                    id="actFile"
                    className="upload-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setActFile, setActPreview)}
                  />
                  <p className="upload-hint">PNG, JPG up to 10MB, only 4 photos can be added</p>
                </label>

                {actPreview && (
                  <div className="upload-preview" style={{ display: 'flex' }}>
                    <img src={actPreview} alt="Preview" className="upload-preview-img" />
                    <span className="upload-preview-name">{actFile?.name}</span>
                    <button type="button" className="upload-preview-clear" onClick={() => clearFileSelect(setActFile, setActPreview)}>
                      ✕ Clear
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="upload-submit-btn"
                  onClick={() => handleUpload('what_we_do', actFile, setActFile, setActPreview)}
                  disabled={!actFile}
                >
                  Upload Activity Image
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="hs-vision-mission">
        <div className="container">
          <div className="hs-section-header text-center">
            <div className="section-label">Our Compass</div>
            <h2 className="hs-section-title">Vision &amp; Mission</h2>
          </div>
          <div className="vm-grid">
            <div className="vm-panel vm-vision">
              <div className="vm-eyebrow">Our Direction</div>
              <div className="vm-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <h3 className="vm-title">Strategic Vision</h3>
              <p className="vm-body">
                We envision UIT as a benchmark of student-led excellence &mdash; a thriving campus ecosystem where every event is a launchpad, every collaboration a milestone, and every student an architect of their own future. We strive to build an institution where ambition meets opportunity at every corner.
              </p>
              <div className="vm-tag-row">
                <span className="vm-tag">Leadership</span>
                <span className="vm-tag">Innovation</span>
                <span className="vm-tag">Inclusion</span>
              </div>
            </div>

            <div className="vm-divider" aria-hidden="true">
              <div className="vm-divider-line"></div>
              <div className="vm-divider-diamond">◆</div>
              <div className="vm-divider-line"></div>
            </div>

            <div className="vm-panel vm-mission">
              <div className="vm-eyebrow">Our Purpose</div>
              <div className="vm-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="vm-title">Mission Objective</h3>
              <p className="vm-body">
                Our mission is to architect a structured, transparent, and inclusive framework that amplifies every student's voice. We are committed to organizing impactful events, fostering professional excellence, and building a campus culture where every student feels empowered to participate, lead, and grow beyond their limits.
              </p>
              <div className="vm-tag-row">
                <span className="vm-tag">Transparency</span>
                <span className="vm-tag">Structure</span>
                <span className="vm-tag">Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS GALLERY */}
      <section className="hs-events-section">
        <div className="container">
          <div className="hs-section-header text-center">
            <div className="section-label">Events &amp; Collaborations</div>
            <h2 className="hs-section-title">Moments That Matter</h2>
            <p className="hs-section-desc font-normal">From grand cultural fests to intimate technical workshops &mdash; AAYAM is the backbone behind every event that writes the story of UIT.</p>
            <div className="events-excellence-badge">
              <span className="badge-star">★</span> Powered by AAYAM Excellence <span className="badge-star">★</span>
            </div>
          </div>

          {data.eventImages && data.eventImages.length > 0 ? (
            <div className="hs-gallery-grid events-gallery">
              {data.eventImages.map((img) => (
                <div key={img._id} className="hs-gallery-item">
                  <div className="gallery-img-wrap">
                    <img src={img.image} loading="lazy" alt="AAYAM event" />
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteImage(img._id)}
                        className="gallery-delete-btn"
                        title="Remove"
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p>No event images yet.</p>
            </div>
          )}

          {isAdmin && (
            <div className="hs-upload-zone">
              <div className="upload-form">
                <label className="upload-area" htmlFor="evtFile">
                  <div className="upload-icon">📁</div>
                  <p className="upload-text">Drop an event image or <span className="upload-browse">browse</span></p>
                  <input
                    type="file"
                    id="evtFile"
                    className="upload-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setEvtFile, setEvtPreview)}
                  />
                  <p className="upload-hint">PNG, JPG up to 10MB</p>
                </label>

                {evtPreview && (
                  <div className="upload-preview" style={{ display: 'flex' }}>
                    <img src={evtPreview} alt="Preview" className="upload-preview-img" />
                    <span className="upload-preview-name">{evtFile?.name}</span>
                    <button type="button" className="upload-preview-clear" onClick={() => clearFileSelect(setEvtFile, setEvtPreview)}>
                      ✕ Clear
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="upload-submit-btn"
                  onClick={() => handleUpload('events', evtFile, setEvtFile, setEvtPreview)}
                  disabled={!evtFile}
                >
                  Upload Event Image
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function Gallery() {
  const [data, setData] = useState({ generalImages: [], eventImages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to load gallery images');
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
    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Developing Captures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Error Loading Gallery</h3>
        <p className="text-muted">{error}</p>
        <button onClick={fetchGallery} className="btn-details">
          🔄 Retry
        </button>
      </div>
    );
  }

  const { generalImages, eventImages } = data;

  // Filter items
  const items = [];
  if (filter === 'all' || filter === 'general') {
    generalImages.forEach((img, idx) => {
      items.push({
        id: `gen-${idx}`,
        category: 'general',
        url: img.image,
        badge: img.section === 'what_we_do' ? 'Activity' : 'Highlight',
        title: 'General Activity',
        subtitle: '',
      });
    });
  }

  if (filter === 'all' || filter === 'events') {
    eventImages.forEach((img, idx) => {
      items.push({
        id: `evt-${idx}`,
        category: 'events',
        url: img.url,
        badge: 'Event Highlight',
        title: img.title,
        subtitle: img.speakerName ? `Speaker: ${img.speakerName}` : '',
      });
    });
  }

  return (
    <div className="container my-5">
      <div className="page-header text-center mb-5">
        <div className="section-label" style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--br)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
          Moments Captured
        </div>
        <h1 className="page-title text-white" style={{ fontFamily: 'var(--font-display, serif)', fontWeight: 700, fontSize: '3rem', marginBottom: '12px' }}>
          Our Gallery
        </h1>
        <p className="page-subtitle text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Relive the energy, collaboration, and success of our events and activities
        </p>
        <div style={{ width: '80px', height: '3px', background: 'var(--br)', margin: '20px auto 0' }}></div>
      </div>

      {/* Gallery Filter Tabs */}
      <div className="d-flex justify-content-center gap-3 mb-5 flex-wrap">
        <button
          className={`gallery-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Memories
        </button>
        <button
          className={`gallery-filter-btn ${filter === 'general' ? 'active' : ''}`}
          onClick={() => setFilter('general')}
        >
          General Activities
        </button>
        <button
          className={`gallery-filter-btn ${filter === 'events' ? 'active' : ''}`}
          onClick={() => setFilter('events')}
        >
          Event Highlights
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="row g-4 gallery-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <div className="col-xl-3 col-lg-4 col-md-6 gallery-item-wrapper" key={item.id}>
              <div className="gallery-card">
                <div className="gallery-img-wrap" style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#000' }}>
                  <img
                    src={item.url}
                    alt={item.title}
                    className="gallery-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                    loading="lazy"
                  />
                  <div className="gallery-hover-overlay" style={{ pointerEvents: 'none' }}>
                    <i className="bi bi-zoom-in zoom-icon"></i>
                  </div>
                </div>
                <div className="gallery-card-body">
                  <span className="gallery-badge">{item.badge}</span>
                  <h3 className="gallery-item-title text-white">{item.title}</h3>
                  {item.subtitle && <p className="gallery-item-sub text-muted small">{item.subtitle}</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="no-images-state">
              <i className="bi bi-images" style={{ fontSize: '3rem', color: 'var(--tx-muted)', display: 'block', marginBottom: '15px' }}></i>
              <p style={{ color: 'var(--tx-muted)', fontStyle: 'italic' }}>No gallery memories uploaded yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

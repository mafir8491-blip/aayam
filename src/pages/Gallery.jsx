import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Gallery() {
  const [data, setData] = useState({ generalImages: [], eventImages: [] });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.user || null);
      }
    } catch (e) {
      console.error('Session fetch failed', e);
    }
  };

  useEffect(() => {
    fetchGallery();
    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', 'general');

    try {
      const res = await fetch('/api/home/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to upload image');
      
      setFile(null);
      setPreview('');
      alert('Image uploaded successfully!');
      fetchGallery();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    try {
      const res = await fetch(`/api/home/delete/${id}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete image');
      fetchGallery();
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
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  // Flatten both general and event images into a unified array
  const items = [];
  generalImages.forEach((img) => {
    items.push({
      id: img._id,
      url: img.image,
      isGeneral: true,
      title: 'Activity Capture',
      badge: 'General Memory'
    });
  });

  eventImages.forEach((img, idx) => {
    items.push({
      id: `evt-${idx}`,
      url: img.url,
      isGeneral: false,
      title: img.title || 'Event Highlight',
      badge: 'Event Highlight'
    });
  });

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

      {/* Admin Upload Zone */}
      {isAdmin && (
        <div className="hs-upload-zone mb-5 p-4" style={{ background: 'rgba(30, 21, 14, 0.45)', border: '1.5px dashed rgba(166, 124, 82, 0.3)', borderRadius: '16px', maxWidth: '600px', margin: '0 auto 40px' }}>
          <h4 className="text-white mb-3 text-center" style={{ fontFamily: 'var(--font-display, serif)' }}>Upload New Image to Gallery</h4>
          <form onSubmit={handleUploadSubmit} className="text-center">
            <div className="mb-3">
              <label 
                htmlFor="galleryUploadInput" 
                style={{ 
                  display: 'block', 
                  border: '1.5px dashed rgba(255, 255, 255, 0.25)', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }} 
                  />
                ) : (
                  <div>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📁</div>
                    <div className="small">Click to select image file</div>
                  </div>
                )}
              </label>
              <input 
                type="file" 
                id="galleryUploadInput" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                required
              />
            </div>
            
            <div className="d-flex gap-2 justify-content-center">
              {file && (
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => { setFile(null); setPreview(''); }}
                  style={{ borderRadius: '8px' }}
                >
                  Clear Selection
                </button>
              )}
              <button 
                type="submit" 
                className="btn-register" 
                disabled={uploading || !file}
                style={{ padding: '8px 24px' }}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="row g-4 gallery-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <div className="col-xl-3 col-lg-4 col-md-6 gallery-item-wrapper" key={item.id}>
              <div className="gallery-card" style={{ height: '100%', position: 'relative' }}>
                <div className="gallery-img-wrap" style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#000', borderRadius: '12px 12px 0 0' }}>
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
                  
                  {/* Delete button for Admin on General Images */}
                  {isAdmin && item.isGeneral && (
                    <button
                      onClick={() => handleDeleteImage(item.id)}
                      className="btn btn-danger btn-sm"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        border: 'none',
                        zIndex: 2
                      }}
                      title="Delete Image"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="gallery-card-body" style={{ padding: '16px' }}>
                  <span className="gallery-badge" style={{ background: 'rgba(166, 124, 82, 0.15)', color: '#a67c52', fontSize: '0.72rem', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                    {item.badge}
                  </span>
                  <h3 className="gallery-item-title text-white mt-2 mb-0" style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.title}</h3>
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

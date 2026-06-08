import React, { useState, useEffect } from 'react';

export default function Lightbox() {
  const [src, setSrc] = useState(null);
  const [alt, setAlt] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.tagName === 'IMG') {
        const img = e.target;

        // Exclude headers, structural banners, preview blocks, and dashboard icons
        if (
          img.closest('nav') ||
          img.closest('.hs-hero') ||
          img.closest('.navbar') ||
          img.closest('.navbar-brand') ||
          img.closest('.event-detail-banner') ||
          img.closest('.admin-add-form') ||
          img.closest('.upload-preview') ||
          img.closest('.sidebar') ||
          img.closest('.admin-sidebar') ||
          img.closest('.brand-logos-group') ||
          img.className.includes('logo') ||
          img.src.includes('logo') ||
          img.id.includes('logo') ||
          img.className.includes('banner') ||
          img.id.includes('banner')
        ) {
          return;
        }

        setSrc(img.src);
        setAlt(img.alt);
        setShow(true);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    if (show) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show]);

  const closeLightbox = () => {
    setShow(false);
    setTimeout(() => {
      setSrc(null);
      setAlt('');
    }, 300);
  };

  if (!src && !show) return null;

  return (
    <div
      className={`universal-lightbox ${show ? 'show' : ''}`}
      style={{ display: show ? 'flex' : 'none' }}
      onClick={(e) => {
        if (e.target.classList.contains('universal-lightbox')) {
          closeLightbox();
        }
      }}
      role="dialog"
      aria-label="Image Zoom View"
    >
      <span className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
        &times;
      </span>
      {src && (
        <img
          className="lightbox-content"
          id="lightboxImg"
          src={src}
          alt={alt}
        />
      )}
      <div id="lightboxCaption" className="lightbox-caption">
        {alt}
      </div>
    </div>
  );
}

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
    <>
      <style>{`
        .universal-lightbox {
          position: fixed;
          z-index: 999999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: rgba(10, 7, 5, 0.95);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .universal-lightbox.show {
          display: flex !important;
          opacity: 1;
        }
        .lightbox-content {
          max-width: 90%;
          max-height: 82%;
          border-radius: 16px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8);
          transform: scale(0.92);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1.5px solid rgba(166, 124, 82, 0.25);
          object-fit: contain;
        }
        .universal-lightbox.show .lightbox-content {
          transform: scale(1);
        }
        .lightbox-close {
          position: absolute;
          top: 25px;
          right: 35px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 44px;
          font-weight: 300;
          transition: all 0.25s ease;
          cursor: pointer;
          z-index: 1000000;
          user-select: none;
        }
        .lightbox-close:hover {
          color: #a67c52;
          transform: scale(1.1) rotate(90deg);
        }
        .lightbox-caption {
          position: absolute;
          bottom: 40px;
          color: #fff;
          font-family: var(--font-body, sans-serif);
          font-size: 1.15rem;
          font-weight: 600;
          text-align: center;
          width: 100%;
          padding: 0 30px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
          letter-spacing: 0.5px;
        }
        img {
          cursor: zoom-in;
        }
        /* Disable zoom cursor on specific structural elements */
        nav img, .navbar img, .navbar-brand img, .hs-hero img, .event-detail-banner img, .upload-preview img, .admin-sidebar img, .sidebar img, .brand-logos-group img, .drawer-logo {
          cursor: default !important;
        }
      `}</style>
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
    </>
  );
}

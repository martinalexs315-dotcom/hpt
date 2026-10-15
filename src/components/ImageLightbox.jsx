import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageLightbox({
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
  title = '',
}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const total = images ? images.length : 0;
  const currentSrc = images && images[currentIndex] ? images[currentIndex] : null;

  const handlePrev = () => {
    if (total <= 1) return;
    onNavigate((currentIndex - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= 1) return;
    onNavigate((currentIndex + 1) % total);
  };

  // Lock scroll completely on body and html while lightbox is open
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouch = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouch;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, total]);

  const onTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Horizontal swipe detected
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (diffY < -60 && Math.abs(diffY) > Math.abs(diffX)) {
      // Swipe down to close (WhatsApp signature interaction)
      onClose();
    }
  };

  if (!images || total === 0 || !currentSrc) return null;

  const lightboxContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse photo plein écran"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 999999,
        background: '#000000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Barre supérieure discrète (style WhatsApp) : Titre & Compteur à gauche, Croix de fermeture à droite */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 3vw, 28px)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 1000001,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#ffffff' }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.02em',
              background: 'rgba(255, 255, 255, 0.14)',
              padding: '4px 10px',
              borderRadius: 16,
            }}
          >
            {currentIndex + 1} / {total}
          </span>
          {title && (
            <span
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.75)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '55vw',
                fontWeight: 500,
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Bouton de fermeture (croix) bien visible et facile à toucher */}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'background 0.15s, transform 0.1s',
          }}
          title="Fermer (Échap ou glisser vers le bas)"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
        >
          <X size={24} strokeWidth={2.4} />
        </button>
      </div>

      {/* Flèche Gauche (Précédente) */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          style={{
            position: 'absolute',
            left: 'clamp(12px, 3vw, 28px)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000001,
            background: 'rgba(20, 20, 20, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: 'clamp(46px, 5.5vw, 56px)',
            height: 'clamp(46px, 5.5vw, 56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
            transition: 'background 0.15s, transform 0.15s',
          }}
          title="Photo précédente (Flèche gauche)"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(5, 150, 105, 0.95)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20, 20, 20, 0.7)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronLeft size={30} strokeWidth={2.4} />
        </button>
      )}

      {/* Photo plein écran (comme WhatsApp : prend tout l'écran sans aucun défilement) */}
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(12px, 2vw, 24px)',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${title} - Photo ${currentIndex + 1}`}
          style={{
            maxWidth: '96vw',
            maxHeight: '90dvh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            margin: 'auto',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            animation: 'popIn 0.18s ease both',
          }}
        />
      </div>

      {/* Flèche Droite (Suivante) */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          style={{
            position: 'absolute',
            right: 'clamp(12px, 3vw, 28px)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000001,
            background: 'rgba(20, 20, 20, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: 'clamp(46px, 5.5vw, 56px)',
            height: 'clamp(46px, 5.5vw, 56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
            transition: 'background 0.15s, transform 0.15s',
          }}
          title="Photo suivante (Flèche droite)"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(5, 150, 105, 0.95)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20, 20, 20, 0.7)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronRight size={30} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(lightboxContent, document.body)
    : lightboxContent;
}

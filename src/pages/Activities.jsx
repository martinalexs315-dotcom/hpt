import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { ActivityCard, Photo } from '../components/ui.jsx';
import ImageLightbox from '../components/ImageLightbox.jsx';
import NotFound from './NotFound.jsx';

export function Activities() {
  const { activities } = useStore();
  return (
    <main className="page-main">
      <div className="eyebrow">Activités</div>
      <h1 className="page-title">Nos actions sur le terrain</h1>
      <div className="grid cols-3">
        {activities.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
      </div>
    </main>
  );
}

const SECTIONS = [
  { key: 'contexte', label: 'Contexte' },
  { key: 'actions', label: 'Actions menées' },
  { key: 'resultats', label: 'Résultats' },
];

export function ActivityDetail() {
  const { id } = useParams();
  const { activities } = useStore();
  const [open, setOpen] = useState({ contexte: true, actions: false, resultats: false });
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const a = activities.find((x) => x.id === id);
  if (!a) return <NotFound />;

  // Galerie spécifique à cette activité (définie depuis le panel admin)
  const images = Array.isArray(a.gallery) ? a.gallery : [];

  return (
    <main className="page-main narrow">
      <Link to="/activites" className="back-link">← Retour aux activités</Link>
      <div className="eyebrow">{a.category}</div>
      <h1 className="page-title" style={{ marginBottom: 32, maxWidth: 'none' }}>{a.title}</h1>
      <div
        className="rounded-lg detail-hero"
        style={{
          position: 'relative',
          height: 'clamp(220px, 42vw, 420px)',
          marginBottom: 36,
          overflow: 'hidden',
        }}
      >
        <Photo src={a.photo} alt={a.title} placeholder="Photo principale" />
      </div>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 40px' }}>{a.desc}</p>

      {a.quote && (
        <div className="quote-box">
          <p>« {a.quote} »</p>
          {a.quoteAuthor && <div style={{ fontSize: 14, fontWeight: 600, marginTop: 14 }}>— {a.quoteAuthor}</div>}
        </div>
      )}

      <div className="accordion">
        {SECTIONS.filter((s) => a[s.key]).map((s) => (
          <div key={s.key} className="accordion-item">
            <button type="button" aria-expanded={open[s.key]} onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}>
              <span>{s.label}</span><span>{open[s.key] ? '−' : '+'}</span>
            </button>
            {open[s.key] && <p>{a[s.key]}</p>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, margin: 0 }}>Galerie photos ({images.length})</h3>
        </div>
        {images.length > 0 ? (
          <div className="grid cols-4" style={{ gap: 14 }}>
            {images.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                style={{
                  position: 'relative',
                  height: 140,
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border-subtle)',
                  padding: 0,
                  cursor: 'pointer',
                  background: '#0F172A',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  display: 'block',
                  width: '100%',
                }}
                className="gallery-thumb"
                title="Afficher la photo en plein écran"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Photo src={src} alt={`${a.title} - photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontStyle: 'italic', padding: '20px 0' }}>
            Aucune photo dans la galerie pour le moment.
          </div>
        )}
      </div>

      {/* Visionneuse plein écran Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
          title={a.title}
        />
      )}
    </main>
  );
}

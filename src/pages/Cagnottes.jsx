import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, HeartHandshake, Image as ImageIcon } from 'lucide-react';
import { fmt, pctOf } from '../data.js';
import { useStore } from '../store.jsx';
import { Button, CagnotteCard, Photo, Progress, StatusBadge, WhatsAppButton } from '../components/ui.jsx';
import ImageLightbox from '../components/ImageLightbox.jsx';
import NotFound from './NotFound.jsx';

export function Cagnottes() {
  const { cagnottes } = useStore();
  return (
    <main className="page-main">
      <div className="eyebrow">Cagnottes</div>
      <h1 className="page-title">Suivez et soutenez nos collectes</h1>
      <div className="grid cols-2">
        {cagnottes.map((c, i) => <CagnotteCard key={c.id} cagnotte={c} index={i} showStatus />)}
      </div>
    </main>
  );
}

function formatTextWithLinks(text) {
  if (!text) return null;
  const paragraphs = text.split('\n\n');
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+)/gi;

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n');
    return (
      <p key={pIdx} style={{ margin: '0 0 14px', lineHeight: 1.8, fontSize: 15, color: 'var(--text-secondary)' }}>
        {lines.map((line, lIdx) => {
          const parts = line.split(urlRegex);
          return (
            <span key={lIdx}>
              {parts.map((part, idx) => {
                if (part.match(urlRegex)) {
                  let cleanUrl = part;
                  let trailingPunct = '';
                  const matchPunct = cleanUrl.match(/[.,;!?)]+$/);
                  if (matchPunct) {
                    trailingPunct = matchPunct[0];
                    cleanUrl = cleanUrl.slice(0, -trailingPunct.length);
                  }
                  const href = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
                  return (
                    <span key={idx}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--gl-teal)',
                          textDecoration: 'underline',
                          fontWeight: 600,
                          wordBreak: 'break-all',
                        }}
                      >
                        {cleanUrl}
                      </a>
                      {trailingPunct}
                    </span>
                  );
                }
                return part;
              })}
              {lIdx < lines.length - 1 && <br />}
            </span>
          );
        })}
      </p>
    );
  });
}

export function CagnotteDetail() {
  const { id } = useParams();
  const { cagnottes, paymentMethods, openDonation } = useStore();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const c = cagnottes.find((x) => x.id === id);
  if (!c) return <NotFound />;
  const pct = pctOf(c);
  const accepted = [paymentMethods.wave && 'Wave', paymentMethods.om && 'Orange Money'].filter(Boolean);
  const isClosed = c.status === 'closed';

  return (
    <main className="page-main narrower">
      <Link to="/cagnottes" className="back-link">← Retour aux cagnottes</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0, maxWidth: 600 }}>{c.title}</h1>
        <StatusBadge status={c.status} style={{ padding: '5px 12px' }} />
      </div>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', margin: '0 0 32px' }}>{c.desc}</p>

      {/* Carte de progression et don */}
      <div className="card" style={{ padding: 32, marginBottom: isClosed ? 36 : 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--gl-teal)' }}>{fmt(c.collected)}</span>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>objectif : {fmt(c.goal)}</span>
        </div>
        <div style={{ marginBottom: 14 }}><Progress pct={pct} large /></div>
        <div className="progress-meta" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
          <span>{pct}% de l'objectif atteint</span>
        </div>
        {c.status === 'active' ? (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="accent" style={{ flex: 2 }} onClick={() => openDonation(c.title)}>Faire un don à cette cagnotte</Button>
              <WhatsAppButton cagnotte={c} style={{ flex: 1.2 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Moyens de paiement acceptés :</span>
              <span style={{ fontWeight: 600 }}>{accepted.length ? accepted.join(' • ') : 'Aucun moyen actif'}</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', padding: '8px 0' }}>
            Cette cagnotte est clôturée. Merci infiniment à tous les donateurs pour votre mobilisation !
          </div>
        )}
      </div>

      {/* Présentation du projet & Contexte (Cagnotte active) */}
      {!isClosed && c.story && c.story.trim() && (
        <section className="card" style={{ padding: 'clamp(24px, 4vw, 36px)', marginBottom: 40, border: '1.5px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <HeartHandshake size={24} color="var(--gl-teal)" />
            <h2 style={{ fontSize: 22, margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {c.storyTitle || 'Pourquoi nous soutenir & Bénéficiaires'}
            </h2>
          </div>
          <div>
            {formatTextWithLinks(c.story)}
          </div>
        </section>
      )}

      {/* Rapport d'impact & Bilan de mission (Cagnotte clôturée uniquement) */}
      {isClosed && (
        <section className="card" style={{ padding: 'clamp(24px, 4vw, 36px)', marginBottom: 40, border: '1.5px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <CheckCircle2 size={24} color="#1C7A44" />
            <h2 style={{ fontSize: 22, margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Rapport d'impact & Bilan de mission
            </h2>
          </div>

          {/* Texte du bilan avec détection et clic automatique des liens URL */}
          <div style={{ marginBottom: 24 }}>
            {formatTextWithLinks(c.closureReport || "Les fonds mobilisés ont permis de concrétiser cette action sur le terrain dans le respect total des objectifs fixés avec l'association.")}
          </div>

          {/* Chiffres d'impact */}
          {c.impactFigures && c.impactFigures.length > 0 && (
            <div className="grid cols-2" style={{ gap: 14, marginBottom: 28 }}>
              {c.impactFigures.map((fig, idx) => (
                <div key={idx} style={{ background: 'var(--gl-cream)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--gl-teal-dark)', marginBottom: 4 }}>
                    {fig.value}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fig.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Galerie de photos de clôture / terrain */}
          {c.closurePhotos && c.closurePhotos.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <ImageIcon size={18} color="var(--gl-orange)" />
                <h3 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>Photos de la distribution sur le terrain ({c.closurePhotos.length})</h3>
              </div>
              <div className="grid cols-3" style={{ gap: 14 }}>
                {c.closurePhotos.map((photoUrl, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setLightboxIndex(pIdx)}
                    style={{
                      position: 'relative',
                      height: 160,
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
                    <Photo src={photoUrl} alt={`Photo de clôture ${pIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Visionneuse plein écran Lightbox */}
      {lightboxIndex !== null && c.closurePhotos && (
        <ImageLightbox
          images={c.closurePhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
          title={c.title}
        />
      )}
    </main>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Mail, Send, Sparkles } from 'lucide-react';
import { pctOf, testimonials } from '../data.js';
import { useCountUp, useReveal, useScrollY } from '../hooks.js';
import { useStore } from '../store.jsx';
import { ActivityCard, Button, CagnotteCard, Photo, Progress } from '../components/ui.jsx';

const MARQUEE = ['Tabaski', 'Ramadan', 'Rentrée scolaire', 'Caravane médicale', 'Paniers alimentaires', 'Kits scolaires'];

export function useStatsItems(t = 1) {
  const { stats } = useStore();
  const progress = typeof t === 'number' && !isNaN(t) ? t : 1;
  const beneficiaries = Math.round((Number(stats?.beneficiaries) || 1250) * progress);
  const fundsM = (Math.round((Number(stats?.fundsM) || 18.5) * progress * 10) / 10).toFixed(1).replace('.', ',');
  const activitiesCount = Math.round((Number(stats?.activitiesCount) || 24) * progress);
  const volunteers = Math.round((Number(stats?.volunteers) || 85) * progress);

  return [
    { value: beneficiaries.toLocaleString('fr-FR') + '+', label: 'Bénéficiaires accompagnés' },
    { value: fundsM + 'M FCFA', label: 'Collectés depuis la création' },
    { value: String(activitiesCount), label: 'Activités menées' },
    { value: volunteers + '+', label: 'Bénévoles engagés' },
  ];
}

function Hero() {
  const navigate = useNavigate();
  const { cagnottes, openDonation, featuredCagnotteId } = useStore();
  const scrollY = useScrollY();
  const featured =
    cagnottes.find((c) => c.id === featuredCagnotteId) ||
    cagnottes.find((c) => c.isFeatured) ||
    cagnottes.find((c) => c.status === 'active') ||
    cagnottes[0];

  const shift = `translateY(${Math.min(60, scrollY * 0.12)}px) scale(${1 + Math.min(0.06, scrollY * 0.00012)})`;

  return (
    <section className="hero">
      <div className="hero-frame">
        <div className="hero-bg" style={{ transform: shift }}>
          <Photo src="/assets/photo-01.jpeg" alt="Activité de l'association" />
        </div>
        <div className="hero-shade" />
        <div className="dot" style={{ top: 56, left: 64, width: 16, height: 16, background: 'var(--gl-blue-dot)', animation: 'floatDot 4s ease-in-out infinite' }} />
        <div className="dot" style={{ top: 120, left: 120, width: 10, height: 10, background: 'var(--gl-orange)', animation: 'floatDot 3.2s ease-in-out infinite 0.4s' }} />
        <div className="dot" style={{ top: 90, right: 340, width: 12, height: 12, background: 'var(--gl-green-dot)', animation: 'floatDot 3.8s ease-in-out infinite 0.8s' }} />
        <div className="hero-content">
          <div className="eyebrow">Solidarité en action</div>
          <h1>Hassanates pour tous</h1>
          <p>Une association solidaire qui accompagne les familles les plus vulnérables, à travers des actions concrètes menées toute l'année.</p>
          <div className="hero-ctas">
            <Button variant="accent" onClick={() => openDonation()}>Faire un don</Button>
            <Button variant="primary" onClick={() => navigate('/activites')}>Découvrir nos activités</Button>
          </div>
        </div>
        {featured && (
          <div className="hero-stat">
            <div className="pct">{pctOf(featured)}%</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 10px' }}>de l'objectif atteint</div>
            <Progress pct={pctOf(featured)} delay="0.6s" />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 10, lineHeight: 1.3 }}>{featured.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {Number(featured.collected || 0).toLocaleString('fr-FR')} / {Number(featured.goal || 0).toLocaleString('fr-FR')} FCFA
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                className="btn btn-accent"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (featured.status === 'closed') {
                    navigate(`/cagnottes/${featured.id}`);
                  } else {
                    openDonation(featured.title);
                  }
                }}
              >
                {featured.status === 'closed' ? 'Consulter le bilan →' : 'Participer à cette cagnotte →'}
              </button>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  fontSize: 11,
                  color: 'var(--gl-teal)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => navigate(`/cagnottes/${featured.id}`)}
              >
                Voir les détails de la collecte
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Marquee() {
  const group = (hidden) => (
    <div className="marquee-group" aria-hidden={hidden}>
      {MARQUEE.map((w, i) => (
        <span key={w} style={{ display: 'contents' }}>
          <span>{w}</span>
          <span style={{ color: i % 2 ? 'var(--gl-orange)' : 'var(--gl-teal)' }}>•</span>
        </span>
      ))}
    </div>
  );
  return (
    <section className="marquee">
      <div className="marquee-track">{group(false)}{group(true)}</div>
    </section>
  );
}

function Impact() {
  const [t, start] = useCountUp();
  const ref = useReveal(start);
  const items = useStatsItems(t);
  return (
    <section ref={ref} className="container home-section first reveal">
      <div className="split">
        <div className="rounded-lg" style={{ height: 380 }}>
          <Photo src="/assets/photo-02.jpeg" alt="Bénévoles en action" />
        </div>
        <div>
          <div className="eyebrow">Notre impact</div>
          <h2 style={{ fontSize: 'var(--text-h2)', margin: '0 0 28px', lineHeight: 'var(--lh-snug)' }}>Des actions concrètes, mesurées et durables</h2>
          <div className="grid cols-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {items.map((s, i) => (
              <div key={s.label} style={{ animation: 'popIn 0.5s ease both', animationDelay: i * 0.1 + 's' }}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { activities, cagnottes } = useStore();
  const activitiesRef = useReveal();
  const cagnottesRef = useReveal();
  const bandRef = useReveal();
  const newsRef = useReveal();
  const active = cagnottes.filter((c) => c.status === 'active');

  return (
    <main>
      <Hero />
      <Marquee />
      <Impact />

      <section ref={activitiesRef} className="container home-section reveal">
        <div className="section-head">
          <div>
            <div className="eyebrow">Nos activités</div>
            <h2 className="section-title">Ce que nous menons sur le terrain</h2>
          </div>
          <Button variant="outline" onClick={() => navigate('/activites')}>Voir toutes les activités</Button>
        </div>
        <div className="grid cols-3">
          {activities.slice(0, 3).map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
        </div>
      </section>

      {active.length > 0 && (
        <section ref={cagnottesRef} className="container home-section reveal">
          <div style={{ marginBottom: 36 }}>
            <div className="eyebrow">Cagnottes en cours</div>
            <h2 className="section-title">Participez à nos collectes</h2>
          </div>
          <div className="grid cols-2">
            {active.map((c, i) => <CagnotteCard key={c.id} cagnotte={c} index={i} hover />)}
          </div>
        </section>
      )}

      <section ref={bandRef} className="band reveal">
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="eyebrow" style={{ color: 'var(--gl-teal-dark)' }}>Témoignages</div>
            <h2 className="section-title">Des histoires de solidarité</h2>
          </div>
          <div className="grid cols-3" style={{ gap: 32 }}>
            {testimonials.map((t, i) => (
              <div key={t.name} className="card testimonial fade-in" style={{ animationDelay: i * 0.12 + 's' }}>
                <div className="avatar"><Photo src={t.photo} alt={t.name} /></div>
                <p>« {t.quote} »</p>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={newsRef} className="container home-section first reveal">
        <StayInformedSection />
      </section>
    </main>
  );
}

function StayInformedSection() {
  const { subscribeNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const res = await subscribeNewsletter(email);
    setLoading(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setEmail('');
    } else {
      setFeedback({ type: 'error', message: res.error || "Une erreur s'est produite lors de l'inscription." });
    }
  };

  return (
    <div className="stay-informed-box">
      <div className="stay-informed-head">
        <div className="eyebrow" style={{ color: 'var(--gl-teal)' }}>Rester informé de nos actions</div>
        <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 32px)', margin: '4px 0 10px', lineHeight: 1.25 }}>
          Restez au cœur de la solidarité
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Recevez nos actualités par e-mail ou suivez nos distributions quotidiennes en direct sur nos réseaux officiels.
        </p>
      </div>

      <div className="stay-informed-grid">
        {/* Colonne gauche : Recevez nos actualités et cagnottes par e-mail */}
        <div className="stay-informed-col">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gl-teal)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              <Mail size={16} /> Lettre d'information
            </div>
            <h3 style={{ fontSize: 20, margin: '0 0 10px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Recevez nos actualités et nos cagnottes par e-mail
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Soyez prévenu(e) en avant-première lors du lancement de chaque nouvelle cagnotte solidaire, recevez les bilans financiers transparents et découvrez l'impact direct de chaque action.
            </p>
          </div>

          <div>
            {feedback?.type === 'success' ? (
              <div
                style={{
                  background: '#DCF3E4',
                  border: '1px solid #A3E0BA',
                  color: '#1C7A44',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ background: '#1C7A44', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Check size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Inscription confirmée !</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{feedback.message}</div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', padding: 0, marginTop: 8, fontSize: 12, color: '#1C7A44', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => setFeedback(null)}
                  >
                    Inscrire une autre adresse e-mail
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                <div className="stay-informed-form-group">
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="Votre adresse e-mail..."
                    aria-label="Adresse e-mail pour la newsletter"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-accent btn-submit"
                  >
                    <Send size={15} /> {loading ? 'Inscription...' : "S'inscrire"}
                  </button>
                </div>
                {feedback?.type === 'error' && (
                  <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>
                    {feedback.message}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  🔒 Garanti sans spam. <Link to="/desabonnement" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Désabonnement en 1 clic</Link>.
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Colonne droite : Nos réseaux sociaux */}
        <div className="stay-informed-col">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EA580C', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              <Sparkles size={16} /> En direct du terrain
            </div>
            <h3 style={{ fontSize: 20, margin: '0 0 10px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Suivez nos actions sur les réseaux sociaux
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 18px' }}>
              C'est sur nos réseaux que nous publions l'ensemble de nos actions en temps réel : reportages photos, vidéos immersives des distributions, témoignages émouvants et annonces. Rejoignez-nous !
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {/* Instagram */}
            <a
              href="https://instagram.com/hassanatespourtous?xtok=MWo4d2gzdmx0emI0bA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="card social-card-item"
              style={{
                border: '1px solid #F3E8FF',
                background: '#FAF5FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div
                  className="icon-box"
                  style={{
                    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                    boxShadow: '0 3px 10px rgba(214, 36, 159, 0.3)',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="title">Instagram</div>
                  <div className="subtitle">
                    @hassanatespourtous • Photos & Stories
                  </div>
                </div>
              </div>
              <span className="badge" style={{ color: '#7C3AED', background: '#EDE9FE' }}>
                Suivre ↗
              </span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@hassanates_pour_t?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              className="card social-card-item"
              style={{
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div
                  className="icon-box"
                  style={{
                    background: '#000',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.22)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.5V9.03a8.27 8.27 0 0 0 4.81 1.54V7.12a4.83 4.83 0 0 1-1-.43z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="title">TikTok</div>
                  <div className="subtitle">
                    @hassanates_pour_t • Vidéos terrain
                  </div>
                </div>
              </div>
              <span className="badge" style={{ color: '#111827', background: '#E5E7EB' }}>
                Suivre ↗
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/IiYrKQJ67BEInUSf0bGOlc"
              target="_blank"
              rel="noopener noreferrer"
              className="card social-card-item"
              style={{
                border: '1px solid #DCFCE7',
                background: '#F0FDF4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div
                  className="icon-box"
                  style={{
                    background: '#25D366',
                    boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="title">Communauté WhatsApp</div>
                  <div className="subtitle">
                    Groupe officiel • Actualités direct
                  </div>
                </div>
              </div>
              <span className="badge" style={{ color: '#15803D', background: '#DCFCE7' }}>
                Rejoindre ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

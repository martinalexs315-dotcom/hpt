import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { fmt, getCagnotteWhatsAppText, pctOf } from '../data.js';
import { useStore } from '../store.jsx';

export function Button({ variant = 'primary', block, className = '', ...rest }) {
  return <button type="button" className={`btn btn-${variant}${block ? ' btn-block' : ''} ${className}`} {...rest} />;
}

export function WhatsAppButton({ cagnotte, text, block, className = '', label = 'Partager sur WhatsApp' }) {
  const handleShare = (e) => {
    e.stopPropagation();
    const msg = text || (cagnotte ? getCagnotteWhatsAppText(cagnotte) : 'Découvrez Hassanates pour tous !');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      className={`btn btn-whatsapp${block ? ' btn-block' : ''} ${className}`}
      onClick={handleShare}
      title="Partager sur WhatsApp"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

export function Photo({ src, alt = '', placeholder, style, className = '' }) {
  if (!src) return <div className={`photo-placeholder ${className}`} style={style}>{placeholder}</div>;
  return <img className={`photo ${className}`} src={src} alt={alt} loading="lazy" style={style} />;
}

export function Progress({ pct, large, delay }) {
  return (
    <div className={`progress${large ? ' lg' : ''}`}>
      <div style={{ '--pct': pct + '%', animationDelay: delay }} />
    </div>
  );
}

export function StatusBadge({ status, style }) {
  return (
    <span className={`badge badge-${status}`} style={style}>
      {status === 'active' ? 'Active' : 'Clôturée'}
    </span>
  );
}

export function FeatureCard({ icon: Icon, title, children }) {
  return (
    <div className="card feature-card">
      <div className="icon"><Icon size={26} strokeWidth={1.8} /></div>
      <div className="title">{title}</div>
      <div className="text">{children}</div>
    </div>
  );
}

export function ActivityCard({ activity, index = 0 }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="card card-hover activity-card fade-in"
      style={{ animationDelay: index * 0.1 + 's' }}
      onClick={() => navigate('/activites/' + activity.id)}
    >
      <div className="thumb"><Photo src={activity.photo} alt={activity.title} placeholder={activity.title} /></div>
      <div className="body">
        <div className="cat">{activity.category}</div>
        <div className="title">{activity.title}</div>
        <p>{activity.desc}</p>
      </div>
    </button>
  );
}

export function CagnotteCard({ cagnotte: c, index = 0, showStatus, hover }) {
  const navigate = useNavigate();
  const { openDonation } = useStore();
  const pct = pctOf(c);
  const hasImpactReport = c.status === 'closed' && (c.closureReport || c.closurePhotos?.length);

  return (
    <div className={`card cagnotte-card fade-in${hover ? ' card-hover' : ''}`} style={{ animationDelay: index * 0.1 + 's' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
        <div className="title">{c.title}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {showStatus && <StatusBadge status={c.status} />}
          {hasImpactReport && (
            <span className="badge badge-impact" title="Rapport d'impact et photos de terrain disponibles">
              ✓ Bilan disponible
            </span>
          )}
        </div>
      </div>
      <p>{c.desc}</p>
      <div className="progress-meta"><span>{fmt(c.collected)}</span><span>{pct}% de {fmt(c.goal)}</span></div>
      <div style={{ marginBottom: 20 }}><Progress pct={pct} /></div>
      <div className="row stack-mobile" style={{ gap: 8 }}>
        {c.status === 'active' && <Button variant="accent" onClick={() => openDonation(c.title)}>Faire un don</Button>}
        <Button variant="outline" onClick={() => navigate('/cagnottes/' + c.id)}>
          {c.status === 'closed' ? 'Voir le bilan & photos' : 'Voir le détail'}
        </Button>
        {c.status === 'active' && <WhatsAppButton cagnotte={c} label="Partager" />}
      </div>
    </div>
  );
}

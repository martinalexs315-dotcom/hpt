import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, CalendarHeart, HandHeart, HeartHandshake, HelpCircle, House, Wallet } from 'lucide-react';
import { useIsMobile, useScrollY } from '../hooks.js';
import { useStore } from '../store.jsx';
import { Button } from './ui.jsx';
import DonationModal from './DonationModal.jsx';

const NAV = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/association', label: "Découvrir l'association" },
  { to: '/activites', label: 'Activités' },
  { to: '/cagnottes', label: 'Cagnottes' },
  { to: '/contact', label: 'Contact' },
];

const TABS = [
  { to: '/', label: 'Accueil', icon: House, end: true },
  { to: '/association', label: 'Association', icon: HeartHandshake },
  { to: '/activites', label: 'Activités', icon: CalendarHeart },
  { to: '/cagnottes', label: 'Cagnottes', icon: Wallet },
];

const LOGO = '/assets/logo-hassanates.png';

function DesktopHeader({ scrolled }) {
  const { openDonation } = useStore();
  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="inner">
        <Link to="/" className="brand">
          <img src={LOGO} alt="" />
          <span>Hassanates pour tous</span>
        </Link>
        <nav className="site-nav" aria-label="Navigation principale">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="header-cta">
          <Button variant="accent" onClick={() => openDonation()}>Faire un don</Button>
        </div>
      </div>
    </header>
  );
}

function MobileHeader() {
  const { openDonation } = useStore();
  const navigate = useNavigate();
  return (
    <header className="mobile-header">
      <div className="mobile-header-top">
        <Link to="/" className="mobile-brand" aria-label="Hassanates pour tous - Accueil">
          <img src={LOGO} alt="" />
          <span>Hassanates pour tous</span>
        </Link>
      </div>
      <div className="mobile-header-actions">
        <button
          type="button"
          className="mobile-btn-donate"
          onClick={() => openDonation()}
          title="Faire un don à l'association"
        >
          <HandHeart size={15} />
          <span>Faire un don</span>
        </button>
        <button
          type="button"
          className="mobile-btn-contact"
          onClick={() => navigate('/contact')}
          title="Nous contacter"
        >
          <HelpCircle size={14} />
          <span>Nous contacter</span>
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'default' }}>
          <img src={LOGO} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>Hassanates pour tous</span>
        </div>
        
        {/* Liens réseaux sociaux officiels avec icônes agrandies pour mobile */}
        <div className="footer-socials" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a
            href="https://instagram.com/hassanatespourtous?xtok=MWo4d2gzdmx0emI0bA%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Hassanates pour tous"
            title="Instagram Hassanates pour tous"
            className="social-icon social-instagram"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@hassanates_pour_t?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok Hassanates pour tous"
            title="TikTok Hassanates pour tous"
            className="social-icon social-tiktok"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.68a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.5V9.03a8.27 8.27 0 0 0 4.81 1.54V7.12a4.83 4.83 0 0 1-1-.43z" />
            </svg>
          </a>
          <a
            href="https://chat.whatsapp.com/IiYrKQJ67BEInUSf0bGOlc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Groupe WhatsApp Hassanates pour tous"
            title="Rejoindre notre communauté WhatsApp"
            className="social-icon social-whatsapp"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="small">© {new Date().getFullYear()} Hassanates pour tous</span>
          <Link to="/desabonnement" className="small" style={{ color: 'var(--gl-gray-400)', textDecoration: 'none' }}>
            Désabonnement
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const mobile = useIsMobile();
  const scrollY = useScrollY();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // Raccourci secret clavier pour l'équipe : Ctrl + Shift + H
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'H' || e.key === 'h')) {
        e.preventDefault();
        navigate('/gestion-interne-hpt-2026/login');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {mobile ? (
        <>
          <MobileHeader />
          <div className="mobile-header-spacer" />
        </>
      ) : (
        <>
          <DesktopHeader scrolled={scrollY > 40} />
          <div className="desktop-header-spacer" />
        </>
      )}
      <Outlet />
      <Footer />
      {mobile ? (
        <>
          <div className="mobile-tabs-spacer" />
          <nav className="mobile-tabs" aria-label="Navigation">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}><Icon size={20} />{label}</NavLink>
            ))}
          </nav>
        </>
      ) : (
        <button
          type="button"
          className={`to-top${scrollY > 500 ? ' show' : ''}`}
          aria-label="Revenir en haut"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp size={20} />
        </button>
      )}
      <DonationModal />
    </div>
  );
}

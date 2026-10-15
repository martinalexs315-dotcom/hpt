import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ImageUp,
  KeyRound,
  Lock,
  Mail,
  PencilLine,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { fmt, pctOf, PHOTOS } from '../data.js';
import {
  DEFAULT_MASTER_LOGIN,
  DEFAULT_MASTER_LOGIN_ALIAS,
  DEFAULT_MASTER_PASS,
  useStore,
} from '../store.jsx';
import { db } from '../firebase.js';
import { Button, Photo, Progress, StatusBadge } from '../components/ui.jsx';
import { processImageFile } from '../imageUtils.js';

const LOGO = '/assets/logo-hassanates.png';
const SECRET_BASE = '/gestion-interne-hpt-2026';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function AdminLogin() {
  const {
    isAdmin,
    loginWithMasterCredentials,
    loginWithGoogle,
    authLoading,
    sessionExpiredNotice,
    clearSessionExpiredNotice,
  } = useStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState(DEFAULT_MASTER_LOGIN_ALIAS);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Anti-Brute-Force State
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return Number(localStorage.getItem('hpt_failed_attempts')) || 0;
    } catch {
      return 0;
    }
  });
  const [lockedUntil, setLockedUntil] = useState(() => {
    try {
      const until = Number(localStorage.getItem('hpt_locked_until')) || 0;
      return until > Date.now() ? until : 0;
    } catch {
      return 0;
    }
  });
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) {
      setCountdownSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdownSeconds(remaining);
      if (remaining <= 0) {
        setLockedUntil(0);
        setFailedAttempts(0);
        try {
          localStorage.removeItem('hpt_locked_until');
          localStorage.removeItem('hpt_failed_attempts');
        } catch { /* ignore */ }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (isAdmin) return <Navigate to={SECRET_BASE} replace />;

  const isLocked = lockedUntil > Date.now();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isLocked || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);
    clearSessionExpiredNotice();

    try {
      const res = await loginWithMasterCredentials(username, password);
      if (res?.success) {
        // Succès : réinitialisation des tentatives
        setFailedAttempts(0);
        setLockedUntil(0);
        try {
          localStorage.removeItem('hpt_failed_attempts');
          localStorage.removeItem('hpt_locked_until');
        } catch { /* ignore */ }
        navigate(SECRET_BASE);
      } else {
        // Échec : incrémenter le compteur anti-brute-force
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          localStorage.setItem('hpt_failed_attempts', String(nextAttempts));
        } catch { /* ignore */ }

        if (nextAttempts >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_DURATION_MS;
          setLockedUntil(lockTime);
          try {
            localStorage.setItem('hpt_locked_until', String(lockTime));
          } catch { /* ignore */ }
          setErrorMessage(
            `Trop de tentatives erronées (${MAX_ATTEMPTS}/${MAX_ATTEMPTS}). Par mesure de sécurité absolue, l'accès est bloqué pendant 15 minutes.`
          );
        } else {
          const remaining = MAX_ATTEMPTS - nextAttempts;
          setErrorMessage(
            `Identifiant ou mot de passe incorrect. Attention : plus que ${remaining} tentative${remaining > 1 ? 's' : ''} avant blocage automatique de 15 minutes.`
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleBackup = async () => {
    if (isLocked) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (res?.success) {
        navigate(SECRET_BASE);
      } else if (res?.notRegistered) {
        setErrorMessage(`Le compte Google (${res.email}) n'est pas répertorié parmi les administrateurs.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="admin-login" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div className="box" style={{ maxWidth: 450, width: '100%', padding: '36px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img
            src={LOGO}
            alt=""
            style={{ width: 62, height: 62, borderRadius: '50%', marginBottom: 14, border: '2px solid rgba(0,0,0,0.06)' }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 4, textAlign: 'center' }}>
            Espace Sécurisé de l'Association
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Réservé à l'équipe de gestion Hassanates pour tous
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DCF3E4', color: '#1C7A44', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginTop: 10 }}>
            <ShieldCheck size={14} /> Espace d'administration réservé
          </div>
        </div>

        {/* Alerte déconnexion pour inactivité */}
        {sessionExpiredNotice && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>Votre session a été verrouillée automatiquement après 15 minutes d'inactivité pour protéger vos données.</div>
          </div>
        )}

        {/* Alerte verrouillage anti-brute-force */}
        {isLocked ? (
          <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', padding: '16px 18px', borderRadius: 10, fontSize: 13, marginBottom: 22, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              <ShieldAlert size={20} /> Accès temporairement gelé
            </div>
            <p style={{ margin: '0 0 10px', lineHeight: 1.4 }}>
              Cinq tentatives incorrectes consécutives ont été détectées. Pour empêcher toute tentative d'intrusion, le système est verrouillé.
            </p>
            <div style={{ background: '#fff', border: '1px solid #FCA5A5', padding: '8px 12px', borderRadius: 6, fontWeight: 800, fontSize: 16, color: '#B91C1C' }}>
              Déblocage dans : {formatCountdown(countdownSeconds)}
            </div>
          </div>
        ) : errorMessage ? (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 14px', borderRadius: 8, fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{errorMessage}</div>
          </div>
        ) : null}

        {/* Formulaire de connexion sécurisé pour l'équipe WhatsApp */}
        <form onSubmit={handlePasswordSubmit} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div className="field">
              <label htmlFor="adm-login">Identifiant d'équipe</label>
              <input
                id="adm-login"
                className="input"
                type="text"
                autoComplete="username"
                required
                disabled={isLocked || submitting}
                placeholder="admin-hpt ou admin@hassanates-pourtous.org"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="adm-pass">Mot de passe de sécurité</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <input
                id="adm-pass"
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isLocked || submitting}
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-block"
            disabled={isLocked || submitting || authLoading}
            style={{ fontWeight: 700, padding: '12px 16px', fontSize: 14 }}
          >
            {submitting ? 'Vérification du code...' : 'Déverrouiller l’espace admin'}
          </button>
        </form>

        {/* Séparateur et option Google de secours */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0', color: '#9CA3AF', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span>ou</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        <button
          type="button"
          className="btn btn-block"
          onClick={handleGoogleBackup}
          disabled={isLocked || submitting || authLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '10px 14px',
            fontSize: 13,
            background: '#F9FAFB',
            border: '1px solid #D1D5DB',
            color: '#374151',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Connexion Google (administrateur vérifié)
        </button>

        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, marginTop: 20, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: '#9CA3AF' }}>
            <Lock size={12} /> Déconnexion automatique après 15 min d’inactivité
          </div>
          <Link
            to="/"
            className="back-link"
            style={{ display: 'block', textAlign: 'center', marginTop: 8, marginBottom: 0, fontSize: 12, color: 'var(--text-secondary)' }}
          >
            ← Retour au site public
          </Link>
        </div>
      </div>
    </div>
  );
}

const ADMIN_NAV = [
  { to: SECRET_BASE, label: 'Tableau de bord', end: true },
  { to: `${SECRET_BASE}/activites`, label: 'Activités' },
  { to: `${SECRET_BASE}/cagnottes`, label: 'Cagnottes' },
  { to: `${SECRET_BASE}/dons`, label: 'Dons reçus' },
  { to: `${SECRET_BASE}/benevoles`, label: 'Bénévoles' },
  { to: `${SECRET_BASE}/messages`, label: 'Messages reçus' },
  { to: `${SECRET_BASE}/newsletter`, label: 'Emails aux abonnés' },
  { to: `${SECRET_BASE}/paiements`, label: 'Paiements' },
  { to: `${SECRET_BASE}/securite`, label: 'Sécurité & Accès' },
];

export const AdminContext = createContext({
  setModal: () => {},
  askConfirm: () => {},
  showToast: () => {},
});
export const useAdmin = () => useContext(AdminContext);

function ConfirmDialog({ dialog, onClose }) {
  if (!dialog) return null;
  const { title, message, confirmText = 'Supprimer', onConfirm, isDanger = true } = dialog;
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <div className="overlay" style={{ zIndex: 120 }} onClick={onClose}>
      <div
        className="card"
        style={{
          width: 440,
          maxWidth: '92vw',
          padding: 26,
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          animation: 'popIn 0.25s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: isDanger ? '#FEE2E2' : '#FEF3C7',
            color: isDanger ? '#DC2626' : '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Trash2 size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#0F172A' }}>
              {title}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '9px 18px' }}
            onClick={onClose}
            disabled={busy}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn"
            style={{
              background: isDanger ? '#DC2626' : 'var(--gl-teal)',
              color: '#fff',
              fontWeight: 700,
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? 'En cours...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineDeleteButton({
  onDelete,
  label = 'Supprimer',
  confirmLabel = 'Confirmer ?',
  busyLabel = 'Suppression...',
  successMessage = 'Élément supprimé avec succès.',
  title = 'Supprimer cet élément',
  style,
  className = 'link-btn danger',
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showToast } = useAdmin();

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4500);
    return () => clearTimeout(timer);
  }, [confirming]);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await onDelete();
      if (successMessage && showToast) {
        showToast(successMessage);
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast("Erreur lors de la suppression : " + (err.message || err));
      }
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          style={{
            background: '#DC2626',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            cursor: busy ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)',
            animation: 'popIn 0.15s ease both',
          }}
          title="Cliquez pour confirmer la suppression définitive"
        >
          <Trash2 size={12} />
          {busy ? busyLabel : confirmLabel}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
          style={{
            background: '#E5E7EB',
            color: '#4B5563',
            border: 'none',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Annuler"
        >
          ✕
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      title={title}
      style={style}
    >
      {label}
    </button>
  );
}

export default function Admin() {
  const { isAdmin, adminRole, currentUser, logout, authLoading, contactMessages, newsletterSubscribers } = useStore();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const askConfirm = useCallback((config) => {
    setConfirmDialog({
      ...config,
      onConfirm: async () => {
        try {
          await config.onConfirm();
          if (config.successMessage) {
            showToast(config.successMessage);
          }
        } catch (err) {
          console.error(err);
          showToast("Erreur lors de l'opération : " + (err.message || err));
        }
      },
    });
  }, [showToast]);

  const adminCtxValue = useMemo(() => ({
    setModal,
    askConfirm,
    showToast,
  }), [askConfirm, showToast]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Vérification des droits d'administration...</div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to={`${SECRET_BASE}/login`} replace />;

  const unreadMessagesCount = (contactMessages || []).filter((m) => m.status === 'new').length;
  const subscribersCount = (newsletterSubscribers || []).length;

  return (
    <AdminContext.Provider value={adminCtxValue}>
      <div className="admin">
        <aside>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, textDecoration: 'none' }} className="admin-brand">
            <img src={LOGO} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff' }}>Espace admin</span>
          </Link>
          <nav>
            {ADMIN_NAV.map((n) => {
              const isMsg = n.to.endsWith('/messages');
              const isNews = n.to.endsWith('/newsletter');
              return (
                <NavLink key={n.to} to={n.to} end={n.end} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{n.label}</span>
                  {isMsg && unreadMessagesCount > 0 && (
                    <span style={{ background: '#059669', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                      {unreadMessagesCount}
                    </span>
                  )}
                  {isNews && subscribersCount > 0 && (
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                      {subscribersCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="admin-meta">
            <div style={{ marginTop: 40, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: 12, color: 'var(--gl-gray-400)' }}>
              <div>Connecté en tant que</div>
              <div style={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all', marginTop: 2 }}>{currentUser?.displayName || currentUser?.email || 'Équipe WhatsApp'}</div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                {adminRole === 'superadmin' ? 'Super-administrateur' : 'Administrateur'}
              </div>
              <div style={{ fontSize: 11, color: '#34D399', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} /> Auto-déconnexion : 15 min
              </div>
            </div>
            <button type="button" className="admin-ghost-btn" onClick={() => navigate('/')}>Retour au site public</button>
            <button type="button" className="admin-ghost-btn" onClick={() => { logout(); navigate('/'); }}>Se déconnecter</button>
          </div>
        </aside>

        <main>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="activites" element={<AdminActivities />} />
            <Route path="cagnottes" element={<AdminCagnottes />} />
            <Route path="dons" element={<AdminDonations />} />
            <Route path="benevoles" element={<AdminBenevoles />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="paiements" element={<AdminPaiements />} />
            <Route path="securite" element={<AdminSecurity />} />
            <Route path="*" element={<Navigate to={SECRET_BASE} replace />} />
          </Routes>
        </main>

        {modal && <EditModal modal={modal} setModal={setModal} />}
        {confirmDialog && (
          <ConfirmDialog
            dialog={confirmDialog}
            onClose={() => setConfirmDialog(null)}
          />
        )}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 200,
            background: '#0F172A',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            animation: 'fadeInUp 0.25s ease both',
          }}>
            <CheckCircle2 size={18} style={{ color: '#10B981' }} />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
}

function Dashboard() {
  const {
    activities,
    cagnottes,
    donations,
    volunteerApplications,
    contactMessages,
    newsletterSubscribers,
    newsletterBroadcasts,
    featuredCagnotteId,
    setFeaturedCagnotte,
    stats,
    setStat,
  } = useStore();

  const active = cagnottes.filter((c) => c.status === 'active');
  const totalCollectedCagnottes = cagnottes.reduce((s, c) => s + (Number(c.collected) || 0), 0);
  const unreadMessagesCount = (contactMessages || []).filter((m) => m.status === 'new').length;
  const currentFeatured = cagnottes.find((c) => c.id === featuredCagnotteId) || cagnottes[0];

  const cards = [
    { label: 'Activités publiées', value: activities.length },
    { label: 'Cagnottes créées', value: cagnottes.length },
    { label: 'Total collecté', value: fmt(totalCollectedCagnottes) },
    { label: 'Dons enregistrés', value: donations.length },
    { label: 'Candidatures bénévoles', value: volunteerApplications.length },
    {
      label: 'Messages reçus',
      value: contactMessages.length + (unreadMessagesCount > 0 ? ` (${unreadMessagesCount} non lu${unreadMessagesCount > 1 ? 's' : ''})` : ''),
    },
    { label: 'Abonnés e-mails', value: (newsletterSubscribers || []).length },
    { label: 'Diffusions envoyées', value: (newsletterBroadcasts || []).length },
  ];

  const fields = [
    { key: 'beneficiaries', label: 'Bénéficiaires accompagnés' },
    { key: 'fundsM', label: 'Collectés depuis création (M FCFA)' },
    { key: 'activitiesCount', label: 'Activités menées' },
    { key: 'volunteers', label: 'Bénévoles engagés' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <h1 style={{ margin: 0 }}>Tableau de bord</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#DCF3E4', color: '#1C7A44', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
          <Check size={14} /> Synchronisation Firestore active
        </div>
      </div>

      <div className="grid cols-4" style={{ gap: 16, marginBottom: 32 }}>
        {cards.map((s, i) => (
          <div key={s.label} className="card pop-in" style={{ padding: 20, animationDelay: i * 0.08 + 's' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Contrôle de la cagnotte en vedette sur l'Accueil (Hero) */}
      <div className="card" style={{ padding: 24, marginBottom: 24, border: '1.5px solid var(--gl-teal)', background: '#F0FDF4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1C7A44', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Star size={14} fill="#1C7A44" /> Mise en avant sur la page d'accueil (Hero)
            </div>
            <h2 style={{ fontSize: 18, margin: '4px 0 6px', fontFamily: 'var(--font-display)' }}>
              Cagnotte mise en avant en haut du site public
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Cette cagnotte s'affiche dans la carte en bas à droite de la section d'introduction, avec jauge d'avancement et bouton d'action direct.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label htmlFor="featured-cagnotte-select" style={{ fontSize: 13, fontWeight: 700 }}>Sélectionner :</label>
            <select
              id="featured-cagnotte-select"
              className="input"
              value={featuredCagnotteId || ''}
              onChange={(e) => setFeaturedCagnotte(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 14, fontWeight: 600, minWidth: 240, background: '#fff' }}
            >
              {cagnottes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.status === 'active' ? 'Active' : 'Clôturée'} - {pctOf(c)}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentFeatured && (
          <div style={{ background: '#fff', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🌟 Actuellement à l'affiche : </span>
              <span style={{ fontWeight: 800, color: '#047857', fontSize: 15 }}>{currentFeatured.title}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 10 }}>
                ({fmt(currentFeatured.collected)} collectés sur {fmt(currentFeatured.goal)} — {pctOf(currentFeatured)}%)
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: currentFeatured.status === 'active' ? '#DCFCE7' : '#F3F4F6', color: currentFeatured.status === 'active' ? '#166534' : '#6B7280' }}>
              Statut : {currentFeatured.status === 'active' ? 'En cours de collecte' : 'Clôturée'}
            </span>
          </div>
        )}
      </div>

      {/* Chiffres clés synchronisés avec la base de données Firestore */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>
            Chiffres clés de l'association (Notre impact & Découvrir l'association)
          </div>
          <span style={{ fontSize: 12, color: 'var(--gl-teal)', fontWeight: 700 }}>
            ⚡ Synchronisé en direct avec la base de données Firestore
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
          Ces chiffres alimentent simultanément la page d'accueil (« Notre impact ») et la page « Découvrir l'association » (« Nos réalisations en chiffres »).
        </div>
        <div className="grid cols-4" style={{ gap: 16 }}>
          {fields.map((f) => (
            <div key={f.key} className="field">
              <label htmlFor={'st-' + f.key}>{f.label}</label>
              <input
                id={'st-' + f.key}
                type="number"
                min="0"
                step={f.key === 'fundsM' ? '0.1' : '1'}
                className="input"
                style={{ padding: '10px 12px', fontWeight: 700 }}
                value={stats[f.key] !== undefined ? stats[f.key] : ''}
                onChange={(e) => setStat(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, marginBottom: 18 }}>Avancement des cagnottes actives</div>
        {active.length === 0 && <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Aucune cagnotte active.</div>}
        {active.map((c) => (
          <div key={c.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6, gap: 12 }}>
              <span style={{ fontWeight: 600 }}>{c.title}</span>
              <span style={{ fontWeight: 700, color: 'var(--gl-teal)' }}>{pctOf(c)}% ({fmt(c.collected)} / {fmt(c.goal)})</span>
            </div>
            <Progress pct={pctOf(c)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminActivities() {
  const { activities, deleteActivity } = useStore();
  const { setModal, askConfirm } = useAdmin();
  const cols = { gridTemplateColumns: '2fr 1fr 3fr 1.2fr' };
  const create = () => setModal({
    type: 'activity', mode: 'create',
    form: {
      id: 'activite-' + Date.now(),
      title: '',
      category: 'Fête religieuse',
      desc: '',
      quote: '',
      quoteAuthor: '',
      contexte: '',
      actions: '',
      resultats: '',
      photo: PHOTOS[0],
      gallery: [],
    },
  });

  return (
    <div>
      <div className="admin-head">
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Activités</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Gérez vos actions terrain, ajoutez et organisez les photos de la galerie de chaque activité.
          </div>
        </div>
        <Button variant="accent" onClick={create}>+ Nouvelle activité</Button>
      </div>
      <div className="card table">
        <div className="tr th" style={cols}><div>Titre</div><div>Catégorie</div><div>Description & Galerie</div><div>Actions</div></div>
        {activities.map((a) => (
          <div key={a.id} className="tr" style={cols}>
            <div style={{ fontWeight: 600 }}>{a.title}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{a.category}</div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{a.desc}</div>
              <div style={{ marginTop: 4 }}>
                {Array.isArray(a.gallery) && a.gallery.length > 0 ? (
                  <span style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>
                    📸 {a.gallery.length} photo(s) dans la galerie
                  </span>
                ) : (
                  <span style={{ fontSize: 11, background: '#F3F4F6', color: '#6B7280', padding: '1px 7px', borderRadius: 4 }}>
                    Aucune photo personnalisée
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <button
                type="button"
                className="link-btn"
                onClick={() => setModal({ type: 'activity', mode: 'edit', form: { ...a, gallery: Array.isArray(a.gallery) ? a.gallery : [] } })}
              >
                Modifier
              </button>
              <InlineDeleteButton
                onDelete={() => deleteActivity(a.id)}
                label="Supprimer"
                confirmLabel="Confirmer suppression ?"
                successMessage={`L'activité « ${a.title} » a été supprimée.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCagnottes() {
  const { cagnottes, saveCagnotte, deleteCagnotte, featuredCagnotteId, setFeaturedCagnotte } = useStore();
  const { setModal, askConfirm } = useAdmin();
  const cols = { gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1.2fr 1.8fr' };
  const create = () => setModal({
    type: 'cagnotte', mode: 'create',
    form: {
      id: 'cagnotte-' + Date.now(),
      title: '',
      desc: '',
      storyTitle: '',
      story: '',
      goal: 1000000,
      collected: 0,
      start: '',
      end: '',
      status: 'active',
      closureReport: '',
      closurePhotos: [],
    },
  });

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Cagnottes</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Gérez vos collectes, rédigez le texte explicatif de chaque cagnotte, clôturez ou réactivez les campagnes, et choisissez celle qui est mise en avant.
          </div>
        </div>
        <Button variant="accent" onClick={create}>+ Nouvelle cagnotte</Button>
      </div>

      {/* Barre de contrôle Hero */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Star size={18} fill="#059669" color="#059669" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
            Cagnotte actuellement mise en avant dans le Hero de l'accueil :
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="input"
            value={featuredCagnotteId || ''}
            onChange={(e) => setFeaturedCagnotte(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, fontWeight: 700, background: '#fff', minWidth: 220 }}
          >
            {cagnottes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.status === 'active' ? 'Active' : 'Clôturée'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card table">
        <div className="tr th" style={cols}>
          <div>Titre de la cagnotte</div>
          <div>Objectif</div>
          <div>Collecté</div>
          <div>Statut</div>
          <div>En vedette (Hero)</div>
          <div>Actions</div>
        </div>
        {cagnottes.map((c) => {
          const isFeatured = c.id === featuredCagnotteId;
          const isActive = c.status === 'active';
          return (
            <div key={c.id} className="tr" style={cols}>
              <div>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{c.title}</span>
                  {isFeatured && (
                    <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Star size={11} fill="#15803D" /> À l'affiche
                    </span>
                  )}
                </div>
                {c.desc && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.desc}</div>}
                <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {c.story ? (
                    <span style={{ fontSize: 11, color: '#059669', background: '#ECFDF5', padding: '1px 7px', borderRadius: 4, fontWeight: 600 }}>
                      ✓ Texte explicatif configuré
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#D97706', background: '#FEF3C7', padding: '1px 7px', borderRadius: 4 }}>
                      ⚠ Aucun texte explicatif
                    </span>
                  )}
                </div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>{fmt(c.goal)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gl-teal)' }}>{fmt(c.collected)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{pctOf(c)}% atteint</div>
              </div>
              <div><StatusBadge status={c.status} /></div>
              <div>
                <button
                  type="button"
                  onClick={() => setFeaturedCagnotte(c.id)}
                  style={{
                    background: isFeatured ? '#DCFCE7' : 'var(--gl-gray-100)',
                    color: isFeatured ? '#15803D' : 'var(--text)',
                    border: isFeatured ? '1px solid #86EFAC' : '1px solid var(--border-subtle)',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                  title="Afficher cette cagnotte dans le coin de la section d'introduction de la page d'accueil"
                >
                  <Star size={13} fill={isFeatured ? '#15803D' : 'none'} />
                  {isFeatured ? 'En vedette' : 'Mettre en vedette'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setModal({ type: 'cagnotte', mode: 'edit', form: { ...c } })}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="link-btn"
                  style={{ color: isActive ? '#D97706' : '#059669', fontWeight: 600 }}
                  onClick={() => saveCagnotte({ ...c, status: isActive ? 'closed' : 'active' })}
                >
                  {isActive ? 'Clôturer' : 'Réactiver'}
                </button>
                <InlineDeleteButton
                  onDelete={() => deleteCagnotte(c.id)}
                  label="Supprimer"
                  confirmLabel="Confirmer suppression ?"
                  successMessage={`La cagnotte « ${c.title} » a été supprimée.`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDonations() {
  const { donations } = useStore();
  const [filterMethod, setFilterMethod] = useState('all');
  const [search, setSearch] = useState('');

  const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const waveAmount = donations.filter((d) => d.method === 'wave').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const omAmount = donations.filter((d) => d.method === 'om').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const filtered = donations.filter((d) => {
    if (filterMethod !== 'all' && d.method !== filterMethod) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchReceipt = (d.receiptNumber || '').toLowerCase().includes(q);
      const matchCagnotte = (d.cagnotteTitle || '').toLowerCase().includes(q);
      const matchEmail = (d.donorEmail || '').toLowerCase().includes(q);
      return matchReceipt || matchCagnotte || matchEmail;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Dons reçus</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Historique en direct des dons enregistrés et attestations émises dans la base de données.
          </div>
        </div>
      </div>

      <div className="grid cols-3" style={{ gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Total des dons enregistrés</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--gl-teal)' }}>
            {fmt(totalAmount)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{donations.length} transaction(s) reçue(s)</div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Collecté via Wave</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#00B4D8' }}>
            {fmt(waveAmount)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {donations.filter((d) => d.method === 'wave').length} don(s)
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Collecté via Orange Money</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#FF7900' }}>
            {fmt(omAmount)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {donations.filter((d) => d.method === 'om').length} don(s)
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtre */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher par reçu, cagnotte ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 360, flex: 1 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'wave', 'om'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilterMethod(m)}
              className="btn"
              style={{
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                background: filterMethod === m ? 'var(--gl-teal-dark)' : 'var(--gl-gray-100)',
                color: filterMethod === m ? '#fff' : 'var(--text)',
                border: 'none',
              }}
            >
              {m === 'all' ? 'Tous' : m === 'wave' ? 'Wave uniquement' : 'Orange Money uniquement'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Aucun don enregistré pour le moment.
        </div>
      ) : (
        <div className="card table">
          <div className="tr th" style={{ gridTemplateColumns: '1.2fr 2fr 1.2fr 1fr 1.5fr' }}>
            <div>Date</div>
            <div>Cagnotte</div>
            <div>Montant</div>
            <div>Moyen</div>
            <div>N° de reçu / Donateur</div>
          </div>
          {filtered.map((d) => (
            <div key={d.id} className="tr" style={{ gridTemplateColumns: '1.2fr 2fr 1.2fr 1fr 1.5fr' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.createdAt}</div>
              <div style={{ fontWeight: 600 }}>{d.cagnotteTitle || 'Don direct à l’association'}</div>
              <div style={{ fontWeight: 800, color: 'var(--gl-teal)' }}>{fmt(d.amount)}</div>
              <div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    background: d.method === 'wave' ? '#E0F2FE' : '#FFEDD5',
                    color: d.method === 'wave' ? '#0369A1' : '#C2410C',
                  }}
                >
                  {d.method === 'wave' ? 'Wave' : 'Orange Money'}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{d.receiptNumber}</div>
                {d.donorEmail && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.donorEmail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPaiements() {
  const { paymentMethods, togglePayment } = useStore();
  const items = [
    { key: 'wave', label: 'Wave', text: "Paiement direct Wave avec lien de redirection pour les donateurs." },
    { key: 'om', label: 'Orange Money', text: "Paiement direct Orange Money pour les donateurs." },
  ];
  return (
    <div>
      <h1>Moyens de paiement</h1>
      <div className="grid cols-2" style={{ gap: 20, maxWidth: 700 }}>
        {items.map((m) => {
          const on = paymentMethods[m.key];
          return (
            <div key={m.key} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{m.label}</span>
                <button type="button" className="badge" aria-pressed={on} onClick={() => togglePayment(m.key)}
                  style={{ border: 'none', cursor: 'pointer', background: on ? 'var(--gl-teal-tint)' : 'var(--gl-gray-100)', color: on ? 'var(--gl-teal-dark)' : 'var(--text-secondary)' }}>
                  {on ? 'Actif' : 'Inactif'}
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{m.text} Cliquez sur le badge pour l'activer ou le désactiver.</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminBenevoles() {
  const {
    volunteerRecruitmentActive,
    toggleVolunteerRecruitment,
    volunteerApplications,
    deleteVolunteerApplication,
    setVolunteerApplicationStatus,
  } = useStore();
  const { askConfirm } = useAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Candidatures de bénévoles</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Gérez les candidatures et contrôlez l'affichage du formulaire sur le site public en un clic
          </div>
        </div>

        <div className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
              Campagne publique
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: volunteerRecruitmentActive ? '#1C7A44' : 'var(--text-secondary)' }}>
              {volunteerRecruitmentActive ? '✓ Recrutement activé' : '✕ Recrutement désactivé'}
            </div>
          </div>
          <button
            type="button"
            className="btn"
            onClick={toggleVolunteerRecruitment}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              background: volunteerRecruitmentActive ? '#DCF3E4' : 'var(--gl-gray-100)',
              color: volunteerRecruitmentActive ? '#1C7A44' : 'var(--gl-gray-700)',
              border: '1.5px solid currentColor',
            }}
          >
            {volunteerRecruitmentActive ? 'Désactiver (1 clic)' : 'Activer (1 clic)'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {volunteerRecruitmentActive ? (
          <div style={{ background: '#DCF3E4', color: '#1C7A44', padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>●</span>
            <span>Le formulaire de candidature est <strong>actuellement visible</strong> sur la page « Découvrir l'association ».</span>
          </div>
        ) : (
          <div style={{ background: 'var(--gl-gray-100)', color: 'var(--gl-gray-700)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>○</span>
            <span>Le formulaire de candidature est <strong>masqué du site public</strong>.</span>
          </div>
        )}
      </div>

      {(!volunteerApplications || volunteerApplications.length === 0) ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Aucune candidature reçue pour le moment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {volunteerApplications.map((app) => (
            <div key={app.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>{app.name}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: app.status === 'contacted' ? '#E0F2FE' : '#FEF3C7',
                      color: app.status === 'contacted' ? '#0369A1' : '#B45309',
                    }}>
                      {app.status === 'contacted' ? '✓ Contacté' : '● Nouveau'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Reçue le {app.createdAt} • Résidence : {app.commune ? `${app.commune}, ` : ''}{app.city || 'Abidjan'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {app.status !== 'contacted' ? (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setVolunteerApplicationStatus(app.id, 'contacted')}
                      style={{ fontSize: 12, color: '#0369A1' }}
                    >
                      Marquer comme contacté
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setVolunteerApplicationStatus(app.id, 'new')}
                      style={{ fontSize: 12, color: '#B45309' }}
                    >
                      Remettre à nouveau
                    </button>
                  )}
                  <InlineDeleteButton
                    onDelete={() => deleteVolunteerApplication(app.id)}
                    label="Supprimer"
                    confirmLabel="Supprimer ?"
                    successMessage={`La candidature de ${app.name} a été supprimée.`}
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>

              <div className="grid cols-3" style={{ gap: 12, background: 'var(--gl-gray-50)', padding: 14, borderRadius: 8, fontSize: 13, marginBottom: app.message ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>WhatsApp</div>
                  <a href={`https://wa.me/${(app.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1C7A44', fontWeight: 600, textDecoration: 'none' }}>
                    {app.phone} ↗
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Domaine d'aide</div>
                  <div style={{ fontWeight: 600 }}>{app.domain}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Disponibilité</div>
                  <div>{app.availability}</div>
                </div>
              </div>

              {app.message && (
                <div style={{ fontSize: 13, background: '#fff', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 6, color: 'var(--text)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>Motivation / Message :</div>
                  {app.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminMessages() {
  const { contactMessages, markContactMessageStatus, deleteContactMessage } = useStore();
  const { askConfirm } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = (contactMessages || []).filter((m) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'new'
        ? m.status === 'new'
        : m.status !== 'new';
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      m.name?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) ||
      m.phone?.toLowerCase().includes(s) ||
      m.message?.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  const unreadTotal = (contactMessages || []).filter((m) => m.status === 'new').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Messages reçus</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Consultez les messages envoyés depuis la page Contact par les donateurs, partenaires et citoyens
          </div>
        </div>

        {unreadTotal > 0 && (
          <div style={{ background: '#DCF3E4', color: '#1C7A44', padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={15} /> {unreadTotal} nouveau{unreadTotal > 1 ? 'x' : ''} non lu{unreadTotal > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone ou mot-clé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 380, flex: 1 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all', label: `Tous (${(contactMessages || []).length})` },
            { id: 'new', label: `Nouveaux (${unreadTotal})` },
            { id: 'processed', label: `Traités (${(contactMessages || []).length - unreadTotal})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id)}
              className="btn"
              style={{
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                background: filterStatus === f.id ? 'var(--gl-teal-dark)' : 'var(--gl-gray-100)',
                color: filterStatus === f.id ? '#fff' : 'var(--text)',
                border: 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Mail size={36} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Aucun message à afficher</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Les messages envoyés sur le site apparaîtront ici automatiquement en temps réel.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((m) => {
            const isNew = m.status === 'new';
            return (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: 24,
                  borderLeft: isNew ? '4px solid #059669' : '1px solid var(--border-subtle)',
                  background: isNew ? '#FAFCFA' : '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{m.name}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: isNew ? '#DCF3E4' : '#F3F4F6',
                          color: isNew ? '#1C7A44' : '#6B7280',
                        }}
                      >
                        {isNew ? '● Nouveau' : '✓ Traité / Lu'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <a href={`mailto:${m.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>✉ {m.email}</a>
                      {m.phone && m.phone !== 'Non renseigné' && (
                        <a
                          href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1C7A44', fontWeight: 600, textDecoration: 'none' }}
                        >
                          📞 WhatsApp : {m.phone} ↗
                        </a>
                      )}
                      <span>🕒 {m.createdAt}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <a
                      href={`mailto:${m.email}?subject=Réponse: Association Hassanates Pour Tous`}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Mail size={13} /> Répondre par e-mail
                    </a>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => markContactMessageStatus(m.id, isNew ? 'read' : 'new')}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        background: 'var(--gl-gray-100)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {isNew ? 'Marquer comme lu' : 'Marquer comme non lu'}
                    </button>
                    <InlineDeleteButton
                      onDelete={() => deleteContactMessage(m.id)}
                      label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Trash2 size={13} /> Supprimer</span>}
                      confirmLabel="Supprimer définitivement ?"
                      className="btn"
                      style={{
                        padding: '6px 10px',
                        fontSize: 12,
                        color: '#EF4444',
                        background: '#FEE2E2',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      successMessage={`Le message de « ${m.name} » a été supprimé.`}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: '#F9FAFB',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  {m.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminNewsletter() {
  const {
    newsletterSubscribers,
    newsletterBroadcasts,
    subscribeNewsletter,
    deleteNewsletterSubscriber,
    sendNewsletterBroadcast,
    deleteNewsletterBroadcast,
  } = useStore();
  const { askConfirm } = useAdmin();

  const [form, setForm] = useState({
    subject: '',
    category: 'Actualité générale',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [search, setSearch] = useState('');

  const subscribers = newsletterSubscribers || [];
  const broadcasts = newsletterBroadcasts || [];

  const filteredSubs = subscribers.filter((s) =>
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    if (subscribers.length === 0) {
      askConfirm({
        title: "Diffuser sans abonné ?",
        message: "Il n'y a actuellement aucun abonné inscrit à la newsletter. Souhaitez-vous quand même enregistrer cette diffusion dans l'historique ?",
        confirmText: 'Enregistrer dans l’historique',
        isDanger: false,
        onConfirm: async () => {
          setSending(true);
          const res = await sendNewsletterBroadcast({
            subject: form.subject,
            category: form.category,
            message: form.message,
          });
          setSending(false);
          if (res.success) {
            setSendResult({ type: 'success', message: 'Diffusion enregistrée dans l’historique avec succès !' });
            setForm({ subject: '', category: 'Actualité générale', message: '' });
          }
        },
      });
      return;
    }
    setSending(true);
    const res = await sendNewsletterBroadcast({
      subject: form.subject,
      category: form.category,
      message: form.message,
    });
    setSending(false);
    if (res.success) {
      setSendResult({
        type: 'success',
        message: `Message « ${form.subject} » diffusé avec succès auprès de ${res.count} abonné(s) inscrit(s) !`,
      });
      setForm({ subject: '', category: 'Actualité générale', message: '' });
    } else {
      setSendResult({ type: 'error', message: res.error || "Erreur lors de l'envoi." });
    }
  };

  const handleAddManualEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAddingEmail(true);
    const res = await subscribeNewsletter(newEmail.trim());
    setAddingEmail(false);
    if (res.success) {
      setNewEmail('');
    } else {
      alert(res.error || "Erreur lors de l'ajout.");
    }
  };

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Emails & Newsletter aux abonnés</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Communiquez directement avec toutes les personnes inscrites à la newsletter pour annoncer les nouvelles cagnottes et les bilans d'action.
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid cols-3" style={{ gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Abonnés inscrits</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--gl-teal)' }}>
            {subscribers.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Destinataires enregistrés en base</div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Diffusions effectuées</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#3B82F6' }}>
            {broadcasts.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Campagnes d'information envoyées</div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Canal de diffusion</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#10B981' }}>
            Direct & Sécurisé
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Diffusion collective automatisée</div>
        </div>
      </div>

      {/* Formulaire d'envoi aux abonnés */}
      <div className="card" style={{ padding: 28, marginBottom: 32, border: '1.5px solid var(--gl-teal)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DCF3E4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={16} />
          </div>
          <h2 style={{ fontSize: 20, margin: 0, fontFamily: 'var(--font-display)' }}>
            Diffuser un e-mail à tous les abonnés ({subscribers.length} destinataire{subscribers.length > 1 ? 's' : ''})
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Ce message sera transmis à l'ensemble des adresses e-mail de personnes inscrites via la section « Restez informés de nos actions » du site.
        </p>

        {sendResult && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 8,
              marginBottom: 20,
              background: sendResult.type === 'success' ? '#DCF3E4' : '#FEE2E2',
              color: sendResult.type === 'success' ? '#166534' : '#991B1B',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{sendResult.message}</span>
            <button
              type="button"
              onClick={() => setSendResult(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="grid cols-2" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="broad-subject">Objet de l'e-mail *</label>
              <input
                id="broad-subject"
                required
                className="input"
                placeholder="Ex : Lancement de la cagnotte Tabaski 2026 — Soutenez nos familles"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="broad-cat">Type de message</label>
              <select
                id="broad-cat"
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Actualité générale">Actualité générale</option>
                <option value="Lancement de cagnotte">Lancement de cagnotte</option>
                <option value="Bilan d'action & Transparence">Bilan d'action & Transparence</option>
                <option value="Appel urgent à la solidarité">Appel urgent à la solidarité</option>
                <option value="Remerciements aux donateurs">Remerciements aux donateurs</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="broad-msg">Corps du message *</label>
            <textarea
              id="broad-msg"
              required
              rows={6}
              className="input"
              placeholder="Rédigez ici votre message à destination de la communauté..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {/* Aperçu du rendu de l'email */}
          {(form.subject || form.message) && (
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Aperçu de l'e-mail qui sera reçu par les abonnés
              </div>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: 20 }}>
                <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{form.subject || '(Objet du message)'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    De : <strong>Hassanates pour tous</strong> &lt;contact@hassanates-pourtous.org&gt;
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {form.message || '(Contenu du message)'}
                </div>
                <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span>Cet e-mail a été envoyé aux abonnés de l'association Hassanates pour tous.</span>
                  <span style={{ textDecoration: 'underline', color: '#6B7280' }}>Se désabonner en 1 clic</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {subscribers.length === 0 ? '⚠️ Aucun abonné pour le moment' : `Prêt pour ${subscribers.length} destinataire(s)`}
            </span>
            <Button variant="accent" type="submit" disabled={sending}>
              <Send size={15} /> {sending ? 'Envoi en cours...' : `Envoyer à tous les abonnés (${subscribers.length})`}
            </Button>
          </div>
        </form>
      </div>

      {/* Section Liste des abonnés */}
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>
              Liste des abonnés inscrits ({subscribers.length})
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Personnes inscrites depuis la page d'accueil ou ajoutées manuellement.
            </div>
          </div>

          <form onSubmit={handleAddManualEmail} style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              required
              placeholder="Ajouter une adresse e-mail..."
              className="input"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, minWidth: 240 }}
            />
            <Button variant="outline" type="submit" disabled={addingEmail} style={{ padding: '8px 14px', fontSize: 13 }}>
              + Ajouter
            </Button>
          </form>
        </div>

        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Rechercher parmi les e-mails..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300, padding: '8px 12px', fontSize: 13 }}
          />
        </div>

        {filteredSubs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            Aucune adresse e-mail trouvée.
          </div>
        ) : (
          <div className="table">
            <div className="tr th" style={{ gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr' }}>
              <div>Adresse e-mail</div>
              <div>Date d'inscription</div>
              <div>Statut</div>
              <div>Actions</div>
            </div>
            {filteredSubs.map((s) => (
              <div key={s.id} className="tr" style={{ gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr' }}>
                <div style={{ fontWeight: 600 }}>{s.email}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.subscribedAt || '—'}</div>
                <div>
                  <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                    Actif
                  </span>
                </div>
                <div>
                  <InlineDeleteButton
                    onDelete={() => deleteNewsletterSubscriber(s.id)}
                    label="Désinscrire"
                    confirmLabel="Confirmer désinscription ?"
                    successMessage={`L'adresse ${s.email} a été désinscrite.`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des diffusions */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
          Historique des e-mails diffusés ({broadcasts.length})
        </h2>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
          Enregistrement de tous les messages envoyés à la liste de diffusion.
        </div>

        {broadcasts.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            Aucune diffusion effectuée pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {broadcasts.map((b) => (
              <div key={b.id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{b.subject}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#E0F2FE', color: '#0369A1' }}>
                        {b.category || 'Actualité'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Envoyé le {b.sentAt} à <strong>{b.recipientsCount} abonné(s)</strong>
                    </div>
                  </div>
                  <InlineDeleteButton
                    onDelete={() => deleteNewsletterBroadcast(b.id)}
                    label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Trash2 size={13} /> Supprimer</span>}
                    confirmLabel="Supprimer ?"
                    className="btn"
                    style={{ padding: '4px 8px', fontSize: 12, color: '#EF4444', background: '#FEE2E2', border: 'none', cursor: 'pointer' }}
                    title="Supprimer cette diffusion de l'historique"
                    successMessage="La diffusion a été supprimée de l'historique."
                  />
                </div>
                <div style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'pre-wrap', lineHeight: 1.5, background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #F3F4F6' }}>
                  {b.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSecurity() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [currentMasterPass, setCurrentMasterPass] = useState(DEFAULT_MASTER_PASS);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passFeedback, setPassFeedback] = useState(null);

  useEffect(() => {
    // Charger le mot de passe actuel depuis Firestore si personnalisé
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'security'));
        if (snap.exists() && snap.data().masterPassword) {
          setCurrentMasterPass(snap.data().masterPassword);
        }
      } catch { /* fallback */ }
    })();
  }, []);

  const copyToClipboard = (text, isId = false) => {
    navigator.clipboard?.writeText(text);
    if (isId) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 8) {
      setPassFeedback({ type: 'error', message: 'Le mot de passe doit comporter au moins 8 caractères.' });
      return;
    }
    setSavingPassword(true);
    setPassFeedback(null);
    try {
      await setDoc(doc(db, 'settings', 'security'), { masterPassword: newPasswordInput.trim() }, { merge: true });
      setCurrentMasterPass(newPasswordInput.trim());
      setNewPasswordInput('');
      setPassFeedback({ type: 'success', message: 'Mot de passe d’équipe mis à jour avec succès !' });
    } catch (err) {
      setPassFeedback({ type: 'error', message: 'Erreur lors de la mise à jour : ' + err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="admin-head" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Accès de l'équipe</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Identifiants et accès pour les membres de confiance de l'association.
          </div>
        </div>
      </div>

      {/* Raccourci d'accès */}
      <div className="card" style={{ padding: 24, marginBottom: 26 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
          Accès à l'espace
        </div>
        <div style={{ background: 'var(--gl-gray-50)', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            <KeyRound size={16} style={{ color: 'var(--gl-terracotta)' }} /> Raccourci sur ordinateur (Clavier)
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Pressez simultanément les touches :<br />
            <kbd style={{ background: '#fff', border: '1px solid #D1D5DB', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>Ctrl</kbd> + <kbd style={{ background: '#fff', border: '1px solid #D1D5DB', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>Shift</kbd> + <kbd style={{ background: '#fff', border: '1px solid #D1D5DB', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>H</kbd><br />
            Cela ouvre directement la page de connexion. Sur téléphone portable, la connexion se fait via le lien secret transmis.
          </div>
        </div>
      </div>

      {/* Identifiants uniques pour le groupe WhatsApp */}
      <div className="card" style={{ padding: 28, marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Users size={22} style={{ color: 'var(--gl-teal)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>
              Identifiant unique à partager avec les membres de confiance de l'association
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Transmettez ces informations uniquement aux membres de confiance de l'association.
            </div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 20, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Identifiant d'équipe autorisé</div>
              <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{DEFAULT_MASTER_LOGIN_ALIAS}</div>
            </div>
            <Button variant="outline" onClick={() => copyToClipboard(DEFAULT_MASTER_LOGIN_ALIAS, true)}>
              <Copy size={13} style={{ marginRight: 6 }} /> {copiedId ? '✓ Copié !' : "Copier l'identifiant d'équipe autorisée"}
            </Button>
          </div>

          <div style={{ height: 1, background: '#E2E8F0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Mot de passe d'équipe actuel</div>
              <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#059669', marginTop: 2 }}>{currentMasterPass}</div>
            </div>
            <Button variant="accent" onClick={() => copyToClipboard(currentMasterPass, false)}>
              <Copy size={13} style={{ marginRight: 6 }} /> {copiedKey ? '✓ Copié !' : 'Copier le mot de passe'}
            </Button>
          </div>
        </div>

        {/* Changer le mot de passe d'équipe */}
        <form onSubmit={handleUpdatePassword} style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            Modifier le mot de passe d'équipe :
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Nouveau mot de passe"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="input"
              style={{ flex: 1, minWidth: 260 }}
              required
            />
            <Button variant="accent" type="submit" disabled={savingPassword}>
              {savingPassword ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
            </Button>
          </div>
          {passFeedback && (
            <div style={{
              marginTop: 10,
              fontSize: 13,
              padding: '8px 12px',
              borderRadius: 6,
              background: passFeedback.type === 'success' ? '#DCF3E4' : '#FEE2E2',
              color: passFeedback.type === 'success' ? '#1C7A44' : '#991B1B',
            }}>
              {passFeedback.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function GalleryManager({
  images = [],
  onChange,
  titleText = 'Photos enregistrées pour cette activité',
  emptyText = 'Aucune photo enregistrée pour le moment. Vous pouvez en importer ou en choisir ci-dessous.',
}) {
  const [urlInput, setUrlInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const addImage = (src) => {
    if (!src || typeof src !== 'string' || !src.trim()) return;
    const clean = src.trim();
    if (!images.includes(clean)) {
      onChange([...(images || []), clean]);
    }
  };

  const removeImage = (idx) => {
    onChange((images || []).filter((_, i) => i !== idx));
  };

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!validFiles.length) return;

    setUploading(true);
    setErrorMsg(null);

    const successful = [];
    const errors = [];

    for (const file of validFiles) {
      try {
        const optimized = await processImageFile(file);
        if (optimized) successful.push(optimized);
      } catch (err) {
        errors.push(err.message || `Erreur avec le fichier "${file.name}"`);
      }
    }

    if (successful.length > 0) {
      onChange([...(images || []), ...successful]);
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join(' • '));
    }

    setUploading(false);
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      addImage(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* En-tête statut et action rapide */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {titleText} ({images.length})
        </span>
        {images && images.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '2px 6px',
            }}
          >
            Vider toute la galerie ({images.length})
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Miniatures des photos de la galerie */}
      {images && images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
          {images.map((src, idx) => (
            <div key={idx} style={{ position: 'relative', height: 90, borderRadius: 6, overflow: 'hidden', border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}>
              <Photo src={src} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(239, 68, 68, 0.95)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                }}
                title="Supprimer cette photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '14px 16px', background: '#F8FAFC', borderRadius: 6, border: '1px dashed #CBD5E1', textAlign: 'center' }}>
          {emptyText}
        </div>
      )}

      {/* Zone de téléchargement & ajout multiple */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label
          className={`upload${dragging ? ' dragging' : ''}`}
          style={{ height: 100, borderStyle: 'dashed', cursor: 'pointer' }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
            <ImageUp size={22} style={{ color: 'var(--gl-teal)' }} />
            <span>
              {uploading
                ? '⏳ Optimisation et enregistrement des photos...'
                : <>Glissez une ou plusieurs photos ici, ou <strong>parcourez vos fichiers</strong></>}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              PNG, JPG, WEBP acceptés — jusqu'à 5 Mo par photo (importez autant de photos que vous le souhaitez)
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {/* Sélection rapide parmi la photothèque officielle */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>
            Ou sélectionner parmi les photos officielles de l'association :
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PHOTOS.map((src, pIdx) => {
              const isAlreadyAdded = (images || []).includes(src);
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    if (isAlreadyAdded) {
                      onChange((images || []).filter((x) => x !== src));
                    } else {
                      onChange([...(images || []), src]);
                    }
                  }}
                  style={{
                    position: 'relative',
                    width: 58,
                    height: 58,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: isAlreadyAdded ? '2.5px solid var(--gl-teal)' : '1px solid #CBD5E1',
                    padding: 0,
                    cursor: 'pointer',
                    background: '#000',
                  }}
                  title={isAlreadyAdded ? 'Photo déjà ajoutée (cliquez pour retirer)' : 'Cliquer pour ajouter à la galerie'}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isAlreadyAdded ? 0.5 : 1 }} />
                  {isAlreadyAdded && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18 }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ou par lien direct */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="url"
            className="input"
            placeholder="Ou collez le lien direct d'une photo (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
            onClick={handleAddUrl}
          >
            + Ajouter le lien
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoUpload({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const read = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const optimized = await processImageFile(file);
      if (optimized) onChange(optimized);
    } catch (err) {
      setErrorMsg(err.message || 'Image trop volumineuse (max 5 Mo)');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label
        className={`upload${dragging ? ' dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); read(e.dataTransfer.files[0]); }}
      >
        <Photo src={value} placeholder="Glissez une photo ici ou cliquez pour parcourir" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <input type="file" accept="image/*" disabled={uploading} onChange={(e) => read(e.target.files[0])} />
        <span className="hint">
          <ImageUp size={14} /> {uploading ? 'Optimisation en cours...' : 'Changer la photo (jusqu\'à 5 Mo)'}
        </span>
      </label>
      {errorMsg && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '6px 10px', borderRadius: 6, fontSize: 12, marginTop: 6, fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}

function EditModal({ modal, setModal }) {
  const { saveActivity, saveCagnotte } = useStore();
  const { type, mode, form } = modal;
  const set = (key) => (e) => setModal((m) => ({ ...m, form: { ...m.form, [key]: e.target ? e.target.value : e } }));
  const close = () => setModal(null);
  const isActivity = type === 'activity';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setModal]);

  const title = mode === 'create'
    ? (isActivity ? 'Nouvelle activité' : 'Nouvelle cagnotte')
    : (isActivity ? "Modifier l'activité" : 'Modifier la cagnotte');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (isActivity) {
      saveActivity({
        ...form,
        title: form.title.trim(),
        gallery: Array.isArray(form.gallery) ? form.gallery : [],
      });
    } else {
      saveCagnotte({
        ...form,
        title: form.title.trim(),
        desc: (form.desc || '').trim(),
        storyTitle: (form.storyTitle || '').trim(),
        story: (form.story || '').trim(),
        closureReport: (form.closureReport || '').trim(),
        closurePhotos: Array.isArray(form.closurePhotos) ? form.closurePhotos : [],
        goal: Number(form.goal) || 0,
        collected: Number(form.collected) || 0,
        status: form.status || 'active',
      });
    }
    close();
  };

  return (
    <div className="overlay" onClick={close}>
      <form className="modal admin-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
        <div className="head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="head-icon"><PencilLine size={18} /></div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: '#fff' }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--gl-gray-400)', marginTop: 2 }}>Les changements apparaissent instantanément sur le site public</div>
            </div>
          </div>
          <button type="button" className="head-close" aria-label="Fermer" onClick={close}><X size={16} /></button>
        </div>

        <div className="content">
          {isActivity ? (
            <>
              <div>
                <div className="form-group-title">Informations générales</div>
                <div className="form-group">
                  <Field id="af-title" label="Titre" required placeholder="Ex : Distribution de kits scolaires" value={form.title} onChange={set('title')} />
                  <Field id="af-cat" label="Catégorie" placeholder="Ex : Éducation" value={form.category} onChange={set('category')} />
                  <Field id="af-desc" label="Description courte (carte)" textarea placeholder="Résumé affiché sur les cartes d'activité" value={form.desc} onChange={set('desc')} />
                </div>
              </div>
              <div>
                <div className="form-group-title">Photo de couverture principale</div>
                <PhotoUpload value={form.photo} onChange={set('photo')} />
              </div>

              {/* Galerie photos de l'activité */}
              <div>
                <div className="form-group-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Galerie photos de l'activité (Photos de terrain)</span>
                  <span style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    {(form.gallery || []).length} photo(s)
                  </span>
                </div>
                <div className="form-group" style={{ background: '#FAFBFD', border: '1.5px solid #E2E8F0', padding: 18, borderRadius: 8 }}>
                  <GalleryManager
                    images={form.gallery || []}
                    titleText="Photos enregistrées pour cette activité"
                    emptyText="Aucune photo dans la galerie de cette activité pour le moment. Vous pouvez en importer ou en choisir ci-dessous."
                    onChange={(imgs) => setModal((m) => ({ ...m, form: { ...m.form, gallery: imgs } }))}
                  />
                </div>
              </div>
              <div>
                <div className="form-group-title">Témoignage</div>
                <div className="form-group tint">
                  <Field id="af-quote" label="Citation" placeholder="Ex : Grâce à cette aide, nous avons pu..." value={form.quote} onChange={set('quote')} />
                  <Field id="af-author" label="Auteur" placeholder="Ex : Fatou, bénéficiaire" value={form.quoteAuthor} onChange={set('quoteAuthor')} />
                </div>
              </div>
              <div>
                <div className="form-group-title">Détails (page activité)</div>
                <div className="form-group">
                  <Field id="af-ctx" label="Contexte" textarea value={form.contexte} onChange={set('contexte')} />
                  <Field id="af-act" label="Actions menées" textarea value={form.actions} onChange={set('actions')} />
                  <Field id="af-res" label="Résultats" textarea value={form.resultats} onChange={set('resultats')} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="form-group-title">Informations principales</div>
                <div className="form-group">
                  <Field id="cf-title" label="Titre de la cagnotte" required placeholder="Ex : Tabaski 2026 — Moutons pour tous" value={form.title} onChange={set('title')} />
                  <Field id="cf-desc" label="Description courte (carte)" textarea placeholder="Court résumé visible sur la carte de la cagnotte" value={form.desc} onChange={set('desc')} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div className="form-group-title">Financement</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gl-teal)' }}>{pctOf(form)}% atteint</div>
                </div>
                <div className="form-group tint">
                  <div className="grid cols-2" style={{ gap: 14, gridTemplateColumns: '1fr 1fr' }}>
                    <Field id="cf-goal" label="Objectif (FCFA)" type="number" min="0" value={form.goal} onChange={set('goal')} />
                    <Field id="cf-col" label="Déjà collecté (FCFA)" type="number" min="0" value={form.collected} onChange={set('collected')} />
                  </div>
                </div>
              </div>

              <div>
                <div className="form-group-title">Statut de la cagnotte</div>
                <div className="form-group">
                  <div className="field">
                    <label>État de la collecte</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" className={`toggle-pill${form.status === 'active' ? ' on-active' : ''}`} onClick={() => set('status')('active')}>Active (en cours)</button>
                      <button type="button" className={`toggle-pill${form.status === 'closed' ? ' on-closed' : ''}`} onClick={() => set('status')('closed')}>Clôturée (terminée)</button>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                      {form.status === 'active'
                        ? 'La cagnotte est ouverte aux dons avec les boutons de paiement mobile.'
                        : 'La cagnotte est clôturée : le bilan de mission et les photos de terrain seront affichés aux visiteurs.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Présentation du projet & Contexte (Visible quand la cagnotte est active) */}
              <div>
                <div className="form-group-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Présentation du projet & Appel aux dons (Cagnotte active)</span>
                  <span style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    Visible sur « Voir les détails »
                  </span>
                </div>
                <div className="form-group" style={{ background: '#FAFBFD', border: '1.5px solid #E2E8F0', padding: 18, borderRadius: 8 }}>
                  <Field
                    id="cf-story-title"
                    label="Titre de la section (optionnel)"
                    placeholder="Ex : Pourquoi nous lançons cette cagnotte et à qui s'adresse votre aide ?"
                    value={form.storyTitle || ''}
                    onChange={set('storyTitle')}
                  />
                  <Field
                    id="cf-story"
                    label="Texte explicatif & Présentation de la cause"
                    textarea
                    rows={6}
                    placeholder="Expliquez ici la situation, quel type de personnes ou familles cela va aider, pourquoi cette collecte est mise en place et pourquoi chaque don compte..."
                    value={form.story || ''}
                    onChange={set('story')}
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: -6, lineHeight: 1.4 }}>
                    🔗 <em>Astuce liens cliquables :</em> Tout lien internet (site web, WhatsApp, réseaux sociaux) écrit dans ce texte deviendra automatiquement un lien cliquable sur la page de la cagnotte.
                  </div>
                </div>
              </div>

              {/* Rapport d'impact & Bilan de mission (Cagnotte clôturée) */}
              <div>
                <div className="form-group-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Bilan de mission & Photos de terrain (Cagnotte clôturée)</span>
                  <span style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    {(form.closurePhotos || []).length} photo(s) terrain
                  </span>
                </div>
                <div className="form-group" style={{ background: '#FAFBFD', border: '1.5px solid #E2E8F0', padding: 18, borderRadius: 8 }}>
                  <Field
                    id="cf-rep"
                    label="Bilan textuel de la mission"
                    textarea
                    rows={4}
                    placeholder="Expliquez ce qui a été réalisé concrètement avec les fonds (ex : 600 kits distribués dans 8 écoles primaires...). Si vous mettez un lien web (ex: https://... ou wa.me/...), il sera automatiquement cliquable sur le site public."
                    value={form.closureReport || ''}
                    onChange={set('closureReport')}
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: -6, marginBottom: 16 }}>
                    🔗 <em>Liens automatiques :</em> Tout lien internet (site web, WhatsApp, etc.) écrit dans ce bilan sera directement cliquable par les visiteurs sur la page de la cagnotte terminée.
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                    Photos de la distribution sur le terrain :
                  </div>
                  <GalleryManager
                    images={form.closurePhotos || []}
                    titleText="Photos de la distribution sur le terrain"
                    emptyText="Aucune photo de terrain pour le moment. Vous pouvez en importer ou en choisir ci-dessous."
                    onChange={(imgs) => setModal((m) => ({ ...m, form: { ...m.form, closurePhotos: imgs } }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="foot">
          <Button variant="outline" onClick={close}>Annuler</Button>
          <button type="submit" className="btn btn-accent">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, required, placeholder, value, onChange, textarea, type = 'text', min, rows = 2 }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required && <span style={{ color: 'var(--gl-terracotta)' }}> *</span>}</label>
      {textarea ? (
        <textarea id={id} className="input" rows={rows} placeholder={placeholder} value={value ?? ''} onChange={onChange} />
      ) : (
        <input id={id} type={type} min={min} className="input" placeholder={placeholder} value={value ?? ''} onChange={onChange} required={required} />
      )}
    </div>
  );
}

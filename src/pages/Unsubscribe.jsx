import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, MailX, Send } from 'lucide-react';
import { useStore } from '../store.jsx';
import { Button } from '../components/ui.jsx';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const { unsubscribeNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const res = await unsubscribeNewsletter(email);
    setLoading(false);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message || 'Votre désabonnement a bien été pris en compte. Vous ne recevrez plus nos e-mails.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || "Impossible de désabonner cette adresse. Vérifiez l'orthographe.",
      });
    }
  };

  return (
    <main className="page-main narrower" style={{ maxWidth: 640 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#FEE2E2',
            color: '#DC2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <MailX size={30} />
        </div>
        <div className="eyebrow" style={{ color: '#DC2626' }}>Lettre d'information</div>
        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 12 }}>
          Désabonnement de nos e-mails
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Nous respectons pleinement votre vie privée. Renseignez votre adresse e-mail ci-dessous pour être retiré(e) instantanément de notre liste de diffusion.
        </p>
      </div>

      <div className="card" style={{ padding: 'clamp(24px, 4vw, 36px)', border: '1px solid var(--border-subtle)' }}>
        {feedback?.type === 'success' ? (
          <div className="pop-in" style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#DCF3E4',
                color: '#166534',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Check size={26} />
            </div>
            <h2 style={{ fontSize: 20, color: '#166534', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>
              Désabonnement confirmé
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>
              {feedback.message}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                Retourner à l'accueil
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label htmlFor="unsub-email" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>
                Votre adresse e-mail à désabonner *
              </label>
              <input
                id="unsub-email"
                type="email"
                required
                className="input"
                placeholder="Ex : prenom.nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '12px 16px', fontSize: 14 }}
              />
            </div>

            {feedback?.type === 'error' && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn"
              style={{
                background: '#DC2626',
                color: '#fff',
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? 'Traitement en cours...' : 'Confirmer mon désabonnement définitif'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Link to="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                Annuler et revenir à l'accueil
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

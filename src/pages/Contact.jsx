import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { Photo } from '../components/ui.jsx';
import { useStore } from '../store.jsx';

export default function Contact() {
  const { sendContactMessage } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || 'Non renseigné',
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError("Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-main">
      <div className="eyebrow">Contact</div>
      <h1 className="page-title">Une question, un projet ? Parlons-en</h1>
      <div className="split contact-split">
        <div>
          {sent ? (
            <div className="pop-in" style={{ background: 'var(--gl-teal-tint)', borderRadius: 'var(--radius-md)', padding: 32, color: 'var(--gl-teal-dark)', fontSize: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontWeight: 700, fontSize: 17 }}>
                <Check size={22} color="var(--gl-teal)" /> Message bien transmis
              </div>
              <p style={{ margin: '0 0 16px', lineHeight: 1.6 }}>
                Merci pour votre message ! Il a été directement transmis à l'équipe de l'association Hassanates Pour Tous. Nous reviendrons vers vous dans les plus brefs délais.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSent(false)}
                style={{ fontSize: 13, padding: '8px 16px' }}
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}
              <div className="field">
                <label htmlFor="c-name">Nom complet *</label>
                <input
                  id="c-name"
                  className="input"
                  required
                  placeholder="Votre nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid cols-2" style={{ gap: 14 }}>
                <div className="field">
                  <label htmlFor="c-email">Adresse e-mail *</label>
                  <input
                    id="c-email"
                    type="email"
                    className="input"
                    required
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="c-phone">Numéro WhatsApp (facultatif)</label>
                  <input
                    id="c-phone"
                    className="input"
                    placeholder="+221 XX XXX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="c-msg">Votre message *</label>
                <textarea
                  id="c-msg"
                  className="input"
                  required
                  rows={5}
                  placeholder="Expliquez-nous votre demande, suggestion ou proposition de partenariat..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <Send size={15} /> {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </div>
            </form>
          )}
        </div>
        <div>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, marginBottom: 16 }}>Coordonnées</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 2 }}>
              <div>Dakar, Sénégal</div>
              <div>+221 XX XXX XX XX</div>
              <div><a href="mailto:contact@hassanates-pourtous.org">contact@hassanates-pourtous.org</a></div>
            </div>
          </div>
          <div className="rounded-md" style={{ height: 180 }}>
            <Photo src="/assets/photo-05.jpeg" alt="Localisation" />
          </div>
        </div>
      </div>
    </main>
  );
}

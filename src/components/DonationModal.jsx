import { useEffect, useState } from 'react';
import { Check, Heart, Sparkles, X } from 'lucide-react';
import { DONATION_AMOUNTS, fmt } from '../data.js';
import { useStore } from '../store.jsx';
import { Button, Photo } from './ui.jsx';

const METHODS = [
  { key: 'wave', label: 'Wave' },
  { key: 'om', label: 'Orange Money' },
];

export default function DonationModal() {
  const { donation, closeDonation, paymentMethods, recordDonation } = useStore();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(null);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState(null);

  useEffect(() => {
    if (!donation.open) return;
    setStep(1);
    setAmount(null);
    setCustom('');
    setMethod(null);
    const onKey = (e) => e.key === 'Escape' && closeDonation();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [donation.open, closeDonation]);

  if (!donation.open) return null;

  const total = amount || parseInt(custom, 10) || 0;
  const methods = METHODS.filter((m) => paymentMethods[m.key]);
  const title = donation.cagnotteTitle ? 'Don — ' + donation.cagnotteTitle : 'Faire un don';

  const handleFinishDonation = () => {
    recordDonation({
      amount: total,
      method,
      cagnotteTitle: donation.cagnotteTitle || 'Fonds de solidarité général',
    });
    setStep(4); // Affiche directement la fenêtre de prière et remerciement
  };

  return (
    <div className="overlay" onClick={closeDonation}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <h2>{step === 4 ? "Prière & Remerciements" : title}</h2>
          <button type="button" className="close-btn" aria-label="Fermer" onClick={closeDonation}><X size={20} /></button>
        </div>

        {/* Étape 1 : Choix du montant */}
        {step === 1 && (
          <div>
            <div className="amounts">
              {DONATION_AMOUNTS.map((v) => (
                <button key={v} type="button" className={`choice${amount === v ? ' selected' : ''}`}
                  onClick={() => { setAmount(v); setCustom(''); }}>
                  {v.toLocaleString('fr-FR')}
                </button>
              ))}
            </div>
            <input
              className="input" inputMode="numeric" placeholder="Montant libre (FCFA)" value={custom}
              onChange={(e) => { setCustom(e.target.value.replace(/\D/g, '')); setAmount(null); }}
              style={{ marginBottom: 24 }}
            />
            <Button variant="accent" block disabled={total <= 0} onClick={() => setStep(2)}>Continuer</Button>
          </div>
        )}

        {/* Étape 2 : Choix du mode de paiement */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Montant : <strong style={{ color: 'var(--text-primary)' }}>{fmt(total)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {methods.length === 0 && (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Aucun moyen de paiement n'est disponible pour le moment.</div>
              )}
              {methods.map((m) => (
                <button key={m.key} type="button" className={`choice method${method === m.label ? ' selected' : ''}`}
                  onClick={() => setMethod(m.label)}>
                  <strong>{m.label}</strong><span>Paiement mobile</span>
                </button>
              ))}
            </div>
            <div className="row stack-mobile">
              <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
              <Button variant="accent" style={{ flex: 2 }} disabled={!method} onClick={() => setStep(3)}>Valider le choix</Button>
            </div>
          </div>
        )}

        {/* Étape 3 : Paiement Wave ou Orange Money */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
              Paiement de votre don
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', margin: '0 0 18px' }}>
              Finalisez votre don de <strong>{fmt(total)}</strong> avec <strong>{method}</strong>, au choix :
            </p>
            <Button variant="accent" block style={{ marginBottom: 14 }}>Ouvrir l'application {method}</Button>
            <div className="divider">ou scannez ce QR code</div>
            <div style={{ border: '1.5px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 22 }}>
              <div style={{ width: 140, height: 140, margin: '0 auto' }}>
                <Photo placeholder={`QR code ${method}`} />
              </div>
            </div>

            <Button variant="accent" block onClick={handleFinishDonation} style={{ padding: '14px 20px', fontSize: 15 }}>
              J'ai envoyé mon don · Valider
            </Button>
          </div>
        )}

        {/* Étape 4 : Fenêtre de remerciement et prière musulmane */}
        {step === 4 && (
          <div className="pop-in" style={{ textAlign: 'center', padding: '12px 6px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gl-teal-tint)', color: 'var(--gl-teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Heart size={32} fill="var(--gl-teal)" color="var(--gl-teal-dark)" />
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--gl-black)', marginBottom: 6 }}>
              جَزَاكُمُ اللَّهُ خَيْرًا
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gl-teal-dark)', marginBottom: 18 }}>
              Barak'Allahu fikoum pour votre générosité
            </div>

            <div style={{ background: 'var(--gl-cream)', borderRadius: 'var(--radius-md)', padding: '20px 22px', border: '1px solid var(--border-subtle)', textAlign: 'left', marginBottom: 24, lineHeight: 1.65 }}>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                🤲 <strong>Qu'Allah accepte votre aumône (Sadaqah)</strong>, purifie vos biens, démultiplie vos <em>Hassanates</em> et répande Sa bénédiction (Barakah) sur vous et vos proches.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Votre geste précieux de <strong>{fmt(total)}</strong> ira directement soulager les familles et enfants les plus vulnérables. Qu'Allah fasse de cet acte une lumière pour vous dans ce bas-monde et dans l'au-delà.
              </p>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--gl-teal-dark)', textAlign: 'center' }}>
                آمِينَ يَا رَبَّ العَالَمِينَ · Amine.
              </div>
            </div>

            <Button variant="primary" block onClick={closeDonation}>
              Fermer · Qu'Allah vous bénisse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

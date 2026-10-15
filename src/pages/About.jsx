import { useEffect, useState } from 'react';
import { Check, Eye, HeartHandshake, Sparkles, Target, Users } from 'lucide-react';
import { useCountUp, useReveal } from '../hooks.js';
import { useStore } from '../store.jsx';
import { Button, FeatureCard, Photo } from '../components/ui.jsx';
import { useStatsItems } from './Home.jsx';

export default function About() {
  const [t, start] = useCountUp(1400);
  const statsRef = useReveal(start);
  useEffect(() => {
    // Also trigger start shortly after mount to ensure animation begins smoothly
    const timer = setTimeout(start, 200);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const items = useStatsItems(t > 0 ? t : 1);
  const { volunteerRecruitmentActive, addVolunteerApplication } = useStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    commune: '',
    domain: 'Distribution sur le terrain & Logistique',
    availability: 'Week-ends et périodes de fêtes',
    customAvailability: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAvailability = form.availability === 'Autre'
      ? (form.customAvailability.trim() || 'Disponibilités personnelles')
      : form.availability;

    addVolunteerApplication({
      ...form,
      availability: finalAvailability,
      city: [form.city, form.commune].filter(Boolean).join(' - '),
    });
    setSubmitted(true);
  };

  return (
    <main className="page-main">
      <div className="eyebrow">Découvrir l'association</div>
      <h1 className="page-title" style={{ marginBottom: 40 }}>Notre histoire, notre mission, nos valeurs</h1>

      <div className="split" style={{ marginBottom: 80 }}>
        <div className="rounded-lg" style={{ height: 360 }}>
          <Photo src="/assets/photo-09.jpeg" alt="Origines de l'association" />
        </div>
        <div>
          <h2 style={{ fontSize: 24, margin: '0 0 16px' }}>Notre histoire</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', margin: '0 0 14px' }}>
            Hassanates pour tous est née de la volonté d'un groupe de bénévoles d'apporter une aide concrète aux familles les plus vulnérables de leur communauté. Ce qui a commencé par des collectes ponctuelles s'est structuré, au fil des années, en une association organisée et reconnue.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', margin: 0 }}>
            Aujourd'hui, l'association mène des actions régulières autour des grandes occasions religieuses et solidaires, tout en développant de nouveaux projets au service des plus démunis.
          </p>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 80 }}>
        <FeatureCard icon={Target} title="Mission">Accompagner durablement les familles vulnérables à travers des actions solidaires concrètes et transparentes.</FeatureCard>
        <FeatureCard icon={Eye} title="Vision">Une société où la solidarité permet à chacun de vivre dans la dignité, quelles que soient ses ressources.</FeatureCard>
        <FeatureCard icon={HeartHandshake} title="Valeurs">Transparence, proximité et engagement, au service des personnes que nous accompagnons.</FeatureCard>
      </div>

      <div ref={statsRef} className="reveal" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 48, marginBottom: volunteerRecruitmentActive ? 80 : 0 }}>
        <h2 style={{ fontSize: 24, margin: '0 0 28px' }}>Nos réalisations en chiffres</h2>
        <div className="grid cols-4">
          {items.map((s, i) => (
            <div key={s.label} style={{ animation: 'popIn 0.5s ease both', animationDelay: i * 0.1 + 's' }}>
              <div className="stat-value" style={{ fontSize: 36 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire de bénévolat conditionnel - Activé/Désactivé depuis l'espace Admin */}
      {volunteerRecruitmentActive && (
        <section className="card" style={{ padding: 40, border: '1.5px solid var(--gl-teal)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gl-teal-tint)', color: 'var(--gl-teal-dark)', padding: '5px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
              <Sparkles size={14} /> Campagne de recrutement ouverte
            </div>
            <h2 style={{ fontSize: 30, margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>Rejoindre l'équipe des bénévoles</h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', margin: '0 0 28px' }}>
              Vous souhaitez donner un peu de votre temps, de votre énergie ou de vos compétences pour agir concrètement auprès des plus démunis ? Remplissez ce formulaire et nous vous contacterons avec joie.
            </p>

            {submitted ? (
              <div className="pop-in" style={{ background: '#DCF3E4', color: '#1C7A44', borderRadius: 'var(--radius-md)', padding: 32, textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#1C7A44', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={28} />
                </div>
                <h3 style={{ fontSize: 20, margin: '0 0 8px', color: '#1C7A44' }}>Merci pour votre engagement généreux !</h3>
                <p style={{ fontSize: 14, margin: '0 0 18px', lineHeight: 1.5 }}>
                  Votre candidature a bien été enregistrée. Notre équipe de coordination des bénévoles prendra contact avec vous très prochainement par téléphone ou WhatsApp.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Envoyer une autre candidature</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="grid cols-2" style={{ gap: 16 }}>
                  <div className="field">
                    <label htmlFor="vol-name">Nom complet *</label>
                    <input
                      id="vol-name"
                      className="input"
                      required
                      placeholder="Ex : Fatou Diop"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="vol-phone">Téléphone / WhatsApp *</label>
                    <input
                      id="vol-phone"
                      className="input"
                      required
                      placeholder="Ex : +221 77 000 00 00"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid cols-3" style={{ gap: 16 }}>
                  <div className="field">
                    <label htmlFor="vol-email">Adresse e-mail (facultatif)</label>
                    <input
                      id="vol-email"
                      type="email"
                      className="input"
                      placeholder="Ex : fatou@exemple.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="vol-city">Ville *</label>
                    <input
                      id="vol-city"
                      className="input"
                      required
                      placeholder="Ex : Dakar, Thiès..."
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="vol-commune">Commune de résidence *</label>
                    <input
                      id="vol-commune"
                      className="input"
                      required
                      placeholder="Ex : Médina, Pikine, Mermoz..."
                      value={form.commune}
                      onChange={(e) => setForm({ ...form, commune: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid cols-2" style={{ gap: 16 }}>
                  <div className="field">
                    <label htmlFor="vol-domain">Domaine d'aide privilégié</label>
                    <select
                      id="vol-domain"
                      className="input"
                      value={form.domain}
                      onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    >
                      <option value="Distribution sur le terrain & Logistique">Distribution sur le terrain & Logistique</option>
                      <option value="Médical & Soins de santé">Médical & Soins de santé</option>
                      <option value="Préparation des paniers & Achats">Préparation des paniers & Achats</option>
                      <option value="Communication, Photo & Vidéo">Communication, Photo & Vidéo</option>
                      <option value="Soutien scolaire & Pédagogique">Soutien scolaire & Pédagogique</option>
                      <option value="Autre / Polyvalent">Autre / Polyvalent</option>
                    </select>
                  </div>
                  <div className="field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label htmlFor="vol-avail" style={{ margin: 0 }}>Vos disponibilités</label>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, availability: 'Autre' }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: form.availability === 'Autre' ? 'var(--gl-teal)' : 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        + Préciser disponibilité personnelle
                      </button>
                    </div>
                    <select
                      id="vol-avail"
                      className="input"
                      value={form.availability}
                      onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    >
                      <option value="Week-ends et périodes de fêtes">Week-ends et périodes de fêtes</option>
                      <option value="En semaine (en journée)">En semaine (en journée)</option>
                      <option value="En soirée uniquement">En soirée uniquement</option>
                      <option value="Période du Ramadan / Tabaski">Période du Ramadan / Tabaski</option>
                      <option value="Selon les besoins et urgences">Selon les besoins et urgences</option>
                      <option value="Autre">Autre / Disponibilités personnelles (à taper)</option>
                    </select>
                  </div>
                </div>

                {/* Champ personnalisé si l'utilisateur a choisi "Autre" pour les disponibilités */}
                {form.availability === 'Autre' && (
                  <div className="field pop-in" style={{ background: 'var(--gl-cream)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <label htmlFor="vol-custom-avail" style={{ color: 'var(--gl-teal-dark)' }}>
                      Indiquez vos disponibilités personnelles :
                    </label>
                    <input
                      id="vol-custom-avail"
                      className="input"
                      required
                      placeholder="Ex : Tous les samedis de 9h à 13h, 2 soirées par semaine, disponible pour les urgences..."
                      value={form.customAvailability}
                      onChange={(e) => setForm({ ...form, customAvailability: e.target.value })}
                    />
                  </div>
                )}

                <div className="field">
                  <label htmlFor="vol-msg">Quelques mots sur vous / vos motivations</label>
                  <textarea
                    id="vol-msg"
                    className="input"
                    rows={4}
                    placeholder="Parlez-nous de vos compétences, de vos motivations ou de vos disponibilités particulières..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: 8 }}>
                  <Button variant="accent" type="submit" style={{ padding: '14px 32px' }}>
                    Envoyer ma candidature
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

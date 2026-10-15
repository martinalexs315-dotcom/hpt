export const PHOTOS = Array.from({ length: 9 }, (_, i) => `/assets/photo-0${i + 1}.jpeg`);

export const initialActivities = [
  {
    id: 'tabaski', title: 'Tabaski', category: 'Fête religieuse', photo: PHOTOS[2],
    desc: "Distribution de moutons et de repas aux familles dans le besoin à l'occasion de l'Aïd al-Adha.",
    quote: 'Grâce à cette distribution, toute notre famille a pu célébrer la fête dans la dignité.', quoteAuthor: 'Fatou, bénéficiaire',
    contexte: "Chaque année, de nombreuses familles ne peuvent pas subvenir aux frais liés à la fête de Tabaski. L'association organise une collecte pour leur venir en aide.",
    actions: 'Achat et distribution de moutons, préparation et distribution de repas dans plusieurs quartiers, en coordination avec des bénévoles locaux.',
    resultats: 'Plus de 300 familles ont bénéficié de cette action lors de la dernière édition.',
    gallery: [PHOTOS[0], PHOTOS[1], PHOTOS[2], PHOTOS[3]],
  },
  {
    id: 'ramadan', title: 'Ramadan', category: 'Fête religieuse', photo: PHOTOS[4],
    desc: 'Distribution de paniers alimentaires et organisation de ruptures de jeûne collectives tout au long du mois.',
    quote: "Chaque soir, nous savions que nous pourrions rompre le jeûne dignement grâce à l'association.", quoteAuthor: 'Moussa, bénéficiaire',
    contexte: 'Le mois de Ramadan représente une charge financière importante pour les foyers les plus précaires.',
    actions: 'Distribution hebdomadaire de paniers alimentaires et organisation de ruptures de jeûne collectives ouvertes à tous.',
    resultats: 'Plus de 1 200 paniers distribués et 40 soirées de rupture de jeûne organisées.',
    gallery: [PHOTOS[3], PHOTOS[4], PHOTOS[5], PHOTOS[0]],
  },
  {
    id: 'rentree', title: 'Rentrée scolaire', category: 'Éducation', photo: PHOTOS[6],
    desc: 'Fourniture de kits scolaires complets aux enfants issus de familles vulnérables.',
    quote: "Mes enfants sont retournés à l'école avec tout le nécessaire, sans que j'aie à m'endetter.", quoteAuthor: 'Aïssatou, mère de famille',
    contexte: 'La rentrée scolaire pèse lourdement sur le budget des familles modestes, au risque de compromettre la scolarité des enfants.',
    actions: 'Constitution et distribution de kits scolaires (cahiers, fournitures, uniformes) dans les écoles partenaires.',
    resultats: '600 enfants équipés lors de la dernière rentrée.',
    gallery: [PHOTOS[6], PHOTOS[7], PHOTOS[2], PHOTOS[5]],
  },
  {
    id: 'sante', title: 'Caravane médicale', category: 'Santé', photo: PHOTOS[7],
    desc: 'Consultations et soins gratuits dans les zones rurales isolées.',
    quote: "Nous n'avions plus accès à un médecin depuis des années. Cette caravane a changé beaucoup de choses.", quoteAuthor: 'Ndèye, habitante',
    contexte: "L'accès aux soins reste difficile dans certaines zones rurales, faute de structures de santé à proximité.",
    actions: 'Organisation de journées de consultation gratuite avec des médecins et infirmiers bénévoles, distribution de médicaments de base.',
    resultats: "Plus de 800 consultations réalisées sur l'année.",
    gallery: [PHOTOS[7], PHOTOS[8], PHOTOS[1], PHOTOS[4]],
  },
];

export const initialCagnottes = [
  {
    id: 'tabaski2026',
    title: 'Tabaski 2026 — Moutons pour tous',
    desc: "Collecte pour financer l'achat de moutons destinés aux familles les plus démunies.",
    goal: 5000000,
    collected: 3200000,
    start: '01/03/2026',
    end: '15/05/2026',
    status: 'active',
    storyTitle: 'Offrir la dignité et la joie du sacrifice aux familles vulnérables',
    story: `À l'approche de la grande fête de la Tabaski (Aïd al-Adha), de nombreux foyers en grande difficulté matérielle vivent cette période dans l'angoisse et la tristesse de ne pas pouvoir accomplir ce rite sacré et partager un repas festif avec leurs enfants.\n\nNotre mission avec cette cagnotte est de financer l'achat direct de béliers en bonne santé auprès d'éleveurs locaux, puis de les acheminer et les distribuer en toute dignité aux mères isolées, orphelins et personnes âgées identifiés par nos équipes de terrain.\n\nChaque contribution, quel que soit son montant, permet de redonner le sourire à une famille et de perpétuer l'esprit d'entraide et de bénédiction qui nous unit.`,
  },
  {
    id: 'urgence-sante',
    title: "Fonds d'urgence santé",
    desc: 'Fonds permanent pour financer les caravanes médicales et les urgences de santé.',
    goal: 3000000,
    collected: 900000,
    start: '01/01/2026',
    end: '31/12/2026',
    status: 'active',
    storyTitle: 'Permettre un accès immédiat aux soins et sauver des vies',
    story: `Dans les quartiers périurbains et les villages enclavés, une maladie bénigne ou un accident peut rapidement basculer dans le tragique simplement par manque d'argent pour payer une ordonnance, un examen ou un trajet d'ambulance.\n\nCe fonds d'urgence permanent permet à notre pôle médical et à nos soignants bénévoles d'intervenir en urgence : prise en charge d'interventions chirurgicales pour des enfants démunis, approvisionnement en traitements chroniques (diabète, hypertension) et organisation de caravanes médicales gratuites avec distribution directe de médicaments.\n\nEn contribuant à ce fonds, vous offrez aux plus vulnérables la certitude qu'ils ne seront pas abandonnés face à la maladie.`,
  },
  {
    id: 'rentree2026',
    title: 'Rentrée scolaire 2026',
    desc: 'Kits scolaires pour les enfants issus de familles vulnérables.',
    goal: 2000000,
    collected: 2000000,
    start: '01/07/2025',
    end: '31/08/2025',
    status: 'closed',
    storyTitle: 'Garantir le droit à l’école et à la réussite pour chaque enfant',
    story: `Pour de nombreux parents en situation de précarité, la rentrée scolaire est une épreuve angoissante. Des centaines d'enfants risquent l'abandon scolaire ou commencent l'année sans le strict minimum : pas de sac, pas de cahiers ni de fournitures de base.\n\nGrâce à vos dons, cette cagnotte a permis d'équiper 600 élèves avec des kits neufs complets et de prendre en charge des frais de scolarité dans 8 écoles primaires ciblées. Les enfants ont pu franchir les portes de leur classe avec fierté et sérénité.`,
    closureReport: "Grâce à la mobilisation de 142 donateurs, l'objectif de 2 000 000 FCFA a été intégralement atteint. 600 kits scolaires complets ont été distribués dans 8 écoles primaires partenaires de la banlieue de Dakar et de zones rurales. Les enfants ont pu aborder l'année scolaire équipés et avec dignité.",
    impactFigures: [
      { label: 'Kits scolaires distribués', value: '600' },
      { label: 'Écoles partenaires', value: '8' },
      { label: 'Familles soulagées', value: '380+' },
      { label: 'Fonds mobilisés', value: '2 000 000 FCFA' },
    ],
    closurePhotos: [PHOTOS[6], PHOTOS[7], PHOTOS[3]],
  },
];

export const initialVolunteerApplications = [
  {
    id: 'vol-1',
    name: 'Aminata Ndiaye',
    phone: '+221 77 450 12 34',
    email: 'aminata.ndiaye@example.com',
    city: 'Dakar (Médina)',
    domain: 'Distribution sur le terrain & Logistique',
    availability: 'Week-ends et périodes de fêtes',
    message: 'Je souhaite vivement mettre mon temps libre au service des familles vulnérables, particulièrement pour la préparation des paniers et les distributions de repas.',
    createdAt: '10/10/2026',
    status: 'new',
  },
  {
    id: 'vol-2',
    name: 'Dr. Cheikh Tidiane Sy',
    phone: '+221 78 320 88 90',
    email: 'cheikh.sy@example.com',
    city: 'Guédiawaye',
    domain: 'Médical & Soins de santé',
    availability: 'Selon les caravanes médicales',
    message: 'Médecin généraliste, je me porte volontaire pour participer aux consultations gratuites lors de vos prochaines caravanes de santé en zones rurales.',
    createdAt: '11/10/2026',
    status: 'contacted',
  },
];

export const initialStats = { beneficiaries: 1250, fundsM: 18.5, activitiesCount: 24, volunteers: 85 };

export const testimonials = [
  { name: 'Aïssatou D.', role: 'Bénéficiaire Tabaski', quote: 'Cette association nous a permis de vivre la fête avec dignité, sans nous sentir oubliés.', photo: PHOTOS[3] },
  { name: 'Moussa K.', role: 'Bénévole', quote: "S'engager ici, c'est voir directement l'impact de chaque don sur des familles réelles.", photo: PHOTOS[6] },
  { name: 'Ndèye F.', role: 'Bénéficiaire Ramadan', quote: "Chaque panier reçu était plus qu'une aide alimentaire, c'était un vrai soutien moral.", photo: PHOTOS[8] },
];

export const galleryPhotos = [PHOTOS[0], PHOTOS[1], PHOTOS[5], PHOTOS[8]];

export const DONATION_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000];

export const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR') + ' FCFA';

export const pctOf = (c) => (c.goal ? Math.min(100, Math.round(((Number(c.collected) || 0) / Number(c.goal)) * 100)) : 0);

export function getCagnotteWhatsAppText(c, origin = '') {
  const pct = pctOf(c);
  const url = `${origin || window.location.origin}/cagnottes/${c.id}`;
  return `💚 *Hassanates pour tous — Appel à la solidarité* 💚\n\nJe soutiens l'action : *${c.title}*\n${c.desc}\n\n🎯 *Objectif :* ${fmt(c.goal)}\n💰 *Déjà collecté :* ${fmt(c.collected)} (${pct}%)\n\n👉 Participez vous aussi ou transférez ce message :\n${url}\n\n_Qu'Allah récompense chaque geste de solidarité !_`;
}

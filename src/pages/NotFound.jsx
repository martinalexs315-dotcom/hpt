import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="page-main" style={{ textAlign: 'center' }}>
      <div className="eyebrow">Erreur 404</div>
      <h1 className="page-title" style={{ margin: '0 auto 24px' }}>Cette page n'existe pas</h1>
      <Link to="/" className="btn btn-accent">Retour à l'accueil</Link>
    </main>
  );
}

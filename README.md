# Hassanates pour tous

Site de l'association Hassanates pour tous : activités, cagnottes, dons (Wave / Orange Money) et espace administrateur.

Built with Vite + React, from the Claude Design file `Hassanates pour tous.dc.html` (GainLove design system in `_ds/`).

## Développement

```bash
npm install
npm run dev
```

`npm run build` produces the static site in `dist/`. Configure your host to serve `index.html` for all routes (SPA fallback).

## À faire avant la mise en ligne

- Authentification réelle pour l'espace admin (actuellement factice).
- Backend / base de données : les modifications admin sont stockées dans le `localStorage` du navigateur.
- Intégration des paiements Wave / Orange Money (bouton et QR code).
- Envoi du formulaire de contact et de la newsletter.

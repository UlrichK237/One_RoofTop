# One Rooftop · Bar & Lounge (Bonapriso, Douala)

Site vitrine, carte interactive, prise de commande à emporter ou en livraison et demande de réservation de table pour **One Rooftop** (1163, rue Njo-Njo, Bonapriso, Douala).

## Prérequis

- Node.js 22 ou supérieur (`node -v`)
- npm 10 ou supérieur (`npm -v`)

## Installation

```bash
npm ci
```

## Variables d’environnement

Copiez `.env.example` vers `.env.local` (non suivi par Git) et renseignez le numéro WhatsApp confirmé :

```env
VITE_WHATSAPP_NUMBER="237671033333"
```

Tant que `VITE_WHATSAPP_NUMBER` est vide, l’envoi direct vers WhatsApp reste désactivé avec un message de repli proposant la copie du message et l’appel direct.

## Scripts disponibles

- `npm run dev` : serveur de développement local (port 3000)
- `npm run lint` / `npx tsc --noEmit` : vérification TypeScript
- `npm run build` : compilation de production dans `dist/`
- `npm run preview` : aperçu du build de production
- `node scripts/fetch-photos.mjs` : génération de la revue photos (`scripts/out/photos-review.html`)
- `node scripts/check-photos.mjs` : contrôle d’intégrité et d’absence de doublons des photos
- `npm run verif` : contrôles de sécurité et d’hygiène sur `src/` et `dist/`
- `npm test` : suite de tests unitaires (nettoyage, validation téléphone/noms/liens, créneaux horaires)

## Ajout des photos du restaurant

1. Déposez les photos optimisées (max 80 Ko chacune) dans `public/photos/`.
2. Référencez chaque plat dans `src/data/platPhotos.json` avec la clé `categorie::nom` exacte issue de `src/data/restaurantData.ts` (avec `src`, `width`, `height`, `alt`).
3. Exécutez `node scripts/check-photos.mjs` puis `npm run build`.

## Mise en ligne

### Option 1 : Vercel (recommandée)

1. Importez le dépôt sur Vercel (framework : Vite, commande de build : `npm run build`, dossier de sortie : `dist`).
2. Ajoutez la variable d’environnement `VITE_WHATSAPP_NUMBER` dans les réglages du projet Vercel.
3. Les en-têtes de sécurité (`Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) et `X-Robots-Tag: noindex, nofollow` sur `*.vercel.app` sont appliqués automatiquement via `vercel.json`.

### Option 2 : Cloudflare Pages ou Netlify

1. Configurez la commande de build `npm run build` et le répertoire publié `dist`.
2. Renseignez `VITE_WHATSAPP_NUMBER` dans les variables d’environnement de build.
3. Le fichier `public/_headers` est copié dans `dist/_headers` et applique la politique de sécurité stricte identique à `vercel.json`.

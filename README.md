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
- `npm run verif:animations` : contrôle des budgets JS/CSS gzip, polices, accessibilité et règles d’animation
- `npm test` : suite de tests unitaires (nettoyage, validation téléphone/noms/liens, créneaux horaires)

## Activation des informations confirmées

Toutes les mentions conditionnelles (horaires précis, e-mail, services, privatisation, commande à emporter ou livraison) sont centralisées dans `src/data/confirmations.ts` via l’objet `CONFIRME`. Passez un indicateur à `true` uniquement après accord explicite de l’établissement (voir la liste dans `docs/A-CONFIRMER.md`).

## Ajout des photos du restaurant

1. **Photos des plats** : déposez les images optimisées (max 80 Ko chacune) dans `public/photos/`, puis référencez chaque plat dans `src/data/platPhotos.json` avec la clé `categorie::nom` exacte issue de `src/data/restaurantData.ts` (`src`, `width`, `height`, `alt`).
2. **Photos du lieu (façade, salle, terrasse)** : déposez les images dans `public/photos/lieu/` et ajoutez un fichier `public/photos/lieu/manifest.json` listant des objets `{ "fichier", "legende", "credit", "emplacement" }`. Sans ce fichier, les scènes architecturales dessinées s’affichent automatiquement.
3. Les deux logos officiels se trouvent dans `public/assets/logo-rond.webp` et `public/assets/logo-complet.jpeg`.
4. Exécutez `npm run build && npm run verif && npm run verif:animations`.

## Mise en ligne

### Option 1 : Vercel (recommandée)

1. Importez le dépôt sur Vercel (framework : Vite, commande de build : `npm run build`, dossier de sortie : `dist`).
2. Ajoutez la variable d’environnement `VITE_WHATSAPP_NUMBER` dans les réglages du projet Vercel.
3. Les en-têtes de sécurité (`Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) et `X-Robots-Tag: noindex, nofollow` sur `*.vercel.app` sont appliqués automatiquement via `vercel.json`.

### Option 2 : Cloudflare Pages ou Netlify

1. Configurez la commande de build `npm run build` et le répertoire publié `dist`.
2. Renseignez `VITE_WHATSAPP_NUMBER` dans les variables d’environnement de build.
3. Le fichier `public/_headers` est copié dans `dist/_headers` et applique la politique de sécurité stricte identique à `vercel.json`.

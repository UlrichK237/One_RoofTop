# Chorégraphie et système de mouvement : One Rooftop

Ce document décrit l’architecture technique et visuelle des animations du site One Rooftop (direction « Étages »).

## 1. Principes et contraintes techniques

- **Zéro bibliothèque externe** : aucune dépendance d’animation (ni GSAP, ni Framer Motion, ni Lottie, ni Three.js, ni anime.js). Uniquement CSS, SVG, l’API Web Animations, `IntersectionObserver` et `animation-timeline`.
- **Propriétés animées légères** : seules `transform`, `opacity`, `clip-path`, `stroke-dashoffset` (et `grid-template-rows` pour l’ouverture du tiroir de recherche) sont animées. Aucune animation de `width`, `height`, `top`, `left`, `margin`, `padding` ou `box-shadow`.
- **Jetons CSS (`src/design/motion/motion.css`)** :
  - Durées : `--t-fast: 150ms`, `--t-base: 320ms`, `--t-slow: 680ms`, `--t-epic: 1100ms`.
  - Courbes : `--ease-out`, `--ease-in-out`, `--ease-spring`.
  - Nombre maximal de `will-change` : 5 déclarations dans le CSS (plafond fixé à 8).
- **Observer partagé et boucle limitée** :
  - `src/design/motion/useReveal.ts` utilise un seul `IntersectionObserver` global avec `unobserve` dès l’entrée en vue.
  - `src/design/motion/useActiveWhenVisible.ts` met en pause (`.est-en-pause`) les boucles infinies dès qu’une scène sort de l’écran ou que l’onglet passe en arrière-plan (`data-tab-hidden="true"`).
  - `src/design/motion/useSectionProgress.ts` partage une boucle `requestAnimationFrame` plafonnée à 30 images par seconde et inactive lorsque l’onglet est masqué ou lorsque le mode n’est pas `full`.

## 2. Les 7 scènes chorégraphiques

1. **Scène 1 : Hero « Allumage » (`src/design/HeroAllumage.tsx`)**
   - Tracé rapide des filets architecturaux de la grille du logo en SVG (`stroke-dashoffset`), sautable instantanément par clic, touche `Échap` ou défilement.
   - Textes lisibles sous 600 ms sans écran bloquant.
   - Effet « Lanterne » au pointeur (`--mx`, `--my`) sur masque radial doux, sans aucune ombre portée ni texte modifié.
   - Parallaxe légère sur 2 couches (`max ±32 px`), et indice discret « Monter » mis en pause hors écran.

2. **Scène 2 : Ascenseur « Ascension » (`src/design/AscenseurNav.tsx`)**
   - Barre complète dans la marge droite uniquement lorsque la marge disponible dépasse `220 px` (`>= 1592 px` de largeur d’écran) : cabine coulissante en or et jauge verticale liée à `animation-timeline: scroll(root block)` avec repli `--scroll-progress`.
   - En dessous (y compris `1024`, `1280`, `1366`, `1440` et `1536 px`), affichage d’un bouton compact flottant (code d’étage + anneau SVG de progression) ouvrant la liste au clic sans jamais recouvrir le hero.

3. **Scène 3 : Portes d’ascenseur inter-étages (`src/design/PortesAscenseur.tsx`)**
   - Double vantail SVG bronze et or entre chaque étage, piloté au défilement par `animation-timeline: view(block)` (`@supports`) avec repli automatique via `IntersectionObserver`.

4. **Scène 4 : Ambiances par étage & Photos lieu (`src/design/AmbiancesEtage.tsx`)**
   - Scènes vectorielles dédiées (`bar`, `cuisine`, `cave`, `soirees`, `sommet`), animées à faible contraste et mises en pause hors écran.
   - Le composant `CadrePhotoLieu` lit `public/photos/lieu/manifest.json` s’il est présent pour afficher les photos officielles avec un zoom lent (`1` à `1.06` sur `14 s`, en pause hors vue) et légende ; sinon, il affiche la scène dessinée correspondante.

5. **Scène 5 : Carte vivante (`src/design/RegistreCarte.tsx`)**
   - Indicateur doré glissant sous l’onglet actif (`--tab-x`, `--tab-y`, `--tab-sx`).
   - Transition douce entre catégories via `document.startViewTransition` si disponible, avec repli immédiat.
   - Échelonnement d’entrée limité à 500 ms sur les 12 premières lignes, filet doré au survol, ouverture/fermeture du panneau de recherche par `grid-template-rows`.
   - Envolée d’un point doré vers le panier via l’API Web Animations (`src/design/motion/flyToCart.ts`) accompagnée d’une vibration tactile discrète (10 ms) lorsque le panier est actif.

6. **Scène 6 : Fenêtres, formulaires & boutons (`ModalFrame.tsx`, `ReservationPanel.tsx`, `BoutonMagnetique.tsx`)**
   - Ouverture nette par `scale(0.96 -> 1)` sans `backdrop-filter`.
   - Soulignement doré au focus des champs (`.champ-ligne-or`), glissement des messages d’erreur, coche de confirmation tracée en SVG avec 8 rayons.
   - Boutons principaux magnétiques limités à `±5 px` uniquement sur pointeur fin (`(pointer: fine)`).

7. **Scène 7 : Typographie en mouvement (`RegistreCarte.tsx`, `App.tsx`)**
   - Révélation masquée des titres d’étage avec resserrement progressif de l’interlettrage (`0.36em -> 0.14em`).
   - Chiffres d’étage en contour bronze qui se remplissent d’or selon l’avancement de lecture (`clip-path`).
   - Fondu croisé de `200 ms` lors du changement de langue `FR / EN`.

## 3. Modes d’accessibilité (`html[data-motion]`)

- `full` : toutes les scènes actives (si l’utilisateur ne demande pas une réduction des mouvements).
- `reduced` : animations de boucle, parallaxe et déplacements coupés ; fondus courts conservés (`150 ms`). Par défaut si `prefers-reduced-motion: reduce` est actif au niveau du système.
- `off` : toutes les transitions et animations coupées (`transition-duration: 0ms`).
- Un bouton dans le pied de page permet à chaque visiteur de basculer entre **Complets**, **Réduits** et **Désactivés** à tout moment.

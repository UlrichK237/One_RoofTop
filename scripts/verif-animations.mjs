#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const DESIGN_DIR = path.join(SRC_DIR, 'design');
const DIST_ASSETS = path.join(ROOT, 'dist/assets');

let aErreur = false;

function resultat(ok, libelle, detail = '') {
  const prefix = ok ? 'OK' : 'ERREUR';
  console.log(`${prefix}: ${libelle}${detail ? ` : ${detail}` : ''}`);
  if (!ok) aErreur = true;
}

function listerFichiers(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listerFichiers(full, exts));
    } else if (!exts || exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

// 1. Aucune bibliothèque d'animation interdite dans package.json ni en import dans src/
const LIBS_INTERDITES = [
  'gsap',
  'framer-motion',
  'motion',
  '@emotion/react',
  '@emotion/styled',
  'lottie-web',
  'lottie-react',
  'three',
  'animejs',
];

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const toutesDeps = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
};
const depsInterditesPresentes = LIBS_INTERDITES.filter((lib) =>
  Object.prototype.hasOwnProperty.call(toutesDeps, lib),
);

const fichiersCodeSrc = listerFichiers(SRC_DIR, ['.ts', '.tsx', '.js', '.jsx']);
const importsInterdits = [];
const reImport = /from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
for (const file of fichiersCodeSrc) {
  const txt = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = reImport.exec(txt)) !== null) {
    const spec = m[1] || m[2] || '';
    if (
      LIBS_INTERDITES.some((lib) => spec === lib || spec.startsWith(`${lib}/`))
    ) {
      importsInterdits.push(`${path.relative(ROOT, file)} -> ${spec}`);
    }
  }
}

resultat(
  depsInterditesPresentes.length === 0 && importsInterdits.length === 0,
  'Aucune bibliothèque d’animation interdite dans package.json ni src/',
  [...depsInterditesPresentes, ...importsInterdits].join(', '),
);

// 2. Au moins 15 animations distinctes dans src/design/ (@keyframes, transition, animate(, animation-timeline)
const fichiersDesign = listerFichiers(DESIGN_DIR, ['.ts', '.tsx', '.css']);
const motifsAnimations = new Set();
for (const file of fichiersDesign) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const m of txt.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)) {
    motifsAnimations.add(`keyframes:${m[1]}`);
  }
  for (const m of txt.matchAll(/\.animate\(/g)) {
    motifsAnimations.add(`waapi:${path.basename(file)}:${m.index}`);
  }
  for (const m of txt.matchAll(/animation-timeline\s*:\s*([^;}\n]+)/g)) {
    motifsAnimations.add(`timeline:${m[1].trim()}`);
  }
  for (const m of txt.matchAll(/\n\s*(\.[a-z0-9_-]+)[^{]*\{[^}]*transition(?:-property)?\s*:/gi)) {
    motifsAnimations.add(`transition:${m[1]}`);
  }
}
resultat(
  motifsAnimations.size >= 15,
  'Au moins 15 mécanismes d’animation distincts dans src/design/',
  `${motifsAnimations.size} recensés`,
);

// 3. Aucune animation de propriétés interdites (width, height, top, left, margin, padding, box-shadow)
const fichiersCss = listerFichiers(SRC_DIR, ['.css']);
const PROPS_INTERDITES = ['width', 'height', 'top', 'left', 'margin', 'padding', 'box-shadow'];
const animsInterdites = [];

for (const file of fichiersCss) {
  const txt = fs.readFileSync(file, 'utf8');
  const sansCommentaires = txt.replace(/\/\*[\s\S]*?\*\//g, '');
  const rel = path.relative(ROOT, file);

  // Vérification dans @keyframes
  for (const kf of sansCommentaires.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
    const nom = kf[1];
    const corps = kf[2];
    for (const prop of PROPS_INTERDITES) {
      const reProp = new RegExp(`(?:^|[;{\\s])${prop}(?:-[a-z-]+)?\\s*:`, 'i');
      if (reProp.test(corps)) {
        animsInterdites.push(`${rel} @keyframes ${nom} (${prop})`);
      }
    }
  }

  // Vérification dans transition: ou transition-property:
  for (const tr of sansCommentaires.matchAll(/transition(?:-property)?\s*:\s*([^;]+);/gi)) {
    const valeur = tr[1];
    for (const prop of PROPS_INTERDITES) {
      const reProp = new RegExp(`\\b${prop}(?:-[a-z-]+)?\\b`, 'i');
      if (reProp.test(valeur)) {
        animsInterdites.push(`${rel} transition (${prop})`);
      }
    }
  }
}

resultat(
  animsInterdites.length === 0,
  'Aucune animation de width, height, top, left, margin, padding ou box-shadow dans les CSS',
  animsInterdites.join(', '),
);

// 4. <= 8 déclarations will-change dans src/
let nbWillChange = 0;
for (const file of fichiersCss) {
  const txt = fs.readFileSync(file, 'utf8');
  const matches = txt.match(/will-change\s*:/gi);
  if (matches) nbWillChange += matches.length;
}
resultat(
  nbWillChange <= 8,
  'Nombre de déclarations will-change <= 8 dans src/',
  `${nbWillChange} / 8`,
);

// 5. Support prefers-reduced-motion et html[data-motion] + pause hors écran des boucles infinies
const motionCssPath = path.join(DESIGN_DIR, 'motion/motion.css');
const motionCss = fs.existsSync(motionCssPath) ? fs.readFileSync(motionCssPath, 'utf8') : '';
const hasReducedMotion =
  motionCss.includes('prefers-reduced-motion: reduce') &&
  motionCss.includes("data-motion='reduced'") &&
  motionCss.includes("data-motion='off'");
resultat(
  hasReducedMotion,
  'Prise en charge de prefers-reduced-motion et data-motion (full/reduced/off)',
);

const classesInfinies = [...motionCss.matchAll(/(\.[a-z0-9_-]+)\s*\{[^}]*infinite[^}]*\}/gi)].map(
  (m) => m[1],
);
const classesUniques = [...new Set(classesInfinies)];
const hasPauseHorsEcran =
  motionCss.includes('.est-en-pause') &&
  motionCss.includes('animation-play-state: paused') &&
  classesUniques.every((cls) => motionCss.includes(`data-tab-hidden='true'] ${cls}`));

resultat(
  classesUniques.length > 0 && hasPauseHorsEcran,
  'Boucles infinies mises en pause hors écran (.est-en-pause) et onglet masqué',
  `${classesUniques.length} classes vérifiées`,
);

// 6. Correction des accents français (À Â Ç È É Ê Ô Û Ù Î Ï Œ) et fontes Jost unicode-range
const textesSite = fs.readFileSync(path.join(SRC_DIR, 'data/textesSite.ts'), 'utf8');
const hasCombiningMark = /[\u0300-\u0303]/.test(textesSite);
const mainTsx = fs.readFileSync(path.join(SRC_DIR, 'main.tsx'), 'utf8');
const usesFullJost =
  mainTsx.includes("@fontsource/jost/400.css") &&
  mainTsx.includes("@fontsource/jost/500.css") &&
  !mainTsx.includes("latin-ext-400.css");

const distFiles = listerFichiers(DIST_ASSETS, ['.js', '.css']);
const distCssFiles = distFiles.filter((f) => f.endsWith('.css'));
const distJsFiles = distFiles.filter((f) => f.endsWith('.js'));

let distCssCombined = '';
for (const f of distCssFiles) distCssCombined += fs.readFileSync(f, 'utf8');
const facesJostSansUnicodeRange = [...distCssCombined.matchAll(/@font-face\s*\{[^}]*font-family:\s*['"]?Jost['"]?[^}]*\}/gi)].filter(
  (m) => !m[0].includes('unicode-range'),
);

resultat(
  !hasCombiningMark && usesFullJost && facesJostSansUnicodeRange.length === 0,
  'Encodage NFC et découpage unicode-range Jost corrects pour À Â Ç È Ê Ô Û Ù Î Ï Œ',
  facesJostSansUnicodeRange.length > 0 ? '@font-face Jost sans unicode-range détecté' : '',
);

// 7. Respect des budgets JS (<= 110 Ko gzip) et CSS (<= 20 Ko gzip)
if (distFiles.length === 0) {
  resultat(false, 'Dossier dist/assets présent pour contrôle de poids', 'Exécutez npm run build');
} else {
  const sumGzip = (files) =>
    files.reduce((acc, f) => acc + zlib.gzipSync(fs.readFileSync(f)).length, 0);

  const jsGzip = sumGzip(distJsFiles);
  const cssGzip = sumGzip(distCssFiles);
  const limiteJs = 110 * 1024;
  const limiteCss = 20 * 1024;

  resultat(
    jsGzip <= limiteJs,
    'Budget JS <= 110 Ko gzip',
    `${(jsGzip / 1024).toFixed(2)} Ko / 110.00 Ko`,
  );
  resultat(
    cssGzip <= limiteCss,
    'Budget CSS <= 20 Ko gzip',
    `${(cssGzip / 1024).toFixed(2)} Ko / 20.00 Ko`,
  );
}

// 8. CSP stricte : aucun style= ni <script> en ligne dans dist/index.html
const distIndex = path.join(ROOT, 'dist/index.html');
if (fs.existsSync(distIndex)) {
  const html = fs.readFileSync(distIndex, 'utf8');
  const hasInlineStyle = /\sstyle\s*=/.test(html);
  const hasInlineScript = /<script(?![^>]*\bsrc=)[^>]*>/.test(html);
  resultat(
    !hasInlineStyle && !hasInlineScript,
    'Aucun attribut style= ni script inline dans dist/index.html (CSP stricte)',
  );
}

if (aErreur) {
  process.exit(1);
}

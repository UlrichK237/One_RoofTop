#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const DIST_DIR = path.join(ROOT, 'dist');

const MOTS_INTERNES = ['a_verifier', 'confiance', 'audit', 'dossier', 'TODO', 'lorem'];
const DOMAINES_AUTORISES = [
  'wa.me',
  'schema.org',
  'w3.org',
  'google.com/maps',
  'www.google.com/maps',
  'commons.wikimedia.org',
  'creativecommons.org',
  'react.dev/errors',
];

let aErreur = false;

function resultat(ok, libelle, detail = '') {
  const prefix = ok ? 'OK' : 'ERREUR';
  console.log(`${prefix}: ${libelle}${detail ? ` — ${detail}` : ''}`);
  if (!ok) aErreur = true;
}

function listerFichiers(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listerFichiers(full));
    } else if (/\.(ts|tsx|js|mjs|css|html|json|txt)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const fichiersSrc = listerFichiers(SRC_DIR);
const fichiersDist = listerFichiers(DIST_DIR);

// 1. Aucun mot interne dans src/ ni dist/
const occMots = [];
for (const file of [...fichiersSrc, ...fichiersDist]) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const mot of MOTS_INTERNES) {
    const re = new RegExp(`\\b${mot}\\b`, 'i');
    if (re.test(txt)) {
      occMots.push(`${path.relative(ROOT, file)} (${mot})`);
    }
  }
}
resultat(occMots.length === 0, 'Aucun mot interne dans src/ ni dist/', occMots.join(', '));

// 2. "wa.me" uniquement dans src/engine/whatsapp.ts
const fichiersWaMe = [];
for (const file of fichiersSrc) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const txt = fs.readFileSync(file, 'utf8');
  if (txt.includes('wa.me') && rel !== 'src/engine/whatsapp.ts') {
    fichiersWaMe.push(rel);
  }
}
resultat(
  fichiersWaMe.length === 0,
  '"wa.me" isolé uniquement dans src/engine/whatsapp.ts',
  fichiersWaMe.join(', '),
);

// 3. localStorage uniquement pour la clé du panier
const fichiersLocalStorage = [];
for (const file of fichiersSrc) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const txt = fs.readFileSync(file, 'utf8');
  if (txt.includes('localStorage') && rel !== 'src/engine/panier.ts') {
    fichiersLocalStorage.push(rel);
  }
}
resultat(
  fichiersLocalStorage.length === 0,
  'localStorage réservé uniquement au panier dans src/engine/panier.ts',
  fichiersLocalStorage.join(', '),
);

// 4. Aucune URL externe dans dist/ hors liste courte
const urlsExternesInterdites = [];
if (fichiersDist.length === 0) {
  resultat(false, 'Dossier dist/ présent pour inspection des URLs', 'Exécutez npm run build');
} else {
  const reUrl = /https?:\/\/([a-zA-Z0-9.-]+)(\/[^\s"'`<>)]*)?/g;
  for (const file of fichiersDist) {
    const txt = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = reUrl.exec(txt)) !== null) {
      const host = match[1].toLowerCase();
      const fullPath = `${host}${match[2] || ''}`.toLowerCase();
      const autorise = DOMAINES_AUTORISES.some(
        (d) => host === d || host.endsWith(`.${d}`) || fullPath.startsWith(d),
      );
      if (!autorise) {
        urlsExternesInterdites.push(`${path.relative(ROOT, file)}: ${match[0]}`);
      }
    }
  }
  resultat(
    urlsExternesInterdites.length === 0,
    'Aucune URL externe non autorisée dans dist/',
    urlsExternesInterdites.slice(0, 5).join(', '),
  );
}

// 5. _headers et vercel.json présents avec la même CSP
const headersPath = path.join(ROOT, 'public/_headers');
const vercelPath = path.join(ROOT, 'vercel.json');
let cspOk = false;
let cspDetail = '';
if (fs.existsSync(headersPath) && fs.existsSync(vercelPath)) {
  const headersTxt = fs.readFileSync(headersPath, 'utf8');
  const matchCspH = headersTxt.match(/Content-Security-Policy:\s*(.+)/);
  const cspH = matchCspH ? matchCspH[1].trim() : '';

  const vercelJson = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const allHeaders = (vercelJson.headers || []).flatMap((h) => h.headers || []);
  const cspV = allHeaders.find((h) => h.key === 'Content-Security-Policy')?.value?.trim() || '';
  const hasVercelNoIndex = (vercelJson.headers || []).some(
    (rule) =>
      Array.isArray(rule.has) &&
      rule.has.some((c) => c.value?.includes('vercel\\.app')) &&
      (rule.headers || []).some((h) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')),
  );

  cspOk = Boolean(cspH) && cspH === cspV && hasVercelNoIndex;
  if (!cspOk) {
    cspDetail = 'CSP divergente ou X-Robots-Tag manquant pour *.vercel.app';
  }
} else {
  cspDetail = 'public/_headers ou vercel.json manquant';
}
resultat(cspOk, 'public/_headers et vercel.json présents avec CSP identique', cspDetail);

// 6. Un seul fichier de verrouillage (package-lock.json)
const lockCandidates = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb'];
const locksPresents = lockCandidates.filter((f) => fs.existsSync(path.join(ROOT, f)));
resultat(
  locksPresents.length === 1 && locksPresents[0] === 'package-lock.json',
  'Un seul fichier de verrouillage (package-lock.json)',
  locksPresents.join(', '),
);

// 7. Aucune dépendance inutilisée dans package.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const deps = Object.keys(pkg.dependencies || {});
const toutCode = [...fichiersSrc, fs.existsSync(path.join(ROOT, 'vite.config.ts')) ? path.join(ROOT, 'vite.config.ts') : '']
  .filter(Boolean)
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

const depsInutilisees = [];
for (const dep of deps) {
  if (dep === 'react-dom' && toutCode.includes('react-dom/client')) continue;
  if (!toutCode.includes(dep)) {
    depsInutilisees.push(dep);
  }
}
resultat(
  depsInutilisees.length === 0,
  'Aucune dépendance inutilisée dans package.json',
  depsInutilisees.join(', '),
);

if (aErreur) {
  process.exit(1);
}

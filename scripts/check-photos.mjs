#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLAT_PHOTOS_PATH = path.join(ROOT, 'src/data/platPhotos.json');
const MAX_TAILLE = 80 * 1024;
const MOTS_INTERDITS = /(logo|menu|facade|interior|map|diagram|flag|painting)/i;

let erreurs = 0;

if (!fs.existsSync(PLAT_PHOTOS_PATH)) {
  console.error('ERREUR: src/data/platPhotos.json introuvable.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(PLAT_PHOTOS_PATH, 'utf8'));
const plats = data.plats || {};
const urls = new Set();
const titres = new Set();
const hashes = new Set();

for (const [cle, info] of Object.entries(plats)) {
  if (!info || typeof info.src !== 'string') {
    console.error(`ERREUR: Entrée invalide pour ${cle}`);
    erreurs += 1;
    continue;
  }

  if (info.sourceUrl) {
    if (urls.has(info.sourceUrl)) {
      console.error(`ERREUR: sourceUrl en doublon (${info.sourceUrl}) sur ${cle}`);
      erreurs += 1;
    }
    urls.add(info.sourceUrl);
  }

  if (info.titre) {
    if (MOTS_INTERDITS.test(info.titre)) {
      console.error(`ERREUR: Titre interdit (${info.titre}) sur ${cle}`);
      erreurs += 1;
    }
    if (titres.has(info.titre)) {
      console.error(`ERREUR: Titre en doublon (${info.titre}) sur ${cle}`);
      erreurs += 1;
    }
    titres.add(info.titre);
  }

  if (info.licence && /NC|ND/i.test(info.licence)) {
    console.error(`ERREUR: Licence non autorisée (${info.licence}) sur ${cle}`);
    erreurs += 1;
  }

  const fichier = path.join(ROOT, 'public', info.src.replace(/^\//, ''));
  if (!fs.existsSync(fichier)) {
    console.error(`ERREUR: Fichier photo absent (${fichier}) pour ${cle}`);
    erreurs += 1;
    continue;
  }

  const buf = fs.readFileSync(fichier);
  if (buf.length > MAX_TAILLE) {
    console.error(`ERREUR: Photo > 80 Ko (${buf.length} octets) pour ${cle}`);
    erreurs += 1;
  }

  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (hashes.has(sha)) {
    console.error(`ERREUR: Contenu SHA-256 en doublon (${sha}) pour ${cle}`);
    erreurs += 1;
  }
  hashes.add(sha);
}

if (erreurs > 0) {
  console.error(`ERREUR: ${erreurs} problème(s) détecté(s) dans les photos.`);
  process.exit(1);
}

console.log(`OK: Vérification photos réussie (${Object.keys(plats).length} entrée(s), 0 doublon).`);

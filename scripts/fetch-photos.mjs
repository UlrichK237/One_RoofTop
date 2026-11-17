#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const QUERIES_PATH = path.join(ROOT, 'src/data/photoQueries.json');
const PLAT_PHOTOS_PATH = path.join(ROOT, 'src/data/platPhotos.json');
const OUT_DIR = path.join(ROOT, 'public/photos');
const REVIEW_PATH = path.join(ROOT, 'scripts/out/photos-review.html');

const LICENCES_AUTORISEES = ['CC0', 'Public domain', 'CC BY', 'CC BY-SA'];
const MOTS_INTERDITS_TITRE = /(logo|menu|facade|interior|map|diagram|flag|painting)/i;
const MAX_TAILLE_OCTETS = 80 * 1024;
const PAUSE_MS = 600;
const USER_AGENT = 'OneRooftopBonaprisoMenuFetcher/1.0 (mailto:reservation@one-rooftop.com)';

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function licenceEstValide(nomLicence) {
  if (!nomLicence) return false;
  if (/NC|ND/i.test(nomLicence)) return false;
  return LICENCES_AUTORISEES.some((ok) => nomLicence.toUpperCase().includes(ok.toUpperCase()));
}

async function rechercherCommons(motsCles) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrnamespace: '6',
      gsrsearch: motsCles,
      gsrlimit: '8',
      prop: 'imageinfo',
      iiprop: 'url|size|extmetadata|mime',
      iiurlwidth: '720',
      format: 'json',
    }).toString();

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
  return pages;
}

async function main() {
  const onlyArgIdx = process.argv.indexOf('--only');
  const onlyKey = onlyArgIdx !== -1 ? process.argv[onlyArgIdx + 1] : null;

  const queriesData = fs.existsSync(QUERIES_PATH)
    ? JSON.parse(fs.readFileSync(QUERIES_PATH, 'utf8'))
    : { plats: [] };
  const existant = fs.existsSync(PLAT_PHOTOS_PATH)
    ? JSON.parse(fs.readFileSync(PLAT_PHOTOS_PATH, 'utf8'))
    : { plats: {} };

  const platsMap = existant.plats || {};
  const hashesUtilises = new Set();
  const urlsUtilisees = new Set();
  const titresUtilises = new Set();

  for (const entree of Object.values(platsMap)) {
    if (entree.sourceUrl) urlsUtilisees.add(entree.sourceUrl);
    if (entree.titre) titresUtilises.add(entree.titre);
    if (entree.sha256) hashesUtilises.add(entree.sha256);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });

  const cibles = (queriesData.plats || []).filter(
    (q) => !onlyKey || `${q.categorie}::${q.nom}` === onlyKey,
  );

  for (const item of cibles) {
    const cle = `${item.categorie}::${item.nom}`;
    await pause(PAUSE_MS);
    try {
      const pages = await rechercherCommons(item.mots_cles);
      for (const page of pages) {
        const titre = page.title || '';
        if (MOTS_INTERDITS_TITRE.test(titre) || titresUtilises.has(titre)) continue;

        const info = page.imageinfo?.[0];
        if (!info || !info.thumburl) continue;
        if (!/^image\/(jpeg|webp|png)$/i.test(info.mime || '')) continue;

        const sourceUrl = info.descriptionurl || info.url;
        if (urlsUtilisees.has(sourceUrl)) continue;

        const meta = info.extmetadata || {};
        const licence = meta.LicenseShortName?.value || '';
        if (!licenceEstValide(licence)) continue;

        await pause(PAUSE_MS);
        const imgRes = await fetch(info.thumburl, { headers: { 'User-Agent': USER_AGENT } });
        if (!imgRes.ok) continue;
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.length > MAX_TAILLE_OCTETS) continue;

        const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
        if (hashesUtilises.has(sha256)) continue;

        const ext = info.mime === 'image/png' ? 'png' : 'jpg';
        const nomFichier = `${sha256.slice(0, 12)}.${ext}`;
        fs.writeFileSync(path.join(OUT_DIR, nomFichier), buf);

        urlsUtilisees.add(sourceUrl);
        titresUtilises.add(titre);
        hashesUtilises.add(sha256);

        platsMap[cle] = {
          src: `/photos/${nomFichier}`,
          width: info.thumbwidth || 720,
          height: info.thumbheight || 540,
          titre,
          sha256,
          auteur: (meta.Artist?.value || 'Auteur inconnu').replace(/<[^>]*>/g, '').trim(),
          licence,
          sourceUrl,
          approchante: item.type === 'approchant',
        };
        break;
      }
    } catch (err) {
      console.error(`Erreur sur ${cle}: ${err.message}`);
    }
  }

  fs.writeFileSync(PLAT_PHOTOS_PATH, JSON.stringify({ plats: platsMap }, null, 2) + '\n');

  const lignesHtml = Object.entries(platsMap)
    .map(
      ([cle, p]) =>
        `<tr><td>${cle}</td><td><img src="../../public${p.src}" width="120" /></td><td>${p.auteur || ''}</td><td>${p.licence || ''}</td><td><a href="${p.sourceUrl || '#'}">Source</a></td></tr>`,
    )
    .join('\n');

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>Revue des photos - One Rooftop</title></head>
<body>
<h1>Revue des photos (${Object.keys(platsMap).length})</h1>
<p>Politique actuelle : aucune photo approchante externe, uniquement les photos fournies par le restaurant.</p>
<table border="1" cellpadding="6">
<thead><tr><th>Clé</th><th>Aperçu</th><th>Auteur</th><th>Licence</th><th>Source</th></tr></thead>
<tbody>${lignesHtml || '<tr><td colspan="5">Aucune photo externe téléchargée (attente des photos du restaurant).</td></tr>'}</tbody>
</table>
</body>
</html>`;

  fs.writeFileSync(REVIEW_PATH, html);
  console.log(`Revue générée : ${REVIEW_PATH} (${Object.keys(platsMap).length} photo(s))`);
}

main();

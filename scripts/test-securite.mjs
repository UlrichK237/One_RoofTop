#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  appliquerCorrections,
  nettoyerTexte,
  normaliserRecherche,
  validerLienHttps,
  validerNom,
  validerTelephone,
} from '../src/engine/sanitize.ts';
import {
  calculerStatutOuverture,
  genererCreneauxReservation,
  verifierCreneauValide,
} from '../src/engine/horaires.ts';
import { restaurantData } from '../src/data/restaurantData.ts';

const corrections = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/data/corrections.json'), 'utf8'),
);

test('nettoyerTexte supprime caractères de contrôle, largeur nulle, direction et symboles', () => {
  const sale = 'Bonjour\u0000\u200B\u202E *<script>_alert~`';
  const propre = nettoyerTexte(sale, 100);
  assert.equal(propre.includes('*'), false);
  assert.equal(propre.includes('<'), false);
  assert.equal(propre.includes('>'), false);
  assert.equal(propre.includes('\u200B'), false);
  assert.equal(propre.includes('\u202E'), false);
  assert.equal(nettoyerTexte('abcdef', 3), 'abc');
});

test('validerNom accepte lettres Unicode et rejette caractères non autorisés', () => {
  assert.equal(validerNom('Élodie N’Djaména').valide, true);
  assert.equal(validerNom('Jean-François').valide, true);
  assert.equal(validerNom('A').valide, false);
  assert.equal(validerNom('User123').valide, false);
});

test('validerTelephone accepte numéros camerounais, 00->+ et internationaux', () => {
  const cmLocal = validerTelephone('671 03 33 33');
  assert.equal(cmLocal.valide, true);
  assert.equal(cmLocal.normalise, '+237671033333');

  const cm00 = validerTelephone('00237 671 03 33 33');
  assert.equal(cm00.valide, true);
  assert.equal(cm00.normalise, '+237671033333');

  const intl = validerTelephone('0033 6 12 34 56 78');
  assert.equal(intl.valide, true);
  assert.equal(intl.normalise, '+33612345678');

  assert.equal(validerTelephone('123').valide, false);
});

test('validerLienHttps autorise uniquement https://', () => {
  assert.equal(validerLienHttps('https://www.google.com/maps'), true);
  assert.equal(validerLienHttps('http://example.com'), false);
  assert.equal(validerLienHttps('javascript:alert(1)'), false);
  assert.equal(validerLienHttps('data:text/html,hi'), false);
});

test('appliquerCorrections corrige les sous-chaînes attendues', () => {
  assert.equal(
    appliquerCorrections('Shitake Mushrooms & Siracha', corrections),
    'Shiitake Mushrooms & Sriracha',
  );
  assert.equal(appliquerCorrections('SALMON CALIFORNIA RO L', corrections), 'SALMON CALIFORNIA ROLL');
});

test('normaliserRecherche est insensible aux accents et à la casse', () => {
  assert.equal(normaliserRecherche('Crème Brûlée'), 'creme brulee');
});

test('horaires et créneaux gèrent les fermetures après minuit à Africa/Douala', () => {
  // Lundi 2026-11-16 à 18:00 UTC = 19:00 Africa/Douala (ouvert, ferme à 01:00)
  const lundiSoir = new Date('2026-11-16T18:00:00Z');
  const statut = calculerStatutOuverture(
    restaurantData.lieux.horaires,
    'Africa/Douala',
    true,
    lundiSoir,
  );
  assert.equal(statut.ouvert, true);

  // Dimanche matin 02:30 à Douala (01:30 UTC) -> toujours ouvert du service de Samedi (17h -> 04h)
  const dimancheTard = new Date('2026-11-15T01:30:00Z');
  const statutSamediNuit = calculerStatutOuverture(
    restaurantData.lieux.horaires,
    'Africa/Douala',
    true,
    dimancheTard,
  );
  assert.equal(statutSamediNuit.ouvert, true);

  // Créneaux pour un samedi futur (2026-11-21) : 17:00 jusqu'à 03:00 (60 min avant 04:00)
  const creneauxSamedi = genererCreneauxReservation(
    '2026-11-21',
    restaurantData.lieux.horaires,
    'Africa/Douala',
    lundiSoir,
  );
  assert.equal(creneauxSamedi[0], '17:00');
  assert.equal(creneauxSamedi[creneauxSamedi.length - 1], '03:00');
  assert.equal(
    verifierCreneauValide('2026-11-21', '02:30', restaurantData.lieux.horaires, 'Africa/Douala', lundiSoir),
    true,
  );
  assert.equal(
    verifierCreneauValide('2026-11-21', '03:30', restaurantData.lieux.horaires, 'Africa/Douala', lundiSoir),
    false,
  );
});

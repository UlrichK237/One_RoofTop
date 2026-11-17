import type { Plat } from '../data/restaurantData';
import { nettoyerTexte } from './sanitize';

export const PANIER_STORAGE_KEY = 'one_rooftop_panier_v1';
export const PANIER_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_QTE_PAR_LIGNE = 20;
export const MAX_TOTAL_ARTICLES = 40;

export type ModeOptionsPlat =
  | 'aucune'
  | 'obligatoire_unique'
  | 'facultative_multiple'
  | 'remarque_obligatoire';

export interface LignePanierStockee {
  id: string;
  quantite: number;
  options: string[];
  remarque: string;
}

export interface LignePanierHydratee extends LignePanierStockee {
  categorie: string;
  nom: string;
  prixUnitaire: number;
  sousTotal: number;
  photoCle: string;
}

interface PayloadStockage {
  version: 1;
  savedAt: number;
  items: LignePanierStockee[];
}

export function clePhotoPlat(categorie: string, nom: string): string {
  return `${categorie}::${nom}`;
}

export function determinerModeOptions(plat: Plat): ModeOptionsPlat {
  const desc = (plat.description || '').toLowerCase();
  if (plat.options && plat.options.length > 0) {
    if (desc.includes('en option')) {
      return 'facultative_multiple';
    }
    return 'obligatoire_unique';
  }
  if (desc.includes('au choix')) {
    return 'remarque_obligatoire';
  }
  return 'aucune';
}

export function calculerPrixUnitaire(plat: Plat, options: string[]): number {
  if (plat.prixOptions && options.length > 0) {
    for (const opt of options) {
      if (typeof plat.prixOptions[opt] === 'number') {
        return plat.prixOptions[opt];
      }
    }
  }
  return plat.prix;
}

export function formaterPrixFCFA(montant: number): string {
  const entier = Math.round(montant);
  return `${entier.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')} FCFA`;
}

export function totalArticlesPanier(lignes: { quantite: number }[]): number {
  return lignes.reduce((acc, l) => acc + l.quantite, 0);
}

export function totalMontantPanier(lignes: LignePanierHydratee[]): number {
  return lignes.reduce((acc, l) => acc + l.sousTotal, 0);
}

export function construireIndexPlats(
  menu: { categorie: string; plats: Plat[] }[],
): Map<string, { categorie: string; plat: Plat }> {
  const map = new Map<string, { categorie: string; plat: Plat }>();
  for (const cat of menu) {
    for (const plat of cat.plats) {
      map.set(plat.id, { categorie: cat.categorie, plat });
    }
  }
  return map;
}

export function hydraterPanier(
  lignes: LignePanierStockee[],
  indexPlats: Map<string, { categorie: string; plat: Plat }>,
): LignePanierHydratee[] {
  const resultat: LignePanierHydratee[] = [];
  let totalRestant = MAX_TOTAL_ARTICLES;

  for (const ligne of lignes) {
    if (!ligne || typeof ligne.id !== 'string') continue;
    const entree = indexPlats.get(ligne.id);
    if (!entree) continue;

    const qteBrute = Math.floor(Number(ligne.quantite));
    if (!Number.isFinite(qteBrute) || qteBrute < 1) continue;
    const quantite = Math.min(qteBrute, MAX_QTE_PAR_LIGNE, totalRestant);
    if (quantite < 1) continue;

    const optionsAutorisees = new Set(entree.plat.options ?? []);
    const options = Array.isArray(ligne.options)
      ? ligne.options.filter((o) => typeof o === 'string' && optionsAutorisees.has(o))
      : [];

    const mode = determinerModeOptions(entree.plat);
    if (mode === 'obligatoire_unique' && options.length !== 1) continue;

    const remarque = nettoyerTexte(typeof ligne.remarque === 'string' ? ligne.remarque : '', 200);
    if (mode === 'remarque_obligatoire' && !remarque) continue;

    const prixUnitaire = calculerPrixUnitaire(entree.plat, options);
    totalRestant -= quantite;

    resultat.push({
      id: entree.plat.id,
      quantite,
      options,
      remarque,
      categorie: entree.categorie,
      nom: entree.plat.nom,
      prixUnitaire,
      sousTotal: prixUnitaire * quantite,
      photoCle: clePhotoPlat(entree.categorie, entree.plat.nom),
    });
  }

  return resultat;
}

export function chargerPanierDepuisStockage(
  indexPlats: Map<string, { categorie: string; plat: Plat }>,
): LignePanierHydratee[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const brut = window.localStorage.getItem(PANIER_STORAGE_KEY);
    if (!brut) return [];
    const data = JSON.parse(brut) as Partial<PayloadStockage>;
    if (
      data?.version !== 1 ||
      typeof data.savedAt !== 'number' ||
      !Array.isArray(data.items)
    ) {
      window.localStorage.removeItem(PANIER_STORAGE_KEY);
      return [];
    }
    if (Date.now() - data.savedAt > PANIER_TTL_MS) {
      window.localStorage.removeItem(PANIER_STORAGE_KEY);
      return [];
    }
    return hydraterPanier(data.items, indexPlats);
  } catch {
    return [];
  }
}

export function sauvegarderPanierDansStockage(lignes: LignePanierStockee[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (lignes.length === 0) {
      window.localStorage.removeItem(PANIER_STORAGE_KEY);
      return;
    }
    const payload: PayloadStockage = {
      version: 1,
      savedAt: Date.now(),
      // Ne stocke jamais nom, téléphone ni adresse
      items: lignes.map((l) => ({
        id: l.id,
        quantite: Math.min(Math.max(1, Math.floor(l.quantite)), MAX_QTE_PAR_LIGNE),
        options: [...l.options],
        remarque: nettoyerTexte(l.remarque, 200),
      })),
    };
    window.localStorage.setItem(PANIER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore les quotas ou blocages de navigation privée
  }
}

export function cleLignePanier(id: string, options: string[], remarque: string): string {
  const opts = [...options].sort().join('|');
  return `${id}::${opts}::${nettoyerTexte(remarque, 200)}`;
}

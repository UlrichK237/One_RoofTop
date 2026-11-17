import type { LignePanierHydratee } from './panier';
import { formaterPrixFCFA, totalMontantPanier } from './panier';
import { MAX_LEN_ADRESSE, MAX_LEN_REMARQUE, nettoyerTexte } from './sanitize';

// Seul fichier autorisé à contenir "wa.me".
// Par défaut null tant qu'un numéro WhatsApp dédié n'est pas configuré via VITE_WHATSAPP_NUMBER.
const CONFIG_WHATSAPP_NUMBER: string | null = null;

export const MAX_WHATSAPP_URL_LEN = 1800;

export function getWhatsappNumber(): string | null {
  const envVal =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof import.meta.env.VITE_WHATSAPP_NUMBER === 'string'
      ? import.meta.env.VITE_WHATSAPP_NUMBER
      : '';
  const brut = (envVal || CONFIG_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');
  if (brut.length < 8 || brut.length > 15) {
    return null;
  }
  return brut;
}

export type ModeRetrait = 'emporter' | 'livraison';

export interface DonneesCommandeMessage {
  nomRestaurant: string;
  mode: ModeRetrait;
  nomClient: string;
  telephoneClient: string;
  adresseLivraison?: string;
  remarqueGenerale?: string;
  lignes: LignePanierHydratee[];
}

export function construireMessageCommande(donnees: DonneesCommandeMessage): string {
  const lignesTexte = donnees.lignes.map((l) => {
    const opts = l.options.length > 0 ? ` (${l.options.join(', ')})` : '';
    const rem = l.remarque ? ` · Remarque : ${nettoyerTexte(l.remarque, MAX_LEN_REMARQUE)}` : '';
    return `- ${l.quantite} x ${l.nom}${opts} : ${formaterPrixFCFA(l.sousTotal)}${rem}`;
  });

  const total = totalMontantPanier(donnees.lignes);
  const modeLibelle = donnees.mode === 'livraison' ? 'Livraison' : 'A emporter';

  const blocs: string[] = [
    `Bonjour ${donnees.nomRestaurant},`,
    `Commande (${modeLibelle})`,
    `Nom : ${nettoyerTexte(donnees.nomClient, 80)}`,
    `Telephone : ${nettoyerTexte(donnees.telephoneClient, 24)}`,
  ];

  if (donnees.mode === 'livraison' && donnees.adresseLivraison) {
    blocs.push(`Adresse : ${nettoyerTexte(donnees.adresseLivraison, MAX_LEN_ADRESSE)}`);
  }

  blocs.push('', 'Articles :', ...lignesTexte, '', `Total des plats : ${formaterPrixFCFA(total)}`);

  if (donnees.remarqueGenerale) {
    const remGen = nettoyerTexte(donnees.remarqueGenerale, MAX_LEN_REMARQUE);
    if (remGen) blocs.push(`Precision : ${remGen}`);
  }

  blocs.push('');
  if (donnees.mode === 'livraison') {
    blocs.push(
      "Le restaurant confirme par WhatsApp ou par telephone s'il peut livrer a votre adresse, et les frais eventuels.",
    );
  }
  blocs.push("Cette demande n'est prise en compte qu'apres la reponse du restaurant.");

  return blocs.join('\n');
}

export interface DonneesReservationMessage {
  nomRestaurant: string;
  date: string;
  heure: string;
  personnes: number;
  nomClient: string;
  telephoneClient: string;
  remarque?: string;
}

export function construireMessageReservation(donnees: DonneesReservationMessage): string {
  const blocs: string[] = [
    `Bonjour ${donnees.nomRestaurant},`,
    'Demande de reservation de table',
    `Date : ${donnees.date}`,
    `Heure : ${donnees.heure}`,
    `Nombre de personnes : ${donnees.personnes}`,
    `Nom : ${nettoyerTexte(donnees.nomClient, 80)}`,
    `Telephone : ${nettoyerTexte(donnees.telephoneClient, 24)}`,
  ];

  if (donnees.remarque) {
    const rem = nettoyerTexte(donnees.remarque, MAX_LEN_REMARQUE);
    if (rem) blocs.push(`Precision : ${rem}`);
  }

  blocs.push('', "La table n'est reservee qu'apres confirmation du restaurant.");
  return blocs.join('\n');
}

export function construireUrlWhatsapp(
  numero: string | null,
  message: string,
): { url: string | null; tropLong: boolean; desactive: boolean } {
  if (!numero) {
    return { url: null, tropLong: false, desactive: true };
  }
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
  if (url.length > MAX_WHATSAPP_URL_LEN) {
    return { url: null, tropLong: true, desactive: false };
  }
  return { url, tropLong: false, desactive: false };
}

export function ouvrirWhatsapp(url: string): boolean {
  if (typeof window === 'undefined' || !url.startsWith('https://wa.me/')) {
    return false;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

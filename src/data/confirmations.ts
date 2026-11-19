/**
 * Registre des informations explicitement confirmées par l'établissement.
 * Chaque texte, bloc, service ou bouton rattaché à un indicateur faux reste masqué.
 */
export const CONFIRME = {
  anneeOuverture: true,
  adresse: true,
  telephone: true,
  carte: true,
  horaires: false,
  emailReservation: false,
  auDessusDeBombayMasala: false,
  salleClimatisee: false,
  jacaranda: false,
  musiqueLive: false,
  dj: false,
  livraison: false,
  venteAEmporter: false,
  traiteur: false,
  privatisation: false,
  optionsVegetariennes: false,
  optionsHalal: false,
  parking: false,
  paiementNfc: false,
  accessibilitePmr: false,
} as const;

export const AFFICHER_PANIER = CONFIRME.livraison || CONFIRME.venteAEmporter;
export const AFFICHER_SOIREES =
  CONFIRME.musiqueLive || CONFIRME.dj || CONFIRME.privatisation || CONFIRME.traiteur || CONFIRME.jacaranda;

export const MAX_LEN_NOM = 80;
export const MAX_LEN_TEL = 24;
export const MAX_LEN_ADRESSE = 180;
export const MAX_LEN_REMARQUE = 200;

// Supprime caractères de contrôle, marques directionnelles, largeur nulle et syntaxe markup
const RE_CARACTERES_INTERDITS =
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF*_~`<>]/g;

export function nettoyerTexte(entree: string, maxLen = MAX_LEN_REMARQUE): string {
  if (typeof entree !== 'string') return '';
  const propre = entree
    .replace(RE_CARACTERES_INTERDITS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return propre.slice(0, maxLen);
}

export function validerNom(nom: string): { valide: boolean; valeur: string; erreur?: string } {
  const propre = nettoyerTexte(nom, MAX_LEN_NOM);
  if (propre.length < 2) {
    return {
      valide: false,
      valeur: propre,
      erreur: 'Veuillez indiquer un nom d’au moins 2 caractères.',
    };
  }
  // Accepte toute lettre Unicode, marques diacritiques, espaces, apostrophes, tirets et points
  const reNom = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]{1,79}$/u;
  if (!reNom.test(propre)) {
    return {
      valide: false,
      valeur: propre,
      erreur: 'Le nom ne doit contenir que des lettres, espaces, tirets ou apostrophes.',
    };
  }
  return { valide: true, valeur: propre };
}

export function validerTelephone(tel: string): {
  valide: boolean;
  normalise: string;
  erreur?: string;
} {
  const propre = nettoyerTexte(tel, MAX_LEN_TEL);
  let compact = propre.replace(/[\s().-]/g, '');
  if (!compact) {
    return {
      valide: false,
      normalise: '',
      erreur: 'Veuillez saisir un numéro de téléphone.',
    };
  }

  if (compact.startsWith('00')) {
    compact = '+' + compact.slice(2);
  }

  // Numéro local camerounais à 9 chiffres (mobile 6xx ou fixe 2xx)
  if (/^[26]\d{8}$/.test(compact)) {
    return { valide: true, normalise: `+237${compact}` };
  }

  // Numéro camerounais avec indicatif +237 ou 237
  if (/^(\+?237)([26]\d{8})$/.test(compact)) {
    const match = compact.match(/^(\+?237)([26]\d{8})$/);
    return { valide: true, normalise: `+237${match![2]}` };
  }

  // Numéro international E.164 (8 à 15 chiffres)
  if (/^\+[1-9]\d{7,14}$/.test(compact)) {
    return { valide: true, normalise: compact };
  }

  return {
    valide: false,
    normalise: compact,
    erreur: 'Numéro invalide. Exemple : +237 671 03 33 33 ou format international.',
  };
}

export function validerLienHttps(url: string): boolean {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function appliquerCorrections(
  texte: string,
  corrections: Record<string, string>,
): string {
  if (!texte) return '';
  let resultat = texte;
  for (const [faute, correction] of Object.entries(corrections)) {
    if (faute && resultat.includes(faute)) {
      resultat = resultat.split(faute).join(correction);
    }
  }
  return resultat;
}

export function normaliserRecherche(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

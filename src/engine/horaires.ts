import type { HoraireJour } from '../data/restaurantData';

export interface StatutOuverture {
  confirme: boolean;
  ouvert: boolean;
  messageFr: string;
  messageEn: string;
  fermetureLocale?: string;
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function parseHHMM(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  return h * 60 + m;
}

export function formatHeureFr(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, '0')}`;
}

function minuteVersHHMM(totalMinutes: number): string {
  const mod = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(mod / 60);
  const m = mod % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function obtenirMaintenantDansFuseau(
  fuseau: string,
  maintenant: Date = new Date(),
): {
  dateStr: string;
  jourIndex: number;
  minutesJour: number;
} {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: fuseau,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(maintenant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const weekday = get('weekday');
  let hour = Number(get('hour'));
  if (hour === 24) hour = 0;
  const minute = Number(get('minute'));

  return {
    dateStr: `${year}-${month}-${day}`,
    jourIndex: WEEKDAY_MAP[weekday] ?? 0,
    minutesJour: hour * 60 + minute,
  };
}

function ajouterJoursISO(dateStr: string, jours: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d + jours);
  const dt = new Date(utc);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function jourIndexDepuisISO(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function calculerStatutOuverture(
  horaires: HoraireJour[],
  fuseau: string,
  horairesConfirmes: boolean,
  maintenant: Date = new Date(),
): StatutOuverture {
  if (!horairesConfirmes || horaires.length === 0) {
    return {
      confirme: false,
      ouvert: false,
      messageFr: '',
      messageEn: '',
    };
  }

  const { jourIndex, minutesJour } = obtenirMaintenantDansFuseau(fuseau, maintenant);
  const parJour = new Map<number, HoraireJour>(horaires.map((h) => [h.jourIndex, h]));

  const hierIndex = (jourIndex + 6) % 7;
  const horaireHier = parJour.get(hierIndex);
  if (horaireHier && !horaireHier.ferme) {
    const ouvHier = parseHHMM(horaireHier.ouverture);
    const fermHier = parseHHMM(horaireHier.fermeture);
    // Fermeture après minuit issue du service de la veille
    if (fermHier <= ouvHier && minutesJour < fermHier) {
      return {
        confirme: true,
        ouvert: true,
        fermetureLocale: horaireHier.fermeture,
        messageFr: `Ouvert maintenant · ferme à ${formatHeureFr(horaireHier.fermeture)}`,
        messageEn: `Open now · closes at ${horaireHier.fermeture}`,
      };
    }
  }

  const horaireAuj = parJour.get(jourIndex);
  if (horaireAuj && !horaireAuj.ferme) {
    const ouvAuj = parseHHMM(horaireAuj.ouverture);
    const fermAuj = parseHHMM(horaireAuj.fermeture);
    const fermEffective = fermAuj <= ouvAuj ? fermAuj + 1440 : fermAuj;

    if (minutesJour >= ouvAuj && minutesJour < fermEffective) {
      return {
        confirme: true,
        ouvert: true,
        fermetureLocale: horaireAuj.fermeture,
        messageFr: `Ouvert maintenant · ferme à ${formatHeureFr(horaireAuj.fermeture)}`,
        messageEn: `Open now · closes at ${horaireAuj.fermeture}`,
      };
    }

    if (minutesJour < ouvAuj) {
      return {
        confirme: true,
        ouvert: false,
        messageFr: `Fermé · ouvre à ${formatHeureFr(horaireAuj.ouverture)}`,
        messageEn: `Closed · opens at ${horaireAuj.ouverture}`,
      };
    }
  }

  // Cherche le prochain jour d'ouverture
  for (let decalage = 1; decalage <= 7; decalage += 1) {
    const idx = (jourIndex + decalage) % 7;
    const h = parJour.get(idx);
    if (h && !h.ferme) {
      const prefixFr = decalage === 1 ? 'demain' : h.jour.toLowerCase();
      return {
        confirme: true,
        ouvert: false,
        messageFr: `Fermé · ouvre ${prefixFr} à ${formatHeureFr(h.ouverture)}`,
        messageEn: `Closed · opens at ${h.ouverture}`,
      };
    }
  }

  return {
    confirme: true,
    ouvert: false,
    messageFr: 'Fermé',
    messageEn: 'Closed',
  };
}

export function bornesDatesReservation(
  fuseau: string,
  maintenant: Date = new Date(),
): { minDate: string; maxDate: string } {
  const { dateStr } = obtenirMaintenantDansFuseau(fuseau, maintenant);
  return {
    minDate: dateStr,
    maxDate: ajouterJoursISO(dateStr, 60),
  };
}

export function genererCreneauxReservation(
  dateStr: string,
  horaires: HoraireJour[],
  fuseau: string,
  maintenant: Date = new Date(),
): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];
  const { minDate, maxDate } = bornesDatesReservation(fuseau, maintenant);
  if (dateStr < minDate || dateStr > maxDate) return [];

  const jourIdx = jourIndexDepuisISO(dateStr);
  const horaire = horaires.find((h) => h.jourIndex === jourIdx);
  if (!horaire || horaire.ferme) return [];

  const ouvMin = parseHHMM(horaire.ouverture);
  const fermBrut = parseHHMM(horaire.fermeture);
  const fermMin = fermBrut <= ouvMin ? fermBrut + 1440 : fermBrut;
  const dernierCreneau = fermMin - 60;
  if (dernierCreneau < ouvMin) return [];

  const { dateStr: aujStr, minutesJour } = obtenirMaintenantDansFuseau(fuseau, maintenant);
  const estAujourdHui = dateStr === aujStr;

  const creneaux: string[] = [];
  for (let m = ouvMin; m <= dernierCreneau; m += 30) {
    if (estAujourdHui && m < minutesJour + 15) {
      continue;
    }
    creneaux.push(minuteVersHHMM(m));
  }
  return creneaux;
}

export function verifierCreneauValide(
  dateStr: string,
  heureStr: string,
  horaires: HoraireJour[],
  fuseau: string,
  maintenant: Date = new Date(),
): boolean {
  const creneaux = genererCreneauxReservation(dateStr, horaires, fuseau, maintenant);
  return creneaux.includes(heureStr);
}

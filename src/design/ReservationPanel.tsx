import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Phone } from 'lucide-react';
import { CONFIRME } from '../data/confirmations';
import { restaurantData } from '../data/restaurantData';
import { TEXTES_SITE, type Langue } from '../data/textesSite';
import {
  bornesDatesReservation,
  genererCreneauxReservation,
  verifierCreneauValide,
} from '../engine/horaires';
import {
  MAX_LEN_NOM,
  MAX_LEN_REMARQUE,
  MAX_LEN_TEL,
  nettoyerTexte,
  validerNom,
  validerTelephone,
} from '../engine/sanitize';
import {
  construireMessageReservation,
  construireUrlWhatsapp,
  getWhatsappNumber,
  ouvrirWhatsapp,
} from '../engine/whatsapp';
import { BoutonMagnetique } from './BoutonMagnetique';

const RAYONS_SUCCES = [
  { x1: 22, y1: 4, x2: 22, y2: 8 },
  { x1: 22, y1: 36, x2: 22, y2: 40 },
  { x1: 4, y1: 22, x2: 8, y2: 22 },
  { x1: 36, y1: 22, x2: 40, y2: 22 },
  { x1: 9, y1: 9, x2: 12, y2: 12 },
  { x1: 32, y1: 32, x2: 35, y2: 35 },
  { x1: 35, y1: 9, x2: 32, y2: 12 },
  { x1: 12, y1: 32, x2: 9, y2: 35 },
];

export function ReservationPanel({ langue }: { langue: Langue }) {
  const t = TEXTES_SITE[langue].reservation;
  const { minDate, maxDate } = useMemo(
    () => bornesDatesReservation(restaurantData.lieux.fuseau),
    [],
  );

  const [date, setDate] = useState(minDate);
  const [heure, setHeure] = useState(CONFIRME.horaires ? '' : '19:00');
  const [personnes, setPersonnes] = useState(2);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [remarque, setRemarque] = useState('');
  const [erreur, setErreur] = useState('');
  const [messagePret, setMessagePret] = useState<string | null>(null);
  const [copieOk, setCopieOk] = useState(false);

  const creneaux = useMemo(
    () =>
      CONFIRME.horaires
        ? genererCreneauxReservation(
            date,
            restaurantData.lieux.horaires,
            restaurantData.lieux.fuseau,
          )
        : [],
    [date],
  );

  useEffect(() => {
    if (!CONFIRME.horaires) return;
    if (creneaux.length > 0 && !creneaux.includes(heure)) {
      setHeure(creneaux[0]);
    } else if (creneaux.length === 0) {
      setHeure('');
    }
  }, [creneaux, heure]);

  const numeroWhatsapp = getWhatsappNumber();
  const telLien = `tel:${restaurantData.lieux.telephone.replace(/\s+/g, '')}`;
  const auDelaDe12 = personnes > 12;

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setCopieOk(false);

    if (auDelaDe12) {
      setErreur(t.plusDe12);
      return;
    }

    if (CONFIRME.horaires) {
      if (
        !verifierCreneauValide(
          date,
          heure,
          restaurantData.lieux.horaires,
          restaurantData.lieux.fuseau,
        )
      ) {
        setErreur(t.aucunCreneau);
        return;
      }
    } else {
      if (date < minDate || date > maxDate) {
        setErreur(t.aucunCreneau);
        return;
      }
      if (!/^\d{2}:\d{2}$/.test(heure)) {
        setErreur(t.heureInvalide);
        return;
      }
    }

    const vNom = validerNom(nom);
    if (!vNom.valide) {
      setErreur(vNom.erreur ?? 'Nom invalide.');
      return;
    }

    const vTel = validerTelephone(telephone);
    if (!vTel.valide) {
      setErreur(vTel.erreur ?? 'Téléphone invalide.');
      return;
    }

    const msg = construireMessageReservation({
      nomRestaurant: restaurantData.restaurant.nom,
      date,
      heure,
      personnes,
      nomClient: vNom.valeur,
      telephoneClient: vTel.normalise,
      remarque: nettoyerTexte(remarque, MAX_LEN_REMARQUE),
    });
    setMessagePret(msg);
  };

  const copier = async () => {
    if (!messagePret || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(messagePret);
      setCopieOk(true);
    } catch {
      setCopieOk(false);
    }
  };

  const whatsappState = messagePret
    ? construireUrlWhatsapp(numeroWhatsapp, messagePret)
    : null;

  return (
    <div className="bg-surface border border-bronze p-5 sm:p-7 space-y-5">
      <div className="space-y-1.5 border-b border-bronze pb-4">
        <h3 className="font-display text-lg uppercase tracking-[0.14em] text-ivoire">
          {t.titre}
        </h3>
        <p className="font-editorial italic text-lg text-ivoire-doux">{t.sousTitre}</p>
      </div>

      <form onSubmit={soumettre} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="res-date"
              className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
            >
              {t.date}
            </label>
            <div className="champ-ligne-or">
              <input
                id="res-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setMessagePret(null);
                }}
                required
                className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="res-heure"
              className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
            >
              {t.heure}
            </label>
            <div className="champ-ligne-or">
              {CONFIRME.horaires ? (
                <select
                  id="res-heure"
                  value={heure}
                  onChange={(e) => {
                    setHeure(e.target.value);
                    setMessagePret(null);
                  }}
                  disabled={creneaux.length === 0}
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire tabular-nums"
                >
                  {creneaux.length === 0 ? (
                    <option value="">-</option>
                  ) : (
                    creneaux.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <input
                  id="res-heure"
                  type="time"
                  required
                  value={heure}
                  onChange={(e) => {
                    setHeure(e.target.value);
                    setMessagePret(null);
                  }}
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire tabular-nums"
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="res-personnes"
              className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
            >
              {t.personnes}
            </label>
            <div className="champ-ligne-or">
              <input
                id="res-personnes"
                type="number"
                min={1}
                max={30}
                value={personnes}
                onChange={(e) => {
                  setPersonnes(Math.max(1, Number(e.target.value) || 1));
                  setMessagePret(null);
                }}
                required
                className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire tabular-nums"
              />
            </div>
          </div>
        </div>

        {!CONFIRME.horaires && (
          <p className="font-editorial italic text-base text-ivoire-doux">
            {t.heureLibreLabel}
          </p>
        )}

        {CONFIRME.horaires && creneaux.length === 0 && (
          <p className="font-editorial italic text-base text-or">{t.aucunCreneau}</p>
        )}

        {auDelaDe12 ? (
          <div className="bg-nuit border border-bronze p-4 space-y-3">
            <p className="font-editorial italic text-base text-ivoire">{t.plusDe12}</p>
            <a
              href={telLien}
              className="focus-marque bg-or text-nuit px-4 py-2.5 text-xs uppercase tracking-[0.14em] font-medium inline-flex items-center gap-2 min-h-[44px]"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>
                {t.appeler} {restaurantData.lieux.telephone}
              </span>
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="res-nom"
                  className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
                >
                  {t.nom}
                </label>
                <div className="champ-ligne-or">
                  <input
                    id="res-nom"
                    type="text"
                    required
                    maxLength={MAX_LEN_NOM}
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      setMessagePret(null);
                    }}
                    className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="res-tel"
                  className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
                >
                  {t.telephone}
                </label>
                <div className="champ-ligne-or">
                  <input
                    id="res-tel"
                    type="tel"
                    required
                    maxLength={MAX_LEN_TEL}
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(e.target.value);
                      setMessagePret(null);
                    }}
                    placeholder="+237 6..."
                    className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire placeholder:text-ivoire-doux"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="res-remarque"
                className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
              >
                {t.remarque}
              </label>
              <div className="champ-ligne-or">
                <input
                  id="res-remarque"
                  type="text"
                  maxLength={MAX_LEN_REMARQUE}
                  value={remarque}
                  onChange={(e) => {
                    setRemarque(e.target.value);
                    setMessagePret(null);
                  }}
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire"
                />
              </div>
            </div>

            {erreur && (
              <p
                role="alert"
                className="message-erreur-anim text-xs text-or font-display uppercase tracking-[0.1em]"
              >
                {erreur}
              </p>
            )}

            <BoutonMagnetique
              type="submit"
              disabled={CONFIRME.horaires && creneaux.length === 0}
              className="focus-marque bg-or text-nuit px-5 py-3 text-xs uppercase tracking-[0.14em] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {t.preparer}
            </BoutonMagnetique>
          </>
        )}
      </form>

      {messagePret && (
        <div className="bg-nuit border border-bronze p-4 space-y-3">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 44 44"
              className="w-8 h-8 shrink-0 coche-succes-anime"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="22" cy="22" r="14" stroke="#96650B" strokeWidth="1" />
              <path
                d="M15 22.5 L20 27 L29.5 16.5"
                stroke="#CA8C3A"
                strokeWidth="2"
                strokeLinecap="square"
                className="coche-succes-trait"
              />
              {RAYONS_SUCCES.map((r, i) => (
                <line
                  key={i}
                  x1={r.x1}
                  y1={r.y1}
                  x2={r.x2}
                  y2={r.y2}
                  stroke="#CA8C3A"
                  strokeWidth="1.2"
                  className="rayon-succes"
                />
              ))}
            </svg>
            <p className="font-display text-xs uppercase tracking-[0.14em] text-or">
              {t.messagePret}
            </p>
          </div>
          <pre className="whitespace-pre-wrap font-display text-xs text-ivoire bg-surface border border-bronze p-3">
            {messagePret}
          </pre>
          {whatsappState?.desactive && (
            <p className="text-xs text-ivoire-doux">{t.whatsappDesactive}</p>
          )}
          {whatsappState?.tropLong && <p className="text-xs text-or">{t.tropLong}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={copier}
              className="focus-marque border border-bronze bg-surface hover:border-or text-ivoire px-3 py-2.5 text-xs uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              {copieOk ? (
                <Check className="w-3.5 h-3.5 text-or" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-or" aria-hidden="true" />
              )}
              <span>{copieOk ? t.copieFait : t.copier}</span>
            </button>
            <button
              type="button"
              disabled={!whatsappState?.url}
              onClick={() => whatsappState?.url && ouvrirWhatsapp(whatsappState.url)}
              className={`focus-marque px-3 py-2.5 text-xs uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 min-h-[44px] ${
                whatsappState?.url
                  ? 'bg-or text-nuit font-medium cursor-pointer'
                  : 'border border-bronze bg-surface text-ivoire-doux opacity-60 cursor-not-allowed'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.ouvrirWhatsapp}</span>
            </button>
            <a
              href={telLien}
              className="focus-marque border border-bronze bg-surface hover:border-or text-ivoire px-3 py-2.5 text-xs uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5 text-or" aria-hidden="true" />
              <span>{t.appeler}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

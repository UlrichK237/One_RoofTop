import { useState } from 'react';
import { Check, Copy, ExternalLink, Minus, Phone, Plus, Trash2 } from 'lucide-react';
import { CONFIRME } from '../data/confirmations';
import { restaurantData } from '../data/restaurantData';
import { TEXTES_SITE, type Langue } from '../data/textesSite';
import {
  type LignePanierHydratee,
  cleLignePanier,
  formaterPrixFCFA,
  totalMontantPanier,
} from '../engine/panier';
import { obtenirPhotoPlat } from '../engine/photos';
import {
  MAX_LEN_ADRESSE,
  MAX_LEN_NOM,
  MAX_LEN_REMARQUE,
  MAX_LEN_TEL,
  nettoyerTexte,
  validerNom,
  validerTelephone,
} from '../engine/sanitize';
import {
  type ModeRetrait,
  construireMessageCommande,
  construireUrlWhatsapp,
  getWhatsappNumber,
  ouvrirWhatsapp,
} from '../engine/whatsapp';
import { ModalFrame } from './ModalFrame';

export function PanierDrawer({
  ouvert,
  lignes,
  langue,
  onFermer,
  onModifierQuantite,
  onSupprimerLigne,
  onViderPanier,
}: {
  ouvert: boolean;
  lignes: LignePanierHydratee[];
  langue: Langue;
  onFermer: () => void;
  onModifierQuantite: (cle: string, delta: number) => void;
  onSupprimerLigne: (cle: string) => void;
  onViderPanier: () => void;
}) {
  const t = TEXTES_SITE[langue].panier;
  const tr = TEXTES_SITE[langue].reservation;
  const [mode, setMode] = useState<ModeRetrait>(
    CONFIRME.venteAEmporter ? 'emporter' : 'livraison',
  );
  const [nomClient, setNomClient] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [remarqueGenerale, setRemarqueGenerale] = useState('');
  const [erreur, setErreur] = useState('');
  const [messagePret, setMessagePret] = useState<string | null>(null);
  const [copieOk, setCopieOk] = useState(false);

  const total = totalMontantPanier(lignes);
  const numeroWhatsapp = getWhatsappNumber();
  const telLien = `tel:${restaurantData.lieux.telephone.replace(/\s+/g, '')}`;

  const preparerCommande = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setCopieOk(false);

    if (lignes.length === 0) return;

    const vNom = validerNom(nomClient);
    if (!vNom.valide) {
      setErreur(vNom.erreur ?? 'Nom invalide.');
      return;
    }

    const vTel = validerTelephone(telephone);
    if (!vTel.valide) {
      setErreur(vTel.erreur ?? 'Téléphone invalide.');
      return;
    }

    const adressePropre = nettoyerTexte(adresse, MAX_LEN_ADRESSE);
    if (mode === 'livraison' && adressePropre.length < 5) {
      setErreur('Veuillez préciser votre adresse à Douala pour la livraison.');
      return;
    }

    const msg = construireMessageCommande({
      nomRestaurant: restaurantData.restaurant.nom,
      mode,
      nomClient: vNom.valeur,
      telephoneClient: vTel.normalise,
      adresseLivraison: mode === 'livraison' ? adressePropre : undefined,
      remarqueGenerale: nettoyerTexte(remarqueGenerale, MAX_LEN_REMARQUE),
      lignes,
    });
    setMessagePret(msg);
  };

  const copierMessage = async () => {
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
    <ModalFrame
      ouvert={ouvert}
      onFermer={onFermer}
      titreId="drawer-panier-titre"
      titre={t.titre}
      variante="tiroir"
      labelFermer={TEXTES_SITE[langue].carte.fermer}
    >
      {lignes.length === 0 ? (
        <div className="py-10 text-center space-y-4">
          <p className="font-editorial italic text-lg text-ivoire-doux">{t.vide}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-bronze border-t border-b border-bronze">
            {lignes.map((ligne) => {
              const cle = cleLignePanier(ligne.id, ligne.options, ligne.remarque);
              const photo = obtenirPhotoPlat(ligne.categorie, ligne.nom);

              return (
                <li key={cle} className="py-3.5 flex items-start gap-3">
                  <div className="w-14 h-14 shrink-0 border border-bronze bg-nuit flex items-center justify-center overflow-hidden">
                    {photo ? (
                      <img
                        src={photo.src}
                        alt={ligne.nom}
                        width={56}
                        height={56}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="font-display text-xs tracking-[0.1em] text-or"
                      >
                        1
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-display text-xs uppercase tracking-[0.12em] text-ivoire">
                      {ligne.nom}
                    </p>
                    {ligne.options.length > 0 && (
                      <p className="text-xs text-or">{ligne.options.join(', ')}</p>
                    )}
                    {ligne.remarque && (
                      <p className="font-editorial italic text-sm text-ivoire-doux">
                        {ligne.remarque}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center border border-bronze bg-nuit">
                        <button
                          type="button"
                          onClick={() => {
                            setMessagePret(null);
                            onModifierQuantite(cle, -1);
                          }}
                          aria-label={`Diminuer ${ligne.nom}`}
                          className="focus-marque p-1.5 text-ivoire hover:text-or cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="px-2.5 text-xs tabular-nums">{ligne.quantite}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setMessagePret(null);
                            onModifierQuantite(cle, 1);
                          }}
                          aria-label={`Augmenter ${ligne.nom}`}
                          className="focus-marque p-1.5 text-ivoire hover:text-or cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-display text-xs tabular-nums text-ivoire">
                        {formaterPrixFCFA(ligne.sousTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMessagePret(null);
                      onSupprimerLigne(cle);
                    }}
                    aria-label={`${t.retirer} ${ligne.nom}`}
                    className="focus-marque p-1.5 text-ivoire-doux hover:text-or cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between border-b border-bronze pb-4">
            <span className="font-display text-xs uppercase tracking-[0.14em] text-ivoire-doux">
              {t.totalPlats}
            </span>
            <span className="font-display text-lg text-or tabular-nums">
              {formaterPrixFCFA(total)}
            </span>
          </div>

          <form onSubmit={preparerCommande} className="space-y-4">
            <div className="space-y-2">
              <p className="font-display text-xs uppercase tracking-[0.14em] text-ivoire">
                {t.modeRetrait}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CONFIRME.venteAEmporter && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('emporter');
                      setMessagePret(null);
                    }}
                    aria-pressed={mode === 'emporter'}
                    className={`focus-marque py-2.5 px-3 border text-xs uppercase tracking-[0.12em] cursor-pointer min-h-[44px] ${
                      mode === 'emporter'
                        ? 'bg-or text-nuit border-or font-medium'
                        : 'bg-nuit border-bronze text-ivoire'
                    }`}
                  >
                    {t.emporter}
                  </button>
                )}
                {CONFIRME.livraison && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('livraison');
                      setMessagePret(null);
                    }}
                    aria-pressed={mode === 'livraison'}
                    className={`focus-marque py-2.5 px-3 border text-xs uppercase tracking-[0.12em] cursor-pointer min-h-[44px] ${
                      mode === 'livraison'
                        ? 'bg-or text-nuit border-or font-medium'
                        : 'bg-nuit border-bronze text-ivoire'
                    }`}
                  >
                    {t.livraison}
                  </button>
                )}
              </div>
              {CONFIRME.livraison && mode === 'livraison' && (
                <p className="font-editorial italic text-base text-ivoire-doux pt-1">
                  {t.infoLivraison}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="panier-nom"
                  className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
                >
                  {t.nomLabel}
                </label>
                <input
                  id="panier-nom"
                  type="text"
                  required
                  maxLength={MAX_LEN_NOM}
                  value={nomClient}
                  onChange={(e) => {
                    setNomClient(e.target.value);
                    setMessagePret(null);
                  }}
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2 text-sm text-ivoire"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="panier-tel"
                  className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
                >
                  {t.telLabel}
                </label>
                <input
                  id="panier-tel"
                  type="tel"
                  required
                  maxLength={MAX_LEN_TEL}
                  value={telephone}
                  onChange={(e) => {
                    setTelephone(e.target.value);
                    setMessagePret(null);
                  }}
                  placeholder="+237 6..."
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-doux"
                />
              </div>
            </div>

            {mode === 'livraison' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="panier-adresse"
                  className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
                >
                  {t.adresseLabel}
                </label>
                <input
                  id="panier-adresse"
                  type="text"
                  required
                  maxLength={MAX_LEN_ADRESSE}
                  value={adresse}
                  onChange={(e) => {
                    setAdresse(e.target.value);
                    setMessagePret(null);
                  }}
                  placeholder={t.adressePlaceholder}
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2 text-sm text-ivoire placeholder:text-ivoire-doux"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="panier-remarque"
                className="block font-display text-xs uppercase tracking-[0.12em] text-ivoire"
              >
                {t.remarqueLabel}
              </label>
              <input
                id="panier-remarque"
                type="text"
                maxLength={MAX_LEN_REMARQUE}
                value={remarqueGenerale}
                onChange={(e) => {
                  setRemarqueGenerale(e.target.value);
                  setMessagePret(null);
                }}
                className="focus-marque w-full bg-nuit border border-bronze px-3 py-2 text-sm text-ivoire"
              />
            </div>

            {erreur && (
              <p role="alert" className="text-xs text-or font-display uppercase tracking-[0.1em]">
                {erreur}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                className="focus-marque bg-or text-nuit px-5 py-3 text-xs uppercase tracking-[0.14em] font-medium cursor-pointer flex-1 min-h-[44px]"
              >
                {t.preparerCommande}
              </button>
              <button
                type="button"
                onClick={onViderPanier}
                className="focus-marque border border-bronze text-ivoire-doux hover:text-ivoire px-3.5 py-3 text-xs uppercase tracking-[0.12em] cursor-pointer min-h-[44px]"
              >
                {t.vider}
              </button>
            </div>
          </form>

          {/* Résultat prêt + 3 secours toujours visibles */}
          {messagePret && (
            <div className="bg-nuit border border-bronze p-4 space-y-3">
              <p className="font-display text-xs uppercase tracking-[0.14em] text-or">
                {t.commandePrete}
              </p>
              <p className="font-editorial italic text-base text-ivoire-doux">
                {t.mentionValidation}
              </p>
              <pre className="whitespace-pre-wrap font-display text-xs text-ivoire bg-surface border border-bronze p-3 max-h-44 overflow-y-auto">
                {messagePret}
              </pre>
              {whatsappState?.desactive && (
                <p className="text-xs text-ivoire-doux">{tr.whatsappDesactive}</p>
              )}
              {whatsappState?.tropLong && (
                <p className="text-xs text-or">{tr.tropLong}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={copierMessage}
                  className="focus-marque border border-bronze bg-surface hover:border-or text-ivoire px-3 py-2.5 text-xs uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  {copieOk ? (
                    <Check className="w-3.5 h-3.5 text-or" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-or" aria-hidden="true" />
                  )}
                  <span>{copieOk ? tr.copieFait : tr.copier}</span>
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
                  <span>{tr.ouvrirWhatsapp}</span>
                </button>
                <a
                  href={telLien}
                  className="focus-marque border border-bronze bg-surface hover:border-or text-ivoire px-3 py-2.5 text-xs uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5 text-or" aria-hidden="true" />
                  <span>{tr.appeler}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </ModalFrame>
  );
}

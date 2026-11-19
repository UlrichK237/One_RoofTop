import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AFFICHER_PANIER } from '../data/confirmations';
import type { Plat } from '../data/restaurantData';
import { TEXTES_SITE, type Langue } from '../data/textesSite';
import {
  MAX_QTE_PAR_LIGNE,
  calculerPrixUnitaire,
  determinerModeOptions,
  formaterPrixFCFA,
} from '../engine/panier';
import { obtenirPhotoPlat } from '../engine/photos';
import { MAX_LEN_REMARQUE, nettoyerTexte } from '../engine/sanitize';
import { CadrePhotoLieu } from './AmbiancesEtage';
import { ModalFrame } from './ModalFrame';

export function PlatModal({
  entree,
  langue,
  onFermer,
  onConfirmerAjout,
}: {
  entree: { categorie: string; plat: Plat } | null;
  langue: Langue;
  onFermer: () => void;
  onConfirmerAjout: (
    categorie: string,
    plat: Plat,
    quantite: number,
    options: string[],
    remarque: string,
  ) => void;
}) {
  const t = TEXTES_SITE[langue].carte;
  const [quantite, setQuantite] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const [remarque, setRemarque] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!entree) return;
    setQuantite(1);
    setRemarque('');
    setErreur('');
    const mode = determinerModeOptions(entree.plat);
    if (mode === 'obligatoire_unique' && entree.plat.options && entree.plat.options.length > 0) {
      setOptions([entree.plat.options[0]]);
    } else {
      setOptions([]);
    }
  }, [entree]);

  if (!entree) return null;

  const { categorie, plat } = entree;
  const mode = determinerModeOptions(plat);
  const photo = obtenirPhotoPlat(categorie, plat.nom);
  const prixUnitaire = calculerPrixUnitaire(plat, options);
  const total = prixUnitaire * quantite;

  const toggleOptionMultiple = (opt: string) => {
    setOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    );
  };

  const validerAjout = () => {
    const remarquePropre = nettoyerTexte(remarque, MAX_LEN_REMARQUE);
    if (mode === 'obligatoire_unique' && options.length !== 1) {
      setErreur(t.optionRequise);
      return;
    }
    if (mode === 'remarque_obligatoire' && !remarquePropre) {
      setErreur(t.remarqueRequise);
      return;
    }
    onConfirmerAjout(categorie, plat, quantite, options, remarquePropre);
    onFermer();
  };

  return (
    <ModalFrame
      ouvert={true}
      onFermer={onFermer}
      titreId="modal-plat-titre"
      titre={plat.nom}
      labelFermer={t.fermer}
    >
      <div className="space-y-5">
        {photo ? (
          <div className="border border-bronze bg-nuit overflow-hidden space-y-2">
            <img
              src={photo.src}
              alt={photo.alt ?? plat.nom}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover"
            />
            {(photo.approchante || photo.auteur) && (
              <div className="px-3 pb-2 text-xs text-ivoire-doux space-y-1">
                {photo.approchante && <p>{t.photoApprochante}</p>}
                {photo.auteur && (
                  <p>
                    {photo.auteur}
                    {photo.licence ? ` · ${photo.licence}` : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <CadrePhotoLieu
            emplacement={`plat-${categorie}`}
            sceneRepli="cuisine"
            titre={t.photoAttenteTitre}
            sousTitre={t.photoAttenteDesc}
          />
        )}

        {/* Description et tarif */}
        <div className="space-y-2 border-b border-bronze pb-4">
          {plat.description && (
            <p className="font-editorial italic text-lg text-ivoire-doux leading-relaxed">
              {plat.description}
            </p>
          )}
          {plat.note && (
            <p className="font-display text-xs uppercase tracking-[0.14em] text-ivoire-doux">
              {plat.note}
            </p>
          )}
          <p className="font-display text-lg text-or tabular-nums">
            {formaterPrixFCFA(prixUnitaire)}
          </p>
        </div>

        {/* Sélection des options */}
        {plat.options && plat.options.length > 0 && (
          <div className="space-y-2.5">
            <p className="font-display text-xs uppercase tracking-[0.14em] text-ivoire">
              {mode === 'obligatoire_unique' ? t.optionRequise : t.optionsFacultatives}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plat.options.map((opt) => {
                const selectionne = options.includes(opt);
                const prixOpt = plat.prixOptions?.[opt];
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setErreur('');
                      if (mode === 'obligatoire_unique') {
                        setOptions([opt]);
                      } else {
                        toggleOptionMultiple(opt);
                      }
                    }}
                    aria-pressed={selectionne}
                    className={`focus-marque px-3.5 py-2.5 border text-left text-xs uppercase tracking-[0.12em] flex items-center justify-between gap-2 cursor-pointer min-h-[44px] ${
                      selectionne
                        ? 'bg-or text-nuit border-or font-medium'
                        : 'bg-nuit border-bronze text-ivoire hover:border-or'
                    }`}
                  >
                    <span>{opt}</span>
                    {typeof prixOpt === 'number' && (
                      <span className="tabular-nums">{formaterPrixFCFA(prixOpt)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {AFFICHER_PANIER && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="plat-remarque"
                className="block font-display text-xs uppercase tracking-[0.14em] text-ivoire"
              >
                {mode === 'remarque_obligatoire' ? `${t.remarqueLabel} *` : t.remarqueLabel}
              </label>
              <div className="champ-ligne-or">
                <input
                  id="plat-remarque"
                  type="text"
                  maxLength={MAX_LEN_REMARQUE}
                  value={remarque}
                  onChange={(e) => {
                    setErreur('');
                    setRemarque(e.target.value);
                  }}
                  placeholder={t.remarquePlaceholder}
                  className="focus-marque w-full bg-nuit border border-bronze px-3 py-2.5 text-sm text-ivoire placeholder:text-ivoire-doux"
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

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-bronze">
              <div className="flex items-center border border-bronze bg-nuit">
                <button
                  type="button"
                  onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer"
                  className="focus-marque p-2.5 text-ivoire hover:text-or cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span
                  className="px-4 font-display text-sm tabular-nums text-ivoire"
                  aria-label={t.quantite}
                >
                  {quantite}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantite((q) => Math.min(MAX_QTE_PAR_LIGNE, q + 1))}
                  aria-label="Augmenter"
                  className="focus-marque p-2.5 text-ivoire hover:text-or cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={validerAjout}
                className="focus-marque cta-magnetique bg-or text-nuit px-5 py-3 text-xs uppercase tracking-[0.14em] font-medium cursor-pointer flex-1 sm:flex-initial tabular-nums min-h-[44px]"
              >
                {t.ajouter} · {formaterPrixFCFA(total)}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalFrame>
  );
}

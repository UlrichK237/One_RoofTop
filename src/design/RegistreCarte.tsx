import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, Plus, Printer, Search, SlidersHorizontal, X } from 'lucide-react';
import { AFFICHER_PANIER, CONFIRME } from '../data/confirmations';
import type { CategorieMenu, Plat } from '../data/restaurantData';
import { TEXTES_SITE, type Langue } from '../data/textesSite';
import { determinerModeOptions, formaterPrixFCFA } from '../engine/panier';
import { normaliserRecherche } from '../engine/sanitize';
import { SceneDessinee } from './AmbiancesEtage';
import { animerPointVersPanier } from './motion/flyToCart';
import { useReveal } from './motion/useReveal';
import { useSectionProgress } from './motion/useSectionProgress';

export function RegistreCarte({
  univers,
  numeroEtage,
  etageCode,
  etageTitre,
  etageSousTitre,
  categories,
  langue,
  afficherBarreOutils = false,
  onChangerLangue,
  onOuvrirPlat,
  onAjoutRapide,
}: {
  univers: 'cocktails' | 'cuisine' | 'cave';
  numeroEtage: string;
  etageCode: string;
  etageTitre: string;
  etageSousTitre: string;
  categories: CategorieMenu[];
  langue: Langue;
  afficherBarreOutils?: boolean;
  onChangerLangue?: (l: Langue) => void;
  onOuvrirPlat: (categorie: string, plat: Plat) => void;
  onAjoutRapide: (categorie: string, plat: Plat, options?: string[]) => void;
}) {
  const t = TEXTES_SITE[langue].carte;
  const [categorieActive, setCategorieActive] = useState<string>(
    categories[0]?.categorie ?? '',
  );
  const [recherche, setRecherche] = useState('');
  const [filtreNote, setFiltreNote] = useState<'tous' | 'V' | 'LC'>('tous');
  const [rechercheOuverte, setRechercheOuverte] = useState(true);
  const [impulsionBar, setImpulsionBar] = useState(0);
  const [ajoutConfirmeId, setAjoutConfirmeId] = useState<string | null>(null);

  const { ref: enteteRef, visible: enteteVisible } = useReveal(false);
  const sectionProgRef = useSectionProgress<HTMLDivElement>('--section-progress');
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const indicateurRef = useRef<HTMLSpanElement | null>(null);

  const reqNorm = normaliserRecherche(recherche);
  const estRechercheActive = reqNorm.length > 0 || filtreNote !== 'tous';

  const positionnerIndicateur = useCallback(() => {
    const list = tablistRef.current;
    const ind = indicateurRef.current;
    if (!list || !ind) return;
    const actif = list.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!actif) {
      ind.style.setProperty('--tab-sx', '0');
      return;
    }
    const rList = list.getBoundingClientRect();
    const rTab = actif.getBoundingClientRect();
    const x = rTab.left - rList.left;
    const y = rTab.bottom - rList.top - 2;
    const sx = rList.width > 0 ? rTab.width / rList.width : 0;
    ind.style.setProperty('--tab-x', `${x.toFixed(1)}px`);
    ind.style.setProperty('--tab-y', `${y.toFixed(1)}px`);
    ind.style.setProperty('--tab-sx', sx.toFixed(4));
  }, []);

  useLayoutEffect(() => {
    positionnerIndicateur();
  }, [categorieActive, langue, estRechercheActive, positionnerIndicateur]);

  useEffect(() => {
    window.addEventListener('resize', positionnerIndicateur, { passive: true });
    return () => window.removeEventListener('resize', positionnerIndicateur);
  }, [positionnerIndicateur]);

  const changerOnglet = (nouvelleCat: string) => {
    if (nouvelleCat === categorieActive) return;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (
      typeof doc.startViewTransition === 'function' &&
      document.documentElement.dataset.motion === 'full'
    ) {
      doc.startViewTransition(() => setCategorieActive(nouvelleCat));
    } else {
      setCategorieActive(nouvelleCat);
    }
  };

  const declencherAjoutVisuel = (
    cleBouton: string,
    boutonEl: HTMLElement | null,
    categorie: string,
    plat: Plat,
    options: string[] = [],
  ) => {
    onAjoutRapide(categorie, plat, options);
    animerPointVersPanier(boutonEl);
    setAjoutConfirmeId(cleBouton);
    window.setTimeout(() => {
      setAjoutConfirmeId((cur) => (cur === cleBouton ? null : cur));
    }, 750);
  };

  const categoriesAffichees = useMemo(() => {
    const base = estRechercheActive
      ? categories
      : categories.filter((c) => c.categorie === categorieActive);

    return base
      .map((cat) => {
        const platsFiltres = cat.plats.filter((plat) => {
          if (filtreNote !== 'tous' && plat.note !== filtreNote) {
            return false;
          }
          if (!reqNorm) return true;
          const cible = normaliserRecherche(
            `${plat.nom} ${plat.description} ${plat.sousSection ?? ''} ${cat.libelle_fr} ${cat.libelle_en}`,
          );
          return cible.includes(reqNorm);
        });
        return { ...cat, plats: platsFiltres };
      })
      .filter((cat) => cat.plats.length > 0);
  }, [categories, categorieActive, estRechercheActive, filtreNote, reqNorm]);

  const aColonneVerreBouteille = (plats: Plat[]) =>
    plats.some((p) => typeof p.prixBouteille === 'number');

  const grouperSousSections = (plats: Plat[]) => {
    const groupes: { titre: string | null; plats: Plat[] }[] = [];
    for (const plat of plats) {
      const titre = plat.sousSection ?? null;
      const dernier = groupes[groupes.length - 1];
      if (!dernier || dernier.titre !== titre) {
        groupes.push({ titre, plats: [plat] });
      } else {
        dernier.plats.push(plat);
      }
    }
    return groupes;
  };

  const sceneType = univers === 'cocktails' ? 'bar' : univers;

  return (
    <div ref={sectionProgRef} className="space-y-6">
      <div
        ref={enteteRef}
        className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-bronze pb-5 ${
          enteteVisible ? 'est-visible' : ''
        }`}
      >
        <div className="flex items-start gap-4 sm:gap-6">
          <span
            aria-hidden="true"
            className="chiffre-etage-deco font-display text-4xl sm:text-6xl font-semibold tabular-nums shrink-0"
          >
            {numeroEtage}
            <span className="chiffre-etage-remplissage">{numeroEtage}</span>
          </span>
          <div className="space-y-1.5">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-or tabular-nums">
              {etageCode}
            </p>
            <div className="titre-etage-masque">
              <h2 className="titre-etage-anim font-display text-2xl sm:text-3xl uppercase text-ivoire">
                {etageTitre}
              </h2>
            </div>
            <p className="sous-titre-etage-anim font-editorial italic text-lg sm:text-xl text-ivoire-doux">
              {etageSousTitre}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {afficherBarreOutils && onChangerLangue && (
            <div
              className="flex border border-bronze"
              role="group"
              aria-label="Langue de la carte"
            >
              <button
                type="button"
                onClick={() => onChangerLangue('fr')}
                className={`focus-marque px-3 py-2 text-xs uppercase tracking-[0.14em] cursor-pointer min-h-[40px] ${
                  langue === 'fr'
                    ? 'bg-or text-nuit font-medium'
                    : 'bg-surface text-ivoire-doux hover:text-ivoire'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => onChangerLangue('en')}
                className={`focus-marque px-3 py-2 text-xs uppercase tracking-[0.14em] cursor-pointer min-h-[40px] ${
                  langue === 'en'
                    ? 'bg-or text-nuit font-medium'
                    : 'bg-surface text-ivoire-doux hover:text-ivoire'
                }`}
              >
                EN
              </button>
            </div>
          )}
          {afficherBarreOutils && (
            <button
              type="button"
              onClick={() => window.print()}
              className="focus-marque border border-bronze bg-surface hover:bg-surface-alt text-ivoire px-3.5 py-2 text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 cursor-pointer min-h-[40px]"
            >
              <Printer className="w-4 h-4 text-or" aria-hidden="true" />
              <span>{t.imprimer}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setRechercheOuverte((v) => !v)}
            aria-expanded={rechercheOuverte}
            aria-label={langue === 'fr' ? 'Rechercher et filtrer' : 'Search and filter'}
            className="focus-marque border border-bronze bg-surface hover:bg-surface-alt text-ivoire-doux hover:text-ivoire px-3 py-2 text-xs uppercase tracking-[0.12em] inline-flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-or" aria-hidden="true" />
            <span className="hidden sm:inline">
              {langue === 'fr' ? 'Filtres' : 'Search'}
            </span>
          </button>
        </div>
      </div>

      {/* Scène dessinée de l'étage (hors texte, mise en pause hors écran) */}
      <div className="border border-bronze bg-surface/60 px-3 py-2 no-print">
        <SceneDessinee scene={sceneType} impulsion={impulsionBar} />
      </div>

      {/* Outils de recherche et filtres (pliables par grid-template-rows) */}
      <div
        className={`recherche-tiroir-grid no-print ${rechercheOuverte ? '' : 'est-replie'}`}
      >
        <div className="recherche-tiroir-contenu">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
            <div className="champ-ligne-or relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 text-ivoire-doux absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder={t.recherchePlaceholder}
                aria-label={t.recherchePlaceholder}
                className="focus-marque w-full bg-surface border border-bronze pl-9 pr-9 py-2.5 text-sm text-ivoire placeholder:text-ivoire-doux"
              />
              {recherche && (
                <button
                  type="button"
                  onClick={() => setRecherche('')}
                  aria-label={t.effacerRecherche}
                  className="focus-marque absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ivoire-doux hover:text-ivoire cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {univers === 'cuisine' && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtres">
                <button
                  type="button"
                  onClick={() => setFiltreNote('tous')}
                  className={`focus-marque px-3 py-2 text-xs uppercase tracking-[0.12em] border cursor-pointer min-h-[40px] ${
                    filtreNote === 'tous'
                      ? 'bg-or text-nuit border-or font-medium'
                      : 'bg-surface border-bronze text-ivoire-doux hover:text-ivoire'
                  }`}
                >
                  {t.tousFiltres}
                </button>
                {CONFIRME.optionsVegetariennes && (
                  <button
                    type="button"
                    onClick={() => setFiltreNote('V')}
                    className={`focus-marque px-3 py-2 text-xs uppercase tracking-[0.12em] border cursor-pointer min-h-[40px] ${
                      filtreNote === 'V'
                        ? 'bg-or text-nuit border-or font-medium'
                        : 'bg-surface border-bronze text-ivoire-doux hover:text-ivoire'
                    }`}
                  >
                    {t.filtreV}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFiltreNote('LC')}
                  className={`focus-marque px-3 py-2 text-xs uppercase tracking-[0.12em] border cursor-pointer min-h-[40px] ${
                    filtreNote === 'LC'
                      ? 'bg-or text-nuit border-or font-medium'
                      : 'bg-surface border-bronze text-ivoire-doux hover:text-ivoire'
                  }`}
                >
                  {t.filtreLC}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets de catégories avec filet d'or glissant */}
      {!estRechercheActive && categories.length > 1 && (
        <div
          ref={tablistRef}
          className="relative flex flex-wrap gap-2 border-b border-bronze pb-4 no-print"
          role="tablist"
          aria-label={etageTitre}
        >
          {categories.map((cat) => {
            const actif = cat.categorie === categorieActive;
            const libelle = langue === 'fr' ? cat.libelle_fr : cat.libelle_en;
            return (
              <button
                key={cat.categorie}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => changerOnglet(cat.categorie)}
                className={`focus-marque px-3.5 py-2 text-xs uppercase tracking-[0.14em] border transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                  actif
                    ? 'bg-or text-nuit border-or font-medium'
                    : 'bg-surface border-bronze text-ivoire-doux hover:text-ivoire'
                }`}
              >
                {libelle}
              </button>
            );
          })}
          <span
            ref={indicateurRef}
            aria-hidden="true"
            className="onglet-indicateur pointer-events-none absolute top-0 left-0 w-full h-[2px] bg-or"
          />
        </div>
      )}

      {/* Registre à filets */}
      {categoriesAffichees.length === 0 ? (
        <div className="bg-surface border border-bronze p-6 text-center">
          <p className="font-editorial italic text-lg text-ivoire-doux">{t.aucunResultat}</p>
        </div>
      ) : (
        <div key={`${categorieActive}-${reqNorm}-${filtreNote}`} className="space-y-8">
          {categoriesAffichees.map((cat) => {
            const libelleCat = langue === 'fr' ? cat.libelle_fr : cat.libelle_en;
            const doubleTarif = aColonneVerreBouteille(cat.plats);
            const groupes = grouperSousSections(cat.plats);

            return (
              <div key={cat.categorie} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm uppercase tracking-[0.18em] text-or">
                      {libelleCat}
                    </h3>
                    {cat.sous_titre && (
                      <p className="font-editorial italic text-base text-ivoire-doux mt-1">
                        {cat.sous_titre}
                      </p>
                    )}
                  </div>
                  {doubleTarif && (
                    <div className="hidden sm:flex items-center gap-8 text-[11px] uppercase tracking-[0.16em] text-ivoire-doux pr-2">
                      <span className="w-28 text-right">{t.verre}</span>
                      <span className="w-28 text-right">{t.bouteille}</span>
                    </div>
                  )}
                </div>

                {groupes.map((groupe, idx) => (
                  <div key={`${cat.categorie}-${groupe.titre ?? idx}`} className="space-y-1">
                    {groupe.titre && (
                      <h4 className="font-display text-xs uppercase tracking-[0.16em] text-ivoire-doux pt-3 pb-1 border-b border-bronze">
                        {groupe.titre}
                      </h4>
                    )}
                    <ul className="registre-liste-anime divide-bronze border-t border-b border-bronze">
                      {groupe.plats.map((plat) => {
                        const mode = determinerModeOptions(plat);
                        const aDouble = typeof plat.prixBouteille === 'number';
                        const ajoutDirectSimple = mode === 'aucune' && !aDouble;
                        const confirmeSimple = ajoutConfirmeId === plat.id;

                        return (
                          <li
                            key={plat.id}
                            onPointerEnter={
                              univers === 'cocktails'
                                ? () => setImpulsionBar((n) => (n + 1) % 1000)
                                : undefined
                            }
                            className="ligne-carte-item py-3.5 px-2 sm:px-3 hover:bg-surface-alt transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <button
                              type="button"
                              onClick={() => onOuvrirPlat(cat.categorie, plat)}
                              className="focus-marque text-left flex-1 min-w-0 cursor-pointer group"
                            >
                              <div className="flex flex-wrap items-baseline gap-2.5">
                                <span className="ligne-carte-titre inline-block font-display text-sm sm:text-[15px] uppercase tracking-[0.1em] text-ivoire group-hover:text-or">
                                  {plat.nom}
                                </span>
                                {plat.note && (
                                  <span className="font-display text-[11px] uppercase tracking-[0.12em] text-ivoire-doux">
                                    · {plat.note}
                                  </span>
                                )}
                              </div>
                              {plat.description && (
                                <p className="font-editorial italic text-base sm:text-[17px] text-ivoire-doux ligatures-editoriales mt-0.5 leading-snug">
                                  {plat.description}
                                </p>
                              )}
                            </button>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              {aDouble ? (
                                AFFICHER_PANIER ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) =>
                                        declencherAjoutVisuel(
                                          `${plat.id}-g`,
                                          e.currentTarget,
                                          cat.categorie,
                                          plat,
                                          ['Glass'],
                                        )
                                      }
                                      className="focus-marque relative border border-bronze bg-surface hover:bg-or hover:text-nuit hover:border-or text-ivoire px-2.5 py-1.5 text-xs tabular-nums transition-colors cursor-pointer min-h-[40px]"
                                      aria-label={`${plat.nom} (${t.verre})`}
                                    >
                                      <span className="text-[10px] uppercase tracking-[0.12em] mr-1.5 opacity-80">
                                        {t.verre}
                                      </span>
                                      {formaterPrixFCFA(plat.prix)}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) =>
                                        declencherAjoutVisuel(
                                          `${plat.id}-b`,
                                          e.currentTarget,
                                          cat.categorie,
                                          plat,
                                          ['Bottle'],
                                        )
                                      }
                                      className="focus-marque relative border border-bronze bg-surface hover:bg-or hover:text-nuit hover:border-or text-ivoire px-2.5 py-1.5 text-xs tabular-nums transition-colors cursor-pointer min-h-[40px]"
                                      aria-label={`${plat.nom} (${t.bouteille})`}
                                    >
                                      <span className="text-[10px] uppercase tracking-[0.12em] mr-1.5 opacity-80">
                                        {t.bouteille}
                                      </span>
                                      {formaterPrixFCFA(plat.prixBouteille!)}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-6 text-xs tabular-nums text-ivoire">
                                    <span className="whitespace-nowrap">
                                      <span className="text-[10px] uppercase tracking-[0.12em] text-ivoire-doux mr-1.5 sm:hidden">
                                        {t.verre}
                                      </span>
                                      {formaterPrixFCFA(plat.prix)}
                                    </span>
                                    <span className="whitespace-nowrap w-28 text-right">
                                      <span className="text-[10px] uppercase tracking-[0.12em] text-ivoire-doux mr-1.5 sm:hidden">
                                        {t.bouteille}
                                      </span>
                                      {formaterPrixFCFA(plat.prixBouteille!)}
                                    </span>
                                  </div>
                                )
                              ) : (
                                <>
                                  <span className="font-display text-sm sm:text-[15px] text-ivoire tabular-nums whitespace-nowrap">
                                    {formaterPrixFCFA(plat.prix)}
                                  </span>
                                  {AFFICHER_PANIER && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        if (ajoutDirectSimple) {
                                          declencherAjoutVisuel(
                                            plat.id,
                                            e.currentTarget,
                                            cat.categorie,
                                            plat,
                                            [],
                                          );
                                        } else {
                                          onOuvrirPlat(cat.categorie, plat);
                                        }
                                      }}
                                      aria-label={`${ajoutDirectSimple ? t.ajouter : t.choisir} : ${plat.nom}`}
                                      className="focus-marque relative border border-bronze bg-surface hover:bg-or hover:text-nuit hover:border-or text-or px-3 py-2 text-xs uppercase tracking-[0.12em] inline-flex items-center gap-1.5 cursor-pointer transition-colors no-print min-h-[40px]"
                                    >
                                      {confirmeSimple ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                          <span className="hidden sm:inline">
                                            {t.ajouteConfirmation}
                                          </span>
                                          <span
                                            aria-hidden="true"
                                            className="bouton-ajout-anneau absolute inset-0 border border-or"
                                          />
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                          <span className="hidden sm:inline">
                                            {ajoutDirectSimple ? t.ajouter : t.choisir}
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>

                            <span
                              aria-hidden="true"
                              className="ligne-carte-filet-hover pointer-events-none absolute inset-x-0 bottom-0 h-px bg-or"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

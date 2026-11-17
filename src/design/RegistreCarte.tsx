import { useMemo, useState } from 'react';
import { Plus, Printer, Search, X } from 'lucide-react';
import type { CategorieMenu, Plat } from '../data/restaurantData';
import { TEXTES_SITE, type Langue } from '../data/textesSite';
import { determinerModeOptions, formaterPrixFCFA } from '../engine/panier';
import { normaliserRecherche } from '../engine/sanitize';

export function RegistreCarte({
  univers,
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

  const reqNorm = normaliserRecherche(recherche);
  const estRechercheActive = reqNorm.length > 0 || filtreNote !== 'tous';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-bronze pb-5">
        <div className="space-y-1.5">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-or tabular-nums">
            {etageCode}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-[0.14em] text-ivoire">
            {etageTitre}
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-ivoire-doux">
            {etageSousTitre}
          </p>
        </div>

        {afficherBarreOutils && (
          <div className="flex flex-wrap items-center gap-2 no-print">
            {onChangerLangue && (
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
            <button
              type="button"
              onClick={() => window.print()}
              className="focus-marque border border-bronze bg-surface hover:bg-surface-alt text-ivoire px-3.5 py-2 text-xs uppercase tracking-[0.14em] inline-flex items-center gap-2 cursor-pointer min-h-[40px]"
            >
              <Printer className="w-4 h-4 text-or" aria-hidden="true" />
              <span>{t.imprimer}</span>
            </button>
          </div>
        )}
      </div>

      {/* Outils de recherche et filtres (affichés en priorité sur Cuisine, disponibles par étage) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="relative flex-1 max-w-md">
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

      {/* Onglets de catégories (masqués si recherche active) */}
      {!estRechercheActive && categories.length > 1 && (
        <div
          className="flex flex-wrap gap-2 border-b border-bronze pb-4 no-print"
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
                onClick={() => setCategorieActive(cat.categorie)}
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
        </div>
      )}

      {/* Registre à filets */}
      {categoriesAffichees.length === 0 ? (
        <div className="bg-surface border border-bronze p-6 text-center">
          <p className="font-editorial italic text-lg text-ivoire-doux">{t.aucunResultat}</p>
        </div>
      ) : (
        <div className="space-y-8">
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
                    <ul className="divide-bronze border-t border-b border-bronze">
                      {groupe.plats.map((plat) => {
                        const mode = determinerModeOptions(plat);
                        const aDouble = typeof plat.prixBouteille === 'number';
                        const ajoutDirectSimple = mode === 'aucune' && !aDouble;

                        return (
                          <li
                            key={plat.id}
                            className="py-3.5 px-2 sm:px-3 hover:bg-surface-alt transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <button
                              type="button"
                              onClick={() => onOuvrirPlat(cat.categorie, plat)}
                              className="focus-marque text-left flex-1 min-w-0 cursor-pointer group"
                            >
                              <div className="flex flex-wrap items-baseline gap-2.5">
                                <span className="font-display text-sm sm:text-[15px] uppercase tracking-[0.1em] text-ivoire group-hover:text-or transition-colors">
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
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onAjoutRapide(cat.categorie, plat, ['Glass'])}
                                    className="focus-marque border border-bronze bg-surface hover:bg-or hover:text-nuit hover:border-or text-ivoire px-2.5 py-1.5 text-xs tabular-nums transition-colors cursor-pointer min-h-[40px]"
                                    aria-label={`${plat.nom} (${t.verre})`}
                                  >
                                    <span className="text-[10px] uppercase tracking-[0.12em] mr-1.5 opacity-80">
                                      {t.verre}
                                    </span>
                                    {formaterPrixFCFA(plat.prix)}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onAjoutRapide(cat.categorie, plat, ['Bottle'])}
                                    className="focus-marque border border-bronze bg-surface hover:bg-or hover:text-nuit hover:border-or text-ivoire px-2.5 py-1.5 text-xs tabular-nums transition-colors cursor-pointer min-h-[40px]"
                                    aria-label={`${plat.nom} (${t.bouteille})`}
                                  >
                                    <span className="text-[10px] uppercase tracking-[0.12em] mr-1.5 opacity-80">
                                      {t.bouteille}
                                    </span>
                                    {formaterPrixFCFA(plat.prixBouteille!)}
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-display text-sm sm:text-[15px] text-ivoire tabular-nums whitespace-nowrap">
                                    {formaterPrixFCFA(plat.prix)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (ajoutDirectSimple) {
                                        onAjoutRapide(cat.categorie, plat, []);
                                      } else {
                                        onOuvrirPlat(cat.categorie, plat);
                                      }
                                    }}
                                    aria-label={`${ajoutDirectSimple ? t.ajouter : t.choisir} : ${plat.nom}`}
                                    className="focus-marque border border-bronze bg-surface hover:bg-or hover:text-nuit hover:border-or text-or px-3 py-2 text-xs uppercase tracking-[0.12em] inline-flex items-center gap-1.5 cursor-pointer transition-colors no-print min-h-[40px]"
                                  >
                                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline">
                                      {ajoutDirectSimple ? t.ajouter : t.choisir}
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
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

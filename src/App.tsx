import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { type Plat, restaurantData } from './data/restaurantData';
import { type Langue, TEXTES_SITE } from './data/textesSite';
import { AscenseurNav } from './design/AscenseurNav';
import { ConfidentialiteModal } from './design/ConfidentialiteModal';
import { ErrorBoundary } from './design/ErrorBoundary';
import { EtageReveal, FacadeOrSvg } from './design/FacadeOrSvg';
import { HeaderBar } from './design/HeaderBar';
import { PanierDrawer } from './design/PanierDrawer';
import { PlatModal } from './design/PlatModal';
import { RegistreCarte } from './design/RegistreCarte';
import { ReservationPanel } from './design/ReservationPanel';
import { calculerStatutOuverture, formatHeureFr } from './engine/horaires';
import {
  type LignePanierHydratee,
  MAX_QTE_PAR_LIGNE,
  MAX_TOTAL_ARTICLES,
  calculerPrixUnitaire,
  chargerPanierDepuisStockage,
  cleLignePanier,
  clePhotoPlat,
  construireIndexPlats,
  formaterPrixFCFA,
  sauvegarderPanierDansStockage,
  totalArticlesPanier,
} from './engine/panier';
import { validerLienHttps } from './engine/sanitize';

function OneRooftopApp() {
  const [langue, setLangue] = useState<Langue>('fr');
  const t = TEXTES_SITE[langue];

  const indexPlats = useMemo(() => construireIndexPlats(restaurantData.menu), []);
  const [lignesPanier, setLignesPanier] = useState<LignePanierHydratee[]>(() =>
    chargerPanierDepuisStockage(indexPlats),
  );
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [platSelectionne, setPlatSelectionne] = useState<{
    categorie: string;
    plat: Plat;
  } | null>(null);
  const [confidentialiteOuverte, setConfidentialiteOuverte] = useState(false);
  const [animationPanier, setAnimationPanier] = useState(false);
  const [maintenant, setMaintenant] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setMaintenant(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    sauvegarderPanierDansStockage(
      lignesPanier.map((l) => ({
        id: l.id,
        quantite: l.quantite,
        options: l.options,
        remarque: l.remarque,
      })),
    );
  }, [lignesPanier]);

  const statut = useMemo(
    () =>
      calculerStatutOuverture(
        restaurantData.lieux.horaires,
        restaurantData.lieux.fuseau,
        restaurantData.restaurant.horairesConfirmes,
        maintenant,
      ),
    [maintenant],
  );

  const declencherPulsePanier = () => {
    setAnimationPanier(false);
    window.requestAnimationFrame(() => setAnimationPanier(true));
  };

  const ajouterAuPanier = (
    categorie: string,
    plat: Plat,
    quantite: number,
    options: string[],
    remarque: string,
  ) => {
    setLignesPanier((prev) => {
      const totalActuel = totalArticlesPanier(prev);
      const capacite = MAX_TOTAL_ARTICLES - totalActuel;
      if (capacite <= 0) return prev;

      const cle = cleLignePanier(plat.id, options, remarque);
      const prixUnitaire = calculerPrixUnitaire(plat, options);
      const existant = prev.find(
        (l) => cleLignePanier(l.id, l.options, l.remarque) === cle,
      );

      if (existant) {
        const ajout = Math.min(quantite, capacite, MAX_QTE_PAR_LIGNE - existant.quantite);
        if (ajout <= 0) return prev;
        return prev.map((l) => {
          if (cleLignePanier(l.id, l.options, l.remarque) !== cle) return l;
          const nq = l.quantite + ajout;
          return { ...l, quantite: nq, sousTotal: l.prixUnitaire * nq };
        });
      }

      const qteFinale = Math.min(quantite, capacite, MAX_QTE_PAR_LIGNE);
      if (qteFinale <= 0) return prev;

      return [
        ...prev,
        {
          id: plat.id,
          categorie,
          nom: plat.nom,
          quantite: qteFinale,
          options,
          remarque,
          prixUnitaire,
          sousTotal: prixUnitaire * qteFinale,
          photoCle: clePhotoPlat(categorie, plat.nom),
        },
      ];
    });
    declencherPulsePanier();
  };

  const modifierQuantite = (cle: string, delta: number) => {
    setLignesPanier((prev) => {
      const totalActuel = totalArticlesPanier(prev);
      return prev
        .map((l) => {
          if (cleLignePanier(l.id, l.options, l.remarque) !== cle) return l;
          if (delta > 0 && totalActuel >= MAX_TOTAL_ARTICLES) return l;
          const nq = Math.min(MAX_QTE_PAR_LIGNE, l.quantite + delta);
          if (nq <= 0) return null;
          return { ...l, quantite: nq, sousTotal: l.prixUnitaire * nq };
        })
        .filter((l): l is LignePanierHydratee => l !== null);
    });
  };

  const supprimerLigne = (cle: string) => {
    setLignesPanier((prev) =>
      prev.filter((l) => cleLignePanier(l.id, l.options, l.remarque) !== cle),
    );
  };

  const categoriesCocktails = useMemo(
    () => restaurantData.menu.filter((c) => c.univers === 'cocktails'),
    [],
  );
  const categoriesCuisine = useMemo(
    () => restaurantData.menu.filter((c) => c.univers === 'cuisine'),
    [],
  );
  const categoriesCave = useMemo(
    () => restaurantData.menu.filter((c) => c.univers === 'cave'),
    [],
  );

  const nombreArticles = totalArticlesPanier(lignesPanier);
  const afficherSoirees = restaurantData.restaurant.soireesEtPrivatisationConfirmees;
  const telLien = `tel:${restaurantData.lieux.telephone.replace(/\s+/g, '')}`;
  const mailLien = `mailto:${restaurantData.lieux.email}`;
  const mapsValide = validerLienHttps(restaurantData.lieux.maps_url);

  return (
    <div className="min-h-screen bg-nuit text-ivoire flex flex-col">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-or text-nuit px-4 py-2 text-xs uppercase tracking-[0.14em]"
      >
        {t.skipLink}
      </a>

      <HeaderBar
        langue={langue}
        afficherSoirees={afficherSoirees}
        nombreArticles={nombreArticles}
        animationPanier={animationPanier}
        onOuvrirPanier={() => setPanierOuvert(true)}
      />

      <AscenseurNav langue={langue} afficherSoirees={afficherSoirees} />

      <main id="contenu-principal" className="flex-1">
        {/* RDC : Rue Njo-Njo / Accueil */}
        <section id="etage-rdc" className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch border border-bronze bg-surface p-6 sm:p-10">
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-or">
                  {t.rdc.surTitre}
                </p>

                <div className="flex items-center gap-5">
                  <img
                    src="/assets/aistudio/IMG_5526_86b55545.jpeg"
                    alt={restaurantData.restaurant.nomComplet}
                    width={140}
                    height={140}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover border border-bronze shrink-0"
                  />
                  <div className="space-y-1.5">
                    <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-[0.16em] text-ivoire">
                      {t.rdc.titre}
                    </h1>
                    <p className="font-editorial italic text-xl sm:text-2xl text-ivoire-doux">
                      {t.rdc.sousTitre}
                    </p>
                  </div>
                </div>

                <p className="font-editorial italic text-lg sm:text-xl text-ivoire leading-relaxed max-w-2xl">
                  {t.rdc.intro}
                </p>
              </div>

              <div className="space-y-5 border-t border-bronze pt-5">
                {statut.confirme && (
                  <p className="font-display text-xs uppercase tracking-[0.16em] text-or inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{langue === 'fr' ? statut.messageFr : statut.messageEn}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#etage-toit"
                    className="focus-marque bg-or text-nuit px-6 py-3 text-xs uppercase tracking-[0.16em] font-medium inline-flex items-center justify-center min-h-[44px]"
                  >
                    {t.rdc.ctaReserver}
                  </a>
                  <a
                    href="#etage-cocktails"
                    className="focus-marque border border-bronze bg-nuit hover:border-or text-ivoire px-6 py-3 text-xs uppercase tracking-[0.16em] inline-flex items-center justify-center min-h-[44px]"
                  >
                    {t.rdc.ctaCarte}
                  </a>
                </div>
              </div>
            </div>

            {/* Colonne droite : façade en traits d'or + emplacement photo rooftop */}
            <div className="lg:col-span-5 border border-bronze bg-nuit p-4 sm:p-5 flex flex-col justify-between gap-4">
              <FacadeOrSvg variante="immeuble" />
              <div className="border-t border-bronze pt-3">
                <p className="font-display text-xs uppercase tracking-[0.16em] text-or">
                  {t.rdc.photoSlotTitre}
                </p>
                <p className="font-editorial italic text-base text-ivoire-doux mt-1">
                  {t.rdc.photoSlotMention}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FacadeOrSvg variante="separateur" />
        </div>

        {/* ÉTAGE 01 : Cocktails & Bar */}
        <section id="etage-cocktails" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <EtageReveal>
            <RegistreCarte
              univers="cocktails"
              etageCode={langue === 'fr' ? 'ÉTAGE 01 · BAR & LOUNGE' : 'FLOOR 01 · BAR & LOUNGE'}
              etageTitre={langue === 'fr' ? 'Cocktails, Mocktails & Bar' : 'Cocktails, Mocktails & Bar'}
              etageSousTitre={
                langue === 'fr'
                  ? 'Créations maison, mocktails, bières locales et importées, thés et cafés.'
                  : 'House creations, mocktails, imported and local beers, teas and coffee.'
              }
              categories={categoriesCocktails}
              langue={langue}
              onOuvrirPlat={(categorie, plat) => setPlatSelectionne({ categorie, plat })}
              onAjoutRapide={(categorie, plat, options = []) =>
                ajouterAuPanier(categorie, plat, 1, options, '')
              }
            />
          </EtageReveal>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FacadeOrSvg variante="separateur" />
        </div>

        {/* ÉTAGE 02 : Cuisine & Grill */}
        <section id="etage-cuisine" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <EtageReveal>
            <RegistreCarte
              univers="cuisine"
              etageCode={langue === 'fr' ? 'ÉTAGE 02 · CUISINE & GRILL' : 'FLOOR 02 · KITCHEN & GRILL'}
              etageTitre={langue === 'fr' ? 'La Table & Le Charbon' : 'Dining & Charcoal Grill'}
              etageSousTitre={
                langue === 'fr'
                  ? 'Entrées asiatiques, dim sum vapeur, sushis, grillades au charbon, pâtes, burgers et desserts.'
                  : 'Asian nibbles, steamed dim sum, sushi, charcoal grill, pasta, burgers and desserts.'
              }
              categories={categoriesCuisine}
              langue={langue}
              afficherBarreOutils={true}
              onChangerLangue={setLangue}
              onOuvrirPlat={(categorie, plat) => setPlatSelectionne({ categorie, plat })}
              onAjoutRapide={(categorie, plat, options = []) =>
                ajouterAuPanier(categorie, plat, 1, options, '')
              }
            />
          </EtageReveal>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FacadeOrSvg variante="separateur" />
        </div>

        {/* ÉTAGE 03 : La Cave */}
        <section id="etage-cave" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <EtageReveal>
            <RegistreCarte
              univers="cave"
              etageCode={langue === 'fr' ? 'ÉTAGE 03 · LA CAVE' : 'FLOOR 03 · CELLAR & SPIRITS'}
              etageTitre={langue === 'fr' ? 'Vins, Champagnes & Spiritueux' : 'Wines, Champagne & Spirits'}
              etageSousTitre={
                langue === 'fr'
                  ? 'Grands crus de Bordeaux, champagnes, single malts du monde et spiritueux au verre ou à la bouteille.'
                  : 'Bordeaux estates, champagne, single malts and spirits by the glass or bottle.'
              }
              categories={categoriesCave}
              langue={langue}
              onOuvrirPlat={(categorie, plat) => setPlatSelectionne({ categorie, plat })}
              onAjoutRapide={(categorie, plat, options = []) =>
                ajouterAuPanier(categorie, plat, 1, options, '')
              }
            />
          </EtageReveal>
        </section>

        {/* ÉTAGE 04 : Soirées & Privatisation (affiché uniquement si confirmé) */}
        {afficherSoirees && (
          <>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <FacadeOrSvg variante="separateur" />
            </div>
            <section id="etage-soirees" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
              <EtageReveal>
                <div className="space-y-6">
                  <div className="space-y-1.5 border-b border-bronze pb-5">
                    <p className="font-display text-xs uppercase tracking-[0.2em] text-or">
                      {t.soirees.surTitre}
                    </p>
                    <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-[0.14em] text-ivoire">
                      {t.soirees.titre}
                    </h2>
                    <p className="font-editorial italic text-lg sm:text-xl text-ivoire-doux max-w-3xl">
                      {t.soirees.intro}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <article className="bg-surface border border-bronze p-6 flex flex-col justify-between gap-5">
                      <div className="space-y-2">
                        <h3 className="font-display text-sm uppercase tracking-[0.16em] text-or">
                          {t.soirees.blocJacarandaTitre}
                        </h3>
                        <p className="font-editorial italic text-lg text-ivoire-doux leading-relaxed">
                          {t.soirees.blocJacarandaTexte}
                        </p>
                      </div>
                      <div className="border border-bronze bg-nuit aspect-[16/9] flex flex-col items-center justify-center p-4 text-center">
                        <p className="font-display text-xs uppercase tracking-[0.16em] text-or">
                          {t.soirees.photoTerrasse}
                        </p>
                        <p className="font-editorial italic text-base text-ivoire-doux mt-1">
                          {t.rdc.photoSlotMention}
                        </p>
                      </div>
                    </article>

                    <article className="bg-surface border border-bronze p-6 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <h3 className="font-display text-sm uppercase tracking-[0.16em] text-or">
                          {t.soirees.blocPrivatisationTitre}
                        </h3>
                        <p className="font-editorial italic text-lg text-ivoire-doux leading-relaxed">
                          {t.soirees.blocPrivatisationTexte}
                        </p>
                        <div>
                          <a
                            href="#etage-toit"
                            className="focus-marque inline-flex items-center border border-bronze bg-nuit hover:border-or text-ivoire px-4 py-2.5 text-xs uppercase tracking-[0.14em] min-h-[44px]"
                          >
                            {t.soirees.ctaPrivatiser}
                          </a>
                        </div>
                      </div>
                      <div className="border border-bronze bg-nuit aspect-[16/9] flex flex-col items-center justify-center p-4 text-center">
                        <p className="font-display text-xs uppercase tracking-[0.16em] text-or">
                          {t.soirees.photoSalle}
                        </p>
                        <p className="font-editorial italic text-base text-ivoire-doux mt-1">
                          {t.rdc.photoSlotMention}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </EtageReveal>
            </section>
          </>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FacadeOrSvg variante="separateur" />
        </div>

        {/* TOIT : Réservation & Informations pratiques */}
        <section id="etage-toit" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <EtageReveal>
            <div className="space-y-8">
              <div className="space-y-1.5 border-b border-bronze pb-5">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-or">
                  {t.toit.surTitre}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-[0.14em] text-ivoire">
                  {t.toit.titre}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <ReservationPanel langue={langue} />
                </div>

                <div className="lg:col-span-5 space-y-6">
                  {/* Horaires jour par jour */}
                  <div className="bg-surface border border-bronze p-5 sm:p-6 space-y-3">
                    <h3 className="font-display text-sm uppercase tracking-[0.16em] text-or border-b border-bronze pb-3">
                      {t.toit.horairesTitre}
                    </h3>
                    <dl className="divide-bronze">
                      {restaurantData.lieux.horaires.map((h) => (
                        <div
                          key={h.jour}
                          className="py-2 flex items-center justify-between gap-4 text-sm"
                        >
                          <dt className="font-display uppercase tracking-[0.1em] text-xs text-ivoire">
                            {h.jour}
                          </dt>
                          <dd className="font-display text-xs text-ivoire-doux tabular-nums">
                            {formatHeureFr(h.ouverture)} – {formatHeureFr(h.fermeture)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Adresse, Contact & Services */}
                  <div className="bg-surface border border-bronze p-5 sm:p-6 space-y-4">
                    <h3 className="font-display text-sm uppercase tracking-[0.16em] text-or border-b border-bronze pb-3">
                      {t.toit.accesTitre}
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-or shrink-0 mt-1" aria-hidden="true" />
                        <div>
                          <p className="font-display uppercase tracking-[0.08em] text-xs text-ivoire">
                            {restaurantData.lieux.adresse} · {restaurantData.lieux.quartier},{' '}
                            {restaurantData.lieux.ville}
                          </p>
                          <p className="font-editorial italic text-base text-ivoire-doux">
                            {restaurantData.lieux.repere}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-or shrink-0" aria-hidden="true" />
                        <a
                          href={telLien}
                          className="focus-marque font-display text-xs uppercase tracking-[0.1em] text-ivoire hover:text-or tabular-nums"
                        >
                          {t.toit.appeler} {restaurantData.lieux.telephone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-or shrink-0" aria-hidden="true" />
                        <a
                          href={mailLien}
                          className="focus-marque font-display text-xs tracking-[0.06em] text-ivoire hover:text-or"
                        >
                          {restaurantData.lieux.email}
                        </a>
                      </div>

                      {mapsValide && (
                        <div className="pt-1">
                          <a
                            href={restaurantData.lieux.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-marque inline-flex items-center gap-1.5 border border-bronze bg-nuit hover:border-or text-ivoire px-3.5 py-2 text-xs uppercase tracking-[0.12em] min-h-[40px]"
                          >
                            <span>{t.toit.voirCarteMaps}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-or" aria-hidden="true" />
                          </a>
                        </div>
                      )}
                    </div>

                    {restaurantData.restaurant.servicesConfirmes.length > 0 && (
                      <div className="border-t border-bronze pt-4 space-y-2">
                        <h4 className="font-display text-xs uppercase tracking-[0.14em] text-or">
                          {t.toit.servicesTitre}
                        </h4>
                        <p className="font-editorial italic text-base text-ivoire-doux leading-relaxed">
                          {restaurantData.restaurant.servicesConfirmes.join(' · ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </EtageReveal>
        </section>

        {/* Vue complète réservée à l'impression A4 */}
        <section className="hidden print-only max-w-4xl mx-auto p-4">
          <div className="border-b pb-3 mb-4">
            <h1 className="font-display text-2xl uppercase tracking-[0.16em]">
              {restaurantData.restaurant.nomComplet}
            </h1>
            <p className="font-editorial italic text-base">
              {restaurantData.lieux.adresse}, {restaurantData.lieux.quartier},{' '}
              {restaurantData.lieux.ville} · {restaurantData.lieux.telephone}
            </p>
          </div>
          <div className="space-y-6">
            {restaurantData.menu.map((cat) => (
              <div key={`print-${cat.categorie}`} className="break-inside-avoid-page">
                <h2 className="font-display text-sm uppercase tracking-[0.14em] border-b pb-1 mb-2">
                  {langue === 'fr' ? cat.libelle_fr : cat.libelle_en}
                </h2>
                <ul className="space-y-1">
                  {cat.plats.map((p) => (
                    <li
                      key={`print-${p.id}`}
                      className="flex items-baseline justify-between gap-4 text-xs"
                    >
                      <span>
                        <strong className="uppercase">{p.nom}</strong>
                        {p.description ? ` · ${p.description}` : ''}
                      </span>
                      <span className="tabular-nums whitespace-nowrap">
                        {formaterPrixFCFA(p.prix)}
                        {typeof p.prixBouteille === 'number'
                          ? ` / ${formaterPrixFCFA(p.prixBouteille)}`
                          : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-bronze bg-surface no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ivoire-doux">
          <p className="font-display uppercase tracking-[0.12em]">{t.footer.mention}</p>
          <button
            type="button"
            onClick={() => setConfidentialiteOuverte(true)}
            className="focus-marque font-display uppercase tracking-[0.14em] text-ivoire hover:text-or underline underline-offset-4 cursor-pointer min-h-[40px]"
          >
            {t.footer.confidentialite}
          </button>
        </div>
      </footer>

      <PlatModal
        entree={platSelectionne}
        langue={langue}
        onFermer={() => setPlatSelectionne(null)}
        onConfirmerAjout={ajouterAuPanier}
      />

      <PanierDrawer
        ouvert={panierOuvert}
        lignes={lignesPanier}
        langue={langue}
        onFermer={() => setPanierOuvert(false)}
        onModifierQuantite={modifierQuantite}
        onSupprimerLigne={supprimerLigne}
        onViderPanier={() => setLignesPanier([])}
      />

      <ConfidentialiteModal
        ouvert={confidentialiteOuverte}
        langue={langue}
        onFermer={() => setConfidentialiteOuverte(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <OneRooftopApp />
    </ErrorBoundary>
  );
}

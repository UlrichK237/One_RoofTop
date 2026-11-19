import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { AFFICHER_PANIER, AFFICHER_SOIREES, CONFIRME } from './data/confirmations';
import { type Plat, restaurantData } from './data/restaurantData';
import { type Langue, TEXTES_SITE } from './data/textesSite';
import { CadrePhotoLieu, SceneDessinee } from './design/AmbiancesEtage';
import { AscenseurNav } from './design/AscenseurNav';
import { ConfidentialiteModal } from './design/ConfidentialiteModal';
import { ErrorBoundary } from './design/ErrorBoundary';
import { EtageReveal } from './design/FacadeOrSvg';
import { HeaderBar } from './design/HeaderBar';
import { HeroAllumage } from './design/HeroAllumage';
import { useMotionMode } from './design/motion/useMotionMode';
import { useReveal } from './design/motion/useReveal';
import { PanierDrawer } from './design/PanierDrawer';
import { PlatModal } from './design/PlatModal';
import { PortesAscenseur } from './design/PortesAscenseur';
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
  const [enTransitionLangue, setEnTransitionLangue] = useState(false);
  const { mode: motionMode, setMode: setMotionMode } = useMotionMode();
  const { ref: toitTitreRef, visible: toitTitreVisible } = useReveal(false);
  const t = TEXTES_SITE[langue];

  const indexPlats = useMemo(() => construireIndexPlats(restaurantData.menu), []);
  const [lignesPanier, setLignesPanier] = useState<LignePanierHydratee[]>(() =>
    AFFICHER_PANIER ? chargerPanierDepuisStockage(indexPlats) : [],
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
    if (!CONFIRME.horaires) return;
    const timer = window.setInterval(() => setMaintenant(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!AFFICHER_PANIER) return;
    sauvegarderPanierDansStockage(
      lignesPanier.map((l) => ({
        id: l.id,
        quantite: l.quantite,
        options: l.options,
        remarque: l.remarque,
      })),
    );
  }, [lignesPanier]);

  const changerLangueAvecFondu = (nouvelleLangue: Langue) => {
    if (nouvelleLangue === langue) return;
    if (motionMode === 'off') {
      setLangue(nouvelleLangue);
      return;
    }
    setEnTransitionLangue(true);
    window.setTimeout(() => {
      setLangue(nouvelleLangue);
      setEnTransitionLangue(false);
    }, 140);
  };

  const statut = useMemo(
    () =>
      calculerStatutOuverture(
        restaurantData.lieux.horaires,
        restaurantData.lieux.fuseau,
        CONFIRME.horaires,
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
    if (!AFFICHER_PANIER) return;
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

  const servicesConfirmesFiltres = useMemo(() => {
    const liste: string[] = [];
    if (CONFIRME.carte) {
      liste.push(langue === 'fr' ? 'Restauration sur place' : 'Dine-in');
    }
    if (CONFIRME.salleClimatisee) {
      liste.push(langue === 'fr' ? 'Salle intérieure climatisée' : 'Air-conditioned dining room');
    }
    if (CONFIRME.venteAEmporter) {
      liste.push(langue === 'fr' ? 'Vente à emporter' : 'Takeaway');
    }
    if (CONFIRME.livraison) {
      liste.push(langue === 'fr' ? 'Livraison' : 'Delivery');
    }
    if (CONFIRME.privatisation) {
      liste.push(langue === 'fr' ? 'Privatisation sur demande' : 'Private events');
    }
    if (CONFIRME.traiteur) {
      liste.push(langue === 'fr' ? 'Service traiteur' : 'Catering');
    }
    if (CONFIRME.optionsVegetariennes) {
      liste.push(langue === 'fr' ? 'Options végétariennes' : 'Vegetarian options');
    }
    if (CONFIRME.optionsHalal) {
      liste.push(langue === 'fr' ? 'Options halal' : 'Halal options');
    }
    if (CONFIRME.parking) {
      liste.push(langue === 'fr' ? 'Parking' : 'Parking');
    }
    if (CONFIRME.paiementNfc) {
      liste.push(langue === 'fr' ? 'Paiement mobile NFC' : 'NFC payment');
    }
    if (CONFIRME.accessibilitePmr) {
      liste.push(langue === 'fr' ? 'Accès PMR' : 'Wheelchair access');
    }
    return liste;
  }, [langue]);

  const nombreArticles = totalArticlesPanier(lignesPanier);
  const telLien = `tel:${restaurantData.lieux.telephone.replace(/\s+/g, '')}`;
  const mailLien = `mailto:${restaurantData.lieux.email}`;
  const mapsValide = validerLienHttps(restaurantData.lieux.maps_url);

  const cycleMotion = () => {
    const ordre = ['full', 'reduced', 'off'] as const;
    const suivant = ordre[(ordre.indexOf(motionMode) + 1) % ordre.length];
    setMotionMode(suivant);
  };

  const libelleMotion =
    langue === 'fr'
      ? motionMode === 'full'
        ? 'Mouvements : Complets'
        : motionMode === 'reduced'
          ? 'Mouvements : Réduits'
          : 'Mouvements : Désactivés'
      : motionMode === 'full'
        ? 'Motion: Full'
        : motionMode === 'reduced'
          ? 'Motion: Reduced'
          : 'Motion: Off';

  return (
    <div
      className={`min-h-screen bg-nuit text-ivoire flex flex-col langue-fondu ${
        enTransitionLangue ? 'est-en-transition' : ''
      }`}
    >
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-or text-nuit px-4 py-2 text-xs uppercase tracking-[0.14em]"
      >
        {t.skipLink}
      </a>

      <HeaderBar
        langue={langue}
        afficherSoirees={AFFICHER_SOIREES}
        nombreArticles={nombreArticles}
        animationPanier={animationPanier}
        onOuvrirPanier={() => setPanierOuvert(true)}
      />

      <AscenseurNav langue={langue} afficherSoirees={AFFICHER_SOIREES} />

      <main id="contenu-principal" className="flex-1">
        {/* RDC : Rue Njo-Njo / Allumage */}
        <HeroAllumage langue={langue} statut={statut} />

        <PortesAscenseur etageCode="01" />

        {/* ÉTAGE 01 : Cocktails & Bar */}
        <section id="etage-cocktails" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <EtageReveal>
            <RegistreCarte
              univers="cocktails"
              numeroEtage="01"
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

        <PortesAscenseur etageCode="02" />

        {/* ÉTAGE 02 : Cuisine & Grill */}
        <section id="etage-cuisine" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <EtageReveal>
            <RegistreCarte
              univers="cuisine"
              numeroEtage="02"
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
              onChangerLangue={changerLangueAvecFondu}
              onOuvrirPlat={(categorie, plat) => setPlatSelectionne({ categorie, plat })}
              onAjoutRapide={(categorie, plat, options = []) =>
                ajouterAuPanier(categorie, plat, 1, options, '')
              }
            />
          </EtageReveal>
        </section>

        <PortesAscenseur etageCode="03" />

        {/* ÉTAGE 03 : La Cave */}
        <section id="etage-cave" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <EtageReveal>
            <RegistreCarte
              univers="cave"
              numeroEtage="03"
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

        {/* ÉTAGE 04 : Soirées & Réceptions (masqué tant qu'aucun service soirées/privatisation n'est confirmé) */}
        {AFFICHER_SOIREES && (
          <>
            <PortesAscenseur etageCode="04" />
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
                    {CONFIRME.jacaranda && (
                      <article className="bg-surface border border-bronze p-6 flex flex-col justify-between gap-5">
                        <div className="space-y-2">
                          <h3 className="font-display text-sm uppercase tracking-[0.16em] text-or">
                            {t.soirees.blocJacarandaTitre}
                          </h3>
                          <p className="font-editorial italic text-lg text-ivoire-doux leading-relaxed">
                            {t.soirees.blocJacarandaTexte}
                          </p>
                        </div>
                        <CadrePhotoLieu
                          emplacement="terrasse"
                          sceneRepli="soirees"
                          titre={t.soirees.photoTerrasse}
                        />
                      </article>
                    )}

                    {(CONFIRME.privatisation || CONFIRME.traiteur) && (
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
                        <CadrePhotoLieu
                          emplacement="salle"
                          sceneRepli="soirees"
                          titre={t.soirees.photoSalle}
                        />
                      </article>
                    )}
                  </div>
                </div>
              </EtageReveal>
            </section>
          </>
        )}

        <PortesAscenseur etageCode="TOIT" />

        {/* TOIT : Réservation & Informations confirmées */}
        <section id="etage-toit" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <EtageReveal>
            <div className="space-y-8">
              <div
                ref={toitTitreRef}
                className={`flex items-start gap-4 sm:gap-6 border-b border-bronze pb-5 ${
                  toitTitreVisible ? 'est-visible' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className="chiffre-etage-deco font-display text-4xl sm:text-6xl font-semibold tabular-nums shrink-0"
                >
                  04
                  <span className="chiffre-etage-remplissage">04</span>
                </span>
                <div className="space-y-1.5">
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-or">
                    {t.toit.surTitre}
                  </p>
                  <div className="titre-etage-masque">
                    <h2 className="titre-etage-anim font-display text-2xl sm:text-3xl uppercase text-ivoire">
                      {t.toit.titre}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="border border-bronze bg-surface/60 px-3 py-2 no-print">
                <SceneDessinee scene="sommet" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <ReservationPanel langue={langue} />
                </div>

                <div className="lg:col-span-5 space-y-6">
                  {/* Horaires jour par jour (masqués si CONFIRME.horaires est faux) */}
                  {CONFIRME.horaires && (
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
                              {formatHeureFr(h.ouverture)} · {formatHeureFr(h.fermeture)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {/* Adresse, Contact & Services confirmés */}
                  <div className="bg-surface border border-bronze p-5 sm:p-6 space-y-4">
                    <h3 className="font-display text-sm uppercase tracking-[0.16em] text-or border-b border-bronze pb-3">
                      {t.toit.accesTitre}
                    </h3>

                    <div className="space-y-3 text-sm">
                      {CONFIRME.adresse && (
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-or shrink-0 mt-1" aria-hidden="true" />
                          <div>
                            <p className="font-display uppercase tracking-[0.08em] text-xs text-ivoire">
                              {restaurantData.lieux.adresse} · {restaurantData.lieux.quartier},{' '}
                              {restaurantData.lieux.ville}
                            </p>
                            {CONFIRME.auDessusDeBombayMasala && (
                              <p className="font-editorial italic text-base text-ivoire-doux">
                                {restaurantData.lieux.repere}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {CONFIRME.telephone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-or shrink-0" aria-hidden="true" />
                          <a
                            href={telLien}
                            className="focus-marque font-display text-xs uppercase tracking-[0.1em] text-ivoire hover:text-or tabular-nums"
                          >
                            {t.toit.appeler} {restaurantData.lieux.telephone}
                          </a>
                        </div>
                      )}

                      {CONFIRME.emailReservation && (
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-or shrink-0" aria-hidden="true" />
                          <a
                            href={mailLien}
                            className="focus-marque font-display text-xs tracking-[0.06em] text-ivoire hover:text-or"
                          >
                            {restaurantData.lieux.email}
                          </a>
                        </div>
                      )}

                      {CONFIRME.adresse && mapsValide && (
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

                    {servicesConfirmesFiltres.length > 0 && (
                      <div className="border-t border-bronze pt-4 space-y-2">
                        <h4 className="font-display text-xs uppercase tracking-[0.14em] text-or">
                          {t.toit.servicesTitre}
                        </h4>
                        <p className="font-editorial italic text-base text-ivoire-doux leading-relaxed">
                          {servicesConfirmesFiltres.join(' · ')}
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
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={cycleMotion}
              className="focus-marque font-display uppercase tracking-[0.12em] text-ivoire-doux hover:text-or cursor-pointer min-h-[40px]"
            >
              {libelleMotion}
            </button>
            <button
              type="button"
              onClick={() => setConfidentialiteOuverte(true)}
              className="focus-marque font-display uppercase tracking-[0.14em] text-ivoire hover:text-or underline underline-offset-4 cursor-pointer min-h-[40px]"
            >
              {t.footer.confidentialite}
            </button>
          </div>
        </div>
      </footer>

      <PlatModal
        entree={platSelectionne}
        langue={langue}
        onFermer={() => setPlatSelectionne(null)}
        onConfirmerAjout={ajouterAuPanier}
      />

      {AFFICHER_PANIER && (
        <PanierDrawer
          ouvert={panierOuvert}
          lignes={lignesPanier}
          langue={langue}
          onFermer={() => setPanierOuvert(false)}
          onModifierQuantite={modifierQuantite}
          onSupprimerLigne={supprimerLigne}
          onViderPanier={() => setLignesPanier([])}
        />
      )}

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

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { restaurantData } from '../data/restaurantData';
import { TEXTES_SITE, type Langue } from '../data/textesSite';
import type { StatutOuverture } from '../engine/horaires';
import { CadrePhotoLieu } from './AmbiancesEtage';
import { LienMagnetique } from './BoutonMagnetique';
import { FacadeOrSvg } from './FacadeOrSvg';
import { useActiveWhenVisible } from './motion/useActiveWhenVisible';
import { useSectionProgress } from './motion/useSectionProgress';

export function HeroAllumage({
  langue,
  statut,
}: {
  langue: Langue;
  statut: StatutOuverture;
}) {
  const t = TEXTES_SITE[langue].rdc;
  const heroRef = useRef<HTMLElement | null>(null);
  const progressRef = useSectionProgress<HTMLDivElement>('--section-progress');
  const { ref: cueRef, actif: cueActif } = useActiveWhenVisible<HTMLDivElement>();
  const [allume, setAllume] = useState(false);
  const [survol, setSurvol] = useState(false);

  // Séquence d'allumage courte (<= 1.6s), sautable au clic/touche/Escape/défilement
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setAllume(true));
    const passer = () => setAllume(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') passer();
    };
    window.addEventListener('keydown', onKey, { once: true });
    window.addEventListener('scroll', passer, { passive: true, once: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', passer);
    };
  }, []);

  const deplacerLanterne = (clientX: number, clientY: number) => {
    const el = heroRef.current;
    if (!el || document.documentElement.dataset.motion !== 'full') return;
    const rect = el.getBoundingClientRect();
    const x = `${Math.round(clientX - rect.left)}px`;
    const y = `${Math.round(clientY - rect.top)}px`;
    el.style.setProperty('--mx', x);
    el.style.setProperty('--my', y);
    if (!survol) setSurvol(true);
  };

  return (
    <section
      id="etage-rdc"
      ref={heroRef}
      onClick={() => setAllume(true)}
      onPointerMove={(e) => deplacerLanterne(e.clientX, e.clientY)}
      onPointerLeave={() => setSurvol(false)}
      onTouchMove={(e) => {
        if (e.touches[0]) deplacerLanterne(e.touches[0].clientX, e.touches[0].clientY);
      }}
      className={`hero-lanterne hero-allumage relative min-h-[calc(100svh-3.5rem)] flex flex-col justify-between max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6 sm:pt-12 sm:pb-8 ${
        allume ? 'est-allume' : ''
      } ${survol ? 'est-survol' : ''}`}
    >
      {/* Masque lanterne en or très doux suivant le pointeur */}
      <div className="hero-lanterne-aura" aria-hidden="true" />

      <div
        ref={progressRef}
        className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch border border-bronze bg-surface p-6 sm:p-10 overflow-hidden"
      >
        {/* Couche parallaxe lente : grille inspirée du logo */}
        <svg
          aria-hidden="true"
          viewBox="0 0 960 540"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full opacity-20 couche-parallaxe-lente"
          fill="none"
        >
          <line x1="280" y1="0" x2="280" y2="540" stroke="#96650B" strokeWidth="1" className="hero-grille-trait" />
          <line x1="640" y1="0" x2="640" y2="540" stroke="#96650B" strokeWidth="1" className="hero-grille-trait" />
          <line x1="0" y1="180" x2="960" y2="180" stroke="#96650B" strokeWidth="1" className="hero-grille-trait" />
          <line x1="0" y1="360" x2="960" y2="360" stroke="#CA8C3A" strokeWidth="1" className="hero-grille-trait" />
          <path
            d="M460 110 L515 110 L515 430 L455 430 L455 185 L410 185 Z"
            stroke="#CA8C3A"
            strokeWidth="1.2"
            className="hero-chateau-1"
          />
        </svg>

        <div className="relative z-10 lg:col-span-7 flex flex-col justify-between gap-6 hero-entree-texte">
          <div className="space-y-5">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-or">
              {t.surTitre}
            </p>

            <div className="flex items-center gap-5">
              <img
                src="/assets/logo-complet.jpeg"
                alt={restaurantData.restaurant.nomComplet}
                width={140}
                height={140}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover border border-bronze shrink-0"
              />
              <div className="space-y-1.5">
                <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-[0.16em] text-ivoire">
                  {t.titre}
                </h1>
                <p className="font-editorial italic text-xl sm:text-2xl text-ivoire-doux">
                  {t.sousTitre}
                </p>
              </div>
            </div>

            <p className="font-editorial italic text-lg sm:text-xl text-ivoire leading-relaxed max-w-2xl">
              {t.intro}
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
              <LienMagnetique
                href="#etage-toit"
                className="focus-marque bg-or text-nuit px-6 py-3 text-xs uppercase tracking-[0.16em] font-medium inline-flex items-center justify-center min-h-[44px]"
              >
                {t.ctaReserver}
              </LienMagnetique>
              <LienMagnetique
                href="#etage-cocktails"
                className="focus-marque border border-bronze bg-nuit hover:border-or text-ivoire px-6 py-3 text-xs uppercase tracking-[0.16em] inline-flex items-center justify-center min-h-[44px]"
              >
                {t.ctaCarte}
              </LienMagnetique>
            </div>
          </div>
        </div>

        {/* Colonne droite : façade en traits d'or (parallaxe moyenne) + scène ou photos lieu */}
        <div className="relative z-10 lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="border border-bronze bg-nuit p-4 sm:p-5 couche-parallaxe-moyenne">
            <FacadeOrSvg variante="immeuble" />
          </div>
          <CadrePhotoLieu
            emplacement="facade"
            sceneRepli="sommet"
            titre={t.photoSlotTitre}
            sousTitre={t.photoSlotSousTitre}
          />
        </div>
      </div>

      {/* Indice discret de montée vers la carte */}
      <div
        ref={cueRef}
        className={`pt-4 flex justify-center no-print ${cueActif ? '' : 'est-en-pause'}`}
      >
        <a
          href="#etage-cocktails"
          className="focus-marque inline-flex flex-col items-center gap-1 text-ivoire-doux hover:text-or transition-colors py-1 px-3"
        >
          <span className="font-display text-[11px] uppercase tracking-[0.22em]">
            {t.monterIndice}
          </span>
          <ChevronDown className="w-4 h-4 text-or indice-monter-fleche" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

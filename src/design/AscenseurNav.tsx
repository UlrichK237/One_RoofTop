import { useEffect, useRef, useState } from 'react';
import { ETAGES_NAVIGATION, type Langue } from '../data/textesSite';
import { useScrollProgress } from './motion/useSectionProgress';

const LARGEUR_CONTENEUR_PX = 1152; // max-w-6xl
const MARGE_MIN_COLONNE_PX = 220;

export function AscenseurNav({
  langue,
  afficherSoirees,
}: {
  langue: Langue;
  afficherSoirees: boolean;
}) {
  const etages = ETAGES_NAVIGATION.filter(
    (e) => afficherSoirees || e.id !== 'etage-soirees',
  );
  const [etageActif, setEtageActif] = useState<string>(etages[0]?.id ?? 'etage-rdc');
  const [colonneComplete, setColonneComplete] = useState(false);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const progression = useScrollProgress();
  const cabineRef = useRef<HTMLSpanElement | null>(null);
  const anneauRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const verifierLargeur = () => {
      const margeDroite = (window.innerWidth - LARGEUR_CONTENEUR_PX) / 2;
      setColonneComplete(margeDroite >= MARGE_MIN_COLONNE_PX);
    };
    verifierLargeur();
    window.addEventListener('resize', verifierLargeur, { passive: true });
    return () => window.removeEventListener('resize', verifierLargeur);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = etages
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEtageActif(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [afficherSoirees]);

  useEffect(() => {
    if (!tiroirOuvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTiroirOuvert(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tiroirOuvert]);

  const etagesInverses = [...etages].reverse();
  const indexActif = Math.max(
    0,
    etagesInverses.findIndex((e) => e.id === etageActif),
  );
  const etageCourant = etagesInverses[indexActif] ?? etagesInverses[0];

  useEffect(() => {
    if (cabineRef.current) {
      cabineRef.current.style.transform = `translate3d(0, ${indexActif * 28}px, 0)`;
    }
  }, [indexActif, colonneComplete]);

  const perimetreAnneau = 113.1; // 2 * Math.PI * 18
  useEffect(() => {
    if (anneauRef.current) {
      const offset = perimetreAnneau * (1 - progression);
      anneauRef.current.style.strokeDashoffset = offset.toFixed(1);
    }
  }, [progression, colonneComplete]);

  if (colonneComplete) {
    return (
      <aside
        aria-label={langue === 'fr' ? 'Indicateur d’étage' : 'Floor indicator'}
        className="fixed right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end no-print"
      >
        <div className="bg-surface/95 border border-bronze px-3.5 py-4 flex flex-col items-end gap-3 w-[188px]">
          <div className="w-full flex items-center justify-between gap-2 border-b border-bronze pb-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-ivoire-doux">
              {langue === 'fr' ? 'Étage' : 'Floor'}
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-or tabular-nums font-medium">
              {etageCourant.code}
            </span>
          </div>

          <div className="relative w-full flex justify-end">
            {/* Puits de progression verticale */}
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 bottom-0 w-px bg-bronze/45 overflow-hidden"
            >
              <span className="block w-full h-full bg-or jauge-ascenseur-barre" />
            </div>

            {/* Cabine dorée coulissante */}
            <span
              ref={cabineRef}
              aria-hidden="true"
              className="cabine-ascenseur absolute -right-[4px] top-[5px] w-[9px] h-[14px] border border-or bg-nuit"
            />

            <ol className="relative flex flex-col items-end pr-4">
              {etagesInverses.map((etage) => {
                const actif = etage.id === etageActif;
                const libelle = langue === 'fr' ? etage.labelFr : etage.labelEn;
                return (
                  <li key={etage.id} className="h-[28px] flex items-center justify-end">
                    <a
                      href={`#${etage.id}`}
                      className={`focus-marque text-[11px] uppercase tracking-[0.11em] whitespace-nowrap transition-colors ${
                        actif ? 'text-or font-medium' : 'text-ivoire-doux hover:text-ivoire'
                      }`}
                    >
                      <span className="mr-1.5 tabular-nums">{etage.code}</span>
                      <span>{libelle}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={langue === 'fr' ? 'Indicateur d’étage' : 'Floor indicator'}
      className="fixed bottom-4 right-3 sm:right-4 z-30 flex flex-col items-end gap-2 no-print"
    >
      {tiroirOuvert && (
        <div
          id="tiroir-etages"
          className="bg-surface border border-bronze p-3 min-w-[205px] space-y-1 fenetre-modale-panneau"
        >
          <ol className="flex flex-col gap-1">
            {etagesInverses.map((etage) => {
              const actif = etage.id === etageActif;
              const libelle = langue === 'fr' ? etage.labelFr : etage.labelEn;
              return (
                <li key={etage.id}>
                  <a
                    href={`#${etage.id}`}
                    onClick={() => setTiroirOuvert(false)}
                    className={`focus-marque flex items-center justify-between gap-3 px-2.5 py-2 text-[11px] uppercase tracking-[0.12em] border ${
                      actif
                        ? 'bg-or text-nuit border-or font-medium'
                        : 'bg-nuit border-bronze text-ivoire-doux hover:text-ivoire'
                    }`}
                  >
                    <span>{libelle}</span>
                    <span className="tabular-nums">{etage.code}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <button
        type="button"
        onClick={() => setTiroirOuvert((o) => !o)}
        aria-expanded={tiroirOuvert}
        aria-controls="tiroir-etages"
        aria-label={
          langue === 'fr'
            ? `Étage actuel ${etageCourant.code}, ouvrir la liste des étages`
            : `Current floor ${etageCourant.code}, open floor list`
        }
        className="focus-marque relative w-12 h-12 rounded-full bg-surface border border-bronze flex items-center justify-center cursor-pointer"
      >
        <svg viewBox="0 0 44 44" className="absolute inset-0 w-12 h-12 -rotate-90" aria-hidden="true">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(150,101,11,0.35)" strokeWidth="1.5" />
          <circle
            ref={anneauRef}
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="#CA8C3A"
            strokeWidth="2"
            strokeDasharray={perimetreAnneau}
            strokeDashoffset={perimetreAnneau}
          />
        </svg>
        <span className="font-display text-[10px] uppercase tracking-[0.08em] text-or tabular-nums font-medium">
          {etageCourant.code}
        </span>
      </button>
    </aside>
  );
}

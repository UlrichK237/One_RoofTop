import { useEffect, useState } from 'react';
import { ETAGES_NAVIGATION, type Langue } from '../data/textesSite';

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
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: 0.01,
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [afficherSoirees]);

  const indexActif = Math.max(
    0,
    etages.findIndex((e) => e.id === etageActif),
  );
  const etageCourant = etages[indexActif] ?? etages[0];

  return (
    <aside
      aria-label={langue === 'fr' ? 'Indicateur d’étage' : 'Floor indicator'}
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3 no-print"
    >
      <div className="bg-surface/95 border border-bronze px-3 py-4 flex flex-col items-end gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-or tabular-nums whitespace-nowrap">
          {etageCourant.code}
        </div>
        <ol className="relative flex flex-col items-end gap-3 pr-3 border-r border-bronze">
          {[...etages].reverse().map((etage) => {
            const actif = etage.id === etageActif;
            const libelle = langue === 'fr' ? etage.labelFr : etage.labelEn;
            return (
              <li key={etage.id} className="relative flex items-center gap-2">
                <a
                  href={`#${etage.id}`}
                  className={`focus-marque text-[11px] uppercase tracking-[0.12em] whitespace-nowrap transition-colors ${
                    actif ? 'text-or font-medium' : 'text-ivoire-doux hover:text-ivoire'
                  }`}
                >
                  <span className="mr-1.5 tabular-nums">{etage.code}</span>
                  <span className="hidden xl:inline">{libelle}</span>
                </a>
                <span
                  aria-hidden="true"
                  className={`absolute -right-[16px] w-2 h-2 border transition-colors ${
                    actif ? 'bg-or border-or' : 'bg-nuit border-bronze'
                  }`}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

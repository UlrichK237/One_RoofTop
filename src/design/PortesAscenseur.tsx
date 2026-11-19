import { useEffect, useState } from 'react';
import { useReveal } from './motion/useReveal';

/**
 * Scène 3 : Portes d'ascenseur inter-étages.
 * Utilise CSS animation-timeline: view() avec repli IntersectionObserver.
 */
export function PortesAscenseur({ etageCode }: { etageCode: string }) {
  const { ref, visible } = useReveal(false);
  const [supporteViewTimeline, setSupporteViewTimeline] = useState(false);

  useEffect(() => {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
      setSupporteViewTimeline(CSS.supports('animation-timeline: view()'));
    }
  }, []);

  const classeEtat = supporteViewTimeline
    ? 'portes-vue-timeline'
    : visible
      ? 'portes-ouvertes'
      : 'portes-fermees';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`max-w-6xl mx-auto px-4 sm:px-6 my-2 no-print ${classeEtat}`}
    >
      <div className="relative h-[38vh] min-h-[210px] max-h-[320px] border-x border-bronze bg-surface/40 overflow-hidden flex items-center justify-center">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 border border-bronze bg-nuit px-3 py-1">
          <span className="w-1.5 h-1.5 bg-or inline-block voyant-porte" />
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-or tabular-nums">
            {etageCode}
          </span>
        </div>

        <svg
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
          className="w-full h-full"
          fill="none"
        >
          <line x1="0" y1="12" x2="800" y2="12" stroke="#96650B" strokeWidth="1" />
          <line x1="0" y1="228" x2="800" y2="228" stroke="#96650B" strokeWidth="1" />

          <g className="porte-gauche">
            <rect x="0" y="14" width="398" height="212" fill="#231D1F" stroke="#96650B" strokeWidth="1" />
            <line x1="132" y1="14" x2="132" y2="226" stroke="#96650B" strokeWidth="0.8" />
            <line x1="266" y1="14" x2="266" y2="226" stroke="#96650B" strokeWidth="0.8" />
            <line x1="396" y1="14" x2="396" y2="226" stroke="#CA8C3A" strokeWidth="1.5" />
          </g>

          <g className="porte-droite">
            <rect x="402" y="14" width="398" height="212" fill="#231D1F" stroke="#96650B" strokeWidth="1" />
            <line x1="534" y1="14" x2="534" y2="226" stroke="#96650B" strokeWidth="0.8" />
            <line x1="668" y1="14" x2="668" y2="226" stroke="#96650B" strokeWidth="0.8" />
            <line x1="404" y1="14" x2="404" y2="226" stroke="#CA8C3A" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

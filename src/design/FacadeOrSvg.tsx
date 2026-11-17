import { useEffect, useRef, useState, type ReactNode } from 'react';

export function useEstVisible(seuil = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: seuil },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [seuil]);

  return { ref, visible };
}

export function EtageReveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useEstVisible(0.08);
  return (
    <div
      ref={ref}
      className={`etage-reveal ${visible ? 'est-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/**
 * Façade architecturale inspirée des cloisons orthogonales du logo,
 * tracée en filets d'or et de bronze au défilement.
 */
export function FacadeOrSvg({ variante = 'immeuble' }: { variante?: 'immeuble' | 'separateur' }) {
  const { ref, visible } = useEstVisible(0.15);
  const clsTrait = `trait-facade ${visible ? 'est-visible' : ''}`;

  if (variante === 'separateur') {
    return (
      <div ref={ref} className="w-full overflow-hidden py-3 no-print" aria-hidden="true">
        <svg
          viewBox="0 0 960 44"
          className="w-full h-11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="22" x2="360" y2="22" stroke="#96650B" strokeWidth="1" className={clsTrait} />
          <rect x="376" y="8" width="64" height="28" stroke="#96650B" strokeWidth="1" className={clsTrait} />
          <line x1="408" y1="8" x2="408" y2="36" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
          <rect x="452" y="4" width="56" height="36" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
          <rect x="520" y="8" width="64" height="28" stroke="#96650B" strokeWidth="1" className={clsTrait} />
          <line x1="600" y1="22" x2="960" y2="22" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full" aria-hidden="true">
      <svg
        viewBox="0 0 440 360"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Charpente d'élévation en étages */}
        <rect x="16" y="16" width="408" height="328" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        {/* Cloisons verticales façon façade du logo */}
        <line x1="110" y1="16" x2="110" y2="344" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="220" y1="16" x2="220" y2="344" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
        <line x1="330" y1="16" x2="330" y2="344" stroke="#96650B" strokeWidth="1" className={clsTrait} />

        {/* Niveaux horizontaux (RDC au Toit) */}
        <line x1="16" y1="278" x2="424" y2="278" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="212" x2="424" y2="212" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="146" x2="424" y2="146" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="80" x2="424" y2="80" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />

        {/* Pan incliné de toiture rappelant l'angle du logo */}
        <polyline
          points="16,120 110,48 424,48"
          stroke="#CA8C3A"
          strokeWidth="1.25"
          className={clsTrait}
        />

        {/* Silhouette géométrisée du jacaranda sur la terrasse supérieure */}
        <line x1="275" y1="212" x2="275" y2="112" stroke="#CA8C3A" strokeWidth="1.2" className={clsTrait} />
        <polyline points="275,148 242,118 228,104" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
        <polyline points="275,136 312,108 326,96" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
        <polyline points="275,112 260,88" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
        <polyline points="275,112 294,88" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
      </svg>
    </div>
  );
}

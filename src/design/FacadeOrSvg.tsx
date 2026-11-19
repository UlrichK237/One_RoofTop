import type { ReactNode } from 'react';
import { CONFIRME } from '../data/confirmations';
import { useReveal } from './motion/useReveal';

export function EtageReveal({
  children,
  className = '',
  immediat = false,
}: {
  children: ReactNode;
  className?: string;
  immediat?: boolean;
}) {
  const { ref, visible } = useReveal(immediat);
  return (
    <div
      ref={ref}
      data-reveal=""
      className={`${visible ? 'est-visible' : ''} ${className}`.trim()}
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
  const { ref, visible } = useReveal(false);
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
        viewBox="0 0 440 300"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="16" y="16" width="408" height="268" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="110" y1="16" x2="110" y2="284" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="220" y1="16" x2="220" y2="284" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
        <line x1="330" y1="16" x2="330" y2="284" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="228" x2="424" y2="228" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="172" x2="424" y2="172" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="116" x2="424" y2="116" stroke="#96650B" strokeWidth="1" className={clsTrait} />
        <line x1="16" y1="68" x2="424" y2="68" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
        <polyline
          points="16,102 110,44 424,44"
          stroke="#CA8C3A"
          strokeWidth="1.25"
          className={clsTrait}
        />
        {CONFIRME.jacaranda && (
          <>
            <line x1="275" y1="172" x2="275" y2="92" stroke="#CA8C3A" strokeWidth="1.2" className={clsTrait} />
            <polyline points="275,126 248,100" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
            <polyline points="275,118 304,96" stroke="#CA8C3A" strokeWidth="1" className={clsTrait} />
          </>
        )}
      </svg>
    </div>
  );
}

import { useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';

function appliquerMagnet(
  el: HTMLElement | null,
  clientX: number,
  clientY: number,
) {
  if (!el || typeof window === 'undefined') return;
  if (document.documentElement.dataset.motion !== 'full') return;
  if (!window.matchMedia?.('(pointer: fine)').matches) return;

  const rect = el.getBoundingClientRect();
  const dx = ((clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 5;
  const dy = ((clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 5;
  const cx = Math.max(-5, Math.min(5, dx));
  const cy = Math.max(-5, Math.min(5, dy));
  el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
}

function reinitialiserMagnet(el: HTMLElement | null) {
  if (!el) return;
  el.style.transform = '';
}

export function LienMagnetique({
  children,
  className = '',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  return (
    <a
      ref={ref}
      {...props}
      onPointerMove={(e) => {
        appliquerMagnet(ref.current, e.clientX, e.clientY);
        props.onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        reinitialiserMagnet(ref.current);
        props.onPointerLeave?.(e);
      }}
      className={`cta-magnetique ${className}`.trim()}
    >
      {children}
    </a>
  );
}

export function BoutonMagnetique({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  return (
    <button
      ref={ref}
      {...props}
      onPointerMove={(e) => {
        appliquerMagnet(ref.current, e.clientX, e.clientY);
        props.onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        reinitialiserMagnet(ref.current);
        props.onPointerLeave?.(e);
      }}
      className={`cta-magnetique ${className}`.trim()}
    >
      {children}
    </button>
  );
}

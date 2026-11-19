import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function ModalFrame({
  ouvert,
  onFermer,
  titreId,
  titre,
  variante = 'centre',
  labelFermer = 'Fermer',
  children,
}: {
  ouvert: boolean;
  onFermer: () => void;
  titreId: string;
  titre: string;
  variante?: 'centre' | 'tiroir';
  labelFermer?: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const precedentFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ouvert) return;

    precedentFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.classList.add('overflow-hidden');

    const focusablesSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const container = containerRef.current;
    const focusTimer = window.setTimeout(() => {
      if (!container) return;
      const premier = container.querySelector<HTMLElement>(focusablesSelector);
      premier?.focus();
    }, 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onFermer();
        return;
      }

      if (e.key === 'Tab' && container) {
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(focusablesSelector),
        );
        if (focusables.length === 0) return;

        const premier = focusables[0];
        const dernier = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === premier) {
          e.preventDefault();
          dernier.focus();
        } else if (!e.shiftKey && document.activeElement === dernier) {
          e.preventDefault();
          premier.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('overflow-hidden');
      precedentFocusRef.current?.focus();
    };
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/75 no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFermer();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        className={
          variante === 'tiroir'
            ? 'fenetre-modale-panneau w-full max-w-lg bg-surface border-l border-bronze text-ivoire flex flex-col h-full overflow-hidden'
            : 'fenetre-modale-panneau m-auto w-[calc(100%-2rem)] max-w-xl max-h-[90vh] bg-surface border border-bronze text-ivoire flex flex-col overflow-hidden'
        }
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-bronze">
          <h2
            id={titreId}
            className="font-display text-sm sm:text-base uppercase tracking-[0.14em] text-ivoire"
          >
            {titre}
          </h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label={labelFermer}
            className="focus-marque p-2 text-ivoire-doux hover:text-ivoire border border-bronze cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

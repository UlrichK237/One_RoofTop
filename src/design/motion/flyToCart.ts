/**
 * Animation Web Animations API d'un point d'or qui suit une courbe vers le panier.
 * Zéro bibliothèque externe, respecte html[data-motion="full"] et prefers-reduced-motion.
 */
export function animerPointVersPanier(sourceEl: HTMLElement | null): void {
  if (typeof window === 'undefined' || !sourceEl) return;
  if (document.documentElement.dataset.motion !== 'full') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const cible = document.getElementById('panier-bouton');
  if (!cible) return;

  const rSrc = sourceEl.getBoundingClientRect();
  const rDst = cible.getBoundingClientRect();

  const sx = rSrc.left + rSrc.width / 2;
  const sy = rSrc.top + rSrc.height / 2;
  const dx = rDst.left + rDst.width / 2 - sx;
  const dy = rDst.top + rDst.height / 2 - sy;

  const point = document.createElement('span');
  point.setAttribute('aria-hidden', 'true');
  point.className = 'fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-or pointer-events-none z-50';
  point.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
  document.body.appendChild(point);

  const anim = point.animate(
    [
      { transform: `translate3d(${sx}px, ${sy}px, 0) scale(1)`, opacity: 0.95 },
      {
        transform: `translate3d(${sx + dx * 0.45}px, ${sy + dy * 0.25 - 48}px, 0) scale(1.15)`,
        opacity: 0.9,
      },
      { transform: `translate3d(${sx + dx}px, ${sy + dy}px, 0) scale(0.4)`, opacity: 0 },
    ],
    {
      duration: 520,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  );

  anim.onfinish = () => {
    point.remove();
  };

  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(10);
    } catch {
      // Vibration ignorée si non autorisée
    }
  }
}

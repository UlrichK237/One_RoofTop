import { useEffect, useRef, useState } from 'react';

type ActiveCallback = (actif: boolean) => void;

const activeCallbacks = new WeakMap<Element, ActiveCallback>();
let activeObserver: IntersectionObserver | null = null;
let activeCount = 0;

function getActiveObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!activeObserver) {
    activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = activeCallbacks.get(entry.target);
          if (cb) cb(entry.isIntersecting);
        }
      },
      { threshold: 0.02, rootMargin: '80px 0px' },
    );
  }
  return activeObserver;
}

/**
 * Indique si l'élément est visible à l'écran et si l'onglet est actif,
 * afin de mettre en pause toute boucle ambiante hors écran.
 */
export function useActiveWhenVisible<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [enVue, setEnVue] = useState(false);
  const [ongletActif, setOngletActif] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden,
  );

  useEffect(() => {
    const onVis = () => setOngletActif(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = getActiveObserver();
    if (!obs) {
      setEnVue(true);
      return;
    }

    activeCallbacks.set(el, setEnVue);
    activeCount += 1;
    obs.observe(el);

    return () => {
      if (activeCallbacks.has(el)) {
        activeCallbacks.delete(el);
        activeCount = Math.max(0, activeCount - 1);
      }
      obs.unobserve(el);
      if (activeCount === 0 && activeObserver) {
        activeObserver.disconnect();
        activeObserver = null;
      }
    };
  }, []);

  return { ref, actif: enVue && ongletActif };
}

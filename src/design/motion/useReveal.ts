import { useEffect, useRef, useState } from 'react';

type RevealCallback = (visible: boolean) => void;

const callbacks = new WeakMap<Element, RevealCallback>();
let sharedObserver: IntersectionObserver | null = null;
let countObserved = 0;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) cb(true);
            sharedObserver?.unobserve(entry.target);
            callbacks.delete(entry.target);
            countObserved = Math.max(0, countObserved - 1);
          }
        }
        if (countObserved === 0 && sharedObserver) {
          sharedObserver.disconnect();
          sharedObserver = null;
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );
  }
  return sharedObserver;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(immediat = false) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(immediat);

  useEffect(() => {
    if (immediat) {
      setVisible(true);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      (document.documentElement.dataset.motion === 'off' ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    ) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = getSharedObserver();
    if (!obs) {
      setVisible(true);
      return;
    }

    callbacks.set(el, setVisible);
    countObserved += 1;
    obs.observe(el);

    return () => {
      if (callbacks.has(el)) {
        callbacks.delete(el);
        countObserved = Math.max(0, countObserved - 1);
      }
      obs.unobserve(el);
      if (countObserved === 0 && sharedObserver) {
        sharedObserver.disconnect();
        sharedObserver = null;
      }
    };
  }, [immediat]);

  return { ref, visible };
}

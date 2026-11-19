import { useEffect, useRef, useState } from 'react';

type ScrollSubscriber = () => void;

const subscribers = new Set<ScrollSubscriber>();
let rafId: number | null = null;
let lastFrame = 0;
let listenersAttached = false;

function notifyAll() {
  for (const fn of subscribers) fn();
}

function tick(now: number) {
  rafId = null;
  if (typeof document !== 'undefined' && document.hidden) return;
  if (now - lastFrame < 33) {
    rafId = window.requestAnimationFrame(tick);
    return;
  }
  lastFrame = now;
  notifyAll();
}

function onScrollOrResize() {
  if (typeof document !== 'undefined' && document.hidden) return;
  if (document.documentElement.dataset.motion !== 'full') return;
  if (rafId === null) {
    rafId = window.requestAnimationFrame(tick);
  }
}

function attachGlobal() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
}

function detachGlobal() {
  if (!listenersAttached || typeof window === 'undefined') return;
  listenersAttached = false;
  window.removeEventListener('scroll', onScrollOrResize);
  window.removeEventListener('resize', onScrollOrResize);
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Fournit la progression globale du défilement (0..1) et la progression locale
 * d'une section via rAF limité à ~30 i/s, uniquement quand le mode est 'full'.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const val = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setProgress(val);
      document.documentElement.style.setProperty('--scroll-progress', val.toFixed(4));
    };

    update();
    subscribers.add(update);
    attachGlobal();

    return () => {
      subscribers.delete(update);
      if (subscribers.size === 0) detachGlobal();
    };
  }, []);

  return progress;
}

export function useSectionProgress<T extends HTMLElement = HTMLElement>(cssVar = '--section-progress') {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      if (document.documentElement.dataset.motion !== 'full') {
        el.style.setProperty(cssVar, '1');
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = vh + rect.height;
      const raw = total > 0 ? (vh - rect.top) / total : 0;
      const clamped = Math.min(1, Math.max(0, raw));
      el.style.setProperty(cssVar, clamped.toFixed(4));
    };

    update();
    subscribers.add(update);
    attachGlobal();

    return () => {
      subscribers.delete(update);
      if (subscribers.size === 0) detachGlobal();
    };
  }, [cssVar]);

  return ref;
}

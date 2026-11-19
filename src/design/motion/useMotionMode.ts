import { useEffect, useState } from 'react';

export type MotionMode = 'full' | 'reduced' | 'off';

function lirePrefereReduit(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function appliquerEtatRacine(mode: MotionMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.add('js-motion');
  document.documentElement.dataset.motion = mode;
}

export function useMotionMode(): {
  mode: MotionMode;
  setMode: (mode: MotionMode) => void;
  estFull: boolean;
  estReduced: boolean;
  estOff: boolean;
} {
  const [mode, setModeState] = useState<MotionMode>(() =>
    lirePrefereReduit() ? 'reduced' : 'full',
  );

  useEffect(() => {
    appliquerEtatRacine(mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      setModeState(e.matches ? 'reduced' : 'full');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncVisibility = () => {
      if (document.hidden) {
        document.documentElement.dataset.tabHidden = 'true';
      } else {
        delete document.documentElement.dataset.tabHidden;
      }
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  const setMode = (nouveau: MotionMode) => {
    setModeState(nouveau);
    appliquerEtatRacine(nouveau);
  };

  return {
    mode,
    setMode,
    estFull: mode === 'full',
    estReduced: mode === 'reduced',
    estOff: mode === 'off',
  };
}

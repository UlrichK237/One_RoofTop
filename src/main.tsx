import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/jost/600.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import './index.css';
import App from './App.tsx';

if (typeof document !== 'undefined') {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-motion');
  document.documentElement.dataset.motion = prefersReduced ? 'reduced' : 'full';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

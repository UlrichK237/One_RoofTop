import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/jost/latin-400.css';
import '@fontsource/jost/latin-500.css';
import '@fontsource/jost/latin-600.css';
import '@fontsource/jost/latin-ext-400.css';
import '@fontsource/jost/latin-ext-500.css';
import '@fontsource/jost/latin-ext-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-400.css';
import '@fontsource/cormorant-garamond/latin-ext-400-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-600-italic.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

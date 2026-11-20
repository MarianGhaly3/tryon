import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './state/AppState';
// The ÉCLAT design, as supplied. tryon.css only adds what the camera needs.
import './styles/fonts.css';
import './styles/styles.css';
import './styles/tryon.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);

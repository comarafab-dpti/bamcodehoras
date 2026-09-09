import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { InstitutionProvider } from '../shared/contexts/InstitutionContext';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Administração COMARA">
      <InstitutionProvider>
        <App />
      </InstitutionProvider>
    </ErrorBoundary>
  </StrictMode>,
);
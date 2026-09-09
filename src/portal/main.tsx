import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PortalApp from './App';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { InstitutionProvider } from '../shared/contexts/InstitutionContext';
import '../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Portal do Colaborador COMARA">
      <InstitutionProvider>
        <PortalApp />
      </InstitutionProvider>
    </ErrorBoundary>
  </StrictMode>,
);
import './index.css';

const pathname = window.location.pathname.toLowerCase();

function handleError(error: unknown) {
  console.error('[COMARA] Falha ao carregar o entry point:', error);
  const root = document.getElementById('root');
  if (root) {
    root.textContent = 'Não foi possível carregar esta interface. Tente novamente.';
  }
}

if (pathname === '/' || pathname === '/index.html') {
  window.location.replace('/portal' + window.location.search + window.location.hash);
} else {
  import('./portal/main').catch(handleError);
}

import './index.css';

const hostname = window.location.hostname.toLowerCase();
const isAdmin = window.location.pathname.startsWith('/admin') || hostname === 'admbancodehoras.ai.studio';
const entry = isAdmin ? import('./admin/main') : import('./portal/main');

entry.catch((error) => {
  console.error('[COMARA] Falha ao carregar o entry point:', error);
  document.getElementById('root')!.textContent = 'Não foi possível carregar esta interface. Tente novamente.';
});



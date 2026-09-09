import './index.css';

const hostname = window.location.hostname.toLowerCase();
const pathname = window.location.pathname.toLowerCase();
const isAdmin = hostname === 'admbancodehoras.ai.studio' || pathname.startsWith('/admin');

function handleError(error: unknown) {
  console.error('[COMARA] Falha ao carregar o entry point:', error);
  const root = document.getElementById('root');
  if (root) {
    root.textContent = 'Não foi possível carregar esta interface. Tente novamente.';
  }
}

if (isAdmin) {
  if (!pathname.startsWith('/admin') && !pathname.endsWith('admin.html')) {
    window.location.replace('/admin' + window.location.search + window.location.hash);
  } else {
    import('./admin/main').catch(handleError);
  }
} else {
  if (pathname === '/' || pathname === '/index.html') {
    window.location.replace('/portal' + window.location.search + window.location.hash);
  } else {
    import('./portal/main').catch(handleError);
  }
}



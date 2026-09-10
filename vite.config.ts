import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function routeHtmlPlugin(): Plugin {
  return {
    name: 'comara-html-routing',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const fullUrl = req.url || '';
        const [url, query] = fullUrl.split('?');
        const queryStr = query ? `?${query}` : '';

        if (url === '/portal' || url === '/portal/') {
          req.url = `/portal.html${queryStr}`;
        } else if (url === '/' || url === '/index.html') {
          res.writeHead(302, { Location: `/portal${queryStr}` });
          res.end();
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const fullUrl = req.url || '';
        const [url, query] = fullUrl.split('?');
        const queryStr = query ? `?${query}` : '';

        if (url === '/portal' || url === '/portal/') {
          req.url = `/portal.html${queryStr}`;
        } else if (url === '/' || url === '/index.html') {
          res.writeHead(302, { Location: `/portal${queryStr}` });
          res.end();
          return;
        }
        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const portalHtml = path.resolve(distDir, 'portal.html');
      if (fs.existsSync(portalHtml)) {
        const portalDir = path.resolve(distDir, 'portal');
        if (!fs.existsSync(portalDir)) fs.mkdirSync(portalDir, { recursive: true });
        fs.copyFileSync(portalHtml, path.resolve(portalDir, 'index.html'));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), routeHtmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html'),
          portal: path.resolve(__dirname, 'portal.html'),
        },
      },
    },
  };
});

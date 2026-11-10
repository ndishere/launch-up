import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/v1/governance': { target: 'http://localhost:8004', changeOrigin: true },
        '/api/v1/gates': { target: 'http://localhost:8004', changeOrigin: true },
        '/api/v1/leads': { target: 'http://localhost:8005', changeOrigin: true },
        '/api/v1/intake': { target: 'http://localhost:8006', changeOrigin: true },
        '/api/v1/web': { target: 'http://localhost:8007', changeOrigin: true },
        '/api/v1/mobile': { target: 'http://localhost:8008', changeOrigin: true },
        '/api/v1/backend': { target: 'http://localhost:8009', changeOrigin: true },
        '/api/v1/privacy': { target: 'http://localhost:8009', changeOrigin: true },
        '/api/v1/qa': { target: 'http://localhost:8010', changeOrigin: true },
        '/api/v1/marketing': { target: 'http://localhost:8011', changeOrigin: true },
        '/api/v1/whatsapp': { target: 'http://localhost:8012', changeOrigin: true },
        '/api/v1/sre': { target: 'http://localhost:8013', changeOrigin: true },
      },
    },
  };
});

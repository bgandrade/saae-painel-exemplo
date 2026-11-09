import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Apenas a maquete demonstrativa e publicada. O projeto tecnico permanece em
 * docs/proposta-tecnica.md e nao faz parte do build.
 *
 * O preview do Cloudflare Pages serve na raiz de um subdominio proprio, entao
 * `base: '/'` e seguro.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    // O motor de simulacao e as bibliotecas de mapa mudam em ritmos diferentes:
    // separa-los evita reenviar 150 kB de Leaflet a cada ajuste de tela.
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['leaflet'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: { port: 5173, open: false },
});

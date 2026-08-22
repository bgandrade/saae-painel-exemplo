import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Sem base absoluta: o painel roda tanto em raiz de dominio quanto em
 * subdiretorio de preview do Cloudflare Pages.
 */
export default defineConfig({
  plugins: [react()],
  base: './',
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

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * O site publica tres paginas num unico deploy:
 *
 *   /          capa
 *   /projeto/  a proposta tecnica
 *   /painel/   a maquete
 *
 * As tres sao entradas do build. Capa e documento nao importam modulo nenhum:
 * sao HTML com estilo embutido, e os recursos comuns (estilo.css, fontes,
 * imagens) vivem em public/ e sao referenciados por caminho absoluto.
 *
 * Elas precisam ser entradas, e nao arquivos em public/, porque o servidor de
 * desenvolvimento resolve indice de diretorio a partir da raiz do projeto: um
 * index.html dentro de public/ e servido no build, mas da 404 no `pnpm dev`.
 *
 * `base: '/'` em vez de relativo: com a shell em /painel/index.html, um caminho
 * relativo faria os assets serem procurados em /painel/assets/. O preview do
 * Cloudflare Pages serve em raiz de subdominio proprio, entao '/' e seguro.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    // O motor de simulacao e as bibliotecas de mapa mudam em ritmos diferentes:
    // separa-los evita reenviar 150 kB de Leaflet a cada ajuste de tela.
    rollupOptions: {
      input: {
        capa: 'index.html',
        projeto: 'projeto/index.html',
        painel: 'painel/index.html',
      },
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

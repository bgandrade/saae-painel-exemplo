/**
 * Ambiente de navegador mínimo para renderizar as telas fora do browser.
 *
 * Existe porque a verificação precisa rodar em CI e em máquina sem as
 * bibliotecas de sistema do Chromium. Não valida layout — valida que o
 * JavaScript das telas roda de ponta a ponta, que é onde moram os erros que
 * quebram uma apresentação.
 */

import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

export function prepararDOM() {
  const dom = new JSDOM(
    '<!doctype html><html data-theme="dark"><body><div id="raiz"></div></body></html>',
    { url: 'http://localhost:5173/#/visao-geral', pretendToBeVisual: true }
  );
  const globais = [
    'window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'SVGElement',
    'CustomEvent', 'Event', 'MouseEvent', 'getComputedStyle', 'requestAnimationFrame',
    'cancelAnimationFrame', 'localStorage', 'location', 'history', 'DOMParser', 'Image',
    'XMLHttpRequest',
  ];
  for (const k of globais) {
    // Alguns globais do Node (navigator) só têm getter: define por propriedade.
    try { globalThis[k] = dom.window[k]; }
    catch { Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true }); }
  }
  globalThis.innerWidth = 1680;
  globalThis.innerHeight = 1000;
  globalThis.addEventListener = dom.window.addEventListener.bind(dom.window);
  globalThis.removeEventListener = dom.window.removeEventListener.bind(dom.window);
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  dom.window.ResizeObserver = globalThis.ResizeObserver;
  return dom;
}

export async function prepararRender(raiz = process.cwd()) {
  prepararDOM();
  // react e react-dom vêm do Node direto: passar pelo ssrLoadModule criaria uma
  // segunda instância do React e os hooks quebrariam por dispatcher nulo.
  const { renderToString } = await import('react-dom/server');
  const React = (await import('react')).default;
  const vite = await createServer({
    root: raiz, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error',
  });
  const { ProvedorSimulacao } = await vite.ssrLoadModule('/src/hooks/useSimulacao.jsx');
  const { ProvedorUI } = await vite.ssrLoadModule('/src/hooks/useUI.jsx');

  const render = async (caminho, props) => {
    const mod = await vite.ssrLoadModule(caminho);
    return renderToString(
      React.createElement(ProvedorSimulacao, null,
        React.createElement(ProvedorUI, null, React.createElement(mod.default, props)))
    );
  };
  return { render, fechar: () => vite.close() };
}

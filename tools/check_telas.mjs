#!/usr/bin/env node
/**
 * Verifica que as oito telas renderizam sem erro e que cada uma contém o que
 * promete.
 *
 *   node tools/check_telas.mjs
 *
 * Não valida layout — isso exige olho humano ou navegador. Valida que o
 * JavaScript roda de ponta a ponta e que o conteúdo esperado está lá, que é
 * onde moram os erros capazes de estragar uma apresentação.
 */

import { prepararRender } from './ambiente.mjs';

const TELAS = [
  ['Visão Geral', '/src/views/VisaoGeral.jsx', null,
    ['mapa-wrap', 'Sinóptico', 'Satélite', 'Ruas', 'Cenários de demonstração',
     'Rompimento da adutora', 'mapa-legenda', 'Vazão produzida']],
  ['Sinóptico', '/src/views/Sinoptico.jsx', null,
    ['CAP-BQT', 'EEA-BQT', 'RES-BQT', 'EEA-JPB', 'Câmara de carga', 'sinoptico-tubos', 'fluxo']],
  ['Unidades', '/src/views/Unidades.jsx', null,
    ['EBQ-CMB-01', 'EBQ-CMB-02', 'EBQ-CMB-03', 'EBQ-CMB-04', 'EBQ-CMB-05',
     'Sequência de rodízio', 'LÍDER', 'Recalque', 'Sucção']],
  ['Automação', '/src/views/Automacao.jsx', null,
    ['Malha de controle', 'type="range"', 'nível(RES-BQT)', 'BLOQUEAR partida', 'afogamento',
     'escalonamento', 'Trilha de comandos', 'AUTOMÁTICO', 'FORA DE SERVIÇO', 'D1', 'D4']],
  ['Rede e Pressão', '/src/views/Rede.jsx', null, ['tanque-marca', 'NBR 12218', 'IN049']],
  ['Qualidade', '/src/views/Qualidade.jsx', null,
    ['GM/MS 888/2021', 'Cloro residual livre', 'Fluoreto', 'Turbidez']],
  ['Esgoto e ETEs', '/src/views/Esgoto.jsx', null,
    ['CONAMA', 'tanque-esgoto', 'Oxigênio dissolvido', 'extravasamento']],
  ['Relatórios', '/src/views/Relatorios.jsx', null,
    ['IN049', 'IN058', 'IN022', 'IN046', 'kWh/m³', 'EEMUA', 'Exportar CSV', 'Imprimir',
     'cabecalho-relatorio', 'CONAMA']],
  ['Faceplate', '/src/bombas/FaceplateBomba.jsx', { idBomba: 'EBQ-CMB-01' },
    ['AUTOMÁTICO', 'MANUAL', 'PARTIR', 'PARAR', 'Curva H×Q', 'melhor rendimento',
     'Intertravamentos', 'Desequilíbrio', 'ISO 10816-3', 'Horas no rodízio', 'curva-bomba']],
];

const { render, fechar } = await prepararRender();
let falhas = 0;

for (const [nome, caminho, props, esperados] of TELAS) {
  let html;
  try {
    html = await render(caminho, props);
  } catch (e) {
    falhas++;
    console.log(`  ERRO  ${nome.padEnd(16)} ${e.message.split('\n')[0]}`);
    const linha = (e.stack ?? '').split('\n').find((l) => l.includes('/src/'));
    if (linha) console.log(`        ${linha.trim().slice(0, 150)}`);
    continue;
  }
  const faltando = esperados.filter((e) => !html.includes(e));
  if (faltando.length) {
    falhas++;
    console.log(`  FALHA ${nome.padEnd(16)} faltou: ${faltando.join(', ')}`);
  } else {
    console.log(`  ok    ${nome.padEnd(16)} ${String(html.length).padStart(6)} bytes`);
  }
}

await fechar();
console.log(falhas ? `\n${falhas} tela(s) com problema` : '\nAs 8 telas e o faceplate renderizam com o conteúdo esperado.');
process.exit(falhas ? 1 : 0);

#!/usr/bin/env node
/** Verifica os contratos dos resumos operacionais sem depender do Leaflet. */

import assert from 'node:assert/strict';

import { UNIDADES, LINHAS } from '../src/data/topologia.js';
import { Simulacao } from '../src/engine/sim.js';
import {
  htmlResumoOperacional,
  resumoTrecho,
  resumoUnidade,
} from '../src/mapa/resumoOperacional.js';

const sim = new Simulacao({ velocidade: 1 });

for (const tipo of ['captacao', 'reservatorio', 'elevatoria', 'ete', 'eee']) {
  const unidade = UNIDADES.find((u) => u.tipo === tipo);
  assert.ok(unidade, `há uma unidade do tipo ${tipo}`);
  const resumo = resumoUnidade(unidade, sim, []);
  assert.equal(resumo.metricas.length, 3, `${tipo} tem exatamente três métricas`);
  assert.match(htmlResumoOperacional(resumo), /mapa-overlay-operacional/);
}

for (const sistema of ['agua', 'esgoto']) {
  const linha = LINHAS.find((l) => l.sistema === sistema);
  const resumo = resumoTrecho(linha, sim, []);
  assert.equal(resumo.metricas.length, 3, `trecho de ${sistema} tem exatamente três métricas`);
  assert.match(resumo.rodape, /estimad/i, `trecho de ${sistema} declara a estimativa`);
}

const elevatoria = UNIDADES.find((u) => u.id === 'eea-banqueta');
sim.bombasPorUnidade.get(elevatoria.id)[0].modo = 'manual';
assert.equal(
  resumoUnidade(elevatoria, sim, []).estado,
  'atencao',
  'modo manual aparece como atenção',
);

const eee = UNIDADES.find((u) => u.id === 'eee-anil');
sim.pocos.get(eee.id).extravasando = true;
assert.equal(resumoUnidade(eee, sim, []).estado, 'critico', 'extravasamento aparece como crítico');

const ete = UNIDADES.find((u) => u.tipo === 'ete');
sim.etes.get(ete.id).conforme = false;
const resumoEte = resumoUnidade(ete, sim, []);
assert.equal(resumoEte.estado, 'critico', 'efluente não conforme aparece como crítico');
assert.equal(resumoEte.metricas[2].rotulo, 'DBO efluente', 'desvio da ETE prioriza a DBO');

const cenario = sim.cenarios.get('rompimento');
cenario.intensidade = 1;
const adutora = LINHAS.find((l) => l.id === 'ad-jpb-centro');
assert.equal(resumoTrecho(adutora, sim, []).estado, 'critico', 'rompimento aparece como crítico');

const alarme = {
  chave: 'bomba-falha/EBQ-CMB-01',
  desde: sim.tempo,
  info: {
    severidade: 'critico',
    titulo: 'Conjunto desarmado',
    origem: 'EBQ-CMB-01 · EEA-BQT',
    detalhe: () => 'Proteção atuada',
  },
};
const resumoAlarme = resumoUnidade(elevatoria, sim, [alarme]);
assert.equal(resumoAlarme.status, 'Conjunto desarmado', 'o alarme mais relevante vira o status');
assert.equal(resumoAlarme.alarme, 'Proteção atuada', 'o detalhe do alarme é exibido');

const htmlSeguro = htmlResumoOperacional({
  titulo: '<script>',
  contexto: 'teste',
  estado: 'neutro',
  status: 'normal',
  metricas: [],
});
assert.doesNotMatch(
  htmlSeguro,
  /<script>/,
  'o conteúdo textual é escapado antes de entrar no mapa',
);

console.log('✓ resumos operacionais do mapa');

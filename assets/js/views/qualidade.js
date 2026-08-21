/**
 * Qualidade da água.
 *
 * A tela separa dois momentos que costumam ser confundidos: o parâmetro na
 * SAÍDA da unidade de produção (onde o cloro é dosado) e o parâmetro no PONTO
 * DE REDE (onde a população consome, depois de horas de residência na
 * tubulação). O segundo é sempre menor que o primeiro, e é o segundo que a
 * Portaria GM/MS 888/2021 cobra.
 */

import { el, limpar, num, card, chip, kpi, faixaNormativa, icone } from '../ui.js';
import { GraficoLinha, legenda, CORES_SERIE } from '../charts.js';
import { UNIDADES, SETORES, LIMITES } from '../../data/topologia.js';

const st = {};

const PARAMS = [
  { chave: 'cloroMgL', nome: 'Cloro residual livre', lim: LIMITES.cloroLivre, unidade: 'mg/L', casas: 2 },
  { chave: 'ph', nome: 'pH', lim: LIMITES.ph, unidade: '', casas: 2 },
  { chave: 'turbidezUT', nome: 'Turbidez', lim: LIMITES.turbidez, unidade: 'uT', casas: 2 },
  { chave: 'fluoretoMgL', nome: 'Fluoreto', lim: LIMITES.fluoreto, unidade: 'mg/L', casas: 2 },
];

function montar(ctx) {
  st.kpis = el('div', { class: 'kpis c12' });
  st.cards = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(268px,1fr));gap:var(--e4)' });
  st.grCloro = new GraficoLinha({
    altura: 230, unidade: 'mg/L', casas: 2, zero: true,
    faixa: { min: LIMITES.cloroLivre.min, max: LIMITES.cloroLivre.max },
    limites: [LIMITES.cloroLivre.min],
  });
  st.grTurbidez = new GraficoLinha({ altura: 200, unidade: 'uT', casas: 2, zero: true });
  st.grPh = new GraficoLinha({
    altura: 200, casas: 2,
    faixa: { min: LIMITES.ph.min, max: LIMITES.ph.max },
  });
  st.tabela = el('tbody');

  return el('div', { class: 'grid' }, [
    st.kpis,
    el('div', { class: 'c5' }, [
      card({
        titulo: 'Saída das unidades de produção',
        meta: el('span', { text: 'Portaria GM/MS nº 888/2021' }),
        corpo: st.cards,
      }),
    ]),
    el('div', { class: 'c7' }, [
      card({
        titulo: 'Cloro residual livre nos pontos de rede — 24 h',
        meta: el('span', { text: 'faixa verde: 0,2 a 2,0 mg/L' }),
        corpo: [st.grCloro.node, legenda(SETORES.map((s, i) => ({ nome: s.nomeCurto ?? s.nome, cor: CORES_SERIE[i] })))],
      }),
    ]),
    el('div', { class: 'c6' }, [
      card({
        titulo: 'Turbidez na saída das unidades — 24 h',
        meta: el('span', { text: `bem abaixo do máximo normativo de ${LIMITES.turbidez.max} uT` }),
        corpo: [st.grTurbidez.node, st.legTurb = el('div')],
      }),
    ]),
    el('div', { class: 'c6' }, [
      card({
        titulo: 'pH na saída das unidades — 24 h',
        meta: el('span', { text: 'faixa verde: 6,0 a 9,0' }),
        corpo: [st.grPh.node, st.legPh = el('div')],
      }),
    ]),
    el('div', { class: 'c12' }, [
      card({
        titulo: 'Pontos de coleta na rede de distribuição',
        meta: el('span', { text: 'valores no ponto de consumo, após tempo de residência' }),
        corpo: el('div', { class: 'rolagem' }, [
          el('table', { class: 'tabela' }, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', { text: 'Setor / ponto de coleta' }),
                el('th', { text: 'Origem' }),
                el('th', { class: 'n', text: 'Residência' }),
                el('th', { class: 'n', text: 'Cloro na saída' }),
                el('th', { class: 'n', text: 'Cloro na rede' }),
                el('th', { class: 'n', text: 'Mín 24 h' }),
                el('th', { text: 'Conformidade' }),
              ]),
            ]),
            st.tabela,
          ]),
        ]),
        padding: false,
      }),
    ]),
  ]);
}

function atualizar({ sim }) {
  const h = sim.hist;
  const producao = [...sim.qualidade.values()];

  /* KPIs de conformidade */
  const naRede = SETORES.map((s) => sim.setores.get(s.id).cloroMgL);
  const conformes = naRede.filter((c) => c >= LIMITES.cloroLivre.min && c <= LIMITES.cloroLivre.max).length;
  // Conformidade das últimas 24 h calculada sobre o histórico real, ponto a ponto.
  let amostras = 0;
  let ok = 0;
  for (const s of SETORES) {
    const { v } = h.serie(`setor/${s.id}/cloro`).janela(1440);
    for (const x of v) { amostras++; if (x >= LIMITES.cloroLivre.min && x <= LIMITES.cloroLivre.max) ok++; }
  }
  const pctConf = amostras ? (ok / amostras) * 100 : 100;

  limpar(st.kpis).append(
    kpi({ rotulo: 'Pontos conformes agora', valor: `${conformes}`, unidade: `de ${SETORES.length}`,
      estado: conformes < SETORES.length ? 'critico' : 'ok', sub: 'cloro residual livre' }),
    kpi({ rotulo: 'Conformidade 24 h', valor: num(pctConf, 1), unidade: '%',
      estado: pctConf < 95 ? 'atencao' : 'ok', sub: `${amostras.toLocaleString('pt-BR')} amostras` }),
    kpi({ rotulo: 'Cloro médio na rede', valor: num(sim.global.cloroMedioMgL, 2), unidade: 'mg/L',
      sub: `faixa ${LIMITES.cloroLivre.min}–${LIMITES.cloroLivre.max}` }),
    kpi({ rotulo: 'Turbidez máxima', valor: num(Math.max(...producao.map((q) => q.turbidezUT)), 2), unidade: 'uT',
      sub: `máximo ${LIMITES.turbidez.max} uT` }),
    kpi({ rotulo: 'pH das unidades', valor: producao.map((q) => num(q.ph, 1)).join(' · '), unidade: '',
      sub: `faixa ${LIMITES.ph.min}–${LIMITES.ph.max}` })
  );

  /* Cartões por unidade de produção */
  limpar(st.cards).append(
    ...producao.map((q) => {
      const foraDeFaixa = PARAMS.filter((p) => q[p.chave] < p.lim.min || q[p.chave] > p.lim.max);
      return el('div', { style: 'border:1px solid var(--borda);border-radius:var(--raio);padding:var(--e3)' }, [
        el('div', { class: 'linha', style: 'margin-bottom:10px' }, [
          el('div', {}, [
            el('b', { text: q.unidade.sigla }),
            el('div', { class: 'mut', style: 'font-size:var(--t-xs)', text: q.unidade.bairro }),
          ]),
          el('span', { class: 'espaco' }),
          chip(foraDeFaixa.length ? 'critico' : 'ok', foraDeFaixa.length ? `${foraDeFaixa.length} fora de faixa` : 'Conforme'),
        ]),
        el('div', { style: 'display:flex;flex-direction:column;gap:11px' },
          PARAMS.map((p) => faixaNormativa({ nome: p.nome, valor: q[p.chave], limite: p.lim, unidade: p.unidade, casas: p.casas }))),
      ]);
    })
  );

  /* Gráfico de cloro na rede */
  st.grCloro.atualizar(
    SETORES.map((s, i) => ({ nome: s.nomeCurto ?? s.nome, cor: CORES_SERIE[i], ...h.serie(`setor/${s.id}/cloro`).janela(1440) }))
  );

  /* Turbidez e pH por unidade de produção */
  const idsProd = [...sim.qualidade.keys()];
  const legProd = idsProd.map((id, i) => ({ nome: sim.qualidade.get(id).unidade.sigla, cor: CORES_SERIE[i] }));
  st.grTurbidez.atualizar(idsProd.map((id, i) => ({ nome: sim.qualidade.get(id).unidade.sigla, cor: CORES_SERIE[i], ...h.serie(`qual/${id}/turbidez`).janela(1440) })));
  st.grPh.atualizar(idsProd.map((id, i) => ({ nome: sim.qualidade.get(id).unidade.sigla, cor: CORES_SERIE[i], ...h.serie(`qual/${id}/ph`).janela(1440) })));
  limpar(st.legTurb).append(legenda(legProd));
  limpar(st.legPh).append(legenda(legProd));

  /* Tabela de pontos de coleta */
  limpar(st.tabela).append(
    ...SETORES.map((s) => {
      const est = sim.setores.get(s.id);
      const fonteId = s.fonteId;
      const fonte = UNIDADES.find((u) => u.id === fonteId);
      const qualFonte = sim.qualidade.get(fonteId) ?? sim.qualidade.get('cap-banqueta');
      const e = h.serie(`setor/${s.id}/cloro`).estat();
      const conforme = est.cloroMgL >= LIMITES.cloroLivre.min && est.cloroMgL <= LIMITES.cloroLivre.max;
      return el('tr', {}, [
        el('td', { class: 'principal', text: s.nome }),
        el('td', { text: s.semTelemetria ? 'Sistema local (sem telemetria)' : (fonte?.sigla ?? '—') }),
        el('td', { class: 'n', text: `${num(s.residenciaH ?? 0, 1)} h` }),
        el('td', { class: 'n', text: s.semTelemetria ? '—' : `${num(qualFonte.cloroMgL, 2)} mg/L` }),
        el('td', { class: 'n principal', style: conforme ? '' : 'color:var(--critico)', text: `${num(est.cloroMgL, 2)} mg/L` }),
        el('td', { class: 'n', text: `${num(e.min, 2)} mg/L` }),
        el('td', {}, [chip(conforme ? 'ok' : 'critico', conforme ? 'Conforme' : 'Não conforme')]),
      ]);
    })
  );
}

export default { id: 'qualidade', nome: 'Qualidade da Água', sistema: 'agua', montar, atualizar };

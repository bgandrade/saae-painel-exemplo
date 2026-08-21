/**
 * Rede, pressão e reservatórios.
 *
 * A pressão aparece por setor e não em média global porque média de pressão
 * esconde exatamente o que interessa: um setor a 8 mca e outro a 40 dão uma
 * média confortável de 24 e ninguém fica sabendo do primeiro.
 */

import { el, limpar, num, card, chip, kpi } from '../ui.js';
import { GraficoLinha, barraEmpilhada, legenda, sparkline, CORES_SERIE } from '../charts.js';
import { SETORES, LIMITES } from '../../data/topologia.js';

const st = {};

/** Cor de fundo da célula pelo estado normativo, com o texto sempre presente. */
function celulaPressao(v) {
  const estado = v < LIMITES.pressao.min ? 'critico' : v < 15 ? 'atencao' : v > LIMITES.pressao.max ? 'atencao' : 'ok';
  const cor = { critico: 'var(--critico)', atencao: 'var(--atencao)', ok: 'var(--ok)' }[estado];
  return el('td', {
    class: 'n principal',
    style: `background:color-mix(in srgb, ${cor} 16%, transparent)`,
    text: num(v, 1),
  });
}

function montar(ctx) {
  st.kpis = el('div', { class: 'kpis c12' });
  st.tabela = el('tbody');
  st.grPressao = new GraficoLinha({ altura: 230, unidade: 'mca', casas: 0, limites: [LIMITES.pressao.min] });
  st.tanques = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:var(--e4)' });
  st.balanco = el('div');
  st.grReserv = new GraficoLinha({ altura: 180, unidade: '%', casas: 0, limites: [20] });

  return el('div', { class: 'grid' }, [
    st.kpis,
    el('div', { class: 'c7' }, [
      card({
        titulo: 'Pressão por setor — últimas 24 horas',
        meta: el('span', { text: `tracejado: mínimo de ${LIMITES.pressao.min} mca (NBR 12218)` }),
        corpo: [
          st.grPressao.node,
          legenda(SETORES.map((s, i) => ({ nome: s.nome, cor: CORES_SERIE[i] }))),
        ],
      }),
    ]),
    el('div', { class: 'c5' }, [
      card({
        titulo: 'Pressão por setor — situação atual',
        corpo: el('div', { class: 'rolagem' }, [
          el('table', { class: 'tabela' }, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', { text: 'Setor' }), el('th', { class: 'n', text: 'Atual' }),
                el('th', { class: 'n', text: 'Mín 24 h' }), el('th', { class: 'n', text: 'Méd 24 h' }),
                el('th', { class: 'n', text: 'Máx 24 h' }), el('th', { class: 'n', text: 'Consumo' }),
                el('th', { text: 'Situação' }),
              ]),
            ]),
            st.tabela,
          ]),
        ]),
        padding: false,
      }),
    ]),
    el('div', { class: 'c8' }, [
      card({ titulo: 'Reservatórios', corpo: st.tanques }),
    ]),
    el('div', { class: 'c4' }, [
      card({
        titulo: 'Balanço hídrico instantâneo',
        meta: el('span', { text: 'setores com telemetria de produção' }),
        corpo: st.balanco,
      }),
    ]),
    el('div', { class: 'c12' }, [
      card({
        titulo: 'Nível dos reservatórios — 24 h',
        meta: el('span', { text: 'os ciclos vêm da histerese de nível, não de agenda' }),
        corpo: [st.grReserv.node, st.legReserv = el('div')],
      }),
    ]),
  ]);
}

function atualizar({ sim }) {
  const g = sim.global;
  const h = sim.hist;

  /* KPIs */
  const pressoes = SETORES.map((s) => sim.setores.get(s.id).pressaoMca);
  const pior = Math.min(...pressoes);
  limpar(st.kpis).append(
    kpi({ rotulo: 'Pressão média ponderada', valor: num(g.pressaoMediaMca, 1), unidade: 'mca',
      sub: 'ponderada por população' }),
    kpi({ rotulo: 'Menor pressão de setor', valor: num(pior, 1), unidade: 'mca',
      estado: pior < LIMITES.pressao.min ? 'critico' : pior < 15 ? 'atencao' : 'ok',
      sub: SETORES[pressoes.indexOf(pior)].nome }),
    kpi({ rotulo: 'Reservação total', valor: num(g.reservacaoPct, 0), unidade: '%',
      sub: `${num(g.volumeReservadoM3, 0)} m³` }),
    kpi({ rotulo: 'Vazão distribuída', valor: num(g.vazaoDistribuidaLs, 0), unidade: 'L/s',
      sub: `${num(g.vazaoDistribuidaLs * 3.6, 0)} m³/h` }),
    kpi({ rotulo: 'Índice de perdas', valor: num((g.indicePerdas ?? 0) * 100, 1), unidade: '%',
      sub: `${num(g.perdasLs, 1)} L/s` }),
    kpi({ rotulo: 'Volume distribuído hoje', valor: num(g.volumeDistribuidoM3Hoje, 0), unidade: 'm³' })
  );

  /* Gráfico multi-setor */
  st.grPressao.atualizar(
    SETORES.map((s, i) => ({ nome: s.nomeCurto ?? s.nome, cor: CORES_SERIE[i], ...h.serie(`setor/${s.id}/pressao`).janela(1440) }))
  );

  /* Tabela */
  limpar(st.tabela).append(
    ...SETORES.map((s) => {
      const est = sim.setores.get(s.id);
      const e = h.serie(`setor/${s.id}/pressao`).estat();
      const p = est.pressaoMca;
      const estado = p < LIMITES.pressao.min ? 'critico' : p < 15 ? 'atencao' : 'ok';
      return el('tr', {}, [
        el('td', { class: 'principal' }, [s.nome, s.semTelemetria && el('small', { class: 'mut', text: ' · sistema local' })]),
        celulaPressao(p),
        el('td', { class: 'n', text: num(e.min, 1) }),
        el('td', { class: 'n', text: num(e.media, 1) }),
        el('td', { class: 'n', text: num(e.max, 1) }),
        el('td', { class: 'n', text: `${num(est.consumoLs, 1)} L/s` }),
        el('td', {}, [chip(estado, estado === 'ok' ? 'Normal' : estado === 'atencao' ? 'Baixa' : 'Crítica')]),
      ]);
    })
  );

  /* Tanques */
  limpar(st.tanques).append(
    ...[...sim.reservatorios.values()].map((r) => {
      const estado = r.nivelPct < 10 ? 'critico' : r.nivelPct < 20 ? 'atencao' : 'ok';
      return el('div', { style: 'border:1px solid var(--borda);border-radius:var(--raio);padding:var(--e3)' }, [
        el('div', { class: 'linha', style: 'margin-bottom:10px' }, [
          el('b', { text: r.unidade.sigla }),
          el('span', { class: 'espaco' }),
          chip(estado, `${num(r.nivelPct, 0)} %`),
        ]),
        el('div', { class: 'tanque' }, [
          // Marcas dos setpoints do CLP: dá para ver a bomba ligar ao cruzar 30 %.
          el('i', { class: 'tanque-marca', style: 'bottom:85%' }),
          el('i', { class: 'tanque-marca', style: 'bottom:30%' }),
          el('i', { class: 'tanque-agua', style: `height:${r.nivelPct}%` }, [el('i', { class: 'tanque-onda' })]),
          el('div', { class: 'tanque-rot', text: `${num(r.nivelPct, 0)} %` }),
        ]),
        el('dl', { class: 'pares', style: 'margin-top:8px' }, [
          el('dt', { text: 'Volume' }), el('dd', { text: `${num(r.volumeM3, 0)} m³` }),
          el('dt', { text: 'Capacidade' }), el('dd', { text: `${num(r.capacidadeM3, 0)} m³` }),
          el('dt', { text: 'Entrada' }), el('dd', { text: `${num(r.entradaLs, 1)} L/s` }),
          el('dt', { text: 'Saída' }), el('dd', { text: `${num(r.saidaLs, 1)} L/s` }),
          el('dt', { text: 'Autonomia' }), el('dd', { text: r.autonomiaH > 90 ? '—' : `${num(r.autonomiaH, 1)} h` }),
        ]),
      ]);
    })
  );

  /* Balanço */
  const saldo = g.vazaoProduzidaLs - g.vazaoDistribuidaLs;
  const prod24 = h.serie('glob/vazaoProduzida').estat().media;
  const dist24 = h.serie('glob/vazaoDistribuida').estat().media;
  limpar(st.balanco).append(
    barraEmpilhada(
      [
        { nome: 'Consumo micromedido', valor: g.consumoLs, cor: 'var(--serie-1)' },
        { nome: 'Perdas na distribuição', valor: Math.max(0, g.perdasLs), cor: 'var(--serie-4)' },
      ],
      { unidade: 'L/s' }
    ),
    el('dl', { class: 'pares', style: 'margin-top:14px' }, [
      el('dt', { text: 'Produzido nas captações' }),
      el('dd', {}, [`${num(g.vazaoProduzidaLs, 1)} L/s`, el('small', { class: 'mut', style: 'font-weight:400', text: `  ·  méd. 24 h ${num(prod24, 1)}` })]),
      el('dt', { text: 'Distribuído à rede' }),
      el('dd', {}, [`${num(g.vazaoDistribuidaLs, 1)} L/s`, el('small', { class: 'mut', style: 'font-weight:400', text: `  ·  méd. 24 h ${num(dist24, 1)}` })]),
      // Distribuir mais do que se produz é normal por algumas horas: a
      // diferença sai da reservação, que depois é reposta quando as bombas
      // ligam. Sem esta linha o cartão parece não fechar.
      el('dt', { text: saldo >= 0 ? 'Acumulando em reservatório' : 'Consumindo da reservação' }),
      el('dd', { style: saldo < 0 ? 'color:var(--atencao)' : '', text: `${num(Math.abs(saldo), 1)} L/s` }),
      el('dt', { class: 'mut', style: 'grid-column:1/-1;font-size:var(--t-xs);text-align:left;font-weight:400' }),
      el('dt', { text: 'Consumido (micromedido)' }), el('dd', { text: `${num(g.consumoLs, 1)} L/s` }),
      el('dt', { text: 'Perdas na distribuição' }), el('dd', { text: `${num(g.perdasLs, 1)} L/s` }),
    ]),
    el('p', {
      class: 'mut', style: 'font-size:var(--t-xs);margin:10px 0 0;line-height:1.5',
      text: 'Distribuir mais do que se produz é normal por algumas horas: a diferença sai da reservação e é reposta quando as bombas de captação religam. No acumulado de 24 h os dois valores se igualam. A Vila do Abraão fica fora desta conta — é abastecida por sistema local, sem telemetria de produção.',
    })
  );

  /* Níveis 24 h */
  const reservs = [...sim.reservatorios.keys()];
  st.grReserv.atualizar(
    reservs.map((id, i) => ({ nome: sim.reservatorios.get(id).unidade.sigla, cor: CORES_SERIE[i], ...h.serie(`reserv/${id}/nivel`).janela(1440) }))
  );
  limpar(st.legReserv).append(
    legenda(reservs.map((id, i) => ({ nome: sim.reservatorios.get(id).unidade.nome, cor: CORES_SERIE[i] })))
  );
}

export default { id: 'rede', nome: 'Rede e Pressão', sistema: 'agua', montar, atualizar };

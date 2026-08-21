/**
 * Visão Geral — a tela que fica no telão.
 *
 * Hierarquia deliberada: indicadores macro em cima (o que se lê de longe),
 * mapa no centro (onde está acontecendo), alarmes e cenários à direita (o que
 * exige ação). Nada aqui pisca a não ser um crítico não reconhecido.
 */

import { el, limpar, num, card, kpi, chip, icone, linhaAlarme } from '../ui.js';
import { GraficoLinha, sparkline, legenda, CORES_SERIE } from '../charts.js';
import { Mapa } from '../map.js';
import { UNIDADES, SETORES, TIPOS, LIMITES } from '../../data/topologia.js';
import { CENARIOS } from '../sim.js';

const st = {};

function montar(ctx) {
  const { sim, alarmes, drawer } = ctx;

  st.kpis = el('div', { class: 'kpis c12' });

  st.mapa = new Mapa({
    altura: 500,
    aoSelecionar: (u) => abrirUnidade(ctx, u),
  });

  st.alarmesBox = el('div', { class: 'alarmes' });
  st.cenariosBox = el('div', { class: 'cenarios' });
  st.statusBox = el('div', { class: 'linha', style: 'flex-wrap:wrap;gap:6px' });

  st.grVazao = new GraficoLinha({ altura: 200, unidade: 'L/s', casas: 0, zero: true });
  st.grNivel = new GraficoLinha({ altura: 200, unidade: '%', casas: 0, limites: [20] });

  const raiz = el('div', { class: 'grid' }, [
    st.kpis,

    el('div', { class: 'c8' }, [
      card({
        titulo: 'Sistemas de abastecimento e esgotamento — Angra dos Reis',
        meta: el('span', { text: `${UNIDADES.length} unidades monitoradas` }),
        corpo: st.mapa.node,
        padding: false,
      }),
    ]),

    el('div', { class: 'c4', style: 'display:flex;flex-direction:column;gap:var(--e3)' }, [
      card({
        titulo: 'Alarmes ativos',
        meta: st.metaAlarmes = el('span'),
        corpo: st.alarmesBox,
        padding: false,
      }),
      card({
        titulo: 'Situação das unidades',
        corpo: st.statusBox,
        classe: 'compacto',
      }),
      card({
        titulo: 'Cenários de demonstração',
        meta: el('span', { text: 'clique para disparar' }),
        corpo: st.cenariosBox,
      }),
    ]),

    el('div', { class: 'c8' }, [
      card({
        titulo: 'Vazão nas últimas 24 horas',
        meta: el('span', { text: 'produzida × distribuída × consumida' }),
        corpo: [st.grVazao.node, legenda([
          { nome: 'Produzida', cor: CORES_SERIE[0] },
          { nome: 'Distribuída', cor: CORES_SERIE[1] },
          { nome: 'Consumida', cor: CORES_SERIE[2] },
        ])],
      }),
    ]),

    el('div', { class: 'c4' }, [
      card({
        titulo: 'Níveis de reservação — 24 h',
        meta: el('span', { text: 'linha tracejada: nível baixo' }),
        corpo: [st.grNivel.node, legenda(
          [...sim.reservatorios.values()].map((r, i) => ({ nome: r.unidade.sigla, cor: CORES_SERIE[i] }))
        )],
      }),
    ]),
  ]);

  montarCenarios(ctx);
  return raiz;
}

/* ─────────────────────────── cenários ─────────────────────────── */

function montarCenarios(ctx) {
  const { sim } = ctx;
  limpar(st.cenariosBox);
  st.cenarioNodes = new Map();
  for (const c of CENARIOS) {
    const barra = el('i');
    const botao = el('button', {
      class: 'btn', text: 'Disparar',
      onclick: () => { sim.alternarCenario(c.id); atualizarCenarios(ctx); },
    });
    const node = el('div', { class: 'cenario' }, [
      el('div', {}, [
        el('div', { class: 'cenario-nome', text: c.nome }),
        el('div', { class: 'cenario-desc', text: c.resumo }),
      ]),
      botao,
      el('div', { class: 'cenario-barra' }, [barra]),
    ]);
    st.cenarioNodes.set(c.id, { node, botao, barra });
    st.cenariosBox.append(node);
  }
}

function atualizarCenarios({ sim }) {
  for (const [id, { node, botao, barra }] of st.cenarioNodes) {
    const c = sim.cenarios.get(id);
    node.classList.toggle('ativo', c.ativo || c.intensidade > 0.01);
    botao.textContent = c.ativo ? 'Normalizar' : 'Disparar';
    botao.classList.toggle('perigo', c.ativo);
    barra.style.width = `${c.intensidade * 100}%`;
  }
}

/* ─────────────────────────── atualização ─────────────────────────── */

function atualizar(ctx) {
  const { sim, alarmes } = ctx;
  const g = sim.global;
  const h = sim.hist;
  const jan = (chave, n = 240) => h.serie(chave).janela(n);

  /* ── indicadores ── */
  const spark = (chave, cor) => { const { t, v } = jan(chave, 180); return sparkline(t, v, { cor }); };
  const estPressao = g.pressaoMediaMca < LIMITES.pressao.min ? 'critico' : g.pressaoMediaMca < 15 ? 'atencao' : 'ok';
  const estCloro = g.cloroMedioMgL < LIMITES.cloroLivre.min ? 'critico' : g.cloroMedioMgL < 0.4 ? 'atencao' : 'ok';

  limpar(st.kpis).append(
    kpi({ rotulo: 'Vazão produzida', valor: num(g.vazaoProduzidaLs, 0), unidade: 'L/s',
      sub: `${num(g.vazaoProduzidaLs * 3.6, 0)} m³/h`, spark: spark('glob/vazaoProduzida', 'var(--serie-1)') }),
    kpi({ rotulo: 'Volume distribuído hoje', valor: num(g.volumeDistribuidoM3Hoje, 0), unidade: 'm³',
      sub: `perdas estimadas ${num((g.indicePerdas ?? 0) * 100, 0)} %` }),
    kpi({ rotulo: 'Pressão média da rede', valor: num(g.pressaoMediaMca, 1), unidade: 'mca',
      sub: `mínimo normativo ${LIMITES.pressao.min} mca`, estado: estPressao,
      spark: spark('glob/pressaoMedia', 'var(--serie-2)') }),
    kpi({ rotulo: 'Reservação total', valor: num(g.reservacaoPct, 0), unidade: '%',
      sub: `${num(g.volumeReservadoM3, 0)} m³ armazenados`, spark: spark('glob/reservacao', 'var(--serie-3)') }),
    kpi({ rotulo: 'Cloro médio na rede', valor: num(g.cloroMedioMgL, 2), unidade: 'mg/L',
      sub: `faixa ${LIMITES.cloroLivre.min}–${LIMITES.cloroLivre.max}`, estado: estCloro }),
    kpi({ rotulo: 'Bombas em operação', valor: `${g.bombasOperando}`, unidade: `de ${g.bombasTotal}`,
      sub: `${num(g.potenciaKW, 0)} kW instantâneos` }),
    kpi({ rotulo: 'Esgoto tratado', valor: num(g.vazaoEsgotoLs, 1), unidade: 'L/s',
      sub: `${num(g.vazaoEsgotoLs * 3.6, 0)} m³/h`, spark: spark('glob/vazaoEsgoto', 'var(--serie-2)') }),
    kpi({ rotulo: 'Energia consumida hoje', valor: num(g.energiaKWhHoje, 0), unidade: 'kWh',
      sub: 'conjuntos elevatórios' })
  );

  /* ── mapa ── */
  st.mapa.atualizar(sim, alarmes);

  /* ── alarmes ── */
  const ativos = alarmes.ativos.slice(0, 7);
  st.metaAlarmes.textContent = alarmes.contagem.total ? `${alarmes.contagem.total} ativo(s)` : 'nenhum';
  limpar(st.alarmesBox);
  if (!ativos.length) {
    st.alarmesBox.append(el('div', { class: 'vazio' }, [icone('ok'), 'Operação normal — nenhum alarme ativo.']));
  } else {
    for (const a of ativos) {
      st.alarmesBox.append(linhaAlarme(a, { agora: sim.tempo, aoReconhecer: (c) => alarmes.reconhecer(c) }));
    }
  }

  /* ── chips de situação ── */
  limpar(st.statusBox);
  for (const u of UNIDADES) {
    const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
    const falha = bombas.some((b) => b.estado === 'falha');
    const operando = bombas.filter((b) => b.ligada).length;
    const estado = falha ? 'critico' : operando ? 'ok' : bombas.length ? 'parada' : 'ok';
    const texto = falha ? `${u.sigla} · falha` : bombas.length ? `${u.sigla} · ${operando}/${bombas.length}` : u.sigla;
    st.statusBox.append(chip(estado, texto));
  }

  /* ── gráficos ── */
  st.grVazao.atualizar([
    { nome: 'Produzida', cor: CORES_SERIE[0], ...jan('glob/vazaoProduzida', 1440) },
    { nome: 'Distribuída', cor: CORES_SERIE[1], ...jan('glob/vazaoDistribuida', 1440) },
    { nome: 'Consumida', cor: CORES_SERIE[2], ...jan('glob/consumo', 1440) },
  ]);
  st.grNivel.atualizar(
    [...sim.reservatorios.keys()].map((id, i) => ({
      nome: sim.reservatorios.get(id).unidade.sigla,
      cor: CORES_SERIE[i],
      ...jan(`reserv/${id}/nivel`, 1440),
    }))
  );

  atualizarCenarios(ctx);
}

/* ─────────────────────── drawer de unidade ─────────────────────── */

export function abrirUnidade(ctx, u) {
  const { sim, drawer } = ctx;
  drawer.abrir({
    titulo: u.nome,
    sub: `${TIPOS[u.tipo].rotulo} · ${u.bairro} · ${u.sigla}`,
    render: () => {
      const partes = [];
      const h = sim.hist;

      const res = sim.reservatorios.get(u.id);
      if (res) {
        partes.push(
          el('div', {}, [
            el('div', { class: 'drawer-secao-tit', text: 'Reservação' }),
            el('div', { class: 'tanque' }, [
              el('i', { class: 'tanque-agua', style: `height:${res.nivelPct}%` }, [el('i', { class: 'tanque-onda' })]),
              el('div', { class: 'tanque-rot', text: `${num(res.nivelPct, 1)} %` }),
            ]),
            el('dl', { class: 'pares', style: 'margin-top:8px' }, [
              el('dt', { text: 'Volume' }), el('dd', { text: `${num(res.volumeM3, 0)} / ${num(res.capacidadeM3, 0)} m³` }),
              el('dt', { text: 'Entrada' }), el('dd', { text: `${num(res.entradaLs, 1)} L/s` }),
              el('dt', { text: 'Saída' }), el('dd', { text: `${num(res.saidaLs, 1)} L/s` }),
              el('dt', { text: 'Autonomia' }), el('dd', { text: `${num(Math.min(res.autonomiaH, 99), 1)} h` }),
            ]),
            (() => { const { t, v } = h.serie(`reserv/${u.id}/nivel`).janela(360); return sparkline(t, v, { cor: 'var(--serie-1)', altura: 40 }); })(),
          ])
        );
      }

      const poco = sim.pocos.get(u.id);
      if (poco) {
        partes.push(
          el('div', {}, [
            el('div', { class: 'drawer-secao-tit', text: 'Poço de sucção' }),
            el('div', { class: 'tanque tanque-esgoto' }, [
              el('i', { class: 'tanque-agua', style: `height:${poco.nivelPct}%` }, [el('i', { class: 'tanque-onda' })]),
              el('div', { class: 'tanque-rot', text: `${num(poco.nivelPct, 0)} %` }),
            ]),
            el('dl', { class: 'pares', style: 'margin-top:8px' }, [
              el('dt', { text: 'Afluente' }), el('dd', { text: `${num(poco.afluenteLs, 1)} L/s` }),
              el('dt', { text: 'Recalque' }), el('dd', { text: `${num(poco.recalqueLs, 1)} L/s` }),
              el('dt', { text: 'Volume útil' }), el('dd', { text: `${num(poco.capacidadeM3, 0)} m³` }),
            ]),
          ])
        );
      }

      const ete = sim.etes.get(u.id);
      if (ete) {
        partes.push(
          el('div', {}, [
            el('div', { class: 'drawer-secao-tit', text: 'Tratamento' }),
            el('div', { style: 'margin-bottom:8px' }, [chip(ete.conforme ? 'ok' : 'critico', ete.conforme ? 'Efluente conforme' : 'Fora do padrão')]),
            el('dl', { class: 'pares' }, [
              el('dt', { text: 'Processo' }), el('dd', { text: u.tratamento }),
              el('dt', { text: 'Vazão afluente' }), el('dd', { text: `${num(ete.afluenteLs, 1)} L/s` }),
              el('dt', { text: 'Carga hidráulica' }), el('dd', { text: `${num(ete.cargaPct, 0)} %` }),
              el('dt', { text: 'DBO afluente' }), el('dd', { text: `${num(ete.dboAfluenteMgL, 0)} mg/L` }),
              el('dt', { text: 'DBO efluente' }), el('dd', { text: `${num(ete.dboEfluenteMgL, 0)} mg/L` }),
              el('dt', { text: 'Remoção de DBO' }), el('dd', { text: `${num(ete.remocaoDbo * 100, 1)} %` }),
              el('dt', { text: 'OD no reator' }), el('dd', { text: `${num(ete.odMgL, 2)} mg/L` }),
            ]),
          ])
        );
      }

      const qual = sim.qualidade.get(u.id);
      if (qual) {
        partes.push(
          el('div', {}, [
            el('div', { class: 'drawer-secao-tit', text: 'Qualidade na saída' }),
            el('dl', { class: 'pares' }, [
              el('dt', { text: 'Cloro residual livre' }), el('dd', { text: `${num(qual.cloroMgL, 2)} mg/L` }),
              el('dt', { text: 'pH' }), el('dd', { text: num(qual.ph, 2) }),
              el('dt', { text: 'Turbidez' }), el('dd', { text: `${num(qual.turbidezUT, 2)} uT` }),
              el('dt', { text: 'Fluoreto' }), el('dd', { text: `${num(qual.fluoretoMgL, 2)} mg/L` }),
            ]),
          ])
        );
      }

      const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
      if (bombas.length) {
        partes.push(
          el('div', {}, [
            el('div', { class: 'drawer-secao-tit', text: `Conjuntos motobomba (${bombas.length})` }),
            el('table', { class: 'tabela' }, [
              el('thead', {}, [el('tr', {}, [
                el('th', { text: 'Tag' }), el('th', { text: 'Estado' }),
                el('th', { class: 'n', text: 'Corrente' }), el('th', { class: 'n', text: 'RPM' }),
              ])]),
              el('tbody', {}, bombas.map((b) =>
                el('tr', {}, [
                  el('td', { class: 'principal', text: b.id }),
                  el('td', {}, [chip(b.estado === 'operando' ? 'ok' : b.estado === 'falha' ? 'critico' : 'parada',
                    b.estado === 'operando' ? 'Operando' : b.estado === 'falha' ? 'Falha' : 'Parada')]),
                  el('td', { class: 'n', text: `${num(b.correnteA, 0)} A` }),
                  el('td', { class: 'n', text: num(b.rpm, 0) }),
                ])
              )),
            ]),
          ])
        );
      }

      partes.push(
        el('div', {}, [
          el('div', { class: 'drawer-secao-tit', text: 'Cadastro' }),
          el('dl', { class: 'pares' }, [
            el('dt', { text: 'Coordenadas' }), el('dd', { text: `${num(u.lat, 6)}, ${num(u.lon, 6)}` }),
            el('dt', { text: 'CLP' }), el('dd', { text: u.clp ?? '—' }),
            el('dt', { text: 'Origem do dado' }), el('dd', { text: u.confirmada ? 'Coordenada SAAE' : 'Estimada' }),
          ]),
        ])
      );

      return partes;
    },
  });
}

export default { id: 'visao-geral', nome: 'Visão Geral', montar, atualizar };

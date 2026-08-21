/**
 * Esgotamento sanitário — ETEs e elevatória.
 *
 * O gráfico de vazão afluente é o mais revelador da maquete: ele acompanha a
 * curva de consumo de água com algumas horas de atraso, porque é isso que
 * acontece de verdade — o esgoto de agora é a água que foi consumida mais
 * cedo. Nenhuma das duas curvas foi desenhada; as duas saem do mesmo modelo.
 */

import { el, limpar, num, card, chip, kpi, faixaNormativa } from '../ui.js';
import { GraficoLinha, legenda, CORES_SERIE, sparkline } from '../charts.js';
import { UNIDADES, LIMITES } from '../../data/topologia.js';

const st = {};

function montar(ctx) {
  const { sim } = ctx;
  st.kpis = el('div', { class: 'kpis c12' });
  st.cards = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--e4)' });
  st.pocoBox = el('div');
  st.grAfluente = new GraficoLinha({ altura: 220, unidade: 'L/s', casas: 1, zero: true });
  st.grAtraso = new GraficoLinha({ altura: 200, unidade: 'L/s', casas: 1, zero: true });
  st.tabela = el('tbody');

  const etes = [...sim.etes.values()];

  return el('div', { class: 'grid' }, [
    st.kpis,
    el('div', { class: 'c8' }, [
      card({
        titulo: 'Estações de tratamento de esgoto',
        meta: el('span', { text: 'Resolução CONAMA nº 430/2011' }),
        corpo: st.cards,
      }),
    ]),
    el('div', { class: 'c4' }, [
      card({
        titulo: 'Elevatória de Esgoto Praia do Anil',
        meta: el('span', { text: 'poço de sucção' }),
        corpo: st.pocoBox,
      }),
    ]),
    el('div', { class: 'c7' }, [
      card({
        titulo: 'Vazão afluente por ETE — 24 h',
        corpo: [st.grAfluente.node, legenda(etes.map((e, i) => ({ nome: e.unidade.sigla, cor: CORES_SERIE[i] })))],
      }),
    ]),
    el('div', { class: 'c5' }, [
      card({
        titulo: 'Consumo de água × chegada de esgoto',
        meta: el('span', { text: 'defasagem medida: ~3 h' }),
        corpo: [
          st.grAtraso.node,
          legenda([
            { nome: 'Consumo de água (Centro)', cor: CORES_SERIE[0] },
            { nome: 'Afluente na ETE Chácara', cor: CORES_SERIE[1] },
          ]),
          el('p', { class: 'mut', style: 'font-size:var(--t-xs);margin:8px 0 0', text: 'O pico de esgoto chega cerca de três horas depois do pico de consumo — 2,5 h de percurso na rede coletora mais o tempo da caixa de chegada. Nenhuma das duas curvas foi desenhada: as duas saem do mesmo modelo.' }),
        ],
      }),
    ]),
    el('div', { class: 'c12' }, [
      card({
        titulo: 'Padrão de lançamento de efluentes',
        meta: el('span', { text: 'DBO ≤ 120 mg/L ou remoção ≥ 60 %' }),
        corpo: el('div', { class: 'rolagem' }, [
          el('table', { class: 'tabela' }, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', { text: 'Estação' }), el('th', { text: 'Processo' }),
                el('th', { class: 'n', text: 'Afluente' }), el('th', { class: 'n', text: 'Carga' }),
                el('th', { class: 'n', text: 'DBO entrada' }), el('th', { class: 'n', text: 'DBO saída' }),
                el('th', { class: 'n', text: 'Remoção' }), el('th', { class: 'n', text: 'SST' }),
                el('th', { class: 'n', text: 'OD' }), el('th', { class: 'n', text: 'pH' }),
                el('th', { text: 'CONAMA 430' }),
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
  const etes = [...sim.etes.values()];
  const poco = sim.pocos.get('eee-anil');

  const totalAfl = etes.reduce((s, e) => s + e.afluenteLs, 0);
  const naoConformes = etes.filter((e) => !e.conforme).length;
  const remocaoMedia = etes.reduce((s, e) => s + e.remocaoDbo, 0) / (etes.length || 1);
  const cargaMax = Math.max(...etes.map((e) => e.cargaPct));

  limpar(st.kpis).append(
    kpi({ rotulo: 'Vazão total tratada', valor: num(totalAfl, 1), unidade: 'L/s', sub: `${num(totalAfl * 3.6, 0)} m³/h` }),
    kpi({ rotulo: 'Remoção média de DBO', valor: num(remocaoMedia * 100, 1), unidade: '%',
      estado: remocaoMedia < 0.6 ? 'critico' : 'ok', sub: 'mínimo CONAMA: 60 %' }),
    kpi({ rotulo: 'Estações conformes', valor: `${etes.length - naoConformes}`, unidade: `de ${etes.length}`,
      estado: naoConformes ? 'critico' : 'ok', sub: 'padrão de lançamento' }),
    kpi({ rotulo: 'Maior carga hidráulica', valor: num(cargaMax, 0), unidade: '%',
      estado: cargaMax > 100 ? 'atencao' : 'ok', sub: 'da vazão nominal' }),
    kpi({ rotulo: 'Nível do poço — Anil', valor: num(poco?.nivelPct ?? 0, 0), unidade: '%',
      estado: (poco?.nivelPct ?? 0) > 88 ? 'critico' : 'ok', sub: `${num(poco?.afluenteLs ?? 0, 1)} L/s afluente` }),
    kpi({ rotulo: 'População atendida', valor: num(UNIDADES.filter((u) => u.tipo === 'ete').reduce((s, u) => s + (u.populacaoAtendida ?? 0), 0), 0),
      unidade: 'hab', sub: 'nas bacias com coleta' })
  );

  /* Cartões das ETEs */
  limpar(st.cards).append(
    ...etes.map((e) => {
      const u = e.unidade;
      const estadoCarga = e.cargaPct > 100 ? 'atencao' : 'ok';
      return el('div', { style: 'border:1px solid var(--borda);border-radius:var(--raio);padding:var(--e3)' }, [
        el('div', { class: 'linha', style: 'margin-bottom:10px' }, [
          el('div', {}, [
            el('b', { text: u.sigla }),
            el('div', { class: 'mut', style: 'font-size:var(--t-xs)', text: `${u.tratamento} · ${u.bairro}` }),
          ]),
          el('span', { class: 'espaco' }),
          chip(e.conforme ? 'ok' : 'critico', e.conforme ? 'Conforme' : 'Fora do padrão'),
        ]),
        el('div', { class: 'bomba-metricas', style: 'margin-bottom:10px' }, [
          el('div', {}, [el('div', { class: 'metrica-rot', text: 'Vazão afluente' }),
            el('div', { class: 'metrica-val' }, [num(e.afluenteLs, 1), el('small', { text: 'L/s' })])]),
          el('div', {}, [el('div', { class: 'metrica-rot', text: 'Carga hidráulica' }),
            el('div', { class: `metrica-val ${estadoCarga === 'atencao' ? 'alerta' : ''}` }, [num(e.cargaPct, 0), el('small', { text: '%' })])]),
          el('div', {}, [el('div', { class: 'metrica-rot', text: 'Remoção de DBO' }),
            el('div', { class: 'metrica-val' }, [num(e.remocaoDbo * 100, 1), el('small', { text: '%' })])]),
          el('div', {}, [el('div', { class: 'metrica-rot', text: 'Sopradores' }),
            el('div', { class: 'metrica-val', text: `${u.sopradores ?? 0}` })]),
        ]),
        el('div', { style: 'display:flex;flex-direction:column;gap:11px' }, [
          faixaNormativa({ nome: 'DBO do efluente', valor: e.dboEfluenteMgL, limite: { min: 0, max: LIMITES.dboEfluente.max }, unidade: 'mg/L', casas: 0 }),
          faixaNormativa({ nome: 'pH do efluente', valor: e.ph, limite: LIMITES.phEfluente, unidade: '', casas: 2 }),
          faixaNormativa({ nome: 'Oxigênio dissolvido', valor: e.odMgL, limite: { min: LIMITES.oxigenioDissolvido.min, max: 5 }, unidade: 'mg/L', casas: 2 }),
        ]),
        (() => { const { t, v } = h.serie(`ete/${u.id}/afluente`).janela(720); return sparkline(t, v, { cor: 'var(--esgoto)', altura: 34 }); })(),
      ]);
    })
  );

  /* Poço da elevatória */
  if (poco) {
    const bombas = sim.bombasPorUnidade.get('eee-anil') ?? [];
    const estado = poco.extravasando ? 'critico' : poco.nivelPct > 88 ? 'critico' : poco.nivelPct > 75 ? 'atencao' : 'ok';
    limpar(st.pocoBox).append(
      el('div', { class: 'linha', style: 'margin-bottom:10px' }, [
        chip(estado, poco.extravasando ? 'Extravasando' : `${num(poco.nivelPct, 0)} % do volume útil`),
      ]),
      el('div', { class: 'tanque tanque-esgoto', style: 'height:150px' }, [
        // Setpoints do CLP: liga em 75 %, desliga em 25 %.
        el('i', { class: 'tanque-marca', style: 'bottom:75%' }),
        el('i', { class: 'tanque-marca', style: 'bottom:25%' }),
        el('i', { class: 'tanque-agua', style: `height:${poco.nivelPct}%` }, [el('i', { class: 'tanque-onda' })]),
        el('div', { class: 'tanque-rot', text: `${num(poco.nivelPct, 0)} %` }),
      ]),
      el('dl', { class: 'pares', style: 'margin-top:10px' }, [
        el('dt', { text: 'Volume útil' }), el('dd', { text: `${num(poco.capacidadeM3, 0)} m³` }),
        el('dt', { text: 'Vazão afluente' }), el('dd', { text: `${num(poco.afluenteLs, 1)} L/s` }),
        el('dt', { text: 'Vazão de recalque' }), el('dd', { text: `${num(poco.recalqueLs, 1)} L/s` }),
        el('dt', { text: 'Recalca para' }), el('dd', { text: 'ETE Praia da Chácara' }),
        el('dt', { text: 'Partidas hoje' }), el('dd', { text: String(bombas.reduce((s, b) => s + b.partidasHoje, 0)) }),
      ]),
      el('div', { class: 'drawer-secao-tit', style: 'margin-top:14px', text: 'Conjuntos em rodízio' }),
      el('table', { class: 'tabela' }, [
        el('tbody', {}, bombas.map((b) =>
          el('tr', {}, [
            el('td', { class: 'principal', text: b.id }),
            el('td', {}, [chip(b.ligada ? 'ok' : 'parada', b.ligada ? 'Operando' : 'Parada')]),
            el('td', { class: 'n', text: `${b.partidasHoje} part.` }),
            el('td', { class: 'n', text: `${num(b.correnteA, 0)} A` }),
          ])
        )),
      ])
    );
  }

  /* Gráficos */
  st.grAfluente.atualizar(
    etes.map((e, i) => ({ nome: e.unidade.sigla, cor: CORES_SERIE[i], ...h.serie(`ete/${e.unidade.id}/afluente`).janela(1440) }))
  );
  st.grAtraso.atualizar([
    { nome: 'Água (Centro)', cor: CORES_SERIE[0], ...h.serie('setor/centro/consumo').janela(1440) },
    { nome: 'Esgoto (Chácara)', cor: CORES_SERIE[1], ...h.serie('ete/ete-chacara/afluente').janela(1440) },
  ]);

  /* Tabela */
  limpar(st.tabela).append(
    ...etes.map((e) => {
      const u = e.unidade;
      return el('tr', {}, [
        el('td', { class: 'principal', text: u.nome }),
        el('td', { text: u.tratamento }),
        el('td', { class: 'n', text: `${num(e.afluenteLs, 1)} L/s` }),
        el('td', { class: 'n', style: e.cargaPct > 100 ? 'color:var(--atencao)' : '', text: `${num(e.cargaPct, 0)} %` }),
        el('td', { class: 'n', text: `${num(e.dboAfluenteMgL, 0)} mg/L` }),
        el('td', { class: 'n', style: e.dboEfluenteMgL > LIMITES.dboEfluente.max ? 'color:var(--critico)' : '', text: `${num(e.dboEfluenteMgL, 0)} mg/L` }),
        el('td', { class: 'n', text: `${num(e.remocaoDbo * 100, 1)} %` }),
        el('td', { class: 'n', text: `${num(e.sstEfluenteMgL, 0)} mg/L` }),
        el('td', { class: 'n', text: `${num(e.odMgL, 2)} mg/L` }),
        el('td', { class: 'n', text: num(e.ph, 2) }),
        el('td', {}, [chip(e.conforme ? 'ok' : 'critico', e.conforme ? 'Conforme' : 'Não conforme')]),
      ]);
    })
  );
}

export default { id: 'esgoto', nome: 'Esgoto e ETEs', sistema: 'esgoto', montar, atualizar };

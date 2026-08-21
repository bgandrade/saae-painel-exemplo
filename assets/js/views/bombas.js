/**
 * Bombas e motores.
 *
 * Duas leituras convivem aqui: o instantâneo elétrico de cada conjunto (o que
 * o operador olha quando desconfia de alguma coisa) e a linha do tempo de
 * operação de 24 h (o que conta se o rodízio está funcionando). A timeline não
 * é decorativa — é onde se vê que as bombas alternam sozinhas por histerese de
 * nível e por rodízio de liderança, sem ninguém ter roteirizado nada.
 */

import { el, limpar, num, card, chip, kpi, horimetro } from '../ui.js';
import { GraficoLinha, gauge, gantt, legenda, CORES_SERIE } from '../charts.js';
import { UNIDADES, BOMBAS } from '../../data/topologia.js';

const st = { unidade: 'todas' };

const ESTADO_CHIP = {
  operando: ['ok', 'Operando'],
  parada: ['parada', 'Parada'],
  falha: ['critico', 'Falha'],
  manutencao: ['atencao', 'Manutenção'],
};

function unidadesComBomba() {
  const ids = new Set(BOMBAS.map((b) => b.unidadeId));
  return UNIDADES.filter((u) => ids.has(u.id));
}

function montar(ctx) {
  st.kpis = el('div', { class: 'kpis c12' });
  st.seletor = el('div', { class: 'segmentado' });
  st.grid = el('div', { class: 'bombas-grid' });
  st.ganttBox = el('div');
  st.eventosBox = el('tbody');
  st.grTend = new GraficoLinha({ altura: 200, unidade: 'A', casas: 0, zero: true });
  st.legTend = el('div');

  const chipsUnidade = [{ id: 'todas', sigla: 'Todas' }, ...unidadesComBomba()];
  for (const u of chipsUnidade) {
    st.seletor.append(
      el('button', {
        type: 'button', text: u.sigla, title: u.nome ?? 'Todas as unidades',
        'aria-pressed': String(st.unidade === u.id),
        onclick: () => {
          st.unidade = u.id;
          for (const b of st.seletor.children) b.setAttribute('aria-pressed', String(b.textContent === u.sigla));
          atualizar(ctx);
        },
      })
    );
  }

  return el('div', { class: 'grid' }, [
    st.kpis,
    el('div', { class: 'c12' }, [
      card({
        titulo: 'Conjuntos motobomba',
        meta: st.seletor,
        corpo: st.grid,
      }),
    ]),
    el('div', { class: 'c7' }, [
      card({
        titulo: 'Operação nas últimas 24 horas',
        meta: el('span', { text: 'barra preenchida = conjunto ligado' }),
        corpo: st.ganttBox,
      }),
    ]),
    el('div', { class: 'c5' }, [
      card({
        titulo: 'Corrente — últimas 6 horas',
        meta: el('span', { text: 'conjuntos da unidade selecionada' }),
        corpo: [st.grTend.node, st.legTend],
      }),
    ]),
    el('div', { class: 'c12' }, [
      card({
        titulo: 'Registro de eventos dos conjuntos',
        corpo: el('div', { class: 'rolagem' }, [
          el('table', { class: 'tabela' }, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', { text: 'Tag' }), el('th', { text: 'Unidade' }), el('th', { text: 'Estado' }),
                el('th', { class: 'n', text: 'Horímetro' }), el('th', { class: 'n', text: 'Partidas hoje' }),
                el('th', { class: 'n', text: 'Vibração' }), el('th', { class: 'n', text: 'Mancal' }),
                el('th', { class: 'n', text: 'Potência' }), el('th', { text: 'Acionamento' }),
              ]),
            ]),
            st.eventosBox,
          ]),
        ]),
        padding: false,
      }),
    ]),
  ]);
}

/** Conjuntos visíveis conforme o filtro de unidade. */
function bombasVisiveis(sim) {
  const todas = [...sim.bombas.values()];
  return st.unidade === 'todas' ? todas : todas.filter((b) => b.def.unidadeId === st.unidade);
}

function cartaoBomba(b) {
  const d = b.def;
  const [estCor, estRot] = ESTADO_CHIP[b.estado] ?? ESTADO_CHIP.parada;
  const nominal = d.correnteNominalA;

  const classe = (v, alerta, critico) => (v > critico ? 'critico' : v > alerta ? 'alerta' : '');
  const metrica = (rot, valor, unidade, cls = '') =>
    el('div', {}, [
      el('div', { class: 'metrica-rot', text: rot }),
      el('div', { class: `metrica-val ${cls}` }, [valor, unidade && el('small', { text: unidade })]),
    ]);

  // Barras das três fases: desequilíbrio se vê antes de ler o número.
  const vmax = Math.max(...b.tensoes, 1);
  const fases = el('div', { class: 'fases', title: b.tensoes.map((v) => `${num(v, 0)} V`).join(' · ') },
    b.tensoes.map((v) => el('i', { class: 'fase', style: `height:${b.ligada ? Math.max(12, (v / vmax) * 100) : 6}%` })));

  return el('article', { class: `bomba-card ${b.estado}` }, [
    el('header', { class: 'bomba-cab' }, [
      el('div', {}, [
        el('div', { class: 'bomba-id', text: d.id }),
        el('div', { class: 'bomba-local', text: `${b.unidade.sigla} · ${d.potenciaCV} CV · ${d.papel}${d.inversor ? ' · inversor' : ' · partida direta'}` }),
      ]),
      el('div', { style: 'margin-left:auto' }, [chip(estCor, estRot)]),
    ]),
    el('div', { class: 'bomba-corpo' }, [
      gauge({
        valor: b.correnteA, min: 0, max: nominal * 1.35,
        faixaOk: { min: nominal * 0.5, max: nominal * 1.05 },
        unidade: 'A', casas: 0, tamanho: 100,
        cor: b.correnteA > nominal * 1.15 ? 'var(--critico)' : 'var(--serie-1)',
      }),
      el('div', { class: 'bomba-metricas' }, [
        metrica('Tensão média', num(b.tensaoMedia, 0), 'V'),
        metrica('Rotação', num(b.rpm, 0), 'rpm'),
        metrica('Potência', num(b.potenciaKW, 1), 'kW'),
        metrica('Fator de pot.', b.ligada ? num(b.cosPhi, 2) : '—', ''),
        metrica('Vibração', b.ligada ? num(b.vibracaoMms, 1) : '—', 'mm/s', classe(b.vibracaoMms, 4.5, 7.1)),
        metrica('Mancal', num(b.tempMancalC, 0), '°C', classe(b.tempMancalC, 75, 85)),
        el('div', {}, [el('div', { class: 'metrica-rot', text: 'Fases L1·L2·L3' }), fases]),
        metrica('Vazão', b.ligada ? num(b.vazaoLs, 1) : '—', 'L/s'),
      ]),
    ]),
    el('footer', { class: 'bomba-rodape' }, [
      el('span', { text: `Horímetro ${horimetro(b.horimetroH)}` }),
      el('span', { text: `${b.partidasHoje} partida(s) hoje` }),
      el('span', { class: 'espaco' }),
      el('span', { text: b.ligada ? `${num(b.rotacaoPct * 100, 0)} % de rotação` : 'desligada' }),
    ]),
  ]);
}

function atualizar(ctx) {
  const { sim } = ctx;
  const visiveis = bombasVisiveis(sim);
  const todas = [...sim.bombas.values()];
  const ligadas = todas.filter((b) => b.ligada);
  const vibMax = ligadas.length ? Math.max(...ligadas.map((b) => b.vibracaoMms)) : 0;
  const tempMax = ligadas.length ? Math.max(...ligadas.map((b) => b.tempMancalC)) : 0;

  limpar(st.kpis).append(
    kpi({ rotulo: 'Conjuntos em operação', valor: `${ligadas.length}`, unidade: `de ${todas.length}`,
      sub: `${todas.filter((b) => b.estado === 'falha').length} em falha` }),
    kpi({ rotulo: 'Potência instantânea', valor: num(sim.global.potenciaKW, 0), unidade: 'kW',
      sub: `${num(sim.global.energiaKWhHoje, 0)} kWh hoje` }),
    kpi({ rotulo: 'Vazão bombeada', valor: num(ligadas.reduce((s, b) => s + b.vazaoLs, 0), 0), unidade: 'L/s',
      sub: 'soma dos conjuntos ligados' }),
    kpi({ rotulo: 'Maior vibração', valor: num(vibMax, 1), unidade: 'mm/s',
      estado: vibMax > 7.1 ? 'critico' : vibMax > 4.5 ? 'atencao' : 'ok', sub: 'limite ISO 10816-3: 4,5' }),
    kpi({ rotulo: 'Maior temp. de mancal', valor: num(tempMax, 0), unidade: '°C',
      estado: tempMax > 85 ? 'critico' : tempMax > 75 ? 'atencao' : 'ok', sub: 'alarme em 75 °C' }),
    kpi({ rotulo: 'Partidas hoje', valor: `${todas.reduce((s, b) => s + b.partidasHoje, 0)}`, unidade: '',
      sub: 'todos os conjuntos' })
  );

  limpar(st.grid).append(...visiveis.map(cartaoBomba));

  /* Timeline de operação — todas as bombas, sempre: o valor está na comparação. */
  const faixas = [...sim.bombas.values()].map((b) => ({
    nome: b.id,
    falha: b.estado === 'falha',
    v: sim.hist.serie(`bomba/${b.id}/ligada`).janela(1440).v,
  }));
  limpar(st.ganttBox).append(gantt(faixas, { horas: 24 }));

  /* Tendência de corrente: até 5 conjuntos, senão o gráfico vira espaguete. */
  const paraTend = visiveis.slice(0, 5);
  st.grTend.atualizar(
    paraTend.map((b, i) => ({
      nome: b.id.split('-').slice(-1)[0] === 'CMB' ? b.id : b.id.replace(/^[A-Z]+-/, ''),
      cor: CORES_SERIE[i],
      ...sim.hist.serie(`bomba/${b.id}/corrente`).janela(360),
    }))
  );
  limpar(st.legTend).append(legenda(paraTend.map((b, i) => ({ nome: b.id, cor: CORES_SERIE[i] }))));

  /* Tabela geral */
  limpar(st.eventosBox).append(
    ...[...sim.bombas.values()].map((b) => {
      const [cor, rot] = ESTADO_CHIP[b.estado] ?? ESTADO_CHIP.parada;
      return el('tr', {}, [
        el('td', { class: 'principal', text: b.id }),
        el('td', { text: b.unidade.sigla }),
        el('td', {}, [chip(cor, rot)]),
        el('td', { class: 'n', text: horimetro(b.horimetroH) }),
        el('td', { class: 'n', text: String(b.partidasHoje) }),
        el('td', { class: 'n', text: b.ligada ? `${num(b.vibracaoMms, 1)} mm/s` : '—' }),
        el('td', { class: 'n', text: `${num(b.tempMancalC, 0)} °C` }),
        el('td', { class: 'n', text: `${num(b.potenciaKW, 1)} kW` }),
        el('td', { text: b.def.inversor ? 'Inversor de frequência' : 'Partida direta' }),
      ]);
    })
  );
}

export default { id: 'bombas', nome: 'Bombas e Motores', montar, atualizar };

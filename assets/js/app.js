/**
 * Montagem do painel: relógio, roteamento, laço de atualização e os controles
 * globais (tema, velocidade, quiosque).
 *
 * Uma decisão estrutural: a simulação é uma só, viva, compartilhada por todas
 * as telas. Trocar de aba não reinicia nada — o histórico continua correndo em
 * segundo plano, e é por isso que voltar para a Visão Geral depois de cinco
 * minutos na tela de bombas mostra os cinco minutos que passaram.
 */

import { Simulacao } from './sim.js';
import { MotorAlarmes } from './alarms.js';
import { el, $, limpar, icone, hora, dataLonga, Drawer, linhaAlarme } from './ui.js';

import visaoGeral from './views/visao-geral.js';
import bombas from './views/bombas.js';
import rede from './views/rede.js';
import qualidade from './views/qualidade.js';
import esgoto from './views/esgoto.js';

const VIEWS = [visaoGeral, bombas, rede, qualidade, esgoto];
const VELOCIDADES = [
  { v: 1, rot: '1×', titulo: 'Tempo real' },
  { v: 60, rot: '60×', titulo: '1 min de operação por segundo' },
  { v: 300, rot: '300×', titulo: '5 min de operação por segundo' },
];
const INTERVALO_MS = 500;

/* ─────────────────────────── inicialização ─────────────────────────── */

const sim = new Simulacao({ velocidade: 60 });
// As 24 h de histórico são geradas antes da primeira pintura: quando a tela
// aparece, os gráficos já estão cheios.
sim.backfill(24);
const alarmes = new MotorAlarmes(sim);

const drawer = new Drawer();
const ctx = { sim, alarmes, drawer };

const app = $('#app');
let viewAtual = null;

/* ─────────────────────────── tema ─────────────────────────── */

const CHAVE_TEMA = 'saae-tema';
function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  try { localStorage.setItem(CHAVE_TEMA, tema); } catch { /* modo privativo */ }
  limpar($('#btn-tema')).append(icone(tema === 'dark' ? 'sol' : 'lua'));
}
// Escuro é o padrão: o destino é telão de sala de controle. `?tema=light`
// força o claro sem depender do armazenamento — útil para deixar um telão
// configurado por URL, ou para projeção em sala muito iluminada.
const temaUrl = new URLSearchParams(location.search).get('tema');
let temaSalvo = 'dark';
try { temaSalvo = temaUrl || localStorage.getItem(CHAVE_TEMA) || 'dark'; } catch { temaSalvo = temaUrl || 'dark'; }
aplicarTema(temaSalvo === 'light' ? 'light' : 'dark');
$('#btn-tema').addEventListener('click', () => {
  aplicarTema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  viewAtual?.aoTrocarTema?.(ctx);
});

/* ─────────────────────────── velocidade ─────────────────────────── */

const segVel = $('#velocidade');
for (const { v, rot, titulo } of VELOCIDADES) {
  segVel.append(
    el('button', {
      type: 'button', text: rot, title: titulo,
      'aria-pressed': String(v === sim.velocidade),
      onclick: () => {
        sim.velocidade = v;
        for (const b of segVel.children) b.setAttribute('aria-pressed', String(b.textContent === rot));
      },
    })
  );
}

/* ─────────────────────────── abas e rota ─────────────────────────── */

const abas = $('#abas');
for (const v of VIEWS) {
  abas.append(
    el('a', { class: 'aba', href: `#/${v.id}`, dataset: { view: v.id } }, [
      v.sistema && el('i', { class: `aba-pt ${v.sistema}` }),
      v.nome,
    ])
  );
}

function irPara(id) {
  const v = VIEWS.find((x) => x.id === id) ?? VIEWS[0];
  if (viewAtual?.id === v.id) return;
  viewAtual?.desmontar?.(ctx);
  viewAtual = v;
  for (const a of abas.children) {
    if (a.dataset.view === v.id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  document.title = `${v.nome} · SAAE Angra dos Reis`;
  limpar(app).append(v.montar(ctx));
  app.scrollTop = 0;
  v.atualizar?.(ctx);
}

const rota = () => irPara((location.hash.match(/^#\/(.+)$/)?.[1] ?? '').trim());
addEventListener('hashchange', rota);

/* ─────────────────────────── alarmes na topbar ─────────────────────────── */

const badge = $('#badge-alarmes');
const badgeCont = $('#badge-cont');

badge.addEventListener('click', () => {
  drawer.abrir({
    titulo: 'Alarmes ativos',
    sub: 'Ordenados por severidade e horário',
    render: () => painelAlarmes(),
  });
});

function painelAlarmes() {
  const ativos = alarmes.ativos;
  if (!ativos.length) {
    return el('div', { class: 'vazio' }, [icone('ok'), 'Nenhum alarme ativo. Sistema em operação normal.']);
  }
  return [
    el('div', { class: 'linha', style: 'gap:8px' }, [
      el('button', { class: 'btn', text: 'Reconhecer todos', onclick: () => { alarmes.reconhecerTodos(); drawer.atualizar(); } }),
      el('span', { class: 'mut', text: `${ativos.length} ativo(s)` }),
    ]),
    el(
      'div',
      { class: 'alarmes', style: 'border:1px solid var(--borda);border-radius:var(--raio)' },
      ativos.map((a) => linhaAlarme(a, { agora: sim.tempo, aoReconhecer: (c) => { alarmes.reconhecer(c); drawer.atualizar(); } }))
    ),
  ];
}

/* ─────────────────────────── quiosque ─────────────────────────── */

let rotacao = null;
function alternarQuiosque() {
  document.body.classList.toggle('quiosque');
  if (document.body.classList.contains('quiosque')) document.documentElement.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
}
$('#btn-quiosque').addEventListener('click', alternarQuiosque);

addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  const k = e.key.toLowerCase();
  if (k === 'f') alternarQuiosque();
  // Rotação automática entre telas, para deixar o painel rodando sozinho.
  if (k === 'r') {
    if (rotacao) { clearInterval(rotacao); rotacao = null; }
    else {
      rotacao = setInterval(() => {
        const i = VIEWS.findIndex((v) => v.id === viewAtual?.id);
        location.hash = `#/${VIEWS[(i + 1) % VIEWS.length].id}`;
      }, 20000);
    }
  }
  // Atalho numérico para a apresentação: 1–5 saltam direto para a tela.
  const n = Number(k);
  if (n >= 1 && n <= VIEWS.length) location.hash = `#/${VIEWS[n - 1].id}`;
});

/* ─────────────────────────── laço principal ─────────────────────────── */

let ultimo = performance.now();

function laco() {
  const agora = performance.now();
  const dtReal = Math.min(agora - ultimo, 4000); // aba em segundo plano não "pula" horas
  ultimo = agora;

  // Alarmes avaliados a cada subpasso da física, não uma vez por quadro.
  sim.avancarReal(dtReal, (dt) => alarmes.avaliar(dt));

  $('#relogio-hora').textContent = hora(sim.tempo);
  $('#relogio-data').textContent = dataLonga(sim.tempo);

  const c = alarmes.contagem;
  badgeCont.textContent = String(c.total);
  badge.classList.toggle('tem-critico', c.critico > 0);
  badge.classList.toggle('tem-alerta', c.critico === 0 && c.alerta > 0);
  badge.classList.toggle('pulsa', c.critico > 0 && c.naoReconhecidos > 0);

  // Comunicação: as unidades com telemetria são as que têm CLP declarado.
  const clps = new Set(sim.unidadesComCLP ?? []);
  $('#clp-status').textContent = `CLPs ${clps.size || 7}/${clps.size || 7} online`;

  viewAtual?.atualizar?.(ctx);
  if (drawer.aberto) drawer.atualizar();
}

rota();
laco();
setInterval(laco, INTERVALO_MS);

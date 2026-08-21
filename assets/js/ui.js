/**
 * Peças de interface e formatação.
 *
 * Formatação é responsabilidade de um lugar só: número em painel de operação
 * precisa de separador decimal brasileiro, casas fixas e largura tabular. Se
 * cada tela formatasse do seu jeito, o painel denunciaria a colagem.
 */

/* ───────────────────────────── DOM ───────────────────────────── */

export function el(tag, attrs = {}, filhos = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const f of [].concat(filhos)) {
    if (f == null || f === false) continue;
    node.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return node;
}

const NS = 'http://www.w3.org/2000/svg';

export function svg(tag, attrs = {}, filhos = []) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const f of [].concat(filhos)) {
    if (f == null || f === false) continue;
    node.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return node;
}

export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
export const limpar = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };

/* ─────────────────────────── formatação ─────────────────────────── */

const cacheFmt = new Map();
function fmt(casas) {
  if (!cacheFmt.has(casas)) {
    cacheFmt.set(
      casas,
      new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
    );
  }
  return cacheFmt.get(casas);
}

export const num = (v, casas = 1) => (Number.isFinite(v) ? fmt(casas).format(v) : '—');
export const pct = (v, casas = 0) => `${num(v, casas)} %`;

const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtHoraCurta = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fmtData = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

export const hora = (t) => fmtHora.format(new Date(t));
export const horaCurta = (t) => fmtHoraCurta.format(new Date(t));
export const dataLonga = (t) => fmtData.format(new Date(t));

/** Duração relativa legível: "há 3 min", "há 2 h 14 min". */
export function desde(t, agora) {
  const s = Math.max(0, Math.round((agora - t) / 1000));
  if (s < 60) return `há ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  return `há ${h} h ${m % 60} min`;
}

/** Horímetro: 12.480 h */
export const horimetro = (h) => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(h)} h`;

/** L/s para m³/h quando o número fica mais legível na outra unidade. */
export const m3h = (ls) => ls * 3.6;

/* ───────────────────────────── ícones ───────────────────────────── */

const ICONES = {
  alerta: 'M12 2 1 21h22L12 2Zm0 6v6m0 3v.5',
  info: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-14v.5m0 3V17',
  ok: 'M20 6 9 17l-5-5',
  bomba: 'M12 3v6m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM3 9h6M12 3H8',
  gota: 'M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z',
  lupa: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35',
  sol: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m11.32 0 1.42 1.42M4.92 4.92l1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  lua: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  tela: 'M3 5h18v11H3zM8 20h8M12 16v4',
  x: 'M18 6 6 18M6 6l12 12',
  mais: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  alvo: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-6a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z',
};

export function icone(nome, extra = {}) {
  return svg(
    'svg',
    { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra },
    [svg('path', { d: ICONES[nome] ?? ICONES.info })]
  );
}

/* ──────────────────────────── componentes ──────────────────────────── */

/** Classificação de estado a partir de faixa normativa. */
export function estadoFaixa(valor, { min = -Infinity, max = Infinity } = {}, folga = 0.12) {
  if (valor < min || valor > max) return 'critico';
  const amplitude = (max === Infinity || min === -Infinity) ? 0 : (max - min) * folga;
  if (amplitude && (valor < min + amplitude || valor > max - amplitude)) return 'atencao';
  return 'ok';
}

export const ROTULO_ESTADO = { ok: 'Normal', atencao: 'Atenção', serio: 'Grave', critico: 'Crítico', parada: 'Parada' };

/** Chip de status: cor + ponto + rótulo textual, nunca cor sozinha. */
export function chip(estado, texto) {
  return el('span', { class: `chip ${estado}` }, [el('i', { class: 'ponto' }), texto ?? ROTULO_ESTADO[estado] ?? estado]);
}

/**
 * Cartão de indicador. `spark` recebe um <svg> já montado.
 */
export function kpi({ rotulo, valor, unidade, sub, estado, spark }) {
  return el('div', { class: `kpi${estado && estado !== 'ok' ? ` estado-${estado}` : ''}` }, [
    el('div', { class: 'kpi-rotulo', title: rotulo, text: rotulo }),
    el('div', { class: 'kpi-linha' }, [
      el('span', { class: 'kpi-valor', text: valor }),
      unidade && el('span', { class: 'kpi-unidade', text: unidade }),
    ]),
    sub && el('div', { class: 'kpi-sub', text: sub }),
    spark && el('div', { class: 'kpi-spark' }, [spark]),
  ]);
}

export function card({ titulo, meta, corpo, classe = '', padding = true }) {
  return el('section', { class: `card ${classe}` }, [
    titulo &&
      el('header', { class: 'card-cab' }, [
        el('h2', { class: 'card-titulo', text: titulo }),
        meta && el('div', { class: 'card-meta' }, [].concat(meta)),
      ]),
    el('div', { class: `card-corpo${padding ? '' : ' sem-pad'}` }, [].concat(corpo ?? [])),
  ]);
}

/** Barra com faixa aceitável e marcador do valor — para parâmetros normativos. */
export function faixaNormativa({ nome, valor, limite, casas = 2, unidade = '' }) {
  const min = limite.min ?? 0;
  const max = limite.max ?? 1;
  // A escala mostra 25 % além da faixa em cada lado, senão um valor fora
  // do limite fica encostado na borda e não dá para ver o quanto passou.
  const folga = (max - min) * 0.25;
  const escMin = min - folga;
  const escMax = max + folga;
  const posicao = (v) => `${Math.min(100, Math.max(0, ((v - escMin) / (escMax - escMin)) * 100))}%`;
  const fora = valor < min || valor > max;

  return el('div', { class: 'faixa' }, [
    el('div', { class: 'faixa-topo' }, [
      el('span', { class: 'faixa-nome', text: nome }),
      el('span', { class: `faixa-valor${fora ? ' ' : ''}`, style: fora ? 'color:var(--critico)' : '', text: `${num(valor, casas)}${unidade ? ` ${unidade}` : ''}` }),
    ]),
    el('div', { class: 'faixa-trilho' }, [
      el('i', { class: 'faixa-ok-zona', style: `left:${posicao(min)};right:calc(100% - ${posicao(max)})` }),
      el('i', { class: `faixa-marcador${fora ? ' fora' : ''}`, style: `left:${posicao(valor)}` }),
    ]),
    el('div', { class: 'faixa-legenda' }, [
      el('span', { text: num(min, casas) }),
      el('span', { text: `faixa ${num(min, casas)}–${num(max, casas)}` }),
      el('span', { text: num(max, casas) }),
    ]),
  ]);
}

/** Lista de pares rótulo/valor. */
export function pares(itens) {
  const dl = el('dl', { class: 'pares' });
  for (const [k, v] of itens) {
    if (v == null) continue;
    dl.append(el('dt', { text: k }), el('dd', { text: v }));
  }
  return dl;
}

/**
 * Linha de alarme — usada na Visão Geral e no drawer da topbar.
 * Severidade aparece como cor DA FAIXA + ícone + texto: nunca só cor.
 */
export function linhaAlarme(a, { agora, aoReconhecer }) {
  return el('div', { class: `alarme ${a.info.severidade}${a.reconhecido ? ' reconhecido' : ''}` }, [
    el('i', { class: 'alarme-faixa' }),
    el('div', { class: 'alarme-txt' }, [
      el('div', { class: 'alarme-titulo' }, [
        icone(a.info.severidade === 'info' ? 'info' : 'alerta'),
        a.info.titulo,
      ]),
      el('div', { class: 'alarme-meta', text: `${a.info.origem} · ${a.info.detalhe?.() ?? ''}` }),
    ]),
    el('div', { class: 'alarme-dir' }, [
      el('span', { text: desde(a.desde, agora) }),
      a.reconhecido
        ? chip('ok', 'Reconhecido')
        : el('button', {
            class: 'btn', text: 'Reconhecer',
            onclick: (e) => { e.stopPropagation(); aoReconhecer?.(a.chave); },
          }),
    ]),
  ]);
}

/* ──────────────────────────── drawer ──────────────────────────── */

export class Drawer {
  constructor() {
    this.fundo = el('div', { class: 'drawer-fundo', onclick: () => this.fechar() });
    this.titulo = el('div', { class: 'drawer-titulo' });
    this.sub = el('div', { class: 'drawer-sub' });
    this.corpo = el('div', { class: 'drawer-corpo' });
    this.node = el('aside', { class: 'drawer', role: 'dialog', 'aria-modal': 'false' }, [
      el('div', { class: 'drawer-cab' }, [
        el('div', {}, [this.titulo, this.sub]),
        el('button', { class: 'btn btn-icone', style: 'margin-left:auto', 'aria-label': 'Fechar', onclick: () => this.fechar() }, [icone('x')]),
      ]),
      this.corpo,
    ]);
    document.body.append(this.fundo, this.node);
    this.aoAtualizar = null;
    addEventListener('keydown', (e) => { if (e.key === 'Escape') this.fechar(); });
  }

  abrir({ titulo, sub, render }) {
    this.titulo.textContent = titulo;
    this.sub.textContent = sub ?? '';
    this.render = render;
    this.aberto = true;
    this.fundo.classList.add('aberto');
    this.node.classList.add('aberto');
    this.atualizar();
  }

  atualizar() {
    if (!this.aberto || !this.render) return;
    limpar(this.corpo).append(...[].concat(this.render()));
  }

  fechar() {
    this.aberto = false;
    this.render = null;
    this.fundo.classList.remove('aberto');
    this.node.classList.remove('aberto');
  }
}

/* ───────────────────────── dica flutuante ───────────────────────── */

export class Dica {
  constructor(classe = 'gr-dica') {
    this.node = el('div', { class: classe, style: 'display:none' });
    document.body.append(this.node);
  }

  mostrar(x, y, conteudo) {
    limpar(this.node).append(...[].concat(conteudo));
    this.node.style.display = '';
    const r = this.node.getBoundingClientRect();
    // Vira o lado quando encosta na borda: dica cortada é pior que dica torta.
    const px = x + 14 + r.width > innerWidth ? x - r.width - 14 : x + 14;
    const py = Math.min(Math.max(8, y - r.height / 2), innerHeight - r.height - 8);
    this.node.style.left = `${px}px`;
    this.node.style.top = `${py}px`;
  }

  esconder() {
    this.node.style.display = 'none';
  }
}

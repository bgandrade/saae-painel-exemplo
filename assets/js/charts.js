/**
 * Gráficos em SVG, sem biblioteca.
 *
 * Escritos à mão por dois motivos: o painel não pode depender de CDN (tem que
 * abrir num auditório sem internet) e o controle fino do traço é o que faz
 * cinco telas parecerem um sistema só em vez de cinco gráficos colados.
 *
 * Regras seguidas em todos eles:
 *   • eixo Y único — nunca dois eixos no mesmo gráfico;
 *   • traço de 2 px, grade e eixos recessivos;
 *   • ≥ 2 séries sempre com legenda, e até 4 também com rótulo direto, para
 *     que a identidade nunca dependa só da cor;
 *   • crosshair com tooltip em tudo que é linha ou área;
 *   • paleta categórica em ordem fixa, nunca ciclada.
 */

import { el, svg, limpar, num, horaCurta, Dica } from './ui.js';

export const CORES_SERIE = ['var(--serie-1)', 'var(--serie-2)', 'var(--serie-3)', 'var(--serie-4)', 'var(--serie-5)'];

const dica = new Dica('gr-dica');

/** Escala linear simples. */
const escala = (d0, d1, r0, r1) => (v) => (d1 === d0 ? r0 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));

/** Domínio "redondo" que não fica dançando a cada tick. */
function dominio(valores, { min, max, folga = 0.12, zero = false } = {}) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of valores) {
    if (!Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (lo === Infinity) { lo = 0; hi = 1; }
  if (zero) lo = Math.min(lo, 0);
  const amp = hi - lo || Math.abs(hi) || 1;
  lo -= amp * folga;
  hi += amp * folga;
  if (min != null) lo = Math.min(lo, min);
  if (max != null) hi = Math.max(hi, max);
  // Grandeza que não pode ser negativa não ganha eixo negativo por causa da
  // folga — vazão em −20 L/s desmente o gráfico inteiro.
  if (zero && lo < 0) lo = 0;
  // Arredonda para um passo legível — assim o eixo não muda de número a cada
  // segundo só porque o máximo oscilou na terceira casa.
  const passo = Math.pow(10, Math.floor(Math.log10((hi - lo) / 4 || 1)));
  const mult = [1, 2, 2.5, 5, 10].find((m) => (hi - lo) / (passo * m) <= 5) ?? 10;
  const p = passo * mult;
  return [Math.floor(lo / p) * p, Math.ceil(hi / p) * p, p];
}

/* ══════════════════════ gráfico de linha temporal ══════════════════════ */

export class GraficoLinha {
  /**
   * @param {object} o
   * @param {number} o.altura      altura em px
   * @param {string} o.unidade     sufixo mostrado no tooltip e no eixo
   * @param {number} o.casas       casas decimais
   * @param {boolean} o.area       preenche sob a linha (só faz sentido com 1 série)
   * @param {{min:number,max:number}} o.faixa  faixa normativa sombreada
   * @param {number[]} o.limites   linhas tracejadas de limite
   */
  constructor(o = {}) {
    this.o = {
      altura: 190, unidade: '', casas: 1, area: false, zero: false,
      margem: { t: 12, r: 52, b: 22, l: 46 },
      ...o,
    };
    this.svg = svg('svg', { class: 'gr', role: 'img' });
    this.node = el('div', {}, [this.svg]);
    this.series = [];
    this._ro = new ResizeObserver(() => this._desenhar());
    this._ro.observe(this.node);
    this._ligarHover();
  }

  /** @param {{nome:string,cor:string,t:ArrayLike<number>,v:ArrayLike<number>}[]} series */
  atualizar(series) {
    this.series = series.filter((s) => s.v?.length);
    this._desenhar();
    return this;
  }

  _desenhar() {
    const larg = this.node.clientWidth || 600;
    const { altura, margem: m } = this.o;
    const g = limpar(this.svg);
    this.svg.setAttribute('viewBox', `0 0 ${larg} ${altura}`);
    this.svg.setAttribute('height', altura);
    if (!this.series.length) return;

    const x0 = m.l;
    const x1 = larg - m.r;
    const y0 = altura - m.b;
    const y1 = m.t;
    if (x1 <= x0) return;

    const todos = [];
    for (const s of this.series) for (const v of s.v) todos.push(v);
    if (this.o.faixa) todos.push(this.o.faixa.min, this.o.faixa.max);
    for (const l of this.o.limites ?? []) todos.push(l);
    const [ymin, ymax, passoY] = dominio(todos, { zero: this.o.zero });

    const base = this.series[0];
    const tmin = base.t[0];
    const tmax = base.t[base.t.length - 1];
    const ex = escala(tmin, tmax, x0, x1);
    const ey = escala(ymin, ymax, y0, y1);
    this._ctx = { ex, ey, x0, x1, y0, y1, tmin, tmax };

    /* grade horizontal + rótulos do eixo Y */
    for (let v = ymin; v <= ymax + 1e-9; v += passoY) {
      const y = ey(v);
      g.append(svg('line', { class: 'grade-linha', x1: x0, x2: x1, y1: y, y2: y }));
      g.append(svg('text', { x: x0 - 7, y: y + 3.5, 'text-anchor': 'end', text: num(v, this.o.casas) }));
    }

    /* faixa normativa e limites */
    if (this.o.faixa) {
      const ya = ey(Math.min(this.o.faixa.max, ymax));
      const yb = ey(Math.max(this.o.faixa.min, ymin));
      g.append(svg('rect', { class: 'faixa-norma', x: x0, y: ya, width: x1 - x0, height: Math.max(0, yb - ya) }));
    }
    for (const lim of this.o.limites ?? []) {
      if (lim < ymin || lim > ymax) continue;
      g.append(svg('line', { class: 'limite-linha', x1: x0, x2: x1, y1: ey(lim), y2: ey(lim) }));
    }

    /* eixo do tempo: marcas de hora legíveis */
    const horas = (tmax - tmin) / 3600000;
    const passoH = horas > 18 ? 6 : horas > 8 ? 3 : horas > 3 ? 1 : 0.5;
    const d = new Date(tmin);
    d.setMinutes(0, 0, 0);
    for (let t = d.getTime(); t <= tmax; t += passoH * 3600000) {
      if (t < tmin) continue;
      const x = ex(t);
      g.append(svg('line', { class: 'grade-linha', x1: x, x2: x, y1: y1, y2: y0, opacity: 0.55 }));
      g.append(svg('text', { x, y: y0 + 14, 'text-anchor': 'middle', text: horaCurta(t) }));
    }
    g.append(svg('line', { class: 'eixo-linha', x1: x0, x2: x1, y1: y0, y2: y0 }));

    /* as marcas */
    const umaSerie = this.series.length === 1;
    const rotulos = [];
    this.series.forEach((s, i) => {
      const cor = s.cor ?? CORES_SERIE[i % CORES_SERIE.length];
      let dPath = '';
      for (let k = 0; k < s.v.length; k++) {
        dPath += `${k ? 'L' : 'M'}${ex(s.t[k]).toFixed(1)} ${ey(s.v[k]).toFixed(1)}`;
      }
      if (this.o.area && umaSerie) {
        g.append(
          svg('path', {
            class: 'marca-area',
            d: `${dPath}L${ex(s.t[s.t.length - 1]).toFixed(1)} ${y0}L${ex(s.t[0]).toFixed(1)} ${y0}Z`,
            fill: cor,
            opacity: 0.13,
          })
        );
      }
      g.append(svg('path', { class: 'marca-linha', d: dPath, stroke: cor }));

      // Rótulo direto ao fim da linha: até 4 séries, para que a identidade
      // não dependa só da cor (a legenda cobre o resto). A posição é ajustada
      // depois, em bloco, para que duas séries que terminam no mesmo valor não
      // imprimam um rótulo por cima do outro.
      if (this.series.length <= 4 && s.nome) {
        rotulos.push({ y: ey(s.v[s.v.length - 1]), cor, nome: s.nome });
      }
    });

    if (rotulos.length) {
      const ALTURA_ROT = 12;
      rotulos.sort((a, b) => a.y - b.y);
      // Empurra para baixo o que colidir, depois reacomoda quem passou do fim.
      for (let i = 1; i < rotulos.length; i++) {
        if (rotulos[i].y - rotulos[i - 1].y < ALTURA_ROT) rotulos[i].y = rotulos[i - 1].y + ALTURA_ROT;
      }
      const excesso = rotulos[rotulos.length - 1].y - y0;
      if (excesso > 0) for (const r of rotulos) r.y -= excesso;
      for (const r of rotulos) {
        g.append(
          svg('text', {
            class: 'rotulo-serie', x: x1 + 6, y: Math.max(y1 + 8, r.y) + 3.5, fill: r.cor,
            text: r.nome.length > 10 ? `${r.nome.slice(0, 9)}…` : r.nome,
          })
        );
      }
    }

    /* camada de hover */
    this._cursor = svg('g', { style: 'display:none;pointer-events:none' });
    this._cursorLinha = svg('line', { class: 'eixo-linha', y1: y1, y2: y0, opacity: 0.85 });
    this._cursorPontos = svg('g');
    this._cursor.append(this._cursorLinha, this._cursorPontos);
    g.append(this._cursor);
    g.append(
      svg('rect', {
        x: x0, y: y1, width: x1 - x0, height: y0 - y1,
        fill: 'transparent', style: 'cursor:crosshair',
      })
    );
  }

  _ligarHover() {
    this.svg.addEventListener('mousemove', (ev) => {
      const c = this._ctx;
      if (!c || !this.series.length) return;
      const r = this.svg.getBoundingClientRect();
      const escalaX = this.svg.viewBox.baseVal.width / r.width || 1;
      const px = (ev.clientX - r.left) * escalaX;
      if (px < c.x0 - 4 || px > c.x1 + 4) return this._esconder();

      const base = this.series[0];
      const alvo = c.tmin + ((px - c.x0) / (c.x1 - c.x0)) * (c.tmax - c.tmin);
      // Busca binária: com 1440 pontos e 60 fps, varredura linear pesaria.
      let lo = 0;
      let hi = base.t.length - 1;
      while (hi - lo > 1) {
        const meio = (lo + hi) >> 1;
        if (base.t[meio] < alvo) lo = meio; else hi = meio;
      }
      const i = alvo - base.t[lo] < base.t[hi] - alvo ? lo : hi;

      const x = c.ex(base.t[i]);
      this._cursor.style.display = '';
      this._cursorLinha.setAttribute('x1', x);
      this._cursorLinha.setAttribute('x2', x);
      const pontos = limpar(this._cursorPontos);
      const linhas = [];
      this.series.forEach((s, k) => {
        const cor = s.cor ?? CORES_SERIE[k % CORES_SERIE.length];
        const v = s.v[Math.min(i, s.v.length - 1)];
        // Anel na cor da superfície: separa o ponto da linha por baixo.
        pontos.append(svg('circle', { cx: x, cy: c.ey(v), r: 4, fill: cor, stroke: 'var(--superficie)', 'stroke-width': 2 }));
        linhas.push(
          el('div', { class: 'gr-dica-linha' }, [
            el('span', { class: 'linha' }, [el('i', { class: 'gr-dica-marca', style: `background:${cor}` }), s.nome ?? '']),
            el('b', { text: `${num(v, this.o.casas)}${this.o.unidade ? ` ${this.o.unidade}` : ''}` }),
          ])
        );
      });
      dica.mostrar(ev.clientX, ev.clientY, [
        el('div', { class: 'gr-dica-hora', text: horaCurta(base.t[i]) }),
        ...linhas,
      ]);
    });
    this.svg.addEventListener('mouseleave', () => this._esconder());
  }

  _esconder() {
    if (this._cursor) this._cursor.style.display = 'none';
    dica.esconder();
  }
}

/** Legenda — obrigatória a partir de duas séries. */
export function legenda(itens) {
  return el(
    'div',
    { class: 'legenda' },
    itens.map((it, i) =>
      el('span', { class: 'legenda-item' }, [
        el('i', { class: 'legenda-marca', style: `background:${it.cor ?? CORES_SERIE[i % CORES_SERIE.length]}` }),
        it.nome,
      ])
    )
  );
}

/* ══════════════════════════ sparkline ══════════════════════════ */

export function sparkline(t, v, { cor = 'var(--serie-1)', altura = 26, area = true } = {}) {
  const larg = 100;
  const s = svg('svg', { class: 'gr', viewBox: `0 0 ${larg} ${altura}`, preserveAspectRatio: 'none', height: altura, style: 'width:100%' });
  if (!v?.length) return s;
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of v) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const amp = hi - lo || 1;
  const ex = (i) => (i / (v.length - 1 || 1)) * larg;
  const ey = (x) => altura - 2 - ((x - lo) / amp) * (altura - 4);
  let d = '';
  // Com 1440 pontos em 100 px, desenhar todos é desperdício: reduzo o passo.
  const passo = Math.max(1, Math.floor(v.length / 120));
  for (let i = 0; i < v.length; i += passo) d += `${d ? 'L' : 'M'}${ex(i).toFixed(1)} ${ey(v[i]).toFixed(1)}`;
  d += `L${ex(v.length - 1).toFixed(1)} ${ey(v[v.length - 1]).toFixed(1)}`;
  if (area) s.append(svg('path', { d: `${d}L${larg} ${altura}L0 ${altura}Z`, fill: cor, opacity: 0.14, stroke: 'none' }));
  s.append(svg('path', { d, fill: 'none', stroke: cor, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }));
  return s;
}

/* ══════════════════════════ gauge radial ══════════════════════════ */

const polar = (cx, cy, r, ang) => [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];

function arco(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * Gauge de 260°. `faixaOk` sombreia a zona nominal — é o que transforma
 * "168 A" em "168 A, dentro do esperado" sem o operador ter que lembrar.
 */
export function gauge({ valor, min = 0, max = 100, faixaOk, rotulo, unidade = '', casas = 0, cor = 'var(--serie-1)', tamanho = 96 }) {
  const A0 = Math.PI * 0.72;
  const A1 = Math.PI * 2.28;
  const cx = tamanho / 2;
  const cy = tamanho / 2;
  const r = tamanho / 2 - 8;
  const frac = (v) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const ang = (v) => A0 + frac(v) * (A1 - A0);

  const s = svg('svg', { class: 'gauge', viewBox: `0 0 ${tamanho} ${tamanho}`, width: tamanho, height: tamanho });
  s.append(svg('path', { class: 'trilha', d: arco(cx, cy, r, A0, A1), fill: 'none', 'stroke-width': 7 }));
  if (faixaOk) {
    s.append(
      svg('path', { class: 'faixa-ok', d: arco(cx, cy, r, ang(faixaOk.min), ang(faixaOk.max)), fill: 'none', 'stroke-width': 7 })
    );
  }
  if (valor > min) {
    s.append(svg('path', { class: 'arco', d: arco(cx, cy, r, A0, ang(valor)), fill: 'none', stroke: cor, 'stroke-width': 7 }));
  }
  return el('div', { class: 'gauge-wrap' }, [
    el('div', { style: 'position:relative;line-height:0' }, [
      s,
      el('div', { style: 'position:absolute;inset:0;display:grid;place-items:center;line-height:1.1;text-align:center' }, [
        el('div', {}, [
          el('div', { class: 'gauge-valor', text: num(valor, casas) }),
          el('div', { class: 'gauge-rot', text: unidade }),
        ]),
      ]),
    ]),
    rotulo && el('div', { class: 'gauge-rot', text: rotulo }),
  ]);
}

/* ══════════════════════ barra empilhada horizontal ══════════════════════ */

/** Segmentos com 2 px de superfície entre eles, como manda a especificação. */
export function barraEmpilhada(segmentos, { altura = 26, unidade = '' } = {}) {
  const total = segmentos.reduce((s, x) => s + Math.max(0, x.valor), 0) || 1;
  const barra = el('div', { style: `display:flex;gap:2px;height:${altura}px;border-radius:4px;overflow:hidden` });
  for (const seg of segmentos) {
    const p = (Math.max(0, seg.valor) / total) * 100;
    if (p <= 0) continue;
    barra.append(
      el('i', {
        style: `flex:0 0 ${p}%;background:${seg.cor};display:grid;place-items:center;font-size:var(--t-xs);color:#fff;font-weight:600`,
        title: `${seg.nome}: ${num(seg.valor, 1)} ${unidade}`,
        text: p > 11 ? `${num(p, 0)}%` : '',
      })
    );
  }
  return el('div', {}, [
    barra,
    el(
      'div',
      { class: 'legenda', style: 'padding:8px 0 0' },
      segmentos.map((seg) =>
        el('span', { class: 'legenda-item' }, [
          el('i', { class: 'legenda-marca', style: `background:${seg.cor}` }),
          `${seg.nome} · ${num(seg.valor, 1)} ${unidade}`,
        ])
      )
    ),
  ]);
}

/* ══════════════════════ timeline de operação (Gantt) ══════════════════════ */

/**
 * Converte a série 0/1 de cada bomba em blocos contínuos. É a leitura que o
 * operador realmente quer: não "quantas partidas", mas "quando esteve ligada".
 */
export function gantt(faixas, { horas = 24 } = {}) {
  const wrap = el('div', { class: 'gantt' });
  for (const f of faixas) {
    const trilho = el('div', { class: 'gantt-faixa' });
    const { v } = f;
    const n = v.length;
    let i = 0;
    while (i < n) {
      if (v[i] < 0.5) { i++; continue; }
      const inicio = i;
      while (i < n && v[i] >= 0.5) i++;
      const esq = (inicio / n) * 100;
      const larg = ((i - inicio) / n) * 100;
      trilho.append(
        el('i', {
          class: `gantt-blk${f.falha ? ' falha' : ''}`,
          style: `left:${esq}%;width:${Math.max(larg, 0.35)}%`,
        })
      );
    }
    wrap.append(el('div', { class: 'gantt-rot', text: f.nome, title: f.nome }), trilho);
  }
  const eixo = el('div', { class: 'gantt-eixo' });
  for (let h = horas; h >= 0; h -= horas / 4) eixo.append(el('span', { text: h === 0 ? 'agora' : `−${h} h` }));
  wrap.append(eixo);
  return wrap;
}

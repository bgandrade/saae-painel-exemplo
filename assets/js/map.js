/**
 * Mapa vetorial de Angra dos Reis.
 *
 * Sem biblioteca de mapas e sem tiles: o contorno real do IBGE vem embutido e
 * é projetado aqui mesmo. Isso resolve três coisas de uma vez — o painel abre
 * num auditório sem internet, o desenho herda as cores do tema (um mapa de
 * ruas destoaria de um sinóptico de sala de controle) e não há requisição
 * externa nenhuma para atrasar a primeira pintura.
 *
 * O detalhe que mais mexeu no desenho: as unidades continentais ocupam cerca
 * de um sexto da largura do município e a ETE Abraão fica isolada na Ilha
 * Grande. Enquadrar tudo empilharia os marcadores num canto, então a vista
 * padrão é a área operacional, com presets, minimapa e rótulos que só
 * aparecem quando há espaço para eles.
 */

import { BBOX, POLIGONOS } from '../data/angra-geo.js';
import { UNIDADES, LINHAS, LOCALIDADES, SETORES, VISTAS, TIPOS } from '../data/topologia.js';
import { el, svg, limpar, num, icone, Dica } from './ui.js';

/* ─────────────────────────── projeção ─────────────────────────── */

const rad = (g) => (g * Math.PI) / 180;
/** Mercator: preserva ângulo, que é o que faz o litoral recortado de Angra
 *  continuar reconhecível. Em escala municipal a distorção é irrelevante. */
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

const LARGURA = 1000;
const escalaX = LARGURA / (rad(BBOX.maxLon) - rad(BBOX.minLon));
const ALTURA = (mercY(BBOX.maxLat) - mercY(BBOX.minLat)) * escalaX;

export const projetar = (lon, lat) => [
  (rad(lon) - rad(BBOX.minLon)) * escalaX,
  (mercY(BBOX.maxLat) - mercY(lat)) * escalaX,
];

/** Quilômetros → unidades do desenho, na latitude de Angra. */
const kmParaUnidades = (km) => (km / 111.32) * (Math.PI / 180) * escalaX;

const FORMAS = {
  captacao: (r) => `M0 ${-r * 1.15}L${r} ${r * 0.7}L${-r} ${r * 0.7}Z`,
  reservatorio: (r) => `M${-r * 0.92} ${-r * 0.92}H${r * 0.92}V${r * 0.92}H${-r * 0.92}Z`,
  elevatoria: (r) => `M0 ${-r}A${r} ${r} 0 1 1 0 ${r}A${r} ${r} 0 1 1 0 ${-r}Z`,
  ete: (r) => `M0 ${-r * 1.2}L${r * 1.05} ${-r * 0.6}V${r * 0.6}L0 ${r * 1.2}L${-r * 1.05} ${r * 0.6}V${-r * 0.6}Z`,
  eee: (r) => `M0 ${-r * 1.2}L${r * 1.2} 0L0 ${r * 1.2}L${-r * 1.2} 0Z`,
};

/* ─────────────────────────── o mapa ─────────────────────────── */

export class Mapa {
  constructor({ altura = 520, aoSelecionar = null, interativo = true } = {}) {
    this.altura = altura;
    this.aoSelecionar = aoSelecionar;
    this.filtroSistema = 'ambos';
    this.selecionada = null;
    this.dica = new Dica('mapa-dica');

    this.svg = svg('svg', { class: 'mapa', height: altura });
    this.gEstatico = svg('g');
    this.gSetores = svg('g');
    this.gLinhas = svg('g');
    this.gRotulos = svg('g');
    this.gUnidades = svg('g');
    this.svg.append(this.gEstatico, this.gSetores, this.gLinhas, this.gRotulos, this.gUnidades);

    this._montarEstatico();
    this._montarControles();

    this.node = el('div', { class: 'mapa-wrap' }, [
      this.svg,
      this.controles,
      this.zoomBtns,
      this._montarLegenda(),
      this.miniWrap,
      el('div', { class: 'mapa-nota', text: 'Contorno: IBGE · rede e setores estimados' }),
    ]);

    this.definirVista(VISTAS.find((v) => v.padrao)?.id ?? 'operacional');
    if (interativo) this._ligarInteracao();
    this._ro = new ResizeObserver(() => this._aplicarViewBox());
    this._ro.observe(this.node);
  }

  /* ── camadas fixas: mar, terra, rótulos de localidade ── */

  _montarEstatico() {
    const g = this.gEstatico;
    g.append(svg('rect', { class: 'mar', x: -LARGURA, y: -ALTURA, width: LARGURA * 3, height: ALTURA * 3 }));
    // Maior primeiro: continente e Ilha Grande por baixo, ilhotas por cima.
    for (const poly of POLIGONOS) {
      let d = '';
      for (let i = 0; i < poly.length; i++) {
        const [x, y] = projetar(poly[i][0], poly[i][1]);
        d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      g.append(svg('path', { class: 'terra', d: `${d}Z` }));
    }
  }

  _montarControles() {
    this.controles = el('div', { class: 'mapa-controles' }, [
      el(
        'div',
        { class: 'segmentado' },
        VISTAS.map((v) =>
          el('button', {
            type: 'button', text: v.nome, dataset: { vista: v.id },
            'aria-pressed': String(!!v.padrao),
            onclick: () => this.definirVista(v.id),
          })
        )
      ),
      el('div', { class: 'segmentado' }, [
        ['ambos', 'Ambos'], ['agua', 'Água'], ['esgoto', 'Esgoto'],
      ].map(([id, rot]) =>
        el('button', {
          type: 'button', text: rot, dataset: { sistema: id },
          'aria-pressed': String(id === 'ambos'),
          onclick: () => this.definirSistema(id),
        })
      )),
    ]);

    this.zoomBtns = el('div', { class: 'mapa-zoom' }, [
      el('button', { class: 'btn btn-icone', 'aria-label': 'Aproximar', onclick: () => this._zoom(0.7) }, [icone('mais')]),
      el('button', { class: 'btn btn-icone', 'aria-label': 'Afastar', onclick: () => this._zoom(1 / 0.7) }, [icone('menos')]),
    ]);

    // Minimapa: mostra onde a vista atual está dentro do município.
    this.miniVista = svg('rect', { class: 'vista', rx: 2 });
    const mini = svg('svg', { viewBox: `0 0 ${LARGURA} ${ALTURA}` });
    for (const poly of POLIGONOS) {
      let d = '';
      for (let i = 0; i < poly.length; i++) {
        const [x, y] = projetar(poly[i][0], poly[i][1]);
        d += `${i ? 'L' : 'M'}${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      mini.append(svg('path', { class: 'terra', d: `${d}Z` }));
    }
    mini.append(this.miniVista);
    this.miniWrap = el('div', { class: 'minimapa' }, [mini]);
  }

  _montarLegenda() {
    const item = (forma, cor, texto) =>
      el('div', { class: 'mapa-legenda-linha' }, [
        svg('svg', { width: 13, height: 13, viewBox: '-7 -7 14 14' }, [
          svg('path', { d: FORMAS[forma](5), fill: cor, stroke: 'var(--superficie)', 'stroke-width': 1 }),
        ]),
        texto,
      ]);
    return el('div', { class: 'mapa-legenda' }, [
      item('captacao', 'var(--agua)', 'Captação'),
      item('reservatorio', 'var(--agua)', 'Reservatório'),
      item('elevatoria', 'var(--agua)', 'Elevatória'),
      item('ete', 'var(--esgoto)', 'ETE'),
      item('eee', 'var(--esgoto)', 'Elevatória de esgoto'),
    ]);
  }

  /* ── enquadramento ── */

  definirVista(id) {
    const v = VISTAS.find((x) => x.id === id) ?? VISTAS[0];
    for (const b of this.controles.querySelectorAll('[data-vista]')) {
      b.setAttribute('aria-pressed', String(b.dataset.vista === v.id));
    }
    const bb = v.bbox ?? BBOX;
    const [x0, y1] = projetar(bb.minLon, bb.minLat);
    const [x1, y0] = projetar(bb.maxLon, bb.maxLat);
    // Margem de 6 %: marcador colado na borda fica ilegível.
    const mx = (x1 - x0) * 0.06;
    const my = (y1 - y0) * 0.06;
    this.vista = { x: x0 - mx, y: y0 - my, w: x1 - x0 + mx * 2, h: y1 - y0 + my * 2 };
    this._aplicarViewBox();
  }

  definirSistema(sistema) {
    this.filtroSistema = sistema;
    for (const b of this.controles.querySelectorAll('[data-sistema]')) {
      b.setAttribute('aria-pressed', String(b.dataset.sistema === sistema));
    }
    this._redesenharDinamico();
  }

  /** Ajusta o viewBox à proporção real do contêiner e sincroniza o minimapa. */
  _aplicarViewBox() {
    const larg = this.node.clientWidth || 900;
    const alt = this.altura;
    const razaoTela = alt / larg;
    let { x, y, w, h } = this.vista;
    // Encaixa preservando a proporção: o bbox pedido cabe inteiro dentro.
    if (h / w < razaoTela) {
      const novoH = w * razaoTela;
      y -= (novoH - h) / 2;
      h = novoH;
    } else {
      const novoW = h / razaoTela;
      x -= (novoW - w) / 2;
      w = novoW;
    }
    this.vb = { x, y, w, h };
    this.svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    this.miniVista.setAttribute('x', x);
    this.miniVista.setAttribute('y', y);
    this.miniVista.setAttribute('width', w);
    this.miniVista.setAttribute('height', h);
    this._redesenharDinamico();
  }

  _zoom(fator, cx = null, cy = null) {
    const { x, y, w, h } = this.vb;
    const px = cx ?? x + w / 2;
    const py = cy ?? y + h / 2;
    // Limites: nem além do município inteiro, nem abaixo de ~800 m de largura.
    const novoW = Math.min(Math.max(w * fator, LARGURA * 0.008), LARGURA * 1.3);
    const k = novoW / w;
    this.vista = { x: px - (px - x) * k, y: py - (py - y) * k, w: novoW, h: h * k };
    this._aplicarViewBox();
  }

  _ligarInteracao() {
    let arrastando = false;
    let ini = null;

    this.svg.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.unidade')) return;
      arrastando = true;
      ini = { x: e.clientX, y: e.clientY, vb: { ...this.vb } };
      this.svg.classList.add('arrastando');
      this.svg.setPointerCapture(e.pointerId);
    });
    this.svg.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      const r = this.svg.getBoundingClientRect();
      const k = ini.vb.w / r.width;
      this.vista = {
        ...ini.vb,
        x: ini.vb.x - (e.clientX - ini.x) * k,
        y: ini.vb.y - (e.clientY - ini.y) * k,
      };
      this._aplicarViewBox();
    });
    const soltar = (e) => {
      arrastando = false;
      this.svg.classList.remove('arrastando');
      if (e.pointerId != null && this.svg.hasPointerCapture?.(e.pointerId)) this.svg.releasePointerCapture(e.pointerId);
    };
    this.svg.addEventListener('pointerup', soltar);
    this.svg.addEventListener('pointercancel', soltar);

    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = this.svg.getBoundingClientRect();
      const k = this.vb.w / r.width;
      this._zoom(e.deltaY > 0 ? 1.16 : 1 / 1.16, this.vb.x + (e.clientX - r.left) * k, this.vb.y + (e.clientY - r.top) * k);
    }, { passive: false });
  }

  /* ── camadas dinâmicas ── */

  /** Chamado a cada tick: só o que muda é redesenhado. */
  atualizar(sim, alarmes) {
    this.sim = sim;
    this.alarmes = alarmes;
    this._redesenharDinamico();
  }

  _redesenharDinamico() {
    const sim = this.sim;
    // Marcadores mantêm tamanho em pixels: sem isso, aproximar vira um borrão.
    const k = this.vb ? this.vb.w / (this.node.clientWidth || 900) : 1;
    const r = 7 * k;
    const mostrarRotulos = this.vb ? this.vb.w < LARGURA * 0.35 : false;

    /* setores, coloridos pelo estado da pressão */
    const gs = limpar(this.gSetores);
    if (sim && this.filtroSistema !== 'esgoto') {
      for (const s of SETORES) {
        if (!s.centro) continue;
        const est = sim.setores.get(s.id);
        const p = est?.pressaoMca ?? 0;
        const cor = p < 10 ? 'var(--critico)' : p < 15 ? 'var(--atencao)' : 'var(--ok)';
        const [cx, cy] = projetar(s.centro[0], s.centro[1]);
        gs.append(
          svg('circle', {
            class: 'setor-zona', cx, cy, r: kmParaUnidades(s.raioKm ?? 2),
            fill: cor, stroke: cor, 'fill-opacity': 0.1, 'stroke-opacity': 0.5,
          })
        );
      }
    }

    /* linhas da rede */
    const gl = limpar(this.gLinhas);
    for (const l of LINHAS) {
      if (this.filtroSistema !== 'ambos' && l.sistema !== this.filtroSistema) continue;
      let d = '';
      for (let i = 0; i < l.pontos.length; i++) {
        const [x, y] = projetar(l.pontos[i][0], l.pontos[i][1]);
        d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      // Uma linha só "flui" se houver bombeamento de fato a montante — assim
      // a animação para junto com as bombas quando cai a energia.
      let fluindo = true;
      if (sim) {
        const bombas = sim.bombasPorUnidade.get(l.de);
        if (bombas?.length) fluindo = bombas.some((b) => b.ligada);
      }
      const rompida = l.id === 'ad-bqt-centro' && sim?.intensidade('rompimento') > 0.25;
      gl.append(
        svg('path', {
          class: `linha-${l.sistema}${fluindo && !rompida ? ' fluxo' : ''}${rompida ? ' linha-rompida' : ''}`,
          d,
        })
      );
    }

    /* rótulos de localidade */
    const gr = limpar(this.gRotulos);
    for (const p of LOCALIDADES) {
      if (!p.destaque && !mostrarRotulos) continue;
      const [x, y] = projetar(p.lon, p.lat);
      gr.append(
        svg('text', {
          class: `rotulo-local${p.destaque ? ' destaque' : ''}`, x, y,
          'text-anchor': 'middle', 'font-size': (p.destaque ? 10 : 9) * k, text: p.nome,
        })
      );
    }

    /* unidades */
    const gu = limpar(this.gUnidades);
    const comAlarme = new Set();
    if (this.alarmes) {
      for (const a of this.alarmes.ativos) {
        for (const u of UNIDADES) if (a.info.origem?.includes(u.nome) || a.info.origem?.includes(u.sigla)) comAlarme.add(u.id);
      }
    }

    for (const u of UNIDADES) {
      const sistema = TIPOS[u.tipo].sistema;
      if (this.filtroSistema !== 'ambos' && sistema !== this.filtroSistema) continue;
      const [x, y] = projetar(u.lon, u.lat);
      const g = svg('g', {
        class: `unidade${this.selecionada === u.id ? ' sel' : ''}`,
        transform: `translate(${x} ${y})`,
        role: 'button', tabindex: '0', 'aria-label': u.nome,
      });
      if (comAlarme.has(u.id)) {
        g.append(svg('circle', { class: 'un-alarme pulsa', r: r * 2.1 }));
      }
      g.append(svg('circle', { class: 'un-halo', r: r * 1.75 }));
      g.append(svg('path', { class: `un-forma ${sistema}`, d: FORMAS[u.tipo](r) }));
      if (mostrarRotulos || this.selecionada === u.id) {
        g.append(svg('text', { class: 'un-rot', x: 0, y: r * 2.6, 'text-anchor': 'middle', 'font-size': 10 * k, 'stroke-width': 3.5 * k, 'paint-order': 'stroke', text: u.sigla }));
      }
      g.addEventListener('pointerenter', (e) => this._dicaUnidade(e, u));
      g.addEventListener('pointermove', (e) => this._dicaUnidade(e, u));
      g.addEventListener('pointerleave', () => this.dica.esconder());
      g.addEventListener('click', () => {
        this.selecionada = u.id;
        this._redesenharDinamico();
        this.aoSelecionar?.(u);
      });
      gu.append(g);
    }
  }

  _dicaUnidade(ev, u) {
    const sim = this.sim;
    const linhas = [
      el('div', { class: 'mapa-dica-nome', text: u.nome }),
      el('div', { class: 'mapa-dica-tipo', text: `${TIPOS[u.tipo].rotulo} · ${u.bairro}` }),
    ];
    const par = (rot, val) => el('div', { class: 'mapa-dica-linha' }, [el('span', { text: rot }), el('b', { text: val })]);

    if (sim) {
      const res = sim.reservatorios.get(u.id);
      if (res) {
        linhas.push(par('Nível', `${num(res.nivelPct, 1)} %`));
        linhas.push(par('Entrada', `${num(res.entradaLs, 1)} L/s`));
        linhas.push(par('Saída', `${num(res.saidaLs, 1)} L/s`));
      }
      const poco = sim.pocos.get(u.id);
      if (poco) {
        linhas.push(par('Nível do poço', `${num(poco.nivelPct, 0)} %`));
        linhas.push(par('Afluente', `${num(poco.afluenteLs, 1)} L/s`));
      }
      const ete = sim.etes.get(u.id);
      if (ete) {
        linhas.push(par('Afluente', `${num(ete.afluenteLs, 1)} L/s`));
        linhas.push(par('Carga', `${num(ete.cargaPct, 0)} %`));
        linhas.push(par('Remoção DBO', `${num(ete.remocaoDbo * 100, 0)} %`));
      }
      const bombas = sim.bombasPorUnidade.get(u.id);
      if (bombas?.length) {
        linhas.push(par('Bombas', `${bombas.filter((b) => b.ligada).length}/${bombas.length} operando`));
      }
    }
    this.dica.mostrar(ev.clientX, ev.clientY, linhas);
  }
}

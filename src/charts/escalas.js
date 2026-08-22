/**
 * Matemática compartilhada pelos gráficos.
 *
 * Sem biblioteca de gráficos: o controle fino do traço é o que faz oito telas
 * parecerem um sistema só, em vez de oito gráficos colados. E não há CDN para
 * cair no meio da apresentação.
 */

export const CORES_SERIE = [
  'var(--serie-1)',
  'var(--serie-2)',
  'var(--serie-3)',
  'var(--serie-4)',
  'var(--serie-5)',
];

/** Escala linear. */
export const escala = (d0, d1, r0, r1) => (v) =>
  d1 === d0 ? r0 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

/**
 * Domínio "redondo", que não fica dançando a cada tique.
 *
 * Arredondar para um passo legível não é estética: sem isso o rótulo do eixo
 * muda de número duas vezes por segundo porque o máximo oscilou na terceira
 * casa decimal, e o painel inteiro parece instável.
 */
export function dominio(valores, { min, max, folga = 0.12, zero = false } = {}) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of valores) {
    if (!Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (lo === Infinity) {
    lo = 0;
    hi = 1;
  }
  if (zero) lo = Math.min(lo, 0);
  const amp = hi - lo || Math.abs(hi) || 1;
  lo -= amp * folga;
  hi += amp * folga;
  if (min != null) lo = Math.min(lo, min);
  if (max != null) hi = Math.max(hi, max);
  // Grandeza que não pode ser negativa não ganha eixo negativo por causa da
  // folga — vazão em −20 L/s desmente o gráfico inteiro.
  if (zero && lo < 0) lo = 0;
  const passo = Math.pow(10, Math.floor(Math.log10((hi - lo) / 4 || 1)));
  const mult = [1, 2, 2.5, 5, 10].find((m) => (hi - lo) / (passo * m) <= 5) ?? 10;
  const p = passo * mult;
  return [Math.floor(lo / p) * p, Math.ceil(hi / p) * p, p];
}

/** Caminho SVG de uma série temporal. */
export function caminho(t, v, ex, ey) {
  let d = '';
  for (let k = 0; k < v.length; k++)
    d += `${k ? 'L' : 'M'}${ex(t[k]).toFixed(1)} ${ey(v[k]).toFixed(1)}`;
  return d;
}

/** Índice da amostra mais próxima de `alvo`, por busca binária. */
export function maisProximo(t, alvo) {
  let lo = 0;
  let hi = t.length - 1;
  while (hi - lo > 1) {
    const meio = (lo + hi) >> 1;
    if (t[meio] < alvo) lo = meio;
    else hi = meio;
  }
  return alvo - t[lo] < t[hi] - alvo ? lo : hi;
}

const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

export function arco(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * Empurra rótulos que colidiriam, e reacomoda quem passou do fim do eixo.
 * Dois rótulos de série impressos um sobre o outro leem pior que nenhum.
 */
export function desempilhar(rotulos, yMin, yMax, alturaRot = 12) {
  const r = rotulos.slice().sort((a, b) => a.y - b.y);
  for (let i = 1; i < r.length; i++) {
    if (r[i].y - r[i - 1].y < alturaRot) r[i].y = r[i - 1].y + alturaRot;
  }
  const excesso = r.length ? r[r.length - 1].y - yMax : 0;
  if (excesso > 0) for (const x of r) x.y -= excesso;
  for (const x of r) x.y = Math.max(yMin, x.y);
  return r;
}

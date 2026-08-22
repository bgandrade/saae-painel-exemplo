/**
 * Aleatoriedade determinística para a maquete.
 *
 * Tudo aqui é semeado por string: `ruido('BQT-CMB-01/corrente')` devolve
 * sempre a mesma sequência. Isso importa por dois motivos — o histórico de
 * 24 h reconstruído no carregamento bate com o que a simulação produziria ao
 * vivo, e uma apresentação pode ser ensaiada e repetida sem surpresa.
 */

/** Hash de string para semente de 32 bits (FNV-1a). */
export function semente(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** PRNG mulberry32: rápido, sem dependência, distribuição boa o bastante. */
export function prng(sementeInicial) {
  let a = typeof sementeInicial === 'string' ? semente(sementeInicial) : sementeInicial >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal padrão por Box-Muller, a partir de um prng uniforme. */
export function normal(rand) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Processo de Ornstein-Uhlenbeck: ruído que passeia mas sempre volta para a
 * média. É o que faz um valor "de instrumento" parecer real — ruído branco
 * puro treme rápido demais e um passeio aleatório sem reversão deriva para
 * longe e nunca volta.
 *
 *   const c = new Ruido({ chave: 'x', media: 168, desvio: 4, reversao: 0.25 });
 *   c.passo(dtSegundos);  // avança e devolve o valor
 */
export class Ruido {
  constructor({ chave, media = 0, desvio = 1, reversao = 0.2, valor = null }) {
    this.rand = prng(chave);
    this.media = media;
    this.desvio = desvio;
    // Fração da distância até a média recuperada por segundo simulado.
    this.reversao = reversao;
    this.valor = valor ?? media;
  }

  passo(dt) {
    // Forma exata do OU discretizado: estável para qualquer dt, inclusive os
    // passos grandes do backfill de 24 h.
    const decaimento = Math.exp(-this.reversao * dt);
    const variancia = this.desvio * Math.sqrt(1 - decaimento * decaimento);
    this.valor =
      this.media + (this.valor - this.media) * decaimento + variancia * normal(this.rand);
    return this.valor;
  }

  /** Reposiciona a média sem descontinuidade — usado pelos cenários. */
  moverMedia(novaMedia) {
    this.media = novaMedia;
    return this;
  }
}

export const limitar = (v, min, max) => (v < min ? min : v > max ? max : v);
export const interpolar = (a, b, t) => a + (b - a) * limitar(t, 0, 1);

/**
 * Rampa suave entre 0 e 1 (smoothstep). Os cenários usam isto para entrar e
 * sair: um degrau denunciaria na hora que o dado é sintético.
 */
export const suavizar = (t) => {
  const x = limitar(t, 0, 1);
  return x * x * (3 - 2 * x);
};

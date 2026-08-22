/**
 * Formatação — um lugar só.
 *
 * Número em painel de operação precisa de separador decimal brasileiro, casas
 * fixas e largura tabular. Se cada tela formatasse do seu jeito, o painel
 * denunciaria a colagem na primeira olhada.
 */

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
export const inteiro = (v) => (Number.isFinite(v) ? fmt(0).format(v) : '—');

const fmtHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtHoraCurta = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fmtData = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
const fmtDataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const hora = (t) => fmtHora.format(new Date(t));
export const horaCurta = (t) => fmtHoraCurta.format(new Date(t));
export const dataLonga = (t) => fmtData.format(new Date(t));
export const dataCurta = (t) => fmtDataCurta.format(new Date(t));
export const dataHora = (t) => `${fmtDataCurta.format(new Date(t))} ${fmtHora.format(new Date(t))}`;

/** Duração relativa legível: "há 3 min", "há 2 h 14 min". */
export function desde(t, agora) {
  const s = Math.max(0, Math.round((agora - t) / 1000));
  if (s < 60) return `há ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  return `há ${h} h ${m % 60} min`;
}

/** Duração absoluta: "4 h 12 min", "38 min", "45 s". */
export function duracao(segundos) {
  if (!Number.isFinite(segundos)) return '—';
  const s = Math.max(0, Math.round(segundos));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${String(m % 60).padStart(2, '0')} min`;
}

/** Horímetro: 12.480 h */
export const horimetro = (h) => `${inteiro(h)} h`;

/** L/s → m³/h, quando a outra unidade lê melhor. */
export const m3h = (ls) => ls * 3.6;

/** Classificação de estado a partir de faixa normativa. */
export function estadoFaixa(valor, { min = -Infinity, max = Infinity } = {}, folga = 0.12) {
  if (valor < min || valor > max) return 'critico';
  const amplitude = max === Infinity || min === -Infinity ? 0 : (max - min) * folga;
  if (amplitude && (valor < min + amplitude || valor > max - amplitude)) return 'atencao';
  return 'ok';
}

/** Estado por dois limiares crescentes (vibração, temperatura, corrente). */
export const estadoLimiar = (v, alerta, critico) => (v > critico ? 'critico' : v > alerta ? 'atencao' : 'ok');

export const ROTULO_ESTADO = {
  ok: 'Normal', atencao: 'Atenção', serio: 'Grave', critico: 'Crítico', parada: 'Parada',
};

export const ROTULO_BOMBA = {
  operando: ['ok', 'Operando'],
  partindo: ['info', 'Partindo'],
  parada: ['parada', 'Parada'],
  falha: ['critico', 'Falha'],
  manutencao: ['atencao', 'Manutenção'],
};

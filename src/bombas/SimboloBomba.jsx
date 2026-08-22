/**
 * Símbolo de conjunto motobomba para a tela da estação.
 *
 * A decisão de projeto mais importante desta maquete está aqui: o símbolo
 * carrega CINCO fatos e nada mais. Amontoar corrente, tensão, cos φ, rpm,
 * horímetro e vibração em cinco cartões lado a lado é o erro clássico — o
 * operador não consegue comparar cinco bombas assim, e a tela vira ruído.
 *
 * Os cinco, por ordem de peso visual:
 *   1. ESTADO      — forma, preenchimento e rótulo textual (nunca só cor)
 *   2. MODO        — AUTO/MANUAL. Em manual a bomba NÃO está protegida pela
 *                    malha, e por isso o contorno vira tracejado
 *   3. PAPEL       — LÍDER / SEG-n / RESERVA-n. É o que torna cinco bombas
 *                    legíveis em vez de cinco caixas iguais
 *   4. VAZÃO       — um número, e a rotação quando há inversor
 *   5. SAÚDE       — uma barra, o pior entre corrente, vibração e mancal
 *
 * Todo o resto vive no faceplate, que abre no clique.
 */

import { num } from '../ui/formato.js';
import { saude } from '../engine/control.js';

const ROTULO_ESTADO = {
  operando: 'Operando', partindo: 'Partindo', parada: 'Parada',
  falha: 'FALHA', manutencao: 'Manutenção',
};

/** Bomba centrífuga: círculo com voluta, na convenção de fluxograma de processo. */
function Desenho({ estado, ligada, rot }) {
  const cor =
    estado === 'falha' ? 'var(--critico)'
      : estado === 'manutencao' ? 'var(--tinta-3)'
        : ligada ? 'var(--agua)' : 'var(--tinta-3)';
  return (
    <svg width="46" height="34" viewBox="-23 -17 46 34" aria-hidden="true">
      {/* bocais de sucção (embaixo) e recalque (em cima) */}
      <path d="M0 -11V-16M-12 6H-18" stroke={cor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="0" r="11" fill={ligada ? 'color-mix(in srgb, var(--agua) 22%, transparent)' : 'none'} stroke={cor} strokeWidth="2" />
      {/* rotor: gira só quando o conjunto está girando de fato */}
      <g style={ligada ? { transformOrigin: '0px 0px', animation: `girar ${Math.max(0.35, 1.4 - rot)}s linear infinite` } : undefined}>
        <path d="M0 -7A7 7 0 0 1 6 3M0 7A7 7 0 0 1-6-3" stroke={cor} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="0" cy="0" r="1.6" fill={cor} />
    </svg>
  );
}

export default function SimboloBomba({ bomba: b, papel, aoAbrir }) {
  const s = saude(b);
  const manual = b.modo === 'manual';
  const classePapel = papel === 'LÍDER' ? 'lider' : manual ? 'manual' : papel === 'FALHA' ? 'falha' : '';

  return (
    <button
      type="button"
      className={`bomba ${b.estado}${manual ? ' manual' : ''}`}
      onClick={() => aoAbrir(b.id)}
      title={`${b.id} — ${ROTULO_ESTADO[b.estado]} · ${b.modo === 'auto' ? 'AUTO' : 'MANUAL'} — clique para operar`}
    >
      <div className="bomba-topo">
        <span className="bomba-tag">{b.id.split('-').slice(-2).join('-')}</span>
        <span className="espaco" />
        <span className={`selo-modo${manual ? ' man' : ''}`}>{manual ? 'MAN' : 'AUTO'}</span>
      </div>

      <div className="bomba-simbolo">
        <Desenho estado={b.estado} ligada={b.ligada} rot={b.rotacaoPct * (b.rampa ?? 1)} />
      </div>

      <span className={`bomba-papel ${classePapel}`}>{papel ?? '—'}</span>

      <div className="bomba-valor">
        {b.ligada ? (
          <>
            <b>{num(b.vazaoLs, 1)}</b> <small>L/s</small>
            {b.def.inversor && <div><small>{num(b.rotacaoPct * (b.rampa ?? 1) * 100, 0)} % de rotação</small></div>}
            {!b.def.inversor && <div><small>{ROTULO_ESTADO[b.estado]}</small></div>}
          </>
        ) : (
          <span className="parada">{ROTULO_ESTADO[b.estado]}</span>
        )}
      </div>

      <div className="saude" title={`Saúde do conjunto — pior indicador: ${s.pior}`}>
        <i className={s.estado} style={{ width: `${b.ligada ? Math.max(6, s.pct) : 100}%` }} />
      </div>
    </button>
  );
}

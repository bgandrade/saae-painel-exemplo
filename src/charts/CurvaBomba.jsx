/**
 * Curva H×Q com ponto de operação.
 *
 * É o gráfico que mais separa um HMI de bombeamento de um painel genérico.
 * "A bomba está ligada" qualquer dashboard mostra; o que o engenheiro quer
 * saber é se ela está trabalhando ONDE DEVE — dentro da faixa de melhor
 * rendimento, na interseção com a curva do sistema. Bomba fora da faixa
 * consome mais energia por m³ e come selo e mancal.
 */

import { useRef } from 'react';
import { num } from '../ui/formato.js';
import useLargura from '../hooks/useLargura.js';
import { escala } from './escalas.js';

const M = { t: 12, r: 14, b: 30, l: 42 };

export default function CurvaBomba({ dados, altura = 190 }) {
  const ref = useRef(null);
  const larg = useLargura(ref, 460);
  const { Qmax, Hmax, curva, curvaRotacao, sistema, operacao, bep, dentroBep, Qn, Hn } = dados;

  const x0 = M.l;
  const x1 = Math.max(x0 + 30, larg - M.r);
  const y0 = altura - M.b;
  const y1 = M.t;
  const ex = escala(0, Qmax, x0, x1);
  const ey = escala(0, Hmax, y0, y1);

  const via = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${ex(p.Q).toFixed(1)} ${ey(p.H).toFixed(1)}`).join('');

  const ticksQ = [0, Qmax * 0.25, Qmax * 0.5, Qmax * 0.75, Qmax];
  const ticksH = [0, Hmax * 0.25, Hmax * 0.5, Hmax * 0.75, Hmax];

  return (
    <div ref={ref}>
      <svg className="gr curva-bomba" viewBox={`0 0 ${larg} ${altura}`} height={altura} role="img"
        aria-label={`Curva da bomba: vazão nominal ${Qn} litros por segundo, altura nominal ${Hn} metros`}>
        {ticksH.map((h) => (
          <g key={`h${h}`}>
            <line className="grade-linha" x1={x0} x2={x1} y1={ey(h)} y2={ey(h)} />
            <text x={x0 - 6} y={ey(h) + 3.5} textAnchor="end">{num(h, 0)}</text>
          </g>
        ))}
        {ticksQ.map((q) => (
          <text key={`q${q}`} x={ex(q)} y={y0 + 14} textAnchor="middle">{num(q, 0)}</text>
        ))}

        {/* Faixa de melhor rendimento: 70–120 % da vazão nominal. */}
        <rect className="bep" x={ex(bep.min)} y={y1} width={ex(bep.max) - ex(bep.min)} height={y0 - y1} />
        <text x={(ex(bep.min) + ex(bep.max)) / 2} y={y1 + 10} textAnchor="middle" style={{ fontSize: 9 }}>
          melhor rendimento
        </text>

        <path className="sistema" d={via(sistema)} />
        {curvaRotacao && <path className="curva-rot" d={via(curvaRotacao)} />}
        <path className="curva" d={via(curva)} />

        {operacao.Q > 0 && (
          <>
            <line className="guia" x1={ex(operacao.Q)} x2={ex(operacao.Q)} y1={ey(operacao.H)} y2={y0} />
            <line className="guia" x1={x0} x2={ex(operacao.Q)} y1={ey(operacao.H)} y2={ey(operacao.H)} />
            <circle className={`ponto${dentroBep ? '' : ' fora'}`} cx={ex(operacao.Q)} cy={ey(operacao.H)} r="5" />
          </>
        )}

        <line className="eixo-linha" x1={x0} x2={x1} y1={y0} y2={y0} />
        <line className="eixo-linha" x1={x0} x2={x0} y1={y0} y2={y1} />
        <text x={x1} y={y0 + 26} textAnchor="end" style={{ fontSize: 9 }}>vazão (L/s)</text>
        <text x={x0 - 34} y={y1 + 4} style={{ fontSize: 9 }}>H (m)</text>
      </svg>

      <div className="legenda" style={{ padding: '4px 0 0' }}>
        <span className="legenda-item"><i className="legenda-marca" style={{ background: 'var(--serie-1)' }} />Curva da bomba</span>
        {curvaRotacao && (
          <span className="legenda-item">
            <i className="legenda-marca" style={{ background: 'var(--serie-1)', opacity: 0.6 }} />
            Na rotação atual
          </span>
        )}
        <span className="legenda-item"><i className="legenda-marca" style={{ background: 'var(--serie-2)' }} />Curva do sistema</span>
        <span className="legenda-item">
          <i className="legenda-marca" style={{ background: dentroBep ? 'var(--tinta)' : 'var(--atencao)', width: 8, height: 8, borderRadius: '50%' }} />
          Ponto de operação
        </span>
      </div>
    </div>
  );
}

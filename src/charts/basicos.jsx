/** Sparkline, gauge, barra empilhada e linha do tempo de operação. */

import { useRef } from 'react';
import { num } from '../ui/formato.js';
import useLargura from '../hooks/useLargura.js';
import { escala, dominio, caminho, arco } from './escalas.js';

/* ══════════════════════════ SPARKLINE ══════════════════════════ */

export function Sparkline({ t, v, cor = 'var(--serie-1)', altura = 24, area = true }) {
  if (!v?.length) return null;
  const L = 100;
  const [ymin, ymax] = dominio(v, { folga: 0.18 });
  const ex = escala(t[0], t[t.length - 1], 0, L);
  const ey = escala(ymin, ymax, altura - 1, 1);
  const d = caminho(t, v, ex, ey);
  return (
    <svg
      className="gr"
      viewBox={`0 0 ${L} ${altura}`}
      height={altura}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {area && (
        <path d={`${d}L${L} ${altura}L0 ${altura}Z`} fill={cor} opacity="0.14" stroke="none" />
      )}
      <path
        d={d}
        fill="none"
        stroke={cor}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ══════════════════════════ GAUGE ══════════════════════════ */

/**
 * Gauge de 260°. `faixaOk` sombreia a zona nominal — é o que transforma
 * "168 A" em "168 A, dentro do esperado" sem o operador ter que lembrar
 * qual é a corrente de placa daquele motor.
 */
export function Gauge({
  valor,
  min = 0,
  max = 100,
  faixaOk,
  rotulo,
  unidade = '',
  casas = 0,
  cor = 'var(--serie-1)',
  tamanho = 96,
}) {
  const A0 = Math.PI * 0.72;
  const A1 = Math.PI * 2.28;
  const c = tamanho / 2;
  const r = tamanho / 2 - 8;
  const frac = (v) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const ang = (v) => A0 + frac(v) * (A1 - A0);

  return (
    <div className="gauge-wrap">
      <div style={{ position: 'relative', lineHeight: 0 }}>
        <svg
          className="gauge"
          viewBox={`0 0 ${tamanho} ${tamanho}`}
          width={tamanho}
          height={tamanho}
          aria-hidden="true"
        >
          <path className="trilha" d={arco(c, c, r, A0, A1)} fill="none" strokeWidth="7" />
          {faixaOk && (
            <path
              className="faixa-ok"
              d={arco(c, c, r, ang(faixaOk.min), ang(faixaOk.max))}
              fill="none"
              strokeWidth="7"
            />
          )}
          {valor > min && (
            <path
              className="arco"
              d={arco(c, c, r, A0, ang(valor))}
              fill="none"
              stroke={cor}
              strokeWidth="7"
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <div>
            <div className="gauge-valor">{num(valor, casas)}</div>
            <div className="gauge-rot">{unidade}</div>
          </div>
        </div>
      </div>
      {rotulo && <div className="gauge-rot">{rotulo}</div>}
    </div>
  );
}

/* ══════════════════════ BARRA EMPILHADA ══════════════════════ */

export function BarraEmpilhada({ segmentos, altura = 26, unidade = '' }) {
  const total = segmentos.reduce((s, x) => s + Math.max(0, x.valor), 0) || 1;
  return (
    <div>
      <div style={{ display: 'flex', gap: 2, height: altura, borderRadius: 4, overflow: 'hidden' }}>
        {segmentos.map((seg) => {
          const p = (Math.max(0, seg.valor) / total) * 100;
          if (p <= 0) return null;
          return (
            <i
              key={seg.nome}
              title={`${seg.nome}: ${num(seg.valor, 1)} ${unidade}`}
              style={{
                flex: `0 0 ${p}%`,
                background: seg.cor,
                display: 'grid',
                placeItems: 'center',
                fontSize: 'var(--t-xs)',
                color: '#fff',
                fontWeight: 600,
                fontStyle: 'normal',
              }}
            >
              {p > 11 ? `${num(p, 0)}%` : ''}
            </i>
          );
        })}
      </div>
      <div className="legenda" style={{ padding: '8px 0 0' }}>
        {segmentos.map((seg) => (
          <span className="legenda-item" key={seg.nome}>
            <i className="legenda-marca" style={{ background: seg.cor }} />
            {seg.nome} · {num(seg.valor, 1)} {unidade}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════ LINHA DO TEMPO DE OPERAÇÃO ══════════════════ */

/**
 * Converte a série 0/1 de cada conjunto em blocos contínuos.
 *
 * É a leitura que o operador realmente quer: não "quantas partidas houve",
 * mas "quando esteve ligada" — e, lado a lado, se o rodízio está distribuindo
 * as horas ou se uma bomba está carregando o serviço das irmãs.
 */
export function Gantt({ faixas, horas = 24, alturaLinha = 17 }) {
  const ref = useRef(null);
  const larg = useLargura(ref, 700);
  const ROT = 96;
  const alt = faixas.length * alturaLinha + 20;
  const x0 = ROT;
  const x1 = Math.max(x0 + 20, larg - 8);

  const blocos = (v) => {
    const out = [];
    const n = v.length;
    let i = 0;
    while (i < n) {
      if (v[i] < 0.5) {
        i++;
        continue;
      }
      const ini = i;
      while (i < n && v[i] >= 0.5) i++;
      out.push([ini / n, (i - ini) / n]);
    }
    return out;
  };

  return (
    <div ref={ref}>
      <svg className="gr" viewBox={`0 0 ${larg} ${alt}`} height={alt} role="img">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              className="gantt-grade"
              x1={x0 + f * (x1 - x0)}
              x2={x0 + f * (x1 - x0)}
              y1="0"
              y2={alt - 18}
            />
            <text
              x={x0 + f * (x1 - x0)}
              y={alt - 5}
              textAnchor={f === 1 ? 'end' : f === 0 ? 'start' : 'middle'}
            >
              {f === 1 ? 'agora' : `−${num(horas * (1 - f), 0)} h`}
            </text>
          </g>
        ))}
        {faixas.map((f, i) => {
          const y = i * alturaLinha + 2;
          const h = alturaLinha - 5;
          return (
            <g key={f.nome} className="gantt-linha">
              <text className="gantt-nome" x="0" y={y + h - 2}>
                {f.nome}
              </text>
              <rect className="gantt-trilho" x={x0} y={y} width={x1 - x0} height={h} rx="2" />
              {blocos(f.v).map(([e, w], k) => (
                <rect
                  key={k}
                  className={`gantt-barra${f.falha ? ' falha' : ''}${f.manual ? ' manual' : ''}`}
                  x={x0 + e * (x1 - x0)}
                  y={y}
                  width={Math.max(1, w * (x1 - x0))}
                  height={h}
                  rx="2"
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

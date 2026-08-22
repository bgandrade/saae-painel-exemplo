/**
 * Gráfico de linha temporal.
 *
 * Regras seguidas aqui e nos demais: eixo Y único (nunca dois no mesmo
 * gráfico), grade e eixos recessivos, legenda a partir de duas séries e
 * rótulo direto no fim da linha até quatro — a identidade de uma série nunca
 * pode depender só da cor.
 */

import { useRef, useState, useMemo } from 'react';
import { num, horaCurta } from '../ui/formato.js';
import useLargura from '../hooks/useLargura.js';
import { escala, dominio, caminho, maisProximo, desempilhar, CORES_SERIE } from './escalas.js';

const MARGEM = { t: 12, r: 54, b: 22, l: 46 };

export default function GraficoLinha({
  series = [], altura = 190, unidade = '', casas = 1,
  area = false, zero = false, faixa = null, limites = [],
}) {
  const ref = useRef(null);
  const larg = useLargura(ref);
  const [cursor, setCursor] = useState(null);

  const validas = useMemo(() => series.filter((s) => s.v?.length > 1), [series]);

  const g = useMemo(() => {
    if (!validas.length || larg < 120) return null;
    const x0 = MARGEM.l;
    const x1 = larg - MARGEM.r;
    const y0 = altura - MARGEM.b;
    const y1 = MARGEM.t;
    if (x1 <= x0) return null;

    const todos = [];
    for (const s of validas) for (const v of s.v) todos.push(v);
    if (faixa) todos.push(faixa.min, faixa.max);
    for (const l of limites) todos.push(l);
    const [ymin, ymax, passoY] = dominio(todos, { zero });

    const base = validas[0];
    const tmin = base.t[0];
    const tmax = base.t[base.t.length - 1];
    const ex = escala(tmin, tmax, x0, x1);
    const ey = escala(ymin, ymax, y0, y1);

    const ticksY = [];
    for (let v = ymin; v <= ymax + 1e-9; v += passoY) ticksY.push(v);

    // Marcas de hora: passo escolhido pela amplitude, para não empilhar rótulo.
    const horas = (tmax - tmin) / 3600000;
    const passoH = horas > 18 ? 6 : horas > 8 ? 3 : horas > 3 ? 1 : 0.5;
    const d0 = new Date(tmin);
    d0.setMinutes(0, 0, 0);
    const ticksX = [];
    for (let t = d0.getTime(); t <= tmax; t += passoH * 3600000) if (t >= tmin) ticksX.push(t);

    const marcas = validas.map((s, i) => ({
      ...s,
      cor: s.cor ?? CORES_SERIE[i % CORES_SERIE.length],
      d: caminho(s.t, s.v, ex, ey),
    }));

    const rotulos = validas.length <= 4
      ? desempilhar(
          marcas.filter((s) => s.nome).map((s) => ({ y: ey(s.v[s.v.length - 1]), cor: s.cor, nome: s.nome })),
          y1 + 8, y0
        )
      : [];

    return { x0, x1, y0, y1, ex, ey, ymin, ymax, ticksY, ticksX, marcas, rotulos, tmin, tmax, base };
  }, [validas, larg, altura, zero, faixa, limites]);

  function aoMover(ev) {
    if (!g) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * larg;
    if (px < g.x0 - 4 || px > g.x1 + 4) return setCursor(null);
    const alvo = g.tmin + ((px - g.x0) / (g.x1 - g.x0)) * (g.tmax - g.tmin);
    setCursor({ i: maisProximo(g.base.t, alvo), cx: ev.clientX, cy: ev.clientY });
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <svg
        className="gr" viewBox={`0 0 ${larg} ${altura}`} height={altura} role="img"
        onMouseMove={aoMover} onMouseLeave={() => setCursor(null)}
      >
        {g && (
          <>
            {g.ticksY.map((v) => (
              <g key={`y${v}`}>
                <line className="grade-linha" x1={g.x0} x2={g.x1} y1={g.ey(v)} y2={g.ey(v)} />
                <text x={g.x0 - 7} y={g.ey(v) + 3.5} textAnchor="end">{num(v, casas)}</text>
              </g>
            ))}

            {faixa && (
              <rect
                className="faixa-norma" x={g.x0} width={g.x1 - g.x0}
                y={g.ey(Math.min(faixa.max, g.ymax))}
                height={Math.max(0, g.ey(Math.max(faixa.min, g.ymin)) - g.ey(Math.min(faixa.max, g.ymax)))}
              />
            )}
            {limites.filter((l) => l >= g.ymin && l <= g.ymax).map((l) => (
              <line key={`lim${l}`} className="limite-linha" x1={g.x0} x2={g.x1} y1={g.ey(l)} y2={g.ey(l)} />
            ))}

            {g.ticksX.map((t) => (
              <g key={`x${t}`}>
                <line className="grade-linha" x1={g.ex(t)} x2={g.ex(t)} y1={g.y1} y2={g.y0} opacity="0.55" />
                <text x={g.ex(t)} y={g.y0 + 14} textAnchor="middle">{horaCurta(t)}</text>
              </g>
            ))}
            <line className="eixo-linha" x1={g.x0} x2={g.x1} y1={g.y0} y2={g.y0} />

            {g.marcas.map((s, i) => (
              <g key={s.nome ?? i}>
                {area && g.marcas.length === 1 && (
                  <path
                    className="marca-area" fill={s.cor} opacity="0.13"
                    d={`${s.d}L${g.ex(s.t[s.t.length - 1]).toFixed(1)} ${g.y0}L${g.ex(s.t[0]).toFixed(1)} ${g.y0}Z`}
                  />
                )}
                <path className="marca-linha" d={s.d} stroke={s.cor} />
              </g>
            ))}

            {g.rotulos.map((r) => (
              <text
                key={r.nome} x={g.x1 + 6} y={r.y + 3.5} fill={r.cor}
                style={{ fontSize: 10, fontWeight: 650 }}
              >
                {r.nome.length > 10 ? `${r.nome.slice(0, 9)}…` : r.nome}
              </text>
            ))}

            {cursor && (
              <g style={{ pointerEvents: 'none' }}>
                <line className="cursor-linha" x1={g.ex(g.base.t[cursor.i])} x2={g.ex(g.base.t[cursor.i])} y1={g.y1} y2={g.y0} />
                {g.marcas.map((s, k) => {
                  const v = s.v[Math.min(cursor.i, s.v.length - 1)];
                  return (
                    <circle
                      key={k} cx={g.ex(g.base.t[cursor.i])} cy={g.ey(v)} r="4"
                      fill={s.cor} stroke="var(--superficie)" strokeWidth="2"
                    />
                  );
                })}
              </g>
            )}
          </>
        )}
      </svg>

      {cursor && g && (
        <Dica x={cursor.cx} y={cursor.cy}>
          <div className="dica-sub">{horaCurta(g.base.t[cursor.i])}</div>
          {g.marcas.map((s, k) => (
            <div className="dica-linha" key={k}>
              <span className="linha">
                <i className="dica-marca" style={{ background: s.cor }} />
                {s.nome ?? ''}
              </span>
              <b>{num(s.v[Math.min(cursor.i, s.v.length - 1)], casas)}{unidade ? ` ${unidade}` : ''}</b>
            </div>
          ))}
        </Dica>
      )}
    </div>
  );
}

/** Dica flutuante que vira de lado ao encostar na borda da janela. */
export function Dica({ x, y, children }) {
  const ref = useRef(null);
  const l = ref.current?.offsetWidth ?? 170;
  const a = ref.current?.offsetHeight ?? 70;
  const px = x + 14 + l > innerWidth ? x - l - 14 : x + 14;
  const py = Math.min(Math.max(8, y - a / 2), innerHeight - a - 8);
  return (
    <div ref={ref} className="dica" style={{ left: px, top: py }}>
      {children}
    </div>
  );
}

export function Legenda({ itens }) {
  if (!itens?.length) return null;
  return (
    <div className="legenda">
      {itens.map((i) => (
        <span className="legenda-item" key={i.nome}>
          <i className="legenda-marca" style={{ background: i.cor }} />
          {i.nome}
        </span>
      ))}
    </div>
  );
}

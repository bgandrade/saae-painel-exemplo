/**
 * Renderizador de sinóptico.
 *
 * HTML posicionado em porcentagem sobre uma camada SVG de tubulação. A costura
 * entre os dois é `vector-effect: non-scaling-stroke`: o caminho estica com o
 * contêiner sem engrossar o traço, o que deixa o mesmo desenho legível num
 * cartão estreito e num telão.
 */

import { useSim } from '../hooks/useSimulacao.jsx';
import { num } from '../ui/formato.js';
import No from './No.jsx';
import { caminhoTubo, meioTubo } from './diagramas.js';

export default function Diagrama({ spec }) {
  const { sim } = useSim();

  const vazaoDoTubo = (t) => {
    if (!t.fonte) return null;
    const bombas = sim.bombasPorUnidade.get(t.fonte) ?? [];
    if (!bombas.length) return null;
    return bombas.reduce((s, b) => s + b.vazaoLs, 0);
  };

  return (
    <div className="sinoptico" style={{ height: spec.altura }}>
      <svg
        className="sinoptico-tubos"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {spec.tubos.map((t, i) => {
          const d = caminhoTubo(t.pontos);
          const q = vazaoDoTubo(t);
          const fluindo = t.fonte ? q > 0.2 : true;
          const rompido = t.trecho === 'ad-jpb-centro' && sim.intensidade('rompimento') > 0.25;
          return (
            <g key={i}>
              <path d={d} />
              <path d={d} className="interno" />
              <path
                d={d}
                className={
                  rompido ? 'rompido' : fluindo ? `fluxo${t.esgoto ? ' esgoto' : ''}` : 'parado'
                }
              />
            </g>
          );
        })}
      </svg>

      {spec.tubos.map((t, i) => {
        if (!t.rotulo && !t.fonte) return null;
        const [x, y] = meioTubo(t.pontos);
        const q = vazaoDoTubo(t);
        return (
          <div className="rotulo-tubo" key={`r${i}`} style={{ left: `${x}%`, top: `${y}%` }}>
            {q != null && `${num(q, 1)} L/s`}
            {q != null && t.rotulo && ' '}
            {t.rotulo && <small>{t.rotulo}</small>}
          </div>
        );
      })}

      {spec.nos.map((n) => (
        <No key={`${n.id}-${n.x}-${n.y}`} spec={n} />
      ))}
    </div>
  );
}

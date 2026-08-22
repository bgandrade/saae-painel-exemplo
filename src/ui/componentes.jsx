/** Peças de interface reaproveitadas por todas as telas. */

import { num, ROTULO_ESTADO } from './formato.js';
import Icone from './Icone.jsx';

export function Card({ titulo, meta, children, classe = '', pad = true, id }) {
  return (
    <section className={`card ${classe}`} id={id}>
      {titulo && (
        <header className="card-cab">
          <h2 className="card-titulo">{titulo}</h2>
          {meta && <div className="card-meta">{meta}</div>}
        </header>
      )}
      <div className={`card-corpo${pad ? '' : ' sem-pad'}`}>{children}</div>
    </section>
  );
}

export function Kpi({ rotulo, valor, unidade, sub, estado, spark }) {
  return (
    <div className={`kpi${estado && estado !== 'ok' ? ` estado-${estado}` : ''}`}>
      <div className="kpi-rotulo" title={rotulo}>{rotulo}</div>
      <div className="kpi-linha">
        <span className="kpi-valor">{valor}</span>
        {unidade && <span className="kpi-unidade">{unidade}</span>}
      </div>
      {sub && <div className="kpi-sub" title={sub}>{sub}</div>}
      {spark && <div className="kpi-spark">{spark}</div>}
    </div>
  );
}

/** Chip de status: cor + ponto + rótulo textual. Nunca cor sozinha. */
export function Chip({ estado, children, pequeno }) {
  return (
    <span className={`chip ${estado}${pequeno ? ' pequeno' : ''}`}>
      <i className="ponto" />
      {children ?? ROTULO_ESTADO[estado] ?? estado}
    </span>
  );
}

export function Pares({ itens }) {
  return (
    <dl className="pares">
      {itens.filter(Boolean).map(([k, v], i) => (
        <Fragmento key={`${k}-${i}`} rotulo={k} valor={v} />
      ))}
    </dl>
  );
}

function Fragmento({ rotulo, valor }) {
  return (
    <>
      <dt>{rotulo}</dt>
      <dd>{valor}</dd>
    </>
  );
}

/**
 * Barra com faixa aceitável e marcador do valor — para parâmetro normativo.
 * A escala mostra 25 % além da faixa em cada lado: sem isso um valor fora do
 * limite fica encostado na borda e não dá para ver o quanto passou.
 */
export function FaixaNormativa({ nome, valor, limite, casas = 2, unidade = '' }) {
  const min = limite.min ?? 0;
  const max = limite.max ?? 1;
  const folga = (max - min) * 0.25;
  const escMin = min - folga;
  const escMax = max + folga;
  const posicao = (v) => `${Math.min(100, Math.max(0, ((v - escMin) / (escMax - escMin)) * 100))}%`;
  const fora = valor < min || valor > max;

  return (
    <div className="faixa">
      <div className="faixa-topo">
        <span className="faixa-nome">{nome}</span>
        <span className={`faixa-valor${fora ? ' fora' : ''}`}>
          {num(valor, casas)}{unidade ? ` ${unidade}` : ''}
        </span>
      </div>
      <div className="faixa-trilho">
        <i className="faixa-ok-zona" style={{ left: posicao(min), right: `calc(100% - ${posicao(max)})` }} />
        <i className={`faixa-marcador${fora ? ' fora' : ''}`} style={{ left: posicao(valor) }} />
      </div>
      <div className="faixa-legenda">
        <span>{num(escMin, casas)}</span>
        <span>faixa {num(min, casas)}–{num(max, casas)}</span>
        <span>{num(escMax, casas)}</span>
      </div>
    </div>
  );
}

export function Vazio({ icone = 'ok', children }) {
  return (
    <div className="vazio">
      <Icone nome={icone} tamanho={20} />
      {children}
    </div>
  );
}

export function Segmentado({ opcoes, valor, aoMudar, rotulo }) {
  return (
    <div className="segmentado" role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.id} type="button" title={o.titulo}
          aria-pressed={o.id === valor}
          onClick={() => aoMudar(o.id)}
        >
          {o.nome}
        </button>
      ))}
    </div>
  );
}

/** Tanque vertical com marcas de setpoint do CLP. */
export function Tanque({ nivelPct, marcas = [], esgoto = false, altura }) {
  const estado = nivelPct < 10 ? 'baixo' : nivelPct < 20 ? 'atencao' : '';
  return (
    <div className={`tanque${esgoto ? ' tanque-esgoto' : ''}`} style={altura ? { height: altura } : undefined}>
      {marcas.map((m) => (
        <i key={m.rot} className="tanque-marca" data-rot={m.rot} style={{ bottom: `${m.pct}%` }} />
      ))}
      <i className={`tanque-agua ${estado}`} style={{ height: `${Math.max(0, Math.min(100, nivelPct))}%` }} />
      <div className="tanque-rot">{num(nivelPct, 0)} %</div>
    </div>
  );
}

/**
 * Nó do sinóptico.
 *
 * Todo valor mora em caixa com fundo opaco — nunca texto solto sobre desenho.
 * Foi exatamente o texto solto que estragou os rótulos do mapa na versão
 * anterior, e o diagrama tem o mesmo risco: linhas cruzando por trás de
 * números tornam ambos ilegíveis.
 */

import { porId, TIPOS, LIMITES } from '../data/topologia.js';
import { useSim } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { num } from '../ui/formato.js';

function BarraNivel({ pct, marcas = [], esgoto }) {
  const est = pct < 12 ? 'baixo' : pct < 22 ? 'atencao' : '';
  return (
    <div className={`no-nivel${esgoto ? ' esgoto' : ''}`}>
      <i className={est} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      {marcas.map((m) => (
        <u key={m} style={{ left: `${m}%` }} />
      ))}
    </div>
  );
}

export default function No({ spec }) {
  const { sim } = useSim();
  const { abrirUnidade } = useUI();

  if (spec.tipo === 'externo') {
    return (
      <div
        className="no"
        style={{ left: `${spec.x}%`, top: `${spec.y}%`, borderStyle: 'dashed', cursor: 'default' }}
      >
        <div className="no-cab">
          <span className="no-sigla">{spec.rotulo}</span>
        </div>
        <div className="no-tipo">{spec.sub}</div>
      </div>
    );
  }

  if (spec.tipo === 'setor') {
    const s = sim.setores.get(spec.id);
    if (!s) return null;
    const p = s.pressaoMca;
    const est = p < LIMITES.pressao.min ? 'critico' : p < 15 ? 'atencao' : '';
    const semTel = s.def.semTelemetria;
    return (
      <div
        className={`no ${est}`}
        style={{ left: `${spec.x}%`, top: `${spec.y}%`, cursor: 'default' }}
      >
        <div className="no-cab">
          <span className="no-sigla">{s.def.nomeCurto}</span>
        </div>
        <div className="no-tipo">
          {spec.papel === 'bacia' ? 'Bacia de esgotamento' : 'Setor de abastecimento'}
        </div>
        {spec.papel === 'bacia' ? (
          <div className="no-linha">
            <span>População</span>
            <b>{num(s.def.populacao / 1000, 1)} mil</b>
          </div>
        ) : (
          <div className="no-valor">
            <b>{num(p, 1)}</b>
            <small>mca</small>
          </div>
        )}
        <div className="no-linha">
          <span>Consumo</span>
          <b>{num(s.consumoLs, 1)} L/s</b>
        </div>
        {semTel && (
          <div className="no-tipo" style={{ color: 'var(--atencao)' }}>
            sem telemetria
          </div>
        )}
      </div>
    );
  }

  const u = porId.get(spec.id);
  if (!u) return null;
  const res = sim.reservatorios.get(u.id);
  const poco = sim.pocos.get(u.id);
  const ete = sim.etes.get(u.id);
  const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
  const malha = sim.malhas.get(u.id);
  const ligadas = bombas.filter((b) => b.ligada).length;
  const falha = bombas.some((b) => b.estado === 'falha');
  const manual = bombas.some((b) => b.modo === 'manual');

  let est = '';
  if (falha) est = 'critico';
  else if (manual || (res && res.nivelPct < 20) || (poco && poco.nivelPct > 88)) est = 'atencao';
  else if (ete && !ete.conforme) est = 'critico';

  return (
    <button
      className={`no ${est}`}
      style={{ left: `${spec.x}%`, top: `${spec.y}%` }}
      onClick={() => abrirUnidade(u)}
      title={`${u.nome} — clique para abrir`}
    >
      <div className="no-cab">
        <span className="no-sigla">{u.sigla}</span>
        {manual && <span className="selo-modo man">MAN</span>}
        {malha?.modo === 'fora' && <span className="selo-modo man">FORA</span>}
      </div>
      <div className="no-tipo">{TIPOS[u.tipo].rotulo}</div>

      {res && (
        <>
          <div className="no-valor">
            <b>{num(res.nivelPct, 0)}</b>
            <small>% · {num(res.volumeM3, 0)} m³</small>
          </div>
          <BarraNivel pct={res.nivelPct} marcas={malha ? [malha.ligaPct, malha.desligaPct] : []} />
          <div className="no-linha">
            <span>Entrada</span>
            <b>{num(res.entradaLs, 1)} L/s</b>
          </div>
          <div className="no-linha">
            <span>Saída</span>
            <b>{num(res.saidaLs, 1)} L/s</b>
          </div>
        </>
      )}

      {poco && (
        <>
          <div className="no-valor">
            <b>{num(poco.nivelPct, 0)}</b>
            <small>% do poço</small>
          </div>
          <BarraNivel
            pct={poco.nivelPct}
            marcas={malha ? [malha.desligaPct, malha.ligaPct] : []}
            esgoto
          />
          <div className="no-linha">
            <span>Afluente</span>
            <b>{num(poco.afluenteLs, 1)} L/s</b>
          </div>
        </>
      )}

      {ete && (
        <>
          <div className="no-valor">
            <b>{num(ete.afluenteLs, 1)}</b>
            <small>L/s afluente</small>
          </div>
          <div className="no-linha">
            <span>Carga</span>
            <b>{num(ete.cargaPct, 0)} %</b>
          </div>
          <div className="no-linha">
            <span>Remoção DBO</span>
            <b>{num(ete.remocaoDbo * 100, 0)} %</b>
          </div>
        </>
      )}

      {bombas.length > 0 && (
        <div className="no-linha">
          <span>Conjuntos</span>
          <b>
            {ligadas}/{bombas.length} operando
          </b>
        </div>
      )}
      {!res && !poco && !ete && bombas.length > 0 && (
        <div className="no-linha">
          <span>Recalque</span>
          <b>{num(sim.recalques.get(u.id) ?? bombas.reduce((s, b) => s + b.vazaoLs, 0), 1)} L/s</b>
        </div>
      )}
    </button>
  );
}

/**
 * A estação por dentro: barrilete de sucção, os conjuntos, barrilete de
 * recalque. É o desenho que responde "de onde vem e para onde vai" sem que
 * ninguém precise explicar — e é onde as cinco bombas da Elevatória Banqueta
 * finalmente ficam legíveis lado a lado.
 */

import { porId } from '../data/topologia.js';
import { useSim } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { sequencia } from '../engine/control.js';
import { num } from '../ui/formato.js';
import SimboloBomba from './SimboloBomba.jsx';

export default function EstacaoBombeamento({ unidade: u }) {
  const { sim } = useSim();
  const { abrirBomba } = useUI();
  const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
  const papeis = sequencia(sim, u.id);

  const succao = u.alimentadaPor ? porId.get(u.alimentadaPor) : null;
  const destino = u.recalcaPara ? porId.get(u.recalcaPara) : null;
  const resSuccao = u.alimentadaPor ? sim.reservatorios.get(u.alimentadaPor) : sim.pocos.get(u.id);
  const resDestino = u.recalcaPara ? sim.reservatorios.get(u.recalcaPara) : null;

  const total = bombas.reduce((s, b) => s + b.vazaoLs, 0);
  const ligadas = bombas.filter((b) => b.ligada).length;

  const origem = succao?.sigla ?? (u.tipo === 'captacao' ? u.mananancial ?? 'Manancial' : 'Rede coletora');
  const alvo = destino?.sigla ?? (u.tipo === 'captacao' ? u.sigla : (u.setores ?? []).join(', ') || 'Rede');

  return (
    <div className="estacao">
      <div className="linha" style={{ justifyContent: 'center' }}>
        <div className="barrilete">
          <span>Recalque</span>
          <span className="seta">▲</span>
          <b>{num(total, 1)} L/s</b>
          <span>→ {alvo}</span>
          {resDestino && <b>{num(resDestino.nivelPct, 0)} %</b>}
        </div>
      </div>

      <div className="bombas-fila">
        {bombas.map((b) => (
          <SimboloBomba key={b.id} bomba={b} papel={papeis.get(b.id)} aoAbrir={abrirBomba} />
        ))}
      </div>

      <div className="linha" style={{ justifyContent: 'center' }}>
        <div className="barrilete">
          <span>{origem}</span>
          {resSuccao && <b>{num(resSuccao.nivelPct, 0)} %</b>}
          <span className="seta">▲</span>
          <span>Sucção · {ligadas} de {bombas.length} em operação</span>
        </div>
      </div>
    </div>
  );
}

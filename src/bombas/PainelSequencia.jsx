/**
 * Painel de sequência de rodízio.
 *
 * Existe por um motivo só: tornar visível uma automação que, funcionando bem,
 * é invisível. As barras de horas lado a lado são a prova de que o rodízio
 * distribuiu o desgaste — e o contador de próxima troca mostra que ele vai
 * continuar distribuindo, sem ninguém mexer.
 *
 * O totalizador de rodízio é mostrado junto do horímetro de vida de propósito:
 * o horímetro de vida NÃO se iguala (as bombas foram instaladas em épocas
 * diferentes) e prometer que sim seria uma afirmação que a plateia derruba.
 */

import { useSim } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { sequencia, proximaTrocaS } from '../engine/control.js';
import { num, horimetro, duracao } from '../ui/formato.js';
import { Chip } from '../ui/componentes.jsx';

export default function PainelSequencia({ unidade: u }) {
  const { sim } = useSim();
  const { abrirBomba } = useUI();
  const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
  if (!bombas.length) return null;

  const papeis = sequencia(sim, u.id);
  const troca = proximaTrocaS(sim, u.id);
  const horas = bombas.map((b) => b.horasRodizio);
  const maxH = Math.max(...horas, 0.1);
  const dispersao = Math.max(...horas) - Math.min(...horas);
  const media = horas.reduce((s, h) => s + h, 0) / horas.length;
  const dispersaoPct = media > 0 ? (dispersao / media) * 100 : 0;

  return (
    <div className="pilha">
      <div className="linha wrap" style={{ gap: 'var(--e2)' }}>
        <Chip estado={dispersaoPct < 12 ? 'ok' : dispersaoPct < 30 ? 'atencao' : 'critico'}>
          Desgaste equalizado em {num(100 - Math.min(100, dispersaoPct), 0)} %
        </Chip>
        <span className="espaco" />
        <span className="mut" style={{ fontSize: 'var(--t-xs)' }}>
          {troca == null ? 'sem substituta disponível' : `próxima troca de líder em ${duracao(troca)}`}
        </span>
      </div>

      <div className="horimetro-barras">
        {bombas.map((b) => (
          <div className="hb" key={b.id} role="button" tabIndex={0}
            onClick={() => abrirBomba(b.id)}
            onKeyDown={(e) => e.key === 'Enter' && abrirBomba(b.id)}
            style={{ cursor: 'pointer' }}
          >
            <span>
              <b>{b.id.split('-').slice(-2).join('-')}</b>
              <br />
              <span className="mut" style={{ fontSize: 9 }}>{papeis.get(b.id)}</span>
            </span>
            <div className="hb-trilho" title={`${num(b.horasRodizio, 1)} h no totalizador de rodízio`}>
              <i style={{ width: `${(b.horasRodizio / maxH) * 100}%` }} />
            </div>
            <span className="hb-val">
              {num(b.horasRodizio, 1)} h
              <br />
              <span className="mut" style={{ fontWeight: 400, fontSize: 9 }}>{b.partidasHoje} part.</span>
            </span>
          </div>
        ))}
      </div>

      <table className="tabela compacta">
        <thead>
          <tr>
            <th>Conjunto</th><th>Papel</th><th className="n">Horímetro de vida</th><th className="n">Campanha</th>
          </tr>
        </thead>
        <tbody>
          {bombas.map((b) => (
            <tr key={b.id}>
              <td className="principal">{b.id}</td>
              <td>{papeis.get(b.id)}</td>
              <td className="n">{horimetro(b.horimetroH)}</td>
              <td className="n">{b.ligada ? duracao(b.segundosLigada) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="nota">
        O <b>totalizador de rodízio</b> é o que ordena a fila de entrada: parte sempre o conjunto
        que acumulou menos horas. É por isso que ele se iguala sozinho ao longo dos dias, enquanto
        o horímetro de vida — que traz a idade de cada bomba desde a instalação — continua diferente.
      </p>
    </div>
  );
}

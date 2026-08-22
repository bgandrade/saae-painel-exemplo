/**
 * Controles globais da maquete.
 *
 * Ficam fora das telas operacionais porque velocidade, pausa e cenários são
 * recursos da demonstração, não comandos de processo da hierarquia ISA-101.
 */

import { useState } from 'react';
import { CENARIOS } from '../engine/sim.js';
import { useSim } from '../hooks/useSimulacao.jsx';
import Icone from './Icone.jsx';

const VELOCIDADES = [
  { v: 1, rot: '1×', titulo: 'Tempo real' },
  { v: 60, rot: '60×', titulo: '1 min de operação por segundo' },
  { v: 300, rot: '300×', titulo: '5 min de operação por segundo' },
];

export default function PainelSimulacao() {
  const { sim, pausado, alternarPausa } = useSim();
  const [, forcar] = useState(0);

  return (
    <div className="simulacao-painel">
      <p className="nota simulacao-aviso">
        Estes controles afetam toda a maquete, inclusive históricos, alarmes e telas abertas.
      </p>

      <div className={`simulacao-estado${pausado ? ' pausada' : ''}`}>
        <div>
          <div className="simulacao-estado-titulo">
            <i className={`led ${pausado ? 'atencao' : 'on'}`} />
            {pausado ? 'Simulação pausada' : 'Simulação em andamento'}
          </div>
          <div className="simulacao-estado-meta">Velocidade atual: {sim.velocidade}×</div>
        </div>
        <button className="btn" type="button" aria-pressed={pausado} onClick={alternarPausa}>
          <Icone nome={pausado ? 'play' : 'pausa'} />
          {pausado ? 'Retomar' : 'Pausar'}
        </button>
      </div>

      <section>
        <div className="drawer-secao-tit">Velocidade do relógio</div>
        <div
          className="segmentado simulacao-velocidades"
          role="group"
          aria-label="Velocidade da simulação"
        >
          {VELOCIDADES.map(({ v, rot, titulo }) => (
            <button
              key={v}
              type="button"
              title={titulo}
              aria-pressed={sim.velocidade === v}
              onClick={() => {
                sim.velocidade = v;
                forcar((x) => x + 1);
              }}
            >
              {rot}
            </button>
          ))}
        </div>
        <p className="nota simulacao-ajuda">
          Em 60×, cada segundo real representa um minuto de operação simulada.
        </p>
      </section>

      <section>
        <div className="drawer-secao-tit">Cenários de demonstração</div>
        <div className="cenarios">
          {CENARIOS.map((cenario) => {
            const estado = sim.cenarios.get(cenario.id);
            const ativo = estado.ativo || estado.intensidade > 0.01;
            return (
              <div className={`cenario${ativo ? ' ativo' : ''}`} key={cenario.id}>
                <div style={{ minWidth: 0 }}>
                  <div className="cenario-nome">{cenario.nome}</div>
                  <div className="cenario-desc">{cenario.resumo}</div>
                </div>
                <span className="espaco" />
                <button
                  className={`btn${estado.ativo ? ' perigo' : ''}`}
                  type="button"
                  onClick={() => {
                    sim.alternarCenario(cenario.id);
                    forcar((x) => x + 1);
                  }}
                >
                  {estado.ativo ? 'Normalizar' : 'Disparar'}
                </button>
                <div className="cenario-barra" aria-hidden="true">
                  <i style={{ width: `${estado.intensidade * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

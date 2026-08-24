/**
 * A simulação é uma só, viva, compartilhada por todas as telas.
 *
 * Duas decisões que sustentam o desempenho do painel:
 *
 * 1. A instância vive FORA do React, num singleton de módulo. Trocar de aba não
 *    reinicia nada — o histórico continua correndo em segundo plano, e voltar
 *    para a Visão Geral depois de cinco minutos na tela de bombas mostra os
 *    cinco minutos que passaram. O `backfill` de 1440 passos também roda uma
 *    vez só, o que importa porque o StrictMode monta o componente duas vezes.
 *
 * 2. O estado da simulação NÃO é copiado para dentro do React. O contexto
 *    carrega a instância e um contador de tique; as telas leem o estado mutável
 *    direto no render. Copiar 16 bombas × 7 séries a 2 Hz para dentro do estado
 *    do React derrubaria o quadro e não traria nada em troca.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Simulacao } from '../engine/sim.js';
import { MotorAlarmes } from '../engine/alarms.js';

const INTERVALO_MS = 500;

let instancia = null;
function obterInstancia() {
  if (!instancia) {
    const sim = new Simulacao({ velocidade: 60 });
    // As 24 h de histórico são geradas antes da primeira pintura: quando a
    // tela aparece, os gráficos já estão cheios.
    sim.backfill(24);
    instancia = { sim, alarmes: new MotorAlarmes(sim) };
  }
  return instancia;
}

const Ctx = createContext(null);

export function ProvedorSimulacao({ children }) {
  const [tique, setTique] = useState(0);
  const [pausado, setPausado] = useState(false);
  const { sim, alarmes } = obterInstancia();

  useEffect(() => {
    let ultimo = performance.now();
    const id = setInterval(() => {
      const agora = performance.now();
      // Aba em segundo plano não pode "pular" horas de uma vez.
      const dtReal = Math.min(agora - ultimo, 4000);
      ultimo = agora;
      if (!pausado) {
        // Alarmes avaliados a cada subpasso da física, não uma vez por quadro:
        // é o que impede um pico curto de escapar entre dois quadros de tela.
        sim.avancarReal(dtReal, (dt) => alarmes.avaliar(dt));
      }
      setTique((t) => t + 1);
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [sim, alarmes, pausado]);

  const valor = useMemo(
    () => ({
      sim,
      alarmes,
      tique,
      pausado,
      alternarPausa: () => setPausado((valorAtual) => !valorAtual),
    }),
    [sim, alarmes, tique, pausado],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSim() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSim precisa estar dentro de <ProvedorSimulacao>');
  return v;
}

/**
 * Janela de uma série do histórico.
 *
 * Reduz para no máximo `alvo` pontos antes de devolver: um gráfico de 900 px
 * não ganha nada com 1440 pontos, e o caminho SVG fica quatro vezes menor —
 * o que se nota quando cinco séries são repintadas duas vezes por segundo.
 */
export function janela(sim, chave, qtd = 1440, alvo = 400) {
  const { t, v } = sim.hist.serie(chave).janela(qtd);
  if (t.length <= alvo) return { t, v };
  const passo = t.length / alvo;
  const rt = new Float64Array(alvo);
  const rv = new Float64Array(alvo);
  for (let i = 0; i < alvo; i++) {
    const idx = Math.min(t.length - 1, Math.round(i * passo));
    rt[i] = t[idx];
    rv[i] = v[idx];
  }
  return { t: rt, v: rv };
}

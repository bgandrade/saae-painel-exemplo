/**
 * Visão Geral — nível 1 da ISA-101, a tela que fica no telão.
 *
 * Responde a uma pergunta só: está tudo bem, e se não está, onde olhar?
 * Hierarquia deliberada: indicadores macro em cima (o que se lê de longe),
 * mapa no centro (onde está acontecendo), alarmes e cenários à direita (o que
 * exige ação). Nada aqui pisca a não ser um crítico não reconhecido.
 */

import { useState } from 'react';
import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { Card, Kpi, Chip, Vazio } from '../ui/componentes.jsx';
import LinhaAlarme from '../ui/LinhaAlarme.jsx';
import { num } from '../ui/formato.js';
import { GraficoLinha, Legenda, Sparkline, CORES_SERIE } from '../charts/index.js';
import MapaOperacional from '../mapa/MapaOperacional.jsx';
import { UNIDADES, LIMITES } from '../data/topologia.js';
import { CENARIOS } from '../engine/sim.js';

export default function VisaoGeral() {
  const { sim, alarmes } = useSim();
  const [, forcar] = useState(0);
  const g = sim.global;
  const jan = (chave, n = 1440) => janela(sim, chave, n);
  const spark = (chave, cor) => {
    const { t, v } = janela(sim, chave, 180, 90);
    return <Sparkline t={t} v={v} cor={cor} />;
  };

  const estPressao =
    g.pressaoMediaMca < LIMITES.pressao.min ? 'critico' : g.pressaoMediaMca < 15 ? 'atencao' : 'ok';
  const estCloro =
    g.cloroMedioMgL < LIMITES.cloroLivre.min ? 'critico' : g.cloroMedioMgL < 0.4 ? 'atencao' : 'ok';
  const ativos = alarmes.ativos.slice(0, 6);

  return (
    <div className="grid">
      <div className="kpis c12">
        {/* As captações ciclam por histerese, então o instantâneo passa por zero
            várias vezes ao dia. Sozinho ele lê como "sistema parado"; a média
            de 24 h ao lado é o que dá a escala verdadeira da produção. */}
        <Kpi
          rotulo="Vazão produzida"
          valor={num(g.vazaoProduzidaLs, 0)}
          unidade="L/s"
          sub={`média 24 h: ${num(sim.hist.serie('glob/vazaoProduzida').estat().media, 0)} L/s`}
          spark={spark('glob/vazaoProduzida', 'var(--serie-1)')}
        />
        <Kpi
          rotulo="Volume distribuído hoje"
          valor={num(g.volumeDistribuidoM3Hoje, 0)}
          unidade="m³"
          sub={`perdas estimadas ${num((g.indicePerdas ?? 0) * 100, 0)} %`}
        />
        <Kpi
          rotulo="Pressão média da rede"
          valor={num(g.pressaoMediaMca, 1)}
          unidade="mca"
          sub={`mínimo NBR 12218: ${LIMITES.pressao.min} mca`}
          estado={estPressao}
          spark={spark('glob/pressaoMedia', 'var(--serie-2)')}
        />
        <Kpi
          rotulo="Reservação total"
          valor={num(g.reservacaoPct, 0)}
          unidade="%"
          sub={`${num(g.volumeReservadoM3, 0)} m³ armazenados`}
          spark={spark('glob/reservacao', 'var(--serie-3)')}
        />
        <Kpi
          rotulo="Cloro médio na rede"
          valor={num(g.cloroMedioMgL, 2)}
          unidade="mg/L"
          sub={`faixa ${LIMITES.cloroLivre.min}–${LIMITES.cloroLivre.max}`}
          estado={estCloro}
        />
        <Kpi
          rotulo="Conjuntos em operação"
          valor={`${g.bombasOperando}`}
          unidade={`de ${g.bombasTotal}`}
          sub={`${num(g.potenciaKW, 0)} kW instantâneos`}
        />
        <Kpi
          rotulo="Esgoto tratado"
          valor={num(g.vazaoEsgotoLs, 1)}
          unidade="L/s"
          sub={`${num(g.vazaoEsgotoLs * 3.6, 0)} m³/h`}
          spark={spark('glob/vazaoEsgoto', 'var(--serie-2)')}
        />
        <Kpi
          rotulo="Energia consumida hoje"
          valor={num(g.energiaKWhHoje, 0)}
          unidade="kWh"
          sub="conjuntos elevatórios"
        />
      </div>

      <div className="c8">
        <Card
          titulo="Sistemas de abastecimento e esgotamento — Angra dos Reis"
          meta={<span>{UNIDADES.length} unidades monitoradas</span>}
          pad={false}
        >
          <MapaOperacional altura={472} />
        </Card>
      </div>

      <div className="c4 pilha">
        <Card
          titulo="Alarmes ativos"
          meta={
            <span>{alarmes.contagem.total ? `${alarmes.contagem.total} ativo(s)` : 'nenhum'}</span>
          }
          pad={false}
        >
          {ativos.length ? (
            <div className="alarmes">
              {ativos.map((a) => (
                <LinhaAlarme
                  key={a.chave}
                  alarme={a}
                  agora={sim.tempo}
                  aoReconhecer={(c) => {
                    alarmes.reconhecer(c);
                    forcar((x) => x + 1);
                  }}
                />
              ))}
            </div>
          ) : (
            <Vazio>Operação normal — nenhum alarme ativo.</Vazio>
          )}
        </Card>

        <Card titulo="Situação das unidades" classe="compacto">
          <div className="linha wrap" style={{ gap: 6 }}>
            {UNIDADES.map((u) => {
              const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
              const falha = bombas.some((b) => b.estado === 'falha');
              const manual = bombas.some((b) => b.modo === 'manual');
              const operando = bombas.filter((b) => b.ligada).length;
              // Unidade normal fica NEUTRA. Uma parede de chips verdes é a
              // mesma armadilha da barra de saúde: se tudo chama atenção,
              // nada chama. Só desvio recebe cor.
              const estado = falha ? 'critico' : manual ? 'atencao' : 'parada';
              const texto = falha
                ? `${u.sigla} · falha`
                : bombas.length
                  ? `${u.sigla} · ${operando}/${bombas.length}`
                  : u.sigla;
              return (
                <Chip key={u.id} estado={estado}>
                  {texto}
                </Chip>
              );
            })}
          </div>
        </Card>

        <Card titulo="Cenários de demonstração" meta={<span>clique para disparar</span>}>
          <Cenarios />
        </Card>
      </div>

      <div className="c8">
        <Card
          titulo="Vazão nas últimas 24 horas"
          meta={<span>produzida × distribuída × consumida</span>}
        >
          <GraficoLinha
            altura={200}
            unidade="L/s"
            casas={0}
            zero
            series={[
              { nome: 'Produzida', cor: CORES_SERIE[0], ...jan('glob/vazaoProduzida') },
              { nome: 'Distribuída', cor: CORES_SERIE[1], ...jan('glob/vazaoDistribuida') },
              { nome: 'Consumida', cor: CORES_SERIE[2], ...jan('glob/consumo') },
            ]}
          />
          <Legenda
            itens={[
              { nome: 'Produzida', cor: CORES_SERIE[0] },
              { nome: 'Distribuída', cor: CORES_SERIE[1] },
              { nome: 'Consumida', cor: CORES_SERIE[2] },
            ]}
          />
        </Card>
      </div>

      <div className="c4">
        <Card titulo="Níveis de reservação — 24 h" meta={<span>tracejado: nível baixo</span>}>
          <GraficoLinha
            altura={200}
            unidade="%"
            casas={0}
            limites={[20]}
            series={[...sim.reservatorios.keys()].map((id, i) => ({
              nome: sim.reservatorios.get(id).unidade.sigla,
              cor: CORES_SERIE[i],
              ...jan(`reserv/${id}/nivel`),
            }))}
          />
          <Legenda
            itens={[...sim.reservatorios.values()].map((r, i) => ({
              nome: r.unidade.sigla,
              cor: CORES_SERIE[i],
            }))}
          />
        </Card>
      </div>
    </div>
  );
}

function Cenarios() {
  const { sim } = useSim();
  const [, forcar] = useState(0);
  return (
    <div className="cenarios">
      {CENARIOS.map((c) => {
        const est = sim.cenarios.get(c.id);
        const ativo = est.ativo || est.intensidade > 0.01;
        return (
          <div className={`cenario${ativo ? ' ativo' : ''}`} key={c.id}>
            <div style={{ minWidth: 0 }}>
              <div className="cenario-nome">{c.nome}</div>
              <div className="cenario-desc">{c.resumo}</div>
            </div>
            <span className="espaco" />
            <button
              className={`btn${est.ativo ? ' perigo' : ''}`}
              onClick={() => {
                sim.alternarCenario(c.id);
                forcar((x) => x + 1);
              }}
            >
              {est.ativo ? 'Normalizar' : 'Disparar'}
            </button>
            <div className="cenario-barra">
              <i style={{ width: `${est.intensidade * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

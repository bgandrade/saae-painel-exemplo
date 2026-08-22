/**
 * Sinóptico — nível 2 da ISA-101.
 *
 * Responde à pergunta que o mapa não responde: por onde a água anda. O mapa
 * mostra ONDE as unidades estão; o sinóptico mostra COMO elas se ligam — que a
 * Elevatória Banqueta recebe da captação e recalca para o reservatório, e que
 * é do reservatório que saem o Centro e Japuíba.
 */

import { useState } from 'react';
import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { Card, Kpi, Segmentado } from '../ui/componentes.jsx';
import { num } from '../ui/formato.js';
import { GraficoLinha, Legenda, CORES_SERIE } from '../charts/index.js';
import Diagrama from '../sinoptico/Diagrama.jsx';
import { SINOPTICO_AGUA, SINOPTICO_ESGOTO } from '../sinoptico/diagramas.js';

const OPCOES = [
  { id: 'agua', nome: 'Água' },
  { id: 'esgoto', nome: 'Esgoto' },
];

export default function Sinoptico() {
  const { sim } = useSim();
  const [qual, setQual] = useState('agua');
  const spec = qual === 'agua' ? SINOPTICO_AGUA : SINOPTICO_ESGOTO;
  const g = sim.global;
  const jan = (c, n = 1440) => janela(sim, c, n);

  const recalqueBqt = sim.recalques.get('eea-banqueta') ?? 0;
  const camara = sim.reservatorios.get('cap-banqueta');
  const reserv = sim.reservatorios.get('res-banqueta');
  const bombasBqt = sim.bombasPorUnidade.get('eea-banqueta') ?? [];

  return (
    <div className="grid">
      <div className="c12">
        <Card
          titulo={spec.nome}
          meta={
            <>
              <span>traço animado = fluxo confirmado por bombeamento</span>
              <Segmentado opcoes={OPCOES} valor={qual} aoMudar={setQual} rotulo="Sistema" />
            </>
          }
          pad={false}
        >
          <Diagrama spec={spec} />
        </Card>
      </div>

      {qual === 'agua' ? (
        <>
          <div className="kpis c12">
            <Kpi
              rotulo="Câmara de carga CAP-BQT"
              valor={num(camara?.nivelPct ?? 0, 0)}
              unidade="%"
              sub={`${num(camara?.volumeM3 ?? 0, 0)} m³ de ${num(camara?.capacidadeM3 ?? 0, 0)}`}
              estado={(camara?.nivelPct ?? 100) < 20 ? 'atencao' : 'ok'}
            />
            <Kpi
              rotulo="Recalque EEA-BQT"
              valor={num(recalqueBqt, 1)}
              unidade="L/s"
              sub={`${bombasBqt.filter((b) => b.ligada).length} de ${bombasBqt.length} conjuntos`}
            />
            <Kpi
              rotulo="Reservatório Banqueta"
              valor={num(reserv?.nivelPct ?? 0, 0)}
              unidade="%"
              sub={`autonomia ${num(Math.min(reserv?.autonomiaH ?? 0, 99), 1)} h`}
              estado={(reserv?.nivelPct ?? 100) < 20 ? 'atencao' : 'ok'}
            />
            <Kpi
              rotulo="Vazão produzida"
              valor={num(g.vazaoProduzidaLs, 0)}
              unidade="L/s"
              sub="somatório das captações"
            />
            <Kpi
              rotulo="Vazão distribuída"
              valor={num(g.vazaoDistribuidaLs, 0)}
              unidade="L/s"
              sub="consumo mais perdas"
            />
            <Kpi
              rotulo="Potência instantânea"
              valor={num(g.potenciaKW, 0)}
              unidade="kW"
              sub={`${num(g.energiaKWhHoje, 0)} kWh hoje`}
            />
          </div>

          <div className="c12">
            <Card
              titulo="A cadeia da Banqueta nas últimas 24 horas"
              meta={<span>captação → elevatória → reservatório</span>}
            >
              <GraficoLinha
                altura={210}
                unidade="%"
                casas={0}
                limites={[30, 85]}
                series={[
                  { nome: 'CAP-BQT', cor: CORES_SERIE[0], ...jan('reserv/cap-banqueta/nivel') },
                  { nome: 'RES-BQT', cor: CORES_SERIE[1], ...jan('reserv/res-banqueta/nivel') },
                ]}
              />
              <Legenda
                itens={[
                  { nome: 'Nível da câmara de carga (CAP-BQT)', cor: CORES_SERIE[0] },
                  { nome: 'Nível do reservatório (RES-BQT)', cor: CORES_SERIE[1] },
                ]}
              />
              <p className="nota">
                As duas linhas tracejadas são os setpoints da malha: <b>30 %</b> chama bombeamento e
                <b> 85 %</b> o cessa. Os ciclos que se veem no gráfico são consequência dessa
                histerese e do consumo do dia — não existe agenda por trás. Repare que a câmara de
                carga oscila mais rápido que o reservatório: ela é menor e atende a elevatória
                inteira.
              </p>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="kpis c12">
            {[...sim.etes.values()].map((e) => (
              <Kpi
                key={e.unidade.id}
                rotulo={e.unidade.sigla}
                valor={num(e.afluenteLs, 1)}
                unidade="L/s"
                sub={`carga ${num(e.cargaPct, 0)} % · remoção ${num(e.remocaoDbo * 100, 0)} %`}
                estado={e.conforme ? (e.cargaPct > 95 ? 'atencao' : 'ok') : 'critico'}
              />
            ))}
            {[...sim.pocos.values()].map((p) => (
              <Kpi
                key={p.unidade.id}
                rotulo={`Poço ${p.unidade.sigla}`}
                valor={num(p.nivelPct, 0)}
                unidade="%"
                sub={`afluente ${num(p.afluenteLs, 1)} L/s`}
                estado={p.extravasando ? 'critico' : p.nivelPct > 88 ? 'atencao' : 'ok'}
              />
            ))}
          </div>

          <div className="c12">
            <Card
              titulo="Vazão afluente por ETE — 24 h"
              meta={<span>Resolução CONAMA nº 430/2011</span>}
            >
              <GraficoLinha
                altura={210}
                unidade="L/s"
                casas={1}
                zero
                series={[...sim.etes.keys()].map((id, i) => ({
                  nome: sim.etes.get(id).unidade.sigla,
                  cor: CORES_SERIE[i],
                  ...jan(`ete/${id}/afluente`),
                }))}
              />
              <Legenda
                itens={[...sim.etes.values()].map((e, i) => ({
                  nome: e.unidade.nome,
                  cor: CORES_SERIE[i],
                }))}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

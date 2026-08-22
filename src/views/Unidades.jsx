/**
 * Unidades — nível 3 da ISA-101: a estação por dentro, onde se OPERA.
 *
 * Com "Todas" selecionado, mostra a frota inteira — tabela e linha do tempo de
 * 24 h, que é onde se compara o comportamento de todos os conjuntos de uma vez.
 * Com uma unidade selecionada, vira a tela da estação: barriletes, os conjuntos
 * lado a lado e o painel de sequência do rodízio.
 */

import { useState } from 'react';
import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { Card, Kpi, Chip, Segmentado } from '../ui/componentes.jsx';
import { num, horimetro, ROTULO_BOMBA } from '../ui/formato.js';
import { GraficoLinha, Legenda, Gantt, CORES_SERIE } from '../charts/index.js';
import EstacaoBombeamento from '../bombas/EstacaoBombeamento.jsx';
import PainelSequencia from '../bombas/PainelSequencia.jsx';
import { unidadesComBomba, LIMITES } from '../data/topologia.js';
import { saude, sequencia } from '../engine/control.js';

export default function Unidades() {
  const { sim } = useSim();
  const { abrirBomba } = useUI();
  const comBomba = unidadesComBomba();
  const [sel, setSel] = useState('eea-banqueta');

  const opcoes = [
    { id: 'todas', nome: 'Todas' },
    ...comBomba.map((u) => ({ id: u.id, nome: u.sigla, titulo: u.nome })),
  ];
  const unidade = comBomba.find((u) => u.id === sel);
  const todas = [...sim.bombas.values()];
  const visiveis = unidade ? (sim.bombasPorUnidade.get(unidade.id) ?? []) : todas;

  const ligadas = todas.filter((b) => b.ligada);
  const vibMax = ligadas.length ? Math.max(...ligadas.map((b) => b.vibracaoMms)) : 0;
  const tempMax = ligadas.length ? Math.max(...ligadas.map((b) => b.tempMancalC)) : 0;
  const emManual = todas.filter((b) => b.modo === 'manual').length;

  const faixas = (unidade ? visiveis : todas).map((b) => ({
    nome: b.id,
    falha: b.estado === 'falha',
    manual: b.modo === 'manual',
    v: sim.hist.serie(`bomba/${b.id}/ligada`).janela(1440).v,
  }));

  const paraTend = visiveis.slice(0, 5);

  return (
    <div className="grid">
      <div className="kpis c12">
        <Kpi
          rotulo="Conjuntos em operação"
          valor={`${ligadas.length}`}
          unidade={`de ${todas.length}`}
          sub={`${todas.filter((b) => b.estado === 'falha').length} em falha`}
        />
        <Kpi
          rotulo="Em modo manual"
          valor={`${emManual}`}
          unidade={`de ${todas.length}`}
          estado={emManual ? 'atencao' : 'ok'}
          sub="fora do alcance da malha"
        />
        <Kpi
          rotulo="Potência instantânea"
          valor={num(sim.global.potenciaKW, 0)}
          unidade="kW"
          sub={`${num(sim.global.energiaKWhHoje, 0)} kWh hoje`}
        />
        <Kpi
          rotulo="Vazão bombeada"
          valor={num(
            ligadas.reduce((s, b) => s + b.vazaoLs, 0),
            0,
          )}
          unidade="L/s"
          sub="soma dos conjuntos ligados"
        />
        <Kpi
          rotulo="Maior vibração"
          valor={num(vibMax, 1)}
          unidade="mm/s"
          estado={
            vibMax > LIMITES.vibracao.critico
              ? 'critico'
              : vibMax > LIMITES.vibracao.alerta
                ? 'atencao'
                : 'ok'
          }
          sub={`${LIMITES.vibracao.norma}: ${LIMITES.vibracao.alerta}`}
        />
        <Kpi
          rotulo="Maior temp. de mancal"
          valor={num(tempMax, 0)}
          unidade="°C"
          estado={
            tempMax > LIMITES.tempMancal.critico
              ? 'critico'
              : tempMax > LIMITES.tempMancal.alerta
                ? 'atencao'
                : 'ok'
          }
          sub={`alarme em ${LIMITES.tempMancal.alerta} °C`}
        />
        <Kpi
          rotulo="Partidas hoje"
          valor={`${todas.reduce((s, b) => s + b.partidasHoje, 0)}`}
          sub="todos os conjuntos"
        />
      </div>

      <div className={unidade ? 'c8' : 'c12'}>
        <Card
          titulo={unidade ? unidade.nome : 'Conjuntos motobomba — frota'}
          meta={
            <>
              <span>
                {unidade ? 'clique num conjunto para operar' : `${todas.length} conjuntos`}
              </span>
              <Segmentado opcoes={opcoes} valor={sel} aoMudar={setSel} rotulo="Unidade" />
            </>
          }
          pad={!unidade}
        >
          {unidade ? (
            <EstacaoBombeamento unidade={unidade} />
          ) : (
            <TabelaFrota bombas={todas} aoAbrir={abrirBomba} />
          )}
        </Card>
      </div>

      {unidade && (
        <div className="c4">
          <Card titulo="Sequência de rodízio" meta={<span>equalização automática</span>}>
            <PainelSequencia unidade={unidade} />
          </Card>
        </div>
      )}

      <div className="c7">
        <Card
          titulo={`Operação nas últimas 24 horas${unidade ? ` — ${unidade.sigla}` : ''}`}
          meta={<span>barra preenchida = conjunto ligado</span>}
        >
          <Gantt faixas={faixas} horas={24} />
          <p className="nota">
            Esta linha do tempo é <b>consequência</b> da histerese de nível e do rodízio, não de uma
            agenda. Os degraus onde entram mais conjuntos são os picos de consumo das 7 h e das 19
            h.
          </p>
        </Card>
      </div>

      <div className="c5">
        <Card titulo="Corrente — últimas 6 horas" meta={<span>até 5 conjuntos</span>}>
          <GraficoLinha
            altura={200}
            unidade="A"
            casas={0}
            zero
            series={paraTend.map((b, i) => ({
              nome: b.id.replace(/^[A-Z]+-/, ''),
              cor: CORES_SERIE[i],
              ...janela(sim, `bomba/${b.id}/corrente`, 360),
            }))}
          />
          <Legenda itens={paraTend.map((b, i) => ({ nome: b.id, cor: CORES_SERIE[i] }))} />
        </Card>
      </div>

      {unidade && (
        <div className="c12">
          <Card titulo={`Conjuntos da ${unidade.sigla}`} pad={false}>
            <TabelaFrota bombas={visiveis} aoAbrir={abrirBomba} sim={sim} />
          </Card>
        </div>
      )}
    </div>
  );
}

function TabelaFrota({ bombas, aoAbrir }) {
  const { sim } = useSim();
  return (
    <div className="rolagem">
      <table className="tabela">
        <thead>
          <tr>
            <th>Tag</th>
            <th>Unidade</th>
            <th>Modo</th>
            <th>Estado</th>
            <th>Papel</th>
            <th className="n">Vazão</th>
            <th className="n">Potência</th>
            <th className="n">Vibração</th>
            <th className="n">Mancal</th>
            <th className="n">Horímetro</th>
            <th className="n">Rodízio</th>
            <th className="n">Partidas</th>
            <th>Acionamento</th>
          </tr>
        </thead>
        <tbody>
          {bombas.map((b) => {
            const [cor, rot] = ROTULO_BOMBA[b.estado] ?? ROTULO_BOMBA.parada;
            const s = saude(b);
            const papeis = sequencia(sim, b.def.unidadeId);
            return (
              <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => aoAbrir(b.id)}>
                <td className="principal">{b.id}</td>
                <td>{b.unidade.sigla}</td>
                <td>
                  <span className={`selo-modo${b.modo === 'manual' ? ' man' : ''}`}>
                    {b.modo === 'manual' ? 'MAN' : 'AUTO'}
                  </span>
                </td>
                <td>
                  <Chip estado={cor} pequeno>
                    {rot}
                  </Chip>
                </td>
                <td className="mut">{papeis.get(b.id)}</td>
                <td className="n">{b.ligada ? `${num(b.vazaoLs, 1)} L/s` : '—'}</td>
                <td className="n">{num(b.potenciaKW, 1)} kW</td>
                <td
                  className="n"
                  style={s.estado === 'critico' ? { color: 'var(--critico)' } : undefined}
                >
                  {b.ligada ? `${num(b.vibracaoMms, 1)} mm/s` : '—'}
                </td>
                <td className="n">{num(b.tempMancalC, 0)} °C</td>
                <td className="n">{horimetro(b.horimetroH)}</td>
                <td className="n">{num(b.horasRodizio, 1)} h</td>
                <td className="n">{b.partidasHoje}</td>
                <td>{b.def.inversor ? 'Inversor de frequência' : 'Partida direta'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Esgotamento sanitário — ETEs e elevatória.
 *
 * O gráfico "consumo × chegada" é o mais revelador da maquete: a vazão
 * afluente acompanha a curva de consumo de água com cerca de três horas de
 * atraso, porque é isso que acontece de verdade — o esgoto de agora é a água
 * consumida mais cedo. Nenhuma das duas curvas foi desenhada; as duas saem do
 * mesmo modelo.
 */

import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { Card, Kpi, Chip, Tanque, FaixaNormativa } from '../ui/componentes.jsx';
import { num } from '../ui/formato.js';
import { GraficoLinha, Legenda, CORES_SERIE } from '../charts/index.js';
import { LIMITES } from '../data/topologia.js';

export default function Esgoto() {
  const { sim } = useSim();
  const jan = (c, n = 1440) => janela(sim, c, n);
  const etes = [...sim.etes.values()];
  const pocos = [...sim.pocos.values()];
  const g = sim.global;
  const naoConformes = etes.filter((e) => !e.conforme);

  return (
    <div className="grid">
      <div className="kpis c12">
        <Kpi
          rotulo="Esgoto tratado"
          valor={num(g.vazaoEsgotoLs, 1)}
          unidade="L/s"
          sub={`${num(g.vazaoEsgotoLs * 3.6, 0)} m³/h`}
        />
        <Kpi
          rotulo="ETEs conformes"
          valor={`${etes.length - naoConformes.length}`}
          unidade={`de ${etes.length}`}
          estado={naoConformes.length ? 'critico' : 'ok'}
          sub={
            naoConformes.length
              ? naoConformes.map((e) => e.unidade.sigla).join(', ')
              : 'CONAMA 430/2011'
          }
        />
        {etes.map((e) => (
          <Kpi
            key={e.unidade.id}
            rotulo={`Carga ${e.unidade.sigla}`}
            valor={num(e.cargaPct, 0)}
            unidade="%"
            estado={e.cargaPct > 100 ? 'critico' : e.cargaPct > 85 ? 'atencao' : 'ok'}
            sub={`${num(e.afluenteLs, 1)} L/s de ${e.unidade.vazaoNominalLs}`}
          />
        ))}
        {pocos.map((p) => (
          <Kpi
            key={p.unidade.id}
            rotulo={`Poço ${p.unidade.sigla}`}
            valor={num(p.nivelPct, 0)}
            unidade="%"
            estado={p.extravasando ? 'critico' : p.nivelPct > 88 ? 'atencao' : 'ok'}
            sub={p.extravasando ? 'EXTRAVASANDO' : `afluente ${num(p.afluenteLs, 1)} L/s`}
          />
        ))}
      </div>

      <div className="c8">
        <Card
          titulo="Estações de tratamento de esgoto"
          meta={<span>Resolução CONAMA nº 430/2011</span>}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(276px,1fr))',
              gap: 'var(--e4)',
            }}
          >
            {etes.map((e) => (
              <div
                key={e.unidade.id}
                style={{
                  border: '1px solid var(--borda)',
                  borderRadius: 'var(--raio)',
                  padding: 'var(--e3)',
                }}
              >
                <div className="linha" style={{ marginBottom: 8 }}>
                  <b>{e.unidade.sigla}</b>
                  <span className="espaco" />
                  <Chip estado={e.conforme ? 'ok' : 'critico'} pequeno>
                    {e.conforme ? 'Conforme' : 'Fora do padrão'}
                  </Chip>
                </div>
                <div className="mut" style={{ fontSize: 'var(--t-xs)', marginBottom: 10 }}>
                  {e.unidade.tratamento} · {num(e.unidade.populacaoAtendida / 1000, 1)} mil hab.
                </div>
                <div className="pilha" style={{ gap: 'var(--e3)' }}>
                  <FaixaNormativa
                    nome="DBO no efluente"
                    valor={e.dboEfluenteMgL}
                    limite={{ min: 0, max: LIMITES.dboEfluente.max }}
                    casas={0}
                    unidade="mg/L"
                  />
                  <FaixaNormativa
                    nome="Oxigênio dissolvido no reator"
                    valor={e.odMgL}
                    limite={{ min: LIMITES.oxigenioDissolvido.min, max: 5 }}
                    casas={2}
                    unidade="mg/L"
                  />
                  <FaixaNormativa
                    nome="pH do efluente"
                    valor={e.ph}
                    limite={{ min: LIMITES.phEfluente.min, max: LIMITES.phEfluente.max }}
                    casas={2}
                  />
                </div>
                <dl className="pares" style={{ marginTop: 10 }}>
                  <dt>Afluente</dt>
                  <dd>{num(e.afluenteLs, 1)} L/s</dd>
                  <dt>Remoção de DBO</dt>
                  <dd>{num(e.remocaoDbo * 100, 1)} %</dd>
                  <dt>SST no efluente</dt>
                  <dd>{num(e.sstEfluenteMgL, 0)} mg/L</dd>
                </dl>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="c4 pilha">
        {pocos.map((p) => (
          <Card key={p.unidade.id} titulo={p.unidade.nome} meta={<span>poço de sucção</span>}>
            <Tanque
              nivelPct={p.nivelPct}
              esgoto
              marcas={(() => {
                const m = sim.malhas.get(p.unidade.id);
                return m
                  ? [
                      { pct: m.emergenciaPct, rot: `emerg. ${m.emergenciaPct}%` },
                      { pct: m.ligaPct, rot: `liga ${m.ligaPct}%` },
                      { pct: m.desligaPct, rot: `desliga ${m.desligaPct}%` },
                    ]
                  : [];
              })()}
            />
            <dl className="pares" style={{ marginTop: 10 }}>
              <dt>Afluente</dt>
              <dd>{num(p.afluenteLs, 1)} L/s</dd>
              <dt>Recalque</dt>
              <dd>{num(p.recalqueLs, 1)} L/s</dd>
              <dt>Volume útil</dt>
              <dd>{num(p.capacidadeM3, 0)} m³</dd>
              <dt>Conjuntos</dt>
              <dd>
                {(sim.bombasPorUnidade.get(p.unidade.id) ?? []).filter((b) => b.ligada).length}/
                {(sim.bombasPorUnidade.get(p.unidade.id) ?? []).length} operando
              </dd>
            </dl>
            <p className="nota">
              O poço trabalha ao contrário de um reservatório: enche sozinho e o recalque parte no
              nível ALTO. Acima do setpoint de emergência entram todos os conjuntos — é o último
              recurso antes do extravasamento.
            </p>
          </Card>
        ))}
      </div>

      <div className="c7">
        <Card titulo="Vazão afluente por ETE — 24 h">
          <GraficoLinha
            altura={220}
            unidade="L/s"
            casas={1}
            zero
            series={etes.map((e, i) => ({
              nome: e.unidade.sigla,
              cor: CORES_SERIE[i],
              ...jan(`ete/${e.unidade.id}/afluente`),
            }))}
          />
          <Legenda itens={etes.map((e, i) => ({ nome: e.unidade.nome, cor: CORES_SERIE[i] }))} />
        </Card>
      </div>

      <div className="c5">
        <Card titulo="Consumo de água × chegada de esgoto" meta={<span>defasagem: ~3 h</span>}>
          <GraficoLinha
            altura={200}
            unidade="L/s"
            casas={1}
            zero
            series={[
              { nome: 'Consumo Centro', cor: CORES_SERIE[0], ...jan('setor/centro/consumo') },
              { nome: 'Afluente ETE-CHC', cor: CORES_SERIE[1], ...jan('ete/ete-chacara/afluente') },
            ]}
          />
          <Legenda
            itens={[
              { nome: 'Consumo de água (Centro)', cor: CORES_SERIE[0] },
              { nome: 'Afluente na ETE Chácara', cor: CORES_SERIE[1] },
            ]}
          />
          <p className="nota">
            O pico de esgoto chega cerca de três horas depois do pico de consumo — 2,5 h de percurso
            na rede coletora mais o tempo da caixa de chegada. Nenhuma das duas curvas foi
            desenhada: as duas saem do mesmo modelo.
          </p>
        </Card>
      </div>

      <div className="c12">
        <Card
          titulo="Padrão de lançamento de efluentes"
          meta={
            <span>
              DBO ≤ {LIMITES.dboEfluente.max} mg/L ou remoção ≥{' '}
              {LIMITES.dboEfluente.remocaoMin * 100} %
            </span>
          }
          pad={false}
        >
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Estação</th>
                  <th>Processo</th>
                  <th className="n">Afluente</th>
                  <th className="n">Carga</th>
                  <th className="n">DBO entrada</th>
                  <th className="n">DBO saída</th>
                  <th className="n">Remoção</th>
                  <th className="n">SST</th>
                  <th className="n">OD</th>
                  <th className="n">pH</th>
                  <th>CONAMA 430</th>
                </tr>
              </thead>
              <tbody>
                {etes.map((e) => (
                  <tr key={e.unidade.id}>
                    <td className="principal">{e.unidade.nome}</td>
                    <td>{e.unidade.tratamento}</td>
                    <td className="n">{num(e.afluenteLs, 1)} L/s</td>
                    <td className="n">{num(e.cargaPct, 0)} %</td>
                    <td className="n">{num(e.dboAfluenteMgL, 0)}</td>
                    <td className="n">{num(e.dboEfluenteMgL, 0)}</td>
                    <td className="n">{num(e.remocaoDbo * 100, 1)} %</td>
                    <td className="n">{num(e.sstEfluenteMgL, 0)}</td>
                    <td className="n">{num(e.odMgL, 2)}</td>
                    <td className="n">{num(e.ph, 2)}</td>
                    <td>
                      <Chip estado={e.conforme ? 'ok' : 'critico'} pequeno>
                        {e.conforme ? 'Atende' : 'Não atende'}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

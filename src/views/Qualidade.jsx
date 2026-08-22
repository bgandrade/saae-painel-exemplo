/**
 * Qualidade da água.
 *
 * A tela separa dois momentos que costumam ser confundidos: o parâmetro na
 * SAÍDA da unidade de produção (onde o cloro é dosado) e o parâmetro no PONTO
 * DE REDE (onde a população consome, depois de horas de residência na
 * tubulação). O segundo é sempre menor que o primeiro, e é o segundo que a
 * Portaria GM/MS 888/2021 cobra.
 */

import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { Card, Kpi, Chip, FaixaNormativa } from '../ui/componentes.jsx';
import { num, estadoFaixa } from '../ui/formato.js';
import { GraficoLinha, Legenda, CORES_SERIE } from '../charts/index.js';
import { SETORES, LIMITES, porId } from '../data/topologia.js';

const PARAMS = [
  {
    chave: 'cloroMgL',
    nome: 'Cloro residual livre',
    lim: LIMITES.cloroLivre,
    unidade: 'mg/L',
    casas: 2,
  },
  { chave: 'ph', nome: 'pH', lim: LIMITES.ph, unidade: '', casas: 2 },
  { chave: 'turbidezUT', nome: 'Turbidez', lim: LIMITES.turbidez, unidade: 'uT', casas: 2 },
  { chave: 'fluoretoMgL', nome: 'Fluoreto', lim: LIMITES.fluoreto, unidade: 'mg/L', casas: 2 },
];

export default function Qualidade() {
  const { sim } = useSim();
  const jan = (c, n = 1440) => janela(sim, c, n);
  const producao = [...sim.qualidade.values()];
  const g = sim.global;

  const foraDeFaixa = SETORES.filter((s) => {
    const c = sim.setores.get(s.id).cloroMgL;
    return c < LIMITES.cloroLivre.min || c > LIMITES.cloroLivre.max;
  });

  return (
    <div className="grid">
      <div className="kpis c12">
        <Kpi
          rotulo="Cloro médio na rede"
          valor={num(g.cloroMedioMgL, 2)}
          unidade="mg/L"
          estado={estadoFaixa(g.cloroMedioMgL, LIMITES.cloroLivre)}
          sub={`faixa ${LIMITES.cloroLivre.min}–${LIMITES.cloroLivre.max} · GM/MS 888/2021`}
        />
        <Kpi
          rotulo="Pontos fora de faixa"
          valor={`${foraDeFaixa.length}`}
          unidade={`de ${SETORES.length}`}
          estado={foraDeFaixa.length ? 'critico' : 'ok'}
          sub={
            foraDeFaixa.length ? foraDeFaixa.map((s) => s.nomeCurto).join(', ') : 'todos conformes'
          }
        />
        {producao.map((q) => (
          <Kpi
            key={q.unidade.id}
            rotulo={`Cloro na saída ${q.unidade.sigla}`}
            valor={num(q.cloroMgL, 2)}
            unidade="mg/L"
            estado={estadoFaixa(q.cloroMgL, LIMITES.cloroLivre)}
            sub={`pH ${num(q.ph, 2)} · turbidez ${num(q.turbidezUT, 2)} uT`}
          />
        ))}
      </div>

      <div className="c5">
        <Card
          titulo="Saída das unidades de produção"
          meta={<span>Portaria GM/MS nº 888/2021</span>}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: 'var(--e4)',
            }}
          >
            {producao.map((q) => (
              <div key={q.unidade.id}>
                <div className="drawer-secao-tit">{q.unidade.nome}</div>
                <div className="pilha" style={{ gap: 'var(--e3)' }}>
                  {PARAMS.map((p) => (
                    <FaixaNormativa
                      key={p.chave}
                      nome={p.nome}
                      valor={q[p.chave]}
                      limite={p.lim}
                      casas={p.casas}
                      unidade={p.unidade}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="c7">
        <Card
          titulo="Cloro residual livre nos pontos de rede — 24 h"
          meta={
            <span>
              faixa verde: {LIMITES.cloroLivre.min} a {LIMITES.cloroLivre.max} mg/L
            </span>
          }
        >
          <GraficoLinha
            altura={230}
            unidade="mg/L"
            casas={2}
            zero
            faixa={{ min: LIMITES.cloroLivre.min, max: LIMITES.cloroLivre.max }}
            limites={[LIMITES.cloroLivre.min]}
            series={SETORES.map((s, i) => ({
              nome: s.nomeCurto ?? s.nome,
              cor: CORES_SERIE[i],
              ...jan(`setor/${s.id}/cloro`),
            }))}
          />
          <Legenda itens={SETORES.map((s, i) => ({ nome: s.nome, cor: CORES_SERIE[i] }))} />
        </Card>
      </div>

      <div className="c6">
        <Card
          titulo="Turbidez na saída das unidades — 24 h"
          meta={<span>máximo normativo de {LIMITES.turbidez.max} uT</span>}
        >
          <GraficoLinha
            altura={190}
            unidade="uT"
            casas={2}
            zero
            series={producao.map((q, i) => ({
              nome: q.unidade.sigla,
              cor: CORES_SERIE[i],
              ...jan(`qual/${q.unidade.id}/turbidez`),
            }))}
          />
          <Legenda
            itens={producao.map((q, i) => ({ nome: q.unidade.nome, cor: CORES_SERIE[i] }))}
          />
        </Card>
      </div>

      <div className="c6">
        <Card titulo="pH na saída das unidades — 24 h" meta={<span>faixa verde: 6,0 a 9,0</span>}>
          <GraficoLinha
            altura={190}
            casas={2}
            faixa={{ min: LIMITES.ph.min, max: LIMITES.ph.max }}
            series={producao.map((q, i) => ({
              nome: q.unidade.sigla,
              cor: CORES_SERIE[i],
              ...jan(`qual/${q.unidade.id}/ph`),
            }))}
          />
          <Legenda
            itens={producao.map((q, i) => ({ nome: q.unidade.nome, cor: CORES_SERIE[i] }))}
          />
        </Card>
      </div>

      <div className="c12">
        <Card
          titulo="Pontos de coleta na rede de distribuição"
          meta={<span>valores no ponto de consumo, após tempo de residência</span>}
          pad={false}
        >
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Setor / ponto de coleta</th>
                  <th>Origem</th>
                  <th className="n">Residência</th>
                  <th className="n">Cloro na saída</th>
                  <th className="n">Cloro na rede</th>
                  <th className="n">Mín 24 h</th>
                  <th>Conformidade</th>
                </tr>
              </thead>
              <tbody>
                {SETORES.map((s) => {
                  const est = sim.setores.get(s.id);
                  const e = sim.hist.serie(`setor/${s.id}/cloro`).estat();
                  const fonteId = s.fonteId;
                  const q = sim.qualidade.get(fonteId) ?? sim.qualidade.get('cap-banqueta');
                  const estado = estadoFaixa(est.cloroMgL, LIMITES.cloroLivre);
                  return (
                    <tr key={s.id}>
                      <td className="principal">{s.nome}</td>
                      <td>
                        {s.semTelemetria ? 'sistema local' : (porId.get(fonteId)?.sigla ?? '—')}
                      </td>
                      <td className="n">{num(s.residenciaH, 1)} h</td>
                      <td className="n">
                        {s.semTelemetria ? '—' : `${num(q?.cloroMgL ?? 0, 2)} mg/L`}
                      </td>
                      <td className="n principal">{num(est.cloroMgL, 2)} mg/L</td>
                      <td className="n">{num(e.min, 2)}</td>
                      <td>
                        <Chip estado={estado} pequeno>
                          {estado === 'ok'
                            ? 'Conforme'
                            : estado === 'atencao'
                              ? 'Próximo do limite'
                              : 'Não conforme'}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="nota" style={{ padding: 'var(--e3) var(--e4)' }}>
            O cloro na rede é sempre menor que o da saída: ele decai por tempo de residência na
            tubulação. Japuíba tem a maior residência (6,8 h) e por isso a maior queda — é o ponto
            que primeiro sai de faixa quando a dosagem cai.
          </p>
        </Card>
      </div>
    </div>
  );
}

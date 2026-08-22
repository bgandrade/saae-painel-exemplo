/**
 * Rede, pressão e reservatórios.
 *
 * A pressão aparece por setor e não em média global porque média de pressão
 * esconde exatamente o que interessa: um setor a 8 mca e outro a 40 dão uma
 * média confortável de 24, e ninguém fica sabendo do primeiro.
 */

import { useSim, janela } from '../hooks/useSimulacao.jsx';
import { Card, Kpi, Chip, Tanque } from '../ui/componentes.jsx';
import { num } from '../ui/formato.js';
import { GraficoLinha, Legenda, BarraEmpilhada, CORES_SERIE } from '../charts/index.js';
import { SETORES, LIMITES } from '../data/topologia.js';

function celulaPressao(v) {
  const estado =
    v < LIMITES.pressao.min
      ? 'critico'
      : v < 15
        ? 'atencao'
        : v > LIMITES.pressao.max
          ? 'atencao'
          : 'ok';
  const cor = { critico: 'var(--critico)', atencao: 'var(--atencao)', ok: 'var(--ok)' }[estado];
  return (
    <td
      className="n principal"
      style={{ background: `color-mix(in srgb, ${cor} 16%, transparent)` }}
    >
      {num(v, 1)}
    </td>
  );
}

export default function Rede() {
  const { sim } = useSim();
  const g = sim.global;
  const h = sim.hist;
  const jan = (c, n = 1440) => janela(sim, c, n);

  const pressoes = SETORES.map((s) => sim.setores.get(s.id).pressaoMca);
  const pior = Math.min(...pressoes);
  const saldo = g.vazaoProduzidaLs - g.vazaoDistribuidaLs;
  const reservs = [...sim.reservatorios.keys()];

  return (
    <div className="grid">
      <div className="kpis c12">
        <Kpi
          rotulo="Pressão média ponderada"
          valor={num(g.pressaoMediaMca, 1)}
          unidade="mca"
          sub="ponderada por população"
        />
        <Kpi
          rotulo="Menor pressão de setor"
          valor={num(pior, 1)}
          unidade="mca"
          estado={pior < LIMITES.pressao.min ? 'critico' : pior < 15 ? 'atencao' : 'ok'}
          sub={SETORES[pressoes.indexOf(pior)].nome}
        />
        <Kpi
          rotulo="Reservação total"
          valor={num(g.reservacaoPct, 0)}
          unidade="%"
          sub={`${num(g.volumeReservadoM3, 0)} m³`}
        />
        <Kpi
          rotulo="Vazão distribuída"
          valor={num(g.vazaoDistribuidaLs, 0)}
          unidade="L/s"
          sub={`${num(g.vazaoDistribuidaLs * 3.6, 0)} m³/h`}
        />
        <Kpi
          rotulo="Índice de perdas"
          valor={num((g.indicePerdas ?? 0) * 100, 1)}
          unidade="%"
          sub={`${num(g.perdasLs, 1)} L/s · SNIS IN049`}
        />
        <Kpi
          rotulo="Volume distribuído hoje"
          valor={num(g.volumeDistribuidoM3Hoje, 0)}
          unidade="m³"
        />
      </div>

      <div className="c7">
        <Card
          titulo="Pressão por setor — últimas 24 horas"
          meta={<span>tracejado: mínimo de {LIMITES.pressao.min} mca (NBR 12218)</span>}
        >
          <GraficoLinha
            altura={230}
            unidade="mca"
            casas={0}
            limites={[LIMITES.pressao.min]}
            series={SETORES.map((s, i) => ({
              nome: s.nomeCurto ?? s.nome,
              cor: CORES_SERIE[i],
              ...jan(`setor/${s.id}/pressao`),
            }))}
          />
          <Legenda itens={SETORES.map((s, i) => ({ nome: s.nome, cor: CORES_SERIE[i] }))} />
        </Card>
      </div>

      <div className="c5">
        <Card titulo="Pressão por setor — situação atual" pad={false}>
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Setor</th>
                  <th className="n">Atual</th>
                  <th className="n">Mín 24 h</th>
                  <th className="n">Méd 24 h</th>
                  <th className="n">Máx 24 h</th>
                  <th className="n">Consumo</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {SETORES.map((s) => {
                  const est = sim.setores.get(s.id);
                  const e = h.serie(`setor/${s.id}/pressao`).estat();
                  const p = est.pressaoMca;
                  const estado = p < LIMITES.pressao.min ? 'critico' : p < 15 ? 'atencao' : 'ok';
                  return (
                    <tr key={s.id}>
                      <td className="principal">
                        {s.nome}
                        {s.semTelemetria && <small className="mut"> · sistema local</small>}
                      </td>
                      {celulaPressao(p)}
                      <td className="n">{num(e.min, 1)}</td>
                      <td className="n">{num(e.media, 1)}</td>
                      <td className="n">{num(e.max, 1)}</td>
                      <td className="n">{num(est.consumoLs, 1)} L/s</td>
                      <td>
                        <Chip estado={estado} pequeno>
                          {estado === 'ok' ? 'Normal' : estado === 'atencao' ? 'Baixa' : 'Crítica'}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="c8">
        <Card titulo="Reservatórios" meta={<span>marcas tracejadas: setpoints do CLP</span>}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(196px,1fr))',
              gap: 'var(--e4)',
            }}
          >
            {[...sim.reservatorios.values()].map((r) => {
              const estado = r.nivelPct < 10 ? 'critico' : r.nivelPct < 20 ? 'atencao' : 'ok';
              // Os setpoints do reservatório podem morar na própria unidade
              // (captação, que bombeia para si) ou na elevatória que o enche
              // (o caso do RES-BQT). O marcador tem de achar os dois.
              const cfg =
                sim.malhas.get(r.unidade.id) ??
                [...sim.malhas.values()].find(
                  (x) => x.tipo === 'recalque' && x.destinoId === r.unidade.id,
                );
              const marcas = cfg
                ? [
                    { pct: cfg.desligaPct, rot: `${cfg.desligaPct}%` },
                    { pct: cfg.ligaPct, rot: `${cfg.ligaPct}%` },
                  ]
                : [];
              return (
                <div
                  key={r.unidade.id}
                  style={{
                    border: '1px solid var(--borda)',
                    borderRadius: 'var(--raio)',
                    padding: 'var(--e3)',
                  }}
                >
                  <div className="linha" style={{ marginBottom: 10 }}>
                    <b>{r.unidade.sigla}</b>
                    <span className="espaco" />
                    <Chip estado={estado} pequeno>
                      {num(r.nivelPct, 0)} %
                    </Chip>
                  </div>
                  <Tanque nivelPct={r.nivelPct} marcas={marcas} />
                  <div style={{ marginTop: 8 }}>
                    <dl className="pares">
                      <dt>Volume</dt>
                      <dd>{num(r.volumeM3, 0)} m³</dd>
                      <dt>Capacidade</dt>
                      <dd>{num(r.capacidadeM3, 0)} m³</dd>
                      <dt>Entrada</dt>
                      <dd>{num(r.entradaLs, 1)} L/s</dd>
                      <dt>Saída</dt>
                      <dd>{num(r.saidaLs, 1)} L/s</dd>
                      <dt>Autonomia</dt>
                      <dd>{r.autonomiaH > 90 ? '—' : `${num(r.autonomiaH, 1)} h`}</dd>
                    </dl>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="c4">
        <Card titulo="Balanço hídrico instantâneo" meta={<span>setores com telemetria</span>}>
          <BarraEmpilhada
            unidade="L/s"
            segmentos={[
              { nome: 'Consumo micromedido', valor: g.consumoLs, cor: 'var(--serie-1)' },
              {
                nome: 'Perdas na distribuição',
                valor: Math.max(0, g.perdasLs),
                cor: 'var(--serie-4)',
              },
            ]}
          />
          <dl className="pares" style={{ marginTop: 14 }}>
            <dt>Produzido nas captações</dt>
            <dd>{num(g.vazaoProduzidaLs, 1)} L/s</dd>
            <dt>Distribuído à rede</dt>
            <dd>{num(g.vazaoDistribuidaLs, 1)} L/s</dd>
            <dt>{saldo >= 0 ? 'Acumulando em reservatório' : 'Consumindo da reservação'}</dt>
            <dd style={saldo < 0 ? { color: 'var(--atencao)' } : undefined}>
              {num(Math.abs(saldo), 1)} L/s
            </dd>
            <dt>Consumido (micromedido)</dt>
            <dd>{num(g.consumoLs, 1)} L/s</dd>
            <dt>Perdas na distribuição</dt>
            <dd>{num(g.perdasLs, 1)} L/s</dd>
          </dl>
          <p className="nota">
            Distribuir mais do que se produz é normal por algumas horas: a diferença sai da
            reservação e é reposta quando as bombas de captação religam. No acumulado de 24 h os
            dois valores se igualam. A Vila do Abraão fica fora desta conta — é abastecida por
            sistema local, sem telemetria de produção.
          </p>
        </Card>
      </div>

      <div className="c12">
        <Card
          titulo="Nível dos reservatórios — 24 h"
          meta={<span>os ciclos vêm da histerese de nível, não de agenda</span>}
        >
          <GraficoLinha
            altura={190}
            unidade="%"
            casas={0}
            limites={[20]}
            series={reservs.map((id, i) => ({
              nome: sim.reservatorios.get(id).unidade.sigla,
              cor: CORES_SERIE[i],
              ...jan(`reserv/${id}/nivel`),
            }))}
          />
          <Legenda
            itens={reservs.map((id, i) => ({
              nome: sim.reservatorios.get(id).unidade.nome,
              cor: CORES_SERIE[i],
            }))}
          />
        </Card>
      </div>
    </div>
  );
}

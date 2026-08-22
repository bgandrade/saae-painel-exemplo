/**
 * Relatórios — nível 4 da ISA-101: consulta e diagnóstico.
 *
 * A tela responde ao pedido mais direto do projeto: "gerar relatórios". E fala
 * a língua de quem decide — os indicadores aparecem com o CÓDIGO SNIS ao lado,
 * porque são exatamente os números que a autarquia já reporta todo ano. Ver
 * IN049 e IN058 saindo sozinhos do painel é o argumento de retorno mais direto
 * que esta maquete tem.
 *
 * A impressão usa o diálogo do navegador como gerador de PDF: sem biblioteca,
 * sem servidor, e o que sai tem cabeçalho institucional, período e o aviso de
 * dados simulados. Ver `src/estilos/impressao.css`.
 */

import { useState } from 'react';
import { useSim } from '../hooks/useSimulacao.jsx';
import { Card, Kpi, Chip, Segmentado } from '../ui/componentes.jsx';
import { num, horimetro, dataHora, dataLonga, hora, estadoFaixa } from '../ui/formato.js';
import Icone from '../ui/Icone.jsx';
import { SETORES, LIMITES, porId } from '../data/topologia.js';

const POPULACAO = SETORES.reduce((s, x) => s + x.populacao, 0);

/* Integra uma série amostrada a cada minuto. Cada amostra vale 60 s. */
const somaSerie = (sim, chave, n = 1440) => {
  const { v } = sim.hist.serie(chave).janela(n);
  let s = 0;
  for (const x of v) s += x;
  return { soma: s, amostras: v.length };
};
/** L/s amostrado por minuto → m³ no período. */
const volumeM3 = (sim, chave, n) => somaSerie(sim, chave, n).soma * 0.06;
/** kW amostrado por minuto → kWh no período. */
const energiaKWh = (sim, chave, n) => somaSerie(sim, chave, n).soma / 60;

const PERIODOS = [
  { id: 360, nome: '6 h' },
  { id: 720, nome: '12 h' },
  { id: 1440, nome: '24 h' },
];

export default function Relatorios() {
  const { sim, alarmes } = useSim();
  const [n, setN] = useState(1440);
  const horas = n / 60;

  const produzido = volumeM3(sim, 'glob/vazaoProduzida', n);
  const distribuido = volumeM3(sim, 'glob/vazaoDistribuida', n);
  const consumido = volumeM3(sim, 'glob/consumo', n);
  const esgoto = volumeM3(sim, 'glob/vazaoEsgoto', n);
  const energia = energiaKWh(sim, 'glob/potencia', n);

  const in049 = distribuido > 0 ? ((distribuido - consumido) / distribuido) * 100 : 0;
  const in058 = produzido > 0 ? energia / produzido : 0;
  const in022 = (consumido * 1000) / POPULACAO / (horas / 24);
  const in046 = consumido > 0 ? (esgoto / consumido) * 100 : 0;

  const inicio = sim.tempo - n * 60000;
  const alarmesPeriodo = alarmes.historico.filter((a) => a.t >= inicio && a.acao === 'ativou');
  const taxaAlarmes = alarmesPeriodo.length / horas;

  const bombas = [...sim.bombas.values()];
  const horasBombeadas = (b) => {
    const { v } = sim.hist.serie(`bomba/${b.id}/ligada`).janela(n);
    let s = 0;
    for (const x of v) s += x;
    return s / 60;
  };

  function exportarCSV() {
    const linhas = [
      ['SAAE Angra dos Reis — Boletim de operação (DADOS SIMULADOS)'],
      ['Período', `últimas ${horas} h`, 'Emitido em', dataHora(sim.tempo)],
      [],
      ['Indicador', 'Código SNIS', 'Valor', 'Unidade'],
      ['Índice de perdas na distribuição', 'IN049', num(in049, 2), '%'],
      ['Consumo de energia elétrica', 'IN058', num(in058, 3), 'kWh/m³'],
      ['Consumo médio per capita', 'IN022', num(in022, 1), 'L/hab./dia'],
      ['Esgoto tratado referido à água consumida', 'IN046', num(in046, 1), '%'],
      [],
      ['Volume produzido', '', num(produzido, 1), 'm³'],
      ['Volume distribuído', '', num(distribuido, 1), 'm³'],
      ['Volume consumido (micromedido)', '', num(consumido, 1), 'm³'],
      ['Esgoto tratado', '', num(esgoto, 1), 'm³'],
      ['Energia consumida', '', num(energia, 1), 'kWh'],
      [],
      ['Conjunto', 'Unidade', 'Horas bombeadas', 'Partidas hoje', 'Horímetro (h)', 'Modo'],
      ...bombas.map((b) => [
        b.id, b.unidade.sigla, num(horasBombeadas(b), 2), b.partidasHoje, num(b.horimetroH, 0),
        b.modo === 'manual' ? 'MANUAL' : 'AUTO',
      ]),
      [],
      ['Alarme', 'Origem', 'Severidade', 'Horário'],
      ...alarmesPeriodo.map((a) => [a.titulo, a.origem, a.severidade, dataHora(a.t)]),
    ];
    const csv = '﻿' + linhas.map((l) => l.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `saae-angra-boletim-${new Date(sim.tempo).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid">
      {/* Só aparece no papel: ver impressao.css */}
      <div className="cabecalho-relatorio">
        <div className="cr-org">SAAE — Serviço Autônomo de Água e Esgoto de Angra dos Reis</div>
        <div className="cr-sub">Centro de Controle Operacional</div>
        <div className="cr-tit">Boletim de Operação</div>
        <div className="cr-meta">
          Período: últimas {horas} horas · Emitido em {dataLonga(sim.tempo)}, {hora(sim.tempo)} ·
          Operador de plantão: {sim.operador}
        </div>
        <div className="cr-aviso">
          DOCUMENTO DEMONSTRATIVO — TODOS OS DADOS SÃO SIMULADOS E NÃO REPRESENTAM MEDIÇÃO REAL
        </div>
      </div>

      <div className="c12 sem-impressao">
        <div className="linha wrap">
          <Segmentado
            opcoes={PERIODOS.map((p) => ({ id: p.id, nome: p.nome }))}
            valor={n} aoMudar={setN} rotulo="Período"
          />
          <span className="espaco" />
          <button className="btn" onClick={exportarCSV}><Icone nome="baixar" /> Exportar CSV</button>
          <button className="btn primario" onClick={() => print()}><Icone nome="impressora" /> Imprimir / PDF</button>
        </div>
      </div>

      <div className="c12">
        <Card
          titulo="Indicadores SNIS"
          meta={<span>Sistema Nacional de Informações sobre Saneamento</span>}
        >
          <div className="snis">
            <ItemSnis cod="IN049" nome="Índice de perdas na distribuição"
              valor={num(in049, 1)} unidade="%"
              ref_={`${num(distribuido - consumido, 0)} m³ não consumidos de ${num(distribuido, 0)} m³ distribuídos`} />
            <ItemSnis cod="IN058" nome="Consumo de energia elétrica em sistemas de abastecimento"
              valor={num(in058, 3)} unidade="kWh/m³"
              ref_={`${num(energia, 0)} kWh para produzir ${num(produzido, 0)} m³`} />
            <ItemSnis cod="IN022" nome="Consumo médio per capita de água"
              valor={num(in022, 1)} unidade="L/hab./dia"
              ref_={`${num(POPULACAO / 1000, 1)} mil habitantes atendidos`} />
            <ItemSnis cod="IN046" nome="Esgoto tratado referido à água consumida"
              valor={num(in046, 1)} unidade="%"
              ref_={`${num(esgoto, 0)} m³ tratados de ${num(consumido, 0)} m³ consumidos`} />
          </div>
          <p className="nota">
            Estes quatro indicadores são calculados a partir das mesmas séries que alimentam os
            gráficos — não há planilha intermediária. Num sistema em produção, é este cálculo que
            substituiria o levantamento manual feito hoje para a declaração anual.
          </p>
        </Card>
      </div>

      <div className="c12">
        <Card titulo={`Balanço do período — últimas ${horas} horas`}>
          <div className="kpis">
            <Kpi rotulo="Volume produzido" valor={num(produzido, 0)} unidade="m³" sub="captações" />
            <Kpi rotulo="Volume distribuído" valor={num(distribuido, 0)} unidade="m³" sub="consumo + perdas" />
            <Kpi rotulo="Volume consumido" valor={num(consumido, 0)} unidade="m³" sub="micromedido" />
            <Kpi rotulo="Perdas" valor={num(distribuido - consumido, 0)} unidade="m³" sub={`${num(in049, 1)} %`} />
            <Kpi rotulo="Esgoto tratado" valor={num(esgoto, 0)} unidade="m³" />
            <Kpi rotulo="Energia consumida" valor={num(energia, 0)} unidade="kWh" sub={`${num(in058, 3)} kWh/m³`} />
          </div>
        </Card>
      </div>

      <div className="c7">
        <Card titulo="Operação dos conjuntos motobomba" pad={false}>
          <div className="rolagem" style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Conjunto</th><th>Unidade</th><th className="n">Horas bombeadas</th>
                  <th className="n">Aproveitamento</th><th className="n">Partidas hoje</th>
                  <th className="n">Horímetro</th><th>Modo</th>
                </tr>
              </thead>
              <tbody>
                {bombas.map((b) => {
                  const hb = horasBombeadas(b);
                  return (
                    <tr key={b.id}>
                      <td className="principal">{b.id}</td>
                      <td>{b.unidade.sigla}</td>
                      <td className="n">{num(hb, 2)} h</td>
                      <td className="n">{num((hb / horas) * 100, 0)} %</td>
                      <td className="n">{b.partidasHoje}</td>
                      <td className="n">{horimetro(b.horimetroH)}</td>
                      <td>{b.modo === 'manual' ? 'MANUAL' : 'AUTO'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="c5 pilha">
        <Card
          titulo="Desempenho do sistema de alarmes"
          meta={<span>EEMUA 191</span>}
        >
          <div className="kpis">
            <Kpi rotulo="Alarmes no período" valor={`${alarmesPeriodo.length}`} sub={`em ${horas} h`} />
            <Kpi rotulo="Taxa de alarmes" valor={num(taxaAlarmes, 2)} unidade="/h"
              estado={taxaAlarmes > 6 ? 'critico' : taxaAlarmes > 3 ? 'atencao' : 'ok'}
              sub="meta EEMUA: ≤ 6 por hora" />
            <Kpi rotulo="Ativos agora" valor={`${alarmes.contagem.total}`}
              estado={alarmes.contagem.critico ? 'critico' : alarmes.contagem.alerta ? 'atencao' : 'ok'}
              sub={`${alarmes.contagem.naoReconhecidos} não reconhecidos`} />
          </div>
          <p className="nota">
            A EEMUA 191 recomenda no máximo um alarme a cada dez minutos por operador em regime
            normal. Acima disso o operador aprende a ignorar o painel — o fenômeno que a indústria
            chama de <b>avalanche de alarmes</b>, e a razão de o motor deste painel ter banda morta
            e atraso de confirmação.
          </p>
        </Card>

        <Card titulo="Qualidade da água no período" meta={<span>GM/MS 888/2021</span>} pad={false}>
          <table className="tabela compacta">
            <thead>
              <tr>
                <th>Ponto</th><th className="n">Cloro mín</th><th className="n">Cloro méd</th>
                <th className="n">Cloro máx</th><th>Conformidade</th>
              </tr>
            </thead>
            <tbody>
              {SETORES.map((s) => {
                const e = sim.hist.serie(`setor/${s.id}/cloro`).estat(n);
                const conf = e.min >= LIMITES.cloroLivre.min && e.max <= LIMITES.cloroLivre.max;
                return (
                  <tr key={s.id}>
                    <td className="principal">{s.nomeCurto}</td>
                    <td className="n">{num(e.min, 2)}</td>
                    <td className="n">{num(e.media, 2)}</td>
                    <td className="n">{num(e.max, 2)}</td>
                    <td><Chip estado={conf ? 'ok' : 'critico'} pequeno>{conf ? 'Conforme' : 'Não conforme'}</Chip></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="c12">
        <Card titulo="Histórico de alarmes do período" pad={false}>
          {alarmesPeriodo.length ? (
            <div className="rolagem" style={{ maxHeight: 320, overflowY: 'auto' }}>
              <table className="tabela">
                <thead>
                  <tr><th>Horário</th><th>Severidade</th><th>Alarme</th><th>Origem</th></tr>
                </thead>
                <tbody>
                  {alarmesPeriodo.map((a, i) => (
                    <tr key={i}>
                      <td>{dataHora(a.t)}</td>
                      <td><Chip estado={a.severidade === 'critico' ? 'critico' : a.severidade === 'alerta' ? 'atencao' : 'info'} pequeno>
                        {a.severidade}
                      </Chip></td>
                      <td className="principal">{a.titulo}</td>
                      <td>{a.origem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="vazio">
              <Icone nome="ok" tamanho={20} />
              Nenhum alarme no período. O sistema operou dentro dos limites normativos durante as
              últimas {horas} horas.
            </div>
          )}
        </Card>
      </div>

      <div className="c12">
        <Card titulo="Padrão de lançamento de efluentes" meta={<span>CONAMA 430/2011</span>} pad={false}>
          <table className="tabela">
            <thead>
              <tr>
                <th>Estação</th><th>Processo</th><th className="n">Vazão média</th>
                <th className="n">DBO efluente</th><th className="n">Remoção</th><th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {[...sim.etes.values()].map((e) => {
                const q = sim.hist.serie(`ete/${e.unidade.id}/afluente`).estat(n);
                const dbo = sim.hist.serie(`ete/${e.unidade.id}/dboEfluente`).estat(n);
                const rem = sim.hist.serie(`ete/${e.unidade.id}/remocao`).estat(n);
                const conf = dbo.media <= LIMITES.dboEfluente.max || rem.media / 100 >= LIMITES.dboEfluente.remocaoMin;
                return (
                  <tr key={e.unidade.id}>
                    <td className="principal">{e.unidade.nome}</td>
                    <td>{e.unidade.tratamento}</td>
                    <td className="n">{num(q.media, 1)} L/s</td>
                    <td className="n">{num(dbo.media, 0)} mg/L</td>
                    <td className="n">{num(rem.media, 1)} %</td>
                    <td><Chip estado={conf ? 'ok' : 'critico'} pequeno>{conf ? 'Atende' : 'Não atende'}</Chip></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function ItemSnis({ cod, nome, valor, unidade, ref_ }) {
  return (
    <div className="snis-item">
      <span className="snis-cod">{cod}</span>
      <div className="snis-nome">{nome}</div>
      <div className="snis-val">{valor}<small>{unidade}</small></div>
      <div className="snis-ref">{ref_}</div>
    </div>
  );
}

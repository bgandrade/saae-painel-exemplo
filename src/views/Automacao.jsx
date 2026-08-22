/**
 * Automação — nível 3 da ISA-101.
 *
 * A tela existe para resolver um problema específico: as malhas de controle já
 * funcionavam, mas ficavam invisíveis dentro do código. Automação que ninguém
 * vê não convence ninguém.
 *
 * Três blocos: as MALHAS com setpoints editáveis (arraste um slider e veja a
 * bomba responder), as REGRAS em português com LED ao vivo, e a TRILHA DE
 * COMANDOS. A linha "BLOQUEADO" da auditoria é a mais valiosa da tela inteira:
 * é ela que prova que o sistema protege o equipamento de um comando errado.
 */

import { useState } from 'react';
import { useSim } from '../hooks/useSimulacao.jsx';
import { Card, Chip, Kpi } from '../ui/componentes.jsx';
import { num, hora, duracao } from '../ui/formato.js';
import Icone from '../ui/Icone.jsx';
import {
  regrasDaUnidade,
  variavelProcesso,
  setpointsEditaveis,
  proximaTrocaS,
} from '../engine/control.js';
import { unidadesComBomba } from '../data/topologia.js';

export default function Automacao() {
  const { sim } = useSim();
  const unidades = unidadesComBomba().filter((u) => sim.malhas.has(u.id));
  const [sel, setSel] = useState('eea-banqueta');
  const u = unidades.find((x) => x.id === sel) ?? unidades[0];

  const emManual = sim.bombasEmManual.length;
  const malhasFora = [...sim.malhas.values()].filter((m) => m.modo === 'fora').length;
  const bloqueados = sim.comandos.filter((c) => !c.aceito).length;

  return (
    <div className="grid">
      <div className="kpis c12">
        <Kpi
          rotulo="Malhas em automático"
          valor={`${sim.malhas.size - malhasFora}`}
          unidade={`de ${sim.malhas.size}`}
          estado={malhasFora ? 'atencao' : 'ok'}
          sub={malhasFora ? `${malhasFora} fora de serviço` : 'todas operando'}
        />
        <Kpi
          rotulo="Conjuntos em manual"
          valor={`${emManual}`}
          unidade={`de ${sim.bombas.size}`}
          estado={emManual ? 'atencao' : 'ok'}
          sub="não governados pela malha"
        />
        <Kpi rotulo="Comandos registrados" valor={`${sim.comandos.length}`} sub="nesta sessão" />
        <Kpi
          rotulo="Comandos bloqueados"
          valor={`${bloqueados}`}
          estado={bloqueados ? 'atencao' : 'ok'}
          sub="recusados por intertravamento"
        />
        <Kpi
          rotulo="Partidas hoje"
          valor={`${[...sim.bombas.values()].reduce((s, b) => s + b.partidasHoje, 0)}`}
          sub="todos os conjuntos"
        />
        <Kpi
          rotulo="Energia hoje"
          valor={num(sim.global.energiaKWhHoje, 0)}
          unidade="kWh"
          sub={`${num(sim.global.potenciaKW, 0)} kW agora`}
        />
      </div>

      <div className="c12">
        <div className="segmentado" role="group" aria-label="Unidade">
          {unidades.map((x) => (
            <button
              key={x.id}
              type="button"
              title={x.nome}
              aria-pressed={x.id === u.id}
              onClick={() => setSel(x.id)}
            >
              {x.sigla}
            </button>
          ))}
        </div>
      </div>

      <div className="c5">
        <Card titulo={`Malha de controle — ${u.sigla}`} meta={<ModoMalha unidade={u} />}>
          <Malha unidade={u} />
        </Card>
      </div>

      <div className="c7">
        <Card
          titulo="Regras e intertravamentos"
          meta={<span>LED aceso = condição verdadeira agora</span>}
        >
          <Regras unidade={u} />
        </Card>
      </div>

      <div className="c12">
        <Card
          titulo="Trilha de comandos do operador"
          meta={<span>registro completo, aceito ou recusado</span>}
          pad={false}
        >
          <Auditoria />
        </Card>
      </div>

      <div className="c12">
        <Card titulo="O que esta tela demonstra" classe="sem-impressao">
          <Roteiro />
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────── malha ─────────────────────────── */

function ModoMalha({ unidade: u }) {
  const { sim } = useSim();
  const [, forcar] = useState(0);
  const m = sim.malhas.get(u.id);
  return (
    <div className="segmentado" role="group" aria-label="Modo da malha">
      {[
        ['auto', 'AUTOMÁTICO'],
        ['fora', 'FORA DE SERVIÇO'],
      ].map(([id, rot]) => (
        <button
          key={id}
          type="button"
          aria-pressed={m.modo === id}
          onClick={() => {
            sim.definirModoMalha(u.id, id);
            forcar((x) => x + 1);
          }}
        >
          {rot}
        </button>
      ))}
    </div>
  );
}

function Malha({ unidade: u }) {
  const { sim } = useSim();
  const [, forcar] = useState(0);
  const m = sim.malhas.get(u.id);
  const pv = variavelProcesso(sim, u);
  const sps = setpointsEditaveis(m);
  const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
  const troca = proximaTrocaS(sim, u.id);

  const frac = (v) => ((v - pv.min) / (pv.max - pv.min)) * 100;
  const est = pv.valor < 15 ? 'baixo' : pv.valor < 25 ? 'atencao' : '';

  return (
    <div className="malha">
      <div className="malha-pv">
        <div className="malha-pv-topo">
          <span className="mut">{pv.rotulo}</span>
          <span className="malha-pv-val">
            {num(pv.valor, 1)}{' '}
            <small className="mut" style={{ fontSize: 'var(--t-sm)' }}>
              {pv.unidade}
            </small>
          </span>
        </div>
        <div className="malha-trilho">
          <i className={est} style={{ width: `${Math.max(0, Math.min(100, frac(pv.valor)))}%` }} />
          {pv.temSetpoints && (
            <>
              <span
                className="malha-sp"
                data-rot={`liga ${m.ligaPct}`}
                style={{ left: `${frac(m.ligaPct)}%` }}
              />
              <span
                className="malha-sp"
                data-rot={`desliga ${m.desligaPct}`}
                style={{ left: `${frac(m.desligaPct)}%` }}
              />
              <span
                className="malha-sp emerg"
                data-rot="emerg."
                style={{ left: `${frac(m.emergenciaPct)}%` }}
              />
            </>
          )}
        </div>
      </div>

      <div className="linha wrap" style={{ gap: 6 }}>
        <Chip estado={m.modo === 'fora' ? 'critico' : 'ok'}>
          {m.modo === 'fora' ? 'Malha fora de serviço' : 'Malha em automático'}
        </Chip>
        <Chip estado="info">
          {bombas.filter((b) => b.ligada).length} de {bombas.length} operando
        </Chip>
        {troca != null && <Chip estado="parada">troca de líder em {duracao(troca)}</Chip>}
      </div>

      <p className="nota">
        <b>Estratégia:</b> {m.descricao}
      </p>

      <div className="pilha">
        {sps.map((sp) => (
          <div key={sp.campo}>
            <div
              className="linha"
              style={{ justifyContent: 'space-between', fontSize: 'var(--t-xs)' }}
            >
              <span className="mut">{sp.rotulo}</span>
            </div>
            <div className="slider-linha">
              <input
                type="range"
                min={sp.min}
                max={sp.max}
                step={sp.passo}
                value={m[sp.campo]}
                disabled={m.modo === 'fora'}
                aria-label={sp.rotulo}
                onChange={(e) => {
                  sim.ajustarSetpoint(u.id, sp.campo, Number(e.target.value));
                  forcar((x) => x + 1);
                }}
              />
              <span className="slider-val">
                {num(m[sp.campo], 0)} {sp.unidade}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="nota">
        Estes são os setpoints que o CLP executa. Arraste um e observe a estação responder em
        segundos — as partidas saem <b>escalonadas</b>, respeitando o intervalo mínimo, e a
        auditoria abaixo registra o ajuste com o valor anterior e o novo.
      </p>
    </div>
  );
}

/* ─────────────────────────── regras ─────────────────────────── */

const CLASSE_EFEITO = { bloqueio: 'bloqueio-r', emergencia: 'emergencia-r' };
const TAG_EFEITO = {
  bloqueio: 'BLOQUEIA',
  emergencia: 'EMERGÊNCIA',
  rodizio: 'RODÍZIO',
  calculo: 'ATIVO',
  acao: 'ATIVA',
};

function Regras({ unidade: u }) {
  const { sim } = useSim();
  const regras = regrasDaUnidade(sim, u);
  return (
    <>
      <div className="regras">
        {regras.map((r, i) => (
          <div
            className={`regra${r.ativa ? ' ativa' : ''} ${CLASSE_EFEITO[r.efeito] ?? ''}`}
            key={i}
          >
            <i
              className={`led ${r.ativa ? (r.efeito === 'bloqueio' ? 'critico' : r.efeito === 'emergencia' ? 'atencao' : 'on') : ''}`}
            />
            {r.texto}
            <span className="tag-regra">{TAG_EFEITO[r.efeito] ?? 'ATIVA'}</span>
          </div>
        ))}
      </div>
      <p className="nota">
        Estas não são regras escritas para a apresentação: são a lógica que o motor executa a cada
        passo de integração. O LED acende quando a condição é verdadeira <b>agora</b> — dá para ver
        uma regra disparar enquanto se fala.
      </p>
    </>
  );
}

/* ─────────────────────────── auditoria ─────────────────────────── */

function Auditoria() {
  const { sim } = useSim();
  if (!sim.comandos.length) {
    return (
      <div className="vazio">
        <Icone nome="info" tamanho={20} />
        Nenhum comando nesta sessão. Ajuste um setpoint acima, ou abra o faceplate de um conjunto em{' '}
        <b>Unidades</b> e tente parti-lo — inclusive quando não é permitido.
      </div>
    );
  }
  return (
    <div className="rolagem" style={{ maxHeight: 320, overflowY: 'auto' }}>
      <table className="tabela auditoria">
        <thead>
          <tr>
            <th>Horário</th>
            <th>Operador</th>
            <th>Alvo</th>
            <th>Comando</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {sim.comandos.slice(0, 80).map((c, i) => (
            <tr key={i} className={c.aceito ? '' : 'linha-bloqueada'}>
              <td>{hora(c.t)}</td>
              <td>{c.operador}</td>
              <td className="principal">{c.alvo}</td>
              <td>
                {c.acao}
                {c.detalhe ? ` · ${c.detalhe}` : ''}
              </td>
              <td className={c.aceito ? 'aceito' : 'bloqueado'}>
                {c.aceito ? 'aceito' : `BLOQUEADO: ${c.motivo}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── roteiro ─────────────────────────── */

const DEMOS = [
  {
    n: 'D1',
    tit: 'Setpoint ao vivo',
    txt: 'Arraste "chama bombeamento abaixo de" de 30 % para 55 %. Em segundos entram conjuntos, um a um, respeitando o escalonamento. Ninguém precisou ir até a Banqueta.',
  },
  {
    n: 'D2',
    tit: 'Intertravamento',
    txt: 'Abra um conjunto em Unidades, passe para MANUAL e tente parti-lo com a sucção baixa. O comando é recusado, com o motivo na tela e a linha BLOQUEADO na auditoria.',
  },
  {
    n: 'D3',
    tit: 'Rodízio automático',
    txt: 'Em Unidades → Sequência de rodízio: as barras de horas dos cinco conjuntos ficam praticamente iguais, e o contador mostra quando o líder passa a vez.',
  },
  {
    n: 'D4',
    tit: 'Falha e recuperação',
    txt: 'Dispare o cenário de falha da Elevatória Banqueta na Visão Geral. O relé desarma um conjunto da estação, o alarme sobe, a reserva entra sozinha e a pressão do setor não cai. Isso aconteceria às 3 da manhã sem acordar ninguém.',
  },
];

function Roteiro() {
  return (
    <div className="grid" style={{ gap: 'var(--e3)' }}>
      {DEMOS.map((d) => (
        <div className="c3" key={d.n}>
          <div className="metrica" style={{ height: '100%' }}>
            <div className="metrica-rot">
              {d.n} · {d.tit}
            </div>
            <p className="nota" style={{ marginTop: 4 }}>
              {d.txt}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

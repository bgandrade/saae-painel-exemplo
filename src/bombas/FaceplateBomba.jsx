/**
 * Faceplate do conjunto motobomba.
 *
 * Padrão de HMI de processo: o operador clica no equipamento no sinóptico e
 * abre uma janela com TUDO daquele equipamento e os comandos dele. É aqui que
 * a maquete deixa de ser um painel de leitura e vira supervisão: a chave
 * AUTO/MANUAL, o comando de partida que pode ser RECUSADO com motivo, e a
 * curva H×Q dizendo se a bomba trabalha onde deve.
 */

import { useState } from 'react';
import { useSim } from '../hooks/useSimulacao.jsx';
import { useUI } from '../hooks/useUI.jsx';
import { janela } from '../hooks/useSimulacao.jsx';
import { Modal } from '../ui/Overlay.jsx';
import { Chip } from '../ui/componentes.jsx';
import Icone from '../ui/Icone.jsx';
import { num, horimetro, duracao, estadoLimiar, ROTULO_BOMBA } from '../ui/formato.js';
import { GraficoLinha, Gauge, CurvaBomba } from '../charts/index.js';
import { intertravamentos, podeComandar, curvaBomba, desequilibrioPct, saude } from '../engine/control.js';
import { LIMITES } from '../data/topologia.js';

function Metrica({ rot, valor, unidade, estado = '', sub }) {
  return (
    <div className={`metrica ${estado}`}>
      <div className="metrica-rot">{rot}</div>
      <div className="metrica-val">{valor}{unidade && <small>{unidade}</small>}</div>
      {sub && <div className="metrica-sub">{sub}</div>}
    </div>
  );
}

export default function FaceplateBomba({ idBomba }) {
  const { sim } = useSim();
  const { fecharBomba } = useUI();
  const [aviso, setAviso] = useState(null);
  const [, forcar] = useState(0);

  const b = sim.bombas.get(idBomba);
  if (!b) return null;

  const d = b.def;
  const manual = b.modo === 'manual';
  const [corEst, rotEst] = ROTULO_BOMBA[b.estado] ?? ROTULO_BOMBA.parada;
  const trava = intertravamentos(sim, b);
  const bloqueio = trava.find((i) => i.ativo && i.bloqueiaPartida);
  const s = saude(b);
  const deseq = desequilibrioPct(b.tensoes);
  const curva = curvaBomba(b);

  function comandar(acao) {
    const r = sim.comandarBomba(idBomba, acao);
    setAviso(r.permitido ? null : r.motivo);
    forcar((x) => x + 1);
  }

  const podePartir = podeComandar(sim, b, 'partir');
  const podeParar = podeComandar(sim, b, 'parar');

  return (
    <Modal
      largo
      titulo={b.id}
      sub={`${b.unidade.nome} · ${d.potenciaCV} CV · ${d.inversor ? 'inversor de frequência' : 'partida direta'} · ${d.papel}`}
      aoFechar={fecharBomba}
      acoes={<Chip estado={corEst}>{rotEst}</Chip>}
    >
      {/* ── comando ── */}
      <div className="fp-secao">
        <div className="drawer-secao-tit">Comando</div>
        <div className="chave-modo" role="group" aria-label="Modo do conjunto">
          <button type="button" aria-pressed={!manual} onClick={() => comandar('auto')}>
            AUTOMÁTICO
          </button>
          <button type="button" className="man" aria-pressed={manual} onClick={() => comandar('manual')}>
            MANUAL
          </button>
        </div>

        <div className="g2" style={{ marginTop: 4 }}>
          <button
            className="btn sucesso grande" style={{ flex: 1 }}
            disabled={!podePartir.permitido}
            title={podePartir.motivo}
            onClick={() => comandar('partir')}
          >
            <Icone nome="play" /> PARTIR
          </button>
          <button
            className="btn perigo grande" style={{ flex: 1 }}
            disabled={!podeParar.permitido}
            title={podeParar.motivo}
            onClick={() => comandar('parar')}
          >
            <Icone nome="pausa" /> PARAR
          </button>
          {b.estado === 'falha' && (
            <button className="btn primario grande" onClick={() => comandar('rearmar')}>
              REARMAR
            </button>
          )}
          {b.estado === 'manutencao' ? (
            <button className="btn grande" onClick={() => comandar('liberar')}>Liberar</button>
          ) : (
            <button className="btn grande" title="Bloquear para manutenção" onClick={() => comandar('manutencao')}>
              <Icone nome="cadeado" />
            </button>
          )}
        </div>

        {!manual && (
          <p className="nota">
            O conjunto está em <b>AUTOMÁTICO</b>: quem decide partir e parar é a malha de controle
            da unidade. Para comandar direto, passe para MANUAL — e note que, em manual, ele deixa
            de ser governado pela lógica.
          </p>
        )}

        {(bloqueio || aviso) && (
          <div className="bloqueio">
            <Icone nome="cadeado" />
            <span>
              <b>Comando bloqueado. </b>
              {aviso ?? bloqueio.descricao}
            </span>
          </div>
        )}

        {manual && d.inversor && (
          <div className="slider-linha">
            <span className="mut" style={{ minWidth: 110 }}>Referência de rotação</span>
            <input
              type="range" min="55" max="100" step="1"
              value={Math.round(b.referenciaPct * 100)}
              onChange={(e) => { sim.ajustarRotacao(idBomba, Number(e.target.value)); forcar((x) => x + 1); }}
            />
            <span className="slider-val">{num(b.referenciaPct * 100, 0)} %</span>
          </div>
        )}
      </div>

      {/* ── curva e corrente ── */}
      <div className="grid" style={{ gap: 'var(--e3)' }}>
        <div className="c7">
          <div className="drawer-secao-tit">Curva H×Q e ponto de operação</div>
          <CurvaBomba dados={curva} altura={196} />
          <p className="nota">
            {b.ligada
              ? curva.dentroBep
                ? `Operando dentro da faixa de melhor rendimento (${num(curva.bep.min, 0)}–${num(curva.bep.max, 0)} L/s). Rendimento de projeto ${num(curva.bep.rendimento * 100, 0)} %.`
                : `Fora da faixa de melhor rendimento. Bomba nessa condição gasta mais energia por m³ e castiga selo e mancal.`
              : 'Conjunto parado — o ponto de operação aparece quando ele entrar em regime.'}
          </p>
        </div>
        <div className="c5">
          <div className="drawer-secao-tit">Corrente</div>
          <div className="centro">
            <Gauge
              valor={b.correnteA} min={0} max={d.correnteNominalA * 1.35}
              faixaOk={{ min: d.correnteNominalA * 0.5, max: d.correnteNominalA * 1.05 }}
              unidade="A" casas={0} tamanho={132}
              rotulo={`nominal de placa ${d.correnteNominalA} A`}
              cor={b.correnteA > d.correnteNominalA * 1.15 ? 'var(--critico)' : 'var(--serie-1)'}
            />
          </div>
          <div className="drawer-secao-tit" style={{ marginTop: 'var(--e3)' }}>Tensão por fase</div>
          <div className="fases" title={b.tensoes.map((v) => `${num(v, 0)} V`).join(' · ')}>
            {b.tensoes.map((v, i) => (
              <i key={i} className="fase" style={{ height: `${b.ligada ? Math.max(14, (v / Math.max(...b.tensoes, 1)) * 100) : 8}%` }} />
            ))}
          </div>
          <div className="linha" style={{ justifyContent: 'space-between', fontSize: 'var(--t-xs)', marginTop: 4 }}>
            <span className="mut">L1 · L2 · L3</span>
            <b className="num">{b.tensoes.map((v) => num(v, 0)).join(' / ')} V</b>
          </div>
        </div>
      </div>

      {/* ── grandezas ── */}
      <div className="fp-secao">
        <div className="drawer-secao-tit">Grandezas elétricas e mecânicas</div>
        <div className="fp-grade">
          <Metrica rot="Tensão média" valor={num(b.tensaoMedia, 0)} unidade="V" />
          <Metrica
            rot="Desequilíbrio" valor={num(deseq, 2)} unidade="%"
            estado={estadoLimiar(deseq, LIMITES.desequilibrio.alerta, LIMITES.desequilibrio.critico).replace('ok', '')}
            sub={`limite ${LIMITES.desequilibrio.norma}: ${LIMITES.desequilibrio.alerta} %`}
          />
          <Metrica rot="Potência" valor={num(b.potenciaKW, 1)} unidade="kW" />
          <Metrica rot="Fator de pot." valor={b.ligada ? num(b.cosPhi, 2) : '—'} />
          <Metrica rot="Rotação" valor={num(b.rpm, 0)} unidade="rpm" sub={`nominal ${d.rpmNominal}`} />
          <Metrica rot="Vazão" valor={b.ligada ? num(b.vazaoLs, 1) : '—'} unidade="L/s" sub={`nominal ${d.vazaoNominalLs}`} />
          <Metrica
            rot="Vibração" valor={b.ligada ? num(b.vibracaoMms, 1) : '—'} unidade="mm/s"
            estado={b.ligada ? estadoLimiar(b.vibracaoMms, LIMITES.vibracao.alerta, LIMITES.vibracao.critico).replace('ok', '') : ''}
            sub={`${LIMITES.vibracao.norma}: ${LIMITES.vibracao.alerta} / ${LIMITES.vibracao.critico}`}
          />
          <Metrica
            rot="Temp. mancal" valor={num(b.tempMancalC, 0)} unidade="°C"
            estado={estadoLimiar(b.tempMancalC, LIMITES.tempMancal.alerta, LIMITES.tempMancal.critico).replace('ok', '')}
            sub={`alarme em ${LIMITES.tempMancal.alerta} °C`}
          />
        </div>
      </div>

      {/* ── manutenção ── */}
      <div className="fp-secao">
        <div className="drawer-secao-tit">Operação e manutenção</div>
        <div className="fp-grade">
          <Metrica rot="Horímetro" valor={horimetro(b.horimetroH)} sub="desde a instalação" />
          <Metrica rot="Horas no rodízio" valor={num(b.horasRodizio, 1)} unidade="h" sub="totalizador zerável" />
          <Metrica rot="Partidas hoje" valor={String(b.partidasHoje)} />
          <Metrica
            rot="Campanha atual" valor={b.ligada ? duracao(b.segundosLigada) : '—'}
            sub="troca de liderança em 12 h"
          />
          <Metrica rot="Saúde" valor={s.estado === 'ok' ? 'Normal' : s.estado === 'atencao' ? 'Atenção' : s.estado === 'critico' ? 'Crítica' : '—'} sub={`pior: ${s.pior}`} />
        </div>
      </div>

      {/* ── intertravamentos ── */}
      <div className="fp-secao">
        <div className="drawer-secao-tit">Intertravamentos</div>
        <div className="intertrav">
          {trava.map((i) => (
            <div className={`intertrav-linha${i.ativo ? ' ativo' : ''}`} key={i.id}>
              <i className={`led ${i.ativo ? (i.bloqueiaPartida ? 'critico' : 'atencao') : ''}`} />
              {i.descricao}
              <span className="tag">{i.ativo ? (i.bloqueiaPartida ? 'BLOQUEIA' : 'ALERTA') : 'ok'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── tendência ── */}
      <div className="fp-secao">
        <div className="drawer-secao-tit">Corrente nas últimas 6 horas</div>
        <GraficoLinha
          altura={150} unidade="A" casas={0} zero
          limites={[d.correnteNominalA]}
          series={[{ nome: 'Corrente', cor: 'var(--serie-1)', ...janela(sim, `bomba/${b.id}/corrente`, 360) }]}
        />
      </div>
    </Modal>
  );
}

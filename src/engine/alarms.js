/**
 * Motor de alarmes.
 *
 * Duas coisas separam isto de um `if (valor > limite)` espalhado pelas telas:
 *
 * 1. Banda morta e atraso de confirmação. Um valor que passeia em cima do
 *    limite geraria dezenas de alarmes por minuto — o que na sala de controle
 *    real se chama "avalanche" e é o motivo de operador ignorar painel. Aqui
 *    a condição precisa se sustentar por alguns segundos para virar alarme, e
 *    precisa recuar bem abaixo do limite para sair.
 * 2. Estado próprio. O alarme tem início, duração, reconhecimento e histórico,
 *    independente de a tela que o mostra estar aberta ou não.
 */

import { LIMITES, porId } from '../data/topologia.js';

const ATRASO_PADRAO_S = 20; // tempo que a condição precisa se sustentar
const BANDA_MORTA = 0.06; // 6 % de folga para o alarme sair
const PASSO_MAX_AVALIACAO_S = 20; // teto do dt de uma avaliação (ver _condicao)

export const SEVERIDADES = Object.freeze({
  critico: { rotulo: 'Crítico', peso: 3 },
  alerta: { rotulo: 'Alerta', peso: 2 },
  info: { rotulo: 'Informativo', peso: 1 },
});

export class MotorAlarmes {
  constructor(sim) {
    this.sim = sim;
    this.estados = new Map(); // chave → { carga, ativo, desde, reconhecido }
    this.historico = [];
    this.silenciado = false;
  }

  /* ─────────────────── núcleo: confirmação e banda morta ─────────────────── */

  /**
   * Registra a condição de um alarme neste passo.
   * `viola` é o teste de entrada; a saída usa o mesmo teste com folga.
   */
  _condicao(chave, viola, info, dt) {
    let e = this.estados.get(chave);
    if (!e) {
      e = { chave, carga: 0, ativo: false, desde: 0, reconhecido: false, info };
      this.estados.set(chave, e);
    }
    e.info = info;

    const atraso = info.atrasoS ?? ATRASO_PADRAO_S;
    // Trava contra passo grande: mesmo que alguém chame com dt enorme, uma
    // única avaliação nunca fecha sozinha a janela de confirmação. Sem isto,
    // rodar a simulação acelerada desligaria o antiflapping na prática.
    const passo = Math.min(dt, PASSO_MAX_AVALIACAO_S);
    e.carga = viola ? Math.min(e.carga + passo, atraso) : Math.max(e.carga - passo, 0);

    if (!e.ativo && e.carga >= atraso) {
      e.ativo = true;
      e.desde = this.sim.tempo;
      e.reconhecido = false;
      this._registrar(e, 'ativou');
    } else if (e.ativo && e.carga <= 0) {
      e.ativo = false;
      this._registrar(e, 'normalizou');
    }
    return e.ativo;
  }

  _registrar(e, acao) {
    this.historico.unshift({
      t: this.sim.tempo,
      chave: e.chave,
      acao,
      severidade: e.info.severidade,
      titulo: e.info.titulo,
      origem: e.info.origem,
      detalhe: e.info.detalhe,
    });
    if (this.historico.length > 300) this.historico.length = 300;
  }

  /* ────────────────────────────── regras ────────────────────────────── */

  avaliar(dt) {
    const s = this.sim;

    /* Pressão na rede — NBR 12218: mínima 10 mca, máxima 50 mca. */
    for (const [id, setor] of s.setores) {
      const p = setor.pressaoMca;
      const nome = setor.def.nome;
      this._condicao(
        `pressao-critica/${id}`,
        p < LIMITES.pressao.min,
        {
          severidade: 'critico',
          titulo: 'Pressão abaixo do mínimo',
          origem: nome,
          detalhe: () => `${p.toFixed(1)} mca (mín. ${LIMITES.pressao.min} mca)`,
          atrasoS: 15,
        },
        dt,
      );
      this._condicao(
        `pressao-baixa/${id}`,
        p < LIMITES.pressao.min * 1.5 && p >= LIMITES.pressao.min * (1 - BANDA_MORTA),
        {
          severidade: 'alerta',
          titulo: 'Pressão baixa',
          origem: nome,
          detalhe: () => `${p.toFixed(1)} mca`,
          atrasoS: 60,
        },
        dt,
      );
      this._condicao(
        `pressao-alta/${id}`,
        p > LIMITES.pressao.max,
        {
          severidade: 'alerta',
          titulo: 'Pressão acima do máximo',
          origem: nome,
          detalhe: () => `${p.toFixed(1)} mca (máx. ${LIMITES.pressao.max} mca)`,
        },
        dt,
      );

      /* Cloro residual livre no ponto de rede — GM/MS 888/2021. */
      const cl = setor.cloroMgL;
      this._condicao(
        `cloro-baixo/${id}`,
        cl < LIMITES.cloroLivre.min,
        {
          severidade: 'critico',
          titulo: 'Cloro residual abaixo do mínimo',
          origem: nome,
          detalhe: () => `${cl.toFixed(2)} mg/L (mín. ${LIMITES.cloroLivre.min})`,
          atrasoS: 30,
        },
        dt,
      );
      this._condicao(
        `cloro-alto/${id}`,
        cl > LIMITES.cloroLivre.max,
        {
          severidade: 'alerta',
          titulo: 'Cloro residual acima do máximo',
          origem: nome,
          detalhe: () => `${cl.toFixed(2)} mg/L`,
        },
        dt,
      );
    }

    /* Reservatórios. */
    for (const [id, r] of s.reservatorios) {
      const u = r.unidade;
      this._condicao(
        `nivel-critico/${id}`,
        r.nivelPct < 10,
        {
          severidade: 'critico',
          titulo: 'Nível crítico de reservação',
          origem: u.nome,
          detalhe: () => `${r.nivelPct.toFixed(1)} % — autonomia ${r.autonomiaH.toFixed(1)} h`,
          atrasoS: 30,
        },
        dt,
      );
      this._condicao(
        `nivel-baixo/${id}`,
        r.nivelPct < 20 && r.nivelPct >= 10 * (1 - BANDA_MORTA),
        {
          severidade: 'alerta',
          titulo: 'Nível baixo de reservação',
          origem: u.nome,
          detalhe: () => `${r.nivelPct.toFixed(1)} %`,
          atrasoS: 120,
        },
        dt,
      );
    }

    /* Qualidade na saída das unidades de produção. */
    for (const [id, q] of s.qualidade) {
      const u = porId.get(id);
      const checa = (nome, valor, lim, unidade, severidade = 'alerta') => {
        this._condicao(
          `${nome}/${id}`,
          valor < lim.min || valor > lim.max,
          {
            severidade,
            titulo: `${nome[0].toUpperCase()}${nome.slice(1)} fora da faixa`,
            origem: u.nome,
            detalhe: () => `${valor.toFixed(2)} ${unidade} (faixa ${lim.min}–${lim.max})`,
            atrasoS: 45,
          },
          dt,
        );
      };
      checa('cloro', q.cloroMgL, LIMITES.cloroLivre, 'mg/L', 'critico');
      checa('pH', q.ph, LIMITES.ph, '');
      checa('turbidez', q.turbidezUT, LIMITES.turbidez, 'uT');
      checa('fluoreto', q.fluoretoMgL, LIMITES.fluoreto, 'mg/L', 'info');
    }

    /* Conjuntos motobomba. Vibração segue as faixas da ISO 10816-3. */
    for (const [id, b] of s.bombas) {
      const nominal = b.def.correnteNominalA;
      const local = b.unidade?.sigla ?? '';
      const origem = `${id} · ${local}`;

      this._condicao(
        `bomba-falha/${id}`,
        b.estado === 'falha',
        {
          severidade: 'critico',
          titulo: 'Conjunto desarmado',
          origem,
          detalhe: () => 'Proteção atuada — religamento manual',
          atrasoS: 2,
        },
        dt,
      );
      this._condicao(
        `sobrecorrente/${id}`,
        b.ligada && b.correnteA > nominal * 1.15,
        {
          severidade: 'critico',
          titulo: 'Sobrecorrente',
          origem,
          detalhe: () => `${b.correnteA.toFixed(0)} A (nominal ${nominal} A)`,
          atrasoS: 10,
        },
        dt,
      );
      this._condicao(
        `vibracao/${id}`,
        b.ligada && b.vibracaoMms > 4.5,
        {
          severidade: b.vibracaoMms > 7.1 ? 'critico' : 'alerta',
          titulo: 'Vibração acima do admissível',
          origem,
          detalhe: () => `${b.vibracaoMms.toFixed(1)} mm/s (ISO 10816-3: 4,5)`,
          atrasoS: 15,
        },
        dt,
      );
      this._condicao(
        `temp-mancal/${id}`,
        b.ligada && b.tempMancalC > 75,
        {
          severidade: b.tempMancalC > 85 ? 'critico' : 'alerta',
          titulo: 'Temperatura de mancal elevada',
          origem,
          detalhe: () => `${b.tempMancalC.toFixed(0)} °C`,
          atrasoS: 30,
        },
        dt,
      );
      // Desequilíbrio de tensão acima de 2 % degrada o motor (NEMA MG-1).
      if (b.ligada) {
        const media = b.tensaoMedia;
        const desvio = Math.max(...b.tensoes.map((v) => Math.abs(v - media))) / media;
        this._condicao(
          `deseq-tensao/${id}`,
          desvio > 0.02,
          {
            severidade: 'alerta',
            titulo: 'Desequilíbrio de tensão',
            origem,
            detalhe: () => `${(desvio * 100).toFixed(1)} % entre fases`,
            atrasoS: 60,
          },
          dt,
        );
      }
    }

    /* Elevatórias de esgoto. */
    for (const [id, p] of s.pocos) {
      const u = p.unidade;
      this._condicao(
        `extravasamento/${id}`,
        p.extravasando,
        {
          severidade: 'critico',
          titulo: 'Extravasamento no poço de sucção',
          origem: u.nome,
          detalhe: () => `${p.extravasandoLs.toFixed(1)} L/s vertendo`,
          atrasoS: 5,
        },
        dt,
      );
      this._condicao(
        `poco-alto/${id}`,
        p.nivelPct > 88 && !p.extravasando,
        {
          severidade: 'alerta',
          titulo: 'Nível alto no poço de sucção',
          origem: u.nome,
          detalhe: () => `${p.nivelPct.toFixed(0)} %`,
          atrasoS: 20,
        },
        dt,
      );
    }

    /* ETEs — CONAMA 430/2011. */
    for (const [id, e] of s.etes) {
      const u = e.unidade;
      this._condicao(
        `efluente/${id}`,
        !e.conforme,
        {
          severidade: 'critico',
          titulo: 'Efluente fora do padrão de lançamento',
          origem: u.nome,
          detalhe: () =>
            `DBO ${e.dboEfluenteMgL.toFixed(0)} mg/L, remoção ${(e.remocaoDbo * 100).toFixed(0)} %`,
          atrasoS: 60,
        },
        dt,
      );
      this._condicao(
        `carga-ete/${id}`,
        e.cargaPct > 100,
        {
          severidade: 'alerta',
          titulo: 'Sobrecarga hidráulica',
          origem: u.nome,
          detalhe: () => `${e.cargaPct.toFixed(0)} % da vazão nominal`,
          atrasoS: 120,
        },
        dt,
      );
      this._condicao(
        `od-baixo/${id}`,
        e.odMgL < LIMITES.oxigenioDissolvido.min,
        {
          severidade: 'alerta',
          titulo: 'Oxigênio dissolvido baixo no tanque de aeração',
          origem: u.nome,
          detalhe: () => `${e.odMgL.toFixed(2)} mg/L`,
          atrasoS: 90,
        },
        dt,
      );
    }
  }

  /* ───────────────────────────── consulta ───────────────────────────── */

  get ativos() {
    return [...this.estados.values()]
      .filter((e) => e.ativo)
      .sort(
        (a, b) =>
          SEVERIDADES[b.info.severidade].peso - SEVERIDADES[a.info.severidade].peso ||
          b.desde - a.desde,
      );
  }

  get contagem() {
    const c = { critico: 0, alerta: 0, info: 0, total: 0, naoReconhecidos: 0 };
    for (const e of this.estados.values()) {
      if (!e.ativo) continue;
      c[e.info.severidade]++;
      c.total++;
      if (!e.reconhecido) c.naoReconhecidos++;
    }
    return c;
  }

  reconhecer(chave) {
    const e = this.estados.get(chave);
    if (e?.ativo && !e.reconhecido) {
      e.reconhecido = true;
      this._registrar(e, 'reconheceu');
    }
  }

  reconhecerTodos() {
    for (const e of this.estados.values()) if (e.ativo && !e.reconhecido) this.reconhecer(e.chave);
  }
}

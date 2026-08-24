/**
 * Motor de simulação do painel.
 *
 * A regra que orienta este arquivo: nada é roteirizado. Os gráficos de
 * liga/desliga das bombas, as quedas de pressão no pico e o atraso entre o
 * consumo de água e a chegada do esgoto na ETE não são curvas desenhadas à
 * mão — saem do balanço de volume dos reservatórios e das mesmas malhas de
 * controle que um CLP de verdade executaria. É isso que faz a maquete
 * aguentar alguém olhando de perto.
 *
 * O histórico de 24 h exibido no primeiro segundo é gerado pelo MESMO passo
 * de integração, rodado 1440 vezes antes da tela aparecer. Não existe um
 * "gerador de dados falsos" paralelo que pudesse divergir do comportamento
 * ao vivo.
 */

import { UNIDADES, BOMBAS, SETORES, LINHAS, porId } from '../data/topologia.js';
import { Ruido, prng, limitar, interpolar, suavizar } from './rng.js';
import { podeComandar, ACOES } from './control.js';

/* ══════════════════════ PARÂMETROS DO SISTEMA ══════════════════════ */

const CONSUMO_PER_CAPITA_LD = 160; // L/habitante/dia, micromedido
const INDICE_PERDAS = 0.38; // perdas na distribuição
const COEF_RETORNO_ESGOTO = 0.8; // fração do consumo que vira esgoto
const TAXA_INFILTRACAO = 0.12; // infiltração na rede coletora
const ATRASO_ESGOTO_H = 2.5; // defasagem consumo → chegada na ETA
const TAU_CAIXA_CHEGADA_S = 2400; // caixa de chegada ≈ 40 min de vazão média
const DECAIMENTO_CLORO_H = 0.09; // constante de decaimento na rede
const TENSAO_NOMINAL = 380;
const TEMP_AMBIENTE = 28;

const AMOSTRA_S = 60; // resolução do histórico: 1 min simulado
const CAPACIDADE_HIST = 1440; // 24 h
const AQUECIMENTO_H = 3; // horas rodadas antes do trecho exibido
const PASSO_MAX_S = 20; // subpasso máximo de integração
const RODIZIO_LIDERANCA_S = 8 * 3600; // troca a bomba líder a cada 8 h contínuas
const PARTIDA_S = 4; // rampa de partida (soft-starter/inversor)
const BANDA_EMERGENCIA = 10; // banda morta do degrau de emergência, em % de nível

/** Rótulos dos setpoints para a trilha de auditoria. */
const ROTULO_SETPOINT = {
  ligaPct: 'de partida',
  desligaPct: 'de parada',
  emergenciaPct: 'de emergência',
  nivelMinSuccaoPct: 'mínimo de sucção',
  escalonamentoS: 'de escalonamento',
  tempoMinimoOperacaoS: 'de tempo mínimo de operação',
  fatorReposicao: 'de reposição',
  rotacaoMinPct: 'de rotação mínima',
};

/**
 * Encadeamento hidráulico, derivado de topologia.js.
 *
 * Sobe a cadeia a partir da fonte declarada pelo setor até achar quem tem
 * volume: se a fonte é um reservatório, é ela; se é uma elevatória, segue por
 * `alimentadaPor`. Setor sem fonte (Abraão) devolve null e não entra em
 * balanço nenhum — é abastecido por sistema local sem telemetria.
 */
function resolverReservatorio(unidadeId, visitados = new Set()) {
  if (!unidadeId || visitados.has(unidadeId)) return null;
  visitados.add(unidadeId);
  const u = porId.get(unidadeId);
  if (!u) return null;
  if (u.capacidadeM3) return u.id;
  return resolverReservatorio(u.alimentadaPor, visitados);
}

const RESERVATORIO_DO_SETOR = Object.fromEntries(
  SETORES.map((s) => [s.id, resolverReservatorio(s.fonteId)]),
);

/** Trecho entre dois reservatórios: transferência com controle de nível. */
const TRANSFERENCIAS = LINHAS.filter(
  (l) => porId.get(l.de)?.capacidadeM3 && porId.get(l.para)?.capacidadeM3,
).map((l) => ({ de: l.de, para: l.para, maxLs: l.maxLs ?? 150, nivelAlvo: l.nivelAlvo ?? 0.75 }));

/* ══════════════════════ CURVA DE DEMANDA DIÁRIA ══════════════════════ */

const PICOS = [
  { hora: 7.3, largura: 2.0, peso: 0.95 },
  { hora: 12.3, largura: 1.6, peso: 0.45 },
  { hora: 19.0, largura: 2.4, peso: 0.85 },
];

function perfilBruto(h) {
  let v = 0.42;
  for (const p of PICOS) {
    let d = Math.abs(h - p.hora);
    if (d > 12) d = 24 - d; // distância circular: 23h está perto de 1h
    v += p.peso * Math.exp(-((d / p.largura) ** 2));
  }
  return v;
}

const MEDIA_PERFIL = (() => {
  let s = 0;
  for (let i = 0; i < 1440; i++) s += perfilBruto(i / 60);
  return s / 1440;
})();

/** Multiplicador de consumo pela hora do dia; média diária = 1,0 exata. */
export const fatorDemanda = (h) => perfilBruto(((h % 24) + 24) % 24) / MEDIA_PERFIL;

/* ══════════════════════════ CENÁRIOS ══════════════════════════ */

export const CENARIOS = [
  {
    id: 'rompimento',
    nome: 'Rompimento da adutora EEA Japuíba → Centro',
    resumo:
      'Perda de carga e vazamento no trecho que abastece Centro, Balneário e Parque das Palmeiras.',
    severidade: 'critico',
    rampaS: 120,
  },
  {
    id: 'queda-energia',
    nome: 'Falta de energia na Elevatória Japuíba',
    resumo: 'Concessionária cai; o grupo gerador assume em cerca de 90 s.',
    severidade: 'critico',
    rampaS: 25,
  },
  {
    id: 'cloro-baixo',
    nome: 'Cloro fora de faixa em Jacuecanga',
    resumo: 'Falha na dosagem: cloro residual livre despenca abaixo do mínimo.',
    severidade: 'alerta',
    rampaS: 300,
  },
  {
    id: 'sobrecarga',
    nome: 'Falha em conjunto da Elevatória Banqueta',
    resumo:
      'Corrente, vibração e mancal sobem em um conjunto da EEA Banqueta até o desarme pelo relé 51. A reserva assume sozinha.',
    severidade: 'alerta',
    rampaS: 240,
  },
  {
    id: 'chuva',
    nome: 'Chuva intensa',
    resumo: 'Contribuição pluvial indevida sobrecarrega as ETEs e o poço do Anil.',
    severidade: 'alerta',
    rampaS: 420,
  },
  {
    id: 'pico-feriado',
    nome: 'Pico de consumo de feriado',
    resumo: 'Alta temporada: demanda 35 % acima do normal em todos os setores.',
    severidade: 'info',
    rampaS: 600,
  },
];

/* ══════════════════════════ HISTÓRICO ══════════════════════════ */

/** Buffer circular de série temporal. */
class Serie {
  constructor(cap = CAPACIDADE_HIST) {
    this.cap = cap;
    this.v = new Float64Array(cap);
    this.t = new Float64Array(cap);
    this.n = 0;
    this.pos = 0;
  }

  push(t, v) {
    this.t[this.pos] = t;
    this.v[this.pos] = v;
    this.pos = (this.pos + 1) % this.cap;
    if (this.n < this.cap) this.n++;
  }

  /** Últimas `qtd` amostras em ordem cronológica. */
  janela(qtd = this.n) {
    const q = Math.min(qtd, this.n);
    const t = new Float64Array(q);
    const v = new Float64Array(q);
    for (let i = 0; i < q; i++) {
      const idx = (this.pos - q + i + this.cap * 2) % this.cap;
      t[i] = this.t[idx];
      v[i] = this.v[idx];
    }
    return { t, v };
  }

  ultimo() {
    return this.n ? this.v[(this.pos - 1 + this.cap) % this.cap] : 0;
  }

  estat(qtd = this.n) {
    const { v } = this.janela(qtd);
    if (!v.length) return { min: 0, max: 0, media: 0 };
    let min = Infinity;
    let max = -Infinity;
    let soma = 0;
    for (const x of v) {
      if (x < min) min = x;
      if (x > max) max = x;
      soma += x;
    }
    return { min, max, media: soma / v.length };
  }
}

class Historico {
  constructor() {
    this.series = new Map();
  }

  serie(chave) {
    let s = this.series.get(chave);
    if (!s) {
      s = new Serie();
      this.series.set(chave, s);
    }
    return s;
  }

  push(chave, t, v) {
    this.serie(chave).push(t, Number.isFinite(v) ? v : 0);
  }
}

/* ══════════════════════════ SIMULAÇÃO ══════════════════════════ */

export class Simulacao {
  constructor({ chave = 'saae-angra-2026', velocidade = 60 } = {}) {
    this.chaveBase = chave;
    // Toda chave de ruído passa por aqui: é o que faz a semente base valer
    // para a simulação inteira, e não só para os horímetros iniciais.
    this._ruido = (sufixo, opts) => new Ruido({ chave: `${chave}/${sufixo}`, ...opts });
    this.velocidade = velocidade;
    this.hist = new Historico();
    this.eventos = [];
    this._construir();
  }

  /* ───────────── construção do estado ───────────── */

  _construir() {
    const agora = Date.now();
    // O backfill parte daqui e termina no tempo real de agora.
    this.tempo = agora - (24 + AQUECIMENTO_H) * 3600 * 1000;
    this.acumuladoAmostra = 0;

    this.cenarios = new Map(
      CENARIOS.map((c) => [c.id, { def: c, ativo: false, intensidade: 0, tRestante: 0 }]),
    );

    // Trilha de auditoria e estado de comando. O cadastro em topologia.js
    // guarda os setpoints DE PARTIDA; a cópia viva fica aqui, é ela que a
    // interface edita, e é por isso que arrastar um slider muda a operação
    // sem tocar em arquivo nenhum.
    this.comandos = [];
    // Lançamentos manuais ficam separados da telemetria: cada verificação
    // preserva o valor informado e uma fotografia da medição automática no
    // mesmo instante. Na maquete a coleção vive em memória; no sistema real,
    // seria persistida com autenticação e trilha de correção no servidor.
    this.leiturasManuais = [];
    this.operador = 'plantão A';
    this.ultimaPartida = new Map();
    this.recalques = new Map();
    this.malhas = new Map(
      UNIDADES.filter((u) => u.malha).map((u) => [
        u.id,
        // `destinoId` deixa explícito qual volume a malha observa: a própria
        // unidade, ou o reservatório que ela enche. Sem isso, a tela de Rede
        // não teria como desenhar as marcas de setpoint no tanque certo.
        { ...u.malha, modo: 'auto', unidadeId: u.id, destinoId: u.recalcaPara ?? u.id },
      ]),
    );

    // Reservatórios: toda unidade com capacidade declarada.
    this.reservatorios = new Map();
    for (const u of UNIDADES) {
      if (!u.capacidadeM3) continue;
      this.reservatorios.set(u.id, {
        unidade: u,
        capacidadeM3: u.capacidadeM3,
        volumeM3: u.capacidadeM3 * ((u.nivelInicialPct ?? 60) / 100),
        entradaLs: 0,
        saidaLs: 0,
        nivelPct: u.nivelInicialPct ?? 60,
        chamando: false,
      });
    }

    // Poço de sucção das elevatórias de esgoto.
    this.pocos = new Map();
    for (const u of UNIDADES) {
      if (!u.pocoM3) continue;
      this.pocos.set(u.id, {
        unidade: u,
        capacidadeM3: u.pocoM3,
        volumeM3: u.pocoM3 * ((u.nivelInicialPct ?? 40) / 100),
        nivelPct: u.nivelInicialPct ?? 40,
        afluenteLs: 0,
        recalqueLs: 0,
        extravasando: false,
        chamando: false,
      });
    }

    // Conjuntos motobomba.
    this.bombas = new Map();
    this.bombasPorUnidade = new Map();
    const rand = prng(`${this.chaveBase}/horimetros`);
    for (const def of BOMBAS) {
      const b = {
        def,
        id: def.id,
        unidade: porId.get(def.unidadeId),
        estado: 'parada',
        ligada: false,
        // Chave AUTO/MANUAL do conjunto: em MANUAL a malha não o governa.
        modo: 'auto',
        comandoManual: false,
        referenciaPct: 1,
        rampa: 0,
        rotacaoPct: 0,
        rpm: 0,
        vazaoLs: 0,
        correnteA: 0,
        tensoes: [0, 0, 0],
        tensaoMedia: 0,
        potenciaKW: 0,
        cosPhi: 0,
        vibracaoMms: 0,
        tempMancalC: TEMP_AMBIENTE,
        // Horímetro inicial espalhado: bombas irmãs não saem de fábrica juntas,
        // e num parque real elas foram trocadas em épocas diferentes.
        horimetroH: 4200 + rand() * 9000,
        // Totalizador de rodízio: zerável, e é ELE que ordena a fila de
        // entrada. Um CLP de verdade separa os dois justamente porque o
        // horímetro de vida nunca se iguala — a bomba nova entraria sempre.
        horasRodizio: 0,
        partidasHoje: 0,
        segundosLigada: 0,
        ruidos: {
          rpm: this._ruido(`${def.id}/rpm`, { media: 0, desvio: 3.5, reversao: 0.35 }),
          corrente: this._ruido(`${def.id}/i`, { media: 0, desvio: 0.9, reversao: 0.02 }),
          vib: this._ruido(`${def.id}/vib`, { media: 0, desvio: 0.15, reversao: 0.01 }),
          temp: this._ruido(`${def.id}/temp`, { media: 0, desvio: 0.5, reversao: 0.12 }),
          // Desequilíbrio entre fases: pequeno, constante por bomba, como na vida real.
          fases: [0, 1, 2].map((i) =>
            this._ruido(`${def.id}/v${i}`, { media: 0, desvio: 2.6, reversao: 0.2 }),
          ),
        },
      };
      this.bombas.set(def.id, b);
      if (!this.bombasPorUnidade.has(def.unidadeId)) this.bombasPorUnidade.set(def.unidadeId, []);
      const irmas = this.bombasPorUnidade.get(def.unidadeId);
      // Escalonado por posição: dá uma ordem de entrada definida na primeira
      // partida, em vez de depender de empate.
      b.tParada = this.tempo - (10 - irmas.length) * 3600 * 1000;
      irmas.push(b);
    }

    // Setores de abastecimento.
    this.setores = new Map();
    for (const s of SETORES) {
      this.setores.set(s.id, {
        def: s,
        consumoLs: 0,
        producaoLs: 0,
        pressaoMca: s.pressaoAlvoMca,
        cloroMgL: 1.0,
        ruidoPressao: this._ruido(`${s.id}/p`, { media: 0, desvio: 0.5, reversao: 0.004 }),
        ruidoCloro: this._ruido(`${s.id}/cl`, { media: 0, desvio: 0.04, reversao: 0.0015 }),
      });
    }

    // Qualidade na saída de cada unidade de produção.
    this.qualidade = new Map();
    for (const u of UNIDADES) {
      if (u.tipo !== 'captacao') continue;
      this.qualidade.set(u.id, {
        unidade: u,
        cloroMgL: 1.75,
        ph: 7.15,
        turbidezUT: 0.55,
        fluoretoMgL: 0.74,
        ruidos: {
          cloro: this._ruido(`${u.id}/cloro`, { media: 1.75, desvio: 0.07, reversao: 0.0012 }),
          ph: this._ruido(`${u.id}/ph`, { media: 7.15, desvio: 0.1, reversao: 0.001 }),
          turbidez: this._ruido(`${u.id}/turb`, { media: 0.55, desvio: 0.13, reversao: 0.0015 }),
          fluoreto: this._ruido(`${u.id}/fl`, { media: 0.74, desvio: 0.033, reversao: 0.001 }),
        },
      });
    }

    // Estações de tratamento de esgoto.
    this.etes = new Map();
    for (const u of UNIDADES) {
      if (u.tipo !== 'ete') continue;
      this.etes.set(u.id, {
        unidade: u,
        afluenteLs: 0,
        efluenteLs: 0,
        cargaPct: 0,
        dboAfluenteMgL: u.dboAfluenteMgL,
        dboEfluenteMgL: 20,
        dqoAfluenteMgL: u.dboAfluenteMgL * 1.9,
        dqoEfluenteMgL: 60,
        remocaoDbo: u.eficienciaDbo,
        sstEfluenteMgL: 22,
        odMgL: 2.2,
        ph: 7.05,
        turbidezUT: 6,
        conforme: true,
        ruidos: {
          dbo: this._ruido(`${u.id}/dbo`, { media: u.dboAfluenteMgL, desvio: 22, reversao: 0.03 }),
          od: this._ruido(`${u.id}/od`, { media: 0, desvio: 0.18, reversao: 0.08 }),
          sst: this._ruido(`${u.id}/sst`, { media: 0, desvio: 3.2, reversao: 0.06 }),
          ph: this._ruido(`${u.id}/phe`, { media: 7.05, desvio: 0.14, reversao: 0.05 }),
        },
      });
    }

    this.global = {
      vazaoProduzidaLs: 0,
      vazaoDistribuidaLs: 0,
      consumoLs: 0,
      perdasLs: 0,
      pressaoMediaMca: 0,
      reservacaoPct: 0,
      cloroMedioMgL: 0,
      bombasOperando: 0,
      bombasTotal: BOMBAS.length,
      vazaoEsgotoLs: 0,
      potenciaKW: 0,
      energiaKWhHoje: 0,
      volumeDistribuidoM3Hoje: 0,
    };

    // Qual elevatória atende cada setor — usado pelo modelo de pressão.
    this._elevatoriaDoSetor = new Map();
    for (const u of UNIDADES) {
      if (u.tipo !== 'elevatoria') continue;
      for (const id of u.setores ?? []) this._elevatoriaDoSetor.set(id, u.id);
    }

    this._diaCorrente = new Date(this.tempo).getDate();
  }

  /* ───────────── tempo ───────────── */

  get data() {
    return new Date(this.tempo);
  }

  get horaDecimal() {
    const d = this.data;
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  }

  /* ───────────── demanda ───────────── */

  /** Consumo micromedido do setor, em L/s, na hora informada. */
  consumoSetor(setor, hora = this.horaDecimal) {
    const def = setor.def ?? setor;
    const base = (def.populacao * CONSUMO_PER_CAPITA_LD) / 86400;
    const turismo = def.fatorTuristico ? 1 + (def.fatorTuristico - 1) * 0.45 : 1;
    const feriado = 1 + 0.35 * this.intensidade('pico-feriado');
    return base * turismo * feriado * fatorDemanda(hora);
  }

  /** Vazão que precisa ser produzida para atender o setor (consumo + perdas). */
  producaoSetor(setor, hora = this.horaDecimal) {
    return this.consumoSetor(setor, hora) / (1 - INDICE_PERDAS);
  }

  intensidade(id) {
    return this.cenarios.get(id)?.intensidade ?? 0;
  }

  /* ───────────── cenários ───────────── */

  dispararCenario(id) {
    const c = this.cenarios.get(id);
    if (!c || c.ativo) return;
    c.ativo = true;
    if (id === 'sobrecarga') this._escolherAlvoSobrecarga();
    this.registrar('cenario', `Cenário disparado: ${c.def.nome}`, c.def.severidade);
  }

  /**
   * Escolhe qual conjunto sofre a sobrecarga.
   *
   * O alvo é sempre um conjunto da Elevatória Banqueta que esteja realmente
   * girando. Se a estação estiver em repouso, a malha do cenário a coloca em
   * operação e a seleção acontece no passo seguinte.
   */
  _escolherAlvoSobrecarga() {
    const alvo = (this.bombasPorUnidade.get('eea-banqueta') ?? []).find(
      (b) => b.ligada && b.estado === 'operando',
    );
    this.alvoSobrecarga = alvo?.id ?? null;
  }

  normalizarCenario(id) {
    const c = this.cenarios.get(id);
    if (!c || !c.ativo) return;
    c.ativo = false;
    c.tRestante = 0;
    this.registrar('cenario', `Normalização iniciada: ${c.def.nome}`, 'info');
    // Normalizar o cenário remove a CAUSA da sobrecarga, não o desarme. Relé
    // térmico e de sobrecorrente não rearmam sozinhos: alguém precisa rearmar,
    // e é justamente por isso que existe um botão REARMAR no faceplate e uma
    // linha a mais na trilha de auditoria. Religar sozinho seria o
    // comportamento que a norma proíbe e que a plateia técnica notaria.
    if (id === 'sobrecarga') this.alvoSobrecarga = null;
  }

  alternarCenario(id) {
    const c = this.cenarios.get(id);
    if (!c) return;
    if (c.ativo) this.normalizarCenario(id);
    else this.dispararCenario(id);
  }

  get cenariosAtivos() {
    return [...this.cenarios.values()].filter((c) => c.ativo || c.intensidade > 0.01);
  }

  registrar(tipo, mensagem, severidade = 'info') {
    this.eventos.unshift({ t: this.tempo, tipo, mensagem, severidade });
    if (this.eventos.length > 200) this.eventos.length = 200;
  }

  /** Registra uma verificação laboratorial sem alterar a série da telemetria. */
  registrarLeituraManual({ unidadeId, parametro, valor, responsavel, observacao = '' }) {
    const qualidade = this.qualidade.get(unidadeId);
    const valorNumerico = Number(valor);
    const valorAutomatico = qualidade?.[parametro];
    if (!qualidade || !Number.isFinite(valorNumerico) || !Number.isFinite(valorAutomatico)) {
      return null;
    }

    const leitura = {
      id: `manual-${this.tempo}-${this.leiturasManuais.length + 1}`,
      t: this.tempo,
      unidadeId,
      parametro,
      valor: valorNumerico,
      valorAutomatico,
      responsavel: String(responsavel ?? '').trim() || this.operador,
      observacao: String(observacao ?? '').trim(),
    };
    this.leiturasManuais.unshift(leitura);
    if (this.leiturasManuais.length > 100) this.leiturasManuais.length = 100;
    this.registrar(
      'qualidade',
      `${qualidade.unidade.sigla}: verificação manual registrada por ${leitura.responsavel}`,
    );
    return leitura;
  }

  /* ───────────── comandos do operador ─────────────
   * O que separa supervisão de dashboard: um comando pode ser RECUSADO, com
   * motivo, e a recusa fica registrada. É a linha "BLOQUEADO" na auditoria que
   * prova que o sistema protege o equipamento de um comando errado.
   */

  registrarComando({ alvo, acao, detalhe = '', aceito, motivo = '' }) {
    this.comandos.unshift({
      t: this.tempo,
      operador: this.operador,
      alvo,
      acao,
      detalhe,
      aceito,
      motivo,
    });
    if (this.comandos.length > 500) this.comandos.length = 500;
  }

  /** Executa (ou recusa) um comando de operador sobre um conjunto motobomba. */
  comandarBomba(idBomba, acao) {
    const b = this.bombas.get(idBomba);
    if (!b) return { permitido: false, motivo: 'Conjunto inexistente' };

    const v = podeComandar(this, b, acao);
    this.registrarComando({
      alvo: `${b.unidade.sigla} / ${b.id}`,
      acao: ACOES[acao] ?? acao,
      aceito: v.permitido,
      motivo: v.motivo,
    });
    if (!v.permitido) return v;

    switch (acao) {
      case 'auto':
        b.modo = 'auto';
        b.comandoManual = false;
        break;
      case 'manual':
        // Entrar em manual não muda o que a bomba está fazendo agora: ela
        // apenas passa a obedecer ao operador em vez da malha.
        b.modo = 'manual';
        b.comandoManual = b.ligada;
        b.referenciaPct = b.rotacaoPct || 1;
        break;
      case 'partir':
        b.comandoManual = true;
        break;
      case 'parar':
        b.comandoManual = false;
        break;
      case 'rearmar':
        b.estado = 'parada';
        b.comandoManual = false;
        if (this.alvoSobrecarga === idBomba) this.alvoSobrecarga = null;
        break;
      case 'manutencao':
        b.estado = 'manutencao';
        b.comandoManual = false;
        break;
      case 'liberar':
        b.estado = 'parada';
        break;
    }
    return v;
  }

  /** Referência de rotação de um conjunto com inversor, em MANUAL. */
  ajustarRotacao(idBomba, pct) {
    const b = this.bombas.get(idBomba);
    if (!b?.def.inversor) return;
    const antes = Math.round(b.referenciaPct * 100);
    b.referenciaPct = limitar(pct / 100, 0.55, 1);
    const depois = Math.round(b.referenciaPct * 100);
    if (antes === depois) return;
    this.registrarComando({
      alvo: `${b.unidade.sigla} / ${b.id}`,
      acao: 'Referência de rotação',
      detalhe: `${antes} % → ${depois} %`,
      aceito: true,
    });
  }

  /**
   * Ajuste de setpoint de malha.
   *
   * A guarda de histerese não é preciosismo: setpoint de partida acima do de
   * parada trava a malha ligada para sempre, e um operador arrastando dois
   * sliders numa demonstração ao vivo chega lá em três segundos.
   */
  ajustarSetpoint(unidadeId, campo, valor) {
    const m = this.malhas.get(unidadeId);
    if (!m || !(campo in m)) return;
    const antes = m[campo];
    m[campo] = valor;

    if (m.tipo === 'poco') {
      // Poço é ao contrário: liga em cima (enchendo), desliga embaixo.
      if (m.ligaPct - m.desligaPct < 10) {
        if (campo === 'ligaPct') m.desligaPct = m.ligaPct - 10;
        else m.ligaPct = m.desligaPct + 10;
      }
    } else if (m.desligaPct !== undefined && m.desligaPct - m.ligaPct < 10) {
      if (campo === 'ligaPct') m.desligaPct = m.ligaPct + 10;
      else m.ligaPct = m.desligaPct - 10;
    }

    if (m[campo] === antes) return;
    this.registrarComando({
      alvo: `${porId.get(unidadeId)?.sigla ?? unidadeId} / malha`,
      acao: `Setpoint ${ROTULO_SETPOINT[campo] ?? campo}`,
      detalhe: `${antes} → ${m[campo]}`,
      aceito: true,
    });
  }

  /** Modo da malha inteira: 'auto' ou 'fora' (fora de serviço). */
  definirModoMalha(unidadeId, modo) {
    const m = this.malhas.get(unidadeId);
    if (!m || m.modo === modo) return;
    m.modo = modo;
    this.registrarComando({
      alvo: `${porId.get(unidadeId)?.sigla ?? unidadeId} / malha`,
      acao: modo === 'fora' ? 'Malha FORA DE SERVIÇO' : 'Malha em AUTOMÁTICO',
      aceito: true,
    });
  }

  /**
   * Setor que sente uma unidade: os dela, ou os do reservatório que ela enche.
   * É o que permite perguntar "quem fica sem água se esta unidade parar?".
   */
  porIdSetorDaUnidade(unidadeId) {
    const u = porId.get(unidadeId);
    if (!u) return null;
    if (u.setores?.length) return u.setores[0];
    const destino = porId.get(u.recalcaPara ?? '');
    return destino?.setores?.[0] ?? null;
  }

  /** CLPs declarados no cadastro — usado pelo indicador de comunicação. */
  get clps() {
    return [...new Set(UNIDADES.map((u) => u.clp).filter(Boolean))];
  }

  /** Conjuntos que o operador tirou do automático. */
  get bombasEmManual() {
    return [...this.bombas.values()].filter((b) => b.modo === 'manual');
  }

  /* ───────────── loop ───────────── */

  /**
   * Avança a simulação a partir de um intervalo de tempo real, em ms.
   * `aoPasso` roda depois de cada subpasso — é por onde o motor de alarmes
   * enxerga a mesma granularidade que a física, em vez de uma amostra por
   * quadro de tela.
   */
  avancarReal(dtRealMs, aoPasso = null) {
    const dtSim = Math.min((dtRealMs / 1000) * this.velocidade, 3600);
    let restante = dtSim;
    let guarda = 0;
    while (restante > 0.0001 && guarda++ < 240) {
      const passo = Math.min(restante, PASSO_MAX_S);
      this._passo(passo);
      aoPasso?.(passo);
      restante -= passo;
    }
  }

  /** Um subpasso de integração, com dt em segundos simulados. */
  _passo(dt) {
    this.tempo += dt * 1000;

    const dia = this.data.getDate();
    if (dia !== this._diaCorrente) {
      this._diaCorrente = dia;
      this.global.energiaKWhHoje = 0;
      this.global.volumeDistribuidoM3Hoje = 0;
      for (const b of this.bombas.values()) b.partidasHoje = 0;
    }

    this._passoCenarios(dt);
    this._passoDemanda();
    this._passoControle(dt);
    this._passoBombas(dt);
    this._passoReservatorios(dt);
    this._passoPressao(dt);
    this._passoQualidade(dt);
    this._passoEsgoto(dt);
    this._passoGlobais(dt);

    this.acumuladoAmostra += dt;
    if (this.acumuladoAmostra >= AMOSTRA_S) {
      this.acumuladoAmostra %= AMOSTRA_S;
      this._amostrar();
    }
  }

  _passoCenarios(dt) {
    // Enquanto a sobrecarga sobe, o alvo precisa continuar sendo um conjunto em
    // operação. Se o escolhido parou (a malha reduziu conjuntos, ou o rodízio o
    // rendeu), a falha migra para quem está girando — senão o cenário ficaria
    // "ativo" sem produzir sintoma, que é o pior desfecho possível numa
    // demonstração ao vivo.
    const sob = this.cenarios.get('sobrecarga');
    if (sob?.ativo) {
      const alvo = this.alvoSobrecarga ? this.bombas.get(this.alvoSobrecarga) : null;
      if (!alvo || (!alvo.ligada && alvo.estado !== 'falha')) this._escolherAlvoSobrecarga();
    }

    for (const c of this.cenarios.values()) {
      const alvo = c.ativo ? 1 : 0;
      const rampa = c.def.rampaS;
      const delta = dt / rampa;
      // A intensidade caminha linearmente e é suavizada na leitura, então
      // entrada e saída nunca aparecem como degrau nos gráficos.
      c.bruta = limitar((c.bruta ?? 0) + (alvo > (c.bruta ?? 0) ? delta : -delta), 0, 1);
      c.intensidade = suavizar(c.bruta);
      if (c.ativo) c.tRestante += dt;
    }
  }

  _passoDemanda() {
    const hora = this.horaDecimal;
    for (const s of this.setores.values()) {
      s.consumoLs = this.consumoSetor(s, hora);
      s.producaoLs = s.consumoLs / (1 - INDICE_PERDAS);
    }
    // O rompimento acrescenta vazamento à saída do setor Centro.
    const rompimento = this.intensidade('rompimento');
    if (rompimento > 0) {
      const centro = this.setores.get('centro');
      centro.vazamentoLs = 55 * rompimento;
      centro.producaoLs += centro.vazamentoLs;
    } else {
      this.setores.get('centro').vazamentoLs = 0;
    }
  }

  /* ───────────── malhas de controle ───────────── */

  /** Configuração viva da malha de uma unidade. */
  malha(unidadeId) {
    return this.malhas.get(unidadeId);
  }

  _passoControle() {
    for (const u of UNIDADES) {
      const bs = this.bombasPorUnidade.get(u.id);
      if (!bs?.length) continue;
      const m = this.malhas.get(u.id);

      // Malha fora de serviço: os conjuntos em AUTO simplesmente param. É o
      // que acontece quando o CLP entra em bypass para manutenção do painel.
      if (m?.modo === 'fora') this._definirLigadas(u, bs, 0);
      else if (u.tipo === 'captacao') this._controleNivel(u, bs);
      else if (u.tipo === 'eee') this._controlePoco(u, bs);
      else if (u.tipo === 'elevatoria') {
        if (u.recalcaPara) this._controleRecalque(u, bs);
        else this._controleDemanda(u, bs);
      } else if (u.tipo === 'ete') this._controleContinuo(u, bs);

      // Conjuntos em MANUAL ficam fora do alcance da malha: obedecem ao
      // comando do operador e à referência de rotação que ele ajustou.
      for (const b of bs) {
        if (b.modo !== 'manual') continue;
        this._aplicarEstado(
          u,
          b,
          b.comandoManual && b.estado !== 'falha' && b.estado !== 'manutencao',
        );
        b.rotacaoPct = b.ligada ? b.referenciaPct : 0;
      }
    }
  }

  /** Captação: histerese clássica de nível, partida direta. */
  _controleNivel(u, bs) {
    const r = this.reservatorios.get(u.id);
    const m = this.malhas.get(u.id);
    if (!r || !m) return;
    if (r.nivelPct < m.ligaPct) r.chamando = true;
    if (r.nivelPct > m.desligaPct) r.chamando = false;
    // O degrau de emergência precisa de banda morta própria: sem ela, o nível
    // passeando em cima do setpoint faz o conjunto extra entrar e sair a cada
    // passo — o "short-cycling" que queima motor e denuncia maquete.
    if (r.nivelPct < m.emergenciaPct) r.emergencia = true;
    if (r.nivelPct > m.emergenciaPct + BANDA_EMERGENCIA) r.emergencia = false;

    const principais = bs.filter((b) => b.def.papel === 'principal').length;
    let quantas = 0;
    if (r.chamando) quantas = r.emergencia ? bs.length : principais;
    this._definirLigadas(u, bs, quantas);
    for (const b of bs) if (b.modo === 'auto') b.rotacaoPct = b.ligada ? 1 : 0;
  }

  /**
   * Elevatória que enche reservatório — o caso da Banqueta.
   *
   * A histerese observa o nível do reservatório de DESTINO; o intertravamento
   * de afogamento observa a câmara de SUCÇÃO. Quantos conjuntos entram sai da
   * vazão que o destino está entregando, não de um número fixo: é o que faz o
   * painel mostrar dois conjuntos de madrugada e cinco no pico das 7 h, sem
   * que ninguém tenha roteirizado essa sequência.
   */
  _controleRecalque(u, bs) {
    const destino = this.reservatorios.get(u.recalcaPara);
    const succao = u.alimentadaPor ? this.reservatorios.get(u.alimentadaPor) : null;
    const m = this.malhas.get(u.id);
    if (!destino || !m) return;

    // Afogamento: bomba centrífuga sem coluna na sucção cavita e perde o selo
    // em minutos. Isto é intertravamento, não histerese — não tem discussão.
    if (succao && succao.nivelPct < (m.nivelMinSuccaoPct ?? 12)) {
      this._definirLigadas(u, bs, 0);
      return;
    }

    if (destino.nivelPct < m.ligaPct) destino.chamando = true;
    if (destino.nivelPct > m.desligaPct) destino.chamando = false;
    if (destino.nivelPct < m.emergenciaPct) destino.emergencia = true;
    if (destino.nivelPct > m.emergenciaPct + BANDA_EMERGENCIA) destino.emergencia = false;

    const porBomba = bs[0].def.vazaoNominalLs;
    const alvo = destino.saidaLs * (m.fatorReposicao ?? 1.35);
    let quantas = 0;
    if (destino.chamando) {
      quantas = limitar(Math.ceil(alvo / porBomba), 1, bs.length);
      if (destino.emergencia) quantas = bs.length;
    }
    // O cenário de falha pertence à EEA Banqueta. Mantém dois conjuntos em
    // operação durante o ensaio para que o relé tenha um alvo real e a entrada
    // da reserva seja observável mesmo se a estação estava em repouso.
    if (u.id === 'eea-banqueta' && this.cenarios.get('sobrecarga')?.ativo) {
      quantas = Math.max(quantas, 2);
    }
    this._definirLigadas(u, bs, quantas);

    // Com inversor, a rotação fecha o resto: em vez de bater no liga/desliga,
    // o conjunto acompanha a vazão pedida e o nível sobe suave.
    const ligadas = bs.filter((b) => b.ligada && b.modo === 'auto').length || 1;
    const rot = limitar(alvo / (ligadas * porBomba), 0.7, 1);
    for (const b of bs) {
      if (b.modo !== 'auto') continue;
      b.rotacaoPct = b.ligada ? (b.def.inversor ? rot : 1) : 0;
    }
  }

  /** Elevatória com inversor que atende setor: modula rotação pela demanda. */
  _controleDemanda(u, bs) {
    const m = this.malhas.get(u.id);
    const idReserv = RESERVATORIO_DO_SETOR[u.setores?.[0]];
    const fonte = idReserv ? this.reservatorios.get(idReserv) : null;

    // Proteção de nível mínimo: não se afoga bomba com reservatório vazio.
    if (fonte && fonte.nivelPct < (m?.nivelMinSuccaoPct ?? 12)) {
      this._definirLigadas(u, bs, 0);
      return;
    }
    // Queda de energia derruba a elevatória inteira até o gerador assumir.
    if (u.id === 'eea-japuiba') {
      const c = this.cenarios.get('queda-energia');
      if (c.intensidade > 0.4) {
        // Gerador assume após ~90 s, e com capacidade reduzida (1 conjunto).
        const comGerador = c.tRestante > 90;
        this._definirLigadas(u, bs, comGerador ? 1 : 0);
        for (const b of bs) if (b.modo === 'auto') b.rotacaoPct = b.ligada ? 0.85 : 0;
        return;
      }
    }

    const demanda = (u.setores ?? []).reduce(
      (s, id) => s + (this.setores.get(id)?.producaoLs ?? 0),
      0,
    );
    const porBomba = bs[0].def.vazaoNominalLs;
    const disponiveis = bs.filter((b) => b.estado !== 'falha' && b.estado !== 'manutencao').length;
    const quantas = limitar(Math.ceil(demanda / porBomba), demanda > 0.5 ? 1 : 0, disponiveis);
    this._definirLigadas(u, bs, quantas);

    const ligadas = bs.filter((b) => b.ligada && b.modo === 'auto').length || 1;
    // Rotação mínima: abaixo dela a bomba sai da curva de rendimento.
    const rotMin = (m?.rotacaoMinPct ?? 55) / 100;
    const rot = limitar(demanda / (ligadas * porBomba), rotMin, 1);
    const forcada = this.intensidade('rompimento') > 0.3 && u.id === 'eea-japuiba';
    for (const b of bs) {
      if (b.modo !== 'auto') continue;
      b.rotacaoPct = b.ligada ? (forcada ? 1 : rot) : 0;
    }
  }

  /** Elevatória de esgoto: histerese de poço, alternância a cada partida. */
  _controlePoco(u, bs) {
    const p = this.pocos.get(u.id);
    const m = this.malhas.get(u.id);
    if (!p || !m) return;
    if (p.nivelPct > m.ligaPct) p.chamando = true;
    if (p.nivelPct < m.desligaPct) p.chamando = false;
    // Poço é ao contrário: a emergência é o nível ALTO. A banda morta desce,
    // e não sobe.
    if (p.nivelPct > m.emergenciaPct) p.emergencia = true;
    if (p.nivelPct < m.emergenciaPct - BANDA_EMERGENCIA) p.emergencia = false;
    // Com a emergência ativa entram todas: é o último recurso antes do
    // extravasamento no poço.
    const quantas = p.emergencia ? bs.length : p.chamando ? 1 : 0;
    this._definirLigadas(u, bs, quantas);
    for (const b of bs) if (b.modo === 'auto') b.rotacaoPct = b.ligada ? 1 : 0;
  }

  /** Recalque interno de ETE: roda continuamente, modulando pela carga. */
  _controleContinuo(u, bs) {
    const e = this.etes.get(u.id);
    const m = this.malhas.get(u.id);
    this._definirLigadas(u, bs, 1);
    const rotMin = (m?.rotacaoMinPct ?? 65) / 100;
    const rot = limitar((e?.afluenteLs ?? 0) / u.vazaoNominalLs, rotMin, 1);
    for (const b of bs) if (b.modo === 'auto') b.rotacaoPct = b.ligada ? rot : 0;
  }

  /** A unidade já pode dar mais uma partida, ou ainda está no escalonamento? */
  _podePartirAgora(u) {
    const m = this.malhas.get(u.id);
    const esc = (m?.escalonamentoS ?? 15) * 1000;
    return this.tempo - (this.ultimaPartida.get(u.id) ?? -Infinity) >= esc;
  }

  /**
   * Aplica a decisão de ligar/desligar um conjunto, com a contabilidade que vai
   * junto: partidas do dia, instante da parada (que ordena o rodízio) e a
   * última partida da unidade (que sustenta o escalonamento).
   */
  _aplicarEstado(u, b, deve) {
    if (deve && !b.ligada) {
      b.partidasHoje++;
      b.segundosLigada = 0;
      b.rampa = 0;
      this.ultimaPartida.set(u.id, this.tempo);
    }
    if (!deve && b.ligada) b.tParada = this.tempo;
    b.ligada = deve;
    if (b.estado !== 'falha' && b.estado !== 'manutencao') {
      b.estado = deve ? (b.rampa < 0.99 ? 'partindo' : 'operando') : 'parada';
    }
  }

  /**
   * Escolhe quais conjuntos ficam ligados.
   *
   * As que já estão rodando têm preferência para continuar (não se para uma
   * bomba à toa) e a entrada de uma nova é sempre pela que descansou mais.
   * O rodízio principal/reserva emerge daí sozinho: quem roda acumula horas e,
   * na próxima partida, perde a vez para a irmã.
   *
   * Conjuntos em MANUAL são invisíveis aqui: não contam para o alvo e não são
   * parados pela malha. É a razão de "MANUAL" ser o primeiro fato que um
   * operador procura num sinóptico — o que está em manual não está protegido.
   */
  _definirLigadas(u, bs, quantas) {
    const m = this.malhas.get(u.id);
    const auto = bs.filter((b) => b.modo === 'auto');
    const disp = auto.filter((b) => b.estado !== 'falha' && b.estado !== 'manutencao');
    const alvoQtd = limitar(quantas, 0, disp.length);
    const escolhidas = new Set();

    // Uma bomba que já rodou 8 h seguidas cede o posto para uma irmã
    // descansada — é assim que o horímetro do conjunto se equaliza ao longo
    // das semanas, em vez de uma bomba morrer e a outra chegar nova.
    const cansada = (b) => b.segundosLigada > RODIZIO_LIDERANCA_S;
    const rodando = disp.filter((b) => b.ligada);
    // Entra sempre a que ACUMULOU MENOS HORAS no totalizador de rodízio, com
    // o tempo de descanso como critério de desempate. Ordenar por descanso
    // sozinho não equaliza nada: os conjuntos do primeiro degrau da malha
    // ficam ligados quase o dia inteiro e nunca chegam a "descansar mais".
    const paradas = disp
      .filter((b) => !b.ligada)
      .sort((a, b) => a.horasRodizio - b.horasRodizio || a.tParada - b.tParada);

    if (rodando.length <= alvoQtd) {
      rodando.filter((b) => !cansada(b)).forEach((b) => escolhidas.add(b));
      for (const b of paradas) {
        if (escolhidas.size >= alvoQtd) break;
        escolhidas.add(b);
      }
      // Sem substituta disponível, a cansada continua: melhor bomba quente que
      // setor desabastecido.
      for (const b of rodando.filter(cansada)) {
        if (escolhidas.size >= alvoQtd) break;
        escolhidas.add(b);
      }
    } else {
      // Reduzindo conjuntos: sai primeiro quem mais acumulou. Mantém-se, então,
      // a que tem menos horas — que é o outro lado da mesma equalização.
      rodando
        .slice()
        .sort((a, b) => a.horasRodizio - b.horasRodizio)
        .slice(0, alvoQtd)
        .forEach((b) => escolhidas.add(b));
    }

    let ligadas = rodando.length;

    // Partidas primeiro, uma por passo e por unidade: duas partidas no mesmo
    // instante dariam pico de demanda no quadro e golpe de aríete na adutora.
    for (const b of escolhidas) {
      if (b.ligada) continue;
      if (!this._podePartirAgora(u)) break;
      this._aplicarEstado(u, b, true);
      ligadas++;
    }

    // Paradas depois, e só quando há conjunto sobrando de fato. Se a substituta
    // ainda não entrou por causa do escalonamento, quem está rodando continua —
    // senão o escalonamento produziria exatamente o desabastecimento que ele
    // existe para evitar.
    //
    // E nenhum conjunto é parado antes de cumprir o tempo mínimo de operação:
    // é a proteção clássica contra short-cycling. Motor de 150 CV que parte e
    // para a cada minuto perde vida útil por aquecimento de rotor, e a conta
    // de energia sente cada partida.
    const tMin = m?.tempoMinimoOperacaoS ?? 180;
    for (const b of disp) {
      if (!b.ligada || escolhidas.has(b) || ligadas <= alvoQtd) continue;
      if (b.segundosLigada < tMin) continue;
      this._aplicarEstado(u, b, false);
      ligadas--;
    }

    // Normaliza o rótulo de estado: "partindo" vira "operando" quando a rampa
    // termina, e isso precisa acontecer todo passo, não só na transição.
    for (const b of auto) {
      if (b.estado === 'falha' || b.estado === 'manutencao') continue;
      b.estado = b.ligada ? (b.rampa < 0.99 ? 'partindo' : 'operando') : 'parada';
    }
  }

  /* ───────────── grandezas elétricas ───────────── */

  _passoBombas(dt) {
    const sobrecarga = this.intensidade('sobrecarga');
    let potenciaTotal = 0;
    let operando = 0;

    for (const b of this.bombas.values()) {
      const d = b.def;
      const sob = d.id === this.alvoSobrecarga ? sobrecarga : 0;

      if (b.ligada) {
        b.segundosLigada += dt;
        b.horimetroH += dt / 3600;
        b.horasRodizio += dt / 3600;
        // Rampa de partida: leva PARTIDA_S para chegar ao regime. Todo conjunto
        // deste porte parte por soft-starter ou inversor, então a corrente sobe
        // em rampa e não como o degrau de 6× da partida direta plena. É ela que
        // sustenta o estado "partindo" por alguns segundos no painel.
        b.rampa = Math.min(1, (b.rampa ?? 0) + dt / PARTIDA_S);
        operando++;

        // Com inversor, vazão acompanha a rotação; sem inversor é ponto fixo
        // de operação, variando pouco com a altura manométrica.
        const rot = (d.inversor ? b.rotacaoPct : 1) * b.rampa;
        b.rpm = d.rpmNominal * rot + b.ruidos.rpm.passo(dt);
        b.vazaoLs = d.vazaoNominalLs * rot * (1 + b.ruidos.rpm.valor / (d.rpmNominal * 40));

        // Corrente: parcela fixa de magnetização + parcela proporcional à carga.
        const carga = 0.55 + 0.45 * rot ** 2;
        b.correnteA = d.correnteNominalA * carga * (1 + 0.45 * sob) + b.ruidos.corrente.passo(dt);

        b.tensoes = b.ruidos.fases.map((r) => TENSAO_NOMINAL + r.passo(dt) - 12 * sob);
        b.tensaoMedia = (b.tensoes[0] + b.tensoes[1] + b.tensoes[2]) / 3;
        b.cosPhi = limitar(0.87 - 0.06 * (1 - rot) - 0.09 * sob, 0.6, 0.93);
        b.potenciaKW = (Math.sqrt(3) * b.tensaoMedia * b.correnteA * b.cosPhi) / 1000;

        const horasContinuas = b.segundosLigada / 3600;
        b.vibracaoMms = limitar(
          1.55 +
            0.35 * rot +
            0.12 * Math.min(horasContinuas / 6, 1) +
            2.6 * sob +
            b.ruidos.vib.passo(dt),
          0.2,
          22,
        );
        const alvoTemp = TEMP_AMBIENTE + (34 + 30 * sob) * (0.35 + 0.65 * rot);
        b.tempMancalC +=
          (alvoTemp - b.tempMancalC) * (1 - Math.exp(-dt / 1500)) +
          b.ruidos.temp.passo(dt) * dt * 0.002;

        // Desarme por sobrecorrente: a proteção atua antes de queimar o motor.
        if (sob > 0.88 && b.estado === 'operando') {
          b.estado = 'falha';
          b.ligada = false;
          this.registrar('bomba', `${d.id}: desarme por sobrecorrente (relé 51)`, 'critico');
        }
      } else {
        b.rpm = 0;
        b.vazaoLs = 0;
        b.correnteA = 0;
        b.tensoes = b.ruidos.fases.map((r) => TENSAO_NOMINAL + r.passo(dt) * 0.3);
        b.tensaoMedia = (b.tensoes[0] + b.tensoes[1] + b.tensoes[2]) / 3;
        b.potenciaKW = 0;
        b.cosPhi = 0;
        b.vibracaoMms = 0;
        b.rotacaoPct = 0;
        b.rampa = 0;
        b.segundosLigada = 0;
        b.tempMancalC += (TEMP_AMBIENTE + 2 - b.tempMancalC) * (1 - Math.exp(-dt / 2400));
      }
      potenciaTotal += b.potenciaKW;
    }

    this.global.potenciaKW = potenciaTotal;
    this.global.bombasOperando = operando;
    this.global.energiaKWhHoje += (potenciaTotal * dt) / 3600;
  }

  /* ───────────── balanço de volume ───────────── */

  _passoReservatorios(dt) {
    // Entrada bombeada das unidades de captação que possuem conjuntos.
    for (const [id, r] of this.reservatorios) {
      r.entradaLs = 0;
      r.saidaLs = 0;
      if (r.unidade.tipo === 'captacao') {
        for (const b of this.bombasPorUnidade.get(id) ?? []) r.entradaLs += b.vazaoLs;
      }
    }

    // Saída: demanda dos setores atendidos por cada reservatório.
    for (const s of this.setores.values()) {
      if (s.def.somenteEsgoto) continue;
      const idReserv = RESERVATORIO_DO_SETOR[s.def.id];
      if (!idReserv) continue;
      const r = this.reservatorios.get(idReserv);
      if (r) r.saidaLs += s.producaoLs;
    }

    // Elevatória que enche reservatório: o que ela recalca entra no destino e
    // sai da câmara de sucção. É esta ligação que faz Captação → Elevatória →
    // Reservatório se comportarem como uma cadeia só, e não como três caixas
    // independentes que por acaso aparecem no mesmo mapa.
    for (const u of UNIDADES) {
      if (u.tipo !== 'elevatoria' || !u.recalcaPara) continue;
      const recalque = (this.bombasPorUnidade.get(u.id) ?? []).reduce(
        (acc, b) => acc + b.vazaoLs,
        0,
      );
      this.recalques.set(u.id, recalque);
      const destino = this.reservatorios.get(u.recalcaPara);
      const origem = u.alimentadaPor ? this.reservatorios.get(u.alimentadaPor) : null;
      if (destino) destino.entradaLs += recalque;
      if (origem) origem.saidaLs += recalque;
    }

    // A Captação Banqueta não possui conjuntos motobomba cadastrados. Sua
    // entrada acompanha a retirada das elevatórias e corrige suavemente o
    // nível da câmara, limitada pela vazão nominal da captação.
    for (const r of this.reservatorios.values()) {
      if (!r.unidade.entradaSemBombeamento) continue;
      const alvoM3 = r.capacidadeM3 * ((r.unidade.nivelInicialPct ?? 60) / 100);
      const correcaoLs = ((alvoM3 - r.volumeM3) * 1000) / 1800;
      r.entradaLs = limitar(r.saidaLs + correcaoLs, 0, r.unidade.vazaoNominalLs);
    }

    // Transferências entre reservatórios, com controle proporcional de nível.
    for (const tr of TRANSFERENCIAS) {
      const origem = this.reservatorios.get(tr.de);
      const destino = this.reservatorios.get(tr.para);
      if (!origem || !destino) continue;
      const nivelFrac = destino.volumeM3 / destino.capacidadeM3;
      const correcao = 1 + 1.6 * (tr.nivelAlvo - nivelFrac);
      let vazao = origem.nivelPct < 10 ? 0 : limitar(destino.saidaLs * correcao, 0, tr.maxLs);
      if (this.intensidade('rompimento') > 0.05) {
        // O trecho rompido limita o que consegue chegar ao Centro.
        vazao *= 1 - 0.55 * this.intensidade('rompimento');
      }
      destino.entradaLs += vazao;
      origem.saidaLs += vazao;
      tr.vazaoAtual = vazao;
    }

    for (const r of this.reservatorios.values()) {
      r.volumeM3 = limitar(r.volumeM3 + ((r.entradaLs - r.saidaLs) * dt) / 1000, 0, r.capacidadeM3);
      r.nivelPct = (r.volumeM3 / r.capacidadeM3) * 100;
      r.autonomiaH = r.saidaLs > 0.1 ? r.volumeM3 / ((r.saidaLs * 3600) / 1000) : 99;
    }
  }

  /* ───────────── pressão na rede ───────────── */

  _passoPressao(dt) {
    const hora = this.horaDecimal;
    const fator = fatorDemanda(hora);
    for (const s of this.setores.values()) {
      if (s.def.somenteEsgoto) continue;
      const idReserv = RESERVATORIO_DO_SETOR[s.def.id];
      const r = idReserv ? this.reservatorios.get(idReserv) : null;

      let p = s.def.pressaoAlvoMca;
      // Coluna disponível no reservatório de montante.
      if (r) p += ((r.nivelPct - 60) / 100) * 8;
      // Reservatório esvaziando: abaixo de 20 % a coluna some rápido e o setor
      // sente na torneira. Sem este termo o reservatório podia zerar sem que a
      // pressão da rede acusasse nada — e aí a maquete não aguentaria alguém
      // perguntando "e se a elevatória parar?".
      if (r && r.nivelPct < 20) p -= (20 - r.nivelPct) * 0.9;
      // Perda de carga cresce com o quadrado da vazão: por isso o pico dói.
      p -= (fator ** 2 - 1) * 4.0;

      // Setor atendido por elevatória: se o bombeamento não cobre a demanda,
      // a coluna cai junto. Modelar assim, e não com um penalty por cenário,
      // é o que faz a queda de energia e o religamento pelo grupo gerador
      // aparecerem no painel como consequência — inclusive a recuperação
      // parcial, porque o gerador assume com um conjunto só.
      const idElev = this._elevatoriaDoSetor.get(s.def.id);
      if (idElev) {
        const suprimento = (this.bombasPorUnidade.get(idElev) ?? []).reduce(
          (acc, b) => acc + b.vazaoLs,
          0,
        );
        const deficit = limitar(1 - suprimento / Math.max(s.producaoLs, 0.1), 0, 1);
        p -= deficit * 22;
      }

      p += s.ruidoPressao.passo(dt);

      // Rompimento: além do vazamento já somado à demanda, o trecho rompido
      // impõe perda de carga própria.
      if (s.def.id === 'centro') p -= 22 * this.intensidade('rompimento');
      s.pressaoMca = limitar(p, 0, 80);
    }
  }

  /* ───────────── qualidade da água ───────────── */

  _passoQualidade(dt) {
    for (const [id, q] of this.qualidade) {
      // A falha de dosagem puxa a média do processo, não o valor instantâneo:
      // assim a queda tem inércia, como teria um tanque de contato real.
      const alvoCloro =
        id === 'cap-jacuecanga' ? interpolar(1.75, 0.12, this.intensidade('cloro-baixo')) : 1.75;
      q.ruidos.cloro.moverMedia(alvoCloro);
      q.cloroMgL = limitar(q.ruidos.cloro.passo(dt), 0, 4);
      q.ph = limitar(q.ruidos.ph.passo(dt), 4, 11);
      q.turbidezUT = limitar(q.ruidos.turbidez.passo(dt), 0.02, 20);
      q.fluoretoMgL = limitar(q.ruidos.fluoreto.passo(dt), 0, 2);
    }

    for (const s of this.setores.values()) {
      if (s.def.somenteEsgoto) continue;
      const idReserv = RESERVATORIO_DO_SETOR[s.def.id];
      let origem = null;
      if (idReserv) {
        // O reservatório de passagem herda o cloro de quem o alimenta.
        origem = this.qualidade.get(idReserv) ?? this.qualidade.get('cap-banqueta');
      }
      const cloroFonte = origem?.cloroMgL ?? 1.35;
      // Decaimento de primeira ordem pelo tempo de residência na rede.
      const decaido = cloroFonte * Math.exp(-DECAIMENTO_CLORO_H * (s.def.residenciaH ?? 4));
      s.cloroMgL = limitar(decaido + s.ruidoCloro.passo(dt), 0, 4);
    }
  }

  /* ───────────── esgoto ───────────── */

  _passoEsgoto(dt) {
    const hora = this.horaDecimal;
    const chuva = this.intensidade('chuva');

    /** Vazão de esgoto gerada por uma bacia, com o atraso de rede aplicado. */
    const afluenteDaBacia = (bacia = []) => {
      let q = 0;
      for (const { setor, fracao } of bacia) {
        const s = this.setores.get(setor);
        if (!s) continue;
        // O esgoto de agora corresponde à água consumida algumas horas atrás.
        const consumoAtrasado = this.consumoSetor(s, hora - ATRASO_ESGOTO_H);
        const base = consumoAtrasado * COEF_RETORNO_ESGOTO * fracao;
        q += base * (1 + TAXA_INFILTRACAO) + base * 2.6 * chuva;
      }
      return q;
    };

    // Poço da elevatória de esgoto: enche pela bacia, esvazia pelas bombas.
    for (const [id, p] of this.pocos) {
      p.afluenteLs = afluenteDaBacia(p.unidade.bacia);
      p.recalqueLs = (this.bombasPorUnidade.get(id) ?? []).reduce((s, b) => s + b.vazaoLs, 0);
      p.volumeM3 = p.volumeM3 + ((p.afluenteLs - p.recalqueLs) * dt) / 1000;
      if (p.volumeM3 > p.capacidadeM3) {
        p.extravasandoLs = ((p.volumeM3 - p.capacidadeM3) * 1000) / dt;
        p.volumeM3 = p.capacidadeM3;
        if (!p.extravasando) {
          p.extravasando = true;
          this.registrar(
            'esgoto',
            `${p.unidade.sigla}: extravasamento no poço de sucção`,
            'critico',
          );
        }
      } else {
        p.extravasandoLs = 0;
        p.extravasando = false;
      }
      p.volumeM3 = limitar(p.volumeM3, 0, p.capacidadeM3);
      p.nivelPct = (p.volumeM3 / p.capacidadeM3) * 100;
    }

    for (const [id, e] of this.etes) {
      const u = e.unidade;
      let afluente = afluenteDaBacia(u.bacia);
      // Somar o que chega recalcado de uma elevatória de esgoto.
      for (const p of this.pocos.values()) {
        if (p.unidade.recalcaPara === id) afluente += p.recalqueLs;
      }
      // A caixa de chegada amortece os pulsos do recalque: a ETE "vê" a média
      // da última meia hora, não o liga/desliga da elevatória.
      e.afluenteBrutoLs = afluente;
      e.afluenteLs += (afluente - e.afluenteLs) * (1 - Math.exp(-dt / TAU_CAIXA_CHEGADA_S));
      afluente = e.afluenteLs;
      e.efluenteLs = afluente * 0.985; // o resto sai como lodo
      e.cargaPct = (afluente / u.vazaoNominalLs) * 100;

      e.dboAfluenteMgL = limitar(e.ruidos.dbo.passo(dt), 80, 700);
      e.dqoAfluenteMgL = e.dboAfluenteMgL * 1.9;

      // Sobrecarga hidráulica reduz o tempo de detenção e derruba a eficiência.
      const excesso = Math.max(0, afluente / u.vazaoNominalLs - 1);
      e.remocaoDbo = limitar(u.eficienciaDbo * (1 - 0.42 * excesso), 0.25, 0.98);
      e.dboEfluenteMgL = e.dboAfluenteMgL * (1 - e.remocaoDbo);
      e.dqoEfluenteMgL = e.dboEfluenteMgL * 2.3;
      e.sstEfluenteMgL = limitar(18 + 55 * excesso + e.ruidos.sst.passo(dt), 3, 220);
      e.odMgL = limitar(2.3 - 1.5 * excesso + e.ruidos.od.passo(dt), 0.1, 6);
      e.ph = limitar(e.ruidos.ph.passo(dt), 4, 11);
      e.turbidezUT = limitar(e.sstEfluenteMgL * 0.32, 0.5, 90);
      // CONAMA 430/2011: atende por concentração OU por eficiência de remoção.
      e.conforme = e.dboEfluenteMgL <= 120 || e.remocaoDbo >= 0.6;
    }
  }

  /* ───────────── agregados ───────────── */

  _passoGlobais(dt) {
    let produzida = 0;
    let consumo = 0;
    let distribuida = 0;
    let volumeReserv = 0;
    let capacidadeReserv = 0;
    let somaPressao = 0;
    let somaCloro = 0;
    let pesoPressao = 0;

    for (const r of this.reservatorios.values()) {
      produzida += r.unidade.tipo === 'captacao' ? r.entradaLs : 0;
      volumeReserv += r.volumeM3;
      capacidadeReserv += r.capacidadeM3;
    }
    for (const s of this.setores.values()) {
      // Setor sem telemetria de produção (Abraão, sistema local) fica fora do
      // balanço de vazão: contá-lo como "distribuído" criaria água que
      // nenhuma captação produziu, e o balanço deixaria de fechar. A pressão
      // e o cloro dele continuam entrando nas médias — esses são medidos na
      // rede, e é só a produção que não temos.
      if (!s.def.semTelemetria) {
        consumo += s.consumoLs;
        distribuida += s.producaoLs;
      }
      if (s.def.somenteEsgoto) continue;
      // Média ponderada por população: um setor grande pesa mais no indicador.
      somaPressao += s.pressaoMca * s.def.populacao;
      somaCloro += s.cloroMgL * s.def.populacao;
      pesoPressao += s.def.populacao;
    }

    const g = this.global;
    g.vazaoProduzidaLs = produzida;
    g.consumoLs = consumo;
    g.vazaoDistribuidaLs = distribuida;
    g.perdasLs = distribuida - consumo;
    g.indicePerdas = distribuida > 0 ? (distribuida - consumo) / distribuida : 0;
    g.reservacaoPct = capacidadeReserv ? (volumeReserv / capacidadeReserv) * 100 : 0;
    g.volumeReservadoM3 = volumeReserv;
    g.pressaoMediaMca = pesoPressao ? somaPressao / pesoPressao : 0;
    g.cloroMedioMgL = pesoPressao ? somaCloro / pesoPressao : 0;
    g.vazaoEsgotoLs = [...this.etes.values()].reduce((s, e) => s + e.afluenteLs, 0);
    g.volumeDistribuidoM3Hoje += (distribuida * dt) / 1000;
  }

  /* ───────────── histórico ───────────── */

  _amostrar() {
    const t = this.tempo;
    const h = this.hist;
    const g = this.global;

    h.push('glob/vazaoProduzida', t, g.vazaoProduzidaLs);
    h.push('glob/vazaoDistribuida', t, g.vazaoDistribuidaLs);
    h.push('glob/consumo', t, g.consumoLs);
    h.push('glob/pressaoMedia', t, g.pressaoMediaMca);
    h.push('glob/reservacao', t, g.reservacaoPct);
    h.push('glob/cloroMedio', t, g.cloroMedioMgL);
    h.push('glob/bombasOperando', t, g.bombasOperando);
    h.push('glob/vazaoEsgoto', t, g.vazaoEsgotoLs);
    h.push('glob/potencia', t, g.potenciaKW);

    for (const [id, s] of this.setores) {
      h.push(`setor/${id}/pressao`, t, s.pressaoMca);
      h.push(`setor/${id}/consumo`, t, s.consumoLs);
      h.push(`setor/${id}/cloro`, t, s.cloroMgL);
    }
    for (const [id, r] of this.reservatorios) {
      h.push(`reserv/${id}/nivel`, t, r.nivelPct);
      h.push(`reserv/${id}/entrada`, t, r.entradaLs);
      h.push(`reserv/${id}/saida`, t, r.saidaLs);
    }
    for (const [id, p] of this.pocos) {
      h.push(`poco/${id}/nivel`, t, p.nivelPct);
      h.push(`poco/${id}/afluente`, t, p.afluenteLs);
    }
    for (const [id, b] of this.bombas) {
      h.push(`bomba/${id}/ligada`, t, b.ligada ? 1 : 0);
      h.push(`bomba/${id}/corrente`, t, b.correnteA);
      h.push(`bomba/${id}/rpm`, t, b.rpm);
      h.push(`bomba/${id}/potencia`, t, b.potenciaKW);
      h.push(`bomba/${id}/vibracao`, t, b.vibracaoMms);
      h.push(`bomba/${id}/temp`, t, b.tempMancalC);
      h.push(`bomba/${id}/vazao`, t, b.vazaoLs);
    }
    for (const [id, q] of this.qualidade) {
      h.push(`qual/${id}/cloro`, t, q.cloroMgL);
      h.push(`qual/${id}/ph`, t, q.ph);
      h.push(`qual/${id}/turbidez`, t, q.turbidezUT);
      h.push(`qual/${id}/fluoreto`, t, q.fluoretoMgL);
    }
    for (const [id, e] of this.etes) {
      h.push(`ete/${id}/afluente`, t, e.afluenteLs);
      h.push(`ete/${id}/dboEfluente`, t, e.dboEfluenteMgL);
      h.push(`ete/${id}/remocao`, t, e.remocaoDbo * 100);
      h.push(`ete/${id}/od`, t, e.odMgL);
      h.push(`ete/${id}/carga`, t, e.cargaPct);
    }
  }

  /**
   * Reconstrói as últimas 24 h rodando o próprio motor, com passo de 1 min.
   * Ao terminar, o relógio da simulação está no tempo real de agora.
   *
   * Roda algumas horas a mais do que grava: o buffer circular só guarda 24 h,
   * então o transitório de partida (reservatório saindo do nível inicial,
   * mancal aquecendo, caixa de chegada enchendo) é descartado sozinho em vez
   * de virar uma rampa espúria no começo dos gráficos.
   */
  backfill(horas = 24) {
    const passos = Math.round(((horas + AQUECIMENTO_H) * 3600) / AMOSTRA_S);
    for (let i = 0; i < passos; i++) this._passo(AMOSTRA_S);
    // O backfill é o "passado": eventos dele não interessam ao operador.
    this.eventos.length = 0;
    this.tempo = Date.now();
    this._diaCorrente = this.data.getDate();
  }
}

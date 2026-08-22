/**
 * Camada de comando e intertravamento.
 *
 * O que separa um painel de supervisão de um dashboard bonito é esta camada:
 * um comando de operador pode ser RECUSADO, com motivo, e a recusa fica
 * registrada. Um CLP de verdade não parte uma bomba com a sucção vazia por
 * mais que o operador insista, e o painel precisa mostrar exatamente isso.
 *
 * Nada aqui muda estado — são funções puras sobre a simulação. Quem aplica o
 * comando é `Simulacao.comandarBomba`, que consulta `podeComandar` primeiro e
 * registra o resultado na trilha de auditoria de qualquer jeito, aceito ou não.
 */

import { LIMITES, porId } from '../data/topologia.js';

export const ACOES = Object.freeze({
  partir: 'Partir',
  parar: 'Parar',
  auto: 'Passar para AUTO',
  manual: 'Passar para MANUAL',
  rearmar: 'Rearmar após falha',
  manutencao: 'Marcar em manutenção',
  liberar: 'Liberar da manutenção',
});

/**
 * Intertravamentos de um conjunto, avaliados agora.
 *
 * `bloqueiaPartida` distingue o que impede um comando (sucção vazia) do que
 * apenas sinaliza condição degradada (vibração alta) — juntar os dois numa
 * lista só faria o operador perder a confiança na lista inteira.
 */
export function intertravamentos(sim, b) {
  const u = b.unidade;
  const m = sim.malhas.get(u.id) ?? {};
  const lista = [];

  const add = (id, descricao, ativo, bloqueiaPartida = true) =>
    lista.push({ id, descricao, ativo: !!ativo, bloqueiaPartida });

  /* Afogamento: bomba centrífuga sem coluna na sucção cavita e perde o selo
     mecânico em minutos. É o intertravamento mais clássico que existe. */
  if (u.alimentadaPor) {
    const s = sim.reservatorios.get(u.alimentadaPor);
    const lim = m.nivelMinSuccaoPct ?? 12;
    add(
      'succao-baixa',
      `Nível de sucção abaixo de ${lim} % (${porId.get(u.alimentadaPor)?.sigla ?? '—'})`,
      s && s.nivelPct < lim
    );
  }

  /* Escalonamento: duas partidas juntas dão pico de demanda no quadro e golpe
     de aríete na adutora. O CLP espera entre uma e outra. */
  const esc = m.escalonamentoS ?? 15;
  const desdeUltima = (sim.tempo - (sim.ultimaPartida.get(u.id) ?? -Infinity)) / 1000;
  add('escalonamento', `Intervalo entre partidas menor que ${esc} s`, desdeUltima < esc);

  add('falha', 'Conjunto desarmado — exige rearme', b.estado === 'falha');
  add('manutencao', 'Conjunto bloqueado para manutenção', b.estado === 'manutencao');

  add(
    'vibracao',
    `Vibração acima de ${LIMITES.vibracao.critico} mm/s (${LIMITES.vibracao.norma})`,
    b.ligada && b.vibracaoMms > LIMITES.vibracao.critico,
    false
  );
  add(
    'mancal',
    `Temperatura de mancal acima de ${LIMITES.tempMancal.critico} °C`,
    b.tempMancalC > LIMITES.tempMancal.critico,
    false
  );

  return lista;
}

/** Ativos que impedem partida, na ordem em que devem ser mostrados. */
export const bloqueios = (sim, b) =>
  intertravamentos(sim, b).filter((i) => i.ativo && i.bloqueiaPartida);

/**
 * Um comando é aceito? Devolve sempre um motivo quando não é — a interface usa
 * o mesmo texto para desabilitar o botão e para escrever a linha da auditoria,
 * então não há como as duas divergirem.
 */
export function podeComandar(sim, b, acao) {
  const ok = { permitido: true, motivo: '' };
  const nao = (motivo) => ({ permitido: false, motivo });

  switch (acao) {
    case 'auto':
      return b.modo === 'auto' ? nao('Conjunto já está em AUTO') : ok;

    case 'manual':
      return b.modo === 'manual' ? nao('Conjunto já está em MANUAL') : ok;

    case 'partir': {
      if (b.modo !== 'manual') return nao('Comando direto exige o conjunto em MANUAL');
      if (b.ligada) return nao('Conjunto já está em operação');
      const b0 = bloqueios(sim, b)[0];
      return b0 ? nao(b0.descricao) : ok;
    }

    case 'parar':
      if (b.modo !== 'manual') return nao('Comando direto exige o conjunto em MANUAL');
      if (!b.ligada) return nao('Conjunto já está parado');
      return ok;

    case 'rearmar':
      return b.estado === 'falha' ? ok : nao('Conjunto não está desarmado');

    case 'manutencao':
      if (b.estado === 'manutencao') return nao('Conjunto já está em manutenção');
      if (b.ligada) return nao('Pare o conjunto antes de bloqueá-lo para manutenção');
      return ok;

    case 'liberar':
      return b.estado === 'manutencao' ? ok : nao('Conjunto não está em manutenção');

    default:
      return nao('Comando desconhecido');
  }
}

/**
 * As regras da malha em português, com o estado ao vivo de cada condição.
 *
 * É esta lista que explica automação para quem não é engenheiro: LED aceso
 * significa "esta condição é verdadeira agora", e dá para ver a regra disparar
 * enquanto se fala. Os textos são gerados a partir dos setpoints correntes, de
 * modo que arrastar um slider reescreve a regra na tela.
 */
export function regrasDaUnidade(sim, u) {
  const m = sim.malhas.get(u.id);
  if (!m) return [];
  const bs = sim.bombasPorUnidade.get(u.id) ?? [];
  const regra = (texto, ativa, efeito = 'acao') => ({ texto, ativa: !!ativa, efeito });

  const res = sim.reservatorios.get(u.recalcaPara ?? u.id);
  const poco = sim.pocos.get(u.id);
  const succao = u.alimentadaPor ? sim.reservatorios.get(u.alimentadaPor) : null;
  const linhas = [];

  if (m.tipo === 'nivel' || m.tipo === 'recalque') {
    const alvo = porId.get(u.recalcaPara ?? u.id)?.sigla ?? '';
    linhas.push(
      regra(`SE nível(${alvo}) ≤ ${m.ligaPct} % → chamar bombeamento`, res && res.nivelPct <= m.ligaPct),
      regra(`SE nível(${alvo}) ≥ ${m.desligaPct} % → cessar bombeamento`, res && res.nivelPct >= m.desligaPct),
      regra(`SE nível(${alvo}) < ${m.emergenciaPct} % → acionar TODOS os conjuntos`, res && res.nivelPct < m.emergenciaPct, 'emergencia')
    );
  }

  if (m.tipo === 'recalque') {
    linhas.push(
      regra(
        `Nº de conjuntos = ⌈saída × ${m.fatorReposicao} ÷ ${bs[0]?.def.vazaoNominalLs ?? 0} L/s⌉`,
        res && res.chamando,
        'calculo'
      )
    );
  }

  if (m.tipo === 'poco') {
    linhas.push(
      regra(`SE nível(poço) ≥ ${m.ligaPct} % → recalcar`, poco && poco.nivelPct >= m.ligaPct),
      regra(`SE nível(poço) ≤ ${m.desligaPct} % → cessar recalque`, poco && poco.nivelPct <= m.desligaPct),
      regra(`SE nível(poço) > ${m.emergenciaPct} % → acionar TODOS (evitar extravasamento)`, poco && poco.nivelPct > m.emergenciaPct, 'emergencia')
    );
  }

  if (m.tipo === 'demanda') {
    const dem = (u.setores ?? []).reduce((s, id) => s + (sim.setores.get(id)?.producaoLs ?? 0), 0);
    const porBomba = bs[0]?.def.vazaoNominalLs ?? 1;
    linhas.push(
      regra(`Nº de conjuntos = ⌈demanda ÷ ${porBomba} L/s⌉ — agora ${Math.ceil(dem / porBomba)}`, dem > 0.5, 'calculo'),
      regra(`Rotação modulada por inversor, mínimo ${m.rotacaoMinPct} %`, bs.some((b) => b.ligada), 'calculo')
    );
  }

  if (m.tipo === 'continua') {
    linhas.push(regra(`Recalque contínuo, rotação ≥ ${m.rotacaoMinPct} % conforme a carga afluente`, bs.some((b) => b.ligada), 'calculo'));
  }

  /* Intertravamentos e rodízio valem para toda malha. */
  if (succao) {
    linhas.push(
      regra(
        `SE nível(sucção) < ${m.nivelMinSuccaoPct} % → BLOQUEAR partida (afogamento)`,
        succao.nivelPct < (m.nivelMinSuccaoPct ?? 12),
        'bloqueio'
      )
    );
  }
  const desdeUltima = (sim.tempo - (sim.ultimaPartida.get(u.id) ?? -Infinity)) / 1000;
  const emCampanhaCurta = bs.filter((b) => b.ligada && b.segundosLigada < (m.tempoMinimoOperacaoS ?? 180));
  linhas.push(
    regra(`SE Δt da última partida < ${m.escalonamentoS} s → BLOQUEAR partida (escalonamento)`, desdeUltima < m.escalonamentoS, 'bloqueio'),
    regra(
      `SE tempo ligado < ${m.tempoMinimoOperacaoS ?? 180} s → BLOQUEAR parada (anti short-cycling)`,
      emCampanhaCurta.length > 0,
      'bloqueio'
    ),
    regra(
      `SE vibração > ${LIMITES.vibracao.critico} mm/s → alarme e inibição de entrada em rodízio`,
      bs.some((b) => b.ligada && b.vibracaoMms > LIMITES.vibracao.critico),
      'bloqueio'
    ),
    regra(
      'SE horas contínuas > 12 h → passar liderança à irmã descansada',
      bs.some((b) => b.ligada && b.segundosLigada > 12 * 3600),
      'rodizio'
    )
  );

  return linhas;
}

/**
 * Papel de cada conjunto na sequência de rodízio, agora.
 *
 * O papel NÃO vem do cadastro: vem de quem está rodando e, entre os parados,
 * de quem descansou mais. É por isso que a etiqueta muda sozinha ao longo do
 * dia — e é exatamente essa mudança que prova que o rodízio é automático.
 */
export function sequencia(sim, unidadeId) {
  const bs = sim.bombasPorUnidade.get(unidadeId) ?? [];
  const rodando = bs.filter((b) => b.ligada).sort((a, b) => b.segundosLigada - a.segundosLigada);
  const paradas = bs
    .filter((b) => !b.ligada && b.estado !== 'falha' && b.estado !== 'manutencao')
    .sort((a, b) => a.tParada - b.tParada);
  const fora = bs.filter((b) => !b.ligada && (b.estado === 'falha' || b.estado === 'manutencao'));

  const papeis = new Map();
  rodando.forEach((b, i) => papeis.set(b.id, i === 0 ? 'LÍDER' : `SEG-${i}`));
  paradas.forEach((b, i) => papeis.set(b.id, `RESERVA-${i + 1}`));
  fora.forEach((b) => papeis.set(b.id, b.estado === 'falha' ? 'FALHA' : 'MANUT.'));
  for (const b of bs) if (b.modo === 'manual') papeis.set(b.id, 'MANUAL');
  return papeis;
}

/** Tempo até a próxima troca de líder, em segundos. `null` se não há líder. */
export function proximaTrocaS(sim, unidadeId) {
  const bs = sim.bombasPorUnidade.get(unidadeId) ?? [];
  const lider = bs.filter((b) => b.ligada).sort((a, b) => b.segundosLigada - a.segundosLigada)[0];
  if (!lider) return null;
  const temSubstituta = bs.some((b) => !b.ligada && b.estado !== 'falha' && b.estado !== 'manutencao');
  if (!temSubstituta) return null;
  return Math.max(0, 12 * 3600 - lider.segundosLigada);
}

/**
 * Curva da bomba e ponto de operação, para o gráfico H×Q do faceplate.
 *
 * Centrífuga de rotor fechado: H(Q) = H0 − k·Q², com H0 = 1,25·Hnom no
 * shut-off. A curva do sistema é H_est + r·Q², com a altura estática tomada
 * como 55 % da nominal. O ponto de operação é a interseção — e é ele que diz
 * se a bomba está trabalhando onde deve ou fora da faixa de rendimento.
 */
export function curvaBomba(b) {
  const d = b.def;
  const Hn = d.alturaNominalM ?? 40;
  const Qn = d.vazaoNominalLs;
  const H0 = Hn * 1.25;
  const k = (H0 - Hn) / (Qn * Qn);

  const Hest = Hn * 0.55;
  const r = (Hn - Hest) / (Qn * Qn);

  const rot = b.ligada ? Math.max(b.rotacaoPct * (b.rampa ?? 1), 0.01) : 0;
  // Semelhança: Q ∝ n, H ∝ n². A curva desce inteira quando o inversor reduz.
  // Leis de semelhança: (Q,H) → (Q·s, H·s²) leva H0−kQ² para H0·s²−kQ².
  // O coeficiente k é invariante com a rotação; só o shut-off desce.
  const H0r = H0 * rot * rot;

  const pontos = (n = 26) =>
    Array.from({ length: n }, (_, i) => {
      const Q = (Qn * 1.3 * i) / (n - 1);
      return { Q, H: Math.max(0, H0 - k * Q * Q) };
    });

  const pontosRotacao = (n = 26) =>
    Array.from({ length: n }, (_, i) => {
      const Q = (Qn * 1.3 * i) / (n - 1);
      return { Q, H: Math.max(0, H0r - k * Q * Q) };
    });

  const sistema = (n = 26) =>
    Array.from({ length: n }, (_, i) => {
      const Q = (Qn * 1.3 * i) / (n - 1);
      return { Q, H: Hest + r * Q * Q };
    });

  const Qop = b.ligada ? b.vazaoLs : 0;
  const Hop = b.ligada ? Math.max(0, H0r - k * Qop * Qop) : 0;

  return {
    Qn, Hn, H0, Qmax: Qn * 1.3, Hmax: H0 * 1.08,
    curva: pontos(), curvaRotacao: rot > 0 && rot < 0.995 ? pontosRotacao() : null,
    sistema: sistema(),
    operacao: { Q: Qop, H: Hop },
    // Faixa de melhor rendimento: 70 %–120 % da vazão nominal, convenção usual
    // de fabricante para bomba centrífuga.
    bep: { min: Qn * 0.7, max: Qn * 1.2, rendimento: d.rendimentoBep ?? 0.75 },
    dentroBep: b.ligada && Qop >= Qn * 0.7 && Qop <= Qn * 1.2,
  };
}

/** Desequilíbrio percentual entre as três fases (critério NEMA MG-1). */
export function desequilibrioPct(tensoes) {
  const media = (tensoes[0] + tensoes[1] + tensoes[2]) / 3;
  if (!media) return 0;
  const desvio = Math.max(...tensoes.map((v) => Math.abs(v - media)));
  return (desvio / media) * 100;
}

/**
 * Saúde do conjunto: o pior entre carga elétrica, vibração e mancal.
 * Uma barra só, porque numa tela de estação com cinco bombas ninguém compara
 * três barras por bomba — mas todo mundo compara cinco barras iguais.
 */
export function saude(b) {
  if (!b.ligada) return { pct: 0, estado: b.estado === 'falha' ? 'critico' : 'parada', pior: '—' };
  const carga = b.correnteA / b.def.correnteNominalA;
  const vib = b.vibracaoMms / LIMITES.vibracao.critico;
  const temp = (b.tempMancalC - 30) / (LIMITES.tempMancal.critico - 30);

  const itens = [
    { nome: 'Corrente', v: carga, alerta: 1.05, critico: 1.15 },
    { nome: 'Vibração', v: b.vibracaoMms, alerta: LIMITES.vibracao.alerta, critico: LIMITES.vibracao.critico },
    { nome: 'Mancal', v: b.tempMancalC, alerta: LIMITES.tempMancal.alerta, critico: LIMITES.tempMancal.critico },
  ];
  let estado = 'ok';
  let pior = 'Normal';
  for (const it of itens) {
    if (it.v > it.critico) { estado = 'critico'; pior = it.nome; break; }
    if (it.v > it.alerta && estado === 'ok') { estado = 'atencao'; pior = it.nome; }
  }
  const pct = Math.min(100, Math.max(carga, vib, temp) * 100);
  return { pct, estado, pior };
}

/**
 * Variável de processo da malha — o número que a malha realmente observa.
 *
 * Cada estratégia observa uma grandeza diferente, e mostrar "nível" numa
 * malha que na verdade segue demanda seria mentir para o operador sobre o que
 * o CLP está fazendo.
 */
export function variavelProcesso(sim, u) {
  const m = sim.malhas.get(u.id);
  if (!m) return null;

  if (m.tipo === 'nivel') {
    const r = sim.reservatorios.get(u.id);
    return { valor: r?.nivelPct ?? 0, unidade: '%', rotulo: `Nível ${u.sigla}`, min: 0, max: 100, temSetpoints: true };
  }
  if (m.tipo === 'recalque') {
    const r = sim.reservatorios.get(u.recalcaPara);
    return {
      valor: r?.nivelPct ?? 0, unidade: '%',
      rotulo: `Nível ${porId.get(u.recalcaPara)?.sigla ?? ''} (destino)`,
      min: 0, max: 100, temSetpoints: true,
    };
  }
  if (m.tipo === 'poco') {
    const p = sim.pocos.get(u.id);
    return { valor: p?.nivelPct ?? 0, unidade: '%', rotulo: 'Nível do poço de sucção', min: 0, max: 100, temSetpoints: true };
  }
  if (m.tipo === 'demanda') {
    const dem = (u.setores ?? []).reduce((s, id) => s + (sim.setores.get(id)?.producaoLs ?? 0), 0);
    return {
      valor: (dem / u.vazaoNominalLs) * 100, unidade: '% da capacidade',
      rotulo: `Demanda de ${(u.setores ?? []).join(', ')} — ${dem.toFixed(1)} L/s`,
      min: 0, max: 100, temSetpoints: false,
    };
  }
  const e = sim.etes.get(u.id);
  return {
    valor: e?.cargaPct ?? 0, unidade: '% da capacidade',
    rotulo: `Carga hidráulica — ${(e?.afluenteLs ?? 0).toFixed(1)} L/s`,
    min: 0, max: 130, temSetpoints: false,
  };
}

/** Setpoints editáveis de uma malha, com faixa e rótulo para o slider. */
export function setpointsEditaveis(m) {
  if (!m) return [];
  const out = [];
  if (m.tipo === 'poco') {
    out.push(
      { campo: 'ligaPct', rotulo: 'Liga o recalque em', min: 40, max: 95, passo: 1, unidade: '%' },
      { campo: 'desligaPct', rotulo: 'Desliga em', min: 5, max: 60, passo: 1, unidade: '%' },
      { campo: 'emergenciaPct', rotulo: 'Emergência (todos) acima de', min: 80, max: 99, passo: 1, unidade: '%' }
    );
  } else if (m.tipo === 'nivel' || m.tipo === 'recalque') {
    out.push(
      { campo: 'ligaPct', rotulo: 'Chama bombeamento abaixo de', min: 10, max: 70, passo: 1, unidade: '%' },
      { campo: 'desligaPct', rotulo: 'Cessa bombeamento acima de', min: 50, max: 98, passo: 1, unidade: '%' },
      { campo: 'emergenciaPct', rotulo: 'Emergência (todos) abaixo de', min: 5, max: 40, passo: 1, unidade: '%' }
    );
  }
  if (m.rotacaoMinPct != null) {
    out.push({ campo: 'rotacaoMinPct', rotulo: 'Rotação mínima do inversor', min: 40, max: 90, passo: 1, unidade: '%' });
  }
  if (m.nivelMinSuccaoPct != null) {
    out.push({ campo: 'nivelMinSuccaoPct', rotulo: 'Bloqueia partida com sucção abaixo de', min: 5, max: 40, passo: 1, unidade: '%' });
  }
  out.push(
    { campo: 'escalonamentoS', rotulo: 'Intervalo mínimo entre partidas', min: 5, max: 120, passo: 5, unidade: 's' },
    { campo: 'tempoMinimoOperacaoS', rotulo: 'Tempo mínimo de operação antes de parar', min: 30, max: 900, passo: 30, unidade: 's' }
  );
  return out;
}

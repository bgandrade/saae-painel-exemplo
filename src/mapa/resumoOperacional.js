/**
 * Resumos operacionais exibidos nos tooltips do mapa.
 *
 * O mapa deve ajudar a decidir onde clicar, não duplicar o drawer. Por isso
 * cada resumo tem um estado, no máximo três leituras e, quando existir, apenas
 * o alarme mais importante daquele ativo ou trecho.
 */

import { LIMITES, porId } from '../data/topologia.js';
import { num } from '../ui/formato.js';

const PESO_SEVERIDADE = { critico: 3, alerta: 2, info: 1 };

function escapar(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function detalheAlarme(alarme) {
  const detalhe = alarme?.info?.detalhe;
  return typeof detalhe === 'function' ? detalhe() : detalhe;
}

function maisGrave(alarmes) {
  return [...alarmes].sort(
    (a, b) =>
      (PESO_SEVERIDADE[b.info.severidade] ?? 0) - (PESO_SEVERIDADE[a.info.severidade] ?? 0) ||
      b.desde - a.desde,
  )[0];
}

function alarmeDaUnidade(u, alarmes) {
  return maisGrave(
    alarmes.filter((a) => {
      const origem = a.info.origem ?? '';
      return origem.includes(u.nome) || origem.includes(u.sigla);
    }),
  );
}

function alarmeDoTrecho(linha, alarmes, setor) {
  const origem = porId.get(linha.de);
  const destino = porId.get(linha.para);
  return maisGrave(
    alarmes.filter((a) => {
      const texto = a.info.origem ?? '';
      return (
        (setor && (a.chave.endsWith(`/${setor.def.id}`) || texto.includes(setor.def.nome))) ||
        (origem && (texto.includes(origem.nome) || texto.includes(origem.sigla))) ||
        (destino && (texto.includes(destino.nome) || texto.includes(destino.sigla)))
      );
    }),
  );
}

function situacaoBombas(bombas, alarme) {
  if (alarme?.info.severidade === 'critico' || bombas.some((b) => b.estado === 'falha')) {
    return ['critico', 'Falha operacional'];
  }
  if (alarme || bombas.some((b) => b.modo === 'manual')) {
    return ['atencao', bombas.some((b) => b.modo === 'manual') ? 'Modo manual' : 'Atenção'];
  }
  return ['neutro', bombas.some((b) => b.ligada) ? 'Em operação' : 'Em espera'];
}

function vazaoBombas(bombas) {
  return bombas.reduce((total, b) => total + b.vazaoLs, 0);
}

function metrica(rotulo, valor) {
  return { rotulo, valor };
}

export function resumoUnidade(u, sim, alarmesAtivos = []) {
  const bombas = sim.bombasPorUnidade.get(u.id) ?? [];
  const alarme = alarmeDaUnidade(u, alarmesAtivos);
  const res = sim.reservatorios.get(u.id);
  const poco = sim.pocos.get(u.id);
  const ete = sim.etes.get(u.id);
  const qual = sim.qualidade.get(u.id);
  let [estado, status] = situacaoBombas(bombas, alarme);
  let metricas = [];

  if (u.tipo === 'elevatoria') {
    const recalque = sim.recalques.get(u.id) ?? vazaoBombas(bombas);
    const disponiveis = bombas.filter((b) => b.estado !== 'falha').length;
    const destino = u.recalcaPara ? sim.reservatorios.get(u.recalcaPara) : null;
    const setor = !destino && u.setores?.length ? sim.setores.get(u.setores[0]) : null;
    metricas = [
      metrica('Vazão', `${num(recalque, 1)} L/s`),
      metrica(
        'Operando / disponíveis',
        `${bombas.filter((b) => b.ligada).length} / ${disponiveis}`,
      ),
      destino
        ? metrica('Reservatório de destino', `${num(destino.nivelPct, 0)} %`)
        : metrica('Pressão do setor', setor ? `${num(setor.pressaoMca, 1)} mca` : '—'),
    ];
  } else if (u.tipo === 'eee') {
    const disponiveis = bombas.filter((b) => b.estado !== 'falha').length;
    if (poco?.extravasando) [estado, status] = ['critico', 'Extravasando'];
    else if (poco?.nivelPct > 88 && estado !== 'critico')
      [estado, status] = ['atencao', 'Nível alto'];
    metricas = [
      metrica('Nível do poço', `${num(poco?.nivelPct, 0)} %`),
      metrica('Recalque', `${num(poco?.recalqueLs, 1)} L/s`),
      metrica(
        'Operando / disponíveis',
        `${bombas.filter((b) => b.ligada).length} / ${disponiveis}`,
      ),
    ];
  } else if (u.tipo === 'ete') {
    if (ete && !ete.conforme) [estado, status] = ['critico', 'Efluente fora do padrão'];
    else if (ete?.cargaPct > 100 && estado !== 'critico')
      [estado, status] = ['atencao', 'Sobrecarga hidráulica'];
    else if (!alarme) [estado, status] = ['neutro', 'Tratamento normal'];
    metricas = [
      metrica('Vazão afluente', `${num(ete?.afluenteLs, 1)} L/s`),
      metrica('Carga hidráulica', `${num(ete?.cargaPct, 0)} %`),
      ete && !ete.conforme
        ? metrica('DBO efluente', `${num(ete.dboEfluenteMgL, 0)} mg/L`)
        : metrica('Efluente', 'Conforme'),
    ];
  } else if (u.tipo === 'captacao') {
    const qualidadeFora =
      qual && (qual.cloroMgL < LIMITES.cloroLivre.min || qual.cloroMgL > LIMITES.cloroLivre.max);
    if (qualidadeFora && estado !== 'critico')
      [estado, status] = ['atencao', 'Qualidade fora da faixa'];
    else if (!alarme) [estado, status] = ['neutro', 'Produção normal'];
    metricas = [
      metrica('Nível', res ? `${num(res.nivelPct, 0)} %` : '—'),
      metrica(
        'Produção',
        res ? `${num(res.entradaLs, 1)} L/s` : `${num(vazaoBombas(bombas), 1)} L/s`,
      ),
      metrica('Cloro livre', qual ? `${num(qual.cloroMgL, 2)} mg/L` : '—'),
    ];
  } else if (u.tipo === 'reservatorio') {
    if (res?.nivelPct < 10) [estado, status] = ['critico', 'Nível crítico'];
    else if (res?.nivelPct < 20 && estado !== 'critico')
      [estado, status] = ['atencao', 'Nível baixo'];
    else if (!alarme) [estado, status] = ['neutro', 'Reservação normal'];
    metricas = [
      metrica('Nível', `${num(res?.nivelPct, 0)} %`),
      metrica('Entrada / saída', `${num(res?.entradaLs, 1)} / ${num(res?.saidaLs, 1)} L/s`),
      metrica('Autonomia', res?.autonomiaH > 90 ? '—' : `${num(res?.autonomiaH, 1)} h`),
    ];
  }

  if (alarme) {
    estado = alarme.info.severidade === 'critico' ? 'critico' : 'atencao';
    status = alarme.info.titulo;
  }

  return {
    titulo: u.nome,
    contexto: `${u.sigla} · ${u.bairro}`,
    estado,
    status,
    // O detalhe do alarme ocupa o lugar da terceira leitura para manter o
    // cartão curto justamente quando há mais texto para o operador ler.
    metricas: metricas.slice(0, alarme ? 2 : 3),
    alarme: alarme ? detalheAlarme(alarme) : null,
    rodape: 'Clique para abrir os detalhes',
  };
}

function vazaoTrecho(linha, sim, setor) {
  if (setor) return setor.producaoLs ?? setor.consumoLs ?? 0;
  const destino = porId.get(linha.para);
  const origem = porId.get(linha.de);
  if (destino?.tipo === 'elevatoria')
    return vazaoBombas(sim.bombasPorUnidade.get(destino.id) ?? []);
  if (destino?.tipo === 'eee') return sim.pocos.get(destino.id)?.afluenteLs ?? 0;
  if (origem?.tipo === 'eee') return sim.pocos.get(origem.id)?.recalqueLs ?? 0;
  if (sim.recalques.has(linha.de)) return sim.recalques.get(linha.de);
  if (sim.reservatorios.has(linha.de)) return sim.reservatorios.get(linha.de).saidaLs;
  if (destino?.tipo === 'ete') return sim.etes.get(destino.id)?.afluenteLs ?? 0;
  return vazaoBombas(sim.bombasPorUnidade.get(linha.de) ?? []);
}

export function resumoTrecho(linha, sim, alarmesAtivos = []) {
  const setor = sim.setores.get(linha.para) ?? sim.setores.get(linha.de);
  const alarme = alarmeDoTrecho(linha, alarmesAtivos, setor);
  const vazao = vazaoTrecho(linha, sim, setor);
  const rompido = linha.id === 'ad-jpb-centro' && sim.intensidade('rompimento') > 0.25;
  const origem = porId.get(linha.de)?.sigla ?? setor?.def.nomeCurto ?? linha.de;
  const destino =
    porId.get(linha.para)?.sigla ?? sim.setores.get(linha.para)?.def.nomeCurto ?? linha.para;
  let estado = 'neutro';
  let status = vazao > 0.05 ? 'Com fluxo' : 'Sem fluxo';

  if (rompido) [estado, status] = ['critico', 'Rompimento detectado'];
  else if (alarme) {
    estado = alarme.info.severidade === 'critico' ? 'critico' : 'atencao';
    status = alarme.info.titulo;
  }

  const metricas =
    setor && linha.sistema === 'agua'
      ? [
          metrica('Vazão estimada', `${num(vazao, 1)} L/s`),
          metrica('Pressão', `${num(setor.pressaoMca, 1)} mca`),
          metrica('Cloro livre', `${num(setor.cloroMgL, 2)} mg/L`),
        ]
      : [
          metrica('Vazão estimada', `${num(vazao, 1)} L/s`),
          metrica('Origem', origem),
          metrica('Destino', destino),
        ];

  return {
    titulo: linha.nome,
    contexto: `DN ${linha.diametroMm} mm · ${linha.sistema === 'esgoto' ? 'esgoto' : 'água'}`,
    estado,
    status,
    metricas: alarme ? metricas.slice(0, 2) : metricas,
    alarme: alarme ? detalheAlarme(alarme) : null,
    rodape: linha.confirmada ? null : 'Traçado e vazão estimados',
  };
}

export function htmlResumoOperacional(resumo) {
  const metricas = resumo.metricas
    .map(
      ({ rotulo, valor }) =>
        `<div class="mo-metrica"><span>${escapar(rotulo)}</span><b>${escapar(valor)}</b></div>`,
    )
    .join('');
  const alarme = resumo.alarme ? `<div class="mo-alarme">${escapar(resumo.alarme)}</div>` : '';
  const rodape = resumo.rodape ? `<div class="mo-rodape">${escapar(resumo.rodape)}</div>` : '';

  return `<div class="mapa-overlay-operacional" data-estado="${escapar(resumo.estado)}">
    <div class="mo-cabecalho">
      <div><strong>${escapar(resumo.titulo)}</strong><small>${escapar(resumo.contexto)}</small></div>
      <span class="mo-status">${escapar(resumo.status)}</span>
    </div>
    <div class="mo-metricas">${metricas}</div>
    ${alarme}${rodape}
  </div>`;
}

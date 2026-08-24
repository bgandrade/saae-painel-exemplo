#!/usr/bin/env node
/* A Etapa 0 e as quatro demonstrações do roteiro, verificadas no motor.
   Se alguma falhar aqui, falha no auditório. */
import { Simulacao } from '../src/engine/sim.js';
import { MotorAlarmes } from '../src/engine/alarms.js';
import { sequencia } from '../src/engine/control.js';

const n = (v, c = 1) => (Number.isFinite(v) ? v.toFixed(c) : '—');
const avancar = (sim, al, segundos, passo = 5) => {
  for (let i = 0; i < segundos / passo; i++)
    sim.avancarReal((passo / sim.velocidade) * 1000, (dt) => al.avaliar(dt));
};
let falhas = 0;
const checar = (ok, msg) => {
  console.log(`   ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) falhas++;
};

/* ───────────── Etapa 0: registro manual ───────────── */
console.log('\nEtapa 0 — Registrar leitura manual ao lado da telemetria');
{
  const sim = new Simulacao({ velocidade: 1 });
  sim.backfill(24);
  const qualidade = sim.qualidade.get('cap-banqueta');
  const automatico = qualidade.cloroMgL;
  const leitura = sim.registrarLeituraManual({
    unidadeId: 'cap-banqueta',
    parametro: 'cloroMgL',
    valor: 1.62,
    responsavel: 'Laboratório',
    observacao: 'Verificação de rotina',
  });
  checar(leitura?.valor === 1.62, 'o valor manual foi preservado como novo registro');
  checar(
    leitura?.valorAutomatico === automatico && qualidade.cloroMgL === automatico,
    'a medição automática foi fotografada, sem ser sobrescrita',
  );
  checar(
    leitura?.responsavel === 'Laboratório' && leitura?.t === sim.tempo,
    'autoria e horário foram registrados',
  );
}

/* ───────────── D1: setpoint ao vivo ───────────── */
console.log('\nD1 — Arrastar o setpoint de partida de 30 % para 55 %');
{
  const sim = new Simulacao({ velocidade: 1 });
  sim.backfill(24);
  const al = new MotorAlarmes(sim);
  const res = sim.reservatorios.get('res-banqueta');
  // Estabiliza o reservatório numa faixa em que a malha está em repouso.
  res.volumeM3 = res.capacidadeM3 * 0.45;
  res.nivelPct = 45;
  res.chamando = false;
  avancar(sim, al, 60);
  const antes = sim.bombasPorUnidade.get('eea-banqueta').filter((b) => b.ligada).length;

  sim.ajustarSetpoint('eea-banqueta', 'ligaPct', 55);
  avancar(sim, al, 180);
  const depois = sim.bombasPorUnidade.get('eea-banqueta').filter((b) => b.ligada).length;

  console.log(`   nível ${n(res.nivelPct)} % · conjuntos ${antes} → ${depois}`);
  checar(depois > antes, `o ajuste de setpoint acionou conjuntos (${antes} → ${depois})`);
  checar(
    sim.comandos.some((c) => c.acao.includes('Setpoint') && c.detalhe === '30 → 55'),
    'o ajuste foi registrado na auditoria com valor antigo e novo',
  );

  // Escalonamento: nenhum par de partidas da mesma unidade a menos de 15 s.
  const partidas = [];
  const sim2 = new Simulacao({ velocidade: 1 });
  sim2.backfill(24);
  const al2 = new MotorAlarmes(sim2);
  const r2 = sim2.reservatorios.get('res-banqueta');
  r2.volumeM3 = r2.capacidadeM3 * 0.1;
  r2.nivelPct = 10;
  r2.chamando = true;
  const antesLig = new Map([...sim2.bombas].map(([k, b]) => [k, b.ligada]));
  for (let i = 0; i < 120; i++) {
    sim2.avancarReal(1000, (dt) => al2.avaliar(dt));
    for (const b of sim2.bombasPorUnidade.get('eea-banqueta')) {
      if (b.ligada && !antesLig.get(b.id)) partidas.push(sim2.tempo);
      antesLig.set(b.id, b.ligada);
    }
  }
  const intervalos = partidas.slice(1).map((t, i) => (t - partidas[i]) / 1000);
  const menor = intervalos.length ? Math.min(...intervalos) : Infinity;
  console.log(
    `   ${partidas.length} partidas, menor intervalo ${menor === Infinity ? '—' : n(menor) + ' s'}`,
  );
  checar(menor >= 14.9, 'partidas escalonadas em pelo menos 15 s');
}

/* ───────────── D2: intertravamento ───────────── */
console.log('\nD2 — Tentar partir em MANUAL com a sucção vazia');
{
  const sim = new Simulacao({ velocidade: 1 });
  sim.backfill(24);
  const b =
    [...sim.bombasPorUnidade.get('eea-banqueta')].find((x) => !x.ligada) ??
    sim.bombasPorUnidade.get('eea-banqueta')[0];
  sim.comandarBomba(b.id, 'manual');
  sim.comandarBomba(b.id, 'parar');
  const cam = sim.reservatorios.get('cap-banqueta');
  cam.volumeM3 = cam.capacidadeM3 * 0.06;
  cam.nivelPct = 6;

  const r = sim.comandarBomba(b.id, 'partir');
  console.log(
    `   sucção a ${n(cam.nivelPct)} % → ${r.permitido ? 'ACEITO' : 'RECUSADO'}: ${r.motivo}`,
  );
  checar(!r.permitido, 'o comando foi recusado');
  checar(/sucção/i.test(r.motivo), 'o motivo cita o nível de sucção');
  checar(
    sim.comandos.some((c) => !c.aceito && /sucção/i.test(c.motivo)),
    'a recusa entrou na trilha de auditoria',
  );

  // E com a sucção cheia o mesmo comando passa.
  cam.volumeM3 = cam.capacidadeM3 * 0.7;
  cam.nivelPct = 70;
  sim.ultimaPartida.set('eea-banqueta', -Infinity);
  const r2 = sim.comandarBomba(b.id, 'partir');
  checar(r2.permitido, 'com a sucção reposta, o mesmo comando é aceito');
}

/* ───────────── D3: rodízio ───────────── */
console.log('\nD3 — Equalização do rodízio');
{
  const sim = new Simulacao({ velocidade: 1 });
  sim.backfill(24);
  for (let d = 0; d < 6; d++) for (let i = 0; i < 1440; i++) sim._passo(60);
  const hs = sim.bombasPorUnidade.get('eea-banqueta').map((b) => b.horasRodizio);
  const disp = Math.max(...hs) - Math.min(...hs);
  const media = hs.reduce((s, h) => s + h, 0) / hs.length;
  console.log(
    `   horas: ${hs.map((h) => n(h)).join(' / ')} · dispersão ${n(disp)} h (${n((disp / media) * 100)} %)`,
  );
  checar(disp / media < 0.1, 'dispersão abaixo de 10 % da média após 7 dias');
  const papeis = sequencia(sim, 'eea-banqueta');
  checar([...papeis.values()].includes('LÍDER'), 'há um líder identificado na sequência');
}

/* ───────────── D4: falha e recuperação ───────────── */
console.log('\nD4 — Sobrecarga, desarme e entrada da reserva');
{
  const aguardarAlvoNaElevatoria = (sim, al) => {
    for (let i = 0; i < 12 && !sim.alvoSobrecarga; i++) {
      sim._passo(5);
      al.avaliar(5);
    }
    return sim.alvoSobrecarga;
  };

  /**
   * Roda o cenário a partir de vários instantes do dia.
   *
   * O alvo deve pertencer sempre à Elevatória Banqueta. Se a estação estiver
   * em repouso, o cenário primeiro coloca dois conjuntos em operação e só
   * então escolhe o que sofrerá a falha.
   */
  const trial = (avancoH) => {
    const sim = new Simulacao({ velocidade: 60 });
    sim.backfill(24);
    for (let i = 0; i < avancoH * 60; i++) sim._passo(60);
    const al = new MotorAlarmes(sim);

    sim.dispararCenario('sobrecarga');
    const alvo = aguardarAlvoNaElevatoria(sim, al);
    if (!alvo)
      return { hora: null, ok: false, motivo: 'nenhum conjunto em operação para sobrecarregar' };

    const uid = sim.bombas.get(alvo).def.unidadeId;
    const irmas = sim.bombasPorUnidade.get(uid);
    const setor = sim.porIdSetorDaUnidade(uid) ?? 'centro';
    const paradasNoInicio = new Set(irmas.filter((b) => !b.ligada).map((b) => b.id));

    let desarmou = false,
      critico = false,
      reserva = false,
      piorP = Infinity;
    for (let i = 0; i < 900; i++) {
      sim.avancarReal((10 / 60) * 1000, (dt) => al.avaliar(dt));
      const fal = irmas.find((b) => b.estado === 'falha');
      if (fal) desarmou = true;
      if (al.contagem.critico > 0 || al.historico.some((h) => h.severidade === 'critico'))
        critico = true;
      if (desarmou)
        for (const b of irmas) if (b.ligada && paradasNoInicio.has(b.id)) reserva = true;
      piorP = Math.min(piorP, sim.setores.get(setor).pressaoMca);
    }
    const d = new Date(sim.tempo);
    return {
      hora: `${String(d.getHours()).padStart(2, '0')}h`,
      alvo,
      uid,
      desarmou,
      critico,
      reserva,
      piorP,
      ok: uid === 'eea-banqueta' && desarmou && critico && piorP >= 10,
    };
  };

  for (const h of [0, 4, 8, 12, 16, 20]) {
    const r = trial(h);
    const marca = r.ok ? '✓' : '✗';
    if (!r.ok) falhas++;
    console.log(
      `   ${marca} às ${r.hora ?? '—'}: alvo ${r.alvo ?? '—'} (${r.uid ?? '—'}) ` +
        `desarme ${r.desarmou ? 'sim' : 'NÃO'} · crítico ${r.critico ? 'sim' : 'NÃO'} · ` +
        `reserva ${r.reserva ? 'assumiu' : 'não precisou'} · pior pressão ${n(r.piorP)} mca`,
    );
  }

  // Rearme depois da normalização — como na vida real.
  const sim = new Simulacao({ velocidade: 60 });
  sim.backfill(24);
  const al = new MotorAlarmes(sim);
  sim.dispararCenario('sobrecarga');
  aguardarAlvoNaElevatoria(sim, al);
  for (let i = 0; i < 900; i++) sim.avancarReal((10 / 60) * 1000, (dt) => al.avaliar(dt));
  sim.normalizarCenario('sobrecarga');
  for (let i = 0; i < 200; i++) sim._passo(20);
  const desarmada = [...sim.bombas.values()].find((b) => b.estado === 'falha');
  checar(!!desarmada, 'o conjunto continua em falha até o operador rearmar');
  if (desarmada)
    checar(sim.comandarBomba(desarmada.id, 'rearmar').permitido, 'o rearme pelo operador é aceito');
}

console.log(
  falhas
    ? `\n${falhas} verificação(ões) falharam`
    : '\nA Etapa 0 e as quatro demonstrações funcionam',
);
process.exit(falhas ? 1 : 0);

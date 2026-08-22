#!/usr/bin/env node
/**
 * Valida a geografia da maquete contra a malha do IBGE.
 *
 *   node tools/check_geo.mjs
 *
 * Rode isto sempre que acrescentar uma unidade em src/data/topologia.js —
 * é o que protege contra uma coordenada trocada de sinal ou com lat/lon
 * invertidos, que no mapa apareceria como um marcador solto no oceano.
 *
 * Como os dados são módulos ES, o script os importa direto: nenhuma cópia
 * das coordenadas vive aqui, então não há como as duas fontes divergirem.
 */

import { BBOX, POLIGONOS, MUNICIPIO } from '../src/data/angra-geo.js';
import { UNIDADES, LINHAS, VISTAS, TIPOS, BOMBAS, SETORES, porId } from '../src/data/topologia.js';

/** Ray casting padrão. `anel` é uma lista de pares [lon, lat]. */
function dentroDoAnel(lon, lat, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
}

/** Devolve o rótulo do polígono que contém o ponto, ou null. */
function localizar(lon, lat) {
  for (let i = 0; i < POLIGONOS.length; i++) {
    if (dentroDoAnel(lon, lat, POLIGONOS[i])) {
      if (i === 0) return 'continente';
      if (i === 1) return 'Ilha Grande';
      return `ilha #${i}`;
    }
  }
  return null;
}

const problemas = [];
const avisos = [];

console.log(
  `Malha: ${MUNICIPIO.nome}/${MUNICIPIO.uf} (IBGE ${MUNICIPIO.codigo}) — ${POLIGONOS.length} polígonos`,
);
console.log(`Bbox : lat ${BBOX.minLat}..${BBOX.maxLat}  lon ${BBOX.minLon}..${BBOX.maxLon}\n`);

/* ── Unidades ─────────────────────────────────────────────────────────── */
console.log('UNIDADES');
for (const u of UNIDADES) {
  const erros = [];
  if (!TIPOS[u.tipo]) erros.push(`tipo desconhecido "${u.tipo}"`);
  // Angra está no 3º quadrante: latitude negativa, longitude negativa.
  if (u.lat > 0 || u.lon > 0) erros.push('sinal invertido (lat/lon devem ser negativos)');
  if (Math.abs(u.lat) > 90 || Math.abs(u.lon) > 180) erros.push('fora da faixa de coordenadas');
  // Lat e lon trocados é o erro clássico de copiar/colar de uma planilha.
  if (Math.abs(u.lat) > 44 && Math.abs(u.lon) < 24) erros.push('lat/lon parecem trocados');

  const onde = erros.length ? null : localizar(u.lon, u.lat);
  if (!erros.length && !onde) erros.push('fora do polígono do município');

  const marca = erros.length ? 'FALHA' : ' ok  ';
  const local = onde ? `→ ${onde}` : '';
  console.log(
    `  ${marca} ${u.sigla.padEnd(8)} ${u.nome.padEnd(42)} ${TIPOS[u.tipo]?.sistema ?? '?'} ${local}`,
  );
  for (const e of erros) problemas.push(`${u.id}: ${e}`);
}

/* ── Vértices das linhas ──────────────────────────────────────────────── */
console.log('\nLINHAS (traçado estimado)');
for (const l of LINHAS) {
  const fora = l.pontos.filter(([lon, lat]) => !localizar(lon, lat)).length;
  // Adutora litorânea encostando no mar é normal; só o traçado inteiro fora
  // do município é que indica erro de digitação.
  const marca = fora === l.pontos.length ? 'FALHA' : fora > 0 ? 'aviso' : ' ok  ';
  console.log(
    `  ${marca} ${l.id.padEnd(16)} ${String(l.pontos.length).padStart(2)} pontos, ${fora} fora d'água firme`,
  );
  if (fora === l.pontos.length) problemas.push(`${l.id}: traçado inteiro fora do município`);
  else if (fora > 0)
    avisos.push(`${l.id}: ${fora} vértice(s) fora do polígono (aceitável em trecho litorâneo)`);
}

/* ── Presets de enquadramento ─────────────────────────────────────────────
 * Os rótulos de localidade saíram do cadastro: quem nomeia Japuíba, Banqueta
 * e Vila do Abraão agora é o basemap, com colisão de tipografia resolvida.
 * Não há mais lista própria para validar aqui.
 */
console.log('\nPRESETS DE VISTA');
for (const v of VISTAS) {
  if (!v.bbox) {
    console.log(`   ok   ${v.id.padEnd(16)} município inteiro`);
    continue;
  }
  const { minLon, minLat, maxLon, maxLat } = v.bbox;
  const dentro = UNIDADES.filter(
    (u) => u.lon >= minLon && u.lon <= maxLon && u.lat >= minLat && u.lat <= maxLat,
  );
  const valido = minLon < maxLon && minLat < maxLat;
  if (!valido) problemas.push(`vista ${v.id}: bbox invertido`);
  console.log(
    `  ${valido ? ' ok  ' : 'FALHA'} ${v.id.padEnd(16)} enquadra ${dentro.length} unidade(s)`,
  );
  if (valido && dentro.length === 0) avisos.push(`vista ${v.id} não enquadra nenhuma unidade`);
}

/* ── Integridade referencial ──────────────────────────────────────────── */
console.log('\nREFERÊNCIAS');
for (const b of BOMBAS) {
  if (!porId.has(b.unidadeId))
    problemas.push(`bomba ${b.id}: unidadeId "${b.unidadeId}" não existe`);
}
const idsSetor = new Set(SETORES.map((s) => s.id));
for (const s of SETORES) {
  if (s.fonteId && !porId.has(s.fonteId))
    problemas.push(`setor ${s.id}: fonteId "${s.fonteId}" não existe`);
}
for (const u of UNIDADES) {
  for (const id of u.setores ?? []) {
    if (!idsSetor.has(id)) problemas.push(`${u.id}: setor "${id}" não existe`);
  }
  for (const b of u.bacia ?? []) {
    if (!idsSetor.has(b.setor)) problemas.push(`${u.id}: bacia "${b.setor}" não existe`);
    if (!(b.fracao > 0 && b.fracao <= 1))
      problemas.push(`${u.id}: fração de bacia inválida em "${b.setor}"`);
  }
  if (u.recalcaPara && !porId.has(u.recalcaPara))
    problemas.push(`${u.id}: recalcaPara "${u.recalcaPara}" não existe`);
}
const dup = UNIDADES.map((u) => u.id).filter((id, i, a) => a.indexOf(id) !== i);
for (const d of dup) problemas.push(`id de unidade duplicado: ${d}`);
console.log(
  `  ${BOMBAS.length} bombas, ${SETORES.length} setores, ${UNIDADES.length} unidades verificadas`,
);

/* ── Resultado ────────────────────────────────────────────────────────── */
console.log('');
for (const a of avisos) console.log(`aviso: ${a}`);
if (problemas.length) {
  console.error(`\n${problemas.length} PROBLEMA(S):`);
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  `Tudo certo: ${UNIDADES.length} unidades dentro do município, referências consistentes.`,
);

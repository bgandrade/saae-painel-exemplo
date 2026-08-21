/**
 * Topologia do sistema SAAE Angra dos Reis usada pela maquete.
 *
 * ┌─ COMO ACRESCENTAR UMA UNIDADE ─────────────────────────────────────────┐
 * │ Acrescente uma linha em UNIDADES e, se ela tiver conjuntos motobomba,   │
 * │ as linhas correspondentes em BOMBAS apontando para o `id` da unidade.   │
 * │ O mapa, os KPIs, a lista de ativos e o motor de simulação passam a      │
 * │ incluí-la automaticamente — nenhum outro arquivo precisa ser tocado.    │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * `confirmada: true`  → coordenada real, fornecida pelo SAAE.
 * `confirmada: false` → traçado/ativo estimado, existe só para dar contexto
 *                       visual ao mapa. A interface declara isso ao usuário.
 *
 * Coordenadas em graus decimais (WGS84). Vazões em L/s, volumes em m³,
 * pressões em mca (metros de coluna d'água), cotas em metros.
 */

export const TIPOS = Object.freeze({
  captacao: { rotulo: 'Captação e reservatório', sistema: 'agua' },
  reservatorio: { rotulo: 'Reservatório', sistema: 'agua' },
  elevatoria: { rotulo: 'Elevatória de água', sistema: 'agua' },
  ete: { rotulo: 'Estação de tratamento de esgoto', sistema: 'esgoto' },
  eee: { rotulo: 'Elevatória de esgoto', sistema: 'esgoto' },
});

/* ─────────────────────────── UNIDADES CONFIRMADAS ─────────────────────────
 * As nove coordenadas abaixo foram fornecidas pelo SAAE e verificadas por
 * point-in-polygon contra a malha do IBGE (tools/check_geo.py). Todas caem
 * dentro do município; a ETE Abraão cai dentro do polígono da Ilha Grande.
 */
export const UNIDADES = [
  {
    id: 'cap-banqueta',
    nome: 'Captação e Reservatório Banqueta',
    sigla: 'CAP-BQT',
    tipo: 'captacao',
    lat: -22.959238,
    lon: -44.273131,
    bairro: 'Banqueta',
    confirmada: true,
    clp: 'CLP-01',
    vazaoNominalLs: 180,
    capacidadeM3: 2000,
    nivelInicialPct: 72,
    setores: ['banqueta', 'centro'],
    mananancial: 'Rio Banqueta',
  },
  {
    id: 'res-banqueta',
    nome: 'Reservatório Banqueta',
    sigla: 'RES-BQT',
    tipo: 'reservatorio',
    lat: -22.969067,
    lon: -44.294315,
    bairro: 'Banqueta',
    confirmada: true,
    clp: 'CLP-02',
    capacidadeM3: 1500,
    nivelInicialPct: 64,
    setores: ['centro', 'japuiba'],
  },
  {
    id: 'eea-banqueta',
    nome: 'Elevatória Banqueta',
    sigla: 'EEA-BQT',
    tipo: 'elevatoria',
    lat: -22.970321,
    lon: -44.293690,
    bairro: 'Banqueta',
    confirmada: true,
    clp: 'CLP-02',
    vazaoNominalLs: 120,
    alturaManometricaM: 62,
    // De onde a elevatória puxa: é isto que o modelo hidráulico percorre para
    // saber qual reservatório sustenta a pressão de cada setor.
    alimentadaPor: 'res-banqueta',
    setores: ['centro'],
  },
  {
    id: 'eea-japuiba',
    nome: 'Elevatória Japuíba',
    sigla: 'EEA-JPB',
    tipo: 'elevatoria',
    lat: -22.984898,
    lon: -44.303495,
    bairro: 'Japuíba',
    confirmada: true,
    clp: 'CLP-03',
    vazaoNominalLs: 90,
    alturaManometricaM: 48,
    alimentadaPor: 'res-banqueta',
    setores: ['japuiba'],
  },
  {
    id: 'cap-jacuecanga',
    nome: 'Captação e Reservatório Jacuecanga',
    sigla: 'CAP-JCG',
    tipo: 'captacao',
    lat: -22.987005,
    lon: -44.243901,
    bairro: 'Jacuecanga',
    confirmada: true,
    clp: 'CLP-04',
    vazaoNominalLs: 120,
    capacidadeM3: 1200,
    nivelInicialPct: 58,
    setores: ['jacuecanga'],
    mananancial: 'Rio Jacuecanga',
  },
  {
    id: 'ete-chacara',
    nome: 'ETE Praia da Chácara',
    sigla: 'ETE-CHC',
    tipo: 'ete',
    lat: -23.003147,
    lon: -44.304887,
    bairro: 'Praia da Chácara',
    confirmada: true,
    clp: 'CLP-05',
    vazaoNominalLs: 80,
    tratamento: 'Lodos ativados',
    populacaoAtendida: 24000,
    dboAfluenteMgL: 320,
    eficienciaDbo: 0.92,
    sopradores: 2,
    // A parcela do Centro chega recalcada pela EEE Anil, não direto.
    bacia: [{ setor: 'japuiba', fracao: 0.70 }],
  },
  {
    id: 'eee-anil',
    nome: 'Elevatória de Esgoto Praia do Anil',
    sigla: 'EEE-ANL',
    tipo: 'eee',
    lat: -23.006015,
    lon: -44.311469,
    bairro: 'Praia do Anil',
    confirmada: true,
    clp: 'CLP-05',
    vazaoNominalLs: 40,
    pocoM3: 45,
    nivelInicialPct: 42,
    recalcaPara: 'ete-chacara',
    bacia: [{ setor: 'centro', fracao: 0.55 }],
  },
  {
    id: 'ete-bonfim',
    nome: 'ETE Praia do Bonfim',
    sigla: 'ETE-BFM',
    tipo: 'ete',
    lat: -23.021322,
    lon: -44.333490,
    bairro: 'Praia do Bonfim',
    confirmada: true,
    clp: 'CLP-06',
    vazaoNominalLs: 20,
    tratamento: 'UASB + filtro biológico',
    populacaoAtendida: 9000,
    dboAfluenteMgL: 340,
    eficienciaDbo: 0.86,
    sopradores: 1,
    bacia: [{ setor: 'centro', fracao: 0.30 }],
  },
  {
    id: 'ete-abraao',
    nome: 'ETE Abraão',
    sigla: 'ETE-ABR',
    tipo: 'ete',
    lat: -23.139535,
    lon: -44.169324,
    bairro: 'Vila do Abraão — Ilha Grande',
    confirmada: true,
    clp: 'CLP-07',
    vazaoNominalLs: 18,
    tratamento: 'UASB + lodos ativados',
    populacaoAtendida: 4200,
    dboAfluenteMgL: 380,
    eficienciaDbo: 0.88,
    sopradores: 1,
    bacia: [{ setor: 'ilha-grande', fracao: 0.85 }],
    // Vila turística: a população flutua muito entre baixa e alta temporada.
    fatorTuristico: 2.4,
  },
];

/* ───────────────────────────── CONJUNTOS MOTOBOMBA ─────────────────────────
 * Estimados. `papel` define o rodízio: a simulação alterna principal/reserva
 * para equalizar horímetro, como faz um CLP de verdade.
 */
export const BOMBAS = [
  // Captação Banqueta — 2 operando + 1 reserva
  { id: 'BQT-CMB-01', inversor: false, unidadeId: 'cap-banqueta', papel: 'principal', potenciaCV: 150, correnteNominalA: 168, rpmNominal: 1780, vazaoNominalLs: 90 },
  { id: 'BQT-CMB-02', inversor: false, unidadeId: 'cap-banqueta', papel: 'principal', potenciaCV: 150, correnteNominalA: 168, rpmNominal: 1780, vazaoNominalLs: 90 },
  { id: 'BQT-CMB-03', inversor: false, unidadeId: 'cap-banqueta', papel: 'reserva', potenciaCV: 150, correnteNominalA: 168, rpmNominal: 1780, vazaoNominalLs: 90 },
  // Elevatória Banqueta — 1 + 1
  { id: 'EBQ-CMB-01', inversor: true, unidadeId: 'eea-banqueta', papel: 'principal', potenciaCV: 100, correnteNominalA: 112, rpmNominal: 3520, vazaoNominalLs: 120 },
  { id: 'EBQ-CMB-02', inversor: true, unidadeId: 'eea-banqueta', papel: 'reserva', potenciaCV: 100, correnteNominalA: 112, rpmNominal: 3520, vazaoNominalLs: 120 },
  // Elevatória Japuíba — 2 + 1
  { id: 'JPB-CMB-01', inversor: true, unidadeId: 'eea-japuiba', papel: 'principal', potenciaCV: 75, correnteNominalA: 86, rpmNominal: 1770, vazaoNominalLs: 45 },
  { id: 'JPB-CMB-02', inversor: true, unidadeId: 'eea-japuiba', papel: 'principal', potenciaCV: 75, correnteNominalA: 86, rpmNominal: 1770, vazaoNominalLs: 45 },
  { id: 'JPB-CMB-03', inversor: true, unidadeId: 'eea-japuiba', papel: 'reserva', potenciaCV: 75, correnteNominalA: 86, rpmNominal: 1770, vazaoNominalLs: 45 },
  // Captação Jacuecanga — 1 + 1
  { id: 'JCG-CMB-01', inversor: false, unidadeId: 'cap-jacuecanga', papel: 'principal', potenciaCV: 100, correnteNominalA: 112, rpmNominal: 1775, vazaoNominalLs: 120 },
  { id: 'JCG-CMB-02', inversor: false, unidadeId: 'cap-jacuecanga', papel: 'reserva', potenciaCV: 100, correnteNominalA: 112, rpmNominal: 1775, vazaoNominalLs: 120 },
  // Elevatória de esgoto Praia do Anil — 1 + 1, alternância a cada partida
  { id: 'ANL-CMB-01', inversor: false, unidadeId: 'eee-anil', papel: 'principal', potenciaCV: 60, correnteNominalA: 70, rpmNominal: 1760, vazaoNominalLs: 40 },
  { id: 'ANL-CMB-02', inversor: false, unidadeId: 'eee-anil', papel: 'reserva', potenciaCV: 60, correnteNominalA: 70, rpmNominal: 1760, vazaoNominalLs: 40 },
  // Recalque interno das ETEs
  { id: 'CHC-CMB-01', inversor: true, unidadeId: 'ete-chacara', papel: 'principal', potenciaCV: 40, correnteNominalA: 48, rpmNominal: 1755, vazaoNominalLs: 60 },
  { id: 'CHC-CMB-02', inversor: true, unidadeId: 'ete-chacara', papel: 'reserva', potenciaCV: 40, correnteNominalA: 48, rpmNominal: 1755, vazaoNominalLs: 60 },
  { id: 'BFM-CMB-01', inversor: true, unidadeId: 'ete-bonfim', papel: 'principal', potenciaCV: 30, correnteNominalA: 37, rpmNominal: 1750, vazaoNominalLs: 45 },
  { id: 'ABR-CMB-01', inversor: true, unidadeId: 'ete-abraao', papel: 'principal', potenciaCV: 15, correnteNominalA: 20, rpmNominal: 1740, vazaoNominalLs: 12 },
];

/* ───────────────────────── SETORES DE ABASTECIMENTO ────────────────────────
 * Estimados. Servem para dar contexto de pressão e consumo ao mapa.
 */
export const SETORES = [
  { id: 'centro', nome: 'Centro / Praia do Anil', nomeCurto: 'Centro', cotaM: 8, populacao: 14000, pressaoAlvoMca: 32, fonteId: 'res-banqueta', residenciaH: 5.2, centro: [-44.3181, -23.0067], raioKm: 2.4 },
  { id: 'japuiba', nome: 'Japuíba / Belém', nomeCurto: 'Japuíba', cotaM: 22, populacao: 18000, pressaoAlvoMca: 28, fonteId: 'eea-japuiba', residenciaH: 6.8, centro: [-44.2960, -22.9820], raioKm: 2.7 },
  { id: 'jacuecanga', nome: 'Jacuecanga / Ponta Leste', nomeCurto: 'Jacuecanga', cotaM: 15, populacao: 12000, pressaoAlvoMca: 30, fonteId: 'cap-jacuecanga', residenciaH: 4.1, centro: [-44.2360, -22.9930], raioKm: 2.5 },
  { id: 'banqueta', nome: 'Banqueta / Caputera', nomeCurto: 'Banqueta', cotaM: 45, populacao: 5000, pressaoAlvoMca: 28, fonteId: 'cap-banqueta', residenciaH: 1.8, centro: [-44.2840, -22.9640], raioKm: 1.9 },
  // Sem unidade de produção na lista fornecida: o Abraão é abastecido por
  // sistema local que não tem telemetria integrada ao painel.
  { id: 'ilha-grande', nome: 'Vila do Abraão', nomeCurto: 'Abraão', cotaM: 6, populacao: 4200, pressaoAlvoMca: 26, fonteId: null, residenciaH: 2.5, fatorTuristico: 2.4, semTelemetria: true, centro: [-44.1742, -23.1372], raioKm: 1.3 },
];

/* ──────────────────────────── LINHAS (ESTIMADAS) ───────────────────────────
 * Traçado aproximado, desenhado entre as coordenadas reais das unidades para
 * dar leitura de rede ao mapa. Não corresponde ao cadastro do SAAE.
 */
export const LINHAS = [
  { id: 'ad-bqt-res', nome: 'Adutora Captação Banqueta → Reservatório', sistema: 'agua', diametroMm: 400, de: 'cap-banqueta', para: 'res-banqueta', maxLs: 150, nivelAlvo: 0.75, confirmada: false,
    pontos: [[-44.273131, -22.959238], [-44.2812, -22.9628], [-44.2884, -22.9662], [-44.294315, -22.969067]] },
  { id: 'ad-res-jpb', nome: 'Adutora Reservatório Banqueta → Japuíba', sistema: 'agua', diametroMm: 300, de: 'res-banqueta', para: 'eea-japuiba', confirmada: false,
    pontos: [[-44.294315, -22.969067], [-44.2981, -22.9755], [-44.3012, -22.9812], [-44.303495, -22.984898]] },
  { id: 'ad-bqt-centro', nome: 'Adutora Banqueta → Centro', sistema: 'agua', diametroMm: 350, de: 'eea-banqueta', para: 'centro', confirmada: false,
    pontos: [[-44.293690, -22.970321], [-44.3005, -22.9788], [-44.3068, -22.9903], [-44.3113, -23.0002], [-44.3130, -23.0060]] },
  { id: 'ad-jpb-rede', nome: 'Rede Japuíba', sistema: 'agua', diametroMm: 250, de: 'eea-japuiba', para: 'japuiba', confirmada: false,
    pontos: [[-44.303495, -22.984898], [-44.2985, -22.9832], [-44.2938, -22.9818], [-44.2890, -22.9808]] },
  { id: 'ad-jcg-rede', nome: 'Rede Jacuecanga', sistema: 'agua', diametroMm: 250, de: 'cap-jacuecanga', para: 'jacuecanga', confirmada: false,
    pontos: [[-44.243901, -22.987005], [-44.2398, -22.9905], [-44.2360, -22.9930], [-44.2302, -22.9958]] },
  { id: 'co-centro-anil', nome: 'Coletor-tronco Centro → Anil', sistema: 'esgoto', diametroMm: 400, de: 'centro', para: 'eee-anil', confirmada: false,
    pontos: [[-44.3181, -23.0067], [-44.3152, -23.0064], [-44.311469, -23.006015]] },
  { id: 'rc-anil-chacara', nome: 'Recalque Anil → ETE Chácara', sistema: 'esgoto', diametroMm: 300, de: 'eee-anil', para: 'ete-chacara', confirmada: false,
    pontos: [[-44.311469, -23.006015], [-44.3086, -23.0048], [-44.304887, -23.003147]] },
  { id: 'co-bonfim', nome: 'Coletor-tronco Bonfim', sistema: 'esgoto', diametroMm: 300, de: 'centro', para: 'ete-bonfim', confirmada: false,
    pontos: [[-44.3181, -23.0067], [-44.3245, -23.0128], [-44.3298, -23.0180], [-44.333490, -23.021322]] },
  { id: 'co-abraao', nome: 'Coletor Vila do Abraão', sistema: 'esgoto', diametroMm: 200, de: 'ilha-grande', para: 'ete-abraao', confirmada: false,
    pontos: [[-44.1742, -23.1372], [-44.1718, -23.1385], [-44.169324, -23.139535]] },
];

/* ───────── RÓTULOS DE LOCALIDADES (só para leitura do mapa) ───────── */
export const LOCALIDADES = [
  { nome: 'Centro', lat: -23.0067, lon: -44.3181, destaque: true },
  { nome: 'Japuíba', lat: -22.9820, lon: -44.2960, destaque: true },
  { nome: 'Jacuecanga', lat: -22.9930, lon: -44.2360, destaque: true },
  { nome: 'Banqueta', lat: -22.9640, lon: -44.2840, destaque: true },
  { nome: 'Praia do Bonfim', lat: -23.0215, lon: -44.3345 },
  { nome: 'Vila do Abraão', lat: -23.1372, lon: -44.1742, destaque: true },
  { nome: 'Ilha Grande', lat: -23.1660, lon: -44.2400 },
  { nome: 'Monsuaba', lat: -22.9600, lon: -44.2200 },
  { nome: 'Ariró', lat: -22.9400, lon: -44.3200 },
  { nome: 'Camorim', lat: -22.9450, lon: -44.3700 },
  { nome: 'Cunhambebe', lat: -22.9330, lon: -44.4130 },
  { nome: 'Bracuí', lat: -22.9200, lon: -44.4300 },
  { nome: 'Frade', lat: -22.9760, lon: -44.4720 },
  { nome: 'Perequê', lat: -23.0080, lon: -44.5170 },
  { nome: 'Mambucaba', lat: -23.0200, lon: -44.5330 },
];

/* ─────────────────────── PRESETS DE ENQUADRAMENTO DO MAPA ──────────────────
 * As unidades continentais ocupam ~1/6 da largura do município, então
 * enquadrar tudo empilha os marcadores. Estes presets dão saída para isso.
 */
export const VISTAS = [
  // Continente: as oito unidades do eixo Centro–Japuíba–Jacuecanga, no
  // enquadramento em que os marcadores ficam grandes e legíveis.
  { id: 'continente', nome: 'Continente', bbox: { minLon: -44.355, minLat: -23.040, maxLon: -44.225, maxLat: -22.945 }, padrao: true },
  { id: 'centro', nome: 'Centro', bbox: { minLon: -44.345, minLat: -23.032, maxLon: -44.285, maxLat: -22.988 } },
  { id: 'ilha-grande', nome: 'Ilha Grande', bbox: { minLon: -44.205, minLat: -23.158, maxLon: -44.135, maxLat: -23.118 } },
  { id: 'municipio', nome: 'Município', bbox: null },
];

/* ───────────────────────── LIMITES NORMATIVOS E DE ALARME ──────────────────
 * Água: Portaria GM/MS nº 888/2021 (padrão de potabilidade).
 * Esgoto: Resolução CONAMA nº 430/2011 (lançamento de efluentes).
 */
export const LIMITES = Object.freeze({
  cloroLivre: { min: 0.2, max: 2.0, alvo: 1.1, unidade: 'mg/L', norma: 'GM/MS 888/2021' },
  ph: { min: 6.0, max: 9.0, alvo: 7.2, unidade: '', norma: 'GM/MS 888/2021' },
  turbidez: { min: 0, max: 5.0, alvo: 0.6, unidade: 'uT', norma: 'GM/MS 888/2021' },
  fluoreto: { min: 0.6, max: 0.9, alvo: 0.75, unidade: 'mg/L', norma: 'GM/MS 888/2021' },
  pressao: { min: 10, max: 50, alvo: 30, unidade: 'mca', norma: 'NBR 12218' },
  dboEfluente: { max: 120, remocaoMin: 0.6, unidade: 'mg/L', norma: 'CONAMA 430/2011' },
  phEfluente: { min: 5.0, max: 9.0, unidade: '', norma: 'CONAMA 430/2011' },
  oxigenioDissolvido: { min: 1.5, alvo: 2.2, unidade: 'mg/L' },
});

/* ───────────────────────────── ÍNDICES AUXILIARES ──────────────────────── */
export const porId = new Map(UNIDADES.map((u) => [u.id, u]));
export const bombasDaUnidade = (unidadeId) => BOMBAS.filter((b) => b.unidadeId === unidadeId);
export const unidadesDoSistema = (sistema) =>
  sistema === 'ambos' ? UNIDADES : UNIDADES.filter((u) => TIPOS[u.tipo].sistema === sistema);

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
  captacao: { rotulo: 'Captação', sistema: 'agua' },
  reservatorio: { rotulo: 'Reservatório', sistema: 'agua' },
  elevatoria: { rotulo: 'Elevatória de água', sistema: 'agua' },
  ete: { rotulo: 'Estação de tratamento de esgoto', sistema: 'esgoto' },
  eee: { rotulo: 'Elevatória de esgoto', sistema: 'esgoto' },
});

/* ─────────────────────────── UNIDADES CONFIRMADAS ─────────────────────────
 * As dez coordenadas abaixo foram fornecidas pelo SAAE e verificadas por
 * point-in-polygon contra a malha do IBGE (tools/check_geo.mjs). Todas caem
 * dentro do município; a ETE Abraão cai dentro do polígono da Ilha Grande.
 *
 * `malha` descreve a estratégia de controle da unidade. Os valores são os
 * setpoints de partida do CLP — a interface os lê e os escreve, e é isso que
 * torna a automação demonstrável em vez de invisível.
 */
export const UNIDADES = [
  {
    id: 'cap-banqueta',
    nome: 'Captação Banqueta',
    sigla: 'CAP-BQT',
    tipo: 'captacao',
    lat: -22.959238,
    lon: -44.273131,
    bairro: 'Banqueta',
    confirmada: true,
    clp: 'CLP-01',
    vazaoNominalLs: 180,
    // Câmara de carga: é o poço de sucção da Elevatória Banqueta e, ao mesmo
    // tempo, a reservação do setor alto da Banqueta, que fica ao lado da
    // captação e é atendido por gravidade.
    capacidadeM3: 800,
    rotuloVolume: 'Câmara de carga',
    nivelInicialPct: 68,
    entradaSemBombeamento: true,
    setores: ['banqueta'],
    mananancial: 'Rio Banqueta',
  },
  {
    id: 'eea-banqueta',
    // Vizinho próximo demais: o rótulo sai do eixo para não colidir no mapa.
    rotuloOffset: [-64, 14],
    nome: 'Elevatória Banqueta',
    sigla: 'EEA-BQT',
    tipo: 'elevatoria',
    lat: -22.970321,
    lon: -44.29369,
    bairro: 'Banqueta',
    confirmada: true,
    clp: 'CLP-02',
    vazaoNominalLs: 250,
    alturaManometricaM: 62,
    // Recebe da captação e recalca para o reservatório: é isto que o modelo
    // hidráulico percorre para saber quem sustenta a pressão de cada setor.
    alimentadaPor: 'cap-banqueta',
    recalcaPara: 'res-banqueta',
    malha: {
      tipo: 'recalque',
      descricao: 'Histerese de nível no reservatório de destino, com escalonamento por demanda',
      variavel: 'Nível RES-BQT',
      ligaPct: 30,
      desligaPct: 85,
      emergenciaPct: 15,
      // Intertravamento de afogamento: não se parte bomba com a sucção vazia.
      nivelMinSuccaoPct: 12,
      escalonamentoS: 15,
      tempoMinimoOperacaoS: 300,
      // Quanto acima da saída do reservatório se bombeia, para repor volume
      // além de apenas acompanhar o consumo.
      fatorReposicao: 1.35,
    },
  },
  {
    id: 'res-banqueta',
    // Vizinho próximo demais: o rótulo sai do eixo para não colidir no mapa.
    rotuloOffset: [64, -2],
    nome: 'Reservatório Banqueta',
    sigla: 'RES-BQT',
    tipo: 'reservatorio',
    lat: -22.969067,
    lon: -44.294315,
    bairro: 'Banqueta',
    confirmada: true,
    clp: 'CLP-02',
    capacidadeM3: 1500,
    rotuloVolume: 'Reservatório apoiado',
    nivelInicialPct: 64,
    setores: ['japuiba'],
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
    // Recebe diretamente da captação da Banqueta, sem passar pelo
    // Reservatório Banqueta.
    alimentadaPor: 'cap-banqueta',
    setores: ['centro'],
    malha: {
      tipo: 'demanda',
      descricao: 'Modulação de rotação por inversor para acompanhar a demanda do setor',
      variavel: 'Demanda Centro / Balneário / Parque das Palmeiras',
      rotacaoMinPct: 55,
      nivelMinSuccaoPct: 12,
      escalonamentoS: 15,
      tempoMinimoOperacaoS: 300,
    },
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
    rotuloVolume: 'Reservatório de montante',
    nivelInicialPct: 58,
    setores: ['jacuecanga'],
    mananancial: 'Rio Jacuecanga',
    malha: {
      tipo: 'nivel',
      descricao: 'Histerese de nível no reservatório, partida direta',
      variavel: 'Nível CAP-JCG',
      ligaPct: 30,
      desligaPct: 85,
      emergenciaPct: 15,
      escalonamentoS: 15,
      tempoMinimoOperacaoS: 300,
    },
  },
  {
    id: 'ete-chacara',
    // Vizinho próximo demais: o rótulo sai do eixo para não colidir no mapa.
    rotuloOffset: [62, 2],
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
    // Centro, Balneário e Parque das Palmeiras chegam exclusivamente
    // recalcados pela EEE Praia do Anil.
    bacia: [],
    recebeDe: ['eee-anil'],
    malha: {
      tipo: 'continua',
      descricao: 'Recalque interno contínuo, rotação modulada pela carga afluente',
      variavel: 'Carga afluente',
      rotacaoMinPct: 65,
      escalonamentoS: 15,
      tempoMinimoOperacaoS: 300,
    },
  },
  {
    id: 'eee-anil',
    // Vizinho próximo demais: o rótulo sai do eixo para não colidir no mapa.
    rotuloOffset: [-62, 12],
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
    bacia: [{ setor: 'centro', fracao: 1 }],
    malha: {
      tipo: 'poco',
      descricao: 'Histerese de nível no poço de sucção, alternância a cada partida',
      variavel: 'Nível do poço',
      ligaPct: 75,
      desligaPct: 25,
      emergenciaPct: 92,
      escalonamentoS: 10,
      tempoMinimoOperacaoS: 120,
    },
  },
  {
    id: 'ete-bonfim',
    nome: 'ETE Praia do Bonfim',
    sigla: 'ETE-BFM',
    tipo: 'ete',
    lat: -23.021322,
    lon: -44.33349,
    bairro: 'Praia do Bonfim',
    confirmada: true,
    clp: 'CLP-06',
    vazaoNominalLs: 20,
    tratamento: 'UASB + filtro biológico',
    populacaoAtendida: 9000,
    dboAfluenteMgL: 340,
    eficienciaDbo: 0.86,
    sopradores: 1,
    bacia: [{ setor: 'bonfim', fracao: 1 }],
    malha: {
      tipo: 'continua',
      descricao: 'Recalque interno contínuo, rotação modulada pela carga afluente',
      variavel: 'Carga afluente',
      rotacaoMinPct: 65,
      escalonamentoS: 15,
      tempoMinimoOperacaoS: 300,
    },
  },
  {
    id: 'ete-japuiba',
    nome: 'ETE Japuíba',
    sigla: 'ETE-JPB',
    tipo: 'ete',
    lat: -22.977649577511944,
    lon: -44.30422552964291,
    bairro: 'Japuíba',
    confirmada: true,
    clp: null,
    // Vazão e parâmetros de processo mantidos como estimativas da maquete;
    // a localização e a bacia atendida são os dados confirmados.
    dadosProcessoEstimados: true,
    vazaoNominalLs: 60,
    tratamento: 'Processo não informado',
    populacaoAtendida: 18000,
    dboAfluenteMgL: 320,
    eficienciaDbo: 0.88,
    sopradores: 1,
    // O esgoto de Japuíba chega por gravidade. O destino sanitário de Nova
    // Angra, Belém e Ribeira não foi informado e não é inferido no cadastro.
    bacia: [{ setor: 'japuiba-esgoto', fracao: 1 }],
    modoChegada: 'Gravidade',
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
    malha: {
      tipo: 'continua',
      descricao: 'Recalque interno contínuo, rotação modulada pela carga afluente',
      variavel: 'Carga afluente',
      rotacaoMinPct: 65,
      escalonamentoS: 15,
      tempoMinimoOperacaoS: 300,
    },
  },
];

/* ───────────────────────────── CONJUNTOS MOTOBOMBA ─────────────────────────
 * Estimados. `papel` define quantos conjuntos a malha aciona em regime normal;
 * qual conjunto concretamente entra é decidido pelo rodízio por horímetro, e
 * não pelo papel — é assim que um CLP de verdade equaliza o desgaste.
 *
 * `alturaNominalM` e `rendimentoBep` alimentam a curva H×Q do faceplate: a
 * curva da bomba é traçada como H(Q) = H0 − k·Q², com H0 = 1,25·Hnom, que é a
 * forma típica de uma centrífuga de rotor fechado.
 */
export const BOMBAS = [
  /* Elevatória Banqueta — 5 conjuntos.
   * Dimensionamento: o Reservatório Banqueta abastece Japuíba, Nova Angra,
   * Belém e Ribeira (18.000 hab). Isso pede ~52 L/s de produção média e cerca
   * de 100 L/s no pico das 7 h. Os cinco conjuntos preservam ampla reserva. */
  {
    id: 'EBQ-CMB-01',
    inversor: true,
    unidadeId: 'eea-banqueta',
    papel: 'principal',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 50,
    alturaNominalM: 62,
    rendimentoBep: 0.77,
  },
  {
    id: 'EBQ-CMB-02',
    inversor: true,
    unidadeId: 'eea-banqueta',
    papel: 'principal',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 50,
    alturaNominalM: 62,
    rendimentoBep: 0.77,
  },
  {
    id: 'EBQ-CMB-03',
    inversor: true,
    unidadeId: 'eea-banqueta',
    papel: 'principal',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 50,
    alturaNominalM: 62,
    rendimentoBep: 0.77,
  },
  {
    id: 'EBQ-CMB-04',
    inversor: true,
    unidadeId: 'eea-banqueta',
    papel: 'principal',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 50,
    alturaNominalM: 62,
    rendimentoBep: 0.77,
  },
  {
    id: 'EBQ-CMB-05',
    inversor: true,
    unidadeId: 'eea-banqueta',
    papel: 'reserva',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 50,
    alturaNominalM: 62,
    rendimentoBep: 0.77,
  },

  // Elevatória Japuíba — 2 + 1
  {
    id: 'JPB-CMB-01',
    inversor: true,
    unidadeId: 'eea-japuiba',
    papel: 'principal',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 45,
    alturaNominalM: 48,
    rendimentoBep: 0.76,
  },
  {
    id: 'JPB-CMB-02',
    inversor: true,
    unidadeId: 'eea-japuiba',
    papel: 'principal',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 45,
    alturaNominalM: 48,
    rendimentoBep: 0.76,
  },
  {
    id: 'JPB-CMB-03',
    inversor: true,
    unidadeId: 'eea-japuiba',
    papel: 'reserva',
    potenciaCV: 75,
    correnteNominalA: 86,
    rpmNominal: 1770,
    vazaoNominalLs: 45,
    alturaNominalM: 48,
    rendimentoBep: 0.76,
  },

  // Captação Jacuecanga — 1 + 1
  {
    id: 'JCG-CMB-01',
    inversor: false,
    unidadeId: 'cap-jacuecanga',
    papel: 'principal',
    potenciaCV: 100,
    correnteNominalA: 112,
    rpmNominal: 1775,
    vazaoNominalLs: 120,
    alturaNominalM: 40,
    rendimentoBep: 0.78,
  },
  {
    id: 'JCG-CMB-02',
    inversor: false,
    unidadeId: 'cap-jacuecanga',
    papel: 'reserva',
    potenciaCV: 100,
    correnteNominalA: 112,
    rpmNominal: 1775,
    vazaoNominalLs: 120,
    alturaNominalM: 40,
    rendimentoBep: 0.78,
  },

  // Elevatória de esgoto Praia do Anil — 1 + 1, alternância a cada partida
  {
    id: 'ANL-CMB-01',
    inversor: false,
    unidadeId: 'eee-anil',
    papel: 'principal',
    potenciaCV: 60,
    correnteNominalA: 70,
    rpmNominal: 1760,
    vazaoNominalLs: 40,
    alturaNominalM: 22,
    rendimentoBep: 0.71,
  },
  {
    id: 'ANL-CMB-02',
    inversor: false,
    unidadeId: 'eee-anil',
    papel: 'reserva',
    potenciaCV: 60,
    correnteNominalA: 70,
    rpmNominal: 1760,
    vazaoNominalLs: 40,
    alturaNominalM: 22,
    rendimentoBep: 0.71,
  },

  // Recalque interno das ETEs
  {
    id: 'CHC-CMB-01',
    inversor: true,
    unidadeId: 'ete-chacara',
    papel: 'principal',
    potenciaCV: 40,
    correnteNominalA: 48,
    rpmNominal: 1755,
    vazaoNominalLs: 60,
    alturaNominalM: 15,
    rendimentoBep: 0.72,
  },
  {
    id: 'CHC-CMB-02',
    inversor: true,
    unidadeId: 'ete-chacara',
    papel: 'reserva',
    potenciaCV: 40,
    correnteNominalA: 48,
    rpmNominal: 1755,
    vazaoNominalLs: 60,
    alturaNominalM: 15,
    rendimentoBep: 0.72,
  },
  {
    id: 'BFM-CMB-01',
    inversor: true,
    unidadeId: 'ete-bonfim',
    papel: 'principal',
    potenciaCV: 30,
    correnteNominalA: 37,
    rpmNominal: 1750,
    vazaoNominalLs: 45,
    alturaNominalM: 14,
    rendimentoBep: 0.7,
  },
  {
    id: 'ABR-CMB-01',
    inversor: true,
    unidadeId: 'ete-abraao',
    papel: 'principal',
    potenciaCV: 15,
    correnteNominalA: 20,
    rpmNominal: 1740,
    vazaoNominalLs: 12,
    alturaNominalM: 12,
    rendimentoBep: 0.68,
  },
];

/* ─────────────────── SETORES DE ABASTECIMENTO E BACIAS ─────────────────────
 * Estimados. Servem para dar contexto de pressão, consumo e esgoto ao mapa.
 */
export const SETORES = [
  {
    id: 'centro',
    nome: 'Centro / Balneário / Parque das Palmeiras',
    nomeCurto: 'Centro',
    cotaM: 8,
    populacao: 14000,
    pressaoAlvoMca: 32,
    fonteId: 'eea-japuiba',
    residenciaH: 5.2,
    centro: [-44.3181, -23.0067],
    raioKm: 2.4,
  },
  {
    id: 'japuiba',
    nome: 'Japuíba / Nova Angra / Belém / Ribeira',
    nomeCurto: 'Japuíba',
    cotaM: 22,
    populacao: 18000,
    pressaoAlvoMca: 28,
    fonteId: 'res-banqueta',
    residenciaH: 6.8,
    centro: [-44.296, -22.982],
    raioKm: 2.7,
  },
  {
    id: 'japuiba-esgoto',
    nome: 'Japuíba',
    nomeCurto: 'Japuíba',
    cotaM: 22,
    populacao: 18000,
    pressaoAlvoMca: 28,
    fonteId: null,
    residenciaH: 3,
    semTelemetria: true,
    somenteEsgoto: true,
    centro: [-44.296, -22.982],
    raioKm: 2.7,
  },
  // Bacia sanitária independente; não participa dos indicadores de
  // abastecimento de água desta maquete.
  {
    id: 'bonfim',
    nome: 'Bonfim',
    nomeCurto: 'Bonfim',
    cotaM: 8,
    populacao: 9000,
    pressaoAlvoMca: 30,
    fonteId: null,
    residenciaH: 3,
    semTelemetria: true,
    somenteEsgoto: true,
    centro: [-44.335, -23.021],
    raioKm: 1,
  },
  {
    id: 'jacuecanga',
    nome: 'Jacuecanga / Ponta Leste',
    nomeCurto: 'Jacuecanga',
    cotaM: 15,
    populacao: 12000,
    pressaoAlvoMca: 30,
    fonteId: 'cap-jacuecanga',
    residenciaH: 4.1,
    centro: [-44.236, -22.993],
    raioKm: 2.5,
  },
  {
    id: 'banqueta',
    nome: 'Banqueta / Caputera',
    nomeCurto: 'Banqueta',
    cotaM: 45,
    populacao: 5000,
    pressaoAlvoMca: 28,
    fonteId: 'cap-banqueta',
    residenciaH: 1.8,
    centro: [-44.284, -22.964],
    raioKm: 1.9,
  },
  // Sem unidade de produção na lista fornecida: o Abraão é abastecido por
  // sistema local que não tem telemetria integrada ao painel.
  {
    id: 'ilha-grande',
    nome: 'Vila do Abraão',
    nomeCurto: 'Abraão',
    cotaM: 6,
    populacao: 4200,
    pressaoAlvoMca: 26,
    fonteId: null,
    residenciaH: 2.5,
    fatorTuristico: 2.4,
    semTelemetria: true,
    centro: [-44.1742, -23.1372],
    raioKm: 1.3,
  },
];

/* ──────────────────────────── LINHAS (ESTIMADAS) ───────────────────────────
 * Traçado aproximado, desenhado entre as coordenadas reais das unidades para
 * dar leitura de rede ao mapa. Não corresponde ao cadastro do SAAE.
 */
export const LINHAS = [
  {
    id: 'su-bqt',
    nome: 'Sucção Captação → Elevatória Banqueta',
    sistema: 'agua',
    diametroMm: 500,
    de: 'cap-banqueta',
    para: 'eea-banqueta',
    confirmada: false,
    pontos: [
      [-44.273131, -22.959238],
      [-44.2812, -22.9628],
      [-44.2884, -22.9662],
      [-44.29369, -22.970321],
    ],
  },
  {
    id: 'ad-bqt-res',
    nome: 'Recalque Elevatória → Reservatório Banqueta',
    sistema: 'agua',
    diametroMm: 400,
    de: 'eea-banqueta',
    para: 'res-banqueta',
    confirmada: false,
    pontos: [
      [-44.29369, -22.970321],
      [-44.294, -22.9697],
      [-44.294315, -22.969067],
    ],
  },
  {
    id: 'ad-jpb-centro',
    nome: 'Adutora EEA Japuíba → Centro / Balneário / Parque das Palmeiras',
    sistema: 'agua',
    diametroMm: 350,
    de: 'eea-japuiba',
    para: 'centro',
    confirmada: false,
    pontos: [
      [-44.303495, -22.984898],
      [-44.3068, -22.9903],
      [-44.3113, -23.0002],
      [-44.313, -23.006],
    ],
  },
  {
    id: 'ad-cap-jpb',
    nome: 'Adutora Captação Banqueta → EEA Japuíba',
    sistema: 'agua',
    diametroMm: 300,
    de: 'cap-banqueta',
    para: 'eea-japuiba',
    confirmada: false,
    pontos: [
      [-44.273131, -22.959238],
      [-44.286, -22.967],
      [-44.2981, -22.9755],
      [-44.3012, -22.9812],
      [-44.303495, -22.984898],
    ],
  },
  {
    id: 'ad-jpb-rede',
    nome: 'Rede Japuíba / Nova Angra / Belém / Ribeira',
    sistema: 'agua',
    diametroMm: 250,
    de: 'res-banqueta',
    para: 'japuiba',
    confirmada: false,
    pontos: [
      [-44.294315, -22.969067],
      [-44.296, -22.975],
      [-44.2985, -22.9832],
      [-44.2938, -22.9818],
      [-44.289, -22.9808],
    ],
  },
  {
    id: 'ad-jcg-rede',
    nome: 'Rede Jacuecanga',
    sistema: 'agua',
    diametroMm: 250,
    de: 'cap-jacuecanga',
    para: 'jacuecanga',
    confirmada: false,
    pontos: [
      [-44.243901, -22.987005],
      [-44.2398, -22.9905],
      [-44.236, -22.993],
      [-44.2302, -22.9958],
    ],
  },
  {
    id: 'co-centro-anil',
    nome: 'Coletor Centro / Balneário / Parque das Palmeiras → Anil',
    sistema: 'esgoto',
    diametroMm: 400,
    de: 'centro',
    para: 'eee-anil',
    confirmada: false,
    pontos: [
      [-44.3181, -23.0067],
      [-44.3152, -23.0064],
      [-44.311469, -23.006015],
    ],
  },
  {
    id: 'rc-anil-chacara',
    nome: 'Recalque Anil → ETE Chácara',
    sistema: 'esgoto',
    diametroMm: 300,
    de: 'eee-anil',
    para: 'ete-chacara',
    confirmada: false,
    pontos: [
      [-44.311469, -23.006015],
      [-44.3086, -23.0048],
      [-44.304887, -23.003147],
    ],
  },
  {
    id: 'co-bonfim',
    nome: 'Coletor-tronco Bonfim',
    sistema: 'esgoto',
    diametroMm: 300,
    de: 'bonfim',
    para: 'ete-bonfim',
    confirmada: false,
    pontos: [
      [-44.335, -23.021],
      [-44.33349, -23.021322],
    ],
  },
  {
    id: 'co-japuiba',
    nome: 'Coletor por gravidade Japuíba → ETE Japuíba',
    sistema: 'esgoto',
    diametroMm: 300,
    de: 'japuiba-esgoto',
    para: 'ete-japuiba',
    confirmada: false,
    pontos: [
      [-44.296, -22.982],
      [-44.2995, -22.9805],
      [-44.30422552964291, -22.977649577511944],
    ],
  },
  {
    id: 'co-abraao',
    nome: 'Coletor Vila do Abraão',
    sistema: 'esgoto',
    diametroMm: 200,
    de: 'ilha-grande',
    para: 'ete-abraao',
    confirmada: false,
    pontos: [
      [-44.1742, -23.1372],
      [-44.1718, -23.1385],
      [-44.169324, -23.139535],
    ],
  },
];

/* ───────── PRESETS DE ENQUADRAMENTO DO MAPA ─────────
 * As unidades continentais ocupam ~1/6 da largura do município, então
 * enquadrar tudo empilha os marcadores. Estes presets dão saída para isso.
 * Os rótulos de localidade saem do basemap — não há mais lista própria, que
 * era justamente a origem dos rótulos sobrepostos da versão anterior.
 */
export const VISTAS = [
  {
    id: 'continente',
    nome: 'Continente',
    bbox: { minLon: -44.355, minLat: -23.04, maxLon: -44.225, maxLat: -22.945 },
    padrao: true,
  },
  {
    id: 'banqueta',
    nome: 'Banqueta',
    bbox: { minLon: -44.302, minLat: -22.976, maxLon: -44.266, maxLat: -22.954 },
  },
  {
    id: 'centro',
    nome: 'Centro',
    bbox: { minLon: -44.345, minLat: -23.032, maxLon: -44.285, maxLat: -22.988 },
  },
  {
    id: 'ilha-grande',
    nome: 'Ilha Grande',
    bbox: { minLon: -44.205, minLat: -23.158, maxLon: -44.135, maxLat: -23.118 },
  },
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
  // ISO 10816-3, máquinas de médio porte em fundação rígida.
  vibracao: { alerta: 4.5, critico: 7.1, unidade: 'mm/s', norma: 'ISO 10816-3' },
  tempMancal: { alerta: 75, critico: 85, unidade: '°C' },
  // Desequilíbrio de tensão entre fases — NEMA MG-1 recomenda ≤ 1 %.
  desequilibrio: { alerta: 1.0, critico: 2.0, unidade: '%', norma: 'NEMA MG-1' },
});

/* ───────────────────────────── ÍNDICES AUXILIARES ──────────────────────── */
export const porId = new Map(UNIDADES.map((u) => [u.id, u]));
export const bombasDaUnidade = (unidadeId) => BOMBAS.filter((b) => b.unidadeId === unidadeId);
export const unidadesDoSistema = (sistema) =>
  sistema === 'ambos' ? UNIDADES : UNIDADES.filter((u) => TIPOS[u.tipo].sistema === sistema);
export const unidadesComBomba = () => {
  const ids = new Set(BOMBAS.map((b) => b.unidadeId));
  return UNIDADES.filter((u) => ids.has(u.id));
};

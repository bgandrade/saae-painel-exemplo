/**
 * Camadas de base do mapa.
 *
 * Escolha deliberada do CARTO em vez do OpenStreetMap padrão: o OSM colorido
 * briga com um painel de sala de controle escuro, enquanto o Dark Matter foi
 * desenhado exatamente para ficar POR BAIXO de sobreposição de dados. É a
 * diferença entre um mapa que atrapalha e um que sustenta.
 *
 * Todas as camadas são XYZ raster sem chave de API. A camada "sinóptico" não
 * usa rede nenhuma: é o contorno do IBGE embutido no pacote, e serve de rede
 * de segurança para o auditório onde a internet falhar.
 */

export const CAMADAS = [
  {
    id: 'ruas',
    nome: 'Ruas',
    // A variante segue o tema do painel: escuro no escuro, claro no claro.
    url: (tema) =>
      tema === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    atrib: '&copy; OpenStreetMap &copy; CARTO',
    subdominios: 'abcd',
    zoomMax: 19,
    online: true,
  },
  {
    id: 'satelite',
    nome: 'Satélite',
    url: () => 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    atrib: 'Imagens &copy; Esri, Maxar, Earthstar Geographics',
    subdominios: 'abc',
    zoomMax: 18,
    online: true,
  },
  {
    id: 'sinoptico',
    nome: 'Sinóptico',
    url: null,
    atrib: 'Contorno: IBGE — malha municipal 3300100',
    online: false,
  },
];

/** Domínios que a CSP precisa liberar. Documentado aqui e em public/_headers. */
export const DOMINIOS_TILE = [
  'https://*.basemaps.cartocdn.com',
  'https://server.arcgisonline.com',
];

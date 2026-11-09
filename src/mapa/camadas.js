/**
 * Camadas de base do mapa.
 *
 * Ruas usa os tiles públicos do OpenStreetMap, sem cadastro nem chave de API.
 * Uso interativo, com atribuição visível e cache HTTP normal do navegador:
 * https://operations.osmfoundation.org/policies/tiles/
 *
 * Todas as camadas são XYZ raster sem chave de API. A camada "sinóptico" não
 * usa rede nenhuma: é o contorno do IBGE embutido no pacote, e serve de rede
 * de segurança para o auditório onde a internet falhar.
 */

export const CAMADAS = [
  {
    id: 'ruas',
    nome: 'Ruas',
    url: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    atrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // O serviço padrão fornece tiles de 256 px; evita multiplicar pedidos em telas retina.
    detectRetina: false,
    zoomMax: 19,
    online: true,
  },
  {
    id: 'satelite',
    nome: 'Satélite',
    url: () =>
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    atrib: 'Imagens &copy; Esri, Maxar, Earthstar Geographics',
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
export const DOMINIOS_TILE = ['https://tile.openstreetmap.org', 'https://server.arcgisonline.com'];

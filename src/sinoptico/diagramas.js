/**
 * Especificação dos sinópticos.
 *
 * Declarativa de propósito: acrescentar uma unidade em topologia.js e uma
 * linha aqui basta para ela aparecer no diagrama, sem tocar em componente.
 *
 * As coordenadas são porcentagens do contêiner (0–100 em cada eixo). Os tubos
 * são ortogonais — cotovelo a 90°, nunca diagonal — porque é a convenção de
 * fluxograma de processo e porque diagonal em sinóptico lê como "ligação
 * lógica", não como tubulação.
 */

export const SINOPTICO_AGUA = {
  id: 'agua',
  nome: 'Sistema de abastecimento de água',
  altura: 540,
  nos: [
    { id: 'man-bqt', tipo: 'externo', x: 8, y: 8, rotulo: 'Rio Banqueta', sub: 'Manancial' },
    { id: 'cap-banqueta', tipo: 'unidade', x: 8, y: 30 },
    { id: 'eea-banqueta', tipo: 'unidade', x: 30, y: 18 },
    { id: 'res-banqueta', tipo: 'unidade', x: 53, y: 18 },
    { id: 'japuiba', tipo: 'setor', x: 78, y: 18 },
    { id: 'eea-japuiba', tipo: 'unidade', x: 35, y: 50 },
    { id: 'centro', tipo: 'setor', x: 70, y: 50 },
    { id: 'banqueta', tipo: 'setor', x: 8, y: 57 },
    { id: 'man-jcg', tipo: 'externo', x: 8, y: 84, rotulo: 'Rio Jacuecanga', sub: 'Manancial' },
    { id: 'cap-jacuecanga', tipo: 'unidade', x: 30, y: 84 },
    { id: 'jacuecanga', tipo: 'setor', x: 57, y: 84 },
    { id: 'ilha-grande', tipo: 'setor', x: 91, y: 84, nota: 'sistema local, sem telemetria' },
  ],
  tubos: [
    {
      de: 'man-bqt',
      para: 'cap-banqueta',
      pontos: [
        [8, 8],
        [8, 30],
      ],
      fonte: null,
    },
    {
      de: 'cap-banqueta',
      para: 'eea-banqueta',
      pontos: [
        [8, 30],
        [18, 30],
        [18, 18],
        [30, 18],
      ],
      fonte: 'eea-banqueta',
      rotulo: 'sucção DN 500',
    },
    {
      de: 'eea-banqueta',
      para: 'res-banqueta',
      pontos: [
        [30, 18],
        [53, 18],
      ],
      fonte: 'eea-banqueta',
      rotulo: 'recalque DN 400',
    },
    {
      de: 'res-banqueta',
      para: 'japuiba',
      pontos: [
        [53, 18],
        [78, 18],
      ],
      fonte: null,
      rotulo: 'Japuíba · Nova Angra · Belém · Ribeira',
    },
    {
      de: 'cap-banqueta',
      para: 'eea-japuiba',
      pontos: [
        [8, 30],
        [22, 30],
        [22, 50],
        [35, 50],
      ],
      fonte: 'eea-japuiba',
      rotulo: 'alimentação direta',
    },
    {
      de: 'eea-japuiba',
      para: 'centro',
      pontos: [
        [35, 50],
        [70, 50],
      ],
      fonte: 'eea-japuiba',
      rotulo: 'Centro · Balneário · Parque das Palmeiras',
      trecho: 'ad-jpb-centro',
    },
    {
      de: 'cap-banqueta',
      para: 'banqueta',
      pontos: [
        [8, 30],
        [8, 57],
      ],
      fonte: null,
      rotulo: 'gravidade',
    },
    {
      de: 'man-jcg',
      para: 'cap-jacuecanga',
      pontos: [
        [8, 84],
        [30, 84],
      ],
      fonte: null,
    },
    {
      de: 'cap-jacuecanga',
      para: 'jacuecanga',
      pontos: [
        [30, 84],
        [57, 84],
      ],
      fonte: 'cap-jacuecanga',
      rotulo: 'rede DN 250',
    },
  ],
};

export const SINOPTICO_ESGOTO = {
  id: 'esgoto',
  nome: 'Sistema de esgotamento sanitário',
  altura: 560,
  nos: [
    { id: 'centro', tipo: 'setor', x: 9, y: 18, papel: 'bacia' },
    { id: 'eee-anil', tipo: 'unidade', x: 32, y: 18 },
    { id: 'ete-chacara', tipo: 'unidade', x: 61, y: 18 },
    { id: 'japuiba-esgoto', tipo: 'setor', x: 9, y: 47, papel: 'bacia' },
    { id: 'ete-japuiba', tipo: 'unidade', x: 61, y: 47 },
    { id: 'bonfim', tipo: 'setor', x: 9, y: 70, papel: 'bacia' },
    { id: 'ete-bonfim', tipo: 'unidade', x: 61, y: 70 },
    { id: 'ilha-grande', tipo: 'setor', x: 9, y: 90, papel: 'bacia' },
    { id: 'ete-abraao', tipo: 'unidade', x: 34, y: 90 },
    {
      id: 'corpo-1',
      tipo: 'externo',
      x: 89,
      y: 18,
      rotulo: 'Baía da Ilha Grande',
      sub: 'Corpo receptor',
    },
    {
      id: 'corpo-2',
      tipo: 'externo',
      x: 89,
      y: 47,
      rotulo: 'Baía da Ilha Grande',
      sub: 'Corpo receptor',
    },
    {
      id: 'corpo-3',
      tipo: 'externo',
      x: 89,
      y: 70,
      rotulo: 'Baía da Ilha Grande',
      sub: 'Corpo receptor',
    },
    {
      id: 'corpo-4',
      tipo: 'externo',
      x: 62,
      y: 90,
      rotulo: 'Baía da Ilha Grande',
      sub: 'Corpo receptor',
    },
  ],
  tubos: [
    {
      de: 'centro',
      para: 'eee-anil',
      pontos: [
        [9, 18],
        [32, 18],
      ],
      fonte: null,
      rotulo: 'coletor-tronco DN 400',
      esgoto: true,
    },
    {
      de: 'eee-anil',
      para: 'ete-chacara',
      pontos: [
        [32, 18],
        [61, 18],
      ],
      fonte: 'eee-anil',
      rotulo: 'recalque DN 300',
      esgoto: true,
    },
    {
      de: 'japuiba-esgoto',
      para: 'ete-japuiba',
      pontos: [
        [9, 47],
        [61, 47],
      ],
      fonte: null,
      rotulo: 'coleta por gravidade',
      esgoto: true,
    },
    {
      de: 'bonfim',
      para: 'ete-bonfim',
      pontos: [
        [9, 70],
        [61, 70],
      ],
      fonte: null,
      rotulo: 'somente bairro Bonfim',
      esgoto: true,
    },
    {
      de: 'ete-chacara',
      para: 'corpo-1',
      pontos: [
        [61, 18],
        [89, 18],
      ],
      fonte: 'ete-chacara',
      rotulo: 'efluente tratado',
      esgoto: true,
    },
    {
      de: 'ete-japuiba',
      para: 'corpo-2',
      pontos: [
        [61, 47],
        [89, 47],
      ],
      fonte: 'ete-japuiba',
      rotulo: 'efluente tratado',
      esgoto: true,
    },
    {
      de: 'ete-bonfim',
      para: 'corpo-3',
      pontos: [
        [61, 70],
        [89, 70],
      ],
      fonte: 'ete-bonfim',
      rotulo: 'efluente tratado',
      esgoto: true,
    },
    {
      de: 'ilha-grande',
      para: 'ete-abraao',
      pontos: [
        [9, 90],
        [34, 90],
      ],
      fonte: null,
      esgoto: true,
    },
    {
      de: 'ete-abraao',
      para: 'corpo-4',
      pontos: [
        [34, 90],
        [62, 90],
      ],
      fonte: 'ete-abraao',
      esgoto: true,
    },
  ],
};

/** Caminho SVG ortogonal a partir de uma lista de vértices em porcentagem. */
export const caminhoTubo = (pontos) =>
  pontos.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

/** Ponto médio do traçado, para pousar o rótulo de vazão. */
export function meioTubo(pontos) {
  const i = Math.max(0, Math.floor((pontos.length - 1) / 2));
  const [x0, y0] = pontos[i];
  const [x1, y1] = pontos[Math.min(i + 1, pontos.length - 1)];
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

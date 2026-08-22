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
    { id: 'eea-banqueta', tipo: 'unidade', x: 30, y: 30 },
    { id: 'res-banqueta', tipo: 'unidade', x: 53, y: 30 },
    { id: 'eea-japuiba', tipo: 'unidade', x: 74, y: 30 },
    { id: 'japuiba', tipo: 'setor', x: 91, y: 30 },
    { id: 'centro', tipo: 'setor', x: 74, y: 57 },
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
        [30, 30],
      ],
      fonte: 'cap-banqueta',
      rotulo: 'sucção DN 500',
    },
    {
      de: 'eea-banqueta',
      para: 'res-banqueta',
      pontos: [
        [30, 30],
        [53, 30],
      ],
      fonte: 'eea-banqueta',
      rotulo: 'recalque DN 400',
    },
    {
      de: 'res-banqueta',
      para: 'eea-japuiba',
      pontos: [
        [53, 30],
        [74, 30],
      ],
      fonte: null,
      rotulo: 'adutora DN 300',
    },
    {
      de: 'eea-japuiba',
      para: 'japuiba',
      pontos: [
        [74, 30],
        [91, 30],
      ],
      fonte: 'eea-japuiba',
    },
    {
      de: 'res-banqueta',
      para: 'centro',
      pontos: [
        [53, 30],
        [53, 57],
        [74, 57],
      ],
      fonte: null,
      rotulo: 'adutora DN 350 · gravidade',
      trecho: 'ad-bqt-centro',
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
  altura: 480,
  nos: [
    { id: 'centro', tipo: 'setor', x: 9, y: 18, papel: 'bacia' },
    { id: 'eee-anil', tipo: 'unidade', x: 32, y: 18 },
    { id: 'japuiba', tipo: 'setor', x: 9, y: 45, papel: 'bacia' },
    { id: 'ete-chacara', tipo: 'unidade', x: 61, y: 31 },
    { id: 'ete-bonfim', tipo: 'unidade', x: 61, y: 66 },
    { id: 'ilha-grande', tipo: 'setor', x: 9, y: 90, papel: 'bacia' },
    { id: 'ete-abraao', tipo: 'unidade', x: 34, y: 90 },
    {
      id: 'corpo-1',
      tipo: 'externo',
      x: 89,
      y: 31,
      rotulo: 'Baía da Ilha Grande',
      sub: 'Corpo receptor',
    },
    {
      id: 'corpo-2',
      tipo: 'externo',
      x: 89,
      y: 66,
      rotulo: 'Baía da Ilha Grande',
      sub: 'Corpo receptor',
    },
    {
      id: 'corpo-3',
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
        [47, 18],
        [47, 31],
        [61, 31],
      ],
      fonte: 'eee-anil',
      rotulo: 'recalque DN 300',
      esgoto: true,
    },
    {
      de: 'japuiba',
      para: 'ete-chacara',
      pontos: [
        [9, 45],
        [47, 45],
        [47, 31],
        [61, 31],
      ],
      fonte: null,
      esgoto: true,
    },
    // Desce por x = 20 e não por x = 9: em x = 9 o traçado passaria por dentro
    // do nó de Japuíba, e tubo cruzando caixa de valor é ilegível.
    {
      de: 'centro',
      para: 'ete-bonfim',
      pontos: [
        [9, 18],
        [20, 18],
        [20, 66],
        [61, 66],
      ],
      fonte: null,
      rotulo: 'coletor-tronco DN 300',
      esgoto: true,
    },
    {
      de: 'ete-chacara',
      para: 'corpo-1',
      pontos: [
        [61, 31],
        [89, 31],
      ],
      fonte: 'ete-chacara',
      rotulo: 'efluente tratado',
      esgoto: true,
    },
    {
      de: 'ete-bonfim',
      para: 'corpo-2',
      pontos: [
        [61, 66],
        [89, 66],
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
      para: 'corpo-3',
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

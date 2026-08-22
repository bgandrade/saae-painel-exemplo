/**
 * Símbolos das unidades, no espírito da ISA-5.1 / ISO 14617.
 *
 * Forma antes de cor: um operador com deficiência de visão de cores precisa
 * distinguir captação de reservatório, e num telão visto de longe a silhueta
 * chega antes do matiz. Cor aqui identifica SISTEMA (água/esgoto), nunca
 * estado — estado é a borda e o rótulo.
 */

export const FORMAS = {
  captacao: (r) => `M0 ${-r * 1.15}L${r} ${r * 0.7}L${-r} ${r * 0.7}Z`,
  reservatorio: (r) => `M${-r * 0.92} ${-r * 0.92}H${r * 0.92}V${r * 0.92}H${-r * 0.92}Z`,
  elevatoria: (r) => `M0 ${-r}A${r} ${r} 0 1 1 0 ${r}A${r} ${r} 0 1 1 0 ${-r}Z`,
  ete: (r) =>
    `M0 ${-r * 1.2}L${r * 1.05} ${-r * 0.6}V${r * 0.6}L0 ${r * 1.2}L${-r * 1.05} ${r * 0.6}V${-r * 0.6}Z`,
  eee: (r) => `M0 ${-r * 1.2}L${r * 1.2} 0L0 ${r * 1.2}L${-r * 1.2} 0Z`,
};

export const ROTULO_FORMA = {
  captacao: 'Captação',
  reservatorio: 'Reservatório',
  elevatoria: 'Elevatória',
  ete: 'ETE',
  eee: 'Elevatória de esgoto',
};

/** SVG do símbolo como string, para uso dentro de um divIcon do Leaflet. */
export function svgSimbolo(tipo, sistema, r = 8) {
  const cor = sistema === 'esgoto' ? 'var(--esgoto)' : 'var(--agua)';
  const lado = (r + 4) * 2;
  return `<svg width="${lado}" height="${lado}" viewBox="${-r - 4} ${-r - 4} ${lado} ${lado}">
    <path d="${FORMAS[tipo](r)}" fill="${cor}" stroke="var(--superficie)" stroke-width="1.6"/>
  </svg>`;
}

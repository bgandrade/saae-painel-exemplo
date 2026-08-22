import { useEffect, useState } from 'react';

/**
 * Largura em px de um elemento, acompanhada por ResizeObserver.
 *
 * Os gráficos são desenhados em coordenadas de pixel, não em viewBox
 * esticada: é o que mantém a espessura do traço e o corpo do texto iguais
 * num cartão estreito e num telão de 4 m.
 */
export default function useLargura(ref, inicial = 600) {
  const [largura, setLargura] = useState(inicial);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => {
      const l = e.contentRect.width;
      if (l > 0) setLargura((antes) => (Math.abs(antes - l) > 1 ? l : antes));
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [ref]);
  return largura;
}

/**
 * Estado de interface compartilhado: qual unidade está aberta no drawer, qual
 * conjunto está aberto no faceplate, e o tema.
 *
 * Fica separado da simulação de propósito. A simulação é o processo; isto é a
 * janela. Misturar os dois faria o drawer reabrir sozinho a cada tique.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);

export function ProvedorUI({ children }) {
  const [unidadeAberta, setUnidadeAberta] = useState(null);
  const [bombaAberta, setBombaAberta] = useState(null);

  // Os quatro comandos precisam ser estáveis entre renderizações. O mapa
  // reconstrói seus marcadores quando `abrirUnidade` muda de identidade — e
  // sem useCallback ele os reconstruiria a cada abertura de drawer, piscando a
  // camada inteira e perdendo o enquadramento.
  const abrirUnidade = useCallback((u) => setUnidadeAberta(u), []);
  const fecharUnidade = useCallback(() => setUnidadeAberta(null), []);
  const abrirBomba = useCallback((id) => setBombaAberta(id), []);
  const fecharBomba = useCallback(() => setBombaAberta(null), []);

  const valor = useMemo(
    () => ({ unidadeAberta, bombaAberta, abrirUnidade, fecharUnidade, abrirBomba, fecharBomba }),
    [unidadeAberta, bombaAberta, abrirUnidade, fecharUnidade, abrirBomba, fecharBomba],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useUI = () => useContext(Ctx);

/** Rota por hash: `#/bombas`. Qualquer aba pode ser aberta por link direto. */
export function useRota(padrao) {
  const ler = useCallback(() => location.hash.match(/^#\/([\w-]+)/)?.[1] ?? padrao, [padrao]);
  const [rota, setRota] = useState(ler);
  useEffect(() => {
    const h = () => setRota(ler());
    addEventListener('hashchange', h);
    return () => removeEventListener('hashchange', h);
  }, [ler]);
  return rota;
}

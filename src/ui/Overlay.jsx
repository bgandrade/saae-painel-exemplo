/** Drawer lateral e modal, com véu e fechamento por Escape. */

import { useEffect } from 'react';
import Icone from './Icone.jsx';

function useEscape(aoFechar) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') aoFechar();
    };
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [aoFechar]);
}

export function Drawer({ titulo, sub, aoFechar, children }) {
  useEscape(aoFechar);
  return (
    <>
      <div className="veu" onClick={aoFechar} />
      <aside className="drawer" role="dialog" aria-modal="false" aria-label={titulo}>
        <div className="drawer-cab">
          <div style={{ minWidth: 0 }}>
            <div className="drawer-titulo">{titulo}</div>
            {sub && <div className="drawer-sub">{sub}</div>}
          </div>
          <button
            className="btn btn-icone"
            style={{ marginLeft: 'auto' }}
            aria-label="Fechar"
            onClick={aoFechar}
          >
            <Icone nome="x" />
          </button>
        </div>
        <div className="drawer-corpo">{children}</div>
      </aside>
    </>
  );
}

export function Modal({ titulo, sub, aoFechar, children, acoes, largo }) {
  useEscape(aoFechar);
  return (
    <>
      <div className="veu" onClick={aoFechar} />
      <div
        className={`modal${largo ? ' largo' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="modal-cab">
          <div style={{ minWidth: 0 }}>
            <div className="modal-titulo">{titulo}</div>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <div className="linha" style={{ marginLeft: 'auto' }}>
            {acoes}
            <button className="btn btn-icone" aria-label="Fechar" onClick={aoFechar}>
              <Icone nome="x" />
            </button>
          </div>
        </div>
        <div className="modal-corpo">{children}</div>
      </div>
    </>
  );
}

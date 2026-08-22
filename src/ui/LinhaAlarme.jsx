/**
 * Linha de alarme.
 * Severidade aparece como cor DA FAIXA + ícone + texto: nunca só cor.
 */

import { desde } from './formato.js';
import { Chip } from './componentes.jsx';
import Icone from './Icone.jsx';

export default function LinhaAlarme({ alarme: a, agora, aoReconhecer }) {
  return (
    <div className={`alarme ${a.info.severidade}${a.reconhecido ? ' reconhecido' : ''}`}>
      <i className="alarme-faixa" />
      <div className="alarme-txt">
        <div className="alarme-titulo">
          <Icone nome={a.info.severidade === 'info' ? 'info' : 'alerta'} tamanho={13} />
          {a.info.titulo}
        </div>
        <div className="alarme-meta">
          {a.info.origem} · {a.info.detalhe?.() ?? ''}
        </div>
      </div>
      <div className="alarme-dir">
        <span>{desde(a.desde, agora)}</span>
        {a.reconhecido ? (
          <Chip estado="ok" pequeno>
            Reconhecido
          </Chip>
        ) : (
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              aoReconhecer?.(a.chave);
            }}
          >
            Reconhecer
          </button>
        )}
      </div>
    </div>
  );
}

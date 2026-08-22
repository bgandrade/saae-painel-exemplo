/**
 * Montagem do painel: topbar, barra de estado, roteamento e controles globais.
 *
 * A hierarquia das abas segue a ISA-101: Visão Geral responde "está tudo bem?"
 * (nível 1), Sinóptico responde "por onde a água anda" (nível 2), Unidades e
 * Automação são onde se OPERA (nível 3) e Relatórios é consulta e diagnóstico
 * (nível 4). O selo de nível aparece na aba de propósito: é o que ensina a
 * plateia a ler a estrutura do sistema em vez de ver oito telas soltas.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProvedorSimulacao, useSim } from './hooks/useSimulacao.jsx';
import { ProvedorUI, useRota, useUI } from './hooks/useUI.jsx';
import { hora, dataLonga, num } from './ui/formato.js';
import { Chip, Vazio } from './ui/componentes.jsx';
import { Drawer } from './ui/Overlay.jsx';
import LinhaAlarme from './ui/LinhaAlarme.jsx';
import Icone from './ui/Icone.jsx';

import VisaoGeral from './views/VisaoGeral.jsx';
import Sinoptico from './views/Sinoptico.jsx';
import Unidades from './views/Unidades.jsx';
import Automacao from './views/Automacao.jsx';
import Rede from './views/Rede.jsx';
import Qualidade from './views/Qualidade.jsx';
import Esgoto from './views/Esgoto.jsx';
import Relatorios from './views/Relatorios.jsx';

import DrawerUnidade from './views/DrawerUnidade.jsx';
import FaceplateBomba from './bombas/FaceplateBomba.jsx';

const VIEWS = [
  { id: 'visao-geral', nome: 'Visão Geral', nivel: 1, Comp: VisaoGeral },
  { id: 'sinoptico', nome: 'Sinóptico', nivel: 2, Comp: Sinoptico },
  { id: 'unidades', nome: 'Unidades', nivel: 3, Comp: Unidades },
  { id: 'automacao', nome: 'Automação', nivel: 3, Comp: Automacao },
  { id: 'rede', nome: 'Rede e Pressão', nivel: 2, sistema: 'agua', Comp: Rede },
  { id: 'qualidade', nome: 'Qualidade', nivel: 2, sistema: 'agua', Comp: Qualidade },
  { id: 'esgoto', nome: 'Esgoto e ETEs', nivel: 2, sistema: 'esgoto', Comp: Esgoto },
  { id: 'relatorios', nome: 'Relatórios', nivel: 4, Comp: Relatorios },
];

const VELOCIDADES = [
  { v: 1, rot: '1×', titulo: 'Tempo real' },
  { v: 60, rot: '60×', titulo: '1 min de operação por segundo' },
  { v: 300, rot: '300×', titulo: '5 min de operação por segundo' },
];

const CHAVE_TEMA = 'saae-tema';

export default function App() {
  return (
    <ProvedorSimulacao>
      <ProvedorUI>
        <Painel />
      </ProvedorUI>
    </ProvedorSimulacao>
  );
}

function Painel() {
  const { sim, alarmes, tique } = useSim();
  const { unidadeAberta, bombaAberta } = useUI();
  const rota = useRota('visao-geral');
  const view = VIEWS.find((v) => v.id === rota) ?? VIEWS[0];

  const [tema, setTema] = useState(() => {
    const url = new URLSearchParams(location.search).get('tema');
    try {
      return url || localStorage.getItem(CHAVE_TEMA) || 'dark';
    } catch {
      return url || 'dark';
    }
  });
  const [painelAlarmes, setPainelAlarmes] = useState(false);
  const [quiosque, setQuiosque] = useState(false);
  const [rotacao, setRotacao] = useState(false);
  const [, forcar] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'light' ? 'light' : 'dark';
    try { localStorage.setItem(CHAVE_TEMA, tema); } catch { /* modo privativo */ }
  }, [tema]);

  useEffect(() => {
    document.title = `${view.nome} · SAAE Angra dos Reis`;
  }, [view.nome]);

  useEffect(() => {
    document.body.classList.toggle('quiosque', quiosque);
    if (quiosque) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, [quiosque]);

  // Rotação automática entre telas, para o painel rodar sozinho no telão.
  useEffect(() => {
    if (!rotacao) return;
    const id = setInterval(() => {
      const i = VIEWS.findIndex((v) => v.id === (location.hash.match(/^#\/([\w-]+)/)?.[1] ?? 'visao-geral'));
      location.hash = `#/${VIEWS[(i + 1) % VIEWS.length].id}`;
    }, 20000);
    return () => clearInterval(id);
  }, [rotacao]);

  const atalho = useCallback((e) => {
    if (e.target.matches('input, textarea, select')) return;
    const k = e.key.toLowerCase();
    if (k === 'f') setQuiosque((q) => !q);
    if (k === 'r') setRotacao((r) => !r);
    if (k === 'a') setPainelAlarmes((p) => !p);
    const n = Number(k);
    if (n >= 1 && n <= VIEWS.length) location.hash = `#/${VIEWS[n - 1].id}`;
  }, []);

  useEffect(() => {
    addEventListener('keydown', atalho);
    return () => removeEventListener('keydown', atalho);
  }, [atalho]);

  const c = alarmes.contagem;
  const emManual = sim.bombasEmManual.length;
  const malhasFora = [...sim.malhas.values()].filter((m) => m.modo === 'fora').length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="marca">
          <div className="marca-logo"><Icone nome="gota" tamanho={16} style={{ color: '#fff' }} /></div>
          <div className="marca-txt">
            <div className="marca-sigla">SAAE Angra dos Reis</div>
            <div className="marca-sub">Centro de Controle Operacional</div>
          </div>
        </div>

        <nav className="abas" aria-label="Telas do painel">
          {VIEWS.map((v) => (
            <a
              key={v.id} className="aba" href={`#/${v.id}`}
              aria-current={v.id === view.id ? 'page' : undefined}
            >
              {v.sistema && <i className={`aba-pt ${v.sistema}`} />}
              {v.nome}
              <span className="aba-nivel oculta-quiosque" title={`Nível ${v.nivel} da hierarquia ISA-101`}>
                N{v.nivel}
              </span>
            </a>
          ))}
        </nav>

        <div className="topbar-dir">
          <div className="segmentado oculta-quiosque" role="group" aria-label="Velocidade da simulação">
            {VELOCIDADES.map(({ v, rot, titulo }) => (
              <button
                key={v} type="button" title={titulo}
                aria-pressed={sim.velocidade === v}
                onClick={() => { sim.velocidade = v; forcar((x) => x + 1); }}
              >
                {rot}
              </button>
            ))}
          </div>

          <button
            className={`badge-alarmes${c.critico ? ' tem-critico' : c.alerta ? ' tem-alerta' : ''}${
              c.critico && c.naoReconhecidos ? ' pulsa' : ''
            }`}
            type="button" aria-label={`${c.total} alarmes ativos`}
            onClick={() => setPainelAlarmes(true)}
          >
            <Icone nome="alerta" tamanho={13} />
            <span className="badge-cont">{c.total}</span>
          </button>

          <div className="relogio">
            <div className="relogio-hora">{hora(sim.tempo)}</div>
            <div className="relogio-data oculta-quiosque">{dataLonga(sim.tempo)}</div>
          </div>

          <button
            className="btn btn-icone" type="button" aria-label="Alternar tema"
            onClick={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            <Icone nome={tema === 'dark' ? 'sol' : 'lua'} />
          </button>
          <button
            className="btn btn-icone" type="button" title="Modo quiosque — tecla F"
            aria-label="Modo quiosque" onClick={() => setQuiosque((q) => !q)}
          >
            <Icone nome="tela" />
          </button>
        </div>
      </header>

      <div className="barra-estado">
        <span className="estado-item destaque">
          <i className={`led ${c.critico ? 'critico' : c.alerta ? 'atencao' : 'on'}`} />
          Sistema <b>{c.critico ? 'em emergência' : c.alerta ? 'em atenção' : 'normal'}</b>
        </span>
        <span className="estado-item">
          <i className="led on" />
          CLPs <b>{sim.clps.length}/{sim.clps.length} online</b>
        </span>
        <span className="estado-item">Comunicação <b>estável · 0 falhas em 24 h</b></span>
        <span className="estado-item">
          <i className={`led ${emManual ? 'atencao' : ''}`} />
          Conjuntos em manual <b>{emManual}</b>
        </span>
        <span className="estado-item">
          <i className={`led ${malhasFora ? 'atencao' : ''}`} />
          Malhas fora de serviço <b>{malhasFora}</b>
        </span>
        <span className="estado-item oculta-quiosque">Operador <b>{sim.operador}</b></span>
        <span className="estado-item oculta-quiosque">
          Sincronismo <b>{hora(sim.tempo)}</b>
        </span>
        {rotacao && <span className="estado-item"><i className="led on" />Rotação automática</span>}
        <span className="selo-simulacao">
          <Icone nome="alerta" tamanho={11} />
          SIMULAÇÃO
        </span>
      </div>

      <main className="conteudo" key={view.id}>
        <view.Comp />
      </main>

      <footer className="rodape">
        <span className="rodape-aviso">
          <Icone nome="alerta" tamanho={11} />
          DADOS SIMULADOS — MAQUETE DEMONSTRATIVA
        </span>
        <span className="rodape-item oculta-quiosque">Contorno municipal: IBGE (malha 3300100)</span>
        <span className="rodape-item oculta-quiosque">
          Unidades: coordenadas SAAE · rede, setores e conjuntos estimados
        </span>
        <span className="espaco" />
        <span className="rodape-item oculta-quiosque">
          Atalhos: 1–8 telas · F quiosque · R rotação · A alarmes
        </span>
      </footer>

      {painelAlarmes && (
        <Drawer
          titulo="Alarmes ativos" sub="Ordenados por severidade e horário"
          aoFechar={() => setPainelAlarmes(false)}
        >
          <PainelAlarmes />
        </Drawer>
      )}
      {unidadeAberta && <DrawerUnidade unidade={unidadeAberta} />}
      {bombaAberta && <FaceplateBomba idBomba={bombaAberta} />}
    </div>
  );
}

function PainelAlarmes() {
  const { sim, alarmes } = useSim();
  const ativos = alarmes.ativos;
  const [, forcar] = useState(0);

  if (!ativos.length) {
    return <Vazio>Nenhum alarme ativo. Sistema em operação normal.</Vazio>;
  }
  return (
    <div>
      <div className="linha" style={{ marginBottom: 'var(--e3)' }}>
        <button
          className="btn"
          onClick={() => { alarmes.reconhecerTodos(); forcar((x) => x + 1); }}
        >
          Reconhecer todos
        </button>
        <span className="mut">{ativos.length} ativo(s)</span>
      </div>
      <div className="alarmes" style={{ border: '1px solid var(--borda)', borderRadius: 'var(--raio)' }}>
        {ativos.map((a) => (
          <LinhaAlarme
            key={a.chave} alarme={a} agora={sim.tempo}
            aoReconhecer={(ch) => { alarmes.reconhecer(ch); forcar((x) => x + 1); }}
          />
        ))}
      </div>
    </div>
  );
}

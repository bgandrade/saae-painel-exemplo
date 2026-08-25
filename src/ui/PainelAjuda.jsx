/**
 * Guia autônomo da maquete.
 *
 * Não entra na hierarquia ISA-101: explica a demonstração, a relação com a
 * proposta e os ensaios que um visitante pode reproduzir sem apresentador.
 */

import { CENARIOS } from '../engine/sim.js';
import Icone from './Icone.jsx';

const ETAPAS = [
  {
    id: 'Etapa 0',
    titulo: 'Digitalizar o registro',
    texto:
      'Leituras de laboratório e de campo ganham autor, horário, histórico e relatórios. A tela Qualidade demonstra o lançamento manual ao lado da telemetria.',
    rota: 'qualidade',
  },
  {
    id: 'Etapa 1',
    titulo: 'Digitalizar a medição',
    texto:
      'Instrumentos em linha passam a alimentar a mesma série histórica. Qualidade, Rede e Esgoto ilustram medições contínuas, tendências e alarmes.',
    rota: 'qualidade',
  },
  {
    id: 'Etapa 2',
    titulo: 'Automatizar',
    texto:
      'Controladores locais executam rodízio, limites de nível e intervalos entre partidas. As telas Unidades e Automação mostram essas regras em funcionamento.',
    rota: 'automacao',
  },
  {
    id: 'Etapa 3',
    titulo: 'Supervisionar e controlar',
    texto:
      'As unidades instrumentadas são vistas de forma centralizada. Qualquer comando continua condicionado a projeto, autorização e intertravamentos locais.',
    rota: 'visao-geral',
  },
];

const TELAS = [
  {
    rota: 'visao-geral',
    nivel: 'N1',
    nome: 'Visão Geral',
    texto: 'Situação do sistema, KPIs, mapa, alarmes e unidades que pedem atenção.',
  },
  {
    rota: 'sinoptico',
    nivel: 'N2',
    nome: 'Sinóptico',
    texto: 'Percurso da água e do esgoto entre captações, elevatórias, reservatórios e tratamento.',
  },
  {
    rota: 'unidades',
    nivel: 'N3',
    nome: 'Unidades',
    texto: 'Detalhes de estações, conjuntos motobomba, faceplates e sequência de rodízio.',
  },
  {
    rota: 'automacao',
    nivel: 'N3',
    nome: 'Automação',
    texto: 'Malhas, setpoints, regras, intertravamentos e trilha de comandos do operador.',
  },
  {
    rota: 'rede',
    nivel: 'N2',
    nome: 'Rede e Pressão',
    texto: 'Pressões por setor, níveis de reservatórios, demanda e balanço hídrico.',
  },
  {
    rota: 'qualidade',
    nivel: 'N2',
    nome: 'Qualidade',
    texto: 'Telemetria e verificação manual de parâmetros de qualidade da água.',
  },
  {
    rota: 'esgoto',
    nivel: 'N2',
    nome: 'Esgoto e ETEs',
    texto: 'Afluente, tratamento, remoção de carga orgânica e condições das elevatórias.',
  },
  {
    rota: 'relatorios',
    nivel: 'N4',
    nome: 'Relatórios',
    texto: 'Boletim operacional, indicadores, histórico e exportações em CSV e impressão.',
  },
];

const ENSAIOS = [
  {
    id: 'Etapa 0',
    titulo: 'Registrar uma verificação manual',
    passos: [
      'Abra Qualidade e localize “Verificação manual da medição em linha”.',
      'Informe o valor, responsável e uma observação e registre a verificação.',
      'Compare o lançamento com a medição automática: os dois registros convivem sem sobrescrita.',
    ],
    rota: 'qualidade',
    acao: 'Abrir Qualidade',
  },
  {
    id: 'D1',
    titulo: 'Setpoint ao vivo',
    passos: [
      'Abra Automação e encontre a malha da Elevatória Banqueta.',
      'Leve “chama bombeamento abaixo de” de 30 % para 55 %.',
      'Observe os conjuntos entrarem um a um e confira o valor antigo e o novo na trilha de comandos.',
    ],
    rota: 'automacao',
    acao: 'Abrir Automação',
  },
  {
    id: 'D2',
    titulo: 'Intertravamento',
    passos: [
      'Em Unidades, abra um conjunto da Elevatória Banqueta e passe-o para MANUAL.',
      'Com o nível de sucção baixo, tente partir o conjunto.',
      'O comando é recusado com o motivo na tela e uma linha BLOQUEADO na auditoria.',
    ],
    rota: 'unidades',
    acao: 'Abrir Unidades',
  },
  {
    id: 'D3',
    titulo: 'Rodízio automático',
    passos: [
      'Abra Unidades e localize “Sequência de rodízio” na Elevatória Banqueta.',
      'Compare as horas dos cinco conjuntos e identifique o conjunto LÍDER.',
      'A liderança passa ao conjunto menos utilizado e equilibra o desgaste ao longo do tempo.',
    ],
    rota: 'unidades',
    acao: 'Ver o rodízio',
  },
  {
    id: 'D4',
    titulo: 'Falha e recuperação',
    passos: [
      'Abra SIMULAÇÃO e dispare “Falha em conjunto da Elevatória Banqueta”.',
      'Acompanhe a sobrecorrente, o desarme, o alarme crítico e a entrada automática da reserva.',
      'Normalize o cenário e depois abra o conjunto em falha para REARMAR: retirar a causa não rearma um relé automaticamente.',
    ],
    simulacao: true,
    acao: 'Abrir SIMULAÇÃO',
  },
];

const OBSERVACAO_CENARIO = {
  rompimento: 'Observe a perda de pressão, o balanço hídrico e os alarmes do trecho afetado.',
  'queda-energia': 'Observe a indisponibilidade temporária e a entrada do grupo gerador.',
  'cloro-baixo': 'Observe a tendência de cloro e o alerta de qualidade fora da faixa.',
  sobrecarga: 'Observe o desarme, a entrada da reserva e a necessidade de rearme manual.',
  chuva: 'Observe a elevação das vazões de esgoto e o risco nos poços e ETEs.',
  'pico-feriado': 'Observe o aumento de demanda, as partidas e a resposta dos reservatórios.',
};

function BotaoNavegar({ rota, children, aoNavegar }) {
  return (
    <button className="btn" type="button" onClick={() => aoNavegar?.(rota)}>
      {children}
      <Icone nome="seta" />
    </button>
  );
}

export default function PainelAjuda({ aoNavegar, aoAbrirSimulacao }) {
  return (
    <div className="ajuda">
      <section className="ajuda-intro" aria-labelledby="ajuda-comecar">
        <div>
          <span className="ajuda-sobretitulo">Guia da maquete demonstrativa</span>
          <h2 id="ajuda-comecar">Comece aqui</h2>
          <p>
            Este painel mostra como registro digital, telemetria, automação e supervisão podem
            trabalhar juntos. Explore as telas ou reproduza os ensaios abaixo: o modelo continua
            rodando enquanto você navega.
          </p>
        </div>
        <div className="ajuda-alerta">
          <Icone nome="alerta" tamanho={18} />
          <div>
            <strong>Todos os valores operacionais são simulados.</strong>
            <span>
              A maquete não está conectada a equipamentos ou sistemas do SAAE e não representa uma
              implantação concluída.
            </span>
          </div>
        </div>
        <div className="ajuda-controles" aria-label="Controles da demonstração">
          <div>
            <strong>SIMULAÇÃO</strong>
            <span>Pausa, cenários e relógio em 1×, 60× ou 300×.</span>
          </div>
          <div>
            <strong>Alarmes</strong>
            <span>O triângulo no cabeçalho abre os alarmes ativos.</span>
          </div>
          <div>
            <strong>Apresentação</strong>
            <span>Tema claro/escuro, tela cheia e rotação automática.</span>
          </div>
          <div>
            <strong>Atalhos</strong>
            <span>1–8 telas · F quiosque · R rotação · A alarmes.</span>
          </div>
        </div>
      </section>

      <section className="ajuda-secao" aria-labelledby="ajuda-proposta">
        <div className="ajuda-secao-cab">
          <div>
            <span className="ajuda-sobretitulo">Relação com a proposta técnica</span>
            <h2 id="ajuda-proposta">Da coleta ao controle centralizado</h2>
          </div>
          <p>
            A implantação proposta avança em etapas independentes. A maquete reúne conceitos de
            todas elas para tornar o resultado visível, mas não indica que essas etapas já foram
            executadas no município.
          </p>
        </div>
        <div className="ajuda-etapas">
          {ETAPAS.map((etapa) => (
            <article className="ajuda-etapa" key={etapa.id}>
              <span>{etapa.id}</span>
              <h3>{etapa.titulo}</h3>
              <p>{etapa.texto}</p>
              <BotaoNavegar rota={etapa.rota} aoNavegar={aoNavegar}>
                Ver na maquete
              </BotaoNavegar>
            </article>
          ))}
        </div>
      </section>

      <section className="ajuda-secao" aria-labelledby="ajuda-telas">
        <div className="ajuda-secao-cab">
          <div>
            <span className="ajuda-sobretitulo">Conheça as oito telas</span>
            <h2 id="ajuda-telas">Uma pergunta operacional por nível</h2>
          </div>
          <p>
            Os níveis N1–N4 seguem a hierarquia ISA-101: visão geral primeiro, detalhe operacional
            depois e consulta histórica por último.
          </p>
        </div>
        <div className="ajuda-telas">
          {TELAS.map((tela) => (
            <article className="ajuda-tela" key={tela.rota}>
              <span className="ajuda-nivel">{tela.nivel}</span>
              <div>
                <h3>{tela.nome}</h3>
                <p>{tela.texto}</p>
              </div>
              <BotaoNavegar rota={tela.rota} aoNavegar={aoNavegar}>
                Abrir
              </BotaoNavegar>
            </article>
          ))}
        </div>
      </section>

      <section className="ajuda-secao" aria-labelledby="ajuda-ensaios">
        <div className="ajuda-secao-cab">
          <div>
            <span className="ajuda-sobretitulo">Ensaios guiados</span>
            <h2 id="ajuda-ensaios">Veja o comportamento, não apenas a tela</h2>
          </div>
          <p>
            Os históricos, alarmes e respostas surgem do mesmo modelo que roda ao vivo. Use 60× para
            acelerar tendências sem mudar as regras do processo.
          </p>
        </div>
        <div className="ajuda-ensaios">
          {ENSAIOS.map((ensaio) => (
            <article className="ajuda-ensaio" key={ensaio.id}>
              <div className="ajuda-ensaio-cab">
                <span>{ensaio.id}</span>
                <h3>{ensaio.titulo}</h3>
              </div>
              <ol>
                {ensaio.passos.map((passo) => (
                  <li key={passo}>{passo}</li>
                ))}
              </ol>
              {ensaio.simulacao ? (
                <button className="btn primario" type="button" onClick={aoAbrirSimulacao}>
                  {ensaio.acao}
                  <Icone nome="engrenagem" />
                </button>
              ) : (
                <BotaoNavegar rota={ensaio.rota} aoNavegar={aoNavegar}>
                  {ensaio.acao}
                </BotaoNavegar>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="ajuda-secao" aria-labelledby="ajuda-cenarios">
        <div className="ajuda-secao-cab">
          <div>
            <span className="ajuda-sobretitulo">Cenários e limites</span>
            <h2 id="ajuda-cenarios">Seis perturbações para explorar</h2>
          </div>
          <p>
            Disparar inicia uma transição gradual; Normalizar remove a causa. Efeitos persistentes,
            como um relé desarmado, ainda exigem a ação prevista do operador.
          </p>
        </div>
        <div className="ajuda-cenarios">
          {CENARIOS.map((cenario) => (
            <article className="ajuda-cenario" key={cenario.id}>
              <span className={`ajuda-severidade ${cenario.severidade}`}>{cenario.severidade}</span>
              <h3>{cenario.nome}</h3>
              <p>{cenario.resumo}</p>
              <small>{OBSERVACAO_CENARIO[cenario.id]}</small>
            </article>
          ))}
        </div>
        <button className="btn primario" type="button" onClick={aoAbrirSimulacao}>
          Abrir cenários da SIMULAÇÃO
          <Icone nome="engrenagem" />
        </button>

        <div className="ajuda-limites">
          <h3>O que é real, aproximado e simulado</h3>
          <dl>
            <div>
              <dt>Referências reais</dt>
              <dd>Contorno municipal do IBGE e nomes e localizações de algumas unidades.</dd>
            </div>
            <div>
              <dt>Aproximado ou estimado</dt>
              <dd>
                Cadeias operacionais, capacidades, vazões, bombas, setpoints, setores e traçados.
              </dd>
            </div>
            <div>
              <dt>Simulado</dt>
              <dd>
                Todas as medições, históricos, alarmes, estados, comandos e respostas dos cenários.
              </dd>
            </div>
            <div>
              <dt>Definição futura</dt>
              <dd>
                A configuração real depende de levantamento de campo, projeto, segurança,
                autorização e procedimentos operacionais.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

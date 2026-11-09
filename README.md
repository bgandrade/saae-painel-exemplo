# Proposta de Digitalização, Automação e Controle Operacional

**Saneamento de Angra dos Reis · Portfólio de Bruno Andrade**

Iniciativa pessoal de **Bruno Andrade**, desenvolvida e apresentada como proposta ao **SAAE de Angra
dos Reis**. Este repositório preserva o trabalho de concepção e planejamento técnico como portfólio:
diagnóstico, estratégia de implantação gradual, arquitetura, critérios de escolha de equipamentos,
hipóteses econômicas e limites de execução.

O documento central é a **[proposta técnica](docs/proposta-tecnica.md)**. A demonstração interativa
é material de apoio para explorar alguns dos conceitos de supervisão e automação propostos.

**[Ler a proposta em PDF](docs/proposta-tecnica.pdf)** ·
**[Consultar a proposta em Markdown](docs/proposta-tecnica.md)**

A proposta foi originalmente elaborada em **agosto de 2026** e é preservada como referência
histórica. É um trabalho de autoria pessoal: não constitui iniciativa institucional, sistema oficial
ou projeto implantado pelo SAAE, nem pressupõe aprovação ou adoção pela autarquia. Não substitui
levantamento de campo, projeto executivo ou responsabilidade técnica.

## O problema estudado

O ponto de partida é a rotina operacional conhecida pelo autor até 2020, complementada por
referências públicas: leituras pontuais, registros em papel, consolidação manual e informações
dispersas entre campo, laboratório e operação. Essas premissas precisam ser verificadas antes de
qualquer adoção; não são um diagnóstico da situação atual do SAAE.

A proposta examina como transformar esses registros em histórico estruturado e, progressivamente,
incorporar medição contínua, automação local e supervisão centralizada.

## Abordagem proposta

Cada etapa deve produzir uma entrega útil antes do avanço para a seguinte:

| Etapa                         | Objetivo                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **0 — Registro digital**      | Estruturar leituras de campo e laboratório com autoria, horário, histórico e relatórios.                 |
| **1 — Medição contínua**      | Integrar instrumentos ao mesmo histórico, preservando a convivência com leituras manuais.                |
| **2 — Automação local**       | Introduzir regras de operação em unidades selecionadas, preservando proteções físicas e autonomia local. |
| **3 — Supervisão e controle** | Centralizar a visualização e considerar comandos remotos onde houver projeto, segurança e autorização.   |

As decisões técnicas priorizam padrões abertos, separação entre campo, comunicação, servidor e
interface, dados sob controle da autarquia e proteções críticas independentes do software de
supervisão. Protocolos, tecnologias e equipamentos são referências para avaliação, não
especificações executivas ou escolhas já implantadas.

## O que este trabalho reúne

- Diagnóstico de referência e definição de uma sequência de implantação com entregas independentes.
- Arquitetura de aquisição, comunicação, armazenamento, serviços e interface, com critérios de
  escolha.
- Referências de instrumentação, bombeamento e controle, incluindo barreiras para comando remoto.
- Hipóteses de custos e benefícios, riscos, continuidade, responsabilidades e necessidades de campo.
- Uma demonstração implementada para tornar parte da proposta explorável e permitir ensaios
  reproduzíveis.

Esses materiais apresentam o raciocínio técnico e as decisões de concepção do autor. As estimativas
são baseadas em premissas declaradas; não representam orçamento formal, economia comprovada ou
resultados de uma implantação.

## Materiais do portfólio

| Material                                                              | Conteúdo                                                                                                   |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Proposta técnica — PDF](docs/proposta-tecnica.pdf)                   | Documento completo para leitura e compartilhamento, com capa, sumário e paginação.                         |
| [Proposta técnica — Markdown](docs/proposta-tecnica.md)               | Fonte principal do trabalho, com diagnóstico, etapas, arquitetura, equipamentos, estimativas e limitações. |
| [Demonstração interativa](https://saae-painel.pages.dev/)             | Simulador de apoio aos conceitos da proposta, sem ligação com equipamentos reais.                          |
| [Guia da demonstração](docs/guia-demonstracao.md)                     | Telas, ensaios reproduzíveis, cenários e funcionamento do motor.                                           |
| [Referências da proposta](docs/proposta-tecnica.md#anexo-iii--fontes) | Bibliografia e fontes consultadas na elaboração do documento.                                              |

## Demonstração de apoio

**[Explorar a demonstração interativa](https://saae-painel.pages.dev/)**

A aplicação simula abastecimento de água e esgotamento sanitário no contexto do estudo de caso. Ela
permite explorar bombeamento, reservação, rede, qualidade e tratamento de esgoto. Todos os valores
operacionais são simulados; não há conexão com equipamentos ou sistemas reais. A existência da
demonstração não significa que a arquitetura completa descrita na proposta tenha sido implementada.

### Recursos da demonstração

- Oito telas: visão geral, sinóptico, unidades, automação, rede e pressão, qualidade, esgoto e
  relatórios.
- Bombas em AUTO/MANUAL, rodízio por horas, partidas escalonadas, intertravamentos e auditoria em
  memória.
- Alarmes com banda morta, cenários de falha e simulação determinística com velocidade ajustável.
- Registro de leitura manual ao lado da telemetria simulada, gráficos, exportação CSV e impressão.
- Mapa com camadas de ruas, satélite e contorno municipal local, temas claro/escuro e modo quiosque.

O [guia da demonstração](docs/guia-demonstracao.md) explica as telas, os ensaios e o motor. O botão
de ajuda do painel também orienta a exploração sem apresentador. A implementação usa React, Vite e
Leaflet, com um motor de simulação em JavaScript; ela ilustra parte dos conceitos da proposta.

## Executar a demonstração localmente

Requisitos: Node.js **24.15.0** (fixado em `mise.toml`) e pnpm **11.3.0** (fixado em
`package.json`). O [mise](https://mise.jdx.dev/) é opcional se o Node já estiver instalado. Instale
o pnpm nessa versão caso ele ainda não esteja disponível.

```bash
mise install # se utilizar mise
pnpm install --frozen-lockfile
pnpm dev    # http://localhost:5173
```

Não são necessárias chaves de API, credenciais, banco de dados ou arquivo `.env`.

```bash
pnpm build   # gera dist/
pnpm preview # serve o pacote de produção localmente
```

### Controles da demonstração

| Tecla   | Ação                                         |
| ------- | -------------------------------------------- |
| `1`–`8` | Selecionar tela                              |
| `F`     | Alternar modo quiosque                       |
| `R`     | Alternar rotação de telas a cada 20 segundos |
| `A`     | Abrir alarmes                                |

O botão **SIMULAÇÃO** controla pausa, cenários e velocidades 1×, 60× e 300×. O parâmetro
`?tema=light` força o tema claro.

## Verificações

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm build
```

`pnpm check` valida inclusão das coordenadas no município e referências da topologia, renderização
das telas, ensaios do motor e resumos operacionais do mapa. A renderização usa jsdom e não substitui
inspeção visual no navegador. O GitHub Actions executa essas verificações e a geração HTML da
proposta, sem publicar o site.

Use `pnpm format` e `pnpm lint:fix` para corrigir formatação e problemas estáticos aplicáveis.

## Atualizar a proposta e o PDF

```bash
pnpm documento:html # dist/documentos/proposta-tecnica.html
pnpm documento:pdf  # docs/proposta-tecnica.pdf (versionado)
```

A geração do PDF requer Chromium ou Google Chrome. O gerador procura os executáveis em
`/usr/bin/chromium`, `/usr/bin/chromium-browser` e `/usr/bin/google-chrome`. Para outro caminho, use
`CHROMIUM_BIN=/caminho/do/chrome pnpm documento:pdf`.

O Markdown e a [folha de impressão](docs/proposta-tecnica.impressao.css) são as fontes do documento.
Após alterá-los, gere o PDF, confira capa, tabelas, links e sumário e inclua o PDF atualizado no
mesmo commit das fontes. HTML e PDF intermediário ficam em `dist/documentos/`, ignorados pelo Git. O
PDF final fica em `docs/` e não integra o build do site.

## Estrutura do repositório e da demonstração

| Diretório                                                   | Responsabilidade                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/engine/`                                               | Simulação, comandos e alarmes em módulos ES independentes de React |
| `src/data/`                                                 | Topologia demonstrativa e contorno municipal do IBGE               |
| `src/views/`, `src/ui/`, `src/hooks/`                       | Telas, componentes e estado compartilhado                          |
| `src/bombas/`, `src/charts/`, `src/mapa/`, `src/sinoptico/` | Visualizações e interação                                          |
| `tools/`                                                    | Verificadores, geração de documento e obtenção da malha            |
| `docs/`                                                     | Proposta, PDF, guia e fontes/créditos                              |

React e Vite compõem a aplicação estática; Leaflet apresenta o mapa. O motor usa uma semente para
reproduzir os ensaios. Consulte o guia para modificar unidades e entender as malhas.

## Limitações da demonstração e serviços externos

- Todas as medições, capacidades, comandos, alarmes e cenários são simulados. O modelo é didático,
  sem validação para controle de instalações, dimensionamento ou avaliação de conformidade
  normativa.
- Nomes de unidades usam referências reais; suas localizações são aproximadas, levantadas em mapas
  públicos. Estar dentro da malha municipal não confirma a posição exata nem um cadastro oficial.
  Redes, setores e características de equipamentos são estimativas.
- Registros e auditoria ficam em memória durante a sessão, sem backend, autenticação ou persistência
  operacional. Preferências de tema e convite da ajuda usam armazenamento local do navegador.
- Ruas e satélite fazem requisições a OpenStreetMap e Esri, respectivamente. Esses provedores
  recebem os dados normais das requisições do navegador. Sem acesso aos tiles, o mapa pode usar o
  contorno local do IBGE; não há download de tiles para uso offline.
- O mapa mantém tiles já visitados até quatro linhas/colunas além da área visível e carrega novos
  tiles durante o arraste, inclusive no celular. O cache HTTP segue os cabeçalhos dos provedores.
  Essa retenção ajuda ao voltar por áreas visitadas; não antecipa áreas ainda não vistas, pois o
  servidor público do OpenStreetMap
  [não permite prefetch](https://operations.osmfoundation.org/policies/tiles/).
- Os serviços externos têm condições próprias e não oferecem disponibilidade garantida pela
  aplicação. As atribuições devem permanecer visíveis. Veja a
  [política de uso do OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) e os
  [créditos do serviço Esri](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer).

## Hospedar a demonstração

No Cloudflare Pages, configure `pnpm build` como comando de build e `dist` como diretório de saída.
O arquivo `public/_headers` define cache e cabeçalhos de segurança para esse serviço. Em outras
hospedagens estáticas, configure cabeçalhos equivalentes; `_headers` não é aplicado universalmente.
O build usa a raiz `/` e a navegação usa hash, como `#/unidades`.

O build publica apenas o simulador. A proposta e seu PDF são consultados pelo repositório.

## Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para discutir a proposta, relatar problemas e propor
alterações na documentação ou na demonstração. Contribuições devem preservar o contexto da proposta,
o caráter demonstrativo do software, a identificação da autoria e os créditos. Não há compromisso de
suporte, prazo de resposta ou evolução para um sistema operacional.

## Licença

Código e documentação autorais de Bruno Andrade estão sob a [licença MIT](LICENSE). Dados,
bibliotecas e materiais de terceiros mantêm suas próprias condições e não são relicenciados pela MIT
deste projeto. O histórico foi preservado e contém materiais antigos com pendências de permissão de
redistribuição. A MIT não concede autorização sobre esses materiais.

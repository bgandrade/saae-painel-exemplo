# Simulador de Saneamento — Angra dos Reis

**Iniciativa pessoal de Bruno Andrade, desenvolvida como proposta ao SAAE de Angra dos Reis.**

Demonstração interativa de supervisão e automação para abastecimento de água e esgotamento
sanitário, com simulação de bombeamento, reservação, rede, qualidade e tratamento de esgoto. O
contexto de Angra dos Reis é usado como estudo de caso.

**Este não é um sistema oficial do SAAE, um projeto implantado ou uma iniciativa institucional da
autarquia.** A publicação preserva o trabalho e a proposta para estudo e reutilização, sem presumir
aprovação ou adoção. Não há conexão com equipamentos ou sistemas reais.

**[Abrir a demonstração](https://saae-painel.pages.dev/)**

## Proposta técnica

**[Ler a proposta em PDF](docs/proposta-tecnica.pdf)** ·
[Consultar o Markdown](docs/proposta-tecnica.md)

Documento de autoria pessoal apresentado ao SAAE, originalmente elaborado em agosto de 2026 e
preservado como referência histórica. Reúne diagnóstico, etapas de digitalização e automação,
arquitetura, equipamentos, estimativas e limitações. As premissas e referências são datadas; o
documento não comprova aprovação ou implantação e não substitui levantamento de campo ou projeto
executivo.

## Funcionalidades

- Oito telas: visão geral, sinóptico, unidades, automação, rede e pressão, qualidade, esgoto e
  relatórios.
- Bombas em AUTO/MANUAL, rodízio por horas, partidas escalonadas, intertravamentos e auditoria em
  memória.
- Alarmes com banda morta, cenários de falha e simulação determinística com velocidade ajustável.
- Registro de leitura manual ao lado da telemetria simulada, gráficos, exportação CSV e impressão.
- Mapa com camadas de ruas, satélite e contorno municipal local, temas claro/escuro e modo quiosque.

O [guia da demonstração](docs/guia-demonstracao.md) explica as telas, os ensaios e o motor. O botão
de ajuda do painel também orienta a exploração sem apresentador.

## Executar localmente

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

### Controles

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

## Arquitetura e dados

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

## Limitações e serviços externos

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
- Os serviços externos têm condições próprias e não oferecem disponibilidade garantida pela
  aplicação. As atribuições devem permanecer visíveis. Veja
  [fontes e créditos](docs/fontes-e-creditos.md).

## Hospedagem

No Cloudflare Pages, configure `pnpm build` como comando de build e `dist` como diretório de saída.
O arquivo `public/_headers` define cache e cabeçalhos de segurança para esse serviço. Em outras
hospedagens estáticas, configure cabeçalhos equivalentes; `_headers` não é aplicado universalmente.
O build usa a raiz `/` e a navegação usa hash, como `#/unidades`.

O build publica apenas o simulador. A proposta e seu PDF são consultados pelo repositório.

## Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para relatar problemas e propor alterações. Contribuições
devem preservar o caráter demonstrativo, a identificação da autoria e os créditos. Não há
compromisso de suporte, prazo de resposta ou evolução para um sistema operacional.

## Licença

Código e documentação autorais de Bruno Andrade estão sob a [licença MIT](LICENSE). Dados,
bibliotecas e materiais de terceiros mantêm suas próprias condições e não são relicenciados pela MIT
deste projeto. O histórico foi preservado e contém materiais antigos com pendências de permissão de
redistribuição, detalhadas em [fontes e créditos](docs/fontes-e-creditos.md).

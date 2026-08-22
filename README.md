# Painel de Controle SAAE Angra dos Reis

Maquete demonstrativa de um sistema de **supervisão e automação** para os
sistemas de abastecimento de água e esgotamento sanitário de Angra dos Reis,
feita para ser projetada como se fosse o telão de uma sala de controle.

**Todos os dados são simulados.** Nada aqui se conecta a equipamento real. O
que é real é o comportamento: os números saem de um modelo hidráulico e
elétrico, e as malhas de controle são as mesmas que um CLP executaria.

O que a maquete demonstra, em uma frase: **dá para controlar bombas, monitorar
a rede e emitir relatórios de forma centralizada** — e os comandos do operador
passam por intertravamento antes de chegar ao equipamento.

---

## Rodando

O projeto fixa o Node.js pelo [mise](https://mise.jdx.dev/):

```bash
mise install
pnpm install
pnpm dev # http://localhost:5173
```

Para publicar:

```bash
pnpm build        # gera dist/
pnpm preview      # confere o pacote de produção
```

### Verificação automática

```bash
pnpm lint         # análise estática com ESLint
pnpm format:check # confere a formatação com Prettier
pnpm check        # roda os três verificadores funcionais abaixo
```

Use `pnpm lint:fix` para aplicar correções seguras do ESLint e `pnpm format`
para formatar o projeto.

| Comando            | O que confere                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check:geo`   | cada coordenada cai dentro do município (malha IBGE) e todas as referências entre unidades, bombas, setores e linhas fecham |
| `pnpm check:telas` | as 8 telas e o faceplate renderizam sem erro e contêm o conteúdo esperado                                                   |
| `pnpm check:demos` | as quatro demonstrações do roteiro funcionam de ponta a ponta                                                               |

`check:telas` renderiza as telas fora do navegador (jsdom + SSR do Vite), então
roda em máquina sem as bibliotecas de sistema do Chromium. Ele não valida
layout — valida que o JavaScript roda de ponta a ponta e que o conteúdo
prometido está lá, que é onde moram os erros capazes de estragar uma
apresentação.

### Atalhos na apresentação

| Tecla   | Ação                                          |
| ------- | --------------------------------------------- |
| `1`–`8` | salta direto para cada tela                   |
| `F`     | modo quiosque (tela cheia, cromo enxuto)      |
| `R`     | rotação automática entre as telas a cada 20 s |
| `A`     | abre o painel de alarmes                      |

O seletor **1× / 60× / 300×** controla a velocidade do relógio simulado. A 60×
cada segundo real vale um minuto de operação, o que faz a curva de consumo
diária aparecer durante a fala. `?tema=light` na URL força o tema claro.

---

## As oito telas

A navegação segue a hierarquia de quatro níveis da **ISA-101** — o selo `N1`…`N4`
aparece em cada aba de propósito, para ensinar a estrutura a quem está vendo.

| Nível | Tela           | Papel                                                      |
| ----- | -------------- | ---------------------------------------------------------- |
| **1** | Visão Geral    | Está tudo bem? Onde olhar? KPIs, mapa, alarmes, cenários   |
| **2** | Sinóptico      | Como a água anda pelo sistema — diagramas de água e esgoto |
| **3** | Unidades       | A estação por dentro: barriletes, conjuntos, faceplates    |
| **3** | Automação      | Malhas, setpoints, regras, intertravamentos, auditoria     |
| **2** | Rede e Pressão | Pressão por setor, reservatórios, balanço hídrico          |
| **2** | Qualidade      | Cloro, pH, turbidez e fluoreto vs. GM/MS 888/2021          |
| **2** | Esgoto e ETEs  | Afluente, remoção de DBO, CONAMA 430/2011                  |
| **4** | Relatórios     | Boletim, indicadores SNIS, histórico, CSV e PDF            |

---

## O roteiro de demonstração

Quatro momentos, na ordem em que convencem. `pnpm check:demos` verifica os
quatro no motor — se passarem lá, funcionam no auditório.

### D1 — Setpoint ao vivo

Em **Automação**, arraste _"chama bombeamento abaixo de"_ de 30 % para 55 %. Em
segundos os conjuntos entram, **um a um**, respeitando o intervalo mínimo entre
partidas. A auditoria registra o ajuste com o valor antigo e o novo.

> _"Ninguém precisou ir até a Banqueta."_

### D2 — Intertravamento

Em **Unidades**, abra um conjunto, passe para **MANUAL** e tente parti-lo com o
nível de sucção baixo. O comando é **recusado**, com o motivo escrito na tela e
a linha `BLOQUEADO` na trilha de auditoria.

> _"O sistema protege o equipamento até de um comando errado do operador."_

### D3 — Rodízio automático

Em **Unidades → Sequência de rodízio**: as barras de horas dos cinco conjuntos
da Elevatória Banqueta ficam praticamente iguais — dispersão abaixo de 1 %
depois de uma semana — e o contador mostra quando o líder passa a vez.

### D4 — Falha e recuperação

Dispare o cenário de **sobrecarga** na Visão Geral. O relé 51 desarma o
conjunto, sobe alarme crítico, **um conjunto parado entra sozinho no lugar** e a
pressão do setor não cruza o mínimo da NBR 12218.

> _"Isso aconteceria às três da manhã sem acordar ninguém."_

Normalizar o cenário remove a causa, **não o desarme**: relé de sobrecorrente
não rearma sozinho. O conjunto fica em falha até alguém apertar `REARMAR` no
faceplate — o que rende mais uma linha na auditoria e mais um argumento.

`pnpm check:demos` dispara este cenário em **seis horários diferentes** do
dia. É a verificação mais importante do conjunto: a versão anterior escolhia o
conjunto sobrecarregado só na Captação Banqueta, que fica parada metade do dia,
e disparar o cenário na hora errada não produzia sintoma nenhum.

---

## O que é real e o que é estimado

Isto importa se alguém na plateia conhecer o sistema.

|                                                         | Origem                                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Contorno do município                                   | **Real** — malha do IBGE, código 3300100, qualidade máxima (46 polígonos, incluindo a Ilha Grande e 44 ilhas menores) |
| Coordenadas das 9 unidades                              | **Reais** — fornecidas pelo SAAE, verificadas uma a uma contra a malha do IBGE                                        |
| Cadeia Captação → Elevatória → Reservatório da Banqueta | **Real** — a arquitetura foi corrigida conforme a operação descrita, com os 5 conjuntos da elevatória                 |
| Traçado de adutoras e coletores                         | **Estimado** — desenhado entre as coordenadas reais para dar leitura de rede                                          |
| Setores de abastecimento                                | **Estimados** — áreas e populações plausíveis, não o cadastro do SAAE                                                 |
| Bombas, capacidades, vazões, setpoints                  | **Estimados** — dimensionados para que o sistema fique realista sob carga                                             |
| Todas as medições                                       | **Simuladas** — geradas pelo modelo em `src/engine/sim.js`                                                            |

A interface declara isso: o rodapé traz o aviso permanente de maquete, a barra
de estado carrega o selo `SIMULAÇÃO`, o mapa traz a nota de origem e o
relatório impresso sai com o aviso em caixa no cabeçalho.

---

## Como a simulação funciona

O princípio: **nada é roteirizado.** O que se vê na tela emerge do modelo.

- **Curva de demanda diária** com mínimo às 4 h e picos às 7 h e 19 h,
  normalizada para média 1,0.
- **Reservatórios** integram `dV = (Q_entrada − Q_saída)·dt`.
- **Cadeia da Banqueta**: a captação enche a câmara de carga por histerese; a
  elevatória de 5 conjuntos puxa da câmara e recalca para o reservatório,
  observando o nível do **destino** e travando na **sucção**; o reservatório
  abastece o Centro por gravidade e Japuíba via elevatória.
- **Número de conjuntos** sai da vazão que o reservatório está entregando, não
  de um número fixo — por isso o painel mostra dois conjuntos de madrugada e
  até cinco no pico das 7 h.
- **Rodízio por totalizador de horas**: parte sempre o conjunto que acumulou
  menos horas. O desgaste se equaliza sozinho (dispersão < 1 % em uma semana),
  enquanto o horímetro de vida — que traz a idade de cada bomba — continua
  diferente, como num parque real.
- **Partida escalonada**: nunca duas partidas na mesma unidade dentro do
  intervalo mínimo, para não dar pico de demanda no quadro nem golpe de aríete.
- **Proteção anti short-cycling**: nenhum conjunto é parado antes de cumprir o
  tempo mínimo de operação, e os degraus de emergência têm banda morta própria.
  Sem isso, o nível passeando em cima de um setpoint fazia o conjunto extra
  entrar e sair a cada minuto — 26 partidas num dia numa bomba de 150 CV, que
  é exatamente o defeito que um engenheiro na plateia identifica de longe.
- **Pressão** cai com o quadrado da vazão, desaba quando o bombeamento não cobre
  a demanda e sofre quando o reservatório de montante esvazia.
- **Cloro** decai por tempo de residência na rede, então o ponto de consumo
  sempre lê menos que a saída da unidade de produção.
- **Esgoto** chega às ETEs cerca de três horas depois do consumo de água
  correspondente. As duas curvas do gráfico "consumo × chegada" saem do mesmo
  modelo.

As **24 h de histórico** que aparecem no primeiro segundo são geradas rodando o
mesmo motor 1440 vezes antes da tela abrir (mais 3 h de aquecimento, que o
buffer circular descarta). Não existe um gerador de dados falsos paralelo que
pudesse divergir do comportamento ao vivo.

Tudo é semeado por string: a mesma seed produz sempre a mesma sequência, e a
apresentação pode ser ensaiada e repetida sem surpresa.

### Comando e intertravamento

`src/engine/control.js` é a camada que separa supervisão de dashboard: um
comando de operador pode ser **recusado**, com motivo, e a recusa fica
registrada.

- cada conjunto tem chave **AUTO / MANUAL** — em manual ele sai do alcance da
  malha, e o símbolo ganha contorno tracejado por isso;
- `podeComandar()` devolve `{ permitido, motivo }`, e a interface usa o mesmo
  texto para desabilitar o botão e para escrever a linha da auditoria — não há
  como as duas divergirem;
- intertravamentos ativos: afogamento (sucção baixa), escalonamento de partidas,
  tempo mínimo de operação, conjunto desarmado, conjunto em manutenção,
  vibração e temperatura de mancal;
- os setpoints vivem em `sim.malhas`, editáveis pela tela de Automação. O
  cadastro em `topologia.js` guarda apenas os valores de partida.

### Alarmes

O motor em `src/engine/alarms.js` tem banda morta e atraso de confirmação: a
condição precisa se sustentar alguns segundos para virar alarme e precisa
recuar bem abaixo do limite para sair. Sem isso, um valor passeando em cima do
limite geraria dezenas de alarmes por minuto — o que na sala de controle real
se chama **avalanche**, e é o motivo de operador aprender a ignorar painel. Em
operação normal o painel fica em zero alarmes, inclusive rodando a 300×. A tela
de Relatórios mostra a taxa de alarmes comparada à meta da **EEMUA 191**.

### Cenários

Seis, todos com entrada e saída em rampa suave:

| Cenário                                 | O que aparece no painel                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rompimento da adutora Banqueta → Centro | Pressão do Centro abaixo do mínimo, trecho piscando no mapa e no sinóptico, alarme crítico                                                                                                                    |
| Falta de energia na Elevatória Japuíba  | Pressão desaba, gerador assume em ~90 s e recupera parcialmente                                                                                                                                               |
| Cloro fora de faixa em Jacuecanga       | Cloro residual abaixo de 0,2 mg/L na saída e na rede                                                                                                                                                          |
| Sobrecarga em conjunto motobomba        | Corrente, vibração e mancal sobem até o desarme pelo relé 51. O cenário escolhe sozinho um conjunto **que esteja girando**, então funciona a qualquer hora do dia — e o desarme só sai com rearme do operador |
| Chuva intensa                           | ETEs em sobrecarga hidráulica, OD despenca, poço do Anil sobe                                                                                                                                                 |
| Pico de consumo de feriado              | Demanda 35 % acima, reservatórios drenando mais rápido                                                                                                                                                        |

---

## Decisões de interface

As referências não são gosto — são o que a indústria de automação padronizou.

- **ISA-101** — hierarquia de quatro níveis de tela, filosofia de HMI.
- **High Performance HMI** — tela em escala de cinza, **cor saturada reservada
  para condição anormal**. Em operação normal o painel é quase monocromático; e
  é por isso que, quando o cenário dispara, a coisa vermelha atrai a sala.
  Consequências concretas: a barra de saúde de um conjunto normal é **cinza**,
  não verde, e os chips de situação das unidades ficam neutros até haver
  desvio. Cinco barras verdes lado a lado treinariam a plateia a ignorar
  exatamente o canal que precisa gritar quando a vibração subir.
- **ISA-18.2 / EEMUA 191** — banda morta, atraso de confirmação, meta de taxa.
- **ISA-5.1 / ISO 14617** — simbologia de bomba, reservatório e instrumento.
- **SNIS** — `IN049`, `IN058`, `IN022` e `IN046` calculados direto das séries.

### Os cinco fatos de um conjunto motobomba

A decisão de projeto mais importante da maquete. Na tela da estação, cada bomba
carrega **cinco fatos e nada mais** — amontoar corrente, tensão, cos φ, rpm,
horímetro e vibração em cinco cartões lado a lado é o erro clássico, e o
operador não consegue comparar cinco bombas assim.

1. **Estado** — forma, preenchimento e rótulo textual. Nunca só cor.
2. **Modo AUTO/MANUAL** — em manual a bomba não está protegida pela malha.
3. **Papel na sequência** — `LÍDER` / `SEG-n` / `RESERVA-n`. É o que torna cinco
   bombas legíveis em vez de cinco caixas iguais.
4. **Vazão** e, com inversor, a rotação.
5. **Saúde** — uma barra, o pior entre corrente, vibração e mancal.

Todo o resto vive no **faceplate**, que abre no clique: as três fases e o
desequilíbrio (NEMA MG-1), cos φ, kW, rpm, vibração com a faixa ISO 10816-3,
temperatura de mancal, horímetro, e a **curva H×Q com o ponto de operação** —
o gráfico que mais separa um HMI de bombeamento de um dashboard genérico,
porque diz se a bomba trabalha _onde deve_, não só se está ligada.

### O mapa

A versão anterior desenhava tudo em SVG à mão, e o preço aparecia nos rótulos:
`<text>` soltos, sem detecção de colisão, sobrepostos em qualquer zoom. A
correção foi estrutural — **a lista própria de localidades deixou de existir** e
quem rotula é o basemap, que já traz Japuíba, Jacuecanga, Banqueta e Vila do
Abraão com tipografia e colisão profissionais.

| Camada    | Fonte                                         | Quando                           |
| --------- | --------------------------------------------- | -------------------------------- |
| Ruas      | CARTO Dark Matter / Positron (XYZ, sem chave) | padrão, segue o tema             |
| Satélite  | Esri World Imagery                            | mostra o relevo e a orla         |
| Sinóptico | contorno IBGE embutido                        | leitura esquemática e _fallback_ |

CARTO em vez do OpenStreetMap padrão porque o OSM colorido briga com um painel
de sala de controle escuro, enquanto o Dark Matter foi desenhado exatamente
para ficar por baixo de sobreposição de dados.

**Se os tiles não carregarem em 3,5 s, o mapa cai sozinho para o contorno do
IBGE** e avisa na tela. O auditório sem rede continua funcionando. Para deixar
o painel 100 % offline de propósito, basta remover os dois domínios de
[`public/_headers`](public/_headers).

---

## Acrescentando uma unidade

Toda a topologia vive em [`src/data/topologia.js`](src/data/topologia.js).
Acrescente uma linha em `UNIDADES`:

```js
{
  id: 'cap-nova', nome: 'Captação Rio Novo', sigla: 'CAP-NOV',
  tipo: 'captacao',            // captacao | reservatorio | elevatoria | ete | eee
  lat: -22.95, lon: -44.31,
  bairro: 'Nome do bairro', confirmada: true, clp: 'CLP-08',
  vazaoNominalLs: 100, capacidadeM3: 1000, nivelInicialPct: 60,
  setores: ['centro'],
  malha: { tipo: 'nivel', descricao: '...', ligaPct: 30, desligaPct: 85,
           emergenciaPct: 15, escalonamentoS: 15 },
}
```

e, se ela tiver conjuntos motobomba, as linhas correspondentes em `BOMBAS`
apontando para esse `id`. O mapa, os indicadores, a lista de ativos, a tela de
automação e o motor de simulação passam a incluí-la — **nenhum outro arquivo
precisa ser tocado**, exceto o sinóptico, que é declarativo em
[`src/sinoptico/diagramas.js`](src/sinoptico/diagramas.js) e recebe um nó e um
tubo.

Depois, rode `pnpm check`.

Para regerar o contorno do município a partir do IBGE:

```bash
python3 tools/fetch_malha.py
```

---

## Publicando (Cloudflare Pages)

_Build command_ `pnpm build`, _output directory_ `dist`.

```bash
pnpm build && pnpm dlx wrangler pages deploy dist
```

ou conectar o repositório e deixar cada push publicar.
[`public/_headers`](public/_headers) já traz cache longo para os assets com
hash, revalidação do `index.html` e a CSP. O roteamento é por hash (`#/bombas`),
então não é preciso regra de reescrita para SPA e qualquer aba pode ser aberta
por link direto.

---

## Estrutura

```
index.html                       shell do Vite
vite.config.js                   build, sem configuração exótica
public/_headers                  cache e CSP do Cloudflare Pages

src/
  main.jsx  App.jsx              topbar, barra de estado, rota, atalhos
  engine/
    sim.js                       motor de simulação — física e malhas
    control.js                   comandos, intertravamentos, regras, curva H×Q
    alarms.js                    motor de alarmes com banda morta
    rng.js                       PRNG determinístico e ruído com reversão à média
  data/
    topologia.js                 unidades, bombas, setores, linhas ← é aqui que se mexe
    angra-geo.js                 malha do IBGE (gerado — não editar à mão)
  hooks/                         simulação compartilhada, estado de interface, largura
  ui/                            Card, Kpi, Chip, Drawer, Modal, formatação pt-BR
  charts/                        linha, gauge, gantt, sparkline, curva H×Q — sem biblioteca
  mapa/                          Leaflet, camadas, símbolos ISA
  sinoptico/                     diagramas declarativos de água e esgoto
  bombas/                        símbolo, faceplate, painel de sequência
  views/                         as oito telas
  estilos/                       tokens, layout, painéis, impressão

tools/
  check_geo.mjs                  coordenadas e referências
  check_telas.mjs                renderização e conteúdo das telas
  check_demos.mjs                as quatro demonstrações
  ambiente.mjs                   DOM mínimo para os verificadores
  fetch_malha.py                 baixa a malha do IBGE
```

O motor (`engine/`) e os dados (`data/`) não dependem de React nem de DOM: são
módulos ES puros, testáveis por linha de comando, e é por isso que
`check_demos.mjs` consegue verificar o roteiro inteiro sem abrir navegador.

---

## O que viria depois

Deixado de fora desta maquete de propósito, mas é a estrada à frente:

- **Programação horária e tarifa de ponta** — inibir bombeamento das 18 h às
  21 h e antecipar reservação. É o argumento financeiro mais forte que existe,
  e o motor já rastreia energia por conjunto.
- Integração real por **Modbus TCP / DNP3 / OPC UA** com os CLPs existentes.
- Aplicativo de campo para a equipe de manutenção.
- Ordem de serviço automática disparada por horímetro ou por vibração.

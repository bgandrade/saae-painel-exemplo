# Painel de Controle SAAE Angra dos Reis

Maquete demonstrativa de um sistema de supervisão e automação para os sistemas
de **abastecimento de água** e **esgotamento sanitário** de Angra dos Reis,
feita para ser projetada como se fosse o telão de uma sala de controle.

**Todos os dados são simulados.** Nada aqui se conecta a equipamento real. O
que é real é o comportamento: os números saem de um modelo hidráulico e
elétrico, não de curvas desenhadas à mão.

Site estático puro — HTML, CSS e JavaScript, sem build, sem backend e **sem
nenhuma requisição externa**: abre num auditório sem internet.

---

## Rodando

ES modules exigem servir por HTTP (abrir o `index.html` direto pelo sistema de
arquivos não funciona, por causa da política de origem):

```bash
python3 -m http.server 8000
# depois: http://localhost:8000
```

### Atalhos úteis na apresentação

| Tecla | Ação |
|---|---|
| `1`–`5` | salta direto para cada tela |
| `F` | modo quiosque (tela cheia, topbar enxuta) |
| `R` | rotação automática entre as telas a cada 20 s |

O seletor **1× / 60× / 300×** controla a velocidade do relógio simulado. A
60× cada segundo real vale um minuto de operação, o que faz a curva de consumo
diária aparecer durante a fala. `?tema=light` na URL força o tema claro.

---

## As cinco telas

1. **Visão Geral** — indicadores macro, mapa interativo das unidades, alarmes
   ativos e os botões de cenário.
2. **Bombas e Motores** — por conjunto motobomba: corrente, tensão nas três
   fases, rotação, potência, fator de potência, vibração, temperatura de
   mancal e horímetro; timeline de operação de 24 h.
3. **Rede e Pressão** — pressão por setor, reservatórios e balanço hídrico.
4. **Qualidade da Água** — cloro residual, pH, turbidez e fluoreto, com as
   faixas da Portaria GM/MS nº 888/2021.
5. **Esgoto e ETEs** — vazão afluente, remoção de DBO e conformidade com a
   Resolução CONAMA nº 430/2011; poço da elevatória do Anil.

---

## O que é real e o que é estimado

Isto importa se alguém na plateia conhecer o sistema:

| | Origem |
|---|---|
| Contorno do município | **Real** — malha do IBGE, código 3300100, qualidade máxima (46 polígonos, incluindo a Ilha Grande e 44 ilhas menores) |
| Coordenadas das 9 unidades | **Reais** — fornecidas pelo SAAE, verificadas uma a uma contra a malha do IBGE |
| Traçado de adutoras e coletores | **Estimado** — desenhado entre as coordenadas reais para dar leitura de rede |
| Setores de abastecimento | **Estimados** — áreas e populações plausíveis, não o cadastro do SAAE |
| Bombas, capacidades, vazões | **Estimadas** — dimensionadas para que o sistema fique realista sob carga |
| Todas as medições | **Simuladas** — geradas pelo modelo em `assets/js/sim.js` |

A interface declara isso: o rodapé traz o aviso permanente de maquete e o mapa
carrega a nota "contorno IBGE · rede e setores estimados".

---

## Acrescentando uma unidade

Toda a topologia vive em [`assets/data/topologia.js`](assets/data/topologia.js).
Acrescente uma linha em `UNIDADES`:

```js
{
  id: 'cap-nova', nome: 'Captação Rio Novo', sigla: 'CAP-NOV',
  tipo: 'captacao',            // captacao | reservatorio | elevatoria | ete | eee
  lat: -22.95, lon: -44.31,
  bairro: 'Nome do bairro', confirmada: true, clp: 'CLP-08',
  vazaoNominalLs: 100, capacidadeM3: 1000, nivelInicialPct: 60,
  setores: ['centro'],
}
```

e, se ela tiver conjuntos motobomba, as linhas correspondentes em `BOMBAS`
apontando para esse `id`. O mapa, os indicadores, a lista de ativos e o motor
de simulação passam a incluí-la — **nenhum outro arquivo precisa ser tocado.**

Depois, rode o validador:

```bash
node tools/check_geo.mjs
```

Ele confere que cada coordenada cai dentro do município (é o que pega sinal
trocado ou latitude e longitude invertidas, que no mapa apareceriam como um
marcador solto no oceano) e que todas as referências entre unidades, bombas e
setores fecham.

Para regerar o contorno do município a partir do IBGE:

```bash
python3 tools/fetch_malha.py
```

---

## Como a simulação funciona

O princípio: **nada é roteirizado.** O que se vê na tela emerge do modelo.

- **Curva de demanda diária** com mínimo às 4 h e picos às 7 h e 19 h,
  normalizada para média 1,0.
- **Reservatórios** integram `dV = (Q_entrada − Q_saída)·dt`. As bombas ligam
  e desligam por histerese de nível (30 % / 85 %) — a timeline de operação de
  24 h da tela de bombas é consequência disso, não de uma agenda.
- **Rodízio de conjuntos** por tempo de descanso, com troca da bomba líder a
  cada 12 h contínuas. O horímetro se equaliza sozinho ao longo dos dias.
- **Pressão** cai com o quadrado da vazão e desaba quando o bombeamento não
  cobre a demanda — é por isso que a queda de energia derruba a pressão de
  Japuíba e o grupo gerador só a recupera em parte, com um conjunto só.
- **Cloro** decai por tempo de residência na rede, então o ponto de consumo
  sempre lê menos que a saída da unidade de produção.
- **Esgoto** chega às ETEs cerca de três horas depois do consumo de água
  correspondente — 2,5 h de percurso na rede mais o tempo da caixa de chegada.
  As duas curvas do gráfico "consumo × chegada" saem do mesmo modelo.

As **24 h de histórico** que aparecem no primeiro segundo são geradas rodando
o mesmo motor 1440 vezes antes da tela abrir (mais 3 h de aquecimento, que o
buffer circular descarta). Não existe um gerador de dados falsos paralelo que
pudesse divergir do comportamento ao vivo.

Tudo é semeado por string, então a mesma seed produz sempre a mesma sequência:
a apresentação pode ser ensaiada e repetida sem surpresa.

### Alarmes

O motor em `assets/js/alarms.js` tem banda morta e atraso de confirmação: a
condição precisa se sustentar alguns segundos para virar alarme e precisa
recuar bem abaixo do limite para sair. Sem isso, um valor passeando em cima do
limite geraria dezenas de alarmes por minuto — o que na sala de controle real
se chama avalanche, e é o motivo de operador aprender a ignorar painel. Em
operação normal o painel fica em zero alarmes, inclusive rodando a 300×.

### Cenários

Seis, todos com entrada e saída em rampa suave:

| Cenário | O que aparece no painel |
|---|---|
| Rompimento da adutora Banqueta → Centro | Pressão do Centro abaixo do mínimo, trecho piscando no mapa, alarme crítico |
| Falta de energia na Elevatória Japuíba | Pressão desaba, gerador assume em ~90 s e recupera parcialmente: crítico vira alerta sustentado |
| Cloro fora de faixa em Jacuecanga | Cloro residual abaixo de 0,2 mg/L na saída e na rede |
| Sobrecarga em conjunto da Captação Banqueta | Corrente, vibração e mancal sobem até o desarme por sobrecorrente |
| Chuva intensa | ETEs em sobrecarga hidráulica, OD despenca, poço do Anil sobe |
| Pico de consumo de feriado | Demanda 35 % acima, reservatórios drenando mais rápido |

O cenário de sobrecarga escolhe no disparo um conjunto que esteja realmente
girando — sobrecarregar bomba parada não produziria sintoma nenhum.

---

## Publicando (Cloudflare Pages)

Sem etapa de build: *build command* vazio, *output directory* `/`.

```bash
npx wrangler pages deploy .
```

ou conectar o repositório e deixar cada push publicar. O arquivo
[`_headers`](_headers) já traz cache longo para `assets/*`, revalidação do
`index.html` e uma CSP que proíbe qualquer origem externa. O roteamento é por
hash (`#/bombas`), então não é preciso regra de reescrita para SPA e qualquer
aba pode ser aberta por link direto.

---

## Estrutura

```
index.html                     shell: topbar, abas, rodapé
assets/css/tokens.css          paleta (validada para daltonismo), tipografia, espaçamento
assets/css/app.css             layout e componentes
assets/data/angra-geo.js       malha do IBGE (gerado — não editar à mão)
assets/data/topologia.js       unidades, bombas, setores, linhas ← é aqui que se mexe
assets/js/rng.js               PRNG determinístico e ruído com reversão à média
assets/js/sim.js               motor de simulação
assets/js/alarms.js            motor de alarmes
assets/js/charts.js            gráficos em SVG, sem biblioteca
assets/js/map.js               mapa vetorial, projeção Mercator, pan/zoom
assets/js/ui.js                componentes e formatação pt-BR
assets/js/views/*.js           as cinco telas
tools/fetch_malha.py           baixa a malha do IBGE
tools/check_geo.mjs            valida coordenadas e referências
```

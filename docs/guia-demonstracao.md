# Guia da demonstração e do motor de simulação

Iniciativa pessoal de Bruno Andrade, desenvolvida como proposta ao SAAE de Angra dos Reis. Não é um
sistema oficial ou implantado. Todos os valores operacionais são simulados.

[Apresentação e instalação](../README.md) · [Proposta técnica](proposta-tecnica.md)

## As oito telas

A navegação segue a hierarquia de quatro níveis da **ISA-101** — o selo `N1`…`N4` aparece em cada
aba de propósito, para ensinar a estrutura a quem está vendo.

| Nível | Tela           | Papel                                                      |
| ----- | -------------- | ---------------------------------------------------------- |
| **1** | Visão Geral    | Está tudo bem? Onde olhar? KPIs, mapa, alarmes e unidades  |
| **2** | Sinóptico      | Como a água anda pelo sistema — diagramas de água e esgoto |
| **3** | Unidades       | A estação por dentro: barriletes, conjuntos, faceplates    |
| **3** | Automação      | Malhas, setpoints, regras, intertravamentos, auditoria     |
| **2** | Rede e Pressão | Pressão por setor, reservatórios, balanço hídrico          |
| **2** | Qualidade      | Telemetria e verificação manual vs. GM/MS 888/2021         |
| **2** | Esgoto e ETEs  | Afluente, remoção de DBO, CONAMA 430/2011                  |
| **4** | Relatórios     | Boletim, indicadores SNIS, histórico, CSV e PDF            |

---

## O roteiro de demonstração

Quatro momentos, na ordem em que convencem. `pnpm check:demos` verifica o registro da Etapa 0 e os
quatro no motor — se passarem lá, funcionam no auditório.

### D1 — Setpoint ao vivo

Em **Automação**, arraste _"chama bombeamento abaixo de"_ de 30 % para 55 %. Em segundos os
conjuntos entram, **um a um**, respeitando o intervalo mínimo entre partidas. A auditoria registra o
ajuste com o valor antigo e o novo.

> _"Ninguém precisou ir até a Banqueta."_

### D2 — Intertravamento

Em **Unidades**, abra um conjunto, passe para **MANUAL** e tente parti-lo com o nível de sucção
baixo. O comando é **recusado**, com o motivo escrito na tela e a linha `BLOQUEADO` na trilha de
auditoria.

> _"O sistema protege o equipamento até de um comando errado do operador."_

### D3 — Rodízio automático

Em **Unidades → Sequência de rodízio**: as barras de horas dos cinco conjuntos da Elevatória
Banqueta ficam praticamente iguais — dispersão abaixo de 10 % depois de uma semana — e o contador
mostra quando o líder passa a vez.

### D4 — Falha e recuperação

Abra **SIMULAÇÃO** na barra de estado e dispare o cenário de **falha na Elevatória Banqueta**. O
relé 51 desarma um conjunto da estação, sobe alarme crítico, **um conjunto parado entra sozinho no
lugar** e a pressão do setor não cruza o mínimo da NBR 12218.

> _"Isso aconteceria às três da manhã sem acordar ninguém."_

Normalizar o cenário remove a causa, **não o desarme**: relé de sobrecorrente não rearma sozinho. O
conjunto fica em falha até alguém apertar `REARMAR` no faceplate — o que rende mais uma linha na
auditoria e mais um argumento.

`pnpm check:demos` dispara este cenário em **seis horários diferentes** do dia e confirma que o
conjunto afetado pertence sempre à Elevatória Banqueta. Se a estação estiver em repouso, o ensaio
coloca dois conjuntos em operação antes de aplicar a falha.

---

## O que é real e o que é estimado

A maquete não reproduz um cadastro operacional validado pelo SAAE.

|                                                         | Origem                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contorno do município                                   | **Real** — malha do IBGE, código 3300100, qualidade máxima (46 polígonos, incluindo a Ilha Grande e 44 ilhas menores)                                          |
| Nomes e localização das unidades                        | **Referências públicas** — nomes de unidades existentes e localizações aproximadas; a verificação contra a malha do IBGE confirma apenas inclusão no município |
| Quantidade de unidades                                  | **Recorte** — o SAAE atende o município inteiro e opera muito mais que estas 10; a maquete usa um subconjunto                                                  |
| Cadeia Captação → Elevatória → Reservatório da Banqueta | **Aproximada** — a arquitetura reflete a operação como era conhecida; os 5 conjuntos da elevatória são estimativa de memória, com anos de defasagem            |
| Traçado de adutoras e coletores                         | **Estimado** — desenhado entre as coordenadas aproximadas para dar leitura de rede                                                                             |
| Setores de abastecimento                                | **Estimados** — áreas e populações plausíveis, não o cadastro do SAAE                                                                                          |
| Bombas, capacidades, vazões, setpoints                  | **Estimados** — dimensionados para que o sistema fique realista sob carga                                                                                      |
| Todas as medições                                       | **Simuladas** — geradas pelo modelo em `src/engine/sim.js`                                                                                                     |

A interface declara isso: o rodapé traz o aviso permanente de maquete, a barra de estado carrega o
selo `SIMULAÇÃO`, o mapa traz a nota de origem e o relatório impresso sai com o aviso em caixa no
cabeçalho.

---

## Como a simulação funciona

O princípio: **nada é roteirizado.** O que se vê na tela emerge do modelo.

- **Curva de demanda diária** com mínimo às 4 h e picos às 7 h e 19 h, normalizada para média 1,0.
- **Reservatórios** integram `dV = (Q_entrada − Q_saída)·dt`.
- **Cadeia da Banqueta**: a captação alimenta diretamente a EEA Japuíba, que abastece Centro,
  Balneário e Parque das Palmeiras. Em paralelo, a Elevatória Banqueta recalca para o reservatório,
  que abastece Japuíba, Nova Angra, Belém e Ribeira.
- **Número de conjuntos** sai da vazão que o reservatório está entregando, não de um número fixo —
  por isso o painel mostra dois conjuntos de madrugada e até cinco no pico das 7 h.
- **Rodízio por totalizador de horas**: parte sempre o conjunto que acumulou menos horas. O desgaste
  se equaliza sozinho (dispersão < 10 % em uma semana), enquanto o horímetro de vida — que traz a
  idade de cada bomba — continua diferente, como num parque real.
- **Partida escalonada**: nunca duas partidas na mesma unidade dentro do intervalo mínimo, para não
  dar pico de demanda no quadro nem golpe de aríete.
- **Proteção anti short-cycling**: nenhum conjunto é parado antes de cumprir o tempo mínimo de
  operação, e os degraus de emergência têm banda morta própria. Sem isso, o nível passeando em cima
  de um setpoint fazia o conjunto extra entrar e sair a cada minuto — 26 partidas num dia numa bomba
  de 150 CV, que é exatamente o defeito que um engenheiro na plateia identifica de longe.
- **Pressão** cai com o quadrado da vazão, desaba quando o bombeamento não cobre a demanda e sofre
  quando o reservatório de montante esvazia.
- **Cloro** decai por tempo de residência na rede, então o ponto de consumo sempre lê menos que a
  saída da unidade de produção.
- **Esgoto** chega às ETEs cerca de três horas depois do consumo de água correspondente. As duas
  curvas do gráfico "consumo × chegada" saem do mesmo modelo.

As **24 h de histórico** que aparecem no primeiro segundo são geradas rodando o mesmo motor 1440
vezes antes da tela abrir (mais 3 h de aquecimento, que o buffer circular descarta). Não existe um
gerador de dados falsos paralelo que pudesse divergir do comportamento ao vivo.

Tudo é semeado por string: a mesma seed produz sempre a mesma sequência, e a apresentação pode ser
ensaiada e repetida sem surpresa.

Na tela **Qualidade**, uma leitura laboratorial pode ser lançada ao lado da medição automática do
mesmo instante. A maquete mantém autor, horário, observação e diferença entre os valores durante a
sessão, deixando explícito que a persistência e a autenticação pertencem ao futuro sistema de
serviços.

### Comando e intertravamento

`src/engine/control.js` é a camada que separa supervisão de dashboard: um comando de operador pode
ser **recusado**, com motivo, e a recusa fica registrada.

- cada conjunto tem chave **AUTO / MANUAL** — em manual ele sai do alcance da malha, e o símbolo
  ganha contorno tracejado por isso;
- `podeComandar()` devolve `{ permitido, motivo }`, e a interface usa o mesmo texto para desabilitar
  o botão e para escrever a linha da auditoria — não há como as duas divergirem;
- intertravamentos ativos: afogamento (sucção baixa), escalonamento de partidas, tempo mínimo de
  operação, conjunto desarmado, conjunto em manutenção, vibração e temperatura de mancal;
- os setpoints vivem em `sim.malhas`, editáveis pela tela de Automação. O cadastro em `topologia.js`
  guarda apenas os valores de partida.

### Alarmes

O motor em `src/engine/alarms.js` tem banda morta e atraso de confirmação: a condição precisa se
sustentar alguns segundos para virar alarme e precisa recuar bem abaixo do limite para sair. Sem
isso, um valor passeando em cima do limite geraria dezenas de alarmes por minuto — o que na sala de
controle real se chama **avalanche**, e é o motivo de operador aprender a ignorar painel. Em
operação normal o painel fica em zero alarmes, inclusive rodando a 300×. A tela de Relatórios mostra
a taxa de alarmes comparada à meta da **EEMUA 191**.

### Cenários

Seis, todos com entrada e saída em rampa suave:

| Cenário                                    | O que aparece no painel                                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Rompimento da adutora EEA Japuíba → Centro | Pressão do Centro abaixo do mínimo, trecho piscando no mapa e no sinóptico, alarme crítico                                                |
| Falta de energia na Elevatória Japuíba     | Pressão desaba, gerador assume em ~90 s e recupera parcialmente                                                                           |
| Cloro fora de faixa em Jacuecanga          | Cloro residual abaixo de 0,2 mg/L na saída e na rede                                                                                      |
| Falha em conjunto da Elevatória Banqueta   | Corrente, vibração e mancal sobem até o desarme pelo relé 51. A reserva assume automaticamente, e o desarme só sai com rearme do operador |
| Chuva intensa                              | ETEs em sobrecarga hidráulica, OD despenca, poço do Anil sobe                                                                             |
| Pico de consumo de feriado                 | Demanda 35 % acima, reservatórios drenando mais rápido                                                                                    |

---

## Decisões de interface

A interface usa conceitos de referências industriais como inspiração; a maquete não possui
certificação de conformidade.

- **ISA-101** — hierarquia de quatro níveis de tela, filosofia de HMI.
- **High Performance HMI** — tela em escala de cinza, **cor saturada reservada para condição
  anormal**. Em operação normal o painel é quase monocromático; e é por isso que, quando o cenário
  dispara, a coisa vermelha atrai a sala. Consequências concretas: a barra de saúde de um conjunto
  normal é **cinza**, não verde, e os chips de situação das unidades ficam neutros até haver desvio.
  Cinco barras verdes lado a lado treinariam a plateia a ignorar exatamente o canal que precisa
  gritar quando a vibração subir.
- **ISA-18.2 / EEMUA 191** — banda morta, atraso de confirmação, meta de taxa.
- **ISA-5.1 / ISO 14617** — simbologia de bomba, reservatório e instrumento.
- **SNIS** — `IN049`, `IN058`, `IN022` e `IN046` calculados direto das séries.

### Os cinco fatos de um conjunto motobomba

A decisão de projeto mais importante da maquete. Na tela da estação, cada bomba carrega **cinco
fatos e nada mais** — amontoar corrente, tensão, cos φ, rpm, horímetro e vibração em cinco cartões
lado a lado é o erro clássico, e o operador não consegue comparar cinco bombas assim.

1. **Estado** — forma, preenchimento e rótulo textual. Nunca só cor.
2. **Modo AUTO/MANUAL** — em manual a bomba sai do controle automático; os intertravamentos
   continuam ativos.
3. **Papel na sequência** — `LÍDER` / `SEG-n` / `RESERVA-n`. É o que torna cinco bombas legíveis em
   vez de cinco caixas iguais.
4. **Vazão** e, com inversor, a rotação.
5. **Saúde** — uma barra, o pior entre corrente, vibração e mancal.

Todo o resto vive no **faceplate**, que abre no clique: as três fases e o desequilíbrio (NEMA MG-1),
cos φ, kW, rpm, vibração com a faixa ISO 10816-3, temperatura de mancal, horímetro, e a **curva H×Q
com o ponto de operação** — o gráfico que mais separa um HMI de bombeamento de um dashboard
genérico, porque diz se a bomba trabalha _onde deve_, não só se está ligada.

### O mapa

A versão anterior desenhava tudo em SVG à mão, e o preço aparecia nos rótulos: `<text>` soltos, sem
detecção de colisão, sobrepostos em qualquer zoom. A correção foi estrutural — **a lista própria de
localidades deixou de existir** e quem rotula é o basemap, que já traz Japuíba, Jacuecanga, Banqueta
e Vila do Abraão com tipografia e colisão profissionais.

| Camada    | Fonte                                 | Quando                           |
| --------- | ------------------------------------- | -------------------------------- |
| Ruas      | OpenStreetMap padrão (XYZ, sem chave) | padrão, nos dois temas           |
| Satélite  | Esri World Imagery                    | mostra o relevo e a orla         |
| Sinóptico | contorno IBGE embutido                | leitura esquemática e _fallback_ |

O mapa de ruas usa o serviço público do **OpenStreetMap**, sem cadastro, chave de API ou trial. A
cartografia padrão é a mesma nos temas claro e escuro. A atribuição permanece visível no mapa. O uso
deve seguir a [política dos tiles públicos](https://operations.osmfoundation.org/policies/tiles/):
visualização interativa, cache HTTP do navegador e envio de Referer (configurado em
`public/_headers`). O serviço tem capacidade limitada e não oferece garantia de disponibilidade; não
há download em massa nem pré-carregamento para uso offline. O modo offline usa apenas o contorno
local do IBGE.

**Se os tiles não carregarem em 3,5 s, o mapa cai sozinho para o contorno do IBGE** e avisa na tela.
O auditório sem rede continua funcionando. Para deixar o painel 100 % offline de propósito, basta
remover os dois domínios de [`public/_headers`](../public/_headers).

---

## Acrescentando uma unidade

Toda a topologia vive em [`src/data/topologia.js`](../src/data/topologia.js). Acrescente uma linha
em `UNIDADES`:

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

e, se ela tiver conjuntos motobomba, as linhas correspondentes em `BOMBAS` apontando para esse `id`.
O mapa, os indicadores, a lista de ativos, a tela de automação e o motor de simulação passam a
incluí-la — **nenhum outro arquivo precisa ser tocado**, exceto o sinóptico, que é declarativo em
[`src/sinoptico/diagramas.js`](../src/sinoptico/diagramas.js) e recebe um nó e um tubo.

Depois, rode `pnpm check`.

Para regerar o contorno do município a partir do IBGE:

```bash
python3 tools/fetch_malha.py
```

---

# Digitalizar, automatizar e controlar

**Pré-projeto — versão 3.0, agosto de 2026**
Serviço Autônomo de Água e Esgoto de Angra dos Reis

> Versão em texto do documento publicado em `/projeto/`. Mesma matéria, para
> circulação impressa e anexação a processo administrativo. As fotografias dos
> equipamentos estão na versão publicada; aqui ficam apenas as referências.

---

## Nota preliminar — de onde falo

Este documento é um **pré-projeto**: propõe um caminho e demonstra que ele é
executável, não fixa projeto executivo, quantidade, marca nem cronograma de obra.
Onde ele indica equipamento, indica **tipo e critério de escolha**; o que instalar
e onde é decisão de etapa posterior, com levantamento feito e responsabilidade
técnica constituída.

Registro também a minha posição, porque ela determina o que posso e o que não
posso afirmar aqui. Fui servidor administrativo da autarquia por quinze anos e
estou afastado desde 2020, com retorno previsto. **Todo dado deste documento é
público ou vem da rotina que conheci até o meu afastamento.** Não tenho acesso a
informação interna atual: não sei o que foi instalado, contratado ou informatizado
desde então.

Isso tem duas consequências que valem para o texto inteiro. A primeira é que,
onde descrevo a operação, descrevo **a rotina que conheci** — se a prática já
mudou, tanto melhor, e o levantamento aproveita o que existir em vez de refazer.
A segunda é que não afirmo o que a autarquia sabe ou deixa de saber: quando digo
que um dado não está disponível, quero dizer que **não o encontrei em fonte
pública**, e a primeira entrega que proponho é justamente substituir suposição por
apuração.

---

## 1. Como operamos hoje

O problema não é falta de esforço da operação, e não é falta de gente competente.
É que **boa parte do trabalho é feita a mão**, e o que é feito a mão não deixa
registro aproveitável, não avisa quando sai da faixa e não pode ser conferido
depois.

### A bomba: automático simples ou manual

Na rotina que conheci, cada conjunto motobomba estava numa de duas situações. Ou
funcionava em **automático simples** — uma boia ou um pressostato que liga quando
o nível desce e desliga quando sobe, sem saber o nível do reservatório de destino,
sem saber que horas são, sem alternar entre os conjuntos e sem partida
controlada. Ou funcionava **na mão**: alguém precisava se deslocar até a unidade
para ligar e para desligar.

As consequências são conhecidas de quem opera: o conjunto que se tem o hábito de
ligar primeiro acumula desgaste enquanto o outro envelhece parado, a partida
direta castiga motor e tubulação, o bombeamento acontece no horário que calhar —
inclusive naquele em que a energia custa várias vezes mais — e, se um conjunto
começa a falhar, isso só aparece quando ele para.

### O cloro e o pH: comparador de prisma, reagente e uma equipe em rota

O controle de cloro residual livre e de pH é feito com **comparador colorimétrico
visual de prisma** — o tipo do Dellab DLH-2000, que é o que a casa usa. A rotina é
conhecida: coleta-se a amostra, adiciona-se o reagente DPD, espera-se a reação,
compara-se a cor da amostra com o disco de padrões através do prisma, lê-se o
valor no degrau mais próximo e anota-se.

Registro o instrumento com precisão porque isso importa para o argumento. O
comparador de prisma **não entrega um número contínuo**: entrega o degrau da
escala do disco. A leitura depende da iluminação do local, da visão de cores de
quem lê, do estado do reagente e de quem transcreve o valor para a ficha. É um
instrumento adequado ao que se pede dele, e continuará em uso — mas é um
instrumento de **verificação pontual**, não de acompanhamento.

E é aí que está o problema que interessa, que não é o instrumento: **entre uma
leitura e a próxima, a operação está cega.** Se a dosagem saiu de faixa às três da
manhã e voltou às seis, isso não aconteceu para o registro — não há como
demonstrar o contrário nem à vigilância sanitária, nem a nós mesmos.

### A ficha: o dado nasce em papel e morre em papel

Cada leitura vai para uma **ficha preenchida a mão**. As fichas são recolhidas, e
a consolidação — somar, tirar média, montar o relatório do mês — é feita
**manualmente**. É trabalho qualificado gasto em digitação, e é o ponto onde um
erro de transcrição entra sem ninguém perceber.

O efeito de longo prazo é o que mais custa: **não se constitui série histórica
consultável**. Não dá para comparar este mês com o mesmo mês do ano passado,
cruzar energia com volume bombeado, nem mostrar a um órgão de controle a curva de
um ano. O dado existiu, foi anotado, e não está disponível.

**Este é o problema mais barato de resolver de todo o documento** — e é por ele
que proponho começar, antes de qualquer sensor. É o assunto do capítulo 2.

### A rotina manual, atividade por atividade

| O que se faz                      | Como é feito                       | Frequência         | O que fica invisível                         |
| --------------------------------- | ---------------------------------- | ------------------ | -------------------------------------------- |
| Ligar e desligar bomba            | boia, pressostato ou deslocamento  | por evento         | horas de operação, rodízio, horário de ponta |
| Ler cloro residual e pH           | comparador de prisma, com reagente | poucas por dia     | todo o intervalo entre uma leitura e outra   |
| Verificar nível de reservatório   | inspeção visual ou telefonema      | algumas por dia    | a curva do dia e a tendência de esvaziamento |
| Verificar nível de poço de esgoto | inspeção no local                  | irregular          | a subida que antecede o extravasamento       |
| Registrar a leitura               | ficha de papel preenchida a mão    | a cada leitura     | o histórico — a ficha não é consultável      |
| Consolidar o mês                  | digitação e cálculo manual         | mensal             | erro de transcrição, sem como ser conferido  |
| Descobrir uma falha               | telefone do consumidor             | depois de ocorrida | as horas entre a falha e a reclamação        |

**A operação descrita acima reage ao que já aconteceu. Instrumentada, ela passa a
agir sobre o que está acontecendo.**

### O que os indicadores públicos mostram

Os indicadores oficiais do município são o retrato do que se consegue enxergar
hoje:

| Indicador                      | Valor            | Origem                      |
| ------------------------------ | ---------------- | --------------------------- |
| População total                | 179.120 hab      | **oficial** Censo IBGE 2022 |
| Volume de água produzido       | 13,641 mi m³/ano | **oficial** SINISA 2024     |
| Perdas na distribuição         | 21,3 %           | **oficial** SINISA 2024     |
| Esgoto tratado, sobre o gerado | 20,3 %           | **oficial** SINISA 2024     |
| **Índice de hidrometração**    | **73,9 %**       | **oficial** SINISA 2024     |
| **Consumo por habitante**      | **239,6 L/dia**  | **oficial** SINISA 2024     |

Destaco de propósito as duas últimas linhas, e não a das perdas. **21,3 % de
perdas é um índice bom** — a média nacional fica perto de 37 %. O problema não é
o valor: é que ele **não é auditável**.

Com **73,9 % de hidrometração**, um quarto das ligações não tem medidor, e o
consumo dessas ligações entra no cálculo por estimativa. O consumo per capita
declarado, **239,6 L/dia**, está muito acima da média nacional — o que é
justamente o que se espera quando consumo não medido é estimado por cima e acaba
absorvendo parte do que, na verdade, é perda. O índice de perdas e o de consumo
são calculados a partir dos mesmos volumes: se um está deslocado, o outro está
deslocado na direção contrária.

Não afirmo que as perdas de Angra sejam maiores que 21,3 %. **Afirmo que, com um
quarto do parque sem medição, ninguém pode afirmar coisa nenhuma sobre elas — nem
para melhor, nem para pior.** Um número que não se sustenta em medição é um número
que a autarquia não pode defender diante de um órgão de controle. Medir é o que
transforma esse indicador em algo que se assina embaixo.

---

## 2. O que proponho

Substituir a rotina manual por um sistema construído dentro da autarquia, em
movimentos que acontecem nessa ordem, cada um entregando valor por si:

**0. Digitalizar o registro** — antes de qualquer sensor, a ficha de papel vira
lançamento no sistema, feito pelo próprio laboratório e pelo pessoal de campo, do
telefone ou do computador. A série histórica passa a existir imediatamente, com
autor e horário, e o boletim mensal passa a ser gerado em vez de digitado.

**1. Digitalizar a medição** — o instrumento passa a medir sozinho, o tempo todo,
e o valor vai direto para o mesmo banco, pelo mesmo caminho. Acaba o intervalo
cego.

**2. Automatizar** — o controle local deixa de ser boia e passa a ser regra
escrita: nível de destino, rodízio entre conjuntos, intervalo mínimo entre
partidas, horário.

**3. Controlar** — as unidades aparecem numa tela só, com alarme quando algo sai
da faixa, histórico consultável e comando à distância onde houver segurança e
autorização para tanto.

### Por que a etapa 0 vem primeiro

É a decisão mais importante deste documento, e a mais barata.

O problema do capítulo 1 tem duas partes: **o intervalo cego** entre as leituras e
**a ficha que não vira histórico**. A segunda parte não precisa de instrumento
nenhum para ser resolvida — precisa de um formulário, um banco de dados e perfis
de acesso. É trabalho de software, é o que eu sei fazer, e não toca em nenhuma
unidade em operação.

O que a etapa 0 entrega, em semanas e a custo próximo de zero:

- lançamento da leitura pelo laboratório e pelo campo, do telefone, no momento da
  coleta, com autor e horário gravados;
- valor **imutável depois de gravado** — correção gera novo registro com
  justificativa, e o anterior permanece visível;
- série histórica consultável desde o primeiro dia, por unidade e por período;
- boletim mensal **gerado**, não digitado;
- alerta quando a leitura lançada sai de faixa;
- consulta por gerência e diretoria, em tempo real, do próprio telefone.

Nada disso depende de comprar equipamento, de mexer em painel elétrico ou de
autorização de terceiro. E quando o analisador em linha chegar, ele passa a
alimentar **a mesma tabela** que a ficha alimentava — o histórico não recomeça do
zero, continua.

### Três princípios fundamentais

**1. Arquitetura aberta, do sensor à tela.** Todo equipamento se comunica por
protocolo público e todo programa é de código aberto e sem licença. Não é
preferência ideológica: é o que garante que trocar de fornecedor de sensor não
obrigue a trocar o sistema, e que sair de um fornecedor não custe o dado
acumulado. Uma marca cujo protocolo só ela fala é uma marca que pode cobrar o que
quiser depois de instalada.

**2. A segurança do equipamento não depende do programa.** As proteções críticas
continuam sendo físicas — chave de nível, boia, relé térmico, relé de falta de
fase — e seguem atuando com o sistema inteiro desligado. O programa acrescenta
camadas; nunca é a última barreira.

**3. O dado pertence à autarquia.** Banco e servidores no SAAE, formato aberto,
exportação sempre possível, sem intermediário entre a autarquia e a própria
medição.

> **Sobre a demonstração que acompanha este pré-projeto.** A maquete publicada em
> `/painel/` é referência visual e prova de capacidade técnica, com **dados
> inteiramente simulados**. Não é o sistema proposto, não descreve a operação real
> e não será aproveitada como está. Digo isto aqui para que ninguém saia da
> apresentação achando que o sistema já existe.

---

## 3. As tecnologias

Quatro camadas, e cada fronteira entre elas é um protocolo público. É a decisão
que sustenta todas as outras: como as camadas conversam por padrão aberto,
qualquer uma pode ser trocada sem refazer as demais.

| Camada                 | Tecnologia                                                                    | Por que ela                                                                           |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Campo**              | sinal 4–20 mA e Modbus RTU                                                    | todo instrumento fala um dos dois; no 4–20 mA, fio rompido lê zero e denuncia a falha |
| **Aquisição local**    | concentrador de telemetria; controlador em IEC 61131-3 quando houver controle | linguagem normalizada, não dialeto de fabricante; a lógica migra de marca             |
| **Enlace até a sede**  | MQTT com especificação Sparkplug                                              | desenhado para enlace ruim e intermitente — um município com relevo e ilhas           |
| **Servidor**           | Debian, Docker, Mosquitto, PostgreSQL + TimescaleDB                           | livres, consagrados e com mercado de profissionais                                    |
| **Telas e relatórios** | Node.js com Fastify, React, Grafana                                           | as regras ficam na camada de serviços; a tela é cliente dela, e é trocável            |

### Quanto controlador cada etapa exige

Esta é a distinção que o documento anterior não fazia, e ela muda o custo e o
risco da primeira etapa. **Ler não exige controlador lógico.**

| Etapa                                       | O que basta                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Somente ler**                             | **concentrador de telemetria** — adquire, carimba o horário, guarda e transmite. **Não decide nada.** A boia, o pressostato e o relé continuam comandando exatamente como hoje |
| Ajustar parâmetro de operação à distância   | concentrador com saída, ou controlador simples                                                                                                                                 |
| Decidir partida, fazer rodízio, intertravar | **controlador lógico programável**                                                                                                                                             |

Disso decorre a afirmação mais importante deste pré-projeto, e a que responde à
primeira objeção que a engenharia levantará:

> **A primeira etapa não altera a lógica de controle de nenhuma unidade em
> operação.** Instala-se um equipamento que lê e transmite. Se ele for desligado,
> a unidade continua funcionando exatamente como funcionava antes.

O controlador lógico entra na etapa seguinte, quando houver decisão a tomar
localmente — e aí com projeto, responsabilidade técnica e ensaio, na forma do
capítulo 5.

### Por que a decisão não pode morar no servidor

É a pergunta que costuma vir junto: se há um servidor e há rede, por que não
deixar a lógica lá e comandar tudo à distância?

Porque **o enlace cai**. Angra tem relevo e tem ilhas, e não existe comunicação
que não falhe. Se a decisão de partir a bomba mora no servidor, no momento em que
a rede cai o reservatório esvazia ou o poço de esgoto sobe — e a falha de um
sistema de informação vira incidente operacional e ambiental. Além disso,
intertravamento não admite ida e volta pela rede: proteção precisa de tempo de
resposta determinístico, e latência de rede não é determinística.

Por isso a regra da arquitetura: **a unidade decide localmente e o servidor
supervisiona.** Se a comunicação cair, o concentrador segue medindo e guardando, e
o controle local — hoje a boia, amanhã o controlador — segue operando. Quando a ligação
volta, o histórico é retransmitido com **o horário em que cada medição foi feita**,
não o horário em que chegou.

**Uma distinção que vale registrar:** hospedar a _decisão_ fora da unidade não se
faz. Mas **parametrizar e manter o equipamento à distância se faz** — ajustar
faixa de alarme, acrescentar um ponto de medição, atualizar configuração, tudo
pela mesma conexão iniciada de dentro para fora, com versionamento e registro de
quem alterou o quê. Não é preciso deslocar equipe para mudar um parâmetro.

### Como a medição viaja

Do instrumento até o concentrador, **Modbus**. Da unidade até a sede, **MQTT** — e
sobre ele a especificação **Sparkplug**, que acrescenta três garantias que um
supervisório não pode dispensar: a estação **declara sozinha** o que mede, de modo
que acrescentar um sensor não exige mexer no servidor; o servidor **sabe quando
uma estação caiu**, distinguindo bomba desligada de estação muda; e toda medição
carrega o **horário de origem**.

Para que esse horário de origem seja confiável, o concentrador precisa de
**relógio próprio com bateria e sincronismo por NTP**. É item barato e é o que
sustenta a promessa — sem ele, o dado retransmitido depois de uma queda chega sem
saber quando nasceu.

A transmissão é **por exceção, com banda morta**: só se envia quando o valor muda
além de um limite configurado, ou no intervalo máximo de garantia. É o que a
norma de gestão de alarmes já pressupõe, e é o que mantém o enlace e o banco
enxutos.

O histórico fica em **PostgreSQL** com a extensão **TimescaleDB**, especializada
em série temporal: comprime o dado antigo, mantém médias sempre prontas e descarta
o detalhe que já não interessa, preservando o resumo. Algumas centenas de
grandezas ocupam, comprimidas, **dezenas de gigabytes por ano** — cabe com folga
num servidor modesto. Registro isto porque proposta comercial costuma dimensionar
essa camada muito acima do necessário.

### O que "arquitetura aberta" significa na prática

| Situação                         | Com sistema fechado                 | Com arquitetura aberta                   |
| -------------------------------- | ----------------------------------- | ---------------------------------------- |
| Trocar o fabricante de um sensor | depende de o fornecedor homologar   | basta falar Modbus — troca-se e pronto   |
| Acrescentar uma unidade          | nova licença, por ponto ou servidor | custo zero de licença                    |
| Sair do fornecedor               | o histórico fica em formato dele    | banco padrão, exportação sempre possível |
| Contratar quem mantenha          | só quem tem certificação da marca   | qualquer profissional de mercado         |
| Auditoria por órgão de controle  | código fechado, não inspecionável   | código legível e publicado               |

### O que os programas custam

| Função                            | Programa                   | Licença      |
| --------------------------------- | -------------------------- | ------------ |
| Sistema operacional               | Debian ou Ubuntu           | livre — R$ 0 |
| Empacotamento de serviços         | Docker ou Podman           | livre — R$ 0 |
| Recepção das medições             | Mosquitto                  | livre — R$ 0 |
| Banco e histórico                 | PostgreSQL com TimescaleDB | livre — R$ 0 |
| Camada de serviços                | Node.js com Fastify        | livre — R$ 0 |
| Interface de operação             | React                      | livre — R$ 0 |
| Monitoramento do próprio sistema  | Prometheus e Grafana       | livre — R$ 0 |
| **Total de licenças de software** |                            | **R$ 0**     |

> **Onde este total não se aplica.** A tabela acima é da camada de servidor e
> telas. **Concentrador, controlador e instrumento são equipamento físico e
> custam** — estão no capítulo 4. E o que garante que a lógica de um controlador
> possa ser levada para outro fabricante não é o preço do programa: é a **norma
> IEC 61131-3**, que padroniza as linguagens de programação industrial. Programa
> gratuito sem norma não dá portabilidade nenhuma; norma sem programa gratuito dá.

Os fabricantes de supervisório proprietário não publicam preço: cotam sob
consulta, por ponto medido ou por servidor. Essa opacidade é, por si só, um
argumento — o poder público fica sem parâmetro de mercado justamente no momento de
licitar.

### Segurança da informação

Um sistema que comanda equipamento físico tem superfície de ataque diferente de um
sistema administrativo. O desenho segue a norma internacional de segurança em
automação industrial, e separa **dois planos que não se tocam**:

**Plano de campo e comando — fechado.**

- **rede de campo isolada** da internet e da rede administrativa, com o
  concentrador como único ponto de passagem;
- **conexão sempre iniciada de dentro para fora** — nenhuma porta aberta na
  unidade, nenhuma interface de comando exposta na internet;
- **comando somente da rede interna da autarquia**, restrito à sala de controle, e
  ainda assim condicionado à chave física no painel, na forma do capítulo 5;
- **comunicação cifrada com certificado por unidade**, revogável individualmente.

**Plano de consulta e lançamento — publicado, e sem caminho até o campo.**

- interface **só de leitura** para gerência e diretoria, e de **lançamento** para
  laboratório e campo, acessível pelo navegador do computador ou do telefone;
- **autenticação em dois fatores** e perfis de permissão, na forma do capítulo 5;
- **nenhuma rota** desse plano até o controlador: ele lê do banco e escreve no
  banco, e não fala com a unidade.

E atravessando os dois:

- **registro de auditoria** de todo lançamento e todo comando, com autor, horário,
  valor anterior e valor novo;
- **cópia de segurança com restauração testada**, não apenas agendada.

A separação é o que permite ter as duas coisas ao mesmo tempo: um diretor
consultando o sistema do telefone, e uma rede de campo que continua sem nada
exposto na internet.

---

## 4. Os equipamentos

Este capítulo é de **repertório e critério**: apresenta os tipos de instrumento, a
que rotina manual cada um corresponde, por qual protocolo conversa e em que ordem
de preço está — e, principalmente, **como se escolhe entre as alternativas**. Os
modelos citados fixam ordem de grandeza e **não são indicação de marca**; todos
têm equivalentes de outros fabricantes, o que é justamente a razão de exigir
protocolo aberto.

> **O que este capítulo não faz.** Não define quantidade, não escolhe unidade e
> não fecha especificação — isso é projeto executivo, e depende de levantamento
> que ainda não existe. Apresento preço por equipamento e custo por **tipo** de
> unidade porque multiplicar por uma quantidade que ainda não está levantada produziria um
> número de aparência precisa e sem valor nenhum.

### Analisador de cloro residual livre e pH em linha

Fica instalado numa derivação da tubulação, mede continuamente, mostra o valor no
local e o envia por Modbus. **Fecha o intervalo cego entre as leituras** — que é o
problema, e não o instrumento de hoje.

- **Complementa:** o comparador de prisma, que permanece em uso — ver a ressalva
  abaixo, que é importante
- **Comunicação:** 4–20 mA e Modbus; saída a relé para alarme local
- **Tecnologias:** o **amperométrico** não consome reagente, mas consome membrana
  e eletrólito, que são trocados periodicamente; o **colorimétrico** custa menos e
  consome reagente continuamente
- **Requisitos que costumam ser esquecidos:** exige **vazão de amostra constante**
  (derivação, filtro e controle de vazão), calibração periódica, e o eletrodo de
  pH exige limpeza e calibração próprias
- **Ordem de preço:** o instrumento, na ordem de **R$ 17 mil** **preço** — sem
  incluir derivação, painel, abrigo e instalação

> **O analisador não substitui a análise oficial, e este documento não afirma que
> substitui.** A Portaria GM/MS 888/2021 estabelece o padrão de potabilidade e os
> métodos analíticos de referência para as análises de controle. O analisador em
> linha é **monitoramento contínuo que dirige a ação** — ele avisa, alarma e
> registra —, e ele próprio precisa ser **aferido contra o método de referência**.
>
> Ou seja: **o comparador de prisma não sai de uso. Ele passa a ser o padrão de
> aferição do analisador**, e ganha uma função que hoje não tem.

**E daí sai um recurso que proponho de propósito.** A leitura feita no comparador
é lançada no sistema pelo laboratório como **ponto de aferição**, ao lado do valor
que o analisador estava indicando naquele instante. O sistema passa a manter,
sozinho, **a curva de desvio do analisador ao longo do tempo** — quando ele começa
a derivar, isso aparece antes de virar problema, e a autarquia passa a ter trilha
metrológica documentada para apresentar à vigilância sanitária. É uma
funcionalidade de software, custa o trabalho de escrevê-la, e transforma a rotina
manual que já existe em controle de qualidade da rotina automática.

> **Nota de referência.** Um serviço municipal de saneamento do interior paulista
> divulgou ter investido **R$ 17 mil** num analisador de cloro e economizado
> **cerca de R$ 13 mil por ano em reagente** **preço**. Registro como **caso
> público de outra autarquia**, para fixar ordem de grandeza do instrumento — não
> como projeção de economia para o SAAE, que depende do consumo real de reagente
> daqui, ainda a levantar.

### Transmissor de pressão

Pressão excessiva rompe tubulação e alimenta vazamento silenciosamente; pressão
insuficiente desabastece. Na rotina que conheci, as duas situações apareciam
quando alguém ligava reclamando.

- **Substitui:** a reclamação do consumidor como forma de descobrir o problema
- **Comunicação:** 4–20 mA, dois fios
- **Onde se instala:** saída de recalque, entrada de setor, ponto crítico da rede
- **Não esquecer:** protetor de surto, faixa compatível com a pressão da rede e
  válvula de bloqueio para permitir manutenção sem parar o trecho
- **Ordem de preço:** a partir de **R$ 1.418** **preço**, o instrumento

### Medidor de vazão

É a medição que permite localizar perda em vez de estimá-la. **A escolha entre as
tecnologias envolve exatidão e instalação, e as duas coisas pesam** — a versão
anterior deste documento dizia que era só instalação, e estava errada:

|                      | Eletromagnético (carretel ou inserção)                    | Ultrassônico externo, de fixação por fora                                 |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Exatidão típica      | **±0,2 a 0,5 %**                                          | **±1 a 2 %**, sensível às condições de instalação                         |
| Instalação           | carretel corta a tubulação; inserção entra por derivação  | preso por fora, sem cortar                                                |
| Parada da adutora    | necessária no carretel, evitável na inserção              | desnecessária                                                             |
| Requisitos           | trechos retos, tubo cheio, líquido condutivo, aterramento | material e espessura de parede conhecidos, bom acoplamento, trechos retos |
| Preço do instrumento | menor                                                     | maior                                                                     |
| Custo de instalação  | maior — obra, parada e risco                              | menor                                                                     |
| **Uso indicado**     | **macromedição permanente e balanço de setor**            | **campanha de medição, verificação, local onde não se pode parar**        |

O critério, em uma frase: **onde o número vai servir para balanço hídrico e para
vazão mínima noturna, a exatidão importa e o eletromagnético é a escolha; onde o
número serve para diagnosticar ou verificar, o ultrassônico externo resolve com
instalação muito mais simples.** O erro clássico é comparar preço de etiqueta e
esquecer que parar uma adutora custa mais que o medidor — mas isso é argumento de
custo, não de exatidão, e os dois precisam entrar na decisão.

Saídas, nos dois casos: 4–20 mA, pulso e RS-485 com Modbus.

### Medidor de nível

Mede sem encostar no líquido, e substitui a inspeção no local e a boia como única
informação de nível.

- **Reservatório de água tratada:** o **ultrassônico** resolve com bom custo
- **Poço de elevatória de esgoto:** o **radar** é a escolha preferencial — espuma
  e vapor degradam a leitura ultrassônica, e o radar é bem menos sensível a eles.
  Registro com precisão: **espuma densa também atenua o radar** e pode causar
  perda de eco; a escolha de frequência e de antena faz parte do projeto
- **Alternativa de menor custo:** o **hidrostático submerso** mede a coluna de
  líquido diretamente, custa menos e é imune a espuma — em contrapartida fica
  imerso, e incrusta
- **Comunicação:** 4–20 mA com HART, ou Modbus
- **O que habilita:** alarme antecipado de extravasamento — evita incidente
  ambiental e autuação

> **Poço de esgoto é atmosfera potencialmente explosiva, e isso muda o
> equipamento.** A decomposição do esgoto gera gás sulfídrico e metano. Instalação
> de instrumentação em poço de sucção exige **classificação da área e equipamento
> certificado conforme a ABNT NBR IEC 60079**, com barreira de segurança
> intrínseca onde aplicável — definido em projeto, por profissional habilitado.
> Some-se a isso a corrosão por gás sulfídrico, que impõe materiais compatíveis em
> sensor, cabo e caixa. Registro aqui porque é custo real, é exigência legal e não
> aparece no preço de catálogo do sensor.

> **As boias permanecem.** O medidor de nível informa; ele não protege. A boia de
> nível mínimo e a de nível máximo continuam ligadas ao circuito de comando,
> atuando independentemente do sistema e com ele inteiro desligado.

### Multimedidor de grandezas elétricas

Cerca de **90 %** de toda a energia elétrica de um sistema de abastecimento é
consumida por conjuntos motobomba. A fatura dá o total; a repartição por conjunto
só existe medindo. Um único equipamento no painel entrega corrente nas três fases,
tensão, desequilíbrio, fator de potência, potência ativa e energia acumulada.

- **Substitui:** o rateio por estimativa
- **Comunicação:** RS-485 com Modbus RTU, e saída de pulso — **conferir se é
  padrão ou item opcional no modelo escolhido**
- **Ordem de preço do instrumento:** entre **R$ 519 e R$ 910** **preço**
- **O que o preço acima não inclui, e precisa entrar na conta:** os
  **transformadores de corrente**, o disjuntor de proteção do circuito de medição,
  bornes e cabeamento, e a **intervenção no painel por profissional habilitado**,
  com a instalação desenergizada. O instrumento é a menor parte do custo desse
  item.

### Monitoramento do conjunto motobomba

Instrumentar a bomba não exige sensor sofisticado. Com o multimedidor e algumas
entradas digitais no concentrador, obtém-se:

| Grandeza                   | De onde vem                  | O que ela denuncia                               |
| -------------------------- | ---------------------------- | ------------------------------------------------ |
| Corrente nas três fases    | multimedidor                 | cavitação, obstrução, desgaste, rotor danificado |
| Tensão e desequilíbrio     | multimedidor                 | condição da alimentação, risco para o motor      |
| Energia acumulada          | multimedidor                 | custo por conjunto, rendimento                   |
| Estado ligado/desligado    | entrada digital, do contator | horas de operação reais                          |
| Falha do relé de proteção  | entrada digital              | a parada, no instante em que ocorre              |
| Horas e número de partidas | contador no concentrador     | rodízio, desgaste, manutenção por uso            |

**A corrente é o parâmetro mais informativo e o mais barato.** Uma bomba que passa
a puxar corrente diferente da sua curva habitual está avisando com semanas de
antecedência. Monitoramento de vibração conforme a ISO 10816 é um degrau acima —
útil, e deliberadamente fora deste pré-projeto.

### Inversor de frequência — quando ele é a resposta, e quando não é

Registro este item como repertório, porque a pergunta vai aparecer, e porque a
resposta correta é mais interessante que a resposta fácil.

**O inversor não é o que acaba com o comando por boia.** Isso quem faz é a regra
de controle no controlador — nível do reservatório de destino, rodízio, intervalo
mínimo entre partidas, horário — e ela funciona igualmente bem com a partida que
já existe. São duas coisas independentes, e a versão anterior deste documento as
confundia.

**O inversor resolve outro problema: manter pressão ou vazão constante**, variando
a rotação em vez de ligar e desligar. É a escolha certa em booster de rede, onde
se quer pressão estável no ponto de entrega.

**E há o caso em que ele não é a escolha certa**, que é o que interessa declarar:
em recalque para reservatório elevado, onde predomina a **altura estática**,
reduzir a rotação não reduz o consumo proporcionalmente — abaixo de certa rotação
a bomba simplesmente não vence a altura e passa a consumir energia entregando
vazão nula. Nessa situação, encher o reservatório na rotação nominal e desligar é
mais eficiente que modular.

Quando entra, entra com exigências que precisam estar no projeto elétrico: reator
de saída em cabo longo, cuidado com correntes de mancal em motor de maior porte,
avaliação de harmônicas, ventilação e grau de proteção do painel. **Não é item que
equipe de tecnologia instala por conta própria.**

Onde e se aplicar é decisão de projeto executivo, com levantamento das curvas e
das alturas de cada recalque. Este documento não a antecipa.

### O controlador lógico programável

Entra quando há decisão a ser tomada dentro da unidade — partida e parada por
nível de destino, rodízio entre conjuntos, intertravamento, recusa de comando
inseguro. Lê os instrumentos por Modbus, executa a lógica, e publica por MQTT.

Programado em **IEC 61131-3** — norma internacional, não dialeto proprietário —, a
lógica escrita hoje pode ser levada para outro fabricante amanhã. Opera e registra
sem enlace, e retransmite quando a ligação volta.

Como registrado no capítulo 3, **não é item da primeira etapa**: ler não exige
controlador lógico, e a primeira etapa não altera a lógica de nenhuma unidade em
operação.

### O ponto de rede, que não tem painel nem energia

Medir pressão e vazão na entrada de um setor significa instalar instrumento **no
meio da rua**, onde não há painel, não há alimentação e não há quem vá até lá
todo dia. É outra arquitetura, e vale dizer qual:

**datalogger autônomo, alimentado por bateria, com modem próprio.** Ele acorda no
intervalo programado, lê, grava e transmite por lote — não transmite continuamente,
porque isso consumiria a bateria. Grau de proteção compatível com instalação em
caixa enterrada ou abrigo, e autonomia dimensionada para o intervalo de
manutenção. Onde houver energia disponível, a solução é a mesma do restante.

### A infraestrutura do painel

É o custo que projeto de automação costuma subestimar e que a engenharia elétrica
vai cobrar, com razão: fonte ininterrupta, proteção contra surto, aterramento,
grau de proteção compatível com o ambiente e separação física entre circuitos de
potência e de sinal. Nada disso é opcional, e nada disso aparece no preço do
sensor.

Quanto à comunicação até a sede: fibra onde houver; rede móvel com antena externa
na área urbana; rádio ponto a ponto onde houver visada; nas unidades insulares,
rede móvel direcional com autonomia local reforçada. As ilhas são o caso difícil,
e é por causa delas que a arquitetura exige que cada unidade funcione sozinha.

### Custo por tipo de unidade

Material apenas; não inclui instalação, projeto elétrico nem obra. São faixas
**cálculo**, para dimensionar ordem de grandeza enquanto o inventário não existe,
e supõem a **instrumentação completa** daquele tipo de unidade.

| Tipo de unidade                 | O que se mede                                  | Faixa           |
| ------------------------------- | ---------------------------------------------- | --------------- |
| Captação                        | nível do manancial, pressão, vazão, energia    | R$ 24 – 72 mil  |
| Elevatória de água              | níveis, pressões, vazão, energia por conjunto  | R$ 38 – 103 mil |
| Reservatório                    | nível, pressão e vazão de saída, cloro e pH    | R$ 38 – 94 mil  |
| Elevatória de esgoto            | nível do poço, energia, área classificada      | R$ 20 – 58 mil  |
| Estação de tratamento de esgoto | nível, vazão, oxigênio dissolvido, pH, energia | R$ 39 – 105 mil |
| Ponto de rede por setor         | pressão e vazão de entrada, autônomo           | R$ 15 – 42 mil  |

**A primeira etapa fica na parte inferior de cada faixa**, porque não inclui
controlador lógico nem inversor: instrumento, concentrador e infraestrutura de
painel.

---

## 5. Como isso funciona junto

Equipamento isolado não resolve nada. O que resolve é a cadeia inteira funcionando
sem intervenção humana entre a medição e o relatório.

### Caso 1 — o registro do cloro, em duas etapas

**Etapa 0 — sem nenhum sensor novo.** A cadeia de hoje tem cinco passos manuais:

> coleta e reagente → leitura no comparador de prisma → ficha de papel → digitação
> no fim do mês → relatório montado a mão

Passa a ter dois, e o instrumento é o mesmo:

> coleta e reagente → leitura no comparador → **lançamento no telefone, ali mesmo**
> → série histórica, alarme e boletim gerados sozinhos

**Etapa 1 — com o analisador em linha**, o intervalo cego fecha:

> analisador em linha → concentrador da unidade → MQTT até a sede → banco de série
> temporal → tela, alarme e boletim
>
> e, em paralelo, a leitura do comparador continua sendo lançada — agora como
> **ponto de aferição** do analisador

| Rotina que conheci                                     | Etapa 0                                          | Etapa 1                                        |
| ------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------- |
| Leitura anotada na ficha                               | Lançada no telefone, com autor e horário         | Medida continuamente, sem deslocamento         |
| Consolidação por digitação no fim do mês               | Boletim gerado, não digitado                     | Boletim gerado, não digitado                   |
| Fora de faixa entre duas visitas, ninguém fica sabendo | Alarme no lançamento fora de faixa               | **Alarme no instante em que sai da faixa**     |
| Sem série histórica consultável                        | **Série histórica desde o primeiro dia**         | Série contínua, mesma tabela                   |
| Comprovação para a vigilância é a própria ficha        | Registro com autor, horário e trilha de correção | Registro contínuo **mais** a curva de aferição |

**Sobre dosagem automática.** Corrigir a dosagem em malha fechada é possível e é o
destino natural disso, mas **está fora deste pré-projeto**. Entraria só depois de o
analisador provar estabilidade de leitura por período longo, e sempre com limite
máximo imposto fisicamente, fora do programa. Até lá o ganho já é grande: registro
desde o primeiro dia, medição contínua e alarme imediato.

### Caso 2 — bombeamento com decisão

Esta é a **etapa 2**, e depende de controlador lógico na unidade.

| O que entra na decisão             | De onde vem                 | O que muda                                    |
| ---------------------------------- | --------------------------- | --------------------------------------------- |
| Nível do reservatório de destino   | medidor de nível, por MQTT  | não se bombeia para reservatório cheio        |
| Horas de operação de cada conjunto | contador no controlador     | rodízio automático — o desgaste se distribui  |
| Horário                            | relógio do controlador      | enche antes da ponta, recua durante           |
| Pressão na rede                    | transmissor de pressão      | onde houver inversor, rotação ajustada        |
| Corrente do conjunto               | multimedidor                | bloqueio e alarme antes da quebra             |
| Intervalo desde a última partida   | temporizador no controlador | o motor não é castigado por partidas seguidas |

E o ponto que a engenharia vai querer ouvir explicitamente: **um comando pode ser
recusado**. Se o operador mandar partir uma bomba com o poço de sucção abaixo do
mínimo, o sistema não obedece — e registra a recusa, com autor, horário e motivo.
Abaixo dessa camada de programa continua havendo a proteção física, que não depende
de nada disso.

### Como se comanda à distância, em concreto

Esta seção existe porque "controle remoto" é a parte que gera mais desconfiança, e
com razão. O mecanismo é simples e é feito de barreiras em série, da mais frágil
para a mais robusta:

```
   tela, na rede interna da autarquia
     ↓
   serviço — autentica o usuário, confere o perfil, registra a tentativa
     ↓
   controlador da unidade — escreve-se uma variável, nunca se energiza nada
     ↓
   VALIDAÇÃO DO INTERTRAVAMENTO — o controlador confere as condições
     e PODE RECUSAR o comando, registrando o motivo
     ↓
   CHAVE FÍSICA no painel: Local / Desligado / Remoto
     em Local ou Desligado, o comando remoto simplesmente não tem efeito
     ↓
   PROTEÇÕES FÍSICAS em série — boia de nível mínimo, relé térmico,
     relé de falta de fase — atuam com o sistema inteiro desligado
     ↓
   contator
```

Cinco garantias que decorrem desse desenho:

1. **A chave física manda.** Comando à distância só existe com a chave em Remoto.
   Quem está na unidade tem sempre a palavra final, girando uma chave — e isso não
   depende de software nenhum.
2. **O comando escreve uma variável**, nunca energiza um contator pela rede.
3. **O controlador pode recusar**, e a recusa é registrada como evento, com autor,
   horário e motivo. Recusa não é falha: é a proteção funcionando.
4. **Fail-safe de comunicação.** Se o enlace cair, o controlador retorna ao modo
   automático local. Ele nunca fica aguardando um comando que não vem.
5. **Comando só da rede interna**, restrito à sala de controle. Nenhum perfil
   comanda pela internet — ver a tabela de perfis adiante.

**A escada de liberação.** Não se passa de leitura a comando pleno num salto. Cada
degrau depende de projeto elétrico, responsabilidade técnica de profissional
habilitado e ensaio documentado, e cada um entrega valor sozinho:

| Degrau | O que se libera                                                                    | O que exige                                                      |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **1**  | Somente leitura                                                                    | nada além da instalação do instrumento                           |
| **2**  | Ajuste à distância de parâmetro de operação, como o nível de partida e o de parada | controlador na unidade; muda o comportamento **sem** partir nada |
| **3**  | Partida e parada à distância **assistidas**, com operador presente na unidade      | ART, ensaio documentado, procedimento                            |
| **4**  | Partida e parada à distância plenas                                                | histórico de operação do degrau 3                                |

O degrau 2 merece atenção, porque costuma ser subestimado: **mudar o nível em que
a bomba parte, sem ir até a unidade, já resolve boa parte do que se quer do
comando remoto** — e não parte nem para nada por conta própria. É o melhor
resultado pela menor exposição.

Não é conservadorismo: a evidência produzida pelas etapas de leitura, com dado da
própria autarquia, é o que fundamenta tecnicamente o pedido de autorização para
comandar.

### Quem acessa o quê

O sistema não é uma tela na sala de controle. É um sistema com perfis, e cada
perfil vê e faz o que corresponde à sua função.

| Perfil                           | O que pode fazer                                         | De onde                                             |
| -------------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| **Operação / sala de controle**  | consultar e **comandar**, com a chave física em Remoto   | **rede interna, restrita à sala de controle**       |
| **Laboratório**                  | lançar leitura, resultado de análise e ponto de aferição | navegador, computador ou telefone, com dois fatores |
| **Operacional / campo**          | lançar leitura, ocorrência e intervenção realizada       | navegador, computador ou telefone, com dois fatores |
| **Gerência**                     | consultar tudo, **só leitura**                           | navegador, computador ou telefone, com dois fatores |
| **Diretoria e presidência**      | consultar tudo, **só leitura**                           | navegador, computador ou telefone, com dois fatores |
| **Auditoria e controle interno** | consultar tudo, inclusive a trilha de auditoria          | só leitura                                          |

O que sustenta essa tabela:

- **Nenhum perfil comanda pela internet.** Comando exige rede interna e a chave
  física no painel. A separação entre o plano de campo e o plano de consulta, do
  capítulo 3, é o que torna isso verdadeiro em vez de promessa.
- **Lançar é registrar, não editar.** O valor fica gravado com autor e horário e
  não é alterável: uma correção gera um **novo** registro, com justificativa, e o
  anterior permanece visível. É o que dá valor probatório ao histórico.
- **Sem aplicativo para instalar.** A interface é web e se adapta à tela do
  telefone. Diretor não instala aplicativo; diretor abre um endereço, e é por isso
  que essa decisão é técnica e não estética.
- **Toda gravação e todo comando entram na trilha de auditoria**, com autor,
  horário, valor anterior e valor novo.

---

## 6. O que se ganha

Separo rigorosamente **economia**, que é saída de caixa que deixa de ocorrer, de
**receita potencial**, que só se realiza havendo ligação, medição e consumo para
faturar. Apenas a primeira aparece aqui como benefício.

> **O que este documento deliberadamente não faz:** não multiplica água perdida por
> tarifa média. Tarifa mede receita e embute pessoal, administração, depreciação e
> investimento; usá-la para valorar perda física infla o benefício em uma ordem de
> grandeza. Onde falo de perda, uso o **custo de produzir** aquele metro cúbico —
> energia e produto químico.

### A energia do sistema

Não localizei indicador municipal público de consumo de energia. Partindo do
volume produzido, que é oficial — **13,641 milhões de m³/ano** — e do índice
nacional de **0,59 kWh/m³** **oficial**, chega-se a **≈ 8,05 GWh/ano**
**cálculo**, dos quais cerca de 90 % em conjuntos motobomba.

Duas ressalvas, para que o número seja usado pelo que ele vale: o índice nacional
vem do diagnóstico de 2019 e o volume, de 2024 — safras diferentes; e a topografia
de Angra, com recalques longos e desníveis expressivos, pode deslocar o consumo
específico local para qualquer um dos dois lados. O consumo real **a levantar**
está nas faturas da autarquia, e é a primeira coisa que o levantamento substitui.

### Deslocar o bombeamento para fora do horário de ponta

Este é um mecanismo real, e prefiro apresentá-lo como **pergunta que me proponho a
responder** do que como número que eu não teria como sustentar.

**O mecanismo.** No horário de ponta a energia custa de três a cinco vezes o valor
do restante do dia, nas modalidades tarifárias em que há essa distinção, e essas
horas somam cerca de 8,6 % do ano. Bombeamento com reservação a jusante é **carga
deslocável**: enche-se antes e consome-se depois, sem que um litro deixe de ser
entregue e sem obra nenhuma. O que isso exige é saber a hora e ter quem decida —
que é exatamente o que o controlador local passa a fazer, na etapa 2.

**O que eu não sei, e declaro.** Não conheço o enquadramento tarifário das
unidades da autarquia. O ganho só existe onde a unidade está em **modalidade
horária** — em baixa tensão convencional não há distinção de ponta na tarifa de
energia —, e depende ainda de haver **volume de reservação suficiente** para
atravessar as três horas. Concentrar bombeamento fora da ponta também **eleva a
demanda contratada**, cujo custo entra na conta com sinal contrário. E o próprio
enquadramento pode estar mal ajustado, o que é uma economia à parte.

**Por isso não apresento valor.** Levantar o enquadramento, a modalidade e o
consumo real de cada unidade nas faturas é **uma das entregas do levantamento de
campo** que peço ao final. Com as faturas na mão, essa conta se faz em uma tarde,
por unidade, e passa a ser verificável em vez de estimada.

### O insumo que se perde junto com a água

O custo direto de produzir um metro cúbico — energia mais produto químico — é da
ordem de **R$ 0,40** **cálculo**, partindo de uma tarifa média de R$ 0,60/kWh
**a levantar**. Sobre 13,641 milhões de m³, os 21,3 % de perda declarada
representam cerca de **R$ 1,2 milhão por ano** de insumo comprado e desperdiçado
**cálculo**.

Nem toda perda é eliminável. Uma meta de reduzir as perdas em **seis pontos
percentuais** recuperaria cerca de **818 mil m³/ano**, equivalentes a
**≈ R$ 327 mil por ano** **cálculo** — sem contar o adiamento de investimento em
ampliação de captação.

**Mas o ganho principal não é esse, e vale dizer com todas as letras.** Reduzir
perdas exige setorização, gestão de pressão, pesquisa ativa de vazamento e troca
de rede — é um programa de anos, e telemetria não é o programa. **Telemetria é o
instrumento sem o qual o programa não pode nem começar**, porque não se reduz o
que não se localiza, e hoje a perda só existe como número agregado do município
inteiro.

O caminho técnico é a **vazão mínima noturna**: entre três e cinco da manhã o
consumo real cai ao mínimo, e o que continua passando pelo medidor de entrada do
setor é, em boa parte, vazamento. É a medição que transforma perda agregada em
vazamento localizado.

### O contrato que deixa de ser necessário

Um serviço autônomo de água e esgoto de porte menor que o de Angra dos Reis mantém
contrato de **R$ 532.825,48 por ano** **oficial** apenas para _operacionalizar_
seu sistema de telemetria — firmado em 2022, sucessivamente prorrogado e
reajustado, sem data para terminar e sem transferência de tecnologia.

É o comparável mais forte deste documento, porque é contrato público e
verificável. Executado por dentro, esse custo recorrente não se constitui: a
licença de software é R$ 0, o dado e o sistema são da autarquia, e trocar de
fornecedor deixa de ser decisão cara.

### O que executar por dentro custa

Seria desonesto comparar R$ 532 mil por ano com zero. Executar internamente tem
custo, e ele precisa estar declarado:

| Item                                              | Natureza                         | Ordem de grandeza                          |
| ------------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Servidor, armazenamento e cópia de segurança      | investimento e manutenção        | equipamento modesto, **a dimensionar**     |
| Enlaces de dados das unidades                     | recorrente                       | por unidade, **a levantar**                |
| Horas de pessoal próprio no desenvolvimento       | recorrente, já na folha          | redirecionamento, não contratação nova     |
| Plantão e sobreaviso da operação do sistema       | recorrente                       | **a definir** com a gestão                 |
| Capacitação da equipe de tecnologia               | investimento inicial             | cursos e horas                             |
| Contrato de retaguarda com empresa                | recorrente, acionado por demanda | fração do custo de um contrato de operação |
| Projeto elétrico e ART, por unidade instrumentada | por etapa                        | contratado, **obrigatório**                |

A comparação honesta não é "R$ 532 mil contra zero". É **um custo recorrente
grande, contratado e crescente, contra um custo menor, interno e sob controle da
autarquia — com a diferença decisiva de que, no segundo caso, o sistema e o dado
ficam.**

### A equipe que deixa de rodar o município

Não é reduzir quadro — é redirecioná-lo. Deixa de ser necessário deslocar servidor
para verificar nível, ligar e desligar bomba em rotina e, sobretudo, para
descobrir o que aconteceu na madrugada. A mesma equipe passa a fazer o que só ela
pode fazer: manutenção, inspeção dirigida pelo alarme e combate a vazamento
localizado.

A coleta de cloro **não** desaparece, e já registrei por quê: ela passa a ser
aferição, com frequência menor e finalidade diferente.

### Resumo — sem totalizar

Deliberadamente **não somo estas linhas**. Elas têm graus de confiança diferentes,
e um total único daria a esse conjunto uma precisão que ele não tem.

| Origem                                           | O que a sustenta                                       | O que falta apurar                                   |
| ------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| Contrato de operação de terceiro não constituído | contrato público de outra autarquia, R$ 532.825,48/ano | nada — é comparável direto                           |
| Insumo recuperado com redução de perdas          | ≈ R$ 327 mil/ano para 6 pontos percentuais **cálculo** | tarifa real de energia; custo real de químico        |
| Deslocamento do bombeamento para fora da ponta   | mecanismo conhecido e carga comprovadamente deslocável | enquadramento tarifário e reservação de cada unidade |
| Reagente e deslocamento da equipe de leitura     | caso público de outra autarquia                        | consumo real de reagente do SAAE                     |
| Falha detectada antes da quebra                  | corrente do conjunto denuncia com antecedência         | histórico próprio, que só a medição constrói         |

Não peço que estes números sejam aceitos como definitivos — peço que justifiquem o
primeiro passo, **cuja entrega é exatamente substituir toda estimativa desta tabela
por medição própria.** E o primeiro passo custa, como se verá, quase nada.

---

## 7. Por que dá para fazer aqui dentro

A pergunta legítima não é se a tecnologia funciona — ela funciona, e é a mesma que
as grandes operadoras usam. É se _esta_ autarquia consegue construir e manter.
Respondo com decisões de arquitetura, não com promessa de gestão.

### O que se executa dentro e o que se contrata fora

| Atividade                                         | Execução                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| Arquitetura, camada de serviços, banco e telas    | **interna**                                                                    |
| Registro digital, perfis de acesso e relatórios   | **interna**                                                                    |
| Integração dos instrumentos por Modbus e MQTT     | **interna**                                                                    |
| **Lógica de controle no controlador programável** | **capacitação interna ou contratação pontual — definido no projeto executivo** |
| Projeto elétrico e responsabilidade técnica       | **contratada — obrigatória**                                                   |
| Intervenção em painel de potência                 | **contratada — profissional habilitado**                                       |
| Instalação de instrumentação                      | interna com supervisão, ou contratada                                          |
| Operação e manutenção do sistema                  | interna                                                                        |

Declarar isto fortalece a proposta em vez de enfraquecê-la. Não proponho que a
equipe de tecnologia mexa em painel de potência, e não escondo que a programação
de controlador lógico é uma competência a constituir — por capacitação ou por
contratação pontual, decidido quando houver projeto executivo e não agora. O que
proponho é que a autarquia deixe de pagar continuamente por um sistema que pode
produzir, contratando fora exatamente aquilo que exige habilitação legal.

Vale notar que **a primeira etapa não depende dessa linha**: registro digital e
telemetria de leitura não envolvem lógica de controle.

### Como o sistema sobrevive à saída de quem o construiu

**É o maior risco deste projeto — maior que qualquer risco técnico**, e não adianta
fingir o contrário. A concentração de conhecimento em poucas pessoas se enfrenta
assim:

1. **Padrões abertos em vez de solução própria.** Todas as tecnologias escolhidas
   têm mercado de profissionais. Qualquer pessoa contratável assume um sistema
   feito com elas. _É a mitigação mais forte, e é decisão técnica, não promessa._
2. **Código público e documentado**, com registro escrito das razões de cada
   decisão.
3. **Nenhuma dependência de equipamento pessoal** — ambiente reproduzível, versões
   fixadas, tudo versionado.
4. **Verificação automatizada** — quem herdar o projeto herda também o instrumento
   que diz se ele está de pé.
5. **Formação da equipe de tecnologia desde o primeiro dia** — operar, monitorar e
   restaurar cópia de segurança não exige programar.
6. **Contrato de retaguarda** com empresa capaz de assumir o código, a uma fração
   do custo de um contrato de operação — contratável justamente porque o código é
   aberto.

### Publicar o código

Proponho publicar o código sob licença livre, em repositório público:
independência de fornecedor, auditabilidade por tribunal de contas, manutenção
compartilhada com outras autarquias e continuidade — código publicado não se perde
com a saída de um servidor. A linha de corte é definida antes de o repositório
existir: publica-se o código, a estrutura do banco e a lógica de controle;
**nunca** se publica endereço de rede, topologia real, senha, certificado ou
parâmetro de proteção ajustado. Código no repositório público, configuração em
arquivo restrito, jamais versionados juntos.

### Os riscos, sem maquiagem

| Risco                                                  | Prob. | Impacto    | Mitigação                                                                      |
| ------------------------------------------------------ | ----- | ---------- | ------------------------------------------------------------------------------ |
| **Concentração de conhecimento em poucas pessoas**     | alta  | alto       | as seis decisões acima, integralmente                                          |
| Programação de controlador é competência a constituir  | alta  | médio      | não é necessária na primeira etapa; capacitação ou contratação pontual         |
| Resistência técnica ao acionamento à distância         | média | alto       | escada de quatro degraus; chave física; proteção independente; ART de terceiro |
| Descontinuidade entre gestões                          | média | alto       | cada etapa entrega valor sozinha e pode parar sem perda do investido           |
| Levantamento revelar custo maior                       | média | médio      | custo por tipo de unidade, recalculável; levantamento antecede compromisso     |
| Incidente de segurança da informação                   | baixa | muito alto | planos separados; nada de campo exposto; disciplina de publicação              |
| Falha de comunicação isolar unidade                    | alta  | baixo      | autonomia local — é premissa da arquitetura, não remendo                       |
| **Expectativa acima do que a primeira entrega cumpre** | alta  | médio      | este documento; distinção explícita entre demonstrado e projetado              |

O último merece atenção especial. A demonstração convence porque funciona de
verdade — mas o que funciona nela é um **modelo**, não a planta do município.
Confundir os dois gera promessa que a primeira entrega não cumpre, e credibilidade
perdida na primeira entrega não se recupera.

---

## 8. O que a autarquia ganha em posição

Os capítulos anteriores tratam de operação e de custo. Este trata de outra coisa,
que também é resultado: **a posição institucional da autarquia** — diante do
cidadão, dos órgãos de controle, do marco regulatório e do próprio setor de
saneamento. Registro em ordem de peso.

### 1. O risco de fazer é baixo, e o de não fazer não é

Começo por aqui porque é o que mais importa numa decisão administrativa.

**Nenhuma etapa deste projeto depende da seguinte para ter valor.** A etapa 0 —
registro digital — não toca em nenhuma unidade em operação, não mexe na lógica de
nenhuma bomba, não exige projeto elétrico, não exige licitação de equipamento, e
entrega série histórica em semanas. A etapa 1 acrescenta instrumento onde se
decidir acrescentar, uma unidade por vez. **Se o projeto parar em qualquer ponto,
o que já foi entregue continua funcionando e nada se perde.**

Não há, em nenhum momento, um ponto em que a autarquia fique dependente de uma
entrega futura para que a anterior faça sentido. É o oposto do risco de um
contrato de sistema, em que se paga adiantado por um todo que só existe no fim.

### 2. Pioneirismo verificável, e com efeito multiplicador

Em pesquisa realizada, **não localizei sistema de telemetria e supervisão de
saneamento publicado em código aberto por prestador público no Brasil**. Se
confirmado, isso coloca Angra dos Reis numa posição incomum: não a de quem adotou
uma tecnologia, mas a de quem **produziu** uma.

O que dá peso a isso não é o adjetivo, é a consequência prática. Existem centenas
de autarquias municipais no Brasil com exatamente o mesmo problema descrito no
capítulo 1 e sem orçamento para telemetria proprietária. Um sistema publicado sob
licença livre pode ser adotado por elas sem custo de licença e sem pedir
autorização a ninguém — e o nome que fica no repositório é o de quem publicou.

Na prática, isso significa: apresentação em congresso setorial, artigo técnico,
candidatura a prêmio de gestão pública e de saneamento, procura por outras
autarquias, e a posição de referência num assunto em que o município normalmente é
comprador. **É o tipo de projeção que orçamento nenhum compra**, porque ela decorre
de ter feito, e não de ter contratado.

### 3. O marco legal cobra exatamente isto

A Lei 14.026/2020 reorganizou o saneamento no país e estabeleceu metas de
universalização a serem cumpridas até 2033, com normas de referência editadas pela
Agência Nacional de Águas e Saneamento Básico. Prestadores públicos precisam
**comprovar capacidade econômico-financeira e de gestão** para manter a prestação
do serviço, e há pressão estrutural pela regionalização.

Traduzido para o que interessa aqui: **prestador que mede é prestador que
comprova.** Indicador apurado por medição própria, com série histórica e trilha de
auditoria, é de outra natureza que indicador autodeclarado a partir de estimativa.
Para uma gestão que pretende manter o serviço sob administração municipal,
instrumentação deixa de ser melhoria operacional e passa a ser **instrumento de
sustentação institucional**.

### 4. Transparência e posição diante do controle externo

Tribunal de contas, Ministério Público, vigilância sanitária, câmara de vereadores
e imprensa local fazem perguntas — e a diferença entre responder com registro e
responder com memória é a diferença entre encerrar um questionamento e alimentá-lo.

Com o sistema, a autarquia passa a poder demonstrar, com data e hora: qual era o
cloro residual naquele dia naquela unidade; quanto tempo a elevatória ficou parada
e por quê; quando o alarme disparou e o que foi feito. **Código aberto acrescenta
uma camada a mais**: o próprio critério de cálculo dos indicadores fica
inspecionável, o que é uma posição confortável de se ocupar numa auditoria e
desconfortável de se contestar.

Vale registrar o inverso também, sem rodeio: um sistema que registra tudo registra
também o que der errado. É uma escolha de gestão, e é a escolha que se sustenta ao
longo do tempo.

---

## O que peço

Duas coisas, de portes muito diferentes. A primeira não custa praticamente nada e
pode começar imediatamente.

### 1. Autorização para executar a etapa 0 — o registro digital

**Sem aquisição, sem intervenção em unidade, sem projeto elétrico.** Construir e
colocar em uso o registro digital das leituras: lançamento pelo laboratório e pelo
pessoal de campo, perfis de acesso, série histórica consultável, boletim gerado e
consulta pela gerência e pela diretoria.

Prazo de semanas. Custo: horas de trabalho e um servidor modesto — que pode ser,
para começar, o que a autarquia já tiver.

Ao final desta etapa, a ficha de papel deixa de ser o único registro, e a autarquia
passa a ter série histórica **a partir daquele dia** — inclusive das leituras
feitas com o comparador de prisma que já está em uso.

### 2. Autorização para a prova de conceito em bancada e o levantamento de campo

**Sem nenhuma intervenção em unidade em operação.** Custo de material entre
**R$ 5.500 e R$ 16.500**, prazo de semanas.

A bancada demonstra a cadeia inteira — sensor, concentrador, MQTT, banco, tela,
alarme e relatório — com instrumentos reais de **pH, pressão, nível e grandezas
elétricas**, todos dentro dessa faixa de custo.

**Sobre o analisador de cloro, sendo direto:** ele custa por volta de R$ 17 mil e
**não cabe nesta faixa**. Proponho buscar unidade de demonstração ou cessão
temporária junto a distribuidor para o período da bancada; não havendo, o
analisador entra como item destacado da etapa seguinte, e a bancada demonstra a
cadeia com os demais instrumentos. Prefiro registrar isso agora a prometer o que a
verba pedida não paga.

O levantamento de campo entrega, ao final: o inventário do que existe instalado, o
consumo real de energia e **o enquadramento tarifário de cada unidade** apurados
nas próprias faturas, e cotações formais de equipamento.

**A partir daí, toda estimativa deste documento pode ser substituída por número
próprio, e a decisão sobre instrumentar a primeira unidade será tomada sobre
fatos.**

---

## Anexo I — Glossário

| Termo                              | Significado                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Telemetria                         | medir grandezas à distância, sem deslocar pessoa até o local                                                                      |
| Supervisório                       | sistema que reúne as medições de várias unidades numa visão única e permite operá-las                                             |
| Concentrador de telemetria         | equipamento que lê os instrumentos da unidade, carimba o horário, guarda e transmite — sem decidir                                |
| Controlador lógico programável     | computador industrial que executa a lógica de controle dentro da unidade                                                          |
| Comparador colorimétrico de prisma | instrumento de leitura visual de cloro e pH: compara a cor da amostra com um disco de padrões                                     |
| DPD                                | reagente que desenvolve cor na presença de cloro livre, base da leitura colorimétrica                                             |
| Intertravamento                    | condição que impede uma ação perigosa, independentemente de quem a tenha comandado                                                |
| Sinal de 4 a 20 mA                 | padrão industrial de sinal analógico; fio rompido lê zero e denuncia a própria falha                                              |
| Modbus                             | protocolo industrial de leitura e escrita em instrumento, universalmente aceito                                                   |
| MQTT                               | protocolo de troca de mensagens projetado para enlaces ruins e intermitentes                                                      |
| Sparkplug                          | especificação sobre o MQTT: a estação declara o que mede, avisa quando cai e carimba o horário                                    |
| IEC 61131-3                        | norma das linguagens de programação de controlador industrial                                                                     |
| Área classificada                  | local com risco de atmosfera explosiva, que exige equipamento certificado para tanto                                              |
| Inversor de frequência             | faz o motor girar na rotação desejada, em vez de apenas ligado ou desligado                                                       |
| Altura estática                    | desnível a vencer no recalque, independente da vazão — é o que limita o ganho do inversor                                         |
| Malha fechada                      | controle em que a própria medição corrige a ação                                                                                  |
| Horário de ponta                   | três horas dos dias úteis em que a energia elétrica é várias vezes mais cara, nas modalidades tarifárias que fazem essa distinção |
| Demanda contratada                 | potência contratada da distribuidora, paga independentemente de usar                                                              |
| Vazão mínima noturna               | detecção de vazamento pela vazão que persiste na madrugada, quando o consumo real é mínimo                                        |
| Autonomia de borda                 | a unidade continua operando e registrando mesmo sem comunicação com a sede                                                        |
| Perfil de acesso                   | conjunto de permissões associado a uma função — quem vê o quê, e quem pode fazer o quê                                            |
| Software livre                     | programa que pode ser usado, estudado, modificado e redistribuído sem pagamento de licença                                        |

## Anexo II — Normas e legislação de referência

| Norma                     | Objeto                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| ISA-101                   | filosofia de interface de operação e hierarquia de telas           |
| ISA-18.2 / EEMUA 191      | gestão de alarmes: banda morta, atraso de confirmação, taxa        |
| ISA-5.1 / ISO 14617       | simbologia de instrumentação e de processo                         |
| IEC 61131-3               | linguagens de programação de controlador industrial                |
| IEC 62443                 | segurança cibernética em sistemas de automação industrial          |
| ABNT NBR IEC 60079        | equipamento para atmosferas explosivas — poço de esgoto            |
| ABNT NBR 5410             | instalações elétricas de baixa tensão                              |
| ABNT NBR 5419             | proteção contra descargas atmosféricas                             |
| NBR 12218                 | projeto de rede de distribuição de água — pressões mínima e máxima |
| NBR 12217                 | projeto de reservatório de distribuição de água                    |
| NBR 9648 / NBR 9649       | concepção e projeto de sistemas de esgoto sanitário                |
| NEMA MG-1                 | desequilíbrio de tensão admissível em motor elétrico               |
| Portaria GM/MS 888/2021   | padrão de potabilidade da água para consumo humano                 |
| Resolução CONAMA 430/2011 | condições e padrões de lançamento de efluentes                     |
| Lei 14.026/2020           | marco legal do saneamento — metas e capacidade de prestação        |
| Lei 14.133/2021           | licitações e contratos — padrões abertos e interoperabilidade      |
| NR-10 e NR-12             | segurança em instalações elétricas e em máquinas                   |

## Anexo III — Fontes

Consultadas em 22 de agosto de 2026.

| Fonte                                                                                                                                                                                                 | O que sustenta                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Instituto Água e Saneamento — Angra dos Reis](https://www.aguaesaneamento.org.br/municipios-e-saneamento/rj/angra-dos-reis)                                                                          | indicadores SINISA 2024 e base populacional do Censo IBGE 2022 |
| [Diagnóstico SNIS de Água e Esgotos](https://www.gov.br/mdr/pt-br/assuntos/saneamento/snis/diagnosticos-anteriores-do-snis/agua-e-esgotos-1/2019/2-Diagnstico_SNIS_AE_2019_Republicacao_31032021.pdf) | índice nacional de 0,59 kWh por metro cúbico                   |
| [Glossário de Indicadores do SNIS](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis/produtos-do-snis/diagnosticos/Glossario_Indicadores_AE2022.pdf)             | definição e fórmula dos indicadores de perdas e energia        |
| [Eficiência energética em sistemas de abastecimento](https://tratamentodeagua.com.br/artigo/eficiencia-energetica-sistemas-abastecimento-agua/)                                                       | cerca de 90 % da energia em conjuntos motobomba                |
| [Termo aditivo a contrato de telemetria](https://saaemanhuacu.mg.gov.br/processos-licitatorios/download/file?fid=15.397)                                                                              | R$ 532.825,48/ano só pela operacionalização                    |
| [Estrutura tarifária — horário de ponta](https://www.cubienergia.com/horario-de-ponta-horario-de-pico/)                                                                                               | relação de três a cinco vezes                                  |
| [Ranking do Saneamento — Trata Brasil](https://tratabrasil.org.br/wp-content/uploads/2024/04/Relatorio-Completo-Ranking-do-Saneamento-de-2024-TRATA-BRASIL-GO-ASSOCIADOS.pdf)                         | contexto nacional de perdas e a meta de 25 %                   |
| [Analisador de cloro — serviço municipal](https://www.semae.sp.gov.br/novo-analisador-de-cloro-torna-controle-da-agua-mais-eficiente-e-economico/)                                                    | caso público: R$ 17 mil investidos, ~R$ 13 mil/ano em reagente |
| [Monitor de cloro residual e pH em linha](https://www.vikacontrols.com.br/produto/monitor-de-cloro-residual/)                                                                                         | analisador amperométrico com saída Modbus                      |
| [Comparador colorimétrico de prisma](https://www.dellab.com.br/)                                                                                                                                      | o instrumento da rotina manual descrita no capítulo 1          |
| [Transmissor de pressão industrial](https://hidroveda.com.br/produtos/transmissor-de-pressao-a-10-0-250-bar-g-4-20-ma-2-fios-alimentacao-8-30-v-dc/)                                                  | preço de referência de R$ 1.418,46                             |
| [Medidor de vazão eletromagnético](https://www.smartinstec.com.br/produto/medidor-de-vazao-tipo-eletromagnetico/)                                                                                     | versões de carretel e inserção, saídas 4–20 mA, pulso e Modbus |
| [Transmissor de nível por radar](https://www.smartinstec.com.br/produto/transmissor-de-nivel-tipo-radar-ultra-sensor/)                                                                                | medição sem contato para poço de esgoto                        |
| [Multimedidor de grandezas elétricas](https://www.kron.com.br/produto/mult-k-05/)                                                                                                                     | energia acumulada por RS-485 com Modbus                        |
| [Inversor de frequência de fabricante nacional](https://loja.csaautomacao.com.br/produto/inversor-de-frequencia-weg-cfw300-cfw300a06p0s2nb20/)                                                        | rotação ajustável e módulo plug-in RS-485                      |
| [Controlador industrial aberto](https://docs.arduino.cc/hardware/opta/)                                                                                                                               | controlador certificado com linguagens normalizadas            |
| [Fabricante de supervisório proprietário](https://inductiveautomation.com/distributor-landing/portugues)                                                                                              | ausência de preço público                                      |

**A levantar no levantamento de campo:** faturas de energia da autarquia e
**enquadramento tarifário de cada unidade**, consumo específico e despesas por
metro cúbico na série histórica, plano municipal de saneamento básico, inventário
das unidades, consumo real de reagente e cotações formais.

**Sobre as fotografias.** As imagens de instrumento e equipamento na versão
publicada vêm do catálogo dos respectivos fabricantes e distribuidores, creditadas
ao pé de cada figura, e servem apenas para identificar visualmente o tipo de
equipamento — não constituem indicação de marca nem recomendação de fornecedor. As
fotografias de instalação vêm do Wikimedia Commons. A relação completa está em
[`creditos-imagens.md`](creditos-imagens.md).

---

_Este é um pré-projeto: propõe caminho e demonstra viabilidade, não constitui
projeto executivo. Os indicadores municipais provêm do Sistema Nacional de
Informações sobre Saneamento, são autodeclarados pelo prestador, referem-se a 2024
e podem divergir da operação atual; onde houver divergência, prevalece o dado
interno apurado. Os valores marcados como cálculo são estimativas de premissa
declarada e não constituem cotação. A demonstração que acompanha este documento
utiliza dados inteiramente simulados e não se conecta a equipamento real._

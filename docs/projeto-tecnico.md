# Digitalização, automação e controle operacional

**Proposta Técnica Preliminar**  
Serviço Autônomo de Água e Esgoto de Angra dos Reis  
Telemetria, supervisão e integração gradual dos processos operacionais  
**Autor:** Bruno Andrade · **Matrícula:** 190545  
Angra dos Reis · agosto de 2026

## Sobre esta proposta técnica preliminar

Este documento apresenta uma proposta técnica preliminar para digitalização, telemetria, automação e
supervisão operacional do SAAE de Angra dos Reis.

A proposta organiza uma possível sequência de implantação e apresenta referências de arquitetura,
equipamentos e tecnologias, mas não substitui levantamento de campo, projeto executivo,
especificação de equipamentos, orçamento formal, cronograma de obra ou responsabilidade técnica.

Quando são citados equipamentos, protocolos ou tecnologias, a finalidade é indicar tipo, função e
critério de escolha. A definição do que instalar, em qual unidade e com qual dimensionamento deve
ser feita posteriormente, com dados atuais e participação dos profissionais responsáveis pelas áreas
envolvidas.

As descrições operacionais deste documento se referem à rotina que conheci até o meu afastamento em
2020 e as informações públicas que consegui consultar. Não tenho acesso à situação interna atual e,
portanto, não sei quais procedimentos, equipamentos, contratos ou sistemas foram alterados desde
então.

O levantamento inicial proposto neste documento tem justamente essa finalidade: confirmar o que
permanece válido, registrar o que já evoluiu e substituir premissas por dados atuais da própria
autarquia.

## 1. Ponto de partida

Na rotina que conheci, uma parte relevante das informações operacionais era obtida por inspeção
local, leitura manual de instrumentos, telefone e registros em papel. Esses procedimentos cumprem
sua função, mas produzem dados descontínuos e exigem trabalho posterior de consolidação.

A proposta parte desse ponto: **preservar o que já funciona e acrescentar registro digital, medição
contínua e supervisão onde houver benefício demonstrável**.

### Bombeamento: comando local e pouca informação histórica

Conjuntos motobomba operavam, conforme a unidade, por comando manual ou por automação local simples,
como boia de nível. Esse tipo de comando pode funcionar adequadamente para ligar e desligar o
equipamento, mas não produz, por si só, informações como curva de nível, histórico de partidas,
horas por conjunto, relação entre consumo e horário ou evolução de grandezas elétricas.

Quando esses dados não são registrados, o rodízio entre conjuntos, a manutenção e a análise de
consumo dependem mais da rotina da equipe e de verificações locais. A instrumentação proposta
adiante não substitui essas proteções; acrescenta informação e, em etapas posteriores, permite
regras de controle mais completas.

### Cloro e pH: leitura pontual

O controle de cloro residual livre e pH utilizava **comparador colorimétrico visual de prisma**, do
tipo Dellab DLH-2000. A rotina consistia em coletar a amostra, aplicar o reagente, aguardar a reação
e comparar a cor observada com a escala do instrumento.

Esse procedimento é adequado à **verificação pontual**. Sua limitação para fins de supervisão é
temporal: entre uma leitura e outra não há registro contínuo da grandeza. Uma alteração transitória
que ocorra nesse intervalo pode não aparecer na ficha seguinte.

Um analisador em linha, se tecnicamente indicado e corretamente mantido, pode acrescentar esse
acompanhamento contínuo. A rotina laboratorial continua necessária para controle, verificação e
aferição segundo o método adotado pela autarquia e as exigências sanitárias aplicáveis.

### Registro em papel e consolidação manual

Cada leitura registrada em ficha precisa ser posteriormente armazenada, conferida e, quando
necessário, digitada para consolidação mensal. Esse processo consome tempo e cria pontos adicionais
de transcrição.

O principal ganho da digitalização não é substituir a coleta. É fazer com que o dado já nasça
estruturado: unidade, parâmetro, valor, data, hora e responsável. A partir daí, histórico, gráficos,
conferências e relatórios podem ser produzidos pelo próprio sistema.

### A rotina, atividade por atividade

| Atividade                         | Forma de execução que conheci      | Informação adicional que a digitalização pode produzir |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| Ligar e desligar bomba            | boia ou deslocamento               | horas, partidas, rodízio e horário                     |
| Ler cloro residual e pH           | comparador de prisma, com reagente | histórico estruturado e comparação entre períodos      |
| Verificar nível de reservatório   | inspeção visual ou comunicação     | curva de nível e tendência                             |
| Verificar nível de poço de esgoto | inspeção local                     | tendência de subida e alarme antecipado                |
| Registrar leitura                 | ficha preenchida manualmente       | consulta imediata, autoria e trilha de correção        |
| Consolidar o mês                  | digitação e cálculo                | relatório gerado a partir dos registros                |
| Identificar ocorrência            | inspeção, alarme local ou chamado  | correlação entre evento e grandezas registradas        |

A diferença essencial é passar de registros isolados para uma **série histórica consultável**, sem
retirar da equipe operacional a decisão sobre como a unidade deve ser conduzida.

### O que os indicadores públicos permitem observar

Os indicadores públicos consultados para o município são:

| Indicador                      | Valor            | Origem                      |
| ------------------------------ | ---------------- | --------------------------- |
| População total                | 179.120 hab      | **oficial** Censo IBGE 2022 |
| Volume de água produzido       | 13,641 mi m³/ano | **oficial** SINISA 2024     |
| Perdas na distribuição         | 21,3 %           | **oficial** SINISA 2024     |
| Esgoto tratado, sobre o gerado | 20,3 %           | **oficial** SINISA 2024     |
| Índice de hidrometração        | 73,9 %           | **oficial** SINISA 2024     |
| Consumo por habitante          | 239,6 L/dia      | **oficial** SINISA 2024     |

O índice de perdas informado, de **21,3 %**, está abaixo da média nacional usada como referência
neste documento. Isso é positivo. Ao mesmo tempo, o índice de hidrometração de **73,9 %** mostra que
uma parcela das ligações não é medida individualmente.

Essa condição não invalida os indicadores, que seguem a metodologia oficial, mas aumenta a
dependência de estimativas. Quanto maior a cobertura de medição e a macromedição da rede, maior a
capacidade da autarquia de conferir os próprios números, separar perdas reais de aparentes e
explicar variações ao longo do tempo.

O objetivo, portanto, não é partir da premissa de que o índice oficial está errado. É criar
condições para que ele possa ser **confrontado com medições mais detalhadas da própria operação**.

---

## 2. O que proponho

A implantação é dividida em quatro movimentos. Cada um deve produzir resultado independente antes de
avançar para o seguinte.

**Etapa 0 — digitalizar o registro.** A leitura feita pelo laboratório ou pela equipe de campo passa
a ser lançada diretamente no sistema, pelo telefone ou computador. O registro recebe autor e
horário, forma uma série histórica e alimenta os relatórios.

**Etapa 1 — digitalizar a medição.** Onde houver justificativa técnica, instrumentos em linha passam
a enviar medições ao mesmo banco de dados. A leitura manual e a medição automática passam a conviver
no mesmo histórico.

**Etapa 2 — automatizar.** Em unidades selecionadas, controladores locais podem executar regras de
operação como rodízio, limites de nível, intervalo mínimo entre partidas e programação horária,
sempre preservando as proteções físicas e os requisitos do projeto elétrico.

**Etapa 3 — supervisionar e controlar.** As unidades instrumentadas passam a ser visualizadas de
forma centralizada. Comando à distância só é considerado onde houver projeto, segurança, autorização
e procedimento operacional definidos.

### Por que começar pela etapa 0

A etapa 0 resolve um problema administrativo e operacional sem interferir em painel elétrico, bomba,
reservatório ou processo de tratamento. Exige principalmente software, banco de dados, perfis de
acesso e definição da rotina de registro.

Entregas previstas:

- lançamento pelo laboratório e pelo campo, com autor e horário;
- correção por novo registro, mantendo o anterior e a justificativa;
- consulta por unidade, parâmetro e período;
- geração de boletins e relatórios a partir dos dados registrados;
- alerta quando um valor lançado estiver fora da faixa configurada;
- consulta por perfis autorizados em computador ou telefone.

O custo dessa etapa tende a ser predominantemente de **horas de desenvolvimento, configuração e
infraestrutura de servidor**, aproveitando o que já existir na autarquia sempre que possível.

Quando instrumentos automáticos forem incorporados, eles podem alimentar a mesma estrutura de dados.
Assim, a série histórica iniciada com a leitura manual não precisa ser descartada.

### Princípios de arquitetura

**1. Preferência por padrões abertos.** Sempre que tecnicamente possível, a especificação deve
privilegiar protocolos documentados, formatos de dados abertos e componentes sem dependência
exclusiva de um único fornecedor. Isso reduz custo de migração e amplia as alternativas de
manutenção futura.

**2. Proteção crítica independente do software de supervisão.** Boias, relés, intertravamentos
elétricos e demais proteções necessárias devem continuar atuando mesmo que servidor, rede ou
interface estejam indisponíveis. O software acrescenta informação e controle; não deve ser a única
barreira de segurança.

**3. Dados sob controle da autarquia.** Banco de dados, políticas de cópia de segurança e capacidade
de exportação devem permanecer sob domínio do SAAE, independentemente de quem forneça sensores ou
serviços de apoio.

> **Sobre a demonstração que acompanha esta proposta.** A maquete utiliza **dados simulados**. Ela
> serve para demonstrar conceitos de interface, simulação, alarmes e intertravamentos. Não
> representa a planta atual do município e não deve ser tratada como sistema já implantado.

---

## 3. Demonstração interativa

Esta proposta é acompanhada por uma demonstração interativa do sistema de supervisão proposto.

A demonstração pode ser acessada em:

**[https://saae-painel.pages.dev/](https://saae-painel.pages.dev/)**

Ela foi desenvolvida para uso em **computador ou notebook**, em formato semelhante ao de uma estação
de trabalho ou telão de sala de controle.

### O que a demonstração apresenta

O painel reúne, em ambiente simulado, telas de visão geral, sinóptico, unidades, automação, rede e
pressão, qualidade, esgoto e relatórios.

Também permite observar alarmes, históricos, intertravamentos, rodízio de conjuntos, alteração de
setpoints e cenários de falha.

### Limites da demonstração

Todos os valores operacionais são **simulados**. O painel não está conectado a equipamentos ou
sistemas do SAAE.

Nomes e localizações de algumas unidades correspondem a referências reais, mas capacidades, vazões,
setpoints, traçados e demais parâmetros podem ser aproximados ou estimados.

A finalidade é demonstrar conceitos de interface, supervisão e automação. A configuração real deverá
ser definida posteriormente, a partir de levantamento de campo e das condições atuais da autarquia.

---

## 4. Arquitetura técnica proposta

A arquitetura é dividida em camadas para permitir que campo, comunicação, servidor e interface
evoluam de forma relativamente independente.

| Camada                 | Tecnologias de referência                                        | Critério principal                                                      |
| ---------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Campo**              | 4–20 mA, Modbus RTU e outros padrões conforme o instrumento      | interfaces industriais documentadas e compatíveis com a aplicação       |
| **Aquisição local**    | concentrador de telemetria; CLP quando houver lógica de controle | autonomia local e manutenção industrial                                 |
| **Enlace até a sede**  | MQTT, com Sparkplug quando aplicável                             | tolerância a enlace intermitente e identificação estruturada dos pontos |
| **Servidor**           | Debian/Ubuntu, containers, Mosquitto, PostgreSQL/TimescaleDB     | tecnologias amplamente utilizadas e sem licença por ponto               |
| **Telas e relatórios** | serviços web, React e Grafana, conforme a função                 | separação entre regra de negócio, dados e interface                     |

Os protocolos acima são **referências preferenciais**, não uma restrição absoluta. Equipamentos
existentes podem utilizar outras interfaces, gateways ou protocolos, e isso deve ser verificado no
inventário de campo.

### Leitura e controle são etapas diferentes

Para apenas adquirir uma grandeza, um concentrador de telemetria pode ser suficiente. Um controlador
lógico passa a ser necessário quando a própria unidade precisa tomar decisões de processo.

| Função                                        | Solução típica                                     |
| --------------------------------------------- | -------------------------------------------------- |
| Somente medir e transmitir                    | concentrador de telemetria                         |
| Ajustar parâmetros de operação                | concentrador com saídas apropriadas ou controlador |
| Executar rodízio, partidas e intertravamentos | controlador lógico programável                     |

A **primeira etapa de instrumentação não precisa alterar a lógica de controle da unidade**. O
instrumento e o concentrador podem operar em paralelo ao comando já existente. Se a telemetria for
retirada de serviço, a unidade deve continuar operando segundo sua lógica local atual.

### Decisões críticas devem permanecer locais

Rede de comunicação pode falhar. Por isso, funções necessárias à continuidade e à segurança da
unidade devem permanecer no próprio local, por lógica elétrica ou controlador adequado.

O servidor central supervisiona, armazena e apresenta informações. Em etapas posteriores, pode
enviar parâmetros ou comandos autorizados, mas a aceitação e os intertravamentos devem ser avaliados
localmente.

Se a comunicação cair, o concentrador deve continuar registrando as medições quando possuir
capacidade para isso e retransmiti-las após o restabelecimento do enlace, preservando o horário de
origem.

### Transporte das medições

Entre instrumento e aquisição local, **4–20 mA e Modbus** são interfaces comuns e adequadas a muitas
aplicações. Da unidade até a sede, **MQTT** é uma alternativa para transporte de mensagens; a
especificação **Sparkplug** acrescenta convenções para identificação de pontos, estado da estação e
carimbo de tempo.

O relógio do equipamento de aquisição deve permanecer sincronizado e possuir estratégia para
períodos sem comunicação. Dependendo do equipamento, isso pode envolver RTC com bateria e
sincronização por NTP ou mecanismo equivalente.

A frequência de transmissão também deve ser adequada à grandeza. Em muitos casos faz sentido
transmitir por mudança significativa e por intervalo máximo, evitando tráfego e armazenamento
desnecessários sem perder eventos relevantes.

Para o histórico, PostgreSQL com TimescaleDB é uma possibilidade adequada a séries temporais. O
dimensionamento de armazenamento deve ser feito depois de conhecido o número de pontos, a frequência
de amostragem e a política de retenção.

### O que arquitetura aberta significa na prática

| Situação                   | Maior dependência de fornecedor             | Arquitetura baseada em padrões abertos                              |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| Trocar um sensor           | pode exigir homologação específica          | tende a exigir menos adaptação quando as interfaces são compatíveis |
| Acrescentar unidade        | pode gerar nova licença por ponto           | software de servidor pode não ter custo adicional por ponto         |
| Exportar histórico         | pode depender do formato do fornecedor      | banco e formatos documentados facilitam exportação                  |
| Contratar manutenção       | universo restrito de fornecedores           | maior disponibilidade de profissionais e empresas                   |
| Auditar regras do software | depende do acesso concedido pelo fornecedor | código e critérios podem ser inspecionados quando publicados        |

Padrão aberto **não significa troca instantânea**. Mesmo dois equipamentos que utilizam Modbus podem
ter mapas de registradores, escalas e configurações diferentes. A vantagem é reduzir a barreira de
integração, não eliminá-la.

### Software de servidor

| Função                    | Programa de referência   | Licença                          |
| ------------------------- | ------------------------ | -------------------------------- |
| Sistema operacional       | Debian ou Ubuntu         | livre                            |
| Empacotamento de serviços | Docker ou Podman         | livre                            |
| Recepção das medições     | Mosquitto                | livre                            |
| Banco e histórico         | PostgreSQL + TimescaleDB | livre em configuração compatível |
| Camada de serviços        | Node.js + Fastify        | livre                            |
| Interface                 | React                    | livre                            |
| Monitoramento             | Prometheus + Grafana     | livre em configuração compatível |

A ausência de licença por ponto na camada de software não elimina outros custos: servidor,
armazenamento, enlaces, cópias de segurança, capacitação, suporte, equipamentos de campo e
manutenção permanecem necessários.

A IEC 61131-3 padroniza linguagens usadas em controladores industriais e **facilita a migração de
lógica entre plataformas**, mas não torna diferentes fabricantes inteiramente intercambiáveis.
Bibliotecas, blocos proprietários, endereçamento e ferramentas de engenharia podem exigir adaptação.

### Segurança da informação

Um sistema com possibilidade de interação com equipamento físico deve separar a rede de operação da
camada usada para consulta administrativa.

**Plano de campo e comando:**

- rede de automação segmentada da internet e, quando aplicável, da rede administrativa;
- comunicação com as unidades preferencialmente iniciada de dentro para fora;
- comando remoto restrito a rede e perfis definidos pela autarquia;
- autenticação dos equipamentos e comunicação cifrada onde houver suporte;
- nenhuma interface de controlador diretamente exposta à internet.

**Plano de consulta e lançamento:**

- interface web para consulta e lançamento de dados, conforme o perfil;
- autenticação forte e registro de acesso;
- sem rota direta entre a interface pública e controladores de campo;
- operações administrativas realizadas pela camada de serviços e banco de dados.

Nos dois planos devem existir trilha de auditoria e rotina de cópia de segurança com teste periódico
de restauração.

---

## 5. Equipamentos e critérios de escolha

Este capítulo apresenta tipos de instrumento e ordens de grandeza. **Não define quantidade, modelo
final ou unidade de instalação.** Esses itens dependem do levantamento de campo, das condições
hidráulicas e elétricas e do projeto executivo.

Os modelos citados servem como referência de função e preço. A especificação posterior deve admitir
alternativas tecnicamente equivalentes sempre que houver.

### Analisador de cloro residual livre e pH em linha

Instalado em derivação apropriada, permite acompanhar continuamente as grandezas e enviá-las ao
sistema.

- **Função:** complementar as verificações pontuais com acompanhamento contínuo;
- **Interfaces usuais:** 4–20 mA, Modbus e saídas de alarme, conforme o modelo;
- **Tecnologias:** amperométrica ou colorimétrica, com requisitos de manutenção diferentes;
- **Instalação:** exige condições adequadas de amostra, vazão, filtragem, calibração e manutenção;
- **Ordem de preço consultada:** aproximadamente **R$ 17 mil** **preço** para o instrumento de
  referência, sem infraestrutura e instalação.

O analisador em linha **não deve ser tratado como substituto automático dos procedimentos de
controle previstos na Portaria GM/MS 888/2021**. A relação entre medição contínua, método de
referência e rotina laboratorial deve ser definida com a área responsável pela qualidade da água.

Uma funcionalidade útil do sistema é registrar a leitura manual realizada no mesmo período da
medição automática. Com isso, torna-se possível acompanhar diferenças entre os dois registros e
identificar necessidade de verificação, limpeza ou calibração do analisador.

> **Referência de preço.** Um serviço municipal de saneamento do interior paulista divulgou
> investimento de aproximadamente **R$ 17 mil** em analisador de cloro e
> economia de cerca de **R$
> 13 mil por ano em reagente**. O caso serve apenas como referência externa; não é projeção de
> economia para o SAAE.

### Transmissor de pressão

A pressão medida continuamente ajuda a identificar condições de baixa pressão, excesso de pressão e
mudanças de comportamento da rede antes que a análise dependa somente de reclamações ou inspeção
posterior.

- **Comunicação comum:** 4–20 mA;
- **Locais possíveis:** saída de recalque, entrada de setor e pontos críticos;
- **Projeto:** deve considerar faixa de medição, proteção contra surto, válvula de bloqueio e
  condições de manutenção;
- **Ordem de preço consultada:** a partir de **R$ 1.418** **preço** para o instrumento de
  referência.

### Medição de vazão

A macromedição é necessária para balanço hídrico e setorização. A escolha do medidor depende de
exatidão requerida, diâmetro, material da tubulação, condição de instalação, possibilidade de parada
e custo total.

|                   | Eletromagnético                      | Ultrassônico externo                                         |
| ----------------- | ------------------------------------ | ------------------------------------------------------------ |
| Exatidão típica   | maior, conforme modelo e instalação  | menor e mais sensível às condições de instalação             |
| Instalação        | pode exigir intervenção na tubulação | instalado externamente                                       |
| Parada da adutora | pode ser necessária                  | normalmente não é necessária                                 |
| Uso típico        | macromedição permanente e balanço    | campanha, diagnóstico ou locais com restrição de intervenção |

Não existe escolha universal. Para balanço permanente, o eletromagnético tende a ser mais adequado
quando as condições de instalação permitem. Para campanha de medição ou locais onde não se pode
intervir na tubulação, o ultrassônico externo pode oferecer melhor relação entre informação e
facilidade de instalação.

### Medição de nível

A medição contínua de nível permite registrar a curva de reservatórios e poços e configurar alarmes
de tendência.

- **reservatório de água:** ultrassônico, radar ou hidrostático, conforme ambiente e geometria;
- **poço de elevatória de esgoto:** radar ou solução adequada à presença de vapor, espuma,
  incrustação e atmosfera classificada;
- **alternativa submersa:** transmissor hidrostático, com manutenção compatível com o meio;
- **interfaces:** 4–20 mA, HART ou Modbus, conforme o modelo.

Em poços de esgoto, a classificação de área e a seleção de equipamentos devem ser feitas por
profissional habilitado, considerando a série **ABNT NBR IEC 60079** e as condições reais da
instalação.

As boias de proteção não precisam ser retiradas. O medidor contínuo acrescenta informação; as
proteções independentes permanecem no circuito onde forem necessárias.

### Multimedidor de grandezas elétricas

Conjuntos motobomba representam parcela relevante do consumo de energia em sistemas de
abastecimento. Medir por painel ou por conjunto permite conhecer corrente, tensão, fator de
potência, potência e energia acumulada.

- **Comunicação típica:** RS-485/Modbus;
- **Ordem de preço consultada:** aproximadamente **R$ 519 a R$ 910** **preço**;
- **Itens adicionais:** transformadores de corrente, proteção, bornes, cabeamento e intervenção por
  profissional habilitado.

### Monitoramento de conjuntos motobomba

Algumas informações úteis podem ser obtidas com medição elétrica e sinais já existentes no painel:

| Grandeza                | Origem possível  | Uso                                 |
| ----------------------- | ---------------- | ----------------------------------- |
| Corrente nas fases      | multimedidor     | acompanhar mudança de comportamento |
| Tensão e desequilíbrio  | multimedidor     | avaliar qualidade da alimentação    |
| Energia acumulada       | multimedidor     | consumo por unidade ou conjunto     |
| Estado ligado/desligado | contato auxiliar | horímetro e número de partidas      |
| Falha de proteção       | entrada digital  | registrar instante da parada        |
| Horas e partidas        | contador local   | apoiar rodízio e manutenção         |

Mudanças persistentes de corrente, vibração ou temperatura **podem indicar alteração de condição do
equipamento**, mas diagnóstico de falha exige histórico, limites adequados e avaliação de
manutenção. O sistema deve apoiar essa análise, não substituir o diagnóstico técnico.

### Inversor de frequência

Inversor de frequência e automação do comando são assuntos relacionados, mas não idênticos. É
possível implementar rodízio, intervalos de partida e controle por nível com partida convencional. O
inversor passa a ser interessante quando há benefício em variar rotação, por exemplo para controle
de pressão ou vazão.

Em recalques com altura estática predominante, a economia obtida pela redução de rotação deve ser
avaliada pela curva real do sistema. Por isso, a decisão de usar inversor deve ficar para o projeto
executivo.

Quando aplicado, o projeto deve considerar motor, harmônicas, comprimento de cabo, ventilação,
proteção e condições do painel. A intervenção pertence à disciplina elétrica e deve ter
responsabilidade técnica correspondente.

### Controlador lógico programável

O CLP entra quando a unidade precisa executar decisões locais: rodízio, partida, parada,
intertravamentos e tratamento de comandos.

A programação em linguagens previstas na **IEC 61131-3** favorece manutenção e migração, mas a
portabilidade entre marcas deve ser verificada caso a caso.

A primeira etapa de leitura pode ser implantada sem alterar a lógica de controle e, portanto, sem
exigir CLP novo onde ele não for necessário.

### Pontos de rede sem alimentação local

Pressão e vazão em setores podem precisar ser medidas em locais sem painel ou energia. Nesses casos,
uma alternativa é **datalogger autônomo**, com bateria e comunicação própria, configurado para
registrar continuamente e transmitir em intervalos compatíveis com a autonomia desejada.

### Infraestrutura de painel e comunicação

O custo de instrumentação inclui fonte, proteção contra surto, aterramento, grau de proteção,
separação entre circuitos de potência e sinal, cabeamento, conectividade e adequações civis ou
elétricas.

A comunicação pode variar por unidade: fibra, rede móvel, rádio ou solução específica para áreas
insulares. Essa diversidade reforça a necessidade de **autonomia local** quando a unidade possui
função de controle.

### Faixas preliminares por tipo de unidade

As faixas abaixo são apenas **cálculo preliminar de material**, sem instalação, obra ou projeto
executivo. Devem ser refeitas depois do inventário.

| Tipo de unidade                 | Instrumentação considerada                       | Faixa preliminar |
| ------------------------------- | ------------------------------------------------ | ---------------- |
| Captação                        | nível, pressão, vazão e energia                  | R$ 24 – 72 mil   |
| Elevatória de água              | níveis, pressões, vazão e energia                | R$ 38 – 103 mil  |
| Reservatório                    | nível, pressão, vazão, cloro e pH                | R$ 38 – 94 mil   |
| Elevatória de esgoto            | nível, energia e requisitos de área classificada | R$ 20 – 58 mil   |
| Estação de tratamento de esgoto | nível, vazão, OD, pH e energia                   | R$ 39 – 105 mil  |
| Ponto de rede por setor         | pressão e vazão, com solução autônoma            | R$ 15 – 42 mil   |

A primeira implantação pode usar apenas parte dessa instrumentação. Não há motivo para adquirir
todos os itens antes de o levantamento indicar onde cada medição produz benefício.

---

## 6. Integração e operação

O valor do sistema está na ligação entre registro, medição, histórico, alarme e relatório. Os
exemplos abaixo mostram como essa cadeia pode funcionar.

### Caso 1 — registro de cloro em duas etapas

**Etapa 0:** mantém a leitura atual e muda apenas o registro.

> coleta → leitura no instrumento → lançamento no sistema → histórico e relatório

**Etapa 1:** acrescenta acompanhamento automático onde houver analisador.

> analisador em linha → aquisição local → comunicação → banco → histórico, alarme e relatório

A leitura manual continua registrada e pode ser usada para comparação e controle da medição
automática, conforme procedimento definido pela área responsável.

| Situação atual conhecida                       | Etapa 0                              | Etapa 1                                             |
| ---------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| Leitura anotada em ficha                       | registro digital com autor e horário | medição automática e registro manual de verificação |
| Consolidação posterior                         | relatório gerado                     | relatório gerado                                    |
| Alteração entre duas visitas pode não aparecer | alerta no momento do lançamento      | possibilidade de alarme contínuo                    |
| Histórico disperso em fichas                   | série histórica desde a implantação  | mesma série acrescida da medição automática         |

Automação da dosagem em malha fechada **não faz parte desta primeira proposta**. Se futuramente for
considerada, deve depender de histórico de estabilidade, limites de segurança, projeto de processo e
responsabilidade técnica.

### Caso 2 — bombeamento com lógica local

Em etapa posterior, um controlador pode considerar:

| Informação                       | Origem                 | Aplicação possível                                |
| -------------------------------- | ---------------------- | ------------------------------------------------- |
| Nível do reservatório de destino | medidor de nível       | faixa de partida e parada                         |
| Horas de cada conjunto           | contador local         | rodízio                                           |
| Horário                          | relógio do controlador | programação operacional                           |
| Pressão                          | transmissor            | controle de pressão quando aplicável              |
| Corrente                         | multimedidor           | alarme e bloqueio conforme critério de engenharia |
| Tempo desde a última partida     | temporizador           | reduzir partidas sucessivas                       |

Um comando remoto não deve atuar diretamente sobre o contator. Ele deve ser interpretado pelo
controlador local e submetido aos intertravamentos definidos no projeto.

### Barreiras para comando remoto

Uma arquitetura possível é:

```text
interface na rede autorizada
  ↓
serviço autentica, autoriza e registra a solicitação
  ↓
controlador recebe uma solicitação de comando
  ↓
intertravamentos locais verificam as condições
  ↓
chave física Local / Desligado / Remoto
  ↓
proteções elétricas e de processo independentes
  ↓
saída de comando
```

Princípios:

1. a chave física local deve ter prioridade sobre o comando remoto;
2. o controlador deve validar as condições antes de executar;
3. recusas e comandos devem entrar na trilha de auditoria;
4. perda de comunicação deve levar a um estado local previamente definido e seguro para aquela
   unidade;
5. comando deve ficar restrito à rede, aos equipamentos e aos perfis autorizados.

O comportamento em falha **não pode ser genérico**. Cada unidade precisa ter seu estado seguro
definido no projeto e no procedimento operacional.

### Liberação gradual

A passagem de leitura para comando pode ser feita por degraus:

| Degrau | Função                           | Condição mínima                                                    |
| ------ | -------------------------------- | ------------------------------------------------------------------ |
| **1**  | somente leitura                  | instalação e validação da medição                                  |
| **2**  | ajuste de parâmetros autorizados | controlador e procedimento                                         |
| **3**  | comando assistido                | projeto, ART quando aplicável e ensaio documentado                 |
| **4**  | comando remoto pleno             | histórico satisfatório da etapa anterior e autorização operacional |

Não há necessidade de avançar para o próximo degrau se o anterior já resolver a demanda da unidade.

### Perfis de acesso

| Perfil                       | Funções principais                              |
| ---------------------------- | ----------------------------------------------- |
| Operação / sala de controle  | consulta e, onde autorizado, comando            |
| Laboratório                  | lançamento de leitura e verificação             |
| Operacional / campo          | lançamento de leitura, ocorrência e intervenção |
| Gerência                     | consulta                                        |
| Diretoria e presidência      | consulta                                        |
| Auditoria e controle interno | consulta e trilha de auditoria                  |

O sistema deve tratar lançamento como **registro**, não como edição livre. Uma correção gera novo
lançamento com justificativa e mantém o valor anterior para consulta.

---

## 7. Benefícios e hipóteses econômicas

Nesta etapa preliminar, valores econômicos devem ser tratados como **ordem de grandeza ou cenário a
verificar**, não como promessa de economia.

### Energia

Não localizei indicador municipal público de consumo de energia elétrica do sistema. A partir do
volume produzido — **13,641 milhões de m³/ano** — e da referência nacional de **0,59 kWh/m³**,
obtém-se aproximadamente **8,05 GWh/ano** **cálculo**.

Essa conta serve apenas para dimensionar ordem de grandeza. O consumo específico local pode ser
diferente por topografia, tecnologia de tratamento, eficiência dos conjuntos e condições
operacionais. O valor correto deve ser obtido nas faturas e nos registros da própria autarquia.

### Horário de ponta

Em unidades enquadradas em modalidade horária, pode haver benefício em deslocar parte do bombeamento
para fora do horário de ponta **quando existir reservação e margem operacional suficientes**.

O ganho não pode ser calculado sem conhecer, por unidade:

- modalidade e grupo tarifário;
- demanda contratada;
- curva de consumo;
- capacidade útil do reservatório;
- restrições hidráulicas e operacionais.

O levantamento das faturas deve anteceder qualquer afirmação de economia. A telemetria
posteriormente permite comparar a estratégia com o consumo real.

### Perdas de água

O indicador público de **21,3 % de perdas na distribuição** reúne informações que dependem de
volumes produzidos, distribuídos e consumidos. Sem uma decomposição local mais detalhada, **não é
correto tratar todo esse percentual como perda física recuperável** nem multiplicá-lo diretamente
pelo custo de produção para afirmar uma economia.

A contribuição da telemetria é outra: macromedição por setor, pressão e vazão noturna permitem
localizar onde aprofundar a investigação. A partir daí, programas de redução de perdas podem
combinar setorização, controle de pressão, pesquisa de vazamentos, substituição de rede e melhoria
da micromedição.

A **vazão mínima noturna** é uma das técnicas úteis para esse diagnóstico, desde que interpretada
com conhecimento do consumo legítimo do setor e das condições de operação.

### Referência de custo de serviço externo

Foi localizada referência pública de outra autarquia com contrato de aproximadamente **R$ 532.825,48
por ano** **oficial** para operacionalização de sistema de telemetria.

Esse valor é útil como comparação de ordem de grandeza, mas **não demonstra que o SAAE teria o mesmo
custo nem que toda contratação externa deixaria de ser necessária**. Uma implantação interna pode
reduzir a dependência de operação terceirizada e aproveitar competências já existentes no quadro da
autarquia. Projeto, responsabilidade técnica, instalação e manutenção podem ser executados por
profissionais próprios quando houver atribuição profissional compatível, condições de segurança e
disponibilidade operacional. Contratação externa permanece como alternativa para escopos que não
possam ser atendidos internamente ou que exijam apoio especializado.

### Custos de execução interna

| Item                                                    | Natureza                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Servidor, armazenamento e cópia de segurança            | investimento e manutenção                                                     |
| Enlaces das unidades                                    | recorrente                                                                    |
| Horas de desenvolvimento e administração                | pessoal próprio                                                               |
| Plantão ou sobreaviso, se necessário                    | a definir pela gestão                                                         |
| Capacitação                                             | investimento inicial e contínuo                                               |
| Apoio especializado, se necessário                      | equipe própria e/ou contratação eventual                                      |
| Horas técnicas de engenharia e responsabilidade técnica | quadro próprio quando houver atribuição compatível; contratação se necessária |
| Instrumentação e instalação                             | investimento, horas de equipe e manutenção                                    |

A comparação adequada é entre **custo total de propriedade**, continuidade, capacidade de manutenção
e independência tecnológica — não apenas entre licença de software e valor de contrato. O
aproveitamento de profissionais do próprio quadro pode reduzir custos externos, desde que
respeitadas as atribuições profissionais, as condições de segurança e a disponibilidade das equipes.

### Redução de deslocamentos de rotina

Medição remota pode reduzir deslocamentos destinados exclusivamente a conferir nível, estado ou
leitura que já esteja disponível no sistema. Isso não significa redução automática de quadro. O
tempo pode ser redirecionado para inspeção, manutenção, calibração e atendimento de ocorrências
indicadas pelos próprios dados.

---

## 8. Capacidade de execução e continuidade

A tecnologia utilizada é conhecida no mercado. O desafio principal é organizar responsabilidades,
documentar a solução e evitar concentração excessiva de conhecimento.

### Competências envolvidas na execução

O SAAE dispõe de profissionais das áreas de elétrica e engenharia civil. Antes de prever contratação
externa para projeto, instalação ou responsabilidade técnica, o levantamento inicial deve
identificar as atribuições profissionais registradas, a experiência disponível e a capacidade
operacional dessas equipes. A contratação externa passa a ser uma opção para complementar
competências ou capacidade, e não uma premissa do projeto.

| Atividade                                   | Forma proposta                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Camada de serviços, banco e telas           | desenvolvimento interno                                                                                 |
| Registro digital, perfis e relatórios       | desenvolvimento interno                                                                                 |
| Integração de protocolos de telemetria      | interna, com apoio quando necessário                                                                    |
| Lógica de CLP                               | verificar conhecimento existente; capacitação interna e/ou apoio pontual se necessário                  |
| Projeto elétrico e responsabilidade técnica | equipe própria com profissional habilitado e atribuição compatível; contratação se necessária           |
| Intervenção em painel de potência           | equipe própria habilitada, quando houver atribuição e condições de segurança; contratação se necessária |
| Instalação de instrumentação                | equipe própria, execução conjunta ou contratada, conforme disciplina, atribuições e escopo              |
| Adequações civis e hidráulicas              | equipe própria habilitada ou contratação, conforme escopo e atribuições                                 |
| Operação e manutenção do software           | equipe interna com retaguarda definida                                                                  |

A primeira entrega — registro digital — independe de programação de CLP e de intervenção em
unidades. Isso permite começar pela competência de software e incorporar elétrica, engenharia,
operação e demais disciplinas à medida que o projeto avançar.

A responsabilidade técnica deve acompanhar a disciplina e o escopo efetivamente assumidos. A
existência de profissionais no quadro não significa que qualquer um deles possa responder por
qualquer atividade: cada ART, quando aplicável, deve ser registrada por profissional legalmente
habilitado e com atribuição compatível com o serviço executado.

### Continuidade após a saída de quem desenvolver

Esse risco deve ser tratado desde o início:

1. uso de tecnologias amplamente disponíveis no mercado;
2. documentação das decisões de arquitetura e operação;
3. repositório versionado e ambiente reproduzível;
4. testes automatizados para as funções de software;
5. cópia de segurança e procedimento de restauração documentados;
6. capacitação de mais de uma pessoa para operação básica;
7. possibilidade de contratar retaguarda sem depender do autor original.

### Publicação de código

Há vantagem em publicar partes reutilizáveis do software sob licença livre, principalmente
aplicação, modelos de dados genéricos e ferramentas que não revelem informação operacional sensível.

A definição do que pode ser público deve anteceder a publicação. **Endereços, topologia real,
credenciais, certificados, parâmetros de proteção e configurações operacionais não devem integrar
repositório público.**

A publicação da lógica de controle industrial deve ser avaliada caso a caso, considerando segurança,
criticidade e orientação da equipe responsável pela infraestrutura operacional.

### Riscos principais

| Risco                                           | Prob.     | Impacto    | Tratamento proposto                                                             |
| ----------------------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------- |
| Concentração de conhecimento                    | alta      | alto       | documentação, versionamento, capacitação e retaguarda                           |
| Conhecimento interno de CLP ainda não levantado | a avaliar | médio      | mapear competências existentes; capacitar ou buscar apoio pontual se necessário |
| Resistência a comando remoto                    | média     | alto       | implantação gradual e proteção local independente                               |
| Descontinuidade entre gestões                   | média     | alto       | etapas autônomas, cada uma com entrega própria                                  |
| Custo real superior às estimativas              | média     | médio      | levantamento antes de compromisso de investimento                               |
| Incidente de segurança                          | baixa     | muito alto | segmentação, autenticação, auditoria e revisão técnica                          |
| Falha de comunicação                            | alta      | variável   | autonomia local definida por unidade                                            |
| Expectativa acima da primeira entrega           | alta      | médio      | distinção explícita entre maquete, proposta preliminar e sistema real           |

---

## 9. O que este projeto pode representar para o SAAE

Os capítulos anteriores tratam principalmente de operação, arquitetura, custos e riscos. Há também
um resultado institucional possível. O projeto pode ampliar a capacidade técnica do SAAE e dar
visibilidade a uma experiência produzida dentro da própria autarquia.

### 1. Capacidade de demonstrar os próprios indicadores

O marco regulatório do saneamento reforça metas, qualidade, eficiência e acompanhamento por
indicadores. Quanto maior a qualidade da medição, do histórico e da trilha de auditoria, maior a
capacidade do prestador de explicar seus números a reguladores, órgãos de controle e à própria
gestão.

O sistema não torna um indicador correto por si só. Ele fornece **evidência operacional** para
revisar premissas, identificar divergências e sustentar os cálculos utilizados pela autarquia.

### 2. Transparência e controle

Com registros estruturados, torna-se possível responder perguntas operacionais com data, hora,
unidade e histórico: quando um alarme ocorreu, qual valor foi medido, quando uma intervenção foi
registrada e como determinado indicador foi calculado.

Isso também significa que falhas e desvios ficam registrados. A utilidade da trilha de auditoria
está justamente em permitir análise posterior e melhoria de procedimento, e não em produzir apenas
registros favoráveis.

### 3. Capacidade tecnológica própria

Desenvolver a camada de software e integrar as competências de operação, elétrica e engenharia cria
conhecimento que permanece dentro da autarquia. O valor não está somente no sistema instalado, mas
também na capacidade de entender sua arquitetura, modificá-lo, acrescentar unidades e avaliar
tecnicamente fornecedores futuros.

Essa capacidade não elimina a contratação de empresas quando ela for necessária. Ela muda a posição
do SAAE na contratação: a autarquia passa a especificar melhor, comparar alternativas com mais
informação e preservar o domínio sobre seus dados e sobre a lógica do sistema.

### 4. Potencial de referência e projeção institucional

A arquitetura proposta trata de problemas comuns a muitos prestadores municipais: registro de campo,
telemetria, histórico, alarmes, relatórios, integração entre unidades e redução da dependência de
soluções fechadas.

Na pesquisa realizada para elaborar esta proposta, **não foi localizada iniciativa equivalente de
prestador público municipal de saneamento no Brasil** que reúna este mesmo conjunto de
características: desenvolvimento interno de software, arquitetura baseada em padrões abertos,
telemetria e supervisão, com possibilidade de publicação de componentes como software livre. Isso
não é base suficiente para anunciar o projeto como "o primeiro do Brasil". Essa condição precisa ser
confirmada antes de qualquer divulgação externa. Ainda assim, o levantamento indica um potencial
real de pioneirismo associado ao uso e à possível publicação de software livre.

Com resultados documentados, a experiência pode ser apresentada em **congressos de saneamento e
gestão pública**, documentada em **artigo técnico**, submetida a **premiações de inovação ou gestão
pública** e compartilhada com outros prestadores municipais. A própria troca com outras autarquias
pode trazer retorno técnico, novas contribuições ao software e cooperação entre equipes que
enfrentam problemas semelhantes.

Esse não é o benefício operacional principal do projeto, mas é um valor institucional legítimo. Uma
autarquia que desenvolve, mede, documenta e compartilha uma solução passa a ser vista também como
**produtora de capacidade técnica**, e não apenas como compradora de tecnologia.

### 5. Um resultado identificável da gestão que implantar

Projetos desse tipo deixam ativos que permanecem: software, documentação, série histórica,
equipamentos, procedimentos e conhecimento interno. Se a implantação for conduzida com continuidade,
esses ativos podem continuar evoluindo mesmo depois da primeira entrega e independentemente de
mudanças futuras de equipe ou de fornecedor.

Isso permite que o projeto se torne uma iniciativa identificável da gestão que o estruturou e
colocou em funcionamento, com resultados que podem ser mostrados por indicadores, demonstrações e
documentação. O reconhecimento externo, se vier, é consequência de uma entrega concreta e
mensurável.

---

## 10. Encaminhamento proposto

Esta proposta técnica preliminar não prevê o início imediato da implantação. Minha situação
funcional ainda depende das providências necessárias à reintegração e da organização de períodos de
licença já adquiridos. Por essa razão, minha previsão atual de disponibilidade para assumir de forma
contínua a execução do projeto é **fevereiro de 2027**.

Até lá, proponho que a Administração possa avaliar a iniciativa, confrontá-la com a realidade atual
do SAAE e, caso considere oportuno prosseguir, preparar as condições institucionais e materiais
necessárias à futura implantação.

### 1. Definir a condução institucional do projeto

Caso a proposta seja acolhida, considero importante que, antes do início do desenvolvimento e da
implantação, seja definida a unidade ou instância à qual o projeto ficará vinculado e a forma pela
qual será atribuída sua condução inicial.

Essa definição pode ajudar a evitar que uma iniciativa transversal seja executada de maneira
informal, sem responsabilidades claramente estabelecidas ou dependente apenas de entendimentos
pessoais.

A proposta é que o projeto seja institucional desde o início, preservando-se, na fase inicial de
implantação, a continuidade entre o trabalho já desenvolvido e sua execução, ao mesmo tempo em que o
conhecimento seja progressivamente compartilhado com as áreas envolvidas.

### 2. Preparar a infraestrutura de desenvolvimento e homologação

Caso haja interesse em prosseguir, o período anterior ao início da execução também pode ser
utilizado para verificar a infraestrutura disponível e identificar eventuais necessidades de
adequação.

Para o desenvolvimento serão utilizados simultaneamente ambiente de programação, containers, banco
de dados, serviços, ferramentas de monitoramento e ambientes de teste. Como referência inicial,
considero adequada uma estação de desenvolvimento com **32 GB de memória RAM**, armazenamento SSD e
processador atual de bom desempenho, cabendo ao Departamento de Informática avaliar a configuração e
verificar se já existe equipamento compatível.

Não havendo equipamento disponível, sua aquisição antecipada permitiria que o desenvolvimento
começasse sem depender dessa providência após o início da implantação.

Também podem ser avaliados previamente:

- ambiente de desenvolvimento e homologação;
- capacidade de servidor e armazenamento;
- rotina de cópia de segurança;
- repositório e política de versionamento do código;
- acessos e permissões necessários;
- forma de integração com a infraestrutura já mantida pelo Departamento de Informática.

O objetivo não é criar uma estrutura paralela de tecnologia, mas aproveitar a infraestrutura
existente e preparar apenas o que for necessário para o desenvolvimento e a futura operação do
sistema.

### 3. Iniciar a etapa 0 — registro digital

A partir do início da execução, proponho desenvolver e colocar em teste controlado:

- lançamento de leitura pelo laboratório e pelo pessoal de campo;
- autenticação e perfis de acesso;
- histórico por unidade, parâmetro e período;
- trilha de correção;
- geração de boletim;
- consulta por gerência e diretoria.

O cronograma pode ser definido depois de confirmados os requisitos com os usuários.

Ao fim do piloto, será possível avaliar adesão, qualidade dos registros e ajustes necessários antes
da expansão.

### 4. Prova de conceito em bancada e levantamento de campo

Em paralelo à etapa 0, ou após sua estabilização, proponho montar uma bancada sem ligação com
unidade real para validar a cadeia:

> instrumento → aquisição → comunicação → banco → tela → alarme → relatório

A faixa preliminar de material estudada é de **R$ 5.500 a R$ 16.500** **cálculo**, sem o analisador
de cloro, e deverá ser confirmada por cotações.

O levantamento de campo deverá verificar o que já existe, identificar os pontos de maior interesse
para medição e reunir os dados necessários para substituir as estimativas deste documento por
informações atuais do próprio SAAE.

A partir daí, poderá ser definida a primeira unidade a ser estudada para instrumentação.

---

## Anexo I — Glossário

| Termo                              | Significado                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Telemetria                         | aquisição e transmissão de medições de um local remoto                                                                         |
| Supervisório                       | sistema que reúne medições e estados de várias unidades e, quando autorizado, permite operação                                 |
| Concentrador de telemetria         | equipamento que adquire, registra e transmite dados; pode não executar lógica de processo                                      |
| Controlador lógico programável     | equipamento industrial que executa lógica de controle local                                                                    |
| Comparador colorimétrico de prisma | instrumento visual para leitura por comparação de cor                                                                          |
| DPD                                | reagente utilizado em método colorimétrico para cloro livre                                                                    |
| Intertravamento                    | condição que impede determinada ação quando requisitos de segurança ou processo não são atendidos                              |
| Sinal de 4 a 20 mA                 | padrão industrial de sinal analógico; valores fora da faixa normal podem ser usados para indicar falha conforme a configuração |
| Modbus                             | protocolo industrial amplamente utilizado para comunicação entre equipamentos                                                  |
| MQTT                               | protocolo de mensagens adequado a diversas aplicações de telemetria                                                            |
| Sparkplug                          | especificação sobre MQTT para estrutura de dados e estado de dispositivos industriais                                          |
| IEC 61131-3                        | norma que define linguagens de programação para controladores industriais                                                      |
| Área classificada                  | área com potencial de atmosfera explosiva, sujeita a requisitos específicos de equipamento e instalação                        |
| Inversor de frequência             | equipamento que permite variar frequência e rotação de motor elétrico                                                          |
| Altura estática                    | parcela de carga associada ao desnível geométrico do recalque                                                                  |
| Malha fechada                      | controle em que a medição realimenta a ação de controle                                                                        |
| Horário de ponta                   | período tarifário diferenciado em determinadas modalidades de fornecimento de energia                                          |
| Demanda contratada                 | potência contratada segundo as condições de fornecimento da distribuidora                                                      |
| Vazão mínima noturna               | técnica de análise da vazão em período de baixo consumo para investigação de perdas                                            |
| Autonomia local                    | capacidade da unidade de manter funções essenciais sem comunicação com a sede                                                  |
| Perfil de acesso                   | conjunto de permissões associado a usuário ou função                                                                           |
| Software livre                     | software cuja licença permite uso, estudo, modificação e redistribuição segundo seus termos                                    |

## Anexo II — Normas e legislação de referência

| Norma                     | Objeto                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------ |
| ISA-101                   | filosofia de interface de operação e hierarquia de telas                             |
| ISA-18.2 / EEMUA 191      | gestão de alarmes                                                                    |
| ISA-5.1 / ISO 14617       | simbologia de instrumentação e processo                                              |
| IEC 61131-3               | linguagens de programação de controladores                                           |
| IEC 62443                 | segurança em sistemas de automação e controle industrial                             |
| ABNT NBR IEC 60079        | atmosferas explosivas                                                                |
| ABNT NBR 5410             | instalações elétricas de baixa tensão                                                |
| ABNT NBR 5419             | proteção contra descargas atmosféricas                                               |
| NBR 12218                 | projeto de rede de distribuição de água                                              |
| NBR 12217                 | projeto de reservatório de distribuição de água                                      |
| NBR 9648 / NBR 9649       | concepção e projeto de sistemas de esgoto sanitário                                  |
| NEMA MG-1                 | motores e geradores elétricos                                                        |
| Portaria GM/MS 888/2021   | procedimentos de controle e vigilância da qualidade da água e padrão de potabilidade |
| Resolução CONAMA 430/2011 | condições e padrões de lançamento de efluentes                                       |
| Lei 14.026/2020           | marco legal do saneamento                                                            |
| Lei 14.133/2021           | licitações e contratos administrativos                                               |
| NR-10 e NR-12             | segurança em instalações elétricas e em máquinas                                     |

## Anexo III — Fontes

Consultadas em 22 de agosto de 2026.

| Fonte                                                                                                                                                                                                 | O que sustenta                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Instituto Água e Saneamento — Angra dos Reis](https://www.aguaesaneamento.org.br/municipios-e-saneamento/rj/angra-dos-reis)                                                                          | indicadores SINISA 2024 e base populacional do Censo IBGE 2022  |
| [Diagnóstico SNIS de Água e Esgotos](https://www.gov.br/mdr/pt-br/assuntos/saneamento/snis/diagnosticos-anteriores-do-snis/agua-e-esgotos-1/2019/2-Diagnstico_SNIS_AE_2019_Republicacao_31032021.pdf) | índice nacional de consumo de energia utilizado como referência |
| [Glossário de Indicadores do SNIS](https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis/produtos-do-snis/diagnosticos/Glossario_Indicadores_AE2022.pdf)             | definição e fórmula dos indicadores de perdas e energia         |
| [Eficiência energética em sistemas de abastecimento](https://tratamentodeagua.com.br/artigo/eficiencia-energetica-sistemas-abastecimento-agua/)                                                       | contexto de consumo de energia em bombeamento                   |
| [Termo aditivo a contrato de telemetria](https://saaemanhuacu.mg.gov.br/processos-licitatorios/download/file?fid=15.397)                                                                              | referência pública de custo de operação terceirizada            |
| [Estrutura tarifária — horário de ponta](https://www.cubienergia.com/horario-de-ponta-horario-de-pico/)                                                                                               | contexto de modalidade horária                                  |
| [Ranking do Saneamento — Trata Brasil](https://tratabrasil.org.br/wp-content/uploads/2024/04/Relatorio-Completo-Ranking-do-Saneamento-de-2024-TRATA-BRASIL-GO-ASSOCIADOS.pdf)                         | contexto nacional de perdas                                     |
| [Analisador de cloro — serviço municipal](https://www.semae.sp.gov.br/novo-analisador-de-cloro-torna-controle-da-agua-mais-eficiente-e-economico/)                                                    | caso público de investimento em analisador                      |
| [Monitor de cloro residual e pH em linha](https://www.vikacontrols.com.br/produto/monitor-de-cloro-residual/)                                                                                         | exemplo de analisador com comunicação industrial                |
| [Comparador colorimétrico de prisma](https://www.dellab.com.br/)                                                                                                                                      | referência do instrumento de leitura visual                     |
| [Transmissor de pressão industrial](https://hidroveda.com.br/produtos/transmissor-de-pressao-a-10-0-250-bar-g-4-20-ma-2-fios-alimentacao-8-30-v-dc/)                                                  | referência de preço e interface                                 |
| [Medidor de vazão eletromagnético](https://www.smartinstec.com.br/produto/medidor-de-vazao-tipo-eletromagnetico/)                                                                                     | referência de tecnologia e interfaces                           |
| [Transmissor de nível por radar](https://www.smartinstec.com.br/produto/transmissor-de-nivel-tipo-radar-ultra-sensor/)                                                                                | referência de medição sem contato                               |
| [Multimedidor de grandezas elétricas](https://www.kron.com.br/produto/mult-k-05/)                                                                                                                     | referência de grandezas e comunicação                           |
| [Inversor de frequência de fabricante nacional](https://loja.csaautomacao.com.br/produto/inversor-de-frequencia-weg-cfw300-cfw300a06p0s2nb20/)                                                        | referência de equipamento                                       |
| [Controlador industrial aberto](https://docs.arduino.cc/hardware/opta/)                                                                                                                               | referência de controlador industrial                            |
| [Fabricante de supervisório proprietário](https://inductiveautomation.com/distributor-landing/portugues)                                                                                              | referência de solução comercial                                 |

---

_Este documento constitui uma proposta técnica preliminar, não um projeto executivo. Os indicadores
municipais utilizados como referência provêm das fontes indicadas acima e podem não refletir a
operação atual. Valores marcados como cálculo são estimativas baseadas em premissas declaradas e não
constituem orçamento ou cotação. A maquete que acompanha o documento utiliza dados simulados e não
está conectada a equipamento real._

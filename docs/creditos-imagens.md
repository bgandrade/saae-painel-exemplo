# Créditos das imagens

As imagens deste documento vêm de duas origens, com situações jurídicas
diferentes. A distinção está registrada aqui de propósito, para que quem herdar o
repositório saiba o que pode e o que não pode reaproveitar.

## Fotografias de instalação — licença livre

Vêm do Wikimedia Commons, com licença que permite uso e redistribuição. As fotos
sob Creative Commons Atribuição-CompartilhaIgual entram aqui como **coleção**, não
como obra derivada: o documento as reproduz sem modificação, e a licença de cada
foto permanece sendo a dela.

| Arquivo                              | Autoria                  | Licença         | Origem                                                                                                                                          |
| ------------------------------------ | ------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/img/tratamento.jpg`          | zardeto                  | Domínio público | [Decantação.jpg](https://commons.wikimedia.org/wiki/File:Decanta%C3%A7%C3%A3o.jpg)                                                              |
| `public/img/medicao-vazao.jpg`       | zardeto                  | Domínio público | [Água bruta e medição em Calha Parshall.jpg](https://commons.wikimedia.org/wiki/File:%C3%81gua_bruta_e_medi%C3%A7%C3%A3o_em_Calha_Parshall.jpg) |
| `public/img/conjuntos-motobomba.jpg` | Alexander Novikov        | CC BY-SA 4.0    | [Pumping station in Kotovsk.jpg](https://commons.wikimedia.org/wiki/File:Pumping_station_in_Kotovsk.jpg)                                        |
| `public/img/controlador-trilho.jpg`  | Angga Panca Alam Anugrah | CC BY-SA 4.0    | [PLC Panasonic FP-XH C30T.jpg](https://commons.wikimedia.org/wiki/File:PLC_Panasonic_FP-XH_C30T.jpg)                                            |
| `public/img/painel-clp.png`          | Dailynetworks            | Domínio público | [PLC Control Panel.png](https://commons.wikimedia.org/wiki/File:PLC_Control_Panel.png)                                                          |

## Fotografias de produto — catálogo de fabricante

O capítulo de equipamentos precisa mostrar o instrumento de que fala, e não há
fotografia de licença livre da maioria deles. Estas imagens vêm do **catálogo do
fabricante ou do distribuidor**, com crédito e link ao pé de cada figura no
documento.

**Situação jurídica, declarada sem rodeio:** estas imagens **não têm licença de
redistribuição**. O uso aqui é de identificação visual do tipo de equipamento em
documento técnico, com atribuição e link para a página de origem, e sem qualquer
indicação de preferência comercial — mas continua sendo uso sem autorização
expressa. Como o site é publicado (Cloudflare Pages, a partir de repositório
público no GitHub), um pedido de retirada por parte de um fabricante é possível.
Se acontecer, o caminho é substituir a imagem por desenho autoral do instrumento,
no mesmo estilo dos diagramas do documento, sem alterar o texto.

| Arquivo                                        | Equipamento                      | Fabricante / distribuidor | Página de origem                                                                                                                               |
| ---------------------------------------------- | -------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/img/analisador-cloro.png`              | Monitor de cloro e pH em linha   | ATI, via Vika Controls    | [Monitor de cloro residual](https://www.vikacontrols.com.br/produto/monitor-de-cloro-residual/)                                                |
| `public/img/transmissor-pressao.webp`          | Transmissor de pressão           | WIKA, via Hidroveda       | [Transmissor de pressão A-10](https://hidroveda.com.br/produtos/transmissor-de-pressao-a-10-0-250-bar-g-4-20-ma-2-fios-alimentacao-8-30-v-dc/) |
| `public/img/medidor-vazao-eletromagnetico.jpg` | Medidor de vazão eletromagnético | Smartins & Pires          | [Medidor de vazão eletromagnético](https://www.smartinstec.com.br/produto/medidor-de-vazao-tipo-eletromagnetico/)                              |
| `public/img/radar-nivel.jpg`                   | Transmissor de nível por radar   | Smartins & Pires          | [Transmissor de nível tipo radar](https://www.smartinstec.com.br/produto/transmissor-de-nivel-tipo-radar-ultra-sensor/)                        |
| `public/img/multimedidor.png`                  | Multimedidor de grandezas        | Kron Medidores            | [Mult-K 05](https://www.kron.com.br/produto/mult-k-05/)                                                                                        |
| `public/img/inversor-frequencia.png`           | Inversor de frequência           | WEG, via CSA Automação    | [Inversor CFW300](https://loja.csaautomacao.com.br/produto/inversor-de-frequencia-weg-cfw300-cfw300a06p0s2nb20/)                               |

## Imagem pendente

A figura do **comparador colorimétrico de prisma** — o instrumento que a autarquia
efetivamente usa na leitura de cloro e pH, do tipo Dellab DLH-2000 — **está
faltando**. O documento a descreve no capítulo 1, mas não a ilustra.

Até a versão 2.0 essa posição era ocupada por `public/img/clorimetro-manual.jpg`,
foto de um **colorímetro digital portátil** da PoliControl. Era o instrumento
errado: um colorímetro digital entrega leitura numérica direta, enquanto o
comparador de prisma entrega o degrau de um disco de padrões lido a olho. Manter a
foto ao lado de um texto que descreve o comparador seria erro de fato — e o
primeiro que um servidor da operação apontaria numa apresentação. A imagem foi
retirada na versão 3.0 e o arquivo permanece no repositório apenas para histórico.

Dois caminhos para resolver, nesta ordem de preferência:

1. **Fotografar o instrumento na própria autarquia.** É a melhor opção: a imagem
   passa a ser autoral, sem questão de licença, e mostra o equipamento real.
2. **Desenho autoral** do comparador, no mesmo estilo dos diagramas do documento —
   é o caminho já previsto na seção anterior para substituir foto de catálogo.

Todas as imagens estão creditadas também na própria página, ao pé de cada figura,
que é onde a atribuição precisa aparecer para ter efeito.

Os diagramas são autorais, desenhados para este documento, e seguem a mesma
licença do restante do repositório.

## Tipografia

As fontes em `public/fontes/` são redistribuídas sob licença livre:

| Família        | Licença                   |
| -------------- | ------------------------- |
| Archivo        | SIL Open Font License 1.1 |
| Source Serif 4 | SIL Open Font License 1.1 |
| IBM Plex Mono  | SIL Open Font License 1.1 |

Ficam embarcadas no próprio site porque a política de segurança de conteúdo
declarada em `public/_headers` proíbe recurso externo — o que mantém a
propriedade de o site funcionar em auditório sem rede.

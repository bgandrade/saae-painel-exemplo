import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import MarkdownIt from 'markdown-it';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = join(raiz, 'docs', 'projeto-tecnico.md');
const cssFonte = join(raiz, 'docs', 'projeto-tecnico.impressao.css');
const saidaDir = join(raiz, 'dist', 'documentos');
const htmlDestino = join(saidaDir, 'projeto-tecnico.html');
const pdfDestino = join(saidaDir, 'projeto-tecnico.pdf');
const pdfRascunho = join(saidaDir, '.projeto-tecnico.rascunho.pdf');
const somenteHtml = process.argv.includes('--html-only');

const escaparHtml = (texto) =>
  texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const slugBase = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'secao';

const markdown = readFileSync(fonte, 'utf8');
const css = readFileSync(cssFonte, 'utf8');
const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
const idsUsados = new Map();
const sumario = [];

md.renderer.rules.heading_open = (tokens, indice, opcoes, ambiente, self) => {
  const token = tokens[indice];
  const titulo = tokens[indice + 1]?.content ?? '';
  const base = slugBase(titulo);
  const ocorrencias = idsUsados.get(base) ?? 0;
  const id = ocorrencias === 0 ? base : `${base}-${ocorrencias + 1}`;
  idsUsados.set(base, ocorrencias + 1);
  token.attrSet('id', id);

  if (token.tag === 'h2') sumario.push({ titulo, id });
  return self.renderToken(tokens, indice, opcoes);
};

const renderizado = md.render(markdown);
const inicioCorpo = renderizado.indexOf('<h2');
if (inicioCorpo === -1)
  throw new Error('O documento precisa conter ao menos um título de nível 2.');

const abertura = renderizado.slice(0, inicioCorpo);
const corpoOriginal = renderizado.slice(inicioCorpo);
const titulo = abertura.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? 'Projeto técnico';
const meta = abertura.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? '';
const [categoria = '', instituicao = '', subtitulo = '', autoria = '', localData = ''] = meta
  .split(/<br>\s*/)
  .map((item) => item.trim());
const ultimoSeparador = corpoOriginal.lastIndexOf('<hr>');
const antesDaNota = ultimoSeparador >= 0 ? corpoOriginal.slice(0, ultimoSeparador) : corpoOriginal;
const trechoNota = ultimoSeparador >= 0 ? corpoOriginal.slice(ultimoSeparador) : '';
const notaFinal = trechoNota.match(/^<hr>\s*<p><em>([\s\S]*?)<\/em><\/p>\s*$/);
const corpo = notaFinal
  ? `${antesDaNota}<p class="document-note"><em>${notaFinal[1]}</em></p>`
  : corpoOriginal;

const montarHtml = (paginas = new Map()) => {
  const itensSumario = sumario
    .map(({ titulo: itemTitulo, id }) => {
      const pagina = paginas.get(id);
      return `<li><a href="#${id}"><span class="toc-text">${escaparHtml(itemTitulo)}</span><span class="toc-leader" aria-hidden="true"></span><span class="toc-page">${pagina ?? ''}</span></a></li>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo.replace(/<[^>]+>/g, '')}</title>
  <style>${css}</style>
</head>
<body>
  <header class="cover">
    <div class="cover-institution">${instituicao}</div>
    <div class="cover-title-block">
      <div class="cover-category">${categoria}</div>
      <h1>${titulo}</h1>
      <div class="cover-subtitle">${subtitulo}</div>
    </div>
    <div class="cover-footer">
      <div class="cover-author">${autoria}</div>
      <div class="cover-place-date">${localData}</div>
    </div>
  </header>
  <nav class="toc" aria-labelledby="titulo-sumario">
    <h2 id="titulo-sumario">Sumário</h2>
    <ol>${itensSumario}</ol>
  </nav>
  <main class="document-body">${corpo}</main>
</body>
</html>
`;
};

const gravarHtml = (paginas) => {
  writeFileSync(htmlDestino, montarHtml(paginas));
  console.log(`HTML gerado: ${htmlDestino}`);
};

mkdirSync(saidaDir, { recursive: true });
gravarHtml();

if (somenteHtml) process.exit(0);

const candidatos = [
  process.env.CHROMIUM_BIN,
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
].filter(Boolean);
const chromium = candidatos.find(existsSync);

if (!chromium) {
  throw new Error('Chromium não encontrado. Defina CHROMIUM_BIN com o caminho do executável.');
}

const imprimirPdf = (destino, passagem) => {
  const perfil = join(tmpdir(), `saae-documento-chromium-${process.pid}-${passagem}`);
  execFileSync(
    chromium,
    [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--user-data-dir=${perfil}`,
      `--print-to-pdf=${destino}`,
      pathToFileURL(htmlDestino).href,
    ],
    { stdio: 'inherit' },
  );
};

const normalizarTexto = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const lerPaginas = async (arquivo) => {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const dados = new Uint8Array(readFileSync(arquivo));
  const carregamento = getDocument({ data: dados, disableWorker: true });
  const documento = await carregamento.promise;
  const paginas = [];

  for (let numero = 1; numero <= documento.numPages; numero += 1) {
    const pagina = await documento.getPage(numero);
    const conteudo = await pagina.getTextContent();
    paginas.push(normalizarTexto(conteudo.items.map((item) => item.str).join(' ')));
  }

  await carregamento.destroy();
  return paginas;
};

const localizarSecoes = (paginas) => {
  const localizadas = new Map();
  let indiceInicial = 2; // capa e sumário ocupam as duas primeiras páginas

  for (const { titulo: tituloSecao, id } of sumario) {
    const procurado = normalizarTexto(tituloSecao);
    const indice = paginas.findIndex(
      (textoPagina, indicePagina) =>
        indicePagina >= indiceInicial && textoPagina.includes(procurado),
    );

    if (indice === -1)
      throw new Error(`Não foi possível localizar no PDF a seção “${tituloSecao}”.`);
    localizadas.set(id, indice + 1);
    indiceInicial = indice;
  }

  return localizadas;
};

imprimirPdf(pdfRascunho, 1);
const paginasSumario = localizarSecoes(await lerPaginas(pdfRascunho));
gravarHtml(paginasSumario);
imprimirPdf(pdfDestino, 2);

const paginasFinais = localizarSecoes(await lerPaginas(pdfDestino));
for (const [id, pagina] of paginasSumario) {
  if (paginasFinais.get(id) !== pagina) {
    throw new Error(`A paginação mudou após montar o sumário na seção “${id}”.`);
  }
}

unlinkSync(pdfRascunho);

console.log(`PDF gerado: ${pdfDestino}`);
console.log(`Arquivo: ${basename(pdfDestino)}`);

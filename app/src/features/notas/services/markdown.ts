/**
 * Renderizador de markdown mínimo y propio, sin dependencias.
 *
 * Desde que el editor de Notas es Tiptap, esto solo sirve para **convertir las
 * notas viejas**, que se guardaron en markdown antes del cambio: se traducen a
 * HTML al abrirlas y recién al guardar quedan en el formato nuevo. Cubre
 * `**negrita**`, `_itálica_`, `## título`, `- lista` y links `[texto](url)`.
 * La salida no lleva clases: la apariencia la da `.nota-rica` en globals.css.
 *
 * Seguridad: el texto del usuario se escapa **antes** de reconocer cualquier
 * marca, así que el contenido nunca puede inyectar markup. Las únicas etiquetas
 * de la salida son las que arma este archivo, y los `href` quedan limitados a
 * `http(s)`. Por eso el resultado se puede pasar a `dangerouslySetInnerHTML`.
 */

/** Unifica CRLF y CR sueltos a `\n`. */
function normalizarSaltos(texto: string): string {
  return texto.replace(/\r\n?/g, "\n");
}

/** Escapa los caracteres que tendrían significado en HTML. */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Solo `http://` y `https://`; cualquier otra cosa (javascript:, data:) se descarta. */
function urlSegura(url: string): string | null {
  const limpia = url.trim().replace(/&amp;/g, "&");
    if (!/^https?:\/\//i.test(limpia)) return null;
  return escaparHtml(limpia);
}

/** Marcas que valen dentro de una línea. Recibe texto YA escapado. */
function inline(texto: string): string {
  return texto
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (completo, etiqueta, url) => {
      const href = urlSegura(url);
      if (!href) return completo;
      return `<a href="${href}" target="_blank" rel="noreferrer noopener">${etiqueta}</a>`;
    })
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    // El guion bajo solo abre/cierra fuera de una palabra, para no romper
    // identificadores tipo `snake_case` pegados en una nota.
    .replace(/(^|[^\w])_([^_\n]+)_(?![\w])/g, "$1<em>$2</em>");
}

/**
 * Convierte el markdown de una nota en HTML seguro.
 * Agrupa los `- ` consecutivos en una sola `<ul>` y el resto en párrafos.
 */
export function renderMarkdown(contenido: string): string {
  // Normalizar CRLF primero: en JS `.` no matchea `\r`, así que un `\r` colgando
  // al final de la línea hacía fallar los `$` de los patrones de lista y título.
  const lineas = escaparHtml(normalizarSaltos(contenido)).split("\n");
  const bloques: string[] = [];
  let lista: string[] = [];
  let parrafo: string[] = [];

  const cerrarLista = () => {
    if (lista.length === 0) return;
    bloques.push(
      `<ul>${lista
        .map((li) => `<li>${inline(li)}</li>`)
        .join("")}</ul>`,
    );
    lista = [];
  };

  const cerrarParrafo = () => {
    if (parrafo.length === 0) return;
    bloques.push(`<p>${inline(parrafo.join("<br />"))}</p>`);
    parrafo = [];
  };

  for (const linea of lineas) {
    const encabezado = linea.match(/^(#{1,6})\s+(.*)$/);
    const item = linea.match(/^[-*]\s+(.*)$/);

    if (encabezado) {
      cerrarLista();
      cerrarParrafo();
      bloques.push(
        `<h3>${inline(encabezado[2])}</h3>`,
      );
    } else if (item) {
      cerrarParrafo();
      lista.push(item[1]);
    } else if (linea.trim() === "") {
      cerrarLista();
      cerrarParrafo();
    } else {
      cerrarLista();
      parrafo.push(linea);
    }
  }

  cerrarLista();
  cerrarParrafo();

  return bloques.join("");
}

/**
 * El mismo texto sin las marcas, para los previews en texto plano (la tarjeta
 * de la nota y el título derivado de la primera línea). Antes se mostraba el
 * markdown crudo y se veían los asteriscos.
 */
export function quitarMarcas(contenido: string): string {
  return normalizarSaltos(contenido)
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}[-*]\s+/gm, "")
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/(^|[^\w])_([^_\n]+)_(?![\w])/g, "$1$2");
}

/** Decodifica las entidades HTML más comunes a caracteres normales. */
export function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function limpiarItemLista(itemHtml: string): string {
  let item = itemHtml.replace(/<\/?p[^>]*>/gi, "");
  item = item.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  item = item.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  item = item.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  item = item.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  item = item.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, "~~$1~~");
  item = item.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, "~~$1~~");
  item = item.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, "~~$1~~");
  item = item.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  item = item.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  item = item.replace(/<br\s*\/?>/gi, "\n  ");
  item = item.replace(/<[^>]+>/g, "");
  return decodificarEntidades(item).trim();
}

/**
 * Convierte HTML (generado por Tiptap) de vuelta a Markdown limpio.
 * Si el texto ya es markdown viejo (sin etiquetas HTML), se devuelve tal cual.
 */
export function htmlAMarkdown(html: string): string {
  if (!html || !html.trim()) return "";
  if (!/^\s*<[a-z]/i.test(html)) return html;

  let md = normalizarSaltos(html);

  // Encabezados
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n\n");

  // Bloques de código pre/code
  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, code) => {
      return "```\n" + decodificarEntidades(code).trim() + "\n```\n\n";
    },
  );

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, quote) => {
    const lineas = htmlAMarkdown(quote).trim().split("\n");
    return lineas.map((l) => `> ${l}`).join("\n") + "\n\n";
  });

  // Listas ordenadas y desordenadas
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, items) => {
    const liMatches = [...items.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return (
      liMatches.map((m) => `- ${limpiarItemLista(m[1])}`).join("\n") + "\n\n"
    );
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, items) => {
    const liMatches = [...items.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return (
      liMatches
        .map((m, i) => `${i + 1}. ${limpiarItemLista(m[1])}`)
        .join("\n") + "\n\n"
    );
  });

  // Párrafos
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  // Saltos de línea
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Formato inline
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, "~~$1~~");
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, "~~$1~~");
  md = md.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, "~~$1~~");
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Remover cualquier etiqueta HTML sobrante
  md = md.replace(/<[^>]+>/g, "");

  // Decodificar entidades
  md = decodificarEntidades(md);

  // Normalizar saltos de línea consecutivos
  return md.replace(/\n{3,}/g, "\n\n").trim();
}


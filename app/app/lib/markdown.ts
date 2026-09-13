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

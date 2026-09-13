/**
 * Capa pura de Notas: tipos y helpers sin I/O.
 * No importa `db` ni nada de servidor: lo usan tanto el server como el cliente.
 */
import { htmlAMarkdown, quitarMarcas, renderMarkdown } from "./markdown";
import { normalizar } from "./texto";

export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  /** Nombre del curso, o `null` si la nota no es de ninguna materia. */
  curso: string | null;
  /** ISO string, para poder serializar del server component al client. */
  createdAt: string;
  updatedAt: string;
}

/** Límites de validación, compartidos entre el editor y las server actions. */
export const MAX_TITULO = 200;
/** Tope sobre el texto plano: es el largo que el usuario efectivamente escribió. */
export const MAX_CONTENIDO = 20_000;
/** Tope sobre el HTML crudo. Más alto porque las etiquetas también ocupan. */
export const MAX_CONTENIDO_HTML = 80_000;

/**
 * Las notas se guardan como HTML desde que el editor es Tiptap. Las que se
 * escribieron antes quedaron en markdown, así que hay que distinguirlas: se
 * convierten al vuelo al abrirlas y recién al guardar pasan a HTML. No hay
 * migración destructiva en la base.
 */
export function esHtml(contenido: string): boolean {
  return /^\s*<[a-z]/i.test(contenido);
}

/** Contenido listo para cargar en el editor. El markdown viejo se convierte. */
export function contenidoComoHtml(contenido: string): string {
  if (!contenido.trim()) return "";
  return esHtml(contenido) ? contenido : renderMarkdown(contenido);
}

/**
 * Texto plano del contenido, sea HTML o markdown viejo. Sin DOM, porque
 * también corre en el servidor (validación de las server actions).
 */
export function textoPlano(contenido: string): string {
  if (!esHtml(contenido)) return quitarMarcas(contenido);
  return contenido
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Una nota sin texto: un documento vacío de Tiptap igual serializa "<p></p>". */
export function estaVacio(contenido: string): boolean {
  return textoPlano(contenido).trim().length === 0;
}

/** Primera línea no vacía del contenido, en texto plano, recortada. */
function primeraLinea(contenido: string): string {
  const linea = textoPlano(contenido)
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return linea ?? "";
}

/** Qué título mostrar en la lista: el título, o la 1ª línea, o un placeholder. */
export function tituloMostrado(nota: Pick<Nota, "titulo" | "contenido">): string {
  const t = nota.titulo.trim();
  if (t) return t;
  const linea = primeraLinea(nota.contenido);
  if (linea) return linea.length > 80 ? `${linea.slice(0, 80)}…` : linea;
  return "Sin título";
}

/** Resumen del contenido para el preview de la tarjeta, en texto plano. */
export function resumen(contenido: string, largo = 140): string {
  const texto = textoPlano(contenido).replace(/\s+/g, " ").trim();
  if (texto.length <= largo) return texto;
  return `${texto.slice(0, largo)}…`;
}

/** Fecha relativa en español rioplatense ("hace 3 días", "recién"). */
export function fechaRelativa(iso: string): string {
  const fecha = new Date(iso);
  const segs = Math.round((Date.now() - fecha.getTime()) / 1000);
  if (segs < 60) return "recién";
  const mins = Math.round(segs / 60);
  if (mins < 60) return `hace ${mins} min`;
  const horas = Math.round(mins / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Notas que quedan tras aplicar el filtro de cursos del sidebar y el buscador.
 *
 * Con cursos seleccionados, las notas sin curso quedan afuera: si estás
 * mirando "Análisis", una nota suelta no es de Análisis. Sin selección se ven
 * todas.
 */
export function filtrarNotas(
  notas: Nota[],
  cursosSeleccionados: string[],
  busqueda: string,
  renombres: Record<string, string> = {},
): Nota[] {
  const porCurso =
    cursosSeleccionados.length === 0
      ? notas
      : notas.filter((n) => n.curso && cursosSeleccionados.includes(n.curso));

  const q = normalizar(busqueda);
  if (!q) return porCurso;

  return porCurso.filter((nota) => {
    const curso = nota.curso ? renombres[nota.curso] || nota.curso : "";
    return (
      normalizar(nota.titulo).includes(q) ||
      normalizar(textoPlano(nota.contenido)).includes(q) ||
      normalizar(curso).includes(q)
    );
  });
}

/** Notas por curso, para el contador del sidebar. */
export function contarNotasPorCurso(notas: Nota[]): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const nota of notas) {
    if (nota.curso) conteo[nota.curso] = (conteo[nota.curso] ?? 0) + 1;
  }
  return conteo;
}

/**
 * Convierte una nota completa a formato Markdown para descarga o compartir.
 * Incluye el título como encabezado de nivel 1 si no está vacío ni duplicado.
 */
export function notaAMarkdown(
  nota: Pick<Nota, "titulo" | "contenido">,
): string {
  const titulo = nota.titulo.trim();
  const cuerpoMd = htmlAMarkdown(nota.contenido);

  if (!titulo) return cuerpoMd;

  if (
    cuerpoMd.startsWith(`# ${titulo}\n`) ||
    cuerpoMd === `# ${titulo}` ||
    cuerpoMd.startsWith(`## ${titulo}\n`) ||
    cuerpoMd === `## ${titulo}`
  ) {
    return cuerpoMd;
  }

  if (!cuerpoMd) {
    return `# ${titulo}`;
  }

  return `# ${titulo}\n\n${cuerpoMd}`;
}

/**
 * Sanitiza un título para usarlo como nombre de archivo .md válido.
 */
export function nombreArchivoMd(titulo: string): string {
  const limpio = titulo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  return limpio || "nota";
}


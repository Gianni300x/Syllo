/**
 * Capa pura de Notas: tipos y helpers sin I/O.
 * No importa `db` ni nada de servidor: lo usan tanto el server como el cliente.
 */

export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  /** ISO string, para poder serializar del server component al client. */
  createdAt: string;
  updatedAt: string;
}

/** Límites de validación, compartidos entre el editor y las server actions. */
export const MAX_TITULO = 200;
export const MAX_CONTENIDO = 20_000;

/** Primera línea no vacía del contenido, recortada. */
function primeraLinea(contenido: string): string {
  const linea = contenido
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

/** Resumen del contenido para el preview de la tarjeta. */
export function resumen(contenido: string, largo = 140): string {
  const texto = contenido.replace(/\s+/g, " ").trim();
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

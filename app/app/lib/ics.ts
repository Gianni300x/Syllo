/**
 * Genera un calendario .ics (RFC 5545) a partir de las tareas, para que el
 * usuario lo importe a Google/Apple Calendar y reciba sus recordatorios
 * nativos. No hay feed en vivo: es una foto de las tareas pendientes al
 * momento de exportar (ver contexto en el plan de esta feature).
 */
import { estaCompletada, type Tarea } from "./classroom";

/** Escapa texto para un campo de contenido ICS (coma, punto y coma, backslash, salto de línea). */
function escaparTexto(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** El spec exige "folding" de líneas de más de 75 octetos, continuando con un espacio. */
function foldLinea(linea: string): string {
  const bytes = Buffer.byteLength(linea, "utf8");
  if (bytes <= 75) return linea;

  const partes: string[] = [];
  let resto = linea;
  let limite = 75;
  while (Buffer.byteLength(resto, "utf8") > limite) {
    let corte = limite;
    // No cortar en medio de un carácter multibyte.
    while (corte > 0 && (resto.codePointAt(corte)! & 0xc0) === 0x80) corte--;
    partes.push(resto.slice(0, corte));
    resto = resto.slice(corte);
    limite = 74; // las líneas de continuación arrancan con un espacio
  }
  partes.push(resto);
  return partes.join("\r\n ");
}

function fechaComoYYYYMMDD(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Hash corto y estable (no criptográfico) para armar un UID determinístico. */
function hashCorto(texto: string): string {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (Math.imul(31, h) + texto.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export function generarIcs(tareas: Tarea[]): string {
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Syllo//Tareas//ES",
    "CALSCALE:GREGORIAN",
  ];

  for (const tarea of tareas) {
    if (estaCompletada(tarea) || !tarea.vencimiento) continue;

    const inicio = new Date(
      tarea.vencimiento.year,
      tarea.vencimiento.month - 1,
      tarea.vencimiento.day,
    );
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1); // DTEND es exclusivo en eventos de todo el día

    const uid = `${hashCorto(`${tarea.curso}|${tarea.titulo}|${fechaComoYYYYMMDD(inicio)}`)}@syllo.app`;

    lineas.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${fechaComoYYYYMMDD(inicio)}`,
      `DTEND;VALUE=DATE:${fechaComoYYYYMMDD(fin)}`,
      `SUMMARY:${escaparTexto(`${tarea.curso}: ${tarea.titulo}`)}`,
    );

    if (tarea.descripcion) {
      lineas.push(`DESCRIPTION:${escaparTexto(tarea.descripcion)}`);
    }
    if (tarea.link) {
      lineas.push(`URL:${escaparTexto(tarea.link)}`);
    }

    lineas.push("END:VEVENT");
  }

  lineas.push("END:VCALENDAR");

  return lineas.map(foldLinea).join("\r\n") + "\r\n";
}

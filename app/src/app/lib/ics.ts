/**
 * Genera un calendario .ics (RFC 5545) a partir de las tareas, para que el
 * usuario reciba los recordatorios nativos de su celular.
 *
 * Sirve a los dos consumidores: la descarga de una vez (`/api/tareas/ics`) y
 * el feed suscribible (`/api/calendario/[token]`), que es el mismo texto con
 * las cabeceras de publicación puestas.
 */
import { claveTarea, estaCompletada, type Tarea } from "./classroom";

/** Escapa texto para un campo de contenido ICS (coma, punto y coma, backslash, salto de línea). */
function escaparTexto(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * El spec exige "folding" de líneas de más de 75 octetos, continuando con un
 * espacio.
 *
 * El corte se calcula acumulando **bytes** carácter por carácter. La versión
 * anterior mezclaba unidades: comparaba bytes contra un índice de caracteres y
 * usaba `slice()` con ese índice, así que cualquier línea con acentos —o sea,
 * casi todas— terminaba excediendo el límite. Recorrer con `for...of` entrega
 * code points enteros, de modo que nunca se parte un carácter ni un par
 * suplente (emojis incluidos).
 */
function foldLinea(linea: string): string {
  if (Buffer.byteLength(linea, "utf8") <= 75) return linea;

  const partes: string[] = [];
  let actual = "";
  let bytes = 0;
  let limite = 75;

  for (const caracter of linea) {
    const bytesCaracter = Buffer.byteLength(caracter, "utf8");
    if (bytes + bytesCaracter > limite) {
      partes.push(actual);
      actual = "";
      bytes = 0;
      limite = 74; // las líneas de continuación arrancan con un espacio
    }
    actual += caracter;
    bytes += bytesCaracter;
  }

  partes.push(actual);
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

/**
 * UID del evento: tiene que sobrevivir a los cambios, o el calendario del
 * usuario borra el evento viejo y agrega uno nuevo cada vez que se renombra un
 * curso o se mueve una fecha (y pierde lo que él le haya puesto encima).
 *
 * Por eso se usan los ids de Classroom, o el id del evento personal. El hash
 * de curso+título+fecha queda solo como fallback para lo que no tenga ninguno.
 */
function uidPara(tarea: Tarea, fechaInicio: string): string {
  const clave = claveTarea(tarea);
  if (clave) return `${clave.replace("/", "-")}@syllo.app`;
  if (tarea.eventoId) return `evento-${tarea.eventoId}@syllo.app`;
  return `${hashCorto(`${tarea.curso}|${tarea.titulo}|${fechaInicio}`)}@syllo.app`;
}

export interface OpcionesIcs {
  /** Nombre del calendario en Google/Apple. */
  nombre?: string;
  /**
   * Cabeceras de feed suscribible. En la descarga de una vez no van: no hay
   * ninguna URL que refrescar.
   */
  comoFeed?: boolean;
  /** Nombres a mostrar por curso (los renombres del usuario). */
  renombres?: Record<string, string>;
}

export function generarIcs(
  tareas: Tarea[],
  opciones: OpcionesIcs = {},
): string {
  const { nombre = "Syllo", comoFeed = false, renombres = {} } = opciones;

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Syllo//Tareas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escaparTexto(nombre)}`,
  ];

  if (comoFeed) {
    // Cuánto esperar antes de volver a pedir el feed. Google y Apple lo toman
    // como sugerencia: igual refrescan cada varias horas por su cuenta.
    lineas.push("REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H");
  }

  for (const tarea of tareas) {
    if (estaCompletada(tarea) || !tarea.vencimiento) continue;

    const inicio = new Date(
      tarea.vencimiento.year,
      tarea.vencimiento.month - 1,
      tarea.vencimiento.day,
    );
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1); // DTEND es exclusivo en eventos de todo el día

    const uid = uidPara(tarea, fechaComoYYYYMMDD(inicio));
    const curso = renombres[tarea.curso] || tarea.curso;

    lineas.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${fechaComoYYYYMMDD(inicio)}`,
      `DTEND;VALUE=DATE:${fechaComoYYYYMMDD(fin)}`,
      `SUMMARY:${escaparTexto(`${curso}: ${tarea.titulo}`)}`,
    );

    if (tarea.descripcion) {
      lineas.push(`DESCRIPTION:${escaparTexto(tarea.descripcion)}`);
    }
    if (tarea.link && tarea.link !== "#") {
      lineas.push(`URL:${escaparTexto(tarea.link)}`);
    }

    // El recordatorio, que es para lo que existe todo esto. En un evento de
    // todo el día DTSTART es la medianoche del día de entrega: 15 horas antes
    // cae a las 9 de la mañana del día anterior.
    lineas.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER;RELATED=START:-PT15H",
      `DESCRIPTION:${escaparTexto(`${curso}: ${tarea.titulo}`)}`,
      "END:VALARM",
    );

    lineas.push("END:VEVENT");
  }

  lineas.push("END:VCALENDAR");

  return lineas.map(foldLinea).join("\r\n") + "\r\n";
}

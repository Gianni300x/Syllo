import type { EventoCvg, FechaCvg } from "../types";

/** Une las líneas continuadas de RFC 5545 (empiezan con espacio o tab). */
function desplegarLineas(ics: string): string[] {
  return ics.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function desescapar(texto: string): string {
  return texto
    .replace(/\\[nN]/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function propiedad(linea: string): { nombre: string; valor: string } | null {
  const separador = linea.indexOf(":");
  if (separador < 0) return null;
  const nombre = linea.slice(0, separador).split(";", 1)[0].toUpperCase();
  return { nombre, valor: desescapar(linea.slice(separador + 1)) };
}

function parsearFecha(valor: string): FechaCvg | null {
  const coincidencia = valor.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!coincidencia) return null;
  const [, year, month, day] = coincidencia;
  const fecha = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
  const valida = new Date(Date.UTC(fecha.year, fecha.month - 1, fecha.day));
  if (
    valida.getUTCFullYear() !== fecha.year ||
    valida.getUTCMonth() + 1 !== fecha.month ||
    valida.getUTCDate() !== fecha.day
  ) {
    return null;
  }
  return fecha;
}

function primerLink(texto: string): string {
  return texto.match(/https?:\/\/[^\s<>"']+/)?.[0]?.replace(/[),.;]+$/, "") ?? "";
}

function cursoDesde(
  categorias: string,
  descripcion: string,
): string {
  const categoria = categorias
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);
  if (categoria) return categoria;

  const lineaCurso = descripcion.match(/(?:curso|course)\s*:\s*([^\n]+)/i)?.[1];
  return lineaCurso?.trim() || "CVG";
}

/**
 * Convierte el feed de Moodle/CVG en datos simples para Syllo.
 * Es deliberadamente puro: se prueba sin red, base ni credenciales.
 */
export function parsearCalendarioCvg(ics: string): EventoCvg[] {
  if (!/BEGIN:VCALENDAR/i.test(ics)) {
    throw new Error("El contenido no es un calendario válido");
  }

  const eventos: EventoCvg[] = [];
  let actual: Map<string, string> | null = null;

  for (const linea of desplegarLineas(ics)) {
    if (linea.trim().toUpperCase() === "BEGIN:VEVENT") {
      actual = new Map();
      continue;
    }
    if (linea.trim().toUpperCase() === "END:VEVENT") {
      if (actual) {
        const fecha = parsearFecha(actual.get("DTSTART") ?? "");
        const titulo = actual.get("SUMMARY")?.trim();
        if (fecha && titulo) {
          const descripcion = actual.get("DESCRIPTION") ?? "";
          eventos.push({
            id:
              actual.get("UID") ??
              `cvg-${fecha.year}${fecha.month}${fecha.day}-${eventos.length}`,
            titulo,
            descripcion,
            curso: cursoDesde(actual.get("CATEGORIES") ?? "", descripcion),
            fecha,
            link: actual.get("URL") ?? primerLink(descripcion),
          });
        }
      }
      actual = null;
      continue;
    }
    if (!actual) continue;
    const dato = propiedad(linea);
    if (dato && !actual.has(dato.nombre)) actual.set(dato.nombre, dato.valor);
  }

  return eventos.sort((a, b) => {
    const clave = (evento: EventoCvg) =>
      evento.fecha.year * 10_000 + evento.fecha.month * 100 + evento.fecha.day;
    return clave(a) - clave(b);
  });
}

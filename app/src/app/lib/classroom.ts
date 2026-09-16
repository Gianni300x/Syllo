import { MESES_CORTOS } from "./fechas";

export interface Tarea {
  curso: string;
  titulo: string;
  descripcion: string;
  puntos: number | null;
  vencimiento: { year: number; month: number; day: number } | null;
  estado: string;
  link: string;
  /** Presente solo si es un evento personal (tabla `eventos`), no una tarea de Classroom. */
  eventoId?: string;
  /** Ids de Classroom. Ausentes en los eventos personales (ver `eventoId`). */
  courseId?: string;
  courseWorkId?: string;
  /** Estado propio del alumno, de la tabla `estados_tareas`. Lo pega `aplicarEstados`. */
  empezada?: boolean;
  fijada?: boolean;
}

/**
 * Clave estable de una tarea de Classroom, para colgarle estado propio.
 *
 * Es el par (curso, trabajo) que devuelve Google: sobrevive a que el usuario
 * renombre el curso, a que el profesor cambie el título y a que se mueva la
 * fecha de entrega. Devuelve `null` para lo que no es una tarea de Classroom
 * (un evento personal) o para una tarea a la que Google no le mandó los ids.
 */
export function claveTarea(tarea: Tarea): string | null {
  if (!tarea.courseId || !tarea.courseWorkId) return null;
  return `${tarea.courseId}/${tarea.courseWorkId}`;
}

/**
 * Lo mínimo de una entrega para armar su VEVENT en el feed de calendario.
 * Es lo único que se persiste de Classroom (tabla `snapshot_tareas`).
 */
export interface TareaDelFeed {
  courseId: string;
  courseWorkId: string;
  curso: string;
  titulo: string;
  vencimiento: NonNullable<Tarea["vencimiento"]>;
  link: string;
}

const ESTADOS_COMPLETADOS = ["TURNED_IN", "RETURNED"];

/** La fecha de vencimiento como `Date` local (medianoche), o `null` si no tiene. */
export function fechaVencimiento(vencimiento: Tarea["vencimiento"]): Date | null {
  if (!vencimiento) return null;
  return new Date(vencimiento.year, vencimiento.month - 1, vencimiento.day);
}

export function diasHastaVencimiento(vencimiento: Tarea["vencimiento"]): number | null {
  const fecha = fechaVencimiento(vencimiento);
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffMs = fecha.getTime() - hoy.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function estaCompletada(tarea: Tarea): boolean {
  return ESTADOS_COMPLETADOS.includes(tarea.estado);
}

export function formatearFecha(vencimiento: Tarea["vencimiento"]): string {
  if (!vencimiento) return "Sin fecha";
  return `${vencimiento.day} ${MESES_CORTOS[vencimiento.month - 1]}`;
}

export function etiquetaVencimiento(dias: number | null): string {
  if (dias === null) return "Sin fecha";
  if (dias < 0) return `Vencido hace ${Math.abs(dias)}d`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `${dias} días restantes`;
}

export interface CuentaRegresiva {
  texto: string;
  dias: number;
  tipo: "hoy" | "manana" | "proximo" | "pasado" | "completado";
}

/**
 * Devuelve información de cuenta regresiva explícita y discreta para un evento/entrega.
 * Ejemplo: "Faltan 3 días", "Falta 1 día", "Hoy (0 días)", "Pasó hace 2 días", "Completado".
 */
export function cuentaRegresivaEvento(
  vencimiento: Tarea["vencimiento"],
  completada = false,
): CuentaRegresiva | null {
  if (completada) {
    return {
      texto: "Completado",
      dias: 0,
      tipo: "completado",
    };
  }

  const dias = diasHastaVencimiento(vencimiento);
  if (dias === null) return null;

  if (dias === 0) {
    return {
      texto: "Hoy (0 días)",
      dias: 0,
      tipo: "hoy",
    };
  }

  if (dias === 1) {
    return {
      texto: "Falta 1 día",
      dias: 1,
      tipo: "manana",
    };
  }

  if (dias > 1) {
    return {
      texto: `Faltan ${dias} días`,
      dias,
      tipo: "proximo",
    };
  }

  if (dias === -1) {
    return {
      texto: "Pasó ayer",
      dias: -1,
      tipo: "pasado",
    };
  }

  return {
    texto: `Pasó hace ${Math.abs(dias)} días`,
    dias,
    tipo: "pasado",
  };
}
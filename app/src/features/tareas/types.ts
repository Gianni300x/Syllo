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
  /** Distingue fuentes que comparten la vista de calendario. */
  origen?: "classroom" | "personal" | "cvg";
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

export interface CuentaRegresiva {
  texto: string;
  dias: number;
  tipo: "hoy" | "manana" | "proximo" | "pasado" | "completado";
}

/** Flags que el alumno puso sobre una tarea. */
export interface EstadoTarea {
  empezada: boolean;
  fijada: boolean;
}

/** Estados indexados por `claveTarea()` (`courseId/courseWorkId`). */
export type EstadosPorTarea = Record<string, EstadoTarea>;

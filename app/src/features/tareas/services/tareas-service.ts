/**
 * Capa de negocio: reglas sobre qué es "urgente", "pendiente", etc.
 * No sabe nada de Classroom/Gmail ni de cómo se renderiza en la UI.
 */
import {
  claveTarea,
  diasHastaVencimiento,
  estaCompletada,
  type Tarea,
  type TareaDelFeed,
} from "./classroom";

/** Una tarea deja de ser "urgente" cuando le quedan más de estos días. */
const LIMITE_DIAS_URGENTE = 3;
/** Ventana de "esta semana". */
const LIMITE_DIAS_SEMANA = 7;
/** Ventana para mostrar vencidas "recientes" en su propio tab. */
const LIMITE_DIAS_VENCIDA_RECIENTE = 30;

export interface TareasClasificadas {
  /** No completadas y sin vencer (o sin fecha de vencimiento). */
  pendientes: Tarea[];
  /** No completadas, vencidas hace 0 o más días. */
  vencidas: Tarea[];
  /** Subconjunto de `vencidas` vencido hace LIMITE_DIAS_VENCIDA_RECIENTE días o menos. */
  vencidasRecientes: Tarea[];
  /** Pendientes que vencen dentro de los próximos LIMITE_DIAS_URGENTE días. */
  urgentes: Tarea[];
  /** Pendientes que vencen dentro de los próximos LIMITE_DIAS_SEMANA días. */
  estaSemana: Tarea[];
  /** Pendientes que el alumno marcó como empezadas. */
  empezadas: Tarea[];
  completadas: Tarea[];
}

export function clasificarTareas(tareas: Tarea[]): TareasClasificadas {
  const noCompletadas = tareas.filter((t) => !estaCompletada(t));

  const vencidas = noCompletadas.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias < 0;
  });

  const vencidasRecientes = vencidas.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && Math.abs(dias) <= LIMITE_DIAS_VENCIDA_RECIENTE;
  });

  const pendientes = noCompletadas.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias === null || dias >= 0;
  });

  const urgentes = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias >= 0 && dias <= LIMITE_DIAS_URGENTE;
  });

  const estaSemana = pendientes.filter((t) => {
    const dias = diasHastaVencimiento(t.vencimiento);
    return dias !== null && dias >= 0 && dias <= LIMITE_DIAS_SEMANA;
  });

  const empezadas = pendientes.filter((t) => t.empezada);

  return {
    pendientes,
    vencidas,
    vencidasRecientes,
    urgentes,
    estaSemana,
    empezadas,
    completadas: tareas.filter(estaCompletada),
  };
}

/** Cuenta tareas no completadas por curso, para el contador del sidebar. */
export function contarPendientesPorCurso(tareas: Tarea[]): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const tarea of tareas) {
    if (!estaCompletada(tarea)) {
      conteo[tarea.curso] = (conteo[tarea.curso] ?? 0) + 1;
    }
  }
  return conteo;
}

/**
 * Pega el estado propio del alumno (empezada / fijada) sobre las tareas que
 * vienen de Google, cruzando por `claveTarea`. Las tareas sin clave (eventos
 * personales, o tareas sin ids) pasan intactas.
 */
export function aplicarEstados(
  tareas: Tarea[],
  estados: Record<string, { empezada: boolean; fijada: boolean }>,
): Tarea[] {
  return tareas.map((tarea) => {
    const clave = claveTarea(tarea);
    const estado = clave ? estados[clave] : undefined;
    if (!estado) return tarea;
    return { ...tarea, empezada: estado.empezada, fijada: estado.fijada };
  });
}

/**
 * Orden de la lista: primero lo que el alumno fijó, y dentro de cada grupo por
 * cercanía de la entrega. Sin fecha va al final.
 */
export function ordenarPorPrioridad(tareas: Tarea[]): Tarea[] {
  return [...tareas].sort((a, b) => {
    if (Boolean(a.fijada) !== Boolean(b.fijada)) return a.fijada ? -1 : 1;
    const diasA = diasHastaVencimiento(a.vencimiento) ?? Infinity;
    const diasB = diasHastaVencimiento(b.vencimiento) ?? Infinity;
    return diasA - diasB;
  });
}

/**
 * Lo que efectivamente va al feed de calendario: entregas de Classroom no
 * completadas, con fecha y con ids. Filtrar acá y no al leer mantiene el
 * snapshot chico y hace que la tabla no guarde nada que no se vaya a publicar.
 */
export function tareasParaFeed(tareas: Tarea[]): TareaDelFeed[] {
  const paraElFeed: TareaDelFeed[] = [];
  for (const tarea of tareas) {
    if (estaCompletada(tarea) || !tarea.vencimiento) continue;
    if (!tarea.courseId || !tarea.courseWorkId) continue;
    paraElFeed.push({
      courseId: tarea.courseId,
      courseWorkId: tarea.courseWorkId,
      curso: tarea.curso,
      titulo: tarea.titulo,
      vencimiento: tarea.vencimiento,
      link: tarea.link,
    });
  }
  return paraElFeed;
}

/** La vuelta: una fila del snapshot como `Tarea`, para `generarIcs`. */
export function tareaDelFeedComoTarea(tarea: TareaDelFeed): Tarea {
  return {
    curso: tarea.curso,
    titulo: tarea.titulo,
    descripcion: "",
    puntos: null,
    vencimiento: tarea.vencimiento,
    estado: "CREATED",
    link: tarea.link,
    courseId: tarea.courseId,
    courseWorkId: tarea.courseWorkId,
  };
}

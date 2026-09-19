import type { Tarea } from "@/features/tareas/types";
import type {
  Calificacion,
  ResumenCalificaciones,
} from "../types";

const ESTADOS_ENTREGADOS = new Set(["TURNED_IN", "RETURNED"]);

/**
 * Convierte las entregas de Classroom en la vista académica de calificaciones.
 * Las tareas todavía no entregadas no aparecen: no son una calificación pendiente.
 */
export function calificacionesDesdeTareas(tareas: Tarea[]): Calificacion[] {
  return tareas
    .filter(
      (tarea) =>
        typeof tarea.calificacion === "number" ||
        ESTADOS_ENTREGADOS.has(tarea.estado),
    )
    .map((tarea): Calificacion => ({
      id: `${tarea.courseId ?? tarea.curso}/${tarea.courseWorkId ?? tarea.titulo}`,
      curso: tarea.curso,
      titulo: tarea.titulo,
      puntosObtenidos:
        typeof tarea.calificacion === "number" ? tarea.calificacion : null,
      puntosMaximos: tarea.puntos,
      estado:
        typeof tarea.calificacion === "number"
          ? "calificada"
          : "sin_calificar",
      entregaTarde: tarea.entregaTarde ?? false,
      link: tarea.link,
    }))
    .sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === "calificada" ? -1 : 1;
      return (
        a.curso.localeCompare(b.curso, "es") ||
        a.titulo.localeCompare(b.titulo, "es")
      );
    });
}

export function resumirCalificaciones(
  calificaciones: Calificacion[],
): ResumenCalificaciones {
  const calificadas = calificaciones.filter(
    (item) => item.estado === "calificada",
  );
  const porcentajes = calificadas.flatMap((item) =>
    item.puntosObtenidos !== null &&
    item.puntosMaximos !== null &&
    item.puntosMaximos > 0
      ? [(item.puntosObtenidos / item.puntosMaximos) * 100]
      : [],
  );

  return {
    calificadas: calificadas.length,
    sinCalificar: calificaciones.length - calificadas.length,
    promedioPorcentual:
      porcentajes.length > 0
        ? Math.round(
            porcentajes.reduce((total, porcentaje) => total + porcentaje, 0) /
              porcentajes.length,
          )
        : null,
  };
}

export function contarCalificacionesPorCurso(
  calificaciones: Calificacion[],
): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const item of calificaciones) {
    conteo[item.curso] = (conteo[item.curso] ?? 0) + 1;
  }
  return conteo;
}

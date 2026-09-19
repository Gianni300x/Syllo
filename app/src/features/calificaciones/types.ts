export type EstadoCalificacion = "calificada" | "sin_calificar";

export interface Calificacion {
  id: string;
  curso: string;
  titulo: string;
  puntosObtenidos: number | null;
  puntosMaximos: number | null;
  estado: EstadoCalificacion;
  entregaTarde: boolean;
  link: string;
}

export interface ResumenCalificaciones {
  calificadas: number;
  sinCalificar: number;
  promedioPorcentual: number | null;
}

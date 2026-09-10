export interface Tarea {
  curso: string;
  titulo: string;
  descripcion: string;
  puntos: number | null;
  vencimiento: { year: number; month: number; day: number } | null;
  estado: string;
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
  const meses = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sept", "oct", "nov", "dic",
  ];
  return `${vencimiento.day} ${meses[vencimiento.month - 1]}`;
}

export function etiquetaVencimiento(dias: number | null): string {
  if (dias === null) return "Sin fecha";
  if (dias < 0) return `Vencido hace ${Math.abs(dias)}d`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `${dias} días restantes`;
}
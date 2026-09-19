export interface FechaCvg {
  year: number;
  month: number;
  day: number;
}

export interface EventoCvg {
  id: string;
  titulo: string;
  descripcion: string;
  curso: string;
  fecha: FechaCvg;
  link: string;
}

export type ErrorCalendarioCvg =
  | "enlace_vencido"
  | "sin_eventos"
  | "no_disponible";

export interface EstadoCalendarioCvg {
  conectado: boolean;
  eventos: EventoCvg[];
  error: ErrorCalendarioCvg | null;
}

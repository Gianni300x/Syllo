export type OrigenNovedad = "Classroom" | "CVG";

export interface Novedad {
  id: string;
  titulo: string;
  resumen: string;
  fecha: string;
  curso: string | null;
  origen: OrigenNovedad;
  tipo: "anuncio" | "evento";
  link: string;
}

export interface ResultadoAnuncios {
  anuncios: Novedad[];
  permisoFaltante: boolean;
  error: boolean;
}

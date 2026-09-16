export type OrigenCorreo = "Classroom" | "CVG";

export interface Correo {
  id: string;
  threadId: string;
  asunto: string;
  /** Nombre legible del remitente, o el mail si no viene nombre. */
  remitente: string;
  remitenteEmail: string;
  /** Fecha de recepción en ISO. */
  fecha: string;
  /** Vista previa que devuelve Gmail. */
  resumen: string;
  leido: boolean;
  destacado: boolean;
  /** Curso detectado a partir del asunto o resumen, si se pudo. */
  curso: string | null;
  /** Origen o plataforma del correo (Classroom o CVG). */
  origen: OrigenCorreo;
  /** Link para abrir el mensaje en Gmail. */
  link: string;
}

export interface PaginaCorreos {
  correos: Correo[];
  /** Token para pedir la página siguiente, o null si no hay más. */
  siguientePagina: string | null;
}

export interface CorreoCompleto extends Correo {
  html: string | null;
  texto: string | null;
}

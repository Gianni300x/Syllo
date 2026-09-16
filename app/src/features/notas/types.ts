export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  /** Nombre del curso, o `null` si la nota no es de ninguna materia. */
  curso: string | null;
  /** ISO string, para poder serializar del server component al client. */
  createdAt: string;
  updatedAt: string;
}

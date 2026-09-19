import type { Tarea } from "@/features/tareas/types";
import type { EventoCvg } from "../types";

export function eventoCvgComoTarea(evento: EventoCvg): Tarea {
  return {
    curso: evento.curso,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    puntos: null,
    vencimiento: evento.fecha,
    estado: "CREATED",
    link: evento.link,
    origen: "cvg",
  };
}

"use server";

import { revalidateTag } from "next/cache";

/**
 * Fuerza traer datos frescos de Google en la próxima carga, descartando el
 * cache de `unstable_cache` de tareas, correos y nombres de cursos.
 */
export async function actualizarDatos() {
  revalidateTag("tareas", "max");
  revalidateTag("correos", "max");
  revalidateTag("nombres-cursos", "max");
}

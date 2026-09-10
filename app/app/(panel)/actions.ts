"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Fuerza traer datos frescos en la próxima carga, descartando el
 * cache de `unstable_cache` de tareas, correos, notas, nombres de cursos y
 * cursos archivados.
 */
export async function actualizarDatos() {
  revalidateTag("tareas", "max");
  revalidateTag("correos", "max");
  revalidateTag("nombres-cursos", "max");
  revalidateTag("notas", "max");
  revalidateTag("cursos-archivados", "max");
  revalidatePath("/dashboard/notas");
}

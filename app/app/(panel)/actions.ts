"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Fuerza traer datos frescos en la próxima carga, descartando el
 * cache de `unstable_cache` de tareas, correos, notas y nombres de cursos.
 */
export async function actualizarDatos() {
  revalidateTag("tareas", "max");
  revalidateTag("correos", "max");
  revalidateTag("nombres-cursos", "max");
  revalidateTag("notas", "max");
  revalidatePath("/dashboard/notas");
}

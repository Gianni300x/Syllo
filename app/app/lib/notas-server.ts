/**
 * Capa de datos de Notas: lee de Postgres y cachea, igual patrón que
 * `tareas-server.ts` / `correos-server.ts`.
 *
 * - `cache()` de React deduplica dentro de un request.
 * - `unstable_cache` persiste entre requests durante `revalidate` segundos.
 *   La clave es únicamente `userId` (email). Se invalida con `updateTag`/
 *   `revalidateTag` desde las server actions al crear/editar/eliminar.
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { notas } from "./schema";
import type { Nota } from "./notas";

export async function fetchNotasDesdeDb(userId: string): Promise<Nota[]> {
  const db = getDb();

  const filas = await db
    .select()
    .from(notas)
    .where(eq(notas.ownerEmail, userId))
    .orderBy(desc(notas.updatedAt));

  return filas.map((fila) => ({
    id: fila.id,
    titulo: fila.titulo,
    contenido: fila.contenido,
    createdAt:
      fila.createdAt instanceof Date
        ? fila.createdAt.toISOString()
        : new Date(fila.createdAt).toISOString(),
    updatedAt:
      fila.updatedAt instanceof Date
        ? fila.updatedAt.toISOString()
        : new Date(fila.updatedAt).toISOString(),
  }));
}

export const getNotas = cache((userId: string) =>
  unstable_cache(
    () => fetchNotasDesdeDb(userId),
    ["notas", userId],
    { revalidate: 180, tags: ["notas", `u:${userId}`] },
  )(),
);
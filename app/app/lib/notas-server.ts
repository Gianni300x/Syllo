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

async function fetchNotasDeUsuario(userId: string): Promise<Nota[]> {
  const db = await getDb();
  const filas = await db
    .select()
    .from(notas)
    .where(eq(notas.ownerEmail, userId))
    .orderBy(desc(notas.updatedAt));

  return filas.map((fila) => ({
    id: fila.id,
    titulo: fila.titulo,
    contenido: fila.contenido,
    createdAt: fila.createdAt.toISOString(),
    updatedAt: fila.updatedAt.toISOString(),
  }));
}

export const getNotas = cache((userId: string) =>
  unstable_cache(
    () => fetchNotasDeUsuario(userId),
    ["notas", userId],
    { revalidate: 60, tags: ["notas", `u:${userId}`] },
  )(),
);

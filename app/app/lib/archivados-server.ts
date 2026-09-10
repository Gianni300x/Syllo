/**
 * Capa de datos de cursos archivados: lee de Postgres y cachea, igual patrón
 * que `notas-server.ts`. Se invalida con el tag `cursos-archivados` desde las
 * server actions de archivar/restaurar y desde el botón "Actualizar".
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { cursosArchivados } from "./schema";

export async function fetchCursosArchivados(userId: string): Promise<string[]> {
  const db = getDb();
  const filas = await db
    .select({ curso: cursosArchivados.curso })
    .from(cursosArchivados)
    .where(eq(cursosArchivados.ownerEmail, userId))
    .orderBy(asc(cursosArchivados.createdAt));
  return filas.map((fila) => fila.curso);
}

export const getCursosArchivados = cache((userId: string) =>
  unstable_cache(
    () => fetchCursosArchivados(userId),
    ["cursos-archivados", userId],
    { revalidate: 180, tags: ["cursos-archivados", `u:${userId}`] },
  )(),
);

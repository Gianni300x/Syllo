import { cache } from "react";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { cursosRenombrados } from "./schema";

export async function fetchCursosRenombrados(userId: string): Promise<Record<string, string>> {
  const db = getDb();
  const filas = await db
    .select({ original: cursosRenombrados.cursoOriginal, renombrado: cursosRenombrados.cursoRenombrado })
    .from(cursosRenombrados)
    .where(eq(cursosRenombrados.ownerEmail, userId));
  
  const mapa: Record<string, string> = {};
  for (const fila of filas) {
    mapa[fila.original] = fila.renombrado;
  }
  return mapa;
}

export const getCursosRenombrados = cache((userId: string) =>
  unstable_cache(
    () => fetchCursosRenombrados(userId),
    ["cursos-renombrados", userId],
    { revalidate: 180, tags: ["cursos-renombrados", `u:${userId}`] },
  )()
);

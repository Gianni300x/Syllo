/**
 * Capa de datos del estado propio sobre las tareas: lee de Postgres y cachea,
 * igual patrón que `archivados-server.ts`. Se invalida con el tag
 * `estados-tareas` desde `estados-actions.ts` y desde el botón "Actualizar".
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/app/lib/db";
import { estadosTareas } from "@/app/lib/schema";
import type { EstadoTarea, EstadosPorTarea } from "../types";

export type { EstadoTarea, EstadosPorTarea };

export async function fetchEstadosTareas(
  userId: string,
): Promise<EstadosPorTarea> {
  const db = getDb();
  const filas = await db
    .select({
      courseId: estadosTareas.courseId,
      courseWorkId: estadosTareas.courseWorkId,
      empezada: estadosTareas.empezada,
      fijada: estadosTareas.fijada,
    })
    .from(estadosTareas)
    .where(eq(estadosTareas.ownerEmail, userId));

  const estados: EstadosPorTarea = {};
  for (const fila of filas) {
    estados[`${fila.courseId}/${fila.courseWorkId}`] = {
      empezada: fila.empezada,
      fijada: fila.fijada,
    };
  }
  return estados;
}

export const getEstadosTareas = cache((userId: string) =>
  unstable_cache(() => fetchEstadosTareas(userId), ["estados-tareas", userId], {
    revalidate: 180,
    tags: ["estados-tareas", `u:${userId}`],
  })(),
);

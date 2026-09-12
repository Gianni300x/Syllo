import { getDb } from "./db";
import { eventos } from "./schema";
import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { Tarea } from "./classroom";

export async function getEventos(userId: string) {
  const db = getDb();
  return db.select().from(eventos).where(eq(eventos.ownerEmail, userId));
}

/** `getEventos` cacheado, revalidado por `eventos-actions.ts` vía `updateTag(eventos:${userId})`. */
export const getEventosCached = (userId: string) =>
  unstable_cache(
    async () => getEventos(userId),
    ["eventos", userId],
    { revalidate: 3600, tags: [`eventos:${userId}`] }
  )();

/** Convierte una fila de `eventos` al shape `Tarea` que usa el resto de la UI (calendario, .ics). */
export function eventoComoTarea(e: {
  id: string;
  titulo: string;
  curso: string;
  descripcion: string;
  vencimientoDia: Date | string;
}): Tarea {
  const vencimientoDia = new Date(e.vencimientoDia);
  return {
    curso: e.curso,
    titulo: e.titulo,
    descripcion: e.descripcion,
    puntos: null,
    vencimiento: {
      year: vencimientoDia.getFullYear(),
      month: vencimientoDia.getMonth() + 1,
      day: vencimientoDia.getDate(),
    },
    estado: "CREATED",
    link: "#",
    eventoId: e.id,
  };
}

export async function addEvento(userId: string, titulo: string, vencimientoDia: Date, curso: string, descripcion: string) {
  const db = getDb();
  await db.insert(eventos).values({
    ownerEmail: userId,
    titulo,
    vencimientoDia,
    curso,
    descripcion
  });
}

export async function updateEvento(id: string, userId: string, titulo: string, vencimientoDia: Date, curso: string, descripcion: string) {
  const db = getDb();
  await db
    .update(eventos)
    .set({ titulo, vencimientoDia, curso, descripcion })
    .where(and(eq(eventos.id, id), eq(eventos.ownerEmail, userId)));
}

export async function deleteEvento(id: string, userId: string) {
  const db = getDb();
  await db
    .delete(eventos)
    .where(and(eq(eventos.id, id), eq(eventos.ownerEmail, userId)));
}

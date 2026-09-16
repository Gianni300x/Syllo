/**
 * Capa de datos del feed de calendario: el token de cada usuario y la foto de
 * sus vencimientos.
 *
 * No se cachea con `unstable_cache`: el token se lee una vez al abrir el modal
 * y el snapshot lo lee el feed, que ya tiene su propio `Cache-Control`.
 */
import "server-only";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { feedsCalendario, snapshotTareas } from "@/lib/schema";
import type { Tarea, TareaDelFeed } from "@/features/tareas/services/classroom";
import { tareasParaFeed } from "@/features/tareas/services/tareas-service";

/**
 * 24 bytes de entropía. La URL del feed es la credencial —viaja a Google y
 * queda guardada en la suscripción del usuario—, así que no puede ser
 * adivinable ni derivable del email.
 */
function nuevoToken(): string {
  return randomBytes(24).toString("base64url");
}

/** El token del usuario, creándolo la primera vez que hace falta. */
export async function getOCrearTokenFeed(userId: string): Promise<string> {
  const db = getDb();

  const [existente] = await db
    .select({ token: feedsCalendario.token })
    .from(feedsCalendario)
    .where(eq(feedsCalendario.ownerEmail, userId));
  if (existente) return existente.token;

  const token = nuevoToken();
  const [fila] = await db
    .insert(feedsCalendario)
    .values({ ownerEmail: userId, token })
    // Si dos pestañas abren el modal a la vez, gana la primera y la segunda
    // se queda con el mismo token en vez de romper por la PK.
    .onConflictDoNothing()
    .returning({ token: feedsCalendario.token });

  if (fila) return fila.token;

  const [yaCreado] = await db
    .select({ token: feedsCalendario.token })
    .from(feedsCalendario)
    .where(eq(feedsCalendario.ownerEmail, userId));
  return yaCreado.token;
}

/** Rota el token: el link anterior deja de funcionar. */
export async function regenerarTokenFeed(userId: string): Promise<string> {
  const db = getDb();
  const token = nuevoToken();
  await db
    .insert(feedsCalendario)
    .values({ ownerEmail: userId, token })
    .onConflictDoUpdate({
      target: feedsCalendario.ownerEmail,
      set: { token, createdAt: new Date() },
    });
  return token;
}

/** El dueño de un token, o `null` si el token no existe (link viejo o inventado). */
export async function emailPorToken(token: string): Promise<string | null> {
  const db = getDb();
  const [fila] = await db
    .select({ ownerEmail: feedsCalendario.ownerEmail })
    .from(feedsCalendario)
    .where(eq(feedsCalendario.token, token));
  return fila?.ownerEmail ?? null;
}

export async function getSnapshotTareas(
  userId: string,
): Promise<TareaDelFeed[]> {
  const db = getDb();
  const [fila] = await db
    .select({ tareas: snapshotTareas.tareas })
    .from(snapshotTareas)
    .where(eq(snapshotTareas.ownerEmail, userId));
  return fila?.tareas ?? [];
}

/**
 * Reescribe la foto de los vencimientos, si cambió.
 *
 * La comparación evita un `UPDATE` por cada navegación del panel: las tareas
 * cambian un par de veces por semana, la gente abre la app muchas veces por día.
 */
export async function guardarSnapshotTareas(
  userId: string,
  tareas: TareaDelFeed[],
): Promise<void> {
  const db = getDb();

  const actuales = await getSnapshotTareas(userId);
  if (JSON.stringify(actuales) === JSON.stringify(tareas)) return;

  await db
    .insert(snapshotTareas)
    .values({ ownerEmail: userId, tareas })
    .onConflictDoUpdate({
      target: snapshotTareas.ownerEmail,
      set: { tareas, actualizadoEn: new Date() },
    });
}

/**
 * Punto de entrada desde las páginas del panel: refresca la foto con las
 * tareas que se acaban de pedir a Google.
 *
 * Va dentro de `after()` para no meterse en el camino del render, y se saltea
 * si no hay un email real (las páginas caen a `"anon"` cuando falta).
 */
export async function refrescarSnapshotDelFeed(
  email: string | null | undefined,
  tareas: Tarea[],
): Promise<void> {
  if (!email || email === "anon") return;
  try {
    await guardarSnapshotTareas(email, tareasParaFeed(tareas));
  } catch (error) {
    // Que el feed quede viejo no puede romper el panel.
    console.error("No se pudo actualizar el snapshot del feed:", error);
  }
}

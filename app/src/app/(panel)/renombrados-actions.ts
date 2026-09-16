"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "../lib/db";
import { cursosRenombrados } from "../lib/schema";

export async function renombrarCursoAction(cursoOriginal: string, nuevoNombre: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autorizado" };

  const db = getDb();
  
  if (!nuevoNombre || nuevoNombre.trim() === "") {
    // Si envían un nombre vacío, restauran el nombre original (borrando la fila)
    await db
      .delete(cursosRenombrados)
      .where(
        and(
          eq(cursosRenombrados.ownerEmail, session.user.email),
          eq(cursosRenombrados.cursoOriginal, cursoOriginal)
        )
      );
  } else {
    // Upsert (insert or update)
    await db
      .insert(cursosRenombrados)
      .values({
        ownerEmail: session.user.email,
        cursoOriginal,
        cursoRenombrado: nuevoNombre.trim(),
      })
      .onConflictDoUpdate({
        target: [cursosRenombrados.ownerEmail, cursosRenombrados.cursoOriginal],
        set: { cursoRenombrado: nuevoNombre.trim() },
      });
  }

  revalidateTag(`u:${session.user.email}`, "max");
  revalidateTag("cursos-renombrados", "max");
  revalidatePath("/dashboard");
  return { success: true };
}

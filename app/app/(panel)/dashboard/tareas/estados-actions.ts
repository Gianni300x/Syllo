"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/app/lib/db";
import { estadosTareas } from "@/app/lib/schema";

export interface ResultadoEstado {
  ok?: boolean;
  error?: string;
}

type CodigoError = "no_autenticado" | "clave_invalida" | "error_db";

/** Los dos ejes de estado propio que hoy maneja el alumno. */
export type CampoEstado = "empezada" | "fijada";

const MAX_ID = 100;

function err(codigo: CodigoError): ResultadoEstado {
  return { error: codigo };
}

/**
 * El email de la sesión, o `null`. A diferencia de las páginas, acá nunca se
 * usa el fallback `"anon"`: escribiría filas de un usuario inventado.
 */
async function emailActual(): Promise<string | null> {
  const session = await auth();
  if (!session?.access_token || session.error) return null;
  return session.user?.email ?? null;
}

function idValido(valor: unknown): valor is string {
  return typeof valor === "string" && valor.length > 0 && valor.length <= MAX_ID;
}

/**
 * Marca o desmarca un eje del estado propio sobre una tarea de Classroom.
 *
 * Es un upsert: la fila existe solo mientras el alumno tenga algo marcado, y
 * cuando los dos flags vuelven a `false` se borra.
 */
export async function alternarEstadoTarea(
  courseId: string,
  courseWorkId: string,
  campo: CampoEstado,
  valor: boolean,
): Promise<ResultadoEstado> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  if (!idValido(courseId) || !idValido(courseWorkId)) {
    return err("clave_invalida");
  }
  if (campo !== "empezada" && campo !== "fijada") {
    return err("clave_invalida");
  }

  try {
    const db = getDb();

    if (valor) {
      await db
        .insert(estadosTareas)
        .values({
          ownerEmail: email,
          courseId,
          courseWorkId,
          empezada: campo === "empezada",
          fijada: campo === "fijada",
        })
        .onConflictDoUpdate({
          target: [
            estadosTareas.ownerEmail,
            estadosTareas.courseId,
            estadosTareas.courseWorkId,
          ],
          set: { [campo]: true, updatedAt: new Date() },
        });
    } else {
      // Apagar el flag y, si el otro también quedó apagado, borrar la fila:
      // la tabla solo guarda las tareas que el alumno tocó.
      const otro: CampoEstado = campo === "empezada" ? "fijada" : "empezada";
      await db
        .update(estadosTareas)
        .set({ [campo]: false, updatedAt: new Date() })
        .where(
          and(
            eq(estadosTareas.ownerEmail, email),
            eq(estadosTareas.courseId, courseId),
            eq(estadosTareas.courseWorkId, courseWorkId),
          ),
        );
      await db
        .delete(estadosTareas)
        .where(
          and(
            eq(estadosTareas.ownerEmail, email),
            eq(estadosTareas.courseId, courseId),
            eq(estadosTareas.courseWorkId, courseWorkId),
            eq(estadosTareas[otro], false),
          ),
        );
    }
  } catch (error) {
    console.error("Error al actualizar el estado de la tarea:", error);
    return err("error_db");
  }

  revalidateTag("estados-tareas", "max");
  revalidateTag(`u:${email}`, "max");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tareas");
  return { ok: true };
}

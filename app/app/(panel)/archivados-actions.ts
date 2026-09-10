"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/app/lib/db";
import { cursosArchivados } from "@/app/lib/schema";

export interface ResultadoArchivado {
  ok?: boolean;
  error?: string;
}

type CodigoError = "no_autenticado" | "cursos_invalidos" | "error_db";

const MAX_NOMBRE_CURSO = 200;

function err(codigo: CodigoError): ResultadoArchivado {
  return { error: codigo };
}

async function emailActual(): Promise<string | null> {
  const session = await auth();
  if (!session?.access_token || session.error) return null;
  return session.user?.email ?? null;
}

/** Normaliza la lista: strings no vacíos, sin duplicados, con largo acotado. */
function limpiarCursos(cursos: unknown): string[] | null {
  if (!Array.isArray(cursos)) return null;
  const limpios = Array.from(
    new Set(
      cursos
        .filter((c): c is string => typeof c === "string")
        .map((c) => c.trim())
        .filter((c) => c.length > 0 && c.length <= MAX_NOMBRE_CURSO),
    ),
  );
  return limpios.length > 0 ? limpios : null;
}

function invalidar(email: string) {
  revalidateTag("cursos-archivados", "max");
  revalidateTag(`u:${email}`, "max");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/correos");
}

export async function archivarCursos(
  cursos: string[],
): Promise<ResultadoArchivado> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  const limpios = limpiarCursos(cursos);
  if (!limpios) return err("cursos_invalidos");

  try {
    const db = getDb();
    await db
      .insert(cursosArchivados)
      .values(limpios.map((curso) => ({ ownerEmail: email, curso })))
      .onConflictDoNothing();
  } catch (error) {
    console.error("Error al archivar cursos:", error);
    return err("error_db");
  }

  invalidar(email);
  return { ok: true };
}

export async function restaurarCursos(
  cursos: string[],
): Promise<ResultadoArchivado> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  const limpios = limpiarCursos(cursos);
  if (!limpios) return err("cursos_invalidos");

  try {
    const db = getDb();
    await db
      .delete(cursosArchivados)
      .where(
        and(
          eq(cursosArchivados.ownerEmail, email),
          inArray(cursosArchivados.curso, limpios),
        ),
      );
  } catch (error) {
    console.error("Error al restaurar cursos:", error);
    return err("error_db");
  }

  invalidar(email);
  return { ok: true };
}

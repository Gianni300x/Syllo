"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/app/lib/db";
import { notas } from "@/app/lib/schema";
import {
  MAX_CONTENIDO,
  MAX_CONTENIDO_HTML,
  MAX_TITULO,
  estaVacio,
  textoPlano,
} from "@/app/lib/notas";

export interface ResultadoNota {
  ok?: boolean;
  error?: string;
}

/** Códigos de error en snake_case español, igual criterio que las route handlers. */
type CodigoError =
  | "no_autenticado"
  | "nota_vacia"
  | "titulo_muy_largo"
  | "contenido_muy_largo"
  | "falta_id"
  | "nota_no_encontrada"
  | "error_db";

function err(codigo: CodigoError): ResultadoNota {
  return { error: codigo };
}

async function emailActual(): Promise<string | null> {
  const session = await auth();
  if (!session?.access_token || session.error) return null;
  return session.user?.email ?? null;
}

function leerCampos(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const crudo = String(formData.get("contenido") ?? "").trim();
  // Normaliza el documento vacío de Tiptap a cadena vacía, para que las notas
  // que son solo título no queden con marcado fantasma en la base.
  const contenido = estaVacio(crudo) ? "" : crudo;
  return { titulo, contenido };
}

function validar(titulo: string, contenido: string): CodigoError | null {
  // El editor es HTML: un documento vacío igual llega como "<p></p>", así que
  // "sin contenido" se decide sobre el texto plano, no sobre el largo del HTML.
  if (!titulo && estaVacio(contenido)) return "nota_vacia";
  if (titulo.length > MAX_TITULO) return "titulo_muy_largo";
  // Se topean las dos cosas: lo que el usuario escribió y el HTML que lo envuelve.
  if (textoPlano(contenido).length > MAX_CONTENIDO) return "contenido_muy_largo";
  if (contenido.length > MAX_CONTENIDO_HTML) return "contenido_muy_largo";
  return null;
}

export async function crearNota(
  _prev: ResultadoNota,
  formData: FormData,
): Promise<ResultadoNota> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  const { titulo, contenido } = leerCampos(formData);
  const problema = validar(titulo, contenido);
  if (problema) return err(problema);

  try {
    const db = await getDb();
    await db.insert(notas).values({ ownerEmail: email, titulo, contenido });
  } catch (error) {
    console.error("Error al crear la nota:", error);
    return err("error_db");
  }

  revalidatePath("/dashboard/notas");
  revalidateTag("notas", "max");
  revalidateTag(`u:${email}`, "max");
  return { ok: true };
}

export async function editarNota(
  _prev: ResultadoNota,
  formData: FormData,
): Promise<ResultadoNota> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return err("falta_id");

  const { titulo, contenido } = leerCampos(formData);
  const problema = validar(titulo, contenido);
  if (problema) return err(problema);

  try {
    const db = await getDb();
    const filas = await db
      .update(notas)
      .set({ titulo, contenido, updatedAt: new Date() })
      .where(and(eq(notas.id, id), eq(notas.ownerEmail, email)))
      .returning({ id: notas.id });
    if (filas.length === 0) return err("nota_no_encontrada");
  } catch (error) {
    console.error("Error al editar la nota:", error);
    return err("error_db");
  }

  revalidatePath("/dashboard/notas");
  revalidateTag("notas", "max");
  revalidateTag(`u:${email}`, "max");
  return { ok: true };
}

export async function eliminarNota(
  _prev: ResultadoNota,
  formData: FormData,
): Promise<ResultadoNota> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return err("falta_id");

  try {
    const db = await getDb();
    const filas = await db
      .delete(notas)
      .where(and(eq(notas.id, id), eq(notas.ownerEmail, email)))
      .returning({ id: notas.id });
    if (filas.length === 0) return err("nota_no_encontrada");
  } catch (error) {
    console.error("Error al eliminar la nota:", error);
    return err("error_db");
  }

  revalidatePath("/dashboard/notas");
  revalidateTag("notas", "max");
  revalidateTag(`u:${email}`, "max");
  return { ok: true };
}

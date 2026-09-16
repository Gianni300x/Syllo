"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import {
  getOCrearTokenFeed,
  regenerarTokenFeed,
} from "@/app/lib/feed-server";

export interface ResultadoFeed {
  /** La URL completa del feed, lista para pegar en Google o Apple Calendar. */
  url?: string;
  error?: string;
}

type CodigoError = "no_autenticado" | "error_db";

function err(codigo: CodigoError): ResultadoFeed {
  return { error: codigo };
}

async function emailActual(): Promise<string | null> {
  const session = await auth();
  if (!session?.access_token || session.error) return null;
  return session.user?.email ?? null;
}

/**
 * El origen público de la app, tomado del request.
 *
 * Sale de los headers y no de una variable de entorno para que el link sirva
 * igual en `localhost`, en un túnel de pruebas y en producción, sin configurar
 * nada.
 */
async function origen(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocolo =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

/** El link del feed del usuario, creándolo la primera vez. */
export async function obtenerLinkFeed(): Promise<ResultadoFeed> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  try {
    const token = await getOCrearTokenFeed(email);
    return { url: `${await origen()}/api/calendario/${token}` };
  } catch (error) {
    console.error("Error al obtener el link del feed:", error);
    return err("error_db");
  }
}

/** Rota el token: el link anterior deja de responder. */
export async function regenerarLinkFeed(): Promise<ResultadoFeed> {
  const email = await emailActual();
  if (!email) return err("no_autenticado");

  try {
    const token = await regenerarTokenFeed(email);
    return { url: `${await origen()}/api/calendario/${token}` };
  } catch (error) {
    console.error("Error al regenerar el link del feed:", error);
    return err("error_db");
  }
}

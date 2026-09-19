import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { calendariosCvg } from "@/lib/schema";
import type { EstadoCalendarioCvg, EventoCvg } from "../types";
import { cifrarUrlCvg, descifrarUrlCvg } from "./crypto";
import { parsearCalendarioCvg } from "./ics-parser";

const HOST_CVG = "frro.cvg.utn.edu.ar";
const RUTA_EXPORTACION = "/calendar/export_execute.php";
const MAX_ICS_BYTES = 2_000_000;

export function validarUrlCalendarioCvg(valor: string): URL {
  let url: URL;
  try {
    url = new URL(valor.trim());
  } catch {
    throw new Error("Pegá una URL válida");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== HOST_CVG ||
    url.pathname !== RUTA_EXPORTACION ||
    !url.searchParams.get("userid") ||
    !url.searchParams.get("authtoken")
  ) {
    throw new Error("El enlace debe ser la URL de calendario generada por el CVG");
  }
  return url;
}

async function descargarEventos(url: URL): Promise<EventoCvg[]> {
  const respuesta = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    headers: { Accept: "text/calendar,text/plain;q=0.9" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!respuesta.ok) throw new Error("El CVG rechazó el enlace");
  const ics = await respuesta.text();
  if (Buffer.byteLength(ics, "utf8") > MAX_ICS_BYTES) {
    throw new Error("El calendario es demasiado grande");
  }
  return parsearCalendarioCvg(ics);
}

export async function comprobarCalendarioCvg(valor: string): Promise<EventoCvg[]> {
  return descargarEventos(validarUrlCalendarioCvg(valor));
}

export async function guardarCalendarioCvg(userId: string, url: string) {
  const db = getDb();
  const urlCifrada = cifrarUrlCvg(url.trim());
  await db
    .insert(calendariosCvg)
    .values({ ownerEmail: userId, urlCifrada })
    .onConflictDoUpdate({
      target: calendariosCvg.ownerEmail,
      set: { urlCifrada, updatedAt: sql`now()` },
    });
}

export async function borrarCalendarioCvg(userId: string) {
  const db = getDb();
  await db.delete(calendariosCvg).where(eq(calendariosCvg.ownerEmail, userId));
}

async function cargarEstado(userId: string): Promise<EstadoCalendarioCvg> {
  const db = getDb();
  const [conexion] = await db
    .select({ urlCifrada: calendariosCvg.urlCifrada })
    .from(calendariosCvg)
    .where(eq(calendariosCvg.ownerEmail, userId))
    .limit(1);

  if (!conexion) return { conectado: false, eventos: [], error: null };

  try {
    const url = validarUrlCalendarioCvg(descifrarUrlCvg(conexion.urlCifrada));
    const eventos = await descargarEventos(url);
    return {
      conectado: true,
      eventos,
      error: eventos.length === 0 ? "sin_eventos" : null,
    };
  } catch (error) {
    console.error("No se pudo actualizar el calendario CVG:", error);
    return { conectado: true, eventos: [], error: "enlace_vencido" };
  }
}

export const getEstadoCalendarioCvg = cache((userId: string) =>
  unstable_cache(() => cargarEstado(userId), ["calendario-cvg", userId], {
    revalidate: 300,
    tags: ["calendario-cvg", `calendario-cvg:${userId}`, `u:${userId}`],
  })(),
);

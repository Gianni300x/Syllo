"use server";

import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import {
  borrarCalendarioCvg,
  comprobarCalendarioCvg,
  guardarCalendarioCvg,
} from "./cvg-server";

export interface ResultadoConexionCvg {
  ok: boolean;
  error?: string;
  cantidadEventos?: number;
}

function refrescar(userId: string) {
  updateTag(`calendario-cvg:${userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/novedades");
  revalidatePath("/dashboard/calendario");
}

export async function conectarCalendarioCvg(
  url: string,
): Promise<ResultadoConexionCvg> {
  const session = await auth();
  const userId = session?.user?.email;
  if (!userId) return { ok: false, error: "Tu sesión venció. Volvé a entrar." };

  try {
    const eventos = await comprobarCalendarioCvg(url);
    await guardarCalendarioCvg(userId, url);
    refrescar(userId);
    return { ok: true, cantidadEventos: eventos.length };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No pudimos leer el calendario";
    return { ok: false, error: mensaje };
  }
}

export async function desconectarCalendarioCvg(): Promise<ResultadoConexionCvg> {
  const session = await auth();
  const userId = session?.user?.email;
  if (!userId) return { ok: false, error: "Tu sesión venció. Volvé a entrar." };

  try {
    await borrarCalendarioCvg(userId);
    refrescar(userId);
    return { ok: true };
  } catch (error) {
    console.error("No se pudo desconectar el calendario CVG:", error);
    return { ok: false, error: "No pudimos desconectar el calendario." };
  }
}

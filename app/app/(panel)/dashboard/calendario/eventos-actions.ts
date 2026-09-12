"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { addEvento } from "../../../lib/eventos-service";

export async function crearEventoAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.email;
  if (!userId) throw new Error("No autorizado");

  const titulo = formData.get("titulo") as string;
  const fechaStr = formData.get("fecha") as string;
  const curso = (formData.get("curso") as string) || "Personal";
  const descripcion = (formData.get("descripcion") as string) || "";
  
  if (!titulo || !fechaStr) throw new Error("Faltan datos");

  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);

  await addEvento(userId, titulo, fecha, curso, descripcion);
  revalidateTag(`eventos:${userId}`, "max");
}

import { auth } from "@/auth";
import { getTareas } from "@/features/tareas/services/tareas-server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.access_token) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const userId = session.user?.email ?? "anon";
  const tareas = await getTareas(session.access_token, userId);
  return NextResponse.json(tareas);
}

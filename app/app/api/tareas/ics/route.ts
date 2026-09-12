import { auth } from "@/auth";
import { getTareas } from "@/app/lib/tareas-server";
import { getCursosArchivados } from "@/app/lib/archivados-server";
import { eventoComoTarea, getEventos } from "@/app/lib/eventos-service";
import { generarIcs } from "@/app/lib/ics";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.access_token) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const userId = session.user?.email ?? "anon";
  const [tareas, cursosArchivados, eventosRaw] = await Promise.all([
    getTareas(session.access_token, userId),
    getCursosArchivados(userId),
    getEventos(userId),
  ]);

  const tareasActivas = tareas.filter(
    (t) => !cursosArchivados.includes(t.curso),
  );
  const eventosActivos = eventosRaw
    .map(eventoComoTarea)
    .filter((t) => !cursosArchivados.includes(t.curso));

  return new NextResponse(generarIcs([...tareasActivas, ...eventosActivos]), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="syllo.ics"',
    },
  });
}

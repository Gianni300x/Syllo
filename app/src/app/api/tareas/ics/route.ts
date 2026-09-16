import { auth } from "@/auth";
import { getTareas } from "@/features/tareas/services/tareas-server";
import { getCursosArchivados } from "@/features/archivados/services/archivados-server";
import { getCursosRenombrados } from "@/features/archivados/services/renombrados-server";
import { eventoComoTarea, getEventos } from "@/features/calendario/services/eventos-service";
import { generarIcs } from "@/features/calendario/services/ics";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.access_token) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const userId = session.user?.email ?? "anon";
  const [tareas, cursosArchivados, eventosRaw, renombres] = await Promise.all([
    getTareas(session.access_token, userId),
    getCursosArchivados(userId),
    getEventos(userId),
    getCursosRenombrados(userId),
  ]);

  const tareasActivas = tareas.filter(
    (t) => !cursosArchivados.includes(t.curso),
  );
  const eventosActivos = eventosRaw
    .map(eventoComoTarea)
    .filter((t) => !cursosArchivados.includes(t.curso));

  // La descarga de una vez, para quien no quiera suscribirse. El feed en vivo
  // vive en `/api/calendario/[token]`.
  const ics = generarIcs([...tareasActivas, ...eventosActivos], {
    nombre: "Syllo",
    renombres,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="syllo.ics"',
    },
  });
}

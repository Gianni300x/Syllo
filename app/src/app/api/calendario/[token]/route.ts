import { NextResponse } from "next/server";
import { fetchCursosArchivados } from "@/features/archivados/services/archivados-server";
import { fetchCursosRenombrados } from "@/features/archivados/services/renombrados-server";
import { eventoComoTarea, getEventos } from "@/features/calendario/services/eventos-service";
import { emailPorToken, getSnapshotTareas } from "@/features/calendario/services/feed-server";
import { tareaDelFeedComoTarea } from "@/features/tareas/services/tareas-service";
import { generarIcs } from "@/features/calendario/services/ics";

/**
 * Feed de calendario suscribible, en `webcal://` o `https://`.
 *
 * A diferencia de `/api/tareas/ics`, esta ruta es pública: la consultan los
 * servidores de Google y de Apple, sin cookie. El token de la URL es toda la
 * credencial, y por eso el usuario puede regenerarlo.
 *
 * No llama a Google: responde con la foto que dejó el panel en
 * `snapshot_tareas` más los eventos personales, que ya viven en la base. Así
 * no hace falta guardar ninguna credencial de Google para servir el feed.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/calendario/[token]">,
) {
  const { token } = await ctx.params;

  const email = await emailPorToken(token);
  if (!email) {
    // Token inventado o regenerado: nada que decirle a quien consulta.
    return new NextResponse("No encontrado", { status: 404 });
  }

  const [snapshot, eventosRaw, cursosArchivados, renombres] = await Promise.all(
    [
      getSnapshotTareas(email),
      getEventos(email),
      fetchCursosArchivados(email),
      fetchCursosRenombrados(email),
    ],
  );

  const tareas = snapshot
    .map(tareaDelFeedComoTarea)
    .filter((t) => !cursosArchivados.includes(t.curso));
  const eventos = eventosRaw
    .map(eventoComoTarea)
    .filter((t) => !cursosArchivados.includes(t.curso));

  const ics = generarIcs([...tareas, ...eventos], {
    nombre: "Syllo",
    comoFeed: true,
    renombres,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Sin `Content-Disposition`: esto se suscribe, no se descarga.
      "Cache-Control": "public, max-age=900",
    },
  });
}

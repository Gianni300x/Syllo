import { after } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas } from "@/features/tareas/services/tareas-server";
import {
  eventosCvgComoNovedades,
  getAnunciosSeguros,
} from "@/features/novedades/services/novedades-server";
import { getEstadoCalendarioCvg } from "@/features/cvg/services/cvg-server";
import { getNotas } from "@/features/notas/services/notas-server";
import { eventoComoTarea, getEventosCached } from "@/features/calendario/services/eventos-service";
import { getEstadosTareas } from "@/features/tareas/services/estados-tareas-server";
import { aplicarEstados } from "@/features/tareas/services/tareas-service";
import { refrescarSnapshotDelFeed } from "@/features/calendario/services/feed-server";
import HomeView from "@/features/dashboard/components/home-view";

export default async function DashboardHomePage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";

  const [tareasDeGoogle, classroom, estadoCvg, notas, eventosRaw, estados] =
    await Promise.all([
      getTareas(session.access_token, userId),
      getAnunciosSeguros(session.access_token, userId),
      getEstadoCalendarioCvg(userId),
      getNotas(userId),
      getEventosCached(userId),
      getEstadosTareas(userId),
    ]);

  const tareas = aplicarEstados(tareasDeGoogle, estados);
  const eventos = eventosRaw.map(eventoComoTarea);

  // Ídem Tareas: mantener fresca la foto que consulta el feed de calendario.
  after(() => refrescarSnapshotDelFeed(session.user?.email, tareasDeGoogle));

  const novedades = [
    ...eventosCvgComoNovedades(estadoCvg.eventos),
    ...classroom.anuncios,
  ];

  return <HomeView tareas={tareas} eventos={eventos} novedades={novedades} notas={notas} usuario={session.user} />;
}

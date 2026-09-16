import { after } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas, getNombresCursos } from "@/features/tareas/services/tareas-server";
import { getCorreosInicial } from "@/features/correos/services/correos-server";
import { getNotas } from "@/features/notas/services/notas-server";
import { eventoComoTarea, getEventosCached } from "@/features/calendario/services/eventos-service";
import { getEstadosTareas } from "@/features/tareas/services/estados-tareas-server";
import { aplicarEstados } from "@/features/tareas/services/tareas-service";
import { refrescarSnapshotDelFeed } from "@/features/calendario/services/feed-server";
import HomeView from "../../components/home-view";

export default async function DashboardHomePage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";

  const cursos = await getNombresCursos(session.access_token, userId);

  const [tareasDeGoogle, correosPagina, notas, eventosRaw, estados] =
    await Promise.all([
      getTareas(session.access_token, userId),
      getCorreosInicial(session.access_token, userId, cursos),
      getNotas(userId),
      getEventosCached(userId),
      getEstadosTareas(userId),
    ]);

  const tareas = aplicarEstados(tareasDeGoogle, estados);
  const eventos = eventosRaw.map(eventoComoTarea);

  // Ídem Tareas: mantener fresca la foto que consulta el feed de calendario.
  after(() => refrescarSnapshotDelFeed(session.user?.email, tareasDeGoogle));

  return <HomeView tareas={tareas} eventos={eventos} correos={correosPagina.correos} notas={notas} usuario={session.user} />;
}

import { after } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas } from "@/features/tareas/services/tareas-server";
import { getEstadosTareas } from "@/features/tareas/services/estados-tareas-server";
import { aplicarEstados } from "@/features/tareas/services/tareas-service";
import { refrescarSnapshotDelFeed } from "../../../lib/feed-server";
import Dashboard from "../../../components/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";
  const [tareasDeGoogle, estados] = await Promise.all([
    getTareas(session.access_token, userId),
    getEstadosTareas(userId),
  ]);
  const tareas = aplicarEstados(tareasDeGoogle, estados);

  // La foto que alimenta el feed de calendario se actualiza cada vez que el
  // usuario mira sus tareas, después de responder.
  after(() => refrescarSnapshotDelFeed(session.user?.email, tareasDeGoogle));

  return <Dashboard tareas={tareas} />;
}

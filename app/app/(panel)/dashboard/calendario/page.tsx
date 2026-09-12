import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas } from "../../../lib/tareas-server";
import { eventoComoTarea, getEventosCached } from "../../../lib/eventos-service";
import Calendario from "../../../components/calendario";
import type { Tarea } from "../../../lib/classroom";

export default async function CalendarioPage() {
  const session = await auth();

  if (!session?.access_token || session.error) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";
  const [tareas, eventosRaw] = await Promise.all([
    getTareas(session.access_token, userId),
    getEventosCached(userId)
  ]);

  const eventosComoTareas: Tarea[] = eventosRaw.map(eventoComoTarea);

  const tareasYEventos = [...tareas, ...eventosComoTareas];

  return <Calendario tareas={tareasYEventos} />;
}

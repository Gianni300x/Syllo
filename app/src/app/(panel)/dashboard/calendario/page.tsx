import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas } from "@/features/tareas/services/tareas-server";
import { eventoComoTarea, getEventosCached } from "@/features/calendario/services/eventos-service";
import Calendario from "@/features/calendario/components/calendario";
import type { Tarea } from "@/features/tareas/services/classroom";

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

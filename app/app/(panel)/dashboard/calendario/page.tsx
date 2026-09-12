import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { getTareas } from "../../../lib/tareas-server";
import { getEventos } from "../../../lib/eventos-service";
import Calendario from "../../../components/calendario";
import type { Tarea } from "../../../lib/classroom";

const getEventosCached = (userId: string) => 
  unstable_cache(
    async () => getEventos(userId),
    ["eventos", userId],
    { revalidate: 3600, tags: [`eventos:${userId}`] }
  )();

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

  const eventosComoTareas: Tarea[] = eventosRaw.map(e => ({
    curso: e.curso,
    titulo: e.titulo,
    descripcion: e.descripcion,
    puntos: null,
    vencimiento: {
      year: e.vencimientoDia.getFullYear(),
      month: e.vencimientoDia.getMonth() + 1,
      day: e.vencimientoDia.getDate()
    },
    estado: "CREATED",
    link: "#"
  }));

  const tareasYEventos = [...tareas, ...eventosComoTareas];

  return <Calendario tareas={tareasYEventos} />;
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas, getNombresCursos } from "../../lib/tareas-server";
import { getCorreosInicial } from "../../lib/correos-server";
import { getNotas } from "../../lib/notas-server";
import HomeView from "../../components/home-view";

export default async function DashboardHomePage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";
  
  const cursos = await getNombresCursos(session.access_token, userId);

  const [tareas, correosPagina, notas] = await Promise.all([
    getTareas(session.access_token, userId),
    getCorreosInicial(session.access_token, userId, cursos),
    getNotas(userId),
  ]);

  return <HomeView tareas={tareas} correos={correosPagina.correos} notas={notas} usuario={session.user} />;
}

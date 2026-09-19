import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Calificaciones from "@/features/calificaciones/components/calificaciones";
import { calificacionesDesdeTareas } from "@/features/calificaciones/services/calificaciones";
import { getTareas } from "@/features/tareas/services/tareas-server";

export default async function CalificacionesPage() {
  const session = await auth();
  if (!session?.access_token || session.error) redirect("/");

  const userId = session.user?.email ?? "anon";
  const tareas = await getTareas(session.access_token, userId);

  return <Calificaciones items={calificacionesDesdeTareas(tareas)} />;
}

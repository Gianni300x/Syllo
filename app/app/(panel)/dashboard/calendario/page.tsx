import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas } from "../../../lib/tareas-server";
import Calendario from "../../../components/calendario";

export default async function CalendarioPage() {
  const session = await auth();

  if (!session?.access_token || session.error) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";
  const tareas = await getTareas(session.access_token, userId);

  return <Calendario tareas={tareas} />;
}

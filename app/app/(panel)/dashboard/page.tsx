import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTareas } from "../../lib/tareas-server";
import Dashboard from "../../components/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.access_token) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";
  const tareas = await getTareas(session.access_token, userId);

  return <Dashboard tareas={tareas} />;
}

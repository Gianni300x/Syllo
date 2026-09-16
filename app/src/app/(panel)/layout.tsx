import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getNombresCursos } from "@/features/tareas/services/tareas-server";
import { getCursosArchivados } from "@/features/archivados/services/archivados-server";
import { getCursosRenombrados } from "@/features/archivados/services/renombrados-server";
import PanelShell from "@/features/dashboard/components/PanelShell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.access_token || session.error) {
    redirect("/");
  }

  // Estado del sidebar (expandido/colapsado) persistido por el propio
  // componente de shadcn en esta cookie. Se lee acá para que el primer
  // render del servidor ya arranque en el estado correcto, sin parpadeo.
  const cookieStore = await cookies();
  const sidebarAbierto = cookieStore.get("sidebar_state")?.value !== "false";

  const userId = session.user?.email ?? "anon";
  const [cursos, archivados, renombres] = await Promise.all([
    getNombresCursos(session.access_token, userId),
    getCursosArchivados(userId),
    getCursosRenombrados(userId),
  ]);
  // Un archivado cuyo curso ya no existe en Classroom (renombrado o cerrado)
  // no tiene nada que ocultar: se ignora.
  const cursosArchivados = archivados.filter((a) => cursos.includes(a));

  const usuario = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
  };

  return (
    <PanelShell
      cursos={cursos}
      cursosArchivados={cursosArchivados}
      renombres={renombres}
      usuario={usuario}
      sidebarAbierto={sidebarAbierto}
      onCerrarSesion={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      {children}
    </PanelShell>
  );
}

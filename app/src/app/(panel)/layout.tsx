import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getNombresCursos } from "../lib/tareas-server";
import { getCursosArchivados } from "../lib/archivados-server";
import { getCursosRenombrados } from "../lib/renombrados-server";
import PanelShell from "./PanelShell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.access_token || session.error) {
    redirect("/");
  }

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
      onCerrarSesion={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      {children}
    </PanelShell>
  );
}

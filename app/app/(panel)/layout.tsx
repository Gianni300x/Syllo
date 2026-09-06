import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getNombresCursos } from "../lib/tareas-server";
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
  const cursos = await getNombresCursos(session.access_token, userId);

  const usuario = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
  };

  return (
    <PanelShell
      cursos={cursos}
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

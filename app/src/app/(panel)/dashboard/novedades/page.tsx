import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import Novedades from "@/features/novedades/components/novedades";
import {
  eventosCvgComoNovedades,
  getAnunciosSeguros,
} from "@/features/novedades/services/novedades-server";
import { getEstadoCalendarioCvg } from "@/features/cvg/services/cvg-server";

export default async function NovedadesPage() {
  const session = await auth();
  if (!session?.access_token || session.error) redirect("/");

  const userId = session.user?.email ?? "anon";
  const [classroom, estadoCvg] = await Promise.all([
    getAnunciosSeguros(session.access_token, userId),
    getEstadoCalendarioCvg(userId),
  ]);

  return (
    <Novedades
      anuncios={classroom.anuncios}
      eventosCvg={eventosCvgComoNovedades(estadoCvg.eventos)}
      estadoCvg={estadoCvg}
      permisoClassroom={classroom.permisoFaltante}
      errorClassroom={classroom.error}
      reconectarAction={async () => {
        "use server";
        await signIn("google", { redirectTo: "/dashboard/novedades" });
      }}
    />
  );
}

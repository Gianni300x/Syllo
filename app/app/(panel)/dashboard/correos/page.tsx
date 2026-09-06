import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signIn } from "@/auth";
import { getCorreosInicial } from "@/app/lib/correos-server";
import { getNombresCursos } from "@/app/lib/tareas-server";
import Correos from "@/app/components/correos";

export default async function CorreosPage() {
  const session = await auth();

  if (!session?.access_token || session.error) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";
  const bandeja = await cargarBandeja(session.access_token, userId);

  if (!bandeja) return <PermisoFaltante />;

  return (
    <Correos cursos={bandeja.cursos} paginaInicial={bandeja.paginaInicial} />
  );
}

async function cargarBandeja(accessToken: string, userId: string) {
  try {
    const cursos = await getNombresCursos(accessToken, userId);
    const paginaInicial = await getCorreosInicial(accessToken, userId, cursos);
    return { cursos, paginaInicial };
  } catch (error) {
    console.error("Error al cargar la bandeja de Classroom:", error);
    return null;
  }
}

/**
 * Las sesiones abiertas antes de sumar el scope de Gmail no tienen permiso para
 * leer el correo: hay que volver a pasar por el consentimiento de Google.
 */
function PermisoFaltante() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8 font-[family-name:var(--font-poppins)]">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-slate-900">
          Falta el permiso de Gmail
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Para mostrarte los correos de Classroom y CVG, Syllo necesita permiso
          de solo lectura sobre tu Gmail. Volvé a iniciar sesión para otorgarlo.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard/correos" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Reconectar con Google
          </button>
        </form>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-700"
        >
          Volver a mis tareas
        </Link>
      </div>
    </div>
  );
}

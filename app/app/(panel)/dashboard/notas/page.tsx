import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotas } from "@/app/lib/notas-server";
import type { Nota } from "@/app/lib/notas";
import Notas from "@/app/components/notas";
import { crearNota, editarNota, eliminarNota } from "./actions";

export default async function NotasPage() {
  const session = await auth();

  if (!session?.access_token || session.error) {
    redirect("/");
  }

  const userId = session.user?.email ?? "anon";

  let notas: Nota[];
  try {
    notas = await getNotas(userId);
  } catch (error) {
    console.error("Error al cargar las notas:", error);
    return <BaseNoDisponible />;
  }

  return (
    <Notas
      notas={notas}
      crearNota={crearNota}
      editarNota={editarNota}
      eliminarNota={eliminarNota}
    />
  );
}

/** Fallback si la base no está configurada o no responde. */
function BaseNoDisponible() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Notas
        </h1>
      </div>
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        No pudimos conectar con la base de datos de las notas. Probá de nuevo en
        un rato.
      </div>
    </main>
  );
}

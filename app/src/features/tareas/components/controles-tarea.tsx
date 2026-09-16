"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleDashed, CirclePlay, Pin } from "lucide-react";
import type { Tarea } from "@/features/tareas/services/classroom";
import { useFiltroCursos } from "@/app/(panel)/filtro-cursos";
import {
  alternarEstadoTarea,
  type CampoEstado,
} from "@/features/tareas/services/estados-actions";

/**
 * Los dos controles de estado propio de una tarea: "ya la empecé" y "fijar".
 *
 * Va como hermano del link a Classroom, nunca adentro: un control interactivo
 * anidado dentro de otro no es navegable con teclado (mismo criterio que
 * `curso-item.tsx`). Por eso la tarjeta usa un link estirado con `after:` y
 * estos botones se apoyan arriba con `z-10`.
 *
 * El estado optimista vive acá adentro, en la tarea: el ícono cambia al
 * instante y la lista se reordena cuando vuelve el `router.refresh()`. Así la
 * tarjeta no se escapa de abajo del mouse en el mismo clic.
 */
/** Mismo criterio que `MENSAJES_ERROR` en `notas.tsx`: el código nunca se ve. */
const MENSAJES_ERROR: Record<string, string> = {
  no_autenticado: "Se cerró tu sesión. Volvé a entrar.",
  clave_invalida: "No pudimos identificar esa tarea.",
  error_db: "No pudimos guardarlo. Probá de nuevo.",
};

export default function ControlesTarea({ tarea }: { tarea: Tarea }) {
  const router = useRouter();
  const { avisar } = useFiltroCursos();
  const [pendiente, startTransition] = useTransition();
  const [estado, aplicarOptimista] = useOptimistic(
    { empezada: Boolean(tarea.empezada), fijada: Boolean(tarea.fijada) },
    (previo, cambio: Partial<Record<CampoEstado, boolean>>) => ({
      ...previo,
      ...cambio,
    }),
  );

  // Los eventos personales y las tareas sin ids no tienen dónde colgar estado.
  if (!tarea.courseId || !tarea.courseWorkId) return null;

  const { courseId, courseWorkId } = tarea;

  function alternar(campo: CampoEstado) {
    const valor = !estado[campo];
    startTransition(async () => {
      aplicarOptimista({ [campo]: valor });
      const resultado = await alternarEstadoTarea(
        courseId,
        courseWorkId,
        campo,
        valor,
      );
      // Sin esto, si el servidor falla el ícono vuelve solo a su estado
      // anterior y el usuario no se entera de por qué.
      if (resultado.error) {
        avisar(
          MENSAJES_ERROR[resultado.error] ?? "Algo salió mal. Probá de nuevo.",
        );
      }
      router.refresh();
    });
  }

  // Si algo está marcado el control queda a la vista, para que se entienda por
  // qué esa tarjeta está arriba de todo o dice "Empezada". Si no, aparece con
  // el hover — pero solo en `sm+`: en mobile no hay hover, así que van fijos.
  const algoMarcado = estado.empezada || estado.fijada;
  const visibilidad = algoMarcado
    ? ""
    : "sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

  return (
    <div
      className={`relative z-10 flex shrink-0 items-center gap-0.5 ${visibilidad}`}
    >
      <Boton
        activo={estado.empezada}
        pendiente={pendiente}
        onClick={() => alternar("empezada")}
        etiqueta={
          estado.empezada ? "Marcar como no empezada" : "Marcar que ya la empecé"
        }
        colorActivo="text-indigo-600 dark:text-indigo-400"
      >
        {estado.empezada ? <CirclePlay size={15} /> : <CircleDashed size={15} />}
      </Boton>

      <Boton
        activo={estado.fijada}
        pendiente={pendiente}
        onClick={() => alternar("fijada")}
        etiqueta={estado.fijada ? "Dejar de fijar" : "Fijar arriba de todo"}
        colorActivo="text-amber-500 dark:text-amber-400"
      >
        <Pin size={15} className={estado.fijada ? "fill-current" : undefined} />
      </Boton>
    </div>
  );
}

function Boton({
  activo,
  pendiente,
  onClick,
  etiqueta,
  colorActivo,
  children,
}: {
  activo: boolean;
  pendiente: boolean;
  onClick: () => void;
  etiqueta: string;
  colorActivo: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pendiente}
      aria-pressed={activo}
      title={etiqueta}
      aria-label={etiqueta}
      className={`rounded-md p-1 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 dark:hover:bg-slate-700 ${
        activo ? colorActivo : "text-slate-400 dark:text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/** Cuánto queda en pantalla antes de irse solo. */
const DURACION_MS = 6000;

/**
 * Aviso de que algo salió mal, montado una sola vez en el panel.
 *
 * Existe porque las acciones optimistas (archivar o renombrar un curso, marcar
 * una tarea) mostraban el cambio y después lo revertían en silencio cuando el
 * servidor fallaba: el usuario veía algo deshacerse solo sin ninguna
 * explicación. Las notas y los modales de evento ya mostraban sus errores en
 * su propio formulario; esto cubre las acciones que no tienen dónde hacerlo.
 *
 * No es una librería de toasts: es un solo mensaje a la vez, que es todo lo que
 * esta app necesita.
 */
export default function Aviso({
  mensaje,
  onCerrar,
}: {
  mensaje: string | null;
  onCerrar: () => void;
}) {
  useEffect(() => {
    if (!mensaje) return;
    const id = setTimeout(onCerrar, DURACION_MS);
    return () => clearTimeout(id);
  }, [mensaje, onCerrar]);

  return (
    <AnimatePresence>
      {mensaje && (
        <motion.div
          // `status` + `polite` lo anuncia el lector de pantalla sin interrumpir
          // lo que el usuario esté haciendo.
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-sm items-start gap-2.5 rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-lg dark:border-amber-500/40 dark:bg-slate-800"
        >
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">
            {mensaje}
          </p>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar aviso"
            className="-mr-1 shrink-0 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

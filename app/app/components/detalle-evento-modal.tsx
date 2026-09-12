"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";
import { editarEventoAction, eliminarEventoAction } from "../(panel)/dashboard/calendario/eventos-actions";
import { motion, AnimatePresence } from "motion/react";
import type { Tarea } from "../lib/classroom";

/** `YYYY-MM-DD` para prellenar el input `type="date"`. */
function fechaInput(vencimiento: Tarea["vencimiento"]): string {
  if (!vencimiento) return "";
  const mes = String(vencimiento.month).padStart(2, "0");
  const dia = String(vencimiento.day).padStart(2, "0");
  return `${vencimiento.year}-${mes}-${dia}`;
}

export default function DetalleEventoModal({
  evento,
  onCerrar,
}: {
  evento: Tarea | null;
  onCerrar: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!evento?.eventoId) return;
    setIsLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await editarEventoAction(evento.eventoId, form);
      router.refresh();
      onCerrar();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el evento");
    } finally {
      setIsLoading(false);
    }
  }

  async function onEliminar() {
    if (!evento?.eventoId) return;
    setIsLoading(true);
    try {
      await eliminarEventoAction(evento.eventoId);
      router.refresh();
      onCerrar();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el evento");
    } finally {
      setIsLoading(false);
    }
  }

  function cerrar() {
    setConfirmandoEliminar(false);
    onCerrar();
  }

  return (
    <AnimatePresence>
      {evento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={cerrar}
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Editar evento
              </h2>
              <button
                type="button"
                onClick={cerrar}
                title="Cerrar"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form key={evento.eventoId} onSubmit={onSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="flex flex-col gap-5 px-6 py-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="titulo" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Título del evento
                  </label>
                  <input
                    id="titulo"
                    name="titulo"
                    type="text"
                    required
                    defaultValue={evento.titulo}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label htmlFor="fecha" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Fecha
                    </label>
                    <input
                      id="fecha"
                      name="fecha"
                      type="date"
                      required
                      defaultValue={fechaInput(evento.vencimiento)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label htmlFor="curso" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Categoría / Curso
                    </label>
                    <input
                      id="curso"
                      name="curso"
                      type="text"
                      defaultValue={evento.curso}
                      placeholder="Personal, Trabajo..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="descripcion" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows={4}
                    defaultValue={evento.descripcion}
                    placeholder="Detalles adicionales sobre el evento..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 mt-auto">
                {confirmandoEliminar ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">¿Eliminar?</span>
                    <button
                      type="button"
                      onClick={onEliminar}
                      disabled={isLoading}
                      className="rounded-md px-1.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
                    >
                      {isLoading ? <Loader2 size={13} className="animate-spin" /> : "Sí"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoEliminar(false)}
                      className="rounded-md px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoEliminar(true)}
                    title="Eliminar evento"
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cerrar}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

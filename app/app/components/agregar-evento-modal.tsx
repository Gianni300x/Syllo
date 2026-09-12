"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { crearEventoAction } from "../(panel)/dashboard/calendario/eventos-actions";
import { motion, AnimatePresence } from "motion/react";

export default function AgregarEventoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await crearEventoAction(form);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al agregar evento");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
      >
        <Plus size={15} />
        Evento
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
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
                  Nuevo Evento
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Cerrar"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-y-auto">
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                      placeholder="Ej. Examen final de Matemáticas"
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                        placeholder="Personal, Trabajo..."
                        defaultValue="Personal"
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
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                      placeholder="Detalles adicionales sobre el evento..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
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
                    {isLoading ? "Guardando..." : "Guardar evento"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

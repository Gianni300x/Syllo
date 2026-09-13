"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Archive, ArchiveRestore, Edit2, MoreVertical, Check, X } from "lucide-react";
import { colorParaCurso, bgParaCurso } from "./sidebar";
import { useFiltroCursos } from "../(panel)/filtro-cursos";

/**
 * Fila de curso del sidebar: alterna la selección y abre el menú de
 * renombrar/archivar.
 *
 * La fila y el menú de "…" son dos `<button>` hermanos, no uno adentro del
 * otro: un control interactivo anidado dentro de otro no es navegable con
 * teclado ni anunciable por un lector de pantalla.
 */
export function CursoItem({
  nombre,
  listaCursos,
  seleccionado,
  esArchivado,
}: {
  nombre: string;
  listaCursos: string[];
  seleccionado: boolean;
  esArchivado: boolean;
}) {
  const {
    toggleCurso,
    conteoPorCurso,
    archivarCursos,
    restaurarCursos,
    renombres,
    renombrarCurso,
    renombrando,
    archivando,
  } = useFiltroCursos();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(renombres[nombre] || nombre);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const nombreMostrar = renombres[nombre] || nombre;
  const conteo = conteoPorCurso[nombre] ?? 0;

  // El listener global solo existe mientras el menú está abierto; antes había
  // uno por curso permanentemente montado.
  useEffect(() => {
    if (!menuAbierto) return;

    function alClicFuera(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setMenuAbierto(false);
      }
    }
    function alTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuAbierto(false);
    }

    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alTecla);
    };
  }, [menuAbierto]);

  function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (nuevoNombre.trim() !== (renombres[nombre] || nombre)) {
      renombrarCurso(nombre, nuevoNombre);
    }
    setEditando(false);
  }

  const casilla = (
    <span
      aria-hidden
      className={`flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
        seleccionado
          ? `${bgParaCurso(nombre, listaCursos)} border-transparent`
          : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700"
      }`}
    >
      {seleccionado && (
        <svg
          className="w-2 h-2 text-white"
          viewBox="0 0 12 12"
          fill="none"
          strokeWidth="2.5"
          stroke="currentColor"
        >
          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      ref={contenedorRef}
      className={`relative group flex items-center rounded-lg text-sm transition-colors ${
        menuAbierto ? "z-50" : "z-0"
      } ${esArchivado ? "opacity-75 hover:opacity-100 " : ""}${
        seleccionado
          ? "bg-indigo-50 dark:bg-indigo-500/15"
          : "hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      {editando ? (
        <form
          onSubmit={guardarNombre}
          className="flex flex-1 items-center gap-2 min-w-0 px-3 py-2"
        >
          {casilla}
          <input
            autoFocus
            type="text"
            aria-label={`Nuevo nombre para ${nombre}`}
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditando(false);
            }}
            className="flex-1 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 w-full min-w-0 dark:bg-slate-800 dark:text-white dark:border-indigo-500"
          />
          <button
            type="submit"
            disabled={renombrando}
            title="Guardar nombre"
            aria-label="Guardar nombre"
            className="text-green-600 hover:text-green-700 dark:text-green-400 p-0.5 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            title="Cancelar"
            aria-label="Cancelar"
            className="text-red-500 hover:text-red-600 dark:text-red-400 p-0.5 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X size={14} />
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => toggleCurso(nombre)}
            aria-pressed={seleccionado}
            title={nombreMostrar}
            className={`flex flex-1 items-center gap-2 min-w-0 px-3 py-2 text-left rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              seleccionado
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {casilla}
            <span className={`truncate ${colorParaCurso(nombre, listaCursos)}`}>
              {nombreMostrar}
            </span>
          </button>

          <div className="flex items-center shrink-0 pr-2">
            {conteo > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 mr-1 ${
                  seleccionado
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {conteo}
              </span>
            )}

            <button
              type="button"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              aria-label={`Opciones de ${nombreMostrar}`}
              className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-600 dark:hover:text-slate-200 ${
                menuAbierto ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </>
      )}

      {menuAbierto && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 dark:bg-slate-800 dark:border-slate-700"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setNuevoNombre(renombres[nombre] || nombre);
              setEditando(true);
              setMenuAbierto(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"
          >
            <Edit2 size={12} /> Renombrar
          </button>

          {esArchivado ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                restaurarCursos([nombre]);
                setMenuAbierto(false);
              }}
              disabled={archivando}
              className="w-full text-left px-3 py-1.5 text-xs text-indigo-600 hover:bg-slate-100 flex items-center gap-2 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:bg-slate-100 dark:text-indigo-400 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"
            >
              <ArchiveRestore size={12} /> Desarchivar
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                archivarCursos([nombre]);
                setMenuAbierto(false);
              }}
              disabled={archivando}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-2 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"
            >
              <Archive size={12} /> Archivar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

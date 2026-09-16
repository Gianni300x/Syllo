"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Archive, ArchiveRestore, Edit2, MoreVertical, Check, X } from "lucide-react";
import { colorParaCurso, bgParaCurso } from "@/lib/cursos-color";
import { useFiltroCursos } from "@/features/dashboard/hooks/filtro-cursos";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

  const nombreMostrar = renombres[nombre] || nombre;
  const conteo = conteoPorCurso[nombre] ?? 0;

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
          <Input
            autoFocus
            type="text"
            aria-label={`Nuevo nombre para ${nombre}`}
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditando(false);
            }}
            className="h-6 flex-1 min-w-0 px-1.5 py-0.5 text-xs border-indigo-300 dark:border-indigo-500"
          />
          <Button
            type="submit"
            disabled={renombrando}
            variant="ghost"
            size="icon-xs"
            title="Guardar nombre"
            aria-label="Guardar nombre"
            className="text-green-600 hover:text-green-700 dark:text-green-400"
          >
            <Check size={14} />
          </Button>
          <Button
            type="button"
            onClick={() => setEditando(false)}
            variant="ghost"
            size="icon-xs"
            title="Cancelar"
            aria-label="Cancelar"
            className="text-red-500 hover:text-red-600 dark:text-red-400"
          >
            <X size={14} />
          </Button>
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
              <Badge
                variant="secondary"
                className={`mr-1 rounded-full ${
                  seleccionado
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {conteo}
              </Badge>
            )}

            <DropdownMenu open={menuAbierto} onOpenChange={setMenuAbierto}>
              <DropdownMenuTrigger
                aria-label={`Opciones de ${nombreMostrar}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-xs" }),
                  "text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 dark:hover:text-slate-200",
                  // En mobile no hay hover: sin el prefijo `sm:` el menú era
                  // inalcanzable y archivar o renombrar un curso no existía desde
                  // el celular. Mismo patrón que `controles-tarea.tsx`.
                  menuAbierto
                    ? "opacity-100"
                    : "sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
                )}
              >
                <MoreVertical size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    setNuevoNombre(renombres[nombre] || nombre);
                    setEditando(true);
                  }}
                >
                  <Edit2 size={12} /> Renombrar
                </DropdownMenuItem>

                {esArchivado ? (
                  <DropdownMenuItem
                    onClick={() => restaurarCursos([nombre])}
                    disabled={archivando}
                    className="text-indigo-600 dark:text-indigo-400"
                  >
                    <ArchiveRestore size={12} /> Desarchivar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => archivarCursos([nombre])}
                    disabled={archivando}
                  >
                    <Archive size={12} /> Archivar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Archive, ArchiveRestore, Edit2, MoreVertical, Check, X } from "lucide-react";
import { colorParaCurso, bgParaCurso } from "@/lib/cursos-color";
import { useFiltroCursos } from "@/features/dashboard/hooks/filtro-cursos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
      className={`flex-shrink-0 w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${
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

  if (editando) {
    return (
      <motion.li
        layout="position"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="group/menu-item relative"
      >
        <form
          onSubmit={guardarNombre}
          className="flex flex-1 items-center gap-2 min-w-0 px-2 py-1.5"
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
      </motion.li>
    );
  }

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className={`group/menu-item relative ${esArchivado ? "opacity-75 hover:opacity-100" : ""}`}
    >
      <SidebarMenuButton
        onClick={() => toggleCurso(nombre)}
        isActive={seleccionado}
        tooltip={nombreMostrar}
        className="h-auto py-2.5 text-base"
      >
        {casilla}
        <span className={colorParaCurso(nombre, listaCursos)}>{nombreMostrar}</span>
      </SidebarMenuButton>

      {conteo > 0 && <SidebarMenuBadge className="right-8">{conteo}</SidebarMenuBadge>}

      <DropdownMenu open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SidebarMenuAction
          render={<DropdownMenuTrigger aria-label={`Opciones de ${nombreMostrar}`} />}
          showOnHover
        >
          <MoreVertical size={14} />
        </SidebarMenuAction>
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
            <DropdownMenuItem onClick={() => archivarCursos([nombre])} disabled={archivando}>
              <Archive size={12} /> Archivar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.li>
  );
}

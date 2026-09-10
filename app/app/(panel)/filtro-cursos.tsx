"use client";

import { createContext, useContext } from "react";

/**
 * Estado del filtro de cursos, compartido entre Tareas y Correos: vive en el
 * layout (`<PanelShell>`), así no se pierde ni se re-crea al navegar entre las
 * dos secciones. Cada página publica además su propio conteo por curso
 * (pendientes en Tareas, no leídos en Correos).
 *
 * También expone los cursos archivados (persistidos en DB) y las acciones para
 * archivar/restaurar, que disparan una server action y un refresh.
 */
export interface FiltroCursosValue {
  cursosSeleccionados: string[];
  toggleCurso: (curso: string) => void;
  limpiarCursos: () => void;
  conteoPorCurso: Record<string, number>;
  setConteoPorCurso: (conteo: Record<string, number>) => void;
  cursosArchivados: string[];
  archivarCursos: (cursos: string[]) => void;
  restaurarCursos: (cursos: string[]) => void;
  archivando: boolean;
}

export const FiltroCursosContext = createContext<FiltroCursosValue | null>(null);

export function useFiltroCursos(): FiltroCursosValue {
  const ctx = useContext(FiltroCursosContext);
  if (!ctx) {
    throw new Error("useFiltroCursos debe usarse dentro de <PanelShell>");
  }
  return ctx;
}

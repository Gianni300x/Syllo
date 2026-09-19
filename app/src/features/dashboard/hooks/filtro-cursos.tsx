"use client";

import { createContext, useContext } from "react";

/**
 * Estado del filtro de cursos, compartido por todas las secciones: vive en el
 * layout (`<PanelShell>`), así no se pierde ni se re-crea al navegar entre las
 * dos secciones. Cada página publica además su propio conteo por curso
 * (pendientes en Tareas y novedades por materia).
 *
 * También expone los cursos archivados (persistidos en DB) y las acciones para
 * archivar/restaurar, que disparan una server action y un refresh.
 */
export interface FiltroCursosValue {
  /** Todos los cursos activos del usuario, tal como los devuelve Classroom. */
  cursos: string[];
  cursosSeleccionados: string[];
  toggleCurso: (curso: string) => void;
  limpiarCursos: () => void;
  conteoPorCurso: Record<string, number>;
  setConteoPorCurso: (conteo: Record<string, number>) => void;
  cursosArchivados: string[];
  archivarCursos: (cursos: string[]) => void;
  restaurarCursos: (cursos: string[]) => void;
  archivando: boolean;
  renombres: Record<string, string>;
  renombrarCurso: (original: string, nuevo: string) => void;
  renombrando: boolean;
  /**
   * Muestra un aviso al usuario. Lo usan las acciones optimistas para no
   * revertir un cambio en silencio cuando el servidor falla.
   */
  avisar: (mensaje: string) => void;
  /**
   * Una ruta del panel con el filtro de cursos actual pegado. Los links del
   * sidebar la usan para no perder el filtro al cambiar de sección.
   */
  hrefConFiltro: (ruta: string) => string;
}

export const FiltroCursosContext = createContext<FiltroCursosValue | null>(null);

export function useFiltroCursos(): FiltroCursosValue {
  const ctx = useContext(FiltroCursosContext);
  if (!ctx) {
    throw new Error("useFiltroCursos debe usarse dentro de <PanelShell>");
  }
  return ctx;
}

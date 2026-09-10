"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { type UsuarioSidebar } from "../components/sidebar";
import { FiltroCursosContext, type FiltroCursosValue } from "./filtro-cursos";
import { actualizarDatos } from "./actions";
import {
  archivarCursos as archivarCursosAction,
  restaurarCursos as restaurarCursosAction,
} from "./archivados-actions";
import ThemeToggle from "./theme-toggle";

export default function PanelShell({
  cursos,
  cursosArchivados,
  usuario,
  onCerrarSesion,
  children,
}: {
  cursos: string[];
  cursosArchivados: string[];
  usuario?: UsuarioSidebar;
  onCerrarSesion?: () => void;
  children: React.ReactNode;
}) {
  const [cursosSeleccionados, setCursosSeleccionados] = useState<string[]>([]);
  const [conteoPorCurso, setConteoPorCurso] = useState<Record<string, number>>({});
  const [actualizando, startActualizar] = useTransition();
  const [archivando, startArchivar] = useTransition();
  const router = useRouter();

  const toggleCurso = useCallback((curso: string) => {
    setCursosSeleccionados((prev) =>
      prev.includes(curso) ? prev.filter((c) => c !== curso) : [...prev, curso],
    );
  }, []);

  const limpiarCursos = useCallback(() => setCursosSeleccionados([]), []);

  const archivarCursos = useCallback(
    (lista: string[]) => {
      if (lista.length === 0) return;
      // Un curso archivado ya no está en el sidebar: sacarlo del filtro.
      setCursosSeleccionados((prev) => prev.filter((c) => !lista.includes(c)));
      startArchivar(async () => {
        const resultado = await archivarCursosAction(lista);
        if (resultado.error) console.error("No se pudo archivar:", resultado.error);
        router.refresh();
      });
    },
    [router],
  );

  const restaurarCursos = useCallback(
    (lista: string[]) => {
      if (lista.length === 0) return;
      startArchivar(async () => {
        const resultado = await restaurarCursosAction(lista);
        if (resultado.error) console.error("No se pudo restaurar:", resultado.error);
        router.refresh();
      });
    },
    [router],
  );

  const value = useMemo<FiltroCursosValue>(
    () => ({
      cursosSeleccionados,
      toggleCurso,
      limpiarCursos,
      conteoPorCurso,
      setConteoPorCurso,
      cursosArchivados,
      archivarCursos,
      restaurarCursos,
      archivando,
    }),
    [
      cursosSeleccionados,
      toggleCurso,
      limpiarCursos,
      conteoPorCurso,
      cursosArchivados,
      archivarCursos,
      restaurarCursos,
      archivando,
    ],
  );

  function actualizar() {
    startActualizar(async () => {
      await actualizarDatos();
      router.refresh();
    });
  }

  return (
    <FiltroCursosContext.Provider value={value}>
      <div className="flex min-h-screen bg-background text-foreground font-[family-name:var(--font-poppins)]">
        <Sidebar
          cursos={cursos}
          usuario={usuario}
          onCerrarSesion={onCerrarSesion}
          onActualizar={actualizar}
          actualizando={actualizando}
        />
        <div className="flex-1 min-w-0">{children}</div>
        <ThemeToggle />
      </div>
    </FiltroCursosContext.Provider>
  );
}

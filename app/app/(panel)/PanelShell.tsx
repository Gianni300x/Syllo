"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { type UsuarioSidebar } from "../components/sidebar";
import { FiltroCursosContext, type FiltroCursosValue } from "./filtro-cursos";
import { actualizarDatos } from "./actions";

export default function PanelShell({
  cursos,
  usuario,
  onCerrarSesion,
  children,
}: {
  cursos: string[];
  usuario?: UsuarioSidebar;
  onCerrarSesion?: () => void;
  children: React.ReactNode;
}) {
  const [cursosSeleccionados, setCursosSeleccionados] = useState<string[]>([]);
  const [conteoPorCurso, setConteoPorCurso] = useState<Record<string, number>>({});
  const [actualizando, startActualizar] = useTransition();
  const router = useRouter();

  const toggleCurso = useCallback((curso: string) => {
    setCursosSeleccionados((prev) =>
      prev.includes(curso) ? prev.filter((c) => c !== curso) : [...prev, curso],
    );
  }, []);

  const limpiarCursos = useCallback(() => setCursosSeleccionados([]), []);

  const value = useMemo<FiltroCursosValue>(
    () => ({
      cursosSeleccionados,
      toggleCurso,
      limpiarCursos,
      conteoPorCurso,
      setConteoPorCurso,
    }),
    [cursosSeleccionados, toggleCurso, limpiarCursos, conteoPorCurso],
  );

  function actualizar() {
    startActualizar(async () => {
      await actualizarDatos();
      router.refresh();
    });
  }

  return (
    <FiltroCursosContext.Provider value={value}>
      <div className="flex min-h-screen bg-slate-100 text-slate-800 font-[family-name:var(--font-poppins)]">
        <Sidebar
          cursos={cursos}
          usuario={usuario}
          onCerrarSesion={onCerrarSesion}
          onActualizar={actualizar}
          actualizando={actualizando}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </FiltroCursosContext.Provider>
  );
}

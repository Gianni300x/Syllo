"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar, { type UsuarioSidebar } from "../components/sidebar";
import { FiltroCursosContext, type FiltroCursosValue } from "./filtro-cursos";
import { actualizarDatos } from "./actions";
import {
  archivarCursos as archivarCursosAction,
  restaurarCursos as restaurarCursosAction,
} from "./archivados-actions";
import { renombrarCursoAction } from "./renombrados-actions";
import ThemeToggle from "./theme-toggle";

/** Nombre de la sección actual, para la barra superior de mobile. */
function tituloSeccion(pathname: string | null): string {
  if (pathname?.startsWith("/dashboard/tareas")) return "Tareas";
  if (pathname?.startsWith("/dashboard/correos")) return "Correos";
  if (pathname?.startsWith("/dashboard/notas")) return "Notas";
  if (pathname?.startsWith("/dashboard/calendario")) return "Calendario";
  return "Syllo";
}

export default function PanelShell({
  cursos,
  cursosArchivados,
  renombres,
  usuario,
  onCerrarSesion,
  children,
}: {
  cursos: string[];
  cursosArchivados: string[];
  renombres: Record<string, string>;
  usuario?: UsuarioSidebar;
  onCerrarSesion?: () => void;
  children: React.ReactNode;
}) {
  const [cursosSeleccionados, setCursosSeleccionados] = useState<string[]>([]);
  const [conteoPorCurso, setConteoPorCurso] = useState<Record<string, number>>({});
  const [renombresOptimistas, setRenombresOptimistas] = useState<Record<string, string>>({});
  const [actualizando, startActualizar] = useTransition();
  const [archivando, startArchivar] = useTransition();
  const [renombrando, startRenombrar] = useTransition();
  // Solo en mobile: en `lg+` el sidebar está siempre a la vista.
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const cerrarMenu = useCallback(() => setMenuAbierto(false), []);

  const renombresEfectivos = useMemo(() => ({
    ...renombres,
    ...renombresOptimistas,
  }), [renombres, renombresOptimistas]);

  const toggleCurso = useCallback((curso: string) => {
    setCursosSeleccionados((prev) =>
      prev.includes(curso) ? prev.filter((c) => c !== curso) : [...prev, curso],
    );
  }, []);

  const limpiarCursos = useCallback(() => setCursosSeleccionados([]), []);

  const archivarCursos = useCallback(
    (lista: string[]) => {
      if (lista.length === 0) return;
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

  const renombrarCurso = useCallback(
    (original: string, nuevo: string) => {
      setRenombresOptimistas((prev) => ({ ...prev, [original]: nuevo }));
      startRenombrar(async () => {
        const result = await renombrarCursoAction(original, nuevo);
        if (result.error) console.error("Error renombrando:", result.error);
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
      renombres: renombresEfectivos,
      renombrarCurso,
      renombrando,
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
      renombresEfectivos,
      renombrarCurso,
      renombrando,
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
          abierto={menuAbierto}
          onCerrarMenu={cerrarMenu}
        />
        <div className="flex-1 min-w-0">
          {/* Barra superior de mobile: es el único acceso al menú cuando el
              sidebar está fuera de pantalla. */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-[#4F46E5]">{tituloSeccion(pathname)}</span>
            <ThemeToggle variante="barra" className="ml-auto" />
          </div>
          {children}
        </div>
        {/* En mobile el toggle vive en la barra de arriba (ver más abajo). */}
        <ThemeToggle variante="flotante" className="hidden lg:flex" />
      </div>
    </FiltroCursosContext.Provider>
  );
}

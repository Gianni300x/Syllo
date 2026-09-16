"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Sidebar, { type UsuarioSidebar } from "./sidebar";
import { FiltroCursosContext, type FiltroCursosValue } from "../hooks/filtro-cursos";
import { actualizarDatos } from "../services/actions";
import {
  archivarCursos as archivarCursosAction,
  restaurarCursos as restaurarCursosAction,
} from "@/features/archivados/services/archivados-actions";
import { renombrarCursoAction } from "@/features/archivados/services/renombrados-actions";
import ThemeToggle from "./theme-toggle";
import Aviso from "@/components/ui/aviso";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  sidebarAbierto,
  onCerrarSesion,
  children,
}: {
  cursos: string[];
  cursosArchivados: string[];
  renombres: Record<string, string>;
  usuario?: UsuarioSidebar;
  /** Estado inicial del sidebar (cookie `sidebar_state`), para que el primer render no parpadee. */
  sidebarAbierto: boolean;
  onCerrarSesion?: () => void;
  children: React.ReactNode;
}) {
  const [conteoPorCurso, setConteoPorCurso] = useState<Record<string, number>>({});
  const [renombresOptimistas, setRenombresOptimistas] = useState<Record<string, string>>({});
  const [actualizando, startActualizar] = useTransition();
  const [archivando, startArchivar] = useTransition();
  const [renombrando, startRenombrar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * El filtro de cursos vive en la URL (`?curso=A&curso=B`), no en estado de
   * React: así sobrevive a recargar, se puede compartir un link filtrado y el
   * botón "atrás" deshace un curso por vez.
   */
  const cursosSeleccionados = useMemo(
    () => searchParams.getAll("curso"),
    [searchParams],
  );

  /**
   * Reescribe los `curso` de la URL.
   *
   * Va por `history.pushState` y no por `router.push`: Next sincroniza
   * `useSearchParams` con la API nativa sin volver a pedirle la página al
   * servidor. El filtro es puramente de cliente —las tareas ya están todas
   * cargadas—, así que un pedido por clic sería puro desperdicio.
   *
   * Lee de `window.location` en vez de la closure para no trabajar nunca sobre
   * un valor viejo.
   */
  const escribirCursos = useCallback(
    (cursos: string[], modo: "push" | "replace" = "push") => {
      const params = new URLSearchParams(window.location.search);
      params.delete("curso");
      for (const curso of cursos) params.append("curso", curso);
      const query = params.toString();
      const url = query ? `?${query}` : window.location.pathname;
      if (modo === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [],
  );

  const cursosDeLaUrl = () =>
    new URLSearchParams(window.location.search).getAll("curso");

  /** Una ruta del panel con el filtro actual pegado, para los links del sidebar. */
  const hrefConFiltro = useCallback(
    (ruta: string) => {
      if (cursosSeleccionados.length === 0) return ruta;
      const params = new URLSearchParams();
      for (const curso of cursosSeleccionados) params.append("curso", curso);
      return `${ruta}?${params.toString()}`;
    },
    [cursosSeleccionados],
  );

  const avisar = useCallback((mensaje: string) => setAviso(mensaje), []);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  const renombresEfectivos = useMemo(() => ({
    ...renombres,
    ...renombresOptimistas,
  }), [renombres, renombresOptimistas]);

  const toggleCurso = useCallback(
    (curso: string) => {
      const actuales = cursosDeLaUrl();
      escribirCursos(
        actuales.includes(curso)
          ? actuales.filter((c) => c !== curso)
          : [...actuales, curso],
      );
    },
    [escribirCursos],
  );

  const limpiarCursos = useCallback(() => escribirCursos([]), [escribirCursos]);

  const archivarCursos = useCallback(
    (lista: string[]) => {
      if (lista.length === 0) return;
      // Un curso archivado no puede seguir filtrando la vista.
      const filtroPrevio = cursosDeLaUrl();
      escribirCursos(filtroPrevio.filter((c) => !lista.includes(c)));
      startArchivar(async () => {
        const resultado = await archivarCursosAction(lista);
        if (resultado.error) {
          console.error("No se pudo archivar:", resultado.error);
          avisar("No pudimos archivar el curso. Probá de nuevo.");
          // Si no se archivó, el filtro tiene que volver a como estaba.
          // `replace` para no dejar el intento fallido en el historial.
          escribirCursos(filtroPrevio, "replace");
        }
        router.refresh();
      });
    },
    [router, avisar, escribirCursos],
  );

  const restaurarCursos = useCallback(
    (lista: string[]) => {
      if (lista.length === 0) return;
      startArchivar(async () => {
        const resultado = await restaurarCursosAction(lista);
        if (resultado.error) {
          console.error("No se pudo restaurar:", resultado.error);
          avisar("No pudimos desarchivar el curso. Probá de nuevo.");
        }
        router.refresh();
      });
    },
    [router, avisar],
  );

  const renombrarCurso = useCallback(
    (original: string, nuevo: string) => {
      setRenombresOptimistas((prev) => ({ ...prev, [original]: nuevo }));
      startRenombrar(async () => {
        const result = await renombrarCursoAction(original, nuevo);
        if (result.error) {
          console.error("Error renombrando:", result.error);
          avisar("No pudimos guardar el nombre. Probá de nuevo.");
        }
        router.refresh();
      });
    },
    [router, avisar],
  );

  const value = useMemo<FiltroCursosValue>(
    () => ({
      cursos,
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
      avisar,
      hrefConFiltro,
    }),
    [
      cursos,
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
      avisar,
      hrefConFiltro,
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
      <SidebarProvider
        defaultOpen={sidebarAbierto}
        className="bg-background text-foreground font-[family-name:var(--font-poppins)]"
      >
        <Sidebar
          cursos={cursos}
          usuario={usuario}
          onCerrarSesion={onCerrarSesion}
          onActualizar={actualizar}
          actualizando={actualizando}
        />
        <SidebarInset className="min-w-0">
          {/* Barra superior de mobile: es el único acceso al menú cuando el
              sidebar está fuera de pantalla. */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700 dark:bg-slate-800">
            <SidebarTrigger className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100" />
            <span className="font-bold text-[#4F46E5]">{tituloSeccion(pathname)}</span>
            <ThemeToggle variante="barra" className="ml-auto" />
          </div>
          {children}
        </SidebarInset>
        {/* En mobile el toggle vive en la barra de arriba (ver más abajo). */}
        <ThemeToggle variante="flotante" className="hidden lg:flex" />
        <Aviso mensaje={aviso} onCerrar={cerrarAviso} />
      </SidebarProvider>
    </FiltroCursosContext.Provider>
  );
}

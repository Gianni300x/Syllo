"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BookOpen,
  CalendarDays,
  ListChecks,
  LogOut,
  Mail,
  NotebookPen,
  RefreshCw,
  Home,
  X
} from "lucide-react";
import { useFiltroCursos } from "../(panel)/filtro-cursos";
import { CursoItem } from "@/features/archivados/components/curso-item";
import { motion, AnimatePresence } from "motion/react";

const COLORES_CURSO = [
  "text-sky-600",
  "text-amber-600",
  "text-emerald-600",
  "text-rose-600",
  "text-cyan-600",
  "text-violet-600",
];

const COLORES_CURSO_BG = [
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-violet-500",
];

export function colorParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO[indice % COLORES_CURSO.length];
}

export function bgParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO_BG[indice % COLORES_CURSO_BG.length];
}

export type Seccion = "inicio" | "tareas" | "correos" | "notas" | "calendario";

/**
 * ¿Estamos en `lg+`? Hace falta en JS y no solo en CSS porque `inert` no
 * entiende de media queries: el drawer cerrado tiene que salir del orden de
 * tabulación en mobile, pero nunca en escritorio, donde está siempre a la vista.
 * Arranca en `true` para que el primer render del servidor no marque inerte un
 * sidebar que en escritorio es visible.
 */
function useEsEscritorio(): boolean {
  const [esEscritorio, setEsEscritorio] = useState(true);

  useEffect(() => {
    const consulta = window.matchMedia("(min-width: 1024px)");
    const sincronizar = () => setEsEscritorio(consulta.matches);
    sincronizar();
    consulta.addEventListener("change", sincronizar);
    return () => consulta.removeEventListener("change", sincronizar);
  }, []);

  return esEscritorio;
}

export interface UsuarioSidebar {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function Sidebar({
  cursos,
  usuario,
  onCerrarSesion,
  onActualizar,
  actualizando = false,
  abierto = false,
  onCerrarMenu,
}: {
  cursos: string[];
  usuario?: UsuarioSidebar;
  onCerrarSesion?: () => void;
  onActualizar?: () => void;
  actualizando?: boolean;
  /** Solo aplica en mobile: en `lg+` el sidebar está siempre visible. */
  abierto?: boolean;
  onCerrarMenu?: () => void;
}) {
  const pathname = usePathname();
  const [fotoFallo, setFotoFallo] = useState(false);
  const esEscritorio = useEsEscritorio();
  const seccion: Seccion = pathname?.startsWith("/dashboard/correos")
    ? "correos"
    : pathname?.startsWith("/dashboard/notas")
      ? "notas"
      : pathname?.startsWith("/dashboard/calendario")
        ? "calendario"
        : pathname?.startsWith("/dashboard/tareas")
          ? "tareas"
          : "inicio";

  // El resto del contexto (toggle, conteos, archivar) lo consume `CursoItem`.
  const { cursosSeleccionados, limpiarCursos, cursosArchivados } =
    useFiltroCursos();

  useEffect(() => {
    if (!abierto || !onCerrarMenu) return;
    function alTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrarMenu!();
    }
    document.addEventListener("keydown", alTecla);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTecla);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrarMenu]);

  const haySeleccion = cursosSeleccionados.length > 0;
  // Los archivados no se listan, pero `cursos` completo se sigue usando para
  // los colores: dependen del índice en la lista original.
  const cursosVisibles = cursos.filter((c) => !cursosArchivados.includes(c));

  return (
    <>
      {/* Fondo oscurecido: solo existe en mobile, con el drawer abierto. */}
      <div
        aria-hidden
        onClick={onCerrarMenu}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Navegación principal"
        inert={!esEscritorio && !abierto}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white p-6 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none dark:border-slate-700 dark:bg-slate-800 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-[#4F46E5] mb-8">
          <span className="font-bold text-lg">Syllo</span>
          <div className="flex items-center gap-1">
            {onActualizar && (
              <button
                onClick={onActualizar}
                disabled={actualizando}
                title="Actualizar datos"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/15"
              >
                <RefreshCw size={15} className={actualizando ? "animate-spin" : ""} />
              </button>
            )}
            {onCerrarMenu && (
              <button
                onClick={onCerrarMenu}
                title="Cerrar menú"
                aria-label="Cerrar menú"
                className="p-1.5 rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

      <nav className="flex flex-col gap-1 mb-8">
        <EnlaceSeccion
          href="/dashboard"
          icono={<Home size={16} />}
          etiqueta="Inicio"
          onNavegar={onCerrarMenu}
          activo={seccion === "inicio"}
        />
        <EnlaceSeccion
          href="/dashboard/tareas"
          icono={<ListChecks size={16} />}
          etiqueta="Tareas"
          onNavegar={onCerrarMenu}
          activo={seccion === "tareas"}
        />
        <EnlaceSeccion
          href="/dashboard/correos"
          icono={<Mail size={16} />}
          etiqueta="Correos"
          onNavegar={onCerrarMenu}
          activo={seccion === "correos"}
        />
        <EnlaceSeccion
          href="/dashboard/notas"
          icono={<NotebookPen size={16} />}
          etiqueta="Notas"
          onNavegar={onCerrarMenu}
          activo={seccion === "notas"}
        />
        <EnlaceSeccion
          href="/dashboard/calendario"
          icono={<CalendarDays size={16} />}
          etiqueta="Calendario"
          onNavegar={onCerrarMenu}
          activo={seccion === "calendario"}
        />
      </nav>

      {/* Cursos: multi-selección, scrollea internamente */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-900 tracking-wider dark:text-slate-100">
            MIS CURSOS
          </p>
          {haySeleccion && (
            <button
              onClick={limpiarCursos}
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Ver todos
            </button>
          )}
        </div>

        {/* Indicador de cantidad seleccionada */}
        {haySeleccion && (
          <p className="text-[11px] text-slate-400 mb-2 dark:text-slate-500">
            {cursosSeleccionados.length === 1
              ? "1 curso seleccionado"
              : `${cursosSeleccionados.length} cursos seleccionados`}
          </p>
        )}

        <nav className="flex flex-col gap-0.5 pb-24 text-slate-900 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden dark:text-slate-100">
          {/* Opción "Todos" */}
          <button
            onClick={limpiarCursos}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !haySeleccion
                ? "bg-indigo-50 text-slate-900 dark:bg-indigo-500/15 dark:text-slate-100"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            <BookOpen size={16} className={!haySeleccion ? "text-indigo-600 dark:text-indigo-400" : ""} />
            Todos los cursos
          </button>

          <AnimatePresence mode="popLayout">
            {[
              ...cursosVisibles.map((nombre) => (
                <CursoItem
                  key={nombre}
                  nombre={nombre}
                  listaCursos={cursos}
                  seleccionado={cursosSeleccionados.includes(nombre)}
                  esArchivado={false}
                />
              )),
              cursosArchivados.length > 0 ? (
                <motion.div
                  key="archivados-header"
                  layout="position"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 mb-1 px-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wider dark:text-slate-500"
                >
                  <Archive size={12} />
                  ARCHIVADOS
                </motion.div>
              ) : null,
              ...cursosArchivados.map((nombre) => (
                <CursoItem
                  key={nombre}
                  nombre={nombre}
                  listaCursos={cursos}
                  seleccionado={cursosSeleccionados.includes(nombre)}
                  esArchivado={true}
                />
              ))
            ]}
          </AnimatePresence>
        </nav>
      </div>

      {/* Pie: perfil de usuario y logout */}
      {usuario && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 dark:border-slate-700">
          <div className="flex items-center gap-2.5 min-w-0">
            {usuario.image && !fotoFallo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usuario.image}
                alt={usuario.name ?? "Avatar"}
                referrerPolicy="no-referrer"
                onError={() => setFotoFallo(true)}
                className="w-8 h-8 rounded-full ring-1 ring-slate-200 shrink-0 dark:ring-slate-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0 select-none dark:bg-indigo-500/20 dark:text-indigo-300">
                {usuario.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate dark:text-slate-100">
                {usuario.name ?? "Estudiante"}
              </p>
              <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">
                {usuario.email ?? ""}
              </p>
            </div>
          </div>

          {onCerrarSesion && (
            <button
              onClick={onCerrarSesion}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 dark:hover:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}
      </aside>
    </>
  );
}

function EnlaceSeccion({
  href,
  icono,
  etiqueta,
  activo,
  onNavegar,
}: {
  href: string;
  icono: React.ReactNode;
  etiqueta: string;
  activo: boolean;
  /** En mobile el drawer se cierra al elegir una sección. */
  onNavegar?: () => void;
}) {
  // El filtro vive en la URL, así que cambiar de sección lo perdería si el link
  // no se lo lleva puesto. Solo viaja `curso`: `tab` y `vista` son de Tareas.
  const { hrefConFiltro } = useFiltroCursos();

  return (
    <Link
      href={hrefConFiltro(href)}
      onClick={onNavegar}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        activo
          ? "bg-indigo-600 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {icono}
      {etiqueta}
    </Link>
  );
}

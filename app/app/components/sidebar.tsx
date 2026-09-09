"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ListChecks,
  LogOut,
  Mail,
  NotebookPen,
  RefreshCw,
} from "lucide-react";
import { useFiltroCursos } from "../(panel)/filtro-cursos";

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

function bgParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO_BG[indice % COLORES_CURSO_BG.length];
}

export type Seccion = "tareas" | "correos" | "notas";

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
}: {
  cursos: string[];
  usuario?: UsuarioSidebar;
  onCerrarSesion?: () => void;
  onActualizar?: () => void;
  actualizando?: boolean;
}) {
  const pathname = usePathname();
  const [fotoFallo, setFotoFallo] = useState(false);
  const seccion: Seccion = pathname?.startsWith("/dashboard/correos")
    ? "correos"
    : pathname?.startsWith("/dashboard/notas")
      ? "notas"
      : "tareas";

  const {
    cursosSeleccionados,
    toggleCurso,
    limpiarCursos,
    conteoPorCurso,
  } = useFiltroCursos();

  const haySeleccion = cursosSeleccionados.length > 0;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-6 flex flex-col h-screen sticky top-0 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-3 text-indigo-600 mb-8 dark:text-indigo-400">
        <span className="font-bold text-lg">Syllo</span>
        {onActualizar && (
          <button
            onClick={onActualizar}
            disabled={actualizando}
            title="Actualizar datos"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-60 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/15"
          >
            <RefreshCw size={15} className={actualizando ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1 mb-8">
        <EnlaceSeccion
          href="/dashboard"
          icono={<ListChecks size={16} />}
          etiqueta="Tareas"
          activo={seccion === "tareas"}
        />
        <EnlaceSeccion
          href="/dashboard/correos"
          icono={<Mail size={16} />}
          etiqueta="Correos"
          activo={seccion === "correos"}
        />
        <EnlaceSeccion
          href="/dashboard/notas"
          icono={<NotebookPen size={16} />}
          etiqueta="Notas"
          activo={seccion === "notas"}
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

        <nav className="flex flex-col gap-0.5 text-slate-900 overflow-y-auto dark:text-slate-100">
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

          {/* Lista de cursos con checkboxes visuales */}
          {cursos.map((nombre) => {
            const seleccionado = cursosSeleccionados.includes(nombre);
            return (
              <button
                key={nombre}
                onClick={() => toggleCurso(nombre)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  seleccionado
                    ? "bg-indigo-50 text-slate-900 dark:bg-indigo-500/15 dark:text-slate-100"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {/* Checkbox visual */}
                  <span
                    className={`flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                      seleccionado
                        ? `${bgParaCurso(nombre, cursos)} border-transparent`
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
                  <span className={`truncate ${colorParaCurso(nombre, cursos)}`}>
                    {nombre}
                  </span>
                </span>

                {/* Badge de no leídos/pendientes */}
                {conteoPorCurso[nombre] > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                      seleccionado
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {conteoPorCurso[nombre]}
                  </span>
                )}
              </button>
            );
          })}
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
  );
}

function EnlaceSeccion({
  href,
  icono,
  etiqueta,
  activo,
}: {
  href: string;
  icono: React.ReactNode;
  etiqueta: string;
  activo: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

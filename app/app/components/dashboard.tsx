"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { colorParaCurso } from "./sidebar";
import { useFiltroCursos } from "../(panel)/filtro-cursos";
import {
  Tarea,
  diasHastaVencimiento,
  estaCompletada,
  formatearFecha,
  etiquetaVencimiento,
} from "../lib/classroom";
import { clasificarTareas, contarPendientesPorCurso } from "../lib/tareas-service";

type Tab = "pendientes" | "urgentes" | "vencidas" | "semana" | "completadas";
type VistaLayout = "grid" | "lista";

const TABS_MAP: { valor: Tab; etiqueta: string }[] = [
  { valor: "pendientes", etiqueta: "Pendientes" },
  { valor: "urgentes", etiqueta: "Urgentes" },
  { valor: "vencidas", etiqueta: "Vencidas" },
  { valor: "semana", etiqueta: "Esta semana" },
  { valor: "completadas", etiqueta: "Completadas" },
];

function colorEtiquetaVencimiento(dias: number | null, completada: boolean): string {
  if (completada) return "bg-green-500 text-white";
  if (dias === null) return "bg-slate-400 text-slate-100";
  if (dias < 0) return "bg-red-500 text-white";
  if (dias <= 3) return "bg-orange-400 text-white";
  return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

/** Normaliza un string para búsqueda insensible a mayúsculas y tildes. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function Dashboard({ tareas }: { tareas: Tarea[] }) {
  const { cursosSeleccionados, setConteoPorCurso } = useFiltroCursos();
  const [tab, setTab] = useState<Tab>("pendientes");
  const [busqueda, setBusqueda] = useState("");
  const [vistaLayout, setVistaLayout] = useState<VistaLayout>("grid");

  const nombresCursos = useMemo(
    () => Array.from(new Set(tareas.map((t) => t.curso))),
    [tareas],
  );

  const conteoPendientes = useMemo(
    () => contarPendientesPorCurso(tareas),
    [tareas]
  );

  // Publica el conteo de pendientes por curso al Sidebar compartido.
  useEffect(() => {
    setConteoPorCurso(conteoPendientes);
  }, [conteoPendientes, setConteoPorCurso]);

  const tareasFiltradasPorCurso = useMemo(
    () =>
      cursosSeleccionados.length === 0
        ? tareas
        : tareas.filter((t) => cursosSeleccionados.includes(t.curso)),
    [tareas, cursosSeleccionados],
  );

  const { pendientes, vencidas, vencidasRecientes, urgentes, estaSemana, completadas } =
    useMemo(() => clasificarTareas(tareasFiltradasPorCurso), [tareasFiltradasPorCurso]);

  /** Conteos para los badges en tabs y statcards. */
  const conteosPorTab: Record<Tab, number> = {
    pendientes: pendientes.length,
    urgentes: urgentes.length,
    vencidas: vencidasRecientes.length,
    semana: estaSemana.length,
    completadas: completadas.length,
  };

  const tareasDelTab =
    tab === "pendientes"
      ? pendientes
      : tab === "urgentes"
        ? urgentes
        : tab === "vencidas"
          ? vencidasRecientes
          : tab === "semana"
            ? estaSemana
            : completadas;

  /** Aplica búsqueda sobre el tab activo, sin ir al servidor. */
  const tareasFiltradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return tareasDelTab;
    return tareasDelTab.filter(
      (t) =>
        normalizar(t.titulo).includes(q) ||
        normalizar(t.descripcion ?? "").includes(q) ||
        normalizar(t.curso).includes(q),
    );
  }, [tareasDelTab, busqueda]);

  const ordenadas = [...tareasFiltradas].sort((a, b) => {
    const diasA = diasHastaVencimiento(a.vencimiento) ?? Infinity;
    const diasB = diasHastaVencimiento(b.vencimiento) ?? Infinity;
    return diasA - diasB;
  });

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {cursosSeleccionados.length === 0
            ? "Todas las tareas"
            : cursosSeleccionados.length === 1
              ? cursosSeleccionados[0]
              : `${cursosSeleccionados.length} cursos seleccionados`}
        </h1>
        <p className="text-sm text-slate-500 capitalize dark:text-slate-400">{hoy}</p>
      </div>

      {/* StatCards — métricas de resumen */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icono={<Clock size={18} className="text-indigo-600" />}
          valor={pendientes.length}
          etiqueta="Pendientes"
          fondo="bg-white border-l-4 border-l-indigo-500 dark:bg-slate-800"
        />
        <StatCard
          icono={<AlertCircle size={18} className="text-red-600" />}
          valor={vencidas.length}
          etiqueta="Vencidas"
          fondo="bg-white border-l-4 border-l-red-500 dark:bg-slate-800"
        />
        <StatCard
          icono={<Calendar size={18} className="text-amber-600" />}
          valor={estaSemana.length}
          etiqueta="Esta semana"
          fondo="bg-white border-l-4 border-l-amber-500 dark:bg-slate-800"
        />
        <StatCard
          icono={<CheckCircle2 size={18} className="text-green-600" />}
          valor={completadas.length}
          etiqueta="Completadas"
          fondo="bg-white border-l-4 border-l-green-500 dark:bg-slate-800"
        />
      </div>

      {/* Barra de herramientas: Tabs + Buscador + Toggle de vista */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Tabs con badge de conteo */}
        <div className="flex gap-2 flex-wrap">
          {TABS_MAP.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              onClick={() => setTab(valor)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === valor
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
              }`}
            >
              {etiqueta}
              <span
                className={`inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs font-semibold leading-none tabular-nums ${
                  tab === valor
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {conteosPorTab[valor]}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar entregas, temas o TPs…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Toggle Grid / Lista */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shrink-0 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setVistaLayout("grid")}
            title="Vista Cuadrícula"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              vistaLayout === "grid"
                ? "bg-slate-900 text-white dark:bg-slate-600"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setVistaLayout("lista")}
            title="Vista Lista Compacta"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              vistaLayout === "lista"
                ? "bg-slate-900 text-white dark:bg-slate-600"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {ordenadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CheckCircle2 size={32} className="text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 text-sm dark:text-slate-400">
            {busqueda
              ? `Sin resultados para "${busqueda}" en esta categoría.`
              : "No hay tareas en esta categoría."}
          </p>
        </div>
      ) : vistaLayout === "grid" ? (
        // Vista cuadrícula (3 columnas)
        <div className="grid grid-cols-3 gap-4">
          {ordenadas.map((tarea, i) => {
            const dias = diasHastaVencimiento(tarea.vencimiento);
            const completada = estaCompletada(tarea);
            return (
              <a
                key={i}
                href={tarea.link}
                target="_blank"
                rel="noreferrer"
                className="block bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-medium ${colorParaCurso(
                      tarea.curso,
                      nombresCursos,
                    )}`}
                  >
                    {tarea.curso}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${colorEtiquetaVencimiento(
                      dias,
                      completada,
                    )}`}
                  >
                    {completada ? "Entregada" : etiquetaVencimiento(dias)}
                  </span>
                </div>
                <h3 className="font-medium mb-1 text-slate-900 dark:text-slate-100">{tarea.titulo}</h3>
                {tarea.descripcion && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 dark:text-slate-400">
                    {tarea.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>{formatearFecha(tarea.vencimiento)}</span>
                  {tarea.puntos !== null && <span>{tarea.puntos} pts</span>}
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        // Vista lista compacta
        <div className="flex flex-col divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden dark:divide-slate-700 dark:bg-slate-800 dark:border-slate-700">
          {ordenadas.map((tarea, i) => {
            const dias = diasHastaVencimiento(tarea.vencimiento);
            const completada = estaCompletada(tarea);
            return (
              <a
                key={i}
                href={tarea.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer dark:hover:bg-slate-700"
              >
                {/* Indicador de estado */}
                <span
                  className={`shrink-0 h-2.5 w-2.5 rounded-full ${
                    completada
                      ? "bg-green-500"
                      : dias !== null && dias < 0
                        ? "bg-red-500"
                        : dias !== null && dias <= 1
                          ? "bg-orange-400"
                          : "bg-indigo-400"
                  }`}
                />

                {/* Titulo */}
                <span className="flex-1 text-sm font-medium text-slate-900 truncate dark:text-slate-100">
                  {tarea.titulo}
                </span>

                {/* Curso */}
                <span
                  className={`hidden sm:inline shrink-0 text-xs font-medium ${colorParaCurso(
                    tarea.curso,
                    nombresCursos,
                  )}`}
                >
                  {tarea.curso}
                </span>

                {/* Badge estado */}
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${colorEtiquetaVencimiento(
                    dias,
                    completada,
                  )}`}
                >
                  {completada ? "Entregada" : etiquetaVencimiento(dias)}
                </span>

                {/* Fecha vencimiento */}
                <span className="shrink-0 text-xs text-slate-400 w-24 text-right dark:text-slate-500">
                  {formatearFecha(tarea.vencimiento)}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}

function StatCard({
  icono,
  valor,
  etiqueta,
  fondo,
}: {
  icono: React.ReactNode;
  valor: number;
  etiqueta: string;
  fondo: string;
}) {
  return (
    <div
      className={`${fondo} border border-slate-200 shadow-sm rounded-xl p-4 flex items-center gap-3 dark:border-slate-700`}
    >
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0 dark:bg-slate-700 dark:border-slate-600">
        {icono}
      </div>
      <div>
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{valor}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</p>
      </div>
    </div>
  );
}
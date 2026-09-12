"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { bgParaCurso, colorParaCurso } from "./sidebar";
import { useFiltroCursos } from "../(panel)/filtro-cursos";
import {
  Tarea,
  diasHastaVencimiento,
  estaCompletada,
  formatearFecha,
  etiquetaVencimiento,
} from "../lib/classroom";
import {
  clasificarTareas,
  contarPendientesPorCurso,
} from "../lib/tareas-service";

type Tab =
  | "pendientes"
  | "urgentes"
  | "vencidas"
  | "semana"
  | "completadas"
  | "archivados";
type VistaLayout = "grid" | "lista";

const TABS_MAP: { valor: Tab; etiqueta: string }[] = [
  { valor: "pendientes", etiqueta: "Pendientes" },
  { valor: "semana", etiqueta: "Esta semana" },
  { valor: "urgentes", etiqueta: "Urgentes" },
  { valor: "vencidas", etiqueta: "Vencidas" },
  { valor: "completadas", etiqueta: "Completadas" },
  // Solo se muestra cuando hay al menos un curso archivado.
  { valor: "archivados", etiqueta: "Archivados" },
];

function colorEtiquetaVencimiento(
  dias: number | null,
  completada: boolean,
): string {
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
  const {
    cursosSeleccionados,
    setConteoPorCurso,
    cursosArchivados,
    restaurarCursos,
    archivando,
    renombres,
  } = useFiltroCursos();
  const [tabElegido, setTab] = useState<Tab>("pendientes");
  const [busqueda, setBusqueda] = useState("");
  // La lupa abre el campo de búsqueda en su lugar; queda abierto mientras haya texto.
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const mostrarBuscador = buscadorAbierto || busqueda.length > 0;
  const [vistaLayout, setVistaLayout] = useState<VistaLayout>("grid");

  const nombresCursos = useMemo(
    () => Array.from(new Set(tareas.map((t) => t.curso))),
    [tareas],
  );

  // Las tareas de cursos archivados salen de todas las vistas y solo viven en
  // la pestaña "Archivados".
  const { tareasActivas, tareasArchivadas } = useMemo(() => {
    const activas: Tarea[] = [];
    const archivadas: Tarea[] = [];
    for (const t of tareas) {
      (cursosArchivados.includes(t.curso) ? archivadas : activas).push(t);
    }
    return { tareasActivas: activas, tareasArchivadas: archivadas };
  }, [tareas, cursosArchivados]);

  const hayArchivados = cursosArchivados.length > 0;

  const tareasPorCursoArchivado = useMemo(() => {
    const conteo: Record<string, number> = {};
    for (const t of tareasArchivadas)
      conteo[t.curso] = (conteo[t.curso] ?? 0) + 1;
    return conteo;
  }, [tareasArchivadas]);

  // Si se restauró todo mientras estaba abierta la pestaña, cae a Pendientes.
  const tab: Tab =
    tabElegido === "archivados" && !hayArchivados ? "pendientes" : tabElegido;

  const conteoPendientes = useMemo(
    () => contarPendientesPorCurso(tareasActivas),
    [tareasActivas],
  );

  // Publica el conteo de pendientes por curso al Sidebar compartido.
  useEffect(() => {
    setConteoPorCurso(conteoPendientes);
  }, [conteoPendientes, setConteoPorCurso]);

  const tareasFiltradasPorCurso = useMemo(
    () =>
      cursosSeleccionados.length === 0
        ? tareasActivas
        : tareasActivas.filter((t) => cursosSeleccionados.includes(t.curso)),
    [tareasActivas, cursosSeleccionados],
  );

  const {
    pendientes,
    vencidas,
    vencidasRecientes,
    urgentes,
    estaSemana,
    completadas,
  } = useMemo(
    () => clasificarTareas(tareasFiltradasPorCurso),
    [tareasFiltradasPorCurso],
  );

  /** Conteos para los badges en tabs y statcards. */
  const conteosPorTab: Record<Tab, number> = {
    pendientes: pendientes.length,
    urgentes: urgentes.length,
    vencidas: vencidasRecientes.length,
    semana: estaSemana.length,
    completadas: completadas.length,
    archivados: tareasArchivadas.length,
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
            : tab === "completadas"
              ? completadas
              : tareasArchivadas;

  /** Aplica búsqueda sobre el tab activo, sin ir al servidor. */
  const tareasFiltradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return tareasDelTab;
    return tareasDelTab.filter(
      (t) =>
        normalizar(t.titulo).includes(q) ||
        normalizar(t.descripcion ?? "").includes(q) ||
        normalizar(renombres[t.curso] || t.curso).includes(q),
    );
  }, [tareasDelTab, busqueda, renombres]);

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
      {/* Cabecera: título y fecha a la izquierda, buscador y toggle de vista a la derecha */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {cursosSeleccionados.length === 0
              ? "Todas las tareas"
              : cursosSeleccionados.length === 1
                ? renombres[cursosSeleccionados[0]] || cursosSeleccionados[0]
                : `${cursosSeleccionados.length} cursos seleccionados`}
          </h1>
          <p className="text-sm text-slate-500 capitalize dark:text-slate-400">
            {hoy}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Buscador: lupa que se expande en su lugar */}
          {mostrarBuscador ? (
            <div className="relative w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onBlur={() => {
                  if (!busqueda) setBuscadorAbierto(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setBusqueda("");
                    setBuscadorAbierto(false);
                  }
                }}
                placeholder="Buscar entregas, temas o TPs…"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
          ) : (
            <button
              onClick={() => setBuscadorAbierto(true)}
              title="Buscar entregas, temas o TPs"
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:hover:text-slate-100 dark:hover:border-slate-600"
            >
              <Search size={16} />
            </button>
          )}
        </div>
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

      {/* Pestañas a la izquierda, modo de vista a la derecha */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {TABS_MAP.filter(
            ({ valor }) => valor !== "archivados" || hayArchivados,
          ).map(({ valor, etiqueta }) => (
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

        <div className="ml-auto shrink-0">
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
      </div>

      {/* Cursos archivados: tarjeta con una fila por curso, solo en su pestaña */}
      {tab === "archivados" && hayArchivados && (
        <>
          <div className="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                <Archive size={16} className="text-slate-400" />
                Cursos archivados
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs font-semibold leading-none tabular-nums bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {cursosArchivados.length}
                </span>
              </div>
              {cursosArchivados.length > 1 && (
                <button
                  onClick={() => restaurarCursos(cursosArchivados)}
                  disabled={archivando}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-default dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Desarchivar todos
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {cursosArchivados.map((nombre) => {
                const cantidad = tareasPorCursoArchivado[nombre] ?? 0;
                return (
                  <div
                    key={nombre}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <span
                      className={`shrink-0 h-2.5 w-2.5 rounded-full ${bgParaCurso(nombre, nombresCursos)}`}
                    />
                    <span
                      className={`flex-1 min-w-0 truncate text-sm font-medium ${colorParaCurso(nombre, nombresCursos)}`}
                    >
                      {nombre}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                      {cantidad === 1 ? "1 tarea" : `${cantidad} tareas`}
                    </span>
                    <button
                      onClick={() => restaurarCursos([nombre])}
                      disabled={archivando}
                      title="Volver a mostrar este curso"
                      className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-default dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                    >
                      <ArchiveRestore size={13} />
                      Desarchivar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {ordenadas.length > 0 && (
            <p className="text-xs font-medium tracking-wider text-slate-500 mb-3 dark:text-slate-400">
              TAREAS DE CURSOS ARCHIVADOS
            </p>
          )}
        </>
      )}

      {/* Contenido */}
      {ordenadas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CheckCircle2
            size={32}
            className="text-slate-300 dark:text-slate-600"
          />
          <p className="text-slate-500 text-sm dark:text-slate-400">
            {busqueda
              ? `Sin resultados para "${busqueda}" en esta categoría.`
              : tab === "archivados"
                ? "No hay tareas en los cursos archivados."
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
                    title={renombres[tarea.curso] || tarea.curso}
                  >
                    {renombres[tarea.curso] || tarea.curso}
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
                <h3 className="font-medium mb-1 text-slate-900 dark:text-slate-100">
                  {tarea.titulo}
                </h3>
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
                  title={renombres[tarea.curso] || tarea.curso}
                >
                  {renombres[tarea.curso] || tarea.curso}
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
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {valor}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</p>
      </div>
    </div>
  );
}

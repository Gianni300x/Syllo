"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { bgParaCurso, colorParaCurso } from "@/lib/cursos-color";
import ControlesTarea from "@/features/tareas/components/controles-tarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFiltroCursos } from "../hooks/filtro-cursos";
import {
  Tarea,
  claveTarea,
  diasHastaVencimiento,
  estaCompletada,
  formatearFecha,
  etiquetaVencimiento,
} from "@/features/tareas/services/classroom";
import {
  clasificarTareas,
  contarPendientesPorCurso,
  ordenarPorPrioridad,
} from "@/features/tareas/services/tareas-service";
import { capitalizar } from "@/lib/fechas";
import { normalizar } from "@/lib/texto";

type Tab =
  | "pendientes"
  | "empezadas"
  | "urgentes"
  | "vencidas"
  | "semana"
  | "completadas"
  | "archivados";
type VistaLayout = "grid" | "lista";

const TABS_MAP: { valor: Tab; etiqueta: string }[] = [
  { valor: "pendientes", etiqueta: "Pendientes" },
  { valor: "vencidas", etiqueta: "Vencidas" },
  { valor: "semana", etiqueta: "Esta semana" },
  { valor: "completadas", etiqueta: "Completadas" },
  // Solo se muestra cuando hay al menos una tarea marcada como empezada.
  { valor: "empezadas", etiqueta: "Empezadas" },
  { valor: "urgentes", etiqueta: "Urgentes" },
  // Solo se muestra cuando hay al menos un curso archivado.
  { valor: "archivados", etiqueta: "Archivados" },
];

const TABS_VALIDOS = new Set<string>(TABS_MAP.map((t) => t.valor));

/** Un `?tab=` inventado o viejo cae a Pendientes en vez de dejar la vista vacía. */
function leerTab(valor: string | null): Tab {
  return valor && TABS_VALIDOS.has(valor) ? (valor as Tab) : "pendientes";
}

/**
 * Escribe un parámetro en la URL sin pedirle la página al servidor: el tab y la
 * vista son filtros de cliente sobre datos que ya están cargados.
 *
 * Los valores por defecto se borran en vez de escribirse, para que la URL de
 * "todo como viene" quede limpia.
 */
function escribirParam(
  clave: string,
  valor: string | null,
  modo: "push" | "replace",
) {
  const params = new URLSearchParams(window.location.search);
  if (valor === null) params.delete(clave);
  else params.set(clave, valor);
  const query = params.toString();
  const url = query ? `?${query}` : window.location.pathname;
  if (modo === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

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

export default function Dashboard({ tareas }: { tareas: Tarea[] }) {
  const {
    cursosSeleccionados,
    setConteoPorCurso,
    cursosArchivados,
    restaurarCursos,
    archivando,
    renombres,
  } = useFiltroCursos();
  const searchParams = useSearchParams();
  // El tab va con `push` porque es un paso de navegación: "atrás" tiene que
  // devolverte a la pestaña anterior.
  const tabElegido = leerTab(searchParams.get("tab"));
  const setTab = useCallback(
    (valor: Tab) =>
      escribirParam("tab", valor === "pendientes" ? null : valor, "push"),
    [],
  );
  const [busqueda, setBusqueda] = useState("");
  // La lupa abre el campo de búsqueda en su lugar; queda abierto mientras haya texto.
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const mostrarBuscador = buscadorAbierto || busqueda.length > 0;
  // La vista es una preferencia, no un paso de navegación: `replace`, para no
  // llenar el historial de entradas por cambiar de cuadrícula a lista.
  const vistaLayout: VistaLayout =
    searchParams.get("vista") === "lista" ? "lista" : "grid";
  const setVistaLayout = useCallback(
    (valor: VistaLayout) =>
      escribirParam("vista", valor === "grid" ? null : valor, "replace"),
    [],
  );

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
    vencidasRecientes,
    urgentes,
    estaSemana,
    empezadas,
    completadas,
  } = useMemo(
    () => clasificarTareas(tareasFiltradasPorCurso),
    [tareasFiltradasPorCurso],
  );

  // Si la pestaña abierta se quedó sin contenido (se restauraron todos los
  // cursos, o se desmarcó la última empezada), cae a Pendientes.
  const tab: Tab =
    (tabElegido === "archivados" && !hayArchivados) ||
    (tabElegido === "empezadas" && empezadas.length === 0)
      ? "pendientes"
      : tabElegido;

  /** Conteos para los badges en tabs y statcards. */
  const conteosPorTab: Record<Tab, number> = {
    pendientes: pendientes.length,
    empezadas: empezadas.length,
    urgentes: urgentes.length,
    vencidas: vencidasRecientes.length,
    semana: estaSemana.length,
    completadas: completadas.length,
    archivados: tareasArchivadas.length,
  };

  const tareasDelTab =
    tab === "pendientes"
      ? pendientes
      : tab === "empezadas"
        ? empezadas
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

  // Lo que el alumno fijó va arriba de todo, en cualquier pestaña.
  const ordenadas = ordenarPorPrioridad(tareasFiltradas);

  const hoy = capitalizar(
    new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Cabecera: título a la izquierda; buscador y modo de vista a la derecha.
          En mobile el buscador baja a su propia fila y queda siempre visible —
          igual que en Novedades—, porque la lupa que se expande dejaba un botón
          suelto en una fila vacía. */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {cursosSeleccionados.length === 0
                ? "Todas las tareas"
                : cursosSeleccionados.length === 1
                  ? renombres[cursosSeleccionados[0]] || cursosSeleccionados[0]
                  : `${cursosSeleccionados.length} cursos seleccionados`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{hoy}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Buscador de escritorio: la lupa se expande en su lugar */}
            <div className="hidden sm:block">
              {mostrarBuscador ? (
                <div className="relative w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
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
                    className="w-full pl-9"
                  />
                </div>
              ) : (
                <Button
                  onClick={() => setBuscadorAbierto(true)}
                  variant="outline"
                  size="icon"
                  title="Buscar entregas, temas o TPs"
                  aria-label="Buscar entregas, temas o TPs"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <Search size={16} />
                </Button>
              )}
            </div>

            <ToggleVista vista={vistaLayout} onCambiar={setVistaLayout} />
          </div>
        </div>

        {/* Buscador de mobile: siempre montado, ancho completo */}
        <div className="relative mt-4 sm:hidden">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setBusqueda("");
            }}
            placeholder="Buscar entregas, temas o TPs…"
            className="w-full pl-9"
          />
        </div>
      </div>

      {/* StatCards — métricas de resumen, cada una abre su pestaña.
          "Vencidas" cuenta las recientes, el mismo conjunto que muestra la
          pestaña: antes la tarjeta decía un número y el tab de al lado otro. */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4 sm:mb-8 lg:grid-cols-4">
        <StatCard
          icono={<Clock size={18} className="text-indigo-600" />}
          valor={pendientes.length}
          etiqueta="Pendientes"
          fondo="bg-white border-l-4 border-l-indigo-500 dark:bg-slate-800"
          activo={tab === "pendientes"}
          onClick={() => setTab("pendientes")}
        />
        <StatCard
          icono={<AlertCircle size={18} className="text-red-600" />}
          valor={vencidasRecientes.length}
          etiqueta="Vencidas"
          fondo="bg-white border-l-4 border-l-red-500 dark:bg-slate-800"
          activo={tab === "vencidas"}
          onClick={() => setTab("vencidas")}
        />
        <StatCard
          icono={<Calendar size={18} className="text-amber-600" />}
          valor={estaSemana.length}
          etiqueta="Esta semana"
          fondo="bg-white border-l-4 border-l-amber-500 dark:bg-slate-800"
          activo={tab === "semana"}
          onClick={() => setTab("semana")}
        />
        <StatCard
          icono={<CheckCircle2 size={18} className="text-green-600" />}
          valor={completadas.length}
          etiqueta="Completadas"
          fondo="bg-white border-l-4 border-l-green-500 dark:bg-slate-800"
          activo={tab === "completadas"}
          onClick={() => setTab("completadas")}
        />
      </div>

      {/* Pestañas. En mobile van en una grilla de dos columnas: en una sola
          línea deslizable la última quedaba cortada contra el borde y se leía
          como rota. Si el total es impar, la última ocupa las dos columnas. */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {TABS_MAP.filter(
          ({ valor }) =>
            (valor !== "archivados" || hayArchivados) &&
            (valor !== "empezadas" || empezadas.length > 0),
        ).map(({ valor, etiqueta }) => (
          <button
            key={valor}
            onClick={() => setTab(valor)}
            aria-pressed={tab === valor}
            className={`inline-flex w-full items-center justify-between gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer last:odd:col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-auto sm:justify-start ${
              tab === valor
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
            }`}
          >
            <span className="truncate">{etiqueta}</span>
            <span
              className={`inline-flex shrink-0 items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs font-semibold leading-none tabular-nums ${
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
                <Button
                  onClick={() => restaurarCursos(cursosArchivados)}
                  disabled={archivando}
                  variant="link"
                  size="xs"
                  className="h-auto p-0 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Desarchivar todos
                </Button>
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
                    <Button
                      onClick={() => restaurarCursos([nombre])}
                      disabled={archivando}
                      variant="outline"
                      size="xs"
                      title="Volver a mostrar este curso"
                      className="shrink-0 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                    >
                      <ArchiveRestore size={13} />
                      Desarchivar
                    </Button>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ordenadas.map((tarea, i) => {
            const dias = diasHastaVencimiento(tarea.vencimiento);
            const completada = estaCompletada(tarea);
            return (
              // Link estirado: la tarjeta es un div y el `after:` del link del
              // título la cubre entera, así los controles de estado pueden ser
              // hermanos del link en vez de ir anidados adentro.
              <div
                key={claveTarea(tarea) ?? i}
                className={`group relative bg-white border shadow-sm rounded-xl p-4 transition-all hover:border-indigo-300 hover:shadow-md focus-within:border-indigo-300 dark:bg-slate-800 dark:hover:border-indigo-500 ${
                  tarea.fijada
                    ? "border-amber-300 dark:border-amber-500/60"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`min-w-0 truncate text-xs font-medium ${colorParaCurso(
                      tarea.curso,
                      nombresCursos,
                    )}`}
                    title={renombres[tarea.curso] || tarea.curso}
                  >
                    {renombres[tarea.curso] || tarea.curso}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <ControlesTarea tarea={tarea} />
                    <span
                      className={`shrink-0 text-xs px-2 py-1 rounded-full ${colorEtiquetaVencimiento(
                        dias,
                        completada,
                      )}`}
                    >
                      {completada ? "Entregada" : etiquetaVencimiento(dias)}
                    </span>
                  </div>
                </div>
                <h3 className="font-medium mb-1 text-slate-900 dark:text-slate-100">
                  <a
                    href={tarea.link}
                    target="_blank"
                    rel="noreferrer"
                    className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500"
                  >
                    {tarea.titulo}
                  </a>
                </h3>
                {tarea.descripcion && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 dark:text-slate-400">
                    {tarea.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>{formatearFecha(tarea.vencimiento)}</span>
                  <span className="flex items-center gap-2">
                    {tarea.empezada && (
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        Empezada
                      </span>
                    )}
                    {tarea.puntos !== null && <span>{tarea.puntos} pts</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Vista lista compacta
        <div className="flex flex-col divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden dark:divide-slate-700 dark:bg-slate-800 dark:border-slate-700">
          {ordenadas.map((tarea, i) => {
            const dias = diasHastaVencimiento(tarea.vencimiento);
            const completada = estaCompletada(tarea);
            const nombreCurso = renombres[tarea.curso] || tarea.curso;
            const claseBadge = `shrink-0 text-xs px-2 py-0.5 rounded-full ${colorEtiquetaVencimiento(
              dias,
              completada,
            )}`;
            const textoBadge = completada
              ? "Entregada"
              : etiquetaVencimiento(dias);
            return (
              // Mismo link estirado que la vista cuadrícula, para poder poner
              // los controles de estado al lado sin anidarlos en el link.
              <div
                key={claveTarea(tarea) ?? i}
                className="group relative flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-slate-50 sm:flex-nowrap sm:gap-4 sm:px-5 dark:hover:bg-slate-700"
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
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-900 truncate dark:text-slate-100">
                  <a
                    href={tarea.link}
                    target="_blank"
                    rel="noreferrer"
                    className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-indigo-500"
                  >
                    {tarea.titulo}
                  </a>
                </span>

                <ControlesTarea tarea={tarea} />

                {/* Badge de la primera línea (solo mobile) */}
                <span className={`${claseBadge} sm:hidden`}>{textoBadge}</span>

                {/* Segunda línea en mobile; en `sm` se disuelve con `contents`
                    y curso, badge y fecha vuelven a ser columnas de la fila. */}
                <div className="flex w-full items-center gap-1.5 pl-[22px] text-xs sm:contents">
                  <span
                    className={`truncate font-medium ${colorParaCurso(
                      tarea.curso,
                      nombresCursos,
                    )} sm:shrink-0`}
                    title={nombreCurso}
                  >
                    {nombreCurso}
                  </span>

                  <span
                    aria-hidden
                    className="text-slate-300 sm:hidden dark:text-slate-600"
                  >
                    ·
                  </span>

                  <span className={`hidden ${claseBadge} sm:inline-block`}>
                    {textoBadge}
                  </span>

                  <span className="shrink-0 text-xs text-slate-400 sm:w-24 sm:text-right dark:text-slate-500">
                    {formatearFecha(tarea.vencimiento)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

/** Cuadrícula / Lista. Vive en la cabecera para no quedar suelto bajo las pestañas. */
function ToggleVista({
  vista,
  onCambiar,
}: {
  vista: VistaLayout;
  onCambiar: (vista: VistaLayout) => void;
}) {
  const boton = (activo: boolean) =>
    `p-1.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      activo
        ? "bg-slate-900 text-white dark:bg-slate-600"
        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  return (
    <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={() => onCambiar("grid")}
        title="Vista Cuadrícula"
        aria-label="Vista Cuadrícula"
        aria-pressed={vista === "grid"}
        className={boton(vista === "grid")}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onCambiar("lista")}
        title="Vista Lista Compacta"
        aria-label="Vista Lista Compacta"
        aria-pressed={vista === "lista"}
        className={boton(vista === "lista")}
      >
        <List size={16} />
      </button>
    </div>
  );
}

function StatCard({
  icono,
  valor,
  etiqueta,
  fondo,
  activo,
  onClick,
}: {
  icono: React.ReactNode;
  valor: number;
  etiqueta: string;
  fondo: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`${fondo} w-full text-left border shadow-sm rounded-xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        activo
          ? "border-indigo-400 dark:border-indigo-500"
          : "border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-500"
      }`}
    >
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0 dark:bg-slate-700 dark:border-slate-600">
        {icono}
      </div>
      {/* `min-w-0` + `truncate`: sin esto "Esta semana" o "Completadas" parten
          en dos líneas en pantallas angostas y esa tarjeta queda más alta que
          su vecina, descolocando la grilla. */}
      <div className="min-w-0">
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {valor}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {etiqueta}
        </p>
      </div>
    </button>
  );
}

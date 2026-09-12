"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { bgParaCurso } from "./sidebar";
import { useFiltroCursos } from "../(panel)/filtro-cursos";
import { Tarea, estaCompletada, fechaVencimiento } from "../lib/classroom";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Alto aproximado de una pill (incluye el gap vertical). Se usa para decidir
// cuántas entran en una celda antes de resumir el resto en "+N más".
const ALTO_PILL = 22;

/** Clave local `YYYY-MM-DD` de una fecha (sin corrimiento por zona horaria). */
function claveDia(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Primer día del mes que contiene a `fecha`. */
function inicioDeMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function etiquetaDiaLargo(fecha: Date): string {
  return capitalizar(
    fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );
}

import AgregarEventoModal from "./agregar-evento-modal";

export default function Calendario({ tareas }: { tareas: Tarea[] }) {
  const { cursosSeleccionados, cursosArchivados } = useFiltroCursos();
  const [mesVisible, setMesVisible] = useState<Date>(() => inicioDeMes(new Date()));

  // Colores estables por curso: mismo criterio que el resto del panel (índice en
  // la lista completa de cursos, incluidos los archivados).
  const nombresCursos = useMemo(
    () => Array.from(new Set(tareas.map((t) => t.curso))),
    [tareas],
  );

  // Igual que en Tareas: fuera los cursos archivados, luego el filtro del sidebar.
  const tareasVisibles = useMemo(() => {
    const activas = tareas.filter((t) => !cursosArchivados.includes(t.curso));
    if (cursosSeleccionados.length === 0) return activas;
    return activas.filter((t) => cursosSeleccionados.includes(t.curso));
  }, [tareas, cursosArchivados, cursosSeleccionados]);

  /** Tareas con vencimiento, agrupadas por día (`YYYY-MM-DD`), ordenadas por curso. */
  const tareasPorDia = useMemo(() => {
    const mapa = new Map<string, Tarea[]>();
    for (const tarea of tareasVisibles) {
      const fecha = fechaVencimiento(tarea.vencimiento);
      if (!fecha) continue;
      const clave = claveDia(fecha);
      const lista = mapa.get(clave);
      if (lista) lista.push(tarea);
      else mapa.set(clave, [tarea]);
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => a.curso.localeCompare(b.curso, "es"));
    }
    return mapa;
  }, [tareasVisibles]);

  // Grilla que arranca el lunes de la semana del día 1 y usa solo las semanas
  // que toca el mes (4, 5 o 6): así las celdas son lo más altas posible.
  const { celdas, filas } = useMemo(() => {
    const primero = inicioDeMes(mesVisible);
    const offsetLunes = (primero.getDay() + 6) % 7;
    const diasEnMes = new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth() + 1,
      0,
    ).getDate();
    const filas = Math.ceil((offsetLunes + diasEnMes) / 7);
    const inicio = new Date(primero);
    inicio.setDate(primero.getDate() - offsetLunes);
    const celdas = Array.from({ length: filas * 7 }, (_, i) => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      return fecha;
    });
    return { celdas, filas };
  }, [mesVisible]);

  const claveHoy = claveDia(new Date());
  const mesActual = mesVisible.getMonth();

  const etiquetaMes = capitalizar(
    mesVisible.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
  );

  const totalEnMes = celdas.filter(
    (f) => f.getMonth() === mesActual && tareasPorDia.has(claveDia(f)),
  ).length;

  // Día abierto en el panel de detalle (para celdas con más tareas de las que entran).
  const [diaAbierto, setDiaAbierto] = useState<string | null>(null);
  useEffect(() => setDiaAbierto(null), [mesVisible]);

  // Cuántas pills entran por celda según el alto real de la grilla.
  const grillaRef = useRef<HTMLDivElement>(null);
  const [pillsPorCelda, setPillsPorCelda] = useState(3);
  useEffect(() => {
    const el = grillaRef.current;
    if (!el) return;
    const medir = () => {
      const altoCelda = el.clientHeight / filas;
      // ~26px se van en el número del día y el padding de la celda.
      const disponible = altoCelda - 26;
      setPillsPorCelda(Math.max(1, Math.floor(disponible / ALTO_PILL)));
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [filas]);

  function irAMes(delta: number) {
    setMesVisible((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function irAHoy() {
    setMesVisible(inicioDeMes(new Date()));
  }

  // Días del mes con tareas, para la vista agenda (mobile).
  const diasConTareas = celdas.filter(
    (f) => f.getMonth() === mesActual && tareasPorDia.has(claveDia(f)),
  );

  const fechaAbierta = diaAbierto
    ? celdas.find((f) => claveDia(f) === diaAbierto)
    : null;

  return (
    <main className="flex-1 p-6 md:h-screen md:flex md:flex-col md:overflow-hidden">
      <div className="mb-6 flex items-center justify-between gap-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {etiquetaMes}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vencimientos de tus cursos
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AgregarEventoModal />
          <a
            href="/api/tareas/ics"
            download="syllo.ics"
            title="Exportar vencimientos a Google/Apple Calendar"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:border-slate-600"
          >
            <Download size={15} />
            Exportar
          </a>
          <button
            onClick={irAHoy}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:border-slate-600"
          >
            Hoy
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => irAMes(-1)}
              title="Mes anterior"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 transition-colors cursor-pointer dark:hover:text-slate-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => irAMes(1)}
              title="Mes siguiente"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 transition-colors cursor-pointer dark:hover:text-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <>
        {/* Grilla mensual — escritorio: ocupa el alto disponible sin scroll de página */}
          <div className="hidden md:flex md:flex-1 md:min-h-0 md:flex-col">
            <div className="grid grid-cols-7 gap-1.5 mb-1.5 shrink-0">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="text-xs font-medium tracking-wider text-slate-500 dark:text-slate-400 px-1"
                >
                  {dia}
                </div>
              ))}
            </div>
            <div
              ref={grillaRef}
              className="grid grid-cols-7 gap-1.5 flex-1 min-h-0"
              style={{ gridTemplateRows: `repeat(${filas}, minmax(0, 1fr))` }}
            >
              {celdas.map((fecha) => {
                const clave = claveDia(fecha);
                const delMes = fecha.getMonth() === mesActual;
                const esHoy = clave === claveHoy;
                const tareasDia = tareasPorDia.get(clave) ?? [];
                // Si sobra solo una ranura y hay más de una tarea, esa ranura la
                // usa el "+N más" (no una pill suelta).
                const visibles =
                  tareasDia.length > pillsPorCelda
                    ? tareasDia.slice(0, Math.max(0, pillsPorCelda - 1))
                    : tareasDia;
                const ocultas = tareasDia.length - visibles.length;

                return (
                  <div
                    key={clave}
                    className={`min-h-0 overflow-hidden rounded-lg border p-1.5 flex flex-col gap-1 ${
                      delMes
                        ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                        : "border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
                    }`}
                  >
                    <span
                      className={`self-start text-xs font-medium h-6.5 min-w-5 px-2 inline-flex items-center justify-center rounded-full shrink-0 ${
                        esHoy
                          ? "bg-indigo-600 text-white"
                          : delMes
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {fecha.getDate()}
                    </span>

                    {visibles.map((tarea, i) => (
                      <PillTarea
                        key={`${clave}-${i}`}
                        tarea={tarea}
                        nombresCursos={nombresCursos}
                      />
                    ))}

                    {ocultas > 0 && (
                      <button
                        onClick={() => setDiaAbierto(clave)}
                        className="self-start shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                      >
                        +{ocultas} más
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vista agenda — mobile */}
          <div className="md:hidden flex flex-col gap-4">
            {diasConTareas.map((fecha) => {
              const clave = claveDia(fecha);
              const tareasDia = tareasPorDia.get(clave) ?? [];
              return (
                <div key={clave}>
                  <p
                    className={`text-xs font-medium tracking-wider mb-2 ${
                      clave === claveHoy
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {etiquetaDiaLargo(fecha)}
                  </p>
                  <div className="flex flex-col gap-1">
                    {tareasDia.map((tarea, i) => (
                      <PillTarea
                        key={`${clave}-${i}`}
                        tarea={tarea}
                        nombresCursos={nombresCursos}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>

      {fechaAbierta && (
        <DetalleDia
          fecha={fechaAbierta}
          tareas={tareasPorDia.get(diaAbierto!) ?? []}
          nombresCursos={nombresCursos}
          onCerrar={() => setDiaAbierto(null)}
        />
      )}
    </main>
  );
}

/** Panel flotante con todas las tareas de un día (para celdas que no las muestran todas). */
function DetalleDia({
  fecha,
  tareas,
  nombresCursos,
  onCerrar,
}: {
  fecha: Date;
  tareas: Tarea[];
  nombresCursos: string[];
  onCerrar: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 dark:bg-slate-950/40"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {etiquetaDiaLargo(fecha)}
          </p>
          <button
            onClick={onCerrar}
            title="Cerrar"
            className="shrink-0 rounded-md p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {tareas.map((tarea, i) => (
            <PillTarea key={i} tarea={tarea} nombresCursos={nombresCursos} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PillTarea({
  tarea,
  nombresCursos,
}: {
  tarea: Tarea;
  nombresCursos: string[];
}) {
  const completada = estaCompletada(tarea);
  return (
    <a
      href={tarea.link}
      target="_blank"
      rel="noreferrer"
      title={`${tarea.curso} · ${tarea.titulo}`}
      className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] leading-tight transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
        completada
          ? "text-slate-400 line-through dark:text-slate-500"
          : "text-slate-700 dark:text-slate-200"
      }`}
    >
      <span
        className={`shrink-0 h-2 w-2 rounded-full ${bgParaCurso(
          tarea.curso,
          nombresCursos,
        )} ${completada ? "opacity-50" : ""}`}
      />
      <span className="truncate">{tarea.titulo}</span>
    </a>
  );
}

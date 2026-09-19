"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFiltroCursos } from "@/features/dashboard/hooks/filtro-cursos";
import { normalizar } from "@/lib/texto";
import {
  contarCalificacionesPorCurso,
  resumirCalificaciones,
} from "../services/calificaciones";
import type { Calificacion, EstadoCalificacion } from "../types";

type Filtro = "todas" | EstadoCalificacion;

const FILTROS: Array<{ valor: Filtro; etiqueta: string }> = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "calificada", etiqueta: "Calificadas" },
  { valor: "sin_calificar", etiqueta: "Sin calificar" },
];

export default function Calificaciones({ items }: { items: Calificacion[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busqueda, setBusqueda] = useState("");
  const {
    cursosSeleccionados,
    cursosArchivados,
    renombres,
    setConteoPorCurso,
  } = useFiltroCursos();

  const conteoPorCurso = useMemo(
    () => contarCalificacionesPorCurso(items),
    [items],
  );
  useEffect(() => {
    setConteoPorCurso(conteoPorCurso);
  }, [conteoPorCurso, setConteoPorCurso]);

  const visibles = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return items.filter((item) => {
      if (cursosArchivados.includes(item.curso)) return false;
      if (
        cursosSeleccionados.length > 0 &&
        !cursosSeleccionados.includes(item.curso)
      ) {
        return false;
      }
      if (filtro !== "todas" && item.estado !== filtro) return false;
      if (!consulta) return true;
      return normalizar(
        `${item.titulo} ${item.curso} ${renombres[item.curso] ?? ""}`,
      ).includes(consulta);
    });
  }, [items, cursosArchivados, cursosSeleccionados, filtro, busqueda, renombres]);

  const resumen = useMemo(
    () =>
      resumirCalificaciones(
        items.filter(
          (item) =>
            !cursosArchivados.includes(item.curso) &&
            (cursosSeleccionados.length === 0 ||
              cursosSeleccionados.includes(item.curso)),
        ),
      ),
    [items, cursosArchivados, cursosSeleccionados],
  );

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Calificaciones
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tus trabajos corregidos y las entregas que todavía esperan una nota.
          </p>
        </header>

        <Card className="mb-6 gap-0 border border-slate-200 bg-white py-0 shadow-none dark:border-slate-700 dark:bg-slate-800">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <GraduationCap size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {resumen.calificadas === 1
                  ? "1 trabajo calificado"
                  : `${resumen.calificadas} trabajos calificados`}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {resumen.sinCalificar === 0
                  ? "No tenés entregas esperando corrección."
                  : `${resumen.sinCalificar} ${resumen.sinCalificar === 1 ? "entrega espera" : "entregas esperan"} corrección.`}
              </p>
            </div>
            {resumen.promedioPorcentual !== null && (
              <div className="border-t border-slate-200 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 dark:border-slate-700">
                <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {resumen.promedioPorcentual}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Promedio con puntaje
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar calificaciones">
            {FILTROS.map((opcion) => (
              <Button
                key={opcion.valor}
                type="button"
                variant={filtro === opcion.valor ? "default" : "outline"}
                size="sm"
                aria-pressed={filtro === opcion.valor}
                onClick={() => setFiltro(opcion.valor)}
                className={
                  filtro === opcion.valor
                    ? "shadow-sm"
                    : "text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }
              >
                {opcion.etiqueta}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar trabajo o curso…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="space-y-3" aria-live="polite">
          {visibles.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/40 px-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <GraduationCap size={26} className="mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-medium text-slate-700 dark:text-slate-200">
                No hay calificaciones con estos filtros
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Cuando un docente devuelva una entrega corregida, va a aparecer acá.
              </p>
            </div>
          ) : (
            visibles.map((item) => (
              <CalificacionItem
                key={item.id}
                item={item}
                curso={renombres[item.curso] || item.curso}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function CalificacionItem({ item, curso }: { item: Calificacion; curso: string }) {
  const calificada = item.estado === "calificada";
  const porcentaje =
    item.puntosObtenidos !== null &&
    item.puntosMaximos !== null &&
    item.puntosMaximos > 0
      ? Math.round((item.puntosObtenidos / item.puntosMaximos) * 100)
      : null;

  return (
    <Card className="gap-0 border border-slate-200 bg-white py-0 shadow-none transition-colors hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            calificada
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
          }`}
        >
          {calificada ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {curso}
            </Badge>
            {item.entregaTarde && (
              <Badge variant="outline" className="text-amber-700 dark:text-amber-300">
                Entrega tardía
              </Badge>
            )}
          </div>
          <h2 className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
            {item.titulo}
          </h2>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:min-w-36 sm:justify-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 dark:border-slate-700">
          <div className="text-right">
            {calificada ? (
              <>
                <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {item.puntosObtenidos}
                  {item.puntosMaximos !== null && (
                    <span className="text-sm font-normal text-slate-400">
                      {` / ${item.puntosMaximos}`}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {porcentaje !== null ? `${porcentaje}%` : "Calificada"}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Sin calificar
              </p>
            )}
          </div>
          {item.link && (
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={
                <a href={item.link} target="_blank" rel="noreferrer noopener" />
              }
              aria-label={`Abrir ${item.titulo} en Classroom`}
            >
              <ExternalLink size={15} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

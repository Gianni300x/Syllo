"use client";

import { useMemo, useState } from "react";
import { Bell, CalendarClock, ExternalLink, GraduationCap, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ConexionCvg from "@/features/cvg/components/conexion-cvg";
import type { EstadoCalendarioCvg } from "@/features/cvg/types";
import { useFiltroCursos } from "@/features/dashboard/hooks/filtro-cursos";
import { normalizar } from "@/lib/texto";
import type { Novedad, OrigenNovedad } from "../types";

type FiltroOrigen = "Todos" | OrigenNovedad;

export default function Novedades({
  anuncios,
  eventosCvg,
  estadoCvg,
  permisoClassroom,
  errorClassroom,
  reconectarAction,
}: {
  anuncios: Novedad[];
  eventosCvg: Novedad[];
  estadoCvg: EstadoCalendarioCvg;
  permisoClassroom: boolean;
  errorClassroom: boolean;
  reconectarAction: () => Promise<void>;
}) {
  const [origen, setOrigen] = useState<FiltroOrigen>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const { cursosSeleccionados, cursosArchivados, renombres } = useFiltroCursos();

  const novedades = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const desde = hoy.getTime() - 24 * 60 * 60 * 1000;
    const fechas = eventosCvg
      .filter((item) => new Date(item.fecha).getTime() >= desde)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 30);
    const anunciosOrdenados = [...anuncios].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    return [...fechas, ...anunciosOrdenados];
  }, [anuncios, eventosCvg]);

  const filtradas = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return novedades.filter((novedad) => {
      if (origen !== "Todos" && novedad.origen !== origen) return false;
      if (novedad.curso && cursosArchivados.includes(novedad.curso)) return false;
      if (
        cursosSeleccionados.length > 0 &&
        novedad.curso &&
        !cursosSeleccionados.includes(novedad.curso)
      ) {
        return false;
      }
      if (!consulta) return true;
      return normalizar(
        `${novedad.titulo} ${novedad.resumen} ${novedad.curso ?? ""}`,
      ).includes(consulta);
    });
  }, [novedades, origen, busqueda, cursosArchivados, cursosSeleccionados]);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Novedades
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Anuncios de Classroom y próximas fechas del CVG, sin acceder a tu correo.
          </p>
        </header>

        <div className="mb-6">
          <ConexionCvg estado={estadoCvg} />
        </div>

        {permisoClassroom && (
          <Card className="mb-6 border border-indigo-200 bg-indigo-50/70 py-0 shadow-none dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Falta activar los anuncios de Classroom
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Volvé a aceptar los permisos para reemplazar Gmail por el acceso directo a anuncios.
                </p>
              </div>
              <form action={reconectarAction}>
                <Button type="submit" className="w-full sm:w-auto">
                  Reconectar Classroom
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {errorClassroom && (
          <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            Classroom no respondió. Podés seguir viendo las fechas del CVG y probar nuevamente con “Actualizar datos”.
          </p>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filtrar novedades por origen"
            className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto"
          >
            {(["Todos", "Classroom", "CVG"] as const).map((opcion) => {
              const activo = origen === opcion;
              return (
                <Button
                  key={opcion}
                  type="button"
                  size="default"
                  variant={activo ? "default" : "outline"}
                  aria-pressed={activo}
                  onClick={() => setOrigen(opcion)}
                  className={
                    activo
                      ? "shadow-sm"
                      : "text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }
                >
                  {opcion}
                </Button>
              );
            })}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por anuncio, fecha o curso…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="space-y-3" aria-live="polite">
          {filtradas.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/40 px-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <Bell size={24} className="mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-medium text-slate-700 dark:text-slate-200">
                No hay novedades con estos filtros
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Cuando aparezca un anuncio o una fecha nueva, la vas a encontrar acá.
              </p>
            </div>
          ) : (
            filtradas.map((novedad) => (
              <NovedadItem
                key={novedad.id}
                novedad={novedad}
                curso={
                  novedad.curso
                    ? renombres[novedad.curso] || novedad.curso
                    : null
                }
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function NovedadItem({ novedad, curso }: { novedad: Novedad; curso: string | null }) {
  const esCvg = novedad.origen === "CVG";
  const contenido = (
    <Card className="gap-0 border border-slate-200 bg-white py-0 shadow-none transition-colors hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500">
      <CardContent className="flex gap-3 p-4 sm:p-5">
        <span
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
            esCvg
              ? "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
              : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
          }`}
        >
          {esCvg ? <CalendarClock size={18} /> : <GraduationCap size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {novedad.origen}
            </Badge>
            {curso && (
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {curso}
              </span>
            )}
            <time className="ml-auto shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {formatearFecha(novedad.fecha, esCvg)}
            </time>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <h2 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
              {novedad.titulo}
            </h2>
            {novedad.link && <ExternalLink size={14} className="mt-0.5 shrink-0 text-slate-400" />}
          </div>
          {novedad.resumen && novedad.resumen !== novedad.titulo && (
            <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {novedad.resumen}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!novedad.link) return contenido;
  return (
    <a href={novedad.link} target="_blank" rel="noreferrer noopener" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      {contenido}
    </a>
  );
}

function formatearFecha(iso: string, soloDia: boolean): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    ...(soloDia ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
}

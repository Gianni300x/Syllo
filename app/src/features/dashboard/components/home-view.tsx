"use client";

import { useEffect, useMemo } from "react";
import { motion, Variants } from "motion/react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Mail, 
  NotebookPen, 
  ListChecks, 
  ArrowRight,
  Sun
} from "lucide-react";
import { Tarea, claveTarea, estaCompletada } from "@/features/tareas/services/classroom";
import { Correo } from "@/features/correos/services/correos";
import { Nota, fechaRelativa } from "@/features/notas/services/notas";
import {
  contarPendientesPorCurso,
  ordenarPorPrioridad,
} from "@/features/tareas/services/tareas-service";
import { useFiltroCursos } from "../hooks/filtro-cursos";
import { MiniCalendar } from "@/features/calendario/components/mini-calendar";
import ControlesTarea from "@/features/tareas/components/controles-tarea";

export default function HomeView({
  tareas,
  eventos,
  correos,
  notas,
  usuario
}: {
  tareas: Tarea[];
  eventos: Tarea[];
  correos: Correo[];
  notas: Nota[];
  usuario: { name?: string | null; email?: string | null; image?: string | null } | undefined;
}) {
  const { cursosArchivados, cursosSeleccionados, setConteoPorCurso } =
    useFiltroCursos();
  const nombreFila = usuario?.name?.split(" ")[0] || "Estudiante";

  /**
   * Mismo criterio que Tareas y Calendario: primero salen los cursos
   * archivados, después se aplica la selección del sidebar. Sin esto el
   * resumen de Inicio seguía mostrando materias que el usuario ya archivó.
   */
  const visibles = useMemo(() => {
    const filtrar = (lista: Tarea[]) => {
      const activas = lista.filter((t) => !cursosArchivados.includes(t.curso));
      return cursosSeleccionados.length === 0
        ? activas
        : activas.filter((t) => cursosSeleccionados.includes(t.curso));
    };
    return { tareas: filtrar(tareas), eventos: filtrar(eventos) };
  }, [tareas, eventos, cursosArchivados, cursosSeleccionados]);

  const correosVisibles = useMemo(
    () =>
      correos.filter((c) => !c.curso || !cursosArchivados.includes(c.curso)),
    [correos, cursosArchivados],
  );

  // Publica el conteo de pendientes por curso al Sidebar compartido, igual que
  // hacen Tareas y Correos en sus propias secciones.
  const conteoPendientes = useMemo(
    () => contarPendientesPorCurso(visibles.tareas),
    [visibles.tareas],
  );
  useEffect(() => {
    setConteoPorCurso(conteoPendientes);
  }, [conteoPendientes, setConteoPorCurso]);

  const tareasPendientes = visibles.tareas.filter((t) => !estaCompletada(t));
  // Lo que el alumno fijó encabeza el resumen del día; después, por entrega.
  const ultimasTareas = ordenarPorPrioridad(tareasPendientes).slice(0, 4);

  const correosNoLeidos = correosVisibles.filter((c) => !c.leido);
  const ultimosCorreos = correosNoLeidos.slice(0, 4);

  const ultimasNotas = notas.slice(0, 4);

  const stats = [
    {
      titulo: "Tareas Pendientes",
      valor: tareasPendientes.length,
      icono: <ListChecks size={20} className="text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-500/20",
      link: "/dashboard/tareas"
    },
    {
      titulo: "Sin leer (recientes)",
      valor: correosNoLeidos.length,
      icono: <Mail size={20} className="text-amber-600 dark:text-amber-400" />,
      bg: "bg-amber-50 dark:bg-amber-500/20",
      link: "/dashboard/correos"
    },
    {
      titulo: "Notas Guardadas",
      valor: notas.length,
      icono: <NotebookPen size={20} className="text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50 dark:bg-emerald-500/20",
      link: "/dashboard/notas"
    }
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.5 } }
  };

  return (
    <main className="p-6 sm:p-8 max-w-6xl mx-auto min-h-screen pt-12 sm:pt-16">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.header variants={item} className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            ¡Hola, {nombreFila}! <Sun className="text-amber-500" size={28} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Aquí tienes un resumen de tu actividad reciente.
          </p>
        </motion.header>

        {/* Mini Calendar Preview */}
        <motion.div variants={item}>
          <MiniCalendar tareas={[...visibles.tareas, ...visibles.eventos]} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {stats.map((stat, i) => (
            <Link 
              key={i} 
              href={stat.link}
              className="block p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  {stat.icono}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.titulo}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {stat.valor}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tareas */}
          <motion.section variants={item} className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListChecks size={18} className="text-indigo-500" /> Tareas
              </h2>
              <Link href="/dashboard/tareas" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 dark:text-indigo-400 dark:hover:text-indigo-300">
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 flex-1">
              {ultimasTareas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-slate-200 border-dashed rounded-xl bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 text-slate-500">
                  <CheckCircle2 size={24} className="mb-2 text-slate-300 dark:text-slate-600" />
                  <span className="text-sm">Todo al día</span>
                </div>
              ) : (
                ultimasTareas.map((tarea, i) => (
                  // Link estirado para que los controles de estado sean
                  // hermanos del link y no vayan anidados adentro.
                  <div
                    key={claveTarea(tarea) ?? i}
                    className={`group relative flex items-center gap-2 p-4 bg-white border rounded-xl transition-colors hover:border-indigo-300 dark:bg-slate-800 ${
                      tarea.fijada
                        ? "border-amber-300 dark:border-amber-500/60"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 truncate">
                        <Link
                          href={tarea.link}
                          target="_blank"
                          rel="noreferrer"
                          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500"
                        >
                          {tarea.titulo}
                        </Link>
                      </p>
                      <p className="text-xs text-slate-500 truncate">{tarea.curso}</p>
                    </div>
                    <ControlesTarea tarea={tarea} />
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Correos */}
          <motion.section variants={item} className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mail size={18} className="text-amber-500" /> Correos
              </h2>
              <Link href="/dashboard/correos" className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 dark:text-amber-400 dark:hover:text-amber-300">
                Bandeja <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 flex-1">
              {ultimosCorreos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-slate-200 border-dashed rounded-xl bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 text-slate-500">
                  <CheckCircle2 size={24} className="mb-2 text-slate-300 dark:text-slate-600" />
                  <span className="text-sm">Sin correos nuevos</span>
                </div>
              ) : (
                ultimosCorreos.map((correo) => (
                  <Link href={`/dashboard/correos?id=${correo.id}`} key={correo.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-colors block dark:bg-slate-800 dark:border-slate-700">
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 truncate">{correo.asunto || "(Sin asunto)"}</p>
                    <p className="text-xs text-slate-500 truncate">{correo.remitente}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.section>

          {/* Notas */}
          <motion.section variants={item} className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <NotebookPen size={18} className="text-emerald-500" /> Notas
              </h2>
              <Link href="/dashboard/notas" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 dark:text-emerald-400 dark:hover:text-emerald-300">
                Ir a notas <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 flex-1">
              {ultimasNotas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-slate-200 border-dashed rounded-xl bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 text-slate-500">
                  <span className="text-sm">Aún no has creado notas</span>
                </div>
              ) : (
                ultimasNotas.map((nota) => (
                  <Link href={`/dashboard/notas?id=${nota.id}`} key={nota.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors block dark:bg-slate-800 dark:border-slate-700">
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 truncate">{nota.titulo || "(Sin título)"}</p>
                    <p suppressHydrationWarning className="text-xs text-slate-500 truncate">{fechaRelativa(nota.updatedAt)}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.section>

        </div>
      </motion.div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import {
  Tarea,
  estaCompletada,
  fechaVencimiento,
  claveTarea,
  cuentaRegresivaEvento,
  diasHastaVencimiento,
} from "@/features/tareas/services/classroom";
import NuevoEventoModal from "./nuevo-evento-modal";
import { Button } from "@/components/ui/button";

export function MiniCalendar({ tareas }: { tareas: Tarea[] }) {
  // Estable entre renders: un `new Date()` suelto cambia la identidad de las
  // dependencias y los `useMemo` de abajo se recalculan siempre.
  const hoy = useMemo(() => new Date(), []);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const diasMes = useMemo(() => {
    const year = hoy.getFullYear();
    const month = hoy.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    
    // Rellenar días anteriores para que el calendario empiece en lunes (1) o domingo (0)
    
    const primerDiaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
    
    const dias = [];
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fechaDia = new Date(year, month, d);
      
      // Contar tareas que vencen este día
      const tareasDelDia = tareas.filter(t => {
        const v = fechaVencimiento(t.vencimiento);
        if (!v) return false;
        return v.getDate() === d && v.getMonth() === month && v.getFullYear() === year;
      });
      const diaSemana = fechaDia.getDay();
      const diasCortos = ["D", "L", "M", "M", "J", "V", "S"];
      
      dias.push({
        numero: d,
        diaSemana: diaSemana,
        nombreDiaCorto: diasCortos[diaSemana],
        esHoy: d === hoy.getDate(),
        tareasPendientes: tareasDelDia.filter((t) => !estaCompletada(t)).length,
        tareasCompletadas: tareasDelDia.filter(estaCompletada).length,
      });
    }
    return dias;
  }, [tareas, hoy]);

  const tareasDelMesLista = useMemo(() => {
    return tareas.filter(t => {
      const v = fechaVencimiento(t.vencimiento);
      if (!v) return false;
      return v.getMonth() === hoy.getMonth() && v.getFullYear() === hoy.getFullYear();
    }).sort((a, b) => {
      return (fechaVencimiento(a.vencimiento)?.getTime() || 0) - (fechaVencimiento(b.vencimiento)?.getTime() || 0);
    });
  }, [tareas, hoy]);

  const proximoEvento = useMemo(() => {
    return tareasDelMesLista.find((t) => {
      if (estaCompletada(t)) return false;
      const d = diasHastaVencimiento(t.vencimiento);
      return d !== null && d >= 0;
    });
  }, [tareasDelMesLista]);

  const cuentaProximo = useMemo(() => {
    if (!proximoEvento) return null;
    return cuentaRegresivaEvento(proximoEvento.vencimiento, false);
  }, [proximoEvento]);

  const nombreMes = useMemo(() => {
    const mes = hoy.toLocaleDateString("es-AR", { month: "long" });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }, [hoy]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8 dark:bg-slate-800 dark:border-slate-700 mb-10 w-full flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-stretch justify-between">
      
      {/* Lado Izquierdo: Resumen de Eventos/Tareas */}
      <div className="flex-1 flex flex-col w-full h-full md:pr-8 md:border-r border-slate-100 dark:border-slate-700/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xl">
            Eventos de {nombreMes}
          </h3>      
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {cuentaProximo
            ? cuentaProximo.dias === 0
              ? `Hoy es tu próximo evento: ${proximoEvento?.titulo || "actividad"}.`
              : cuentaProximo.dias === 1
                ? `Falta 1 día para tu próximo evento: ${proximoEvento?.titulo || "actividad"}.`
                : `Faltan ${cuentaProximo.dias} días para tu próximo evento (${proximoEvento?.titulo || "actividad"}).`
            : "Próximas entregas y actividades del mes."}
        </p>

        <div className="flex flex-col gap-3 flex-1 justify-center">
          {tareasDelMesLista.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {tareasDelMesLista.slice(0, 4).map((t, idx) => {
                const fecha = fechaVencimiento(t.vencimiento);
                const dia = fecha ? fecha.getDate() : "?";
                const isCompletada = estaCompletada(t);
                const cuenta = cuentaRegresivaEvento(t.vencimiento, isCompletada);
                
                return (
                  <li key={claveTarea(t) ?? t.eventoId ?? idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${isCompletada ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                      {dia}
                    </div>
                    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {t.titulo}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {t.curso}
                      </span>
                    </div>
                    {cuenta && (
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            cuenta.tipo === "completado"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : cuenta.tipo === "hoy"
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-semibold"
                                : cuenta.tipo === "manana"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-semibold"
                                  : cuenta.tipo === "pasado"
                                    ? "text-slate-400 dark:text-slate-500"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
                          }`}
                        >
                          {cuenta.tipo === "completado" ? (
                            <CheckCircle2 size={11} className="shrink-0" />
                          ) : (
                            <Clock size={11} className="shrink-0 opacity-70" />
                          )}
                          <span>{cuenta.texto}</span>
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
              {tareasDelMesLista.length > 4 && (
                <div className="text-center mt-2">
                  <Link
                    href="/dashboard/calendario"
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Ver {tareasDelMesLista.length - 4} eventos más…
                  </Link>
                </div>
              )}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-800/20 min-h-[200px]">
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No tienes eventos ni tareas para este mes.</p>
               <Button onClick={() => setModalAbierto(true)} size="lg" className="rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M10 16h4"/><path d="M12 14v4"/></svg>
                  Agregar Evento
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lado Derecho: Calendario Mini Clásico Agrandado */}
      <div className="w-full max-w-[340px] shrink-0">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {nombreMes} {hoy.getFullYear()}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
             <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Pend.
             <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span> Comp.
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1.5">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={`head-${i}`} className="text-center text-xs font-bold text-slate-400 mb-2">
              {d}
            </div>
          ))}
          
          {diasMes.map((dia, idx) => {
            const isWeekend = dia && (dia.diaSemana === 0 || dia.diaSemana === 6);
            
            return (
              <div 
                key={idx} 
                className={`
                  relative aspect-square flex items-center justify-center rounded-xl text-sm
                  ${!dia ? 'opacity-0' : isWeekend ? 'bg-slate-50 dark:bg-slate-800/40' : 'bg-slate-100 dark:bg-slate-700/60'}
                  ${dia?.esHoy ? 'ring-2 ring-indigo-500 bg-white dark:bg-slate-800 font-bold shadow-sm' : 'font-medium'}
                  ${dia ? 'hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors cursor-default' : ''}
                `}
              >
                {dia && (
                  <>
                    <span className={`${dia.esHoy ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {dia.numero}
                    </span>
                    
                    {/* Puntitos de colores */}
                    <div className="absolute bottom-1.5 flex gap-1">
                      {dia.tareasCompletadas > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
                      )}
                      {dia.tareasPendientes > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <NuevoEventoModal open={modalAbierto} onCerrar={() => setModalAbierto(false)} />
    </div>
  );
}

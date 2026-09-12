import { useMemo } from "react";
import { Tarea, fechaVencimiento } from "../lib/classroom";

export function MiniCalendar({ tareas }: { tareas: Tarea[] }) {
  const hoy = new Date();
  
  const diasMes = useMemo(() => {
    const year = hoy.getFullYear();
    const month = hoy.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    
    // Rellenar días anteriores para que el calendario empiece en lunes (1) o domingo (0)
    // En Argentina es común empezar en Domingo o Lunes. Vamos a usar Lunes.
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
        tareasPendientes: tareasDelDia.filter(t => !["TURNED_IN", "RETURNED"].includes(t.estado)).length,
        tareasCompletadas: tareasDelDia.filter(t => ["TURNED_IN", "RETURNED"].includes(t.estado)).length,
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

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8 dark:bg-slate-800 dark:border-slate-700 mb-10 w-full flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-stretch justify-between">
      
      {/* Lado Izquierdo: Resumen de Eventos/Tareas */}
      <div className="flex-1 flex flex-col w-full h-full md:pr-8 md:border-r border-slate-100 dark:border-slate-700/50">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xl mb-1">
          Eventos de {meses[hoy.getMonth()]}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Próximas entregas y actividades del mes.
        </p>

        <div className="flex flex-col gap-3 flex-1 justify-center">
          {tareasDelMesLista.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {tareasDelMesLista.slice(0, 4).map((t, idx) => {
                const fecha = fechaVencimiento(t.vencimiento);
                const dia = fecha ? fecha.getDate() : "?";
                const isCompletada = ["TURNED_IN", "RETURNED"].includes(t.estado);
                
                return (
                  <li key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${isCompletada ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                      {dia}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {t.titulo}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t.curso}
                      </span>
                    </div>
                  </li>
                );
              })}
              {tareasDelMesLista.length > 4 && (
                <div className="text-center mt-2">
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                    Ver {tareasDelMesLista.length - 4} eventos más...
                  </span>
                </div>
              )}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-800/20 min-h-[200px]">
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No tienes eventos ni tareas para este mes.</p>
               <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M10 16h4"/><path d="M12 14v4"/></svg>
                  Agregar Evento
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Lado Derecho: Calendario Mini Clásico Agrandado */}
      <div className="w-full max-w-[340px] shrink-0">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {meses[hoy.getMonth()]} {hoy.getFullYear()}
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
    </div>
  );
}

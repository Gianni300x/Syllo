import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton de Inicio: sigue la geometría de `home-view.tsx`. */
export default function CargandoInicio() {
  return (
    <main className="p-6 sm:p-8 max-w-6xl mx-auto min-h-screen pt-12 sm:pt-16">
      <div className="mb-12">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      </div>

      {/* Mini calendario */}
      <Skeleton className="mb-10 h-72 rounded-2xl border border-slate-200 dark:border-slate-700" />

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[88px] rounded-2xl border border-slate-200 dark:border-slate-700"
          />
        ))}
      </div>

      {/* Tareas / Correos / Notas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, columna) => (
          <div key={columna} className="flex flex-col">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[74px] rounded-xl border border-slate-200 dark:border-slate-700"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

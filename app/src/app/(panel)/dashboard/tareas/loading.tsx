import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoTareas() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl border border-slate-200 dark:border-slate-700" />
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </main>
  );
}

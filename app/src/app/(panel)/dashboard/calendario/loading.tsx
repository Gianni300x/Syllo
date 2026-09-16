import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoCalendario() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </main>
  );
}

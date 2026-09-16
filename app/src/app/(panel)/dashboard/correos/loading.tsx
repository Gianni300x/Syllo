import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoCorreos() {
  return (
    <main className="flex-1 p-8 min-w-0">
      <div className="mb-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      <div className="flex gap-3 mb-6">
        <Skeleton className="h-9 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        <div className="lg:col-span-2 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
        <Skeleton className="lg:col-span-3 h-96 rounded-xl border border-dashed border-slate-300 dark:border-slate-700" />
      </div>
    </main>
  );
}

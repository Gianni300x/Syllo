import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoNotas() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    </main>
  );
}

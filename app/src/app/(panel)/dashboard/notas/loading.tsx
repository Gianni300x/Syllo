export default function CargandoNotas() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
        <div className="mt-2 h-4 w-40 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-xl border border-slate-200 bg-white animate-pulse dark:border-slate-700 dark:bg-slate-800"
          />
        ))}
      </div>
    </main>
  );
}

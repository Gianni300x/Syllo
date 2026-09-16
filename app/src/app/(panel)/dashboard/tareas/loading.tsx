export default function CargandoTareas() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <div className="h-6 w-48 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
        <div className="mt-2 h-4 w-32 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-slate-200 bg-white animate-pulse dark:border-slate-700 dark:bg-slate-800"
          />
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-700" />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-slate-200 bg-white animate-pulse dark:border-slate-700 dark:bg-slate-800"
          />
        ))}
      </div>
    </main>
  );
}

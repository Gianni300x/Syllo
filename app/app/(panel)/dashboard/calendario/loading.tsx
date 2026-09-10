export default function CargandoCalendario() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
        <div className="h-9 w-32 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg border border-slate-200 bg-white animate-pulse dark:border-slate-700 dark:bg-slate-800"
          />
        ))}
      </div>
    </main>
  );
}

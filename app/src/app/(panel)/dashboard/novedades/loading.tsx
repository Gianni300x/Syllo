export default function LoadingNovedades() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Cargando novedades">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mb-2 h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-6 h-4 w-80 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-6 h-32 rounded-xl bg-white dark:bg-slate-800" />
        <div className="mb-5 flex gap-3">
          <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="ml-auto h-9 w-80 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-xl bg-white dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </main>
  );
}

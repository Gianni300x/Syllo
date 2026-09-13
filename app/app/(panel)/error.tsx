"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Límite de error del panel. Sin esto, un fallo de Classroom o Gmail dentro de
 * un Server Component le mostraba al usuario la pantalla cruda de Next.
 * Mismo lenguaje visual que `LimiteGmail` en `dashboard/correos/page.tsx`.
 */
export default function ErrorDelPanel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en el panel:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Algo se rompió de este lado
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          No pudimos cargar esta sección. Suele ser un problema momentáneo con
          Google: probá de nuevo en unos segundos.
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <RefreshCw size={15} />
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Ir a Inicio
          </Link>
        </div>

        {error.digest && (
          <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[11px] text-slate-400 dark:text-slate-500">
            {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

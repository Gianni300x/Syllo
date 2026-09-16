"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus, Check, Copy, Download, Loader2, RefreshCw, X } from "lucide-react";
import {
  obtenerLinkFeed,
  regenerarLinkFeed,
} from "@/features/calendario/services/feed-actions";

const MENSAJES: Record<string, string> = {
  no_autenticado: "Se cerró tu sesión. Volvé a entrar y probá de nuevo.",
  error_db: "No pudimos generar el link. Probá de nuevo en un momento.",
};

/**
 * Suscripción al calendario de Syllo.
 *
 * Antes esto era un `<a download>`: una foto de los vencimientos que había que
 * volver a bajar a mano. Ahora entrega una URL que Google y Apple consultan
 * solas cada unas horas, que es lo que hace que los recordatorios aparezcan en
 * el celular sin abrir la app. La descarga de una vez sigue estando abajo.
 */
export default function SuscribirCalendarioModal() {
  const [abierto, setAbierto] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  /**
   * El token se crea recién acá, al abrir: nadie que no haya pedido el feed
   * termina con un link vivo colgando de su cuenta.
   */
  async function abrir() {
    setAbierto(true);
    if (url) return;
    setCargando(true);
    setError(null);
    const resultado = await obtenerLinkFeed();
    if (resultado.url) setUrl(resultado.url);
    else setError(MENSAJES[resultado.error ?? ""] ?? MENSAJES.error_db);
    setCargando(false);
  }

  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(id);
  }, [copiado]);

  useEffect(() => {
    if (!abierto) return;
    function alTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierto]);

  async function copiar() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      setError("Tu navegador no nos dejó copiar. Seleccioná el link a mano.");
    }
  }

  async function regenerar() {
    setCargando(true);
    setError(null);
    const resultado = await regenerarLinkFeed();
    if (resultado.url) setUrl(resultado.url);
    else setError(MENSAJES[resultado.error ?? ""] ?? MENSAJES.error_db);
    setCargando(false);
  }

  /** `webcal://` hace que Apple Calendar y Outlook abran la suscripción solos. */
  const webcal = url ? url.replace(/^https?:\/\//, "webcal://") : null;

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        title="Suscribir tu calendario a los vencimientos de Syllo"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
      >
        <CalendarPlus size={15} />
        Suscribirse
      </button>

      <AnimatePresence>
        {abierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setAbierto(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] dark:bg-slate-950/60"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-suscribir"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h2
                  id="titulo-suscribir"
                  className="text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                  Suscribirte al calendario
                </h2>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  title="Cerrar"
                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Pegá este link en tu calendario y tus entregas aparecen solas,
                  con un recordatorio el día anterior. Se actualiza cada unas
                  horas, sin que tengas que volver a bajar nada.
                </p>

                <div className="flex flex-col gap-2">
                  <div className="flex items-stretch gap-2">
                    <input
                      readOnly
                      value={url ?? ""}
                      placeholder={cargando ? "Generando tu link…" : ""}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Link de tu calendario"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={copiar}
                      disabled={!url}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                      {copiado ? <Check size={15} /> : <Copy size={15} />}
                      {copiado ? "Copiado" : "Copiar"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cualquiera con este link puede ver tus vencimientos, así que
                    no lo compartas.
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
                  <Paso titulo="Google Calendar">
                    En la computadora: <strong>Otros calendarios</strong> → <strong>+</strong> →{" "}
                    <strong>Desde URL</strong>, y pegá el link.
                  </Paso>
                  <Paso titulo="iPhone o Mac">
                    {webcal ? (
                      <>
                        Abrí{" "}
                        <a
                          href={webcal}
                          className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          este link
                        </a>{" "}
                        y confirmá la suscripción.
                      </>
                    ) : (
                      "Abrí el link desde el celular y confirmá la suscripción."
                    )}
                  </Paso>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <a
                    href="/api/tareas/ics"
                    download="syllo.ics"
                    className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Download size={14} />
                    Descargar el .ics una vez
                  </a>
                  <button
                    type="button"
                    onClick={regenerar}
                    disabled={cargando}
                    title="Genera un link nuevo y apaga el anterior"
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {cargando ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Generar un link nuevo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Paso({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {titulo}
      </p>
      <p className="text-slate-600 dark:text-slate-400">{children}</p>
    </div>
  );
}

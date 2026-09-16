"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  MAX_TITULO,
  contarNotasPorCurso,
  contenidoComoHtml,
  estaVacio,
  fechaRelativa,
  filtrarNotas,
  nombreArchivoMd,
  notaAMarkdown,
  resumen,
  tituloMostrado,
  type Nota,
} from "@/features/notas/services/notas";
import { capitalizar } from "@/app/lib/fechas";
import { useFiltroCursos } from "@/app/(panel)/filtro-cursos";
import { colorParaCurso } from "@/app/components/sidebar";
import EditorRico from "./editor-rico";
import type { ResultadoNota } from "@/features/notas/services/actions";

type AccionNota = (
  prev: ResultadoNota,
  formData: FormData,
) => Promise<ResultadoNota>;

const MENSAJES_ERROR: Record<string, string> = {
  no_autenticado: "Se cerró tu sesión. Volvé a entrar.",
  nota_vacia: "Escribí un título o algo de contenido.",
  titulo_muy_largo: "El título es demasiado largo.",
  contenido_muy_largo: "La nota es demasiado larga.",
  curso_invalido: "Ese curso no es válido.",
  falta_id: "No se pudo guardar. Probá de nuevo.",
  nota_no_encontrada: "No encontramos esa nota.",
  error_db: "No se pudo guardar. Probá de nuevo.",
};

function mensajeError(codigo?: string): string | null {
  if (!codigo) return null;
  return MENSAJES_ERROR[codigo] ?? "Algo salió mal. Probá de nuevo.";
}

const INICIAL: ResultadoNota = {};

/** Descarga la nota en formato Markdown (.md) en el navegador del cliente. */
function descargarNota(nota: Nota) {
  const markdown = notaAMarkdown(nota);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreArchivoMd(nota.titulo || "nota")}.md`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/**
 * Comparte la nota con la API nativa de compartir del navegador (Web Share API).
 * Si no está disponible o falla, copia el markdown al portapapeles.
 */
async function compartirONotificar(nota: Nota, alCopiar: () => void) {
  const markdown = notaAMarkdown(nota);
  const titulo = nota.titulo.trim() || "Nota";

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: titulo,
        text: markdown,
      });
      return;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(markdown);
      alCopiar();
    } catch (err) {
      console.error("No se pudo copiar al portapapeles:", err);
    }
  }
}

export default function Notas({
  notas,
  crearNota,
  editarNota,
  eliminarNota,
}: {
  notas: Nota[];
  crearNota: AccionNota;
  editarNota: AccionNota;
  eliminarNota: AccionNota;
}) {
  // `null` = lista general de notas · `"nueva"` = creando · id = nota seleccionada
  const [abierta, setAbierta] = useState<string | null>(null);
  // `"lectura"` = visor de solo lectura · `"edicion"` = formulario de edición
  const [modo, setModo] = useState<"lectura" | "edicion">("lectura");
  const [busqueda, setBusqueda] = useState("");

  const { cursos, cursosSeleccionados, setConteoPorCurso, renombres } =
    useFiltroCursos();

  // Publica el conteo por curso al Sidebar compartido, igual que hacen Tareas,
  // Correos e Inicio.
  const conteoPorCurso = useMemo(
    () => contarNotasPorCurso(notas),
    [notas],
  );
  useEffect(() => {
    setConteoPorCurso(conteoPorCurso);
  }, [conteoPorCurso, setConteoPorCurso]);

  const visibles = useMemo(
    () => filtrarNotas(notas, cursosSeleccionados, busqueda, renombres),
    [notas, cursosSeleccionados, busqueda, renombres],
  );

  const hoy = capitalizar(
    new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );

  const notaSeleccionada =
    abierta && abierta !== "nueva"
      ? notas.find((n) => n.id === abierta) ?? null
      : null;

  const handleVolverALista = () => {
    setAbierta(null);
  };

  const handleAbrirNueva = () => {
    setAbierta("nueva");
    setModo("edicion");
  };

  const handleAbrirNota = (id: string) => {
    setAbierta(id);
    setModo("lectura");
  };

  useEffect(() => {
    function alTecla(e: KeyboardEvent) {
      if (e.key === "Escape" && abierta !== null) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
          target?.blur();
          return;
        }
        if (modo === "edicion" && abierta !== "nueva") {
          setModo("lectura");
        } else {
          setAbierta(null);
        }
      }
    }
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierta, modo]);

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 min-h-0">
      <AnimatePresence mode="wait">
        {abierta === null ? (
          <motion.div
            key="lista-notas"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {/* El título dice qué filtro está puesto, igual que en Tareas. */}
                    {cursosSeleccionados.length === 0
                      ? "Notas"
                      : cursosSeleccionados.length === 1
                        ? renombres[cursosSeleccionados[0]] || cursosSeleccionados[0]
                        : `${cursosSeleccionados.length} cursos seleccionados`}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{hoy}</p>
                </div>
                <button
                  onClick={handleAbrirNueva}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Plus size={16} />
                  Nueva nota
                </button>
              </div>

              {/* Las notas ya están todas en el cliente: la búsqueda es en memoria. */}
              <div className="relative mt-4 sm:max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setBusqueda("");
                  }}
                  placeholder="Buscar en tus notas…"
                  aria-label="Buscar en tus notas"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {notas.length === 0 ? (
              <EstadoVacio onNueva={handleAbrirNueva} />
            ) : visibles.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                {busqueda
                  ? `Sin resultados para "${busqueda}".`
                  : "No hay notas en los cursos seleccionados."}
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibles.map((nota) => (
                  <li key={nota.id}>
                    <TarjetaNota
                      nota={nota}
                      activa={false}
                      onAbrir={() => handleAbrirNota(nota.id)}
                      eliminarNota={eliminarNota}
                      cursos={cursos}
                      renombres={renombres}
                    />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`detalle-${abierta}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex flex-1 flex-col w-full h-full min-h-0"
          >
            {abierta === "nueva" || (modo === "edicion" && notaSeleccionada) ? (
              <EditorNota
                key={abierta}
                nota={notaSeleccionada}
                accion={notaSeleccionada ? editarNota : crearNota}
                onVolverALista={handleVolverALista}
                onVolverALectura={
                  notaSeleccionada ? () => setModo("lectura") : undefined
                }
                cursos={cursos}
                cursoSugerido={
                  cursosSeleccionados.length === 1 ? cursosSeleccionados[0] : null
                }
                renombres={renombres}
              />
            ) : notaSeleccionada ? (
              <VisorNota
                key={abierta}
                nota={notaSeleccionada}
                onVolverALista={handleVolverALista}
                onEditar={() => setModo("edicion")}
                eliminarNota={eliminarNota}
                cursos={cursos}
                renombres={renombres}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function EstadoVacio({ onNueva }: { onNueva: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800">
      <NotebookPen
        size={32}
        className="mb-3 text-slate-300 dark:text-slate-600"
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Todavía no escribiste ninguna nota.
      </p>
      <button
        onClick={onNueva}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        <Plus size={16} />
        Escribir la primera
      </button>
    </div>
  );
}

function TarjetaNota({
  nota,
  activa,
  onAbrir,
  eliminarNota,
  cursos,
  renombres,
}: {
  nota: Nota;
  activa: boolean;
  onAbrir: () => void;
  eliminarNota: AccionNota;
  cursos: string[];
  renombres: Record<string, string>;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [estado, accion, pendiente] = useActionState(eliminarNota, INICIAL);
  const router = useRouter();
  const error = mensajeError(estado.error);

  useEffect(() => {
    if (estado.ok) {
      router.refresh();
    }
  }, [estado.ok, router]);

  return (
    <div
      className={`flex h-full flex-col rounded-xl border bg-white p-4 shadow-sm transition-colors dark:bg-slate-800 ${
        activa
          ? "border-indigo-400 dark:border-indigo-500"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:hover:border-indigo-500"
      }`}
    >
      <button
        onClick={onAbrir}
        className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg cursor-pointer"
      >
        {nota.curso && (
          <span
            className={`mb-1 block truncate text-xs font-medium ${colorParaCurso(
              nota.curso,
              cursos,
            )}`}
            title={renombres[nota.curso] || nota.curso}
          >
            {renombres[nota.curso] || nota.curso}
          </span>
        )}
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {tituloMostrado(nota)}
        </h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
          {resumen(nota.contenido) || "Sin contenido"}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-700">
        <span
          suppressHydrationWarning
          className="text-xs text-slate-400 dark:text-slate-500"
        >
          {fechaRelativa(nota.updatedAt)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              descargarNota(nota);
            }}
            title="Descargar como .md"
            aria-label="Descargar como .md"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 cursor-pointer"
          >
            <Download size={14} />
          </button>

          {confirmando ? (
            <form action={accion} className="flex items-center gap-1">
              <input type="hidden" name="id" value={nota.id} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ¿Eliminar?
              </span>
              <button
                type="submit"
                disabled={pendiente}
                className="rounded-md px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
              >
                {pendiente ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  "Sí"
                )}
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-md px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 cursor-pointer"
              >
                No
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              title="Eliminar nota"
              aria-label="Eliminar nota"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Visor de notas en modo lectura: se visualiza dentro del marco principal de la sección.
 * Permite leer la nota con formato rico, compartirla, descargarla en .md, editarla o eliminarla.
 */
function VisorNota({
  nota,
  onVolverALista,
  onEditar,
  eliminarNota,
  cursos,
  renombres,
}: {
  nota: Nota;
  onVolverALista: () => void;
  onEditar: () => void;
  eliminarNota: AccionNota;
  cursos: string[];
  renombres: Record<string, string>;
}) {
  const [copiado, setCopiado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [estado, accion, pendiente] = useActionState(eliminarNota, INICIAL);
  const router = useRouter();

  useEffect(() => {
    if (estado.ok) {
      onVolverALista();
      router.refresh();
    }
  }, [estado.ok, onVolverALista, router]);

  const alCopiar = () => {
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const html = useMemo(
    () => contenidoComoHtml(nota.contenido),
    [nota.contenido],
  );
  const vacia = estaVacio(nota.contenido);

  const fechaFormateada = useMemo(() => {
    try {
      const d = new Date(nota.updatedAt);
      return d.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [nota.updatedAt]);

  const error = mensajeError(estado.error);

  return (
    <div className="flex flex-1 flex-col w-full h-full min-h-0">
      {/* Barra de navegación superior */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={onVolverALista}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft size={16} />
          <span>Volver a notas</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => descargarNota(nota)}
            title="Descargar como .md"
            aria-label="Descargar como .md"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Descargar .md</span>
          </button>

          <button
            type="button"
            onClick={() => compartirONotificar(nota, alCopiar)}
            title="Compartir o copiar nota"
            aria-label="Compartir o copiar nota"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              copiado
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {copiado ? (
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2 size={14} />
            )}
            <span className="hidden sm:inline">
              {copiado ? "¡Copiado!" : "Compartir"}
            </span>
          </button>

          <button
            type="button"
            onClick={onEditar}
            title="Editar nota"
            aria-label="Editar nota"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Pencil size={13} />
            <span>Editar</span>
          </button>

          {confirmando ? (
            <form action={accion} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-1 dark:border-red-500/30 dark:bg-red-500/10">
              <input type="hidden" name="id" value={nota.id} />
              <span className="px-1 text-xs text-red-700 dark:text-red-300">
                ¿Eliminar?
              </span>
              <button
                type="submit"
                disabled={pendiente}
                className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {pendiente ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  "Sí"
                )}
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="rounded-md px-1.5 py-1 text-xs text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                No
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              title="Eliminar nota"
              aria-label="Eliminar nota"
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 shrink-0">
          {error}
        </p>
      )}

      {/* Contenedor tipo documento de la nota a todo el ancho y alto */}
      <article className="flex flex-1 flex-col w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="mb-4 flex flex-wrap items-center gap-2 shrink-0">
          {nota.curso ? (
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${colorParaCurso(
                nota.curso,
                cursos,
              )}`}
              title={renombres[nota.curso] || nota.curso}
            >
              {renombres[nota.curso] || nota.curso}
            </span>
          ) : (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              General
            </span>
          )}
          <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
          {fechaFormateada && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {fechaFormateada}
            </span>
          )}
          <span
            className="text-xs text-slate-400 dark:text-slate-500"
            suppressHydrationWarning
          >
            ({fechaRelativa(nota.updatedAt)})
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-slate-100 shrink-0">
          {nota.titulo.trim() || (
            <span className="italic text-slate-400 dark:text-slate-500">
              Sin título
            </span>
          )}
        </h1>

        <div className="my-6 border-b border-slate-100 dark:border-slate-800 shrink-0" />

        <div className="flex-1 overflow-y-auto pr-1">
          {vacia ? (
            <div className="flex flex-col items-center justify-center py-16 text-center h-full">
              <p className="text-sm italic text-slate-400 dark:text-slate-500">
                Esta nota no tiene contenido todavía.
              </p>
              <button
                type="button"
                onClick={onEditar}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 cursor-pointer"
              >
                <Pencil size={13} />
                Escribir contenido
              </button>
            </div>
          ) : (
            <div
              className="nota-rica w-full max-w-none text-base leading-relaxed text-slate-800 dark:text-slate-200 selection:bg-indigo-100 dark:selection:bg-indigo-900/40"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </article>
    </div>
  );
}

/**
 * Editor de notas en modo edición: se visualiza dentro del marco principal de la sección.
 * Permite crear una nueva nota o editar una existente sin salir de la página.
 */
function EditorNota({
  nota,
  accion,
  onVolverALista,
  onVolverALectura,
  cursos,
  cursoSugerido,
  renombres,
}: {
  nota: Nota | null;
  accion: AccionNota;
  onVolverALista: () => void;
  onVolverALectura?: () => void;
  cursos: string[];
  /** Con un solo curso filtrado, la nota nueva arranca en ese curso. */
  cursoSugerido: string | null;
  renombres: Record<string, string>;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, INICIAL);
  const [contenido, setContenido] = useState(() =>
    contenidoComoHtml(nota?.contenido ?? ""),
  );
  const router = useRouter();
  const error = mensajeError(estado.error);

  useEffect(() => {
    if (estado.ok) {
      if (onVolverALectura) {
        onVolverALectura();
      } else {
        onVolverALista();
      }
      router.refresh();
    }
  }, [estado.ok, onVolverALista, onVolverALectura, router]);

  const handleCancelar = () => {
    if (onVolverALectura) {
      onVolverALectura();
    } else {
      onVolverALista();
    }
  };

  return (
    <form action={enviar} className="flex flex-1 flex-col w-full h-full min-h-0">
      {/* Barra de navegación y acciones de edición */}
      <div className="mb-4 flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={handleCancelar}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft size={16} />
          <span>{nota ? "Volver a la nota" : "Volver a notas"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancelar}
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pendiente}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60 cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {pendiente && <Loader2 size={15} className="animate-spin" />}
            Guardar
          </button>
        </div>
      </div>

      {nota && <input type="hidden" name="id" value={nota.id} />}

      {/* Contenedor del formulario a todo el ancho y alto */}
      <div className="flex flex-1 flex-col w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900 gap-5 overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center shrink-0">
          <input
            name="titulo"
            defaultValue={nota?.titulo ?? ""}
            placeholder="Título de la nota"
            maxLength={MAX_TITULO}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <select
            name="curso"
            defaultValue={nota?.curso ?? cursoSugerido ?? ""}
            aria-label="Curso de la nota"
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 sm:w-64 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Sin curso (General)</option>
            {/* Si la nota quedó colgada de un curso que ya no está en Classroom,
                su opción igual aparece para no perderla al guardar. */}
            {(nota?.curso && !cursos.includes(nota.curso)
              ? [...cursos, nota.curso]
              : cursos
            ).map((curso) => (
              <option key={curso} value={curso}>
                {renombres[curso] || curso}
              </option>
            ))}
          </select>
        </div>

        {/* El valor viaja al form acá: Tiptap vive fuera del ciclo de formularios. */}
        <input type="hidden" name="contenido" value={contenido} />

        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <EditorRico
            contenidoInicial={contenido}
            onCambio={setContenido}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 shrink-0">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleCancelar}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pendiente}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60 cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {pendiente && <Loader2 size={15} className="animate-spin" />}
            Guardar nota
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, NotebookPen, Plus, Search, Trash2, X } from "lucide-react";
import {
  MAX_TITULO,
  contarNotasPorCurso,
  contenidoComoHtml,
  fechaRelativa,
  filtrarNotas,
  resumen,
  tituloMostrado,
  type Nota,
} from "../lib/notas";
import { capitalizar } from "../lib/fechas";
import { useFiltroCursos } from "../(panel)/filtro-cursos";
import { colorParaCurso } from "./sidebar";
import EditorRico from "./editor-rico";
import type { ResultadoNota } from "../(panel)/dashboard/notas/actions";

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
  // `null` = nada abierto · `"nueva"` = creando · id = editando esa nota
  const [abierta, setAbierta] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const { cursos, cursosSeleccionados, setConteoPorCurso, renombres } =
    useFiltroCursos();

  // Publica el conteo por curso al Sidebar compartido, igual que hacen Tareas,
  // Correos e Inicio. Antes Notas dejaba a la vista el conteo de la sección
  // anterior.
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

  const notaEnEdicion =
    abierta && abierta !== "nueva"
      ? notas.find((n) => n.id === abierta) ?? null
      : null;

  // El editor se muestra al crear, o al editar una nota que todavía existe (si
  // se eliminó mientras la editabas, `notaEnEdicion` es null y el editor cierra).
  const mostrarEditor = abierta === "nueva" || notaEnEdicion !== null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
            onClick={() => setAbierta("nueva")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus size={16} />
            Nueva nota
          </button>
        </div>

        {/* Las notas ya están todas en el cliente: la búsqueda es en memoria,
            sin debounce (a diferencia de Correos, que consulta a Gmail). */}
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

      {notas.length === 0 && abierta !== "nueva" ? (
        <EstadoVacio onNueva={() => setAbierta("nueva")} />
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
                activa={abierta === nota.id}
                onAbrir={() => setAbierta(nota.id)}
                eliminarNota={eliminarNota}
                cursos={cursos}
                renombres={renombres}
              />
            </li>
          ))}
        </ul>
      )}

      <PanelLateral
        open={mostrarEditor}
        onCerrar={() => setAbierta(null)}
        titulo={notaEnEdicion ? "Editar nota" : "Nueva nota"}
      >
        <EditorNota
          key={abierta}
          nota={notaEnEdicion}
          accion={notaEnEdicion ? editarNota : crearNota}
          onCerrar={() => setAbierta(null)}
          cursos={cursos}
          cursoSugerido={
            cursosSeleccionados.length === 1 ? cursosSeleccionados[0] : null
          }
          renombres={renombres}
        />
      </PanelLateral>
    </main>
  );
}

/**
 * Drawer que entra deslizándose desde la derecha, a toda la altura de la
 * ventana, con fondo oscurecido. Siempre montado: abierto/cerrado se controla
 * con las clases de transición. Se cierra con la X (dentro del contenido), la
 * tecla Esc o un clic en el fondo.
 */
function PanelLateral({
  open,
  onCerrar,
  titulo,
  children,
}: {
  open: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    /** Mientras el drawer está abierto el Tab no puede escaparse al fondo. */
    function alTecla(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCerrar();
        return;
      }
      if (e.key !== "Tab") return;

      const enfocables = asideRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!enfocables || enfocables.length === 0) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement;

      if (e.shiftKey && activo === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
    document.addEventListener("keydown", alTecla);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const foco = setTimeout(() => {
      asideRef.current
        ?.querySelector<HTMLElement>('input[name="titulo"]')
        ?.focus();
    }, 60);

    return () => {
      document.removeEventListener("keydown", alTecla);
      document.body.style.overflow = overflowPrevio;
      clearTimeout(foco);
    };
  }, [open, onCerrar]);

  return (
    <>
      <div
        aria-hidden
        onClick={onCerrar}
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out sm:w-[540px] sm:max-w-[88vw] dark:border-slate-700 dark:bg-slate-800 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </aside>
    </>
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

  // Al perder el foco de la zona de confirmación, cancelá.
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
        className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
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
        {/* El valor cambia entre el render del servidor y el del cliente. */}
        <span
          suppressHydrationWarning
          className="text-xs text-slate-400 dark:text-slate-500"
        >
          {fechaRelativa(nota.updatedAt)}
        </span>

        {confirmando ? (
          <form action={accion} className="flex items-center gap-1">
            <input type="hidden" name="id" value={nota.id} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ¿Eliminar?
            </span>
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-md px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
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
              className="rounded-md px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              No
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            title="Eliminar nota"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function EditorNota({
  nota,
  accion,
  onCerrar,
  cursos,
  cursoSugerido,
  renombres,
}: {
  nota: Nota | null;
  accion: AccionNota;
  onCerrar: () => void;
  cursos: string[];
  /** Con un solo curso filtrado, la nota nueva arranca en ese curso. */
  cursoSugerido: string | null;
  renombres: Record<string, string>;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, INICIAL);
  // HTML del editor. Las notas viejas están en markdown: `contenidoComoHtml`
  // las convierte al abrirlas y recién al guardar quedan como HTML.
  const [contenido, setContenido] = useState(() =>
    contenidoComoHtml(nota?.contenido ?? ""),
  );
  const router = useRouter();
  const error = mensajeError(estado.error);

  // Cerrar el editor cuando la acción termina bien.
  useEffect(() => {
    if (estado.ok) {
      onCerrar();
      router.refresh();
    }
  }, [estado.ok, onCerrar, router]);

  return (
    <form action={enviar} className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {nota ? "Editar nota" : "Nueva nota"}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          title="Cerrar"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X size={16} />
        </button>
      </div>

      {nota && <input type="hidden" name="id" value={nota.id} />}

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
        <input
          name="titulo"
          defaultValue={nota?.titulo ?? ""}
          placeholder="Título"
          maxLength={MAX_TITULO}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <select
          name="curso"
          defaultValue={nota?.curso ?? cursoSugerido ?? ""}
          aria-label="Curso de la nota"
          className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">Sin curso</option>
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

        {/* El valor viaja al form acá: Tiptap vive fuera del ciclo de formularios. */}
        <input type="hidden" name="contenido" value={contenido} />

        <EditorRico
          contenidoInicial={contenido}
          onCambio={setContenido}
        />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pendiente}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {pendiente && <Loader2 size={15} className="animate-spin" />}
          Guardar
        </button>
      </div>
    </form>
  );
}

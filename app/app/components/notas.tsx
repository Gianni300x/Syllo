"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  List,
  Heading,
  Loader2,
  NotebookPen,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  MAX_CONTENIDO,
  MAX_TITULO,
  fechaRelativa,
  resumen,
  tituloMostrado,
  type Nota,
} from "../lib/notas";
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

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const notaEnEdicion =
    abierta && abierta !== "nueva"
      ? notas.find((n) => n.id === abierta) ?? null
      : null;

  // El editor se muestra al crear, o al editar una nota que todavía existe (si
  // se eliminó mientras la editabas, `notaEnEdicion` es null y el editor cierra).
  const mostrarEditor = abierta === "nueva" || notaEnEdicion !== null;

  return (
    <main className="flex-1 p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Notas
          </h1>
          <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
            {hoy}
          </p>
        </div>
        <button
          onClick={() => setAbierta("nueva")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Nueva nota
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,420px)]">
        {/* Lista */}
        <div className="min-w-0">
          {notas.length === 0 && abierta !== "nueva" ? (
            <EstadoVacio onNueva={() => setAbierta("nueva")} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {notas.map((nota) => (
                <li key={nota.id}>
                  <TarjetaNota
                    nota={nota}
                    activa={abierta === nota.id}
                    onAbrir={() => setAbierta(nota.id)}
                    eliminarNota={eliminarNota}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Editor */}
        {mostrarEditor && (
          <div className="lg:sticky lg:top-8 lg:self-start">
            <EditorNota
              key={abierta}
              nota={notaEnEdicion}
              accion={notaEnEdicion ? editarNota : crearNota}
              onCerrar={() => setAbierta(null)}
            />
          </div>
        )}
      </div>
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
}: {
  nota: Nota;
  activa: boolean;
  onAbrir: () => void;
  eliminarNota: AccionNota;
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
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {tituloMostrado(nota)}
        </h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
          {resumen(nota.contenido) || "Sin contenido"}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-700">
        <span className="text-xs text-slate-400 dark:text-slate-500">
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
}: {
  nota: Nota | null;
  accion: AccionNota;
  onCerrar: () => void;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, INICIAL);
  const [contenido, setContenido] = useState(nota?.contenido ?? "");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const error = mensajeError(estado.error);

  // Cerrar el editor cuando la acción termina bien.
  useEffect(() => {
    if (estado.ok) {
      onCerrar();
      router.refresh();
    }
  }, [estado.ok, onCerrar, router]);

  // Autoexpandir el textarea al contenido.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 600)}px`;
  }, [contenido]);

  return (
    <form
      action={enviar}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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

      <input
        name="titulo"
        defaultValue={nota?.titulo ?? ""}
        placeholder="Título"
        maxLength={MAX_TITULO}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />

      <BarraMarkdown areaRef={areaRef} onCambio={setContenido} />

      <textarea
        ref={areaRef}
        name="contenido"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribí tu nota… podés usar markdown"
        maxLength={MAX_CONTENIDO}
        rows={8}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {pendiente && <Loader2 size={15} className="animate-spin" />}
          Guardar
        </button>
      </div>
    </form>
  );
}

/** Mini-barra que inserta sintaxis markdown en la selección del textarea. */
function BarraMarkdown({
  areaRef,
  onCambio,
}: {
  areaRef: RefObject<HTMLTextAreaElement | null>;
  onCambio: (valor: string) => void;
}) {
  function envolver(prefijo: string, sufijo = prefijo) {
    const el = areaRef.current;
    if (!el) return;
    const { selectionStart: ini, selectionEnd: fin, value } = el;
    const seleccion = value.slice(ini, fin);
    const nuevo =
      value.slice(0, ini) + prefijo + seleccion + sufijo + value.slice(fin);
    onCambio(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ini + prefijo.length, fin + prefijo.length);
    });
  }

  function prefijoLinea(marca: string) {
    const el = areaRef.current;
    if (!el) return;
    const { selectionStart: ini, value } = el;
    const inicioLinea = value.lastIndexOf("\n", ini - 1) + 1;
    const nuevo =
      value.slice(0, inicioLinea) + marca + value.slice(inicioLinea);
    onCambio(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ini + marca.length, ini + marca.length);
    });
  }

  const boton =
    "rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400";

  return (
    <div className="my-2 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-1 py-1 dark:border-slate-700 dark:bg-slate-900/50">
      <button
        type="button"
        title="Negrita"
        onClick={() => envolver("**")}
        className={boton}
      >
        <Bold size={15} />
      </button>
      <button
        type="button"
        title="Itálica"
        onClick={() => envolver("_")}
        className={boton}
      >
        <Italic size={15} />
      </button>
      <button
        type="button"
        title="Título"
        onClick={() => prefijoLinea("## ")}
        className={boton}
      >
        <Heading size={15} />
      </button>
      <button
        type="button"
        title="Lista"
        onClick={() => prefijoLinea("- ")}
        className={boton}
      >
        <List size={15} />
      </button>
    </div>
  );
}

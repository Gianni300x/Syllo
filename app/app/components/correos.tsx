"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Mail,
  MailOpen,
  Search,
  Star,
} from "lucide-react";
import { colorParaCurso } from "./sidebar";
import { useFiltroCursos } from "../(panel)/filtro-cursos";
import {
  formatearFechaCompleta,
  formatearFechaCorreo,
  type Correo,
  type CorreoCompleto,
  type OrigenCorreo,
  type PaginaCorreos,
} from "../lib/correos";

export default function Correos({
  cursos,
  paginaInicial,
}: {
  cursos: string[];
  paginaInicial: PaginaCorreos;
}) {
  const { cursosSeleccionados, setConteoPorCurso } = useFiltroCursos();
  const [origenFiltro, setOrigenFiltro] = useState<"Todos" | "Classroom" | "CVG">("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);

  const [correos, setCorreos] = useState<Correo[]>(paginaInicial.correos);
  const [siguientePagina, setSiguientePagina] = useState(
    paginaInicial.siguientePagina,
  );
  const [cargando, setCargando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  // Última URL consultada. Arranca en la que el servidor ya resolvió, así el
  // primer render no vuelve a pedir lo mismo.
  const urlCargada = useRef("/api/correos?");

  const construirUrl = useCallback(
    (pageToken?: string | null) => {
      const params = new URLSearchParams();
      // El filtrado por curso se hace client-side para soportar multi-selección
      if (origenFiltro !== "Todos") params.set("origen", origenFiltro);
      if (busquedaAplicada) params.set("busqueda", busquedaAplicada);
      if (soloNoLeidos) params.set("noLeidos", "1");
      if (pageToken) params.set("pageToken", pageToken);
      return `/api/correos?${params.toString()}`;
    },
    [origenFiltro, busquedaAplicada, soloNoLeidos],
  );

  // Debounce del buscador: no consultamos Gmail en cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setBusquedaAplicada(busqueda.trim()), 400);
    return () => clearTimeout(id);
  }, [busqueda]);

  useEffect(() => {
    const url = construirUrl();
    if (urlCargada.current === url) return;
    urlCargada.current = url;

    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    fetch(url, { signal: controlador.signal })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error(String(respuesta.status));
        return (await respuesta.json()) as PaginaCorreos;
      })
      .then((pagina) => {
        setCorreos(pagina.correos);
        setSiguientePagina(pagina.siguientePagina);
        setSeleccionado(null);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(
          e.message === "401"
            ? "Tu sesión con Google expiró. Volvé a iniciar sesión."
            : "No pudimos consultar tus correos.",
        );
      })
      .finally(() => setCargando(false));

    return () => controlador.abort();
  }, [construirUrl]);

  async function cargarMas() {
    if (!siguientePagina || cargandoMas) return;
    setCargandoMas(true);
    try {
      const respuesta = await fetch(construirUrl(siguientePagina));
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      const pagina = (await respuesta.json()) as PaginaCorreos;
      setCorreos((previos) => [...previos, ...pagina.correos]);
      setSiguientePagina(pagina.siguientePagina);
    } catch {
      setError("No pudimos cargar más correos.");
    } finally {
      setCargandoMas(false);
    }
  }

  const noLeidos = useMemo(
    () => correos.filter((correo) => !correo.leido).length,
    [correos],
  );

  const conteoPorCurso = useMemo(() => {
    const conteo: Record<string, number> = {};
    for (const correo of correos) {
      if (correo.curso && !correo.leido) {
        conteo[correo.curso] = (conteo[correo.curso] ?? 0) + 1;
      }
    }
    return conteo;
  }, [correos]);

  // Publica el conteo de no leídos por curso al Sidebar compartido.
  useEffect(() => {
    setConteoPorCurso(conteoPorCurso);
  }, [conteoPorCurso, setConteoPorCurso]);

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="flex-1 p-8 min-w-0">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {cursosSeleccionados.length === 0
            ? "Correos recibidos"
            : cursosSeleccionados.length === 1
              ? `Correos de ${cursosSeleccionados[0]}`
              : `Correos — ${cursosSeleccionados.length} cursos`}
        </h1>
        <p className="text-sm text-slate-500 capitalize">{hoy}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar correos de Classroom o CVG…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setOrigenFiltro("Todos")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              origenFiltro === "Todos"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setOrigenFiltro("Classroom")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              origenFiltro === "Classroom"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                origenFiltro === "Classroom" ? "bg-white" : "bg-emerald-500"
              }`}
            />
            Classroom
          </button>
          <button
            type="button"
            onClick={() => setOrigenFiltro("CVG")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              origenFiltro === "CVG"
                ? "bg-sky-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                origenFiltro === "CVG" ? "bg-white" : "bg-sky-500"
              }`}
            />
            CVG
          </button>
        </div>

        <button
          onClick={() => setSoloNoLeidos((valor) => !valor)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            soloNoLeidos
              ? "bg-indigo-600 text-white"
              : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Mail size={16} />
          Solo no leídos
        </button>

        <span className="text-sm text-slate-500">
          {noLeidos} sin leer de {correos.length}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        <div className="lg:col-span-2 flex flex-col gap-2">
          {cargando ? (
            <Cargando texto="Buscando correos…" />
          ) : correos.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay correos con estos filtros.
            </p>
          ) : (
            <>
              {correos
                .filter(
                  (c) =>
                    cursosSeleccionados.length === 0 ||
                    (c.curso != null && cursosSeleccionados.includes(c.curso)),
                )
                .map((correo) => (
                  <FilaCorreo
                    key={correo.id}
                    correo={correo}
                    cursos={cursos}
                    activo={seleccionado === correo.id}
                    onSeleccionar={() => setSeleccionado(correo.id)}
                  />
                ))}
              {siguientePagina && (
                <button
                  onClick={cargarMas}
                  disabled={cargandoMas}
                  className="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                >
                  {cargandoMas ? "Cargando…" : "Cargar más"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-3 lg:sticky lg:top-8">
          <Lector
            key={seleccionado ?? "vacio"}
            id={seleccionado}
            cursos={cursos}
          />
        </div>
      </div>
    </main>
  );
}

function EtiquetaOrigen({ origen }: { origen: OrigenCorreo }) {
  if (origen === "CVG") {
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/70 shrink-0">
        CVG
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0">
      Classroom
    </span>
  );
}

function FilaCorreo({
  correo,
  cursos,
  activo,
  onSeleccionar,
}: {
  correo: Correo;
  cursos: string[];
  activo: boolean;
  onSeleccionar: () => void;
}) {
  return (
    <button
      onClick={onSeleccionar}
      className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-all ${
        activo
          ? "border-indigo-400 shadow-md"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <EtiquetaOrigen origen={correo.origen} />
          {correo.curso && (
            <span
              className={`truncate text-xs font-medium ${colorParaCurso(
                correo.curso,
                cursos,
              )}`}
            >
              {correo.curso}
            </span>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
          {correo.destacado && (
            <Star size={12} className="fill-amber-400 text-amber-400" />
          )}
          {formatearFechaCorreo(correo.fecha)}
        </span>
      </div>

      <h3
        className={`mb-1 flex items-center gap-2 text-sm text-slate-900 ${
          correo.leido ? "font-normal" : "font-semibold"
        }`}
      >
        {!correo.leido && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
        )}
        <span className="truncate">{correo.asunto}</span>
      </h3>

      <p className="line-clamp-2 text-xs text-slate-500">{correo.resumen}</p>
    </button>
  );
}

function Lector({ id, cursos }: { id: string | null; cursos: string[] }) {
  const [correo, setCorreo] = useState<CorreoCompleto | null>(null);
  // El componente se remonta con cada correo (`key`), así que el estado inicial
  // ya refleja la carga en curso y el efecto solo dispara el fetch.
  const [cargando, setCargando] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controlador = new AbortController();

    fetch(`/api/correos/${id}`, { signal: controlador.signal })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error(String(respuesta.status));
        return (await respuesta.json()) as CorreoCompleto;
      })
      .then(setCorreo)
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError("No pudimos abrir este correo.");
      })
      .finally(() => setCargando(false));

    return () => controlador.abort();
  }, [id]);

  if (!id) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/60 text-slate-400">
        <MailOpen size={28} />
        <p className="text-sm">Elegí un correo para leerlo acá.</p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Cargando texto="Abriendo correo…" />
      </div>
    );
  }

  if (error || !correo) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "No pudimos abrir este correo."}
      </p>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 border-b border-slate-100 pb-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            {correo.asunto}
          </h2>
          <a
            href={correo.link}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <ExternalLink size={13} />
            Abrir en Gmail
          </a>
        </div>

        <p className="text-sm text-slate-600">
          {correo.remitente}{" "}
          <span className="text-slate-400">&lt;{correo.remitenteEmail}&gt;</span>
        </p>
        <p className="text-xs capitalize text-slate-400">
          {formatearFechaCompleta(correo.fecha)}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <EtiquetaOrigen origen={correo.origen} />
          {correo.curso && (
            <span
              className={`inline-block text-xs font-medium ${colorParaCurso(
                correo.curso,
                cursos,
              )}`}
            >
              {correo.curso}
            </span>
          )}
        </div>
      </header>

      {correo.html ? (
        <iframe
          title={correo.asunto}
          // sandbox vacío: el HTML del mail no ejecuta scripts ni accede a Syllo.
          sandbox=""
          srcDoc={documentoHtml(correo.html)}
          className="h-[60vh] w-full rounded-lg border border-slate-200 bg-white"
        />
      ) : (
        <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-geist-sans)] text-sm text-slate-700">
          {correo.texto ?? correo.resumen}
        </pre>
      )}
    </article>
  );
}

/**
 * Envuelve el HTML del mail con una CSP propia.
 */
function documentoHtml(html: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src 'none'; media-src 'none'; frame-src 'none'"
    />
    <base target="_blank" />
    <style>
      body {
        margin: 0;
        padding: 4px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        color: #334155;
        word-break: break-word;
      }
      img { max-width: 100%; height: auto; }
      a { color: #4f46e5; }
    </style>
  </head>
  <body>${html}</body>
</html>`;
}

function Cargando({ texto }: { texto: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 size={16} className="animate-spin" />
      {texto}
    </p>
  );
}

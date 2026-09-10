import { cache } from "react";
import { unstable_cache } from "next/cache";
import { google, type gmail_v1 } from "googleapis";
import {
  detectarCurso,
  detectarOrigen,
  parsearRemitente,
  type Correo,
  type CorreoCompleto,
  type OrigenCorreo,
  type PaginaCorreos,
} from "./correos";

/** Notificaciones de Classroom y CVG (Campus Virtual Global UTN FRRo). */
export const DOMINIO_CLASSROOM = "classroom.google.com";
export const REMITENTE_CVG = "noreply@frro.utn.edu.ar";

export const MAX_CORREOS_POR_PAGINA = 25;

export interface OpcionesCorreos {
  /** Nombres de cursos activos, para etiquetar cada correo. */
  cursos?: string[];
  /** Filtra por un curso puntual (se traduce a una búsqueda de Gmail). */
  curso?: string | null;
  /** Filtra por origen (Classroom o CVG). */
  origen?: OrigenCorreo | null;
  /** Texto libre que el usuario escribió en el buscador. */
  busqueda?: string | null;
  soloNoLeidos?: boolean;
  pageToken?: string | null;
  maxResults?: number;
}

/** Cuántos `messages.get` mandamos en paralelo. Ráfagas más grandes disparan el
 *  rate limit por usuario de Gmail ('Total Query Cost' / Units per minute). */
const CONCURRENCIA_DETALLE = 5;

function clienteGmail(accessToken: string): gmail_v1.Gmail {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({
    version: "v1",
    auth: oauth2Client,
    // gaxios reintenta con backoff exponencial ante 429 (cuota) y 5xx.
    retryConfig: {
      retry: 4,
      retryDelay: 1000,
      httpMethodsToRetry: ["GET"],
      statusCodesToRetry: [
        [429, 429],
        [500, 599],
      ],
    },
  });
}

/** `Promise.all` pero con un tope de tareas simultáneas. */
async function mapearConLimite<T, R>(
  items: T[],
  limite: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const resultados = new Array<R>(items.length);
  let siguiente = 0;

  async function worker() {
    while (siguiente < items.length) {
      const i = siguiente++;
      resultados[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, worker),
  );
  return resultados;
}

/** Arma la query de búsqueda de Gmail a partir de los filtros de la UI. */
export function construirQuery({
  curso,
  origen,
  busqueda,
  soloNoLeidos,
}: Pick<OpcionesCorreos, "curso" | "origen" | "busqueda" | "soloNoLeidos"> = {}): string {
  const partes: string[] = [];

  if (origen === "Classroom") {
    partes.push(`from:${DOMINIO_CLASSROOM}`);
  } else if (origen === "CVG") {
    partes.push(`from:${REMITENTE_CVG}`);
  } else {
    // Coexisten ambos remitentes
    partes.push(`(from:${DOMINIO_CLASSROOM} OR from:${REMITENTE_CVG})`);
  }

  if (soloNoLeidos) partes.push("is:unread");
  if (curso) partes.push(`"${escaparComillas(curso)}"`);
  if (busqueda?.trim()) partes.push(`"${escaparComillas(busqueda.trim())}"`);
  return partes.join(" ");
}

function escaparComillas(texto: string): string {
  return texto.replace(/"/g, "");
}

function encabezado(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  nombre: string,
): string {
  const header = headers?.find(
    (h) => h.name?.toLowerCase() === nombre.toLowerCase(),
  );
  return header?.value ?? "";
}

function aCorreo(
  mensaje: gmail_v1.Schema$Message,
  cursos: string[],
): Correo {
  const headers = mensaje.payload?.headers;
  const asunto = encabezado(headers, "Subject") || "(sin asunto)";
  const { nombre, email } = parsearRemitente(encabezado(headers, "From"));
  const etiquetas = mensaje.labelIds ?? [];
  const resumen = decodificarEntidades(mensaje.snippet ?? "");

  return {
    id: mensaje.id!,
    threadId: mensaje.threadId ?? mensaje.id!,
    asunto,
    remitente: nombre,
    remitenteEmail: email,
    fecha: new Date(Number(mensaje.internalDate ?? 0)).toISOString(),
    resumen,
    leido: !etiquetas.includes("UNREAD"),
    destacado: etiquetas.includes("STARRED"),
    curso: detectarCurso(`${asunto} ${resumen}`, cursos),
    origen: detectarOrigen(email),
    link: `https://mail.google.com/mail/u/0/#inbox/${mensaje.id}`,
  };
}

/** Lista los correos de Classroom del usuario, ya normalizados para la UI. */
export async function fetchCorreosDeClassroom(
  accessToken: string,
  opciones: OpcionesCorreos = {},
): Promise<PaginaCorreos> {
  const gmail = clienteGmail(accessToken);
  const cursos = opciones.cursos ?? [];

  const listado = await gmail.users.messages.list({
    userId: "me",
    q: construirQuery(opciones),
    maxResults: opciones.maxResults ?? MAX_CORREOS_POR_PAGINA,
    pageToken: opciones.pageToken ?? undefined,
  });

  const referencias = listado.data.messages ?? [];

  // `metadata` trae encabezados, etiquetas y snippet sin bajar el cuerpo entero.
  const correos = await mapearConLimite(
    referencias,
    CONCURRENCIA_DETALLE,
    async (referencia) => {
      const detalle = await gmail.users.messages.get({
        userId: "me",
        id: referencia.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      return aCorreo(detalle.data, cursos);
    },
  );

  return {
    correos,
    siguientePagina: listado.data.nextPageToken ?? null,
  };
}

/**
 * Primera página de la bandeja, sin filtros, cacheada entre requests.
 * Clave por `userId`; el `accessToken` va por closure (ver nota en
 * `tareas-server.ts`). Las búsquedas/paginación filtradas de `/api/correos`
 * quedan sin cache porque son puntuales y muy variadas.
 */
export const getCorreosInicial = cache(
  (accessToken: string, userId: string, cursos: string[]) =>
    unstable_cache(
      () => fetchCorreosDeClassroom(accessToken, { cursos, maxResults: 15 }),
      ["correos-inicial", userId],
      { revalidate: 300, tags: ["correos", `u:${userId}`] },
    )(),
);

/** Trae un correo con su cuerpo, para el panel de lectura. */
export async function fetchCorreoCompleto(
  accessToken: string,
  id: string,
  cursos: string[] = [],
): Promise<CorreoCompleto> {
  const gmail = clienteGmail(accessToken);
  const respuesta = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });

  const mensaje = respuesta.data;
  const payload = mensaje.payload;

  return {
    ...aCorreo(mensaje, cursos),
    html: payload ? buscarParte(payload, "text/html") || null : null,
    texto: payload ? buscarParte(payload, "text/plain") || null : null,
  };
}

/** Recorre el árbol MIME buscando la primera parte del tipo pedido. */
function buscarParte(
  parte: gmail_v1.Schema$MessagePart,
  mimeType: string,
): string {
  if (parte.mimeType === mimeType && parte.body?.data) {
    return decodificarBase64Url(parte.body.data);
  }
  for (const hija of parte.parts ?? []) {
    const encontrada = buscarParte(hija, mimeType);
    if (encontrada) return encontrada;
  }
  return "";
}

function decodificarBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

/** Gmail devuelve el snippet con entidades HTML escapadas. */
function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

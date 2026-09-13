/**
 * Tipos y helpers puros de la bandeja de correos de Classroom.
 * Este archivo no importa `googleapis`: lo usan tanto el servidor como el cliente.
 */
import { MESES_CORTOS } from "./fechas";

export type OrigenCorreo = "Classroom" | "CVG";

export interface Correo {
  id: string;
  threadId: string;
  asunto: string;
  /** Nombre legible del remitente, o el mail si no viene nombre. */
  remitente: string;
  remitenteEmail: string;
  /** Fecha de recepción en ISO. */
  fecha: string;
  /** Vista previa que devuelve Gmail. */
  resumen: string;
  leido: boolean;
  destacado: boolean;
  /** Curso detectado a partir del asunto o resumen, si se pudo. */
  curso: string | null;
  /** Origen o plataforma del correo (Classroom o CVG). */
  origen: OrigenCorreo;
  /** Link para abrir el mensaje en Gmail. */
  link: string;
}

export interface PaginaCorreos {
  correos: Correo[];
  /** Token para pedir la página siguiente, o null si no hay más. */
  siguientePagina: string | null;
}

export interface CorreoCompleto extends Correo {
  html: string | null;
  texto: string | null;
}

/** Separa `"Google Classroom" <no-reply@classroom.google.com>` en nombre y mail. */
export function parsearRemitente(from: string): {
  nombre: string;
  email: string;
} {
  const conNombre = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (conNombre) {
    const nombre = conNombre[1].replace(/^"|"$/g, "").trim();
    const email = conNombre[2].trim();
    return { nombre: nombre || email, email };
  }
  const email = from.trim();
  return { nombre: email, email };
}

/** Detecta si el correo proviene de Classroom o de CVG (UTN FRRo). */
export function detectarOrigen(email: string): OrigenCorreo {
  const normalizado = email.toLowerCase();
  if (normalizado.includes("frro.utn.edu.ar")) {
    return "CVG";
  }
  return "Classroom";
}

/**
 * Classroom nombra el curso en el asunto ("Nuevo trabajo: Título - Historia").
 * Buscamos el nombre de curso más largo que aparezca en el texto para no
 * confundir "Historia" con "Historia del Arte".
 */
export function detectarCurso(texto: string, cursos: string[]): string | null {
  const normalizado = normalizar(texto);
  let encontrado: string | null = null;

  for (const curso of cursos) {
    const cursoNormalizado = normalizar(curso);
    if (!cursoNormalizado) continue;
    if (!normalizado.includes(cursoNormalizado)) continue;
    if (!encontrado || curso.length > encontrado.length) {
      encontrado = curso;
    }
  }

  return encontrado;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Hoy muestra la hora; el resto del año, día y mes. */
export function formatearFechaCorreo(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";

  const hoy = new Date();
  const mismoDia =
    fecha.getDate() === hoy.getDate() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear();

  if (mismoDia) {
    return fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const base = `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;
  return fecha.getFullYear() === hoy.getFullYear()
    ? base
    : `${base} ${fecha.getFullYear()}`;
}

export function formatearFechaCompleta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

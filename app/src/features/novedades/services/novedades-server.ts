import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { google, type classroom_v1 } from "googleapis";
import type { EventoCvg } from "@/features/cvg/types";
import type { Novedad, ResultadoAnuncios } from "../types";

const MAX_ANUNCIOS_POR_CURSO = 20;
const CONCURRENCIA_CURSOS = 4;

function clienteClassroom(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.classroom({ version: "v1", auth: oauth2Client });
}

async function mapearConLimite<T, R>(
  items: T[],
  limite: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const resultados = new Array<R>(items.length);
  let siguiente = 0;
  async function worker() {
    while (siguiente < items.length) {
      const indice = siguiente++;
      resultados[indice] = await fn(items[indice]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, () => worker()),
  );
  return resultados;
}

function textoMateriales(materiales: classroom_v1.Schema$Material[] | undefined) {
  return (materiales ?? [])
    .map((material) =>
      material.driveFile?.driveFile?.title ??
      material.link?.title ??
      material.youtubeVideo?.title ??
      material.form?.title ??
      "",
    )
    .filter(Boolean)
    .join(" · ");
}

export async function fetchAnunciosClassroom(
  accessToken: string,
): Promise<Novedad[]> {
  const classroom = clienteClassroom(accessToken);
  const respuestaCursos = await classroom.courses.list({ courseStates: ["ACTIVE"] });
  const cursos = respuestaCursos.data.courses ?? [];

  const porCurso = await mapearConLimite(
    cursos,
    CONCURRENCIA_CURSOS,
    async (curso): Promise<Novedad[]> => {
      if (!curso.id) return [];
      const respuesta = await classroom.courses.announcements.list({
        courseId: curso.id,
        announcementStates: ["PUBLISHED"],
        orderBy: "updateTime desc",
        pageSize: MAX_ANUNCIOS_POR_CURSO,
      });

      return (respuesta.data.announcements ?? []).map((anuncio) => {
        const texto = anuncio.text?.trim() || "Nuevo anuncio";
        const materiales = textoMateriales(anuncio.materials);
        return {
          id: `classroom:${curso.id}:${anuncio.id ?? anuncio.creationTime}`,
          titulo: texto.split(/\r?\n/, 1)[0].slice(0, 120),
          resumen: materiales ? `${texto}\n${materiales}` : texto,
          fecha: anuncio.updateTime ?? anuncio.creationTime ?? new Date().toISOString(),
          curso: curso.name ?? "Sin curso",
          origen: "Classroom",
          tipo: "anuncio",
          link: anuncio.alternateLink ?? "https://classroom.google.com/",
        } satisfies Novedad;
      });
    },
  );

  return porCurso
    .flat()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export const getAnunciosClassroom = cache((accessToken: string, userId: string) =>
  unstable_cache(
    () => fetchAnunciosClassroom(accessToken),
    ["anuncios-classroom", userId],
    { revalidate: 300, tags: ["anuncios-classroom", `u:${userId}`] },
  )(),
);

function esPermisoFaltante(error: unknown): boolean {
  const dato = error as { code?: number; status?: number; message?: string };
  return (
    dato?.code === 401 ||
    dato?.code === 403 ||
    dato?.status === 401 ||
    dato?.status === 403 ||
    /insufficient|permission|scope|forbidden/i.test(dato?.message ?? "")
  );
}

export async function getAnunciosSeguros(
  accessToken: string,
  userId: string,
): Promise<ResultadoAnuncios> {
  try {
    return {
      anuncios: await getAnunciosClassroom(accessToken, userId),
      permisoFaltante: false,
      error: false,
    };
  } catch (error) {
    const permisoFaltante = esPermisoFaltante(error);
    console.error("No se pudieron cargar los anuncios de Classroom:", error);
    return { anuncios: [], permisoFaltante, error: !permisoFaltante };
  }
}

export function eventosCvgComoNovedades(eventos: EventoCvg[]): Novedad[] {
  return eventos.map((evento) => ({
    id: `cvg:${evento.id}`,
    titulo: evento.titulo,
    resumen: evento.descripcion,
    fecha: new Date(
      Date.UTC(evento.fecha.year, evento.fecha.month - 1, evento.fecha.day, 12),
    ).toISOString(),
    curso: evento.curso,
    origen: "CVG",
    tipo: "evento",
    link: evento.link,
  }));
}

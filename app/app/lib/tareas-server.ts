import { cache } from "react";
import { unstable_cache } from "next/cache";
import { google, type classroom_v1 } from "googleapis";
import type { Tarea } from "./classroom";

/** Classroom marca año/mes/día como opcionales; sin los tres no hay vencimiento. */
function normalizarVencimiento(
  fecha: classroom_v1.Schema$Date | null | undefined,
): Tarea["vencimiento"] {
  if (!fecha?.year || !fecha.month || !fecha.day) return null;
  return { year: fecha.year, month: fecha.month, day: fecha.day };
}

export async function fetchTareasDesdeClassroom(
  accessToken: string,
): Promise<Tarea[]> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: accessToken });

  const classroom = google.classroom({ version: "v1", auth: oauth2Client });

  const cursosRes = await classroom.courses.list({ courseStates: ["ACTIVE"] });
  const cursos = cursosRes.data.courses ?? [];

  const tareasPromises = cursos.map(async (curso) => {
    const trabajosRes = await classroom.courses.courseWork.list({
      courseId: curso.id!,
    });
    const trabajos = trabajosRes.data.courseWork ?? [];

    return Promise.all(
      trabajos.map(async (trabajo) => {
        const entregasRes =
          await classroom.courses.courseWork.studentSubmissions.list({
            courseId: curso.id!,
            courseWorkId: trabajo.id!,
            userId: "me",
          });
        const entregas = entregasRes.data.studentSubmissions ?? [];
        const estado = entregas[0]?.state ?? "CREATED";

        return {
          curso: curso.name ?? "Sin curso",
          titulo: trabajo.title ?? "(sin título)",
          descripcion: trabajo.description ?? "",
          puntos: trabajo.maxPoints ?? null,
          vencimiento: normalizarVencimiento(trabajo.dueDate),
          estado,
          link: trabajo.alternateLink ?? "",
        } satisfies Tarea;
      }),
    );
  });

  return (await Promise.all(tareasPromises)).flat();
}

/** Nombres de los cursos activos, para etiquetar los correos por curso. */
export async function fetchNombresCursos(
  accessToken: string,
): Promise<string[]> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: accessToken });

  const classroom = google.classroom({ version: "v1", auth: oauth2Client });
  const cursosRes = await classroom.courses.list({ courseStates: ["ACTIVE"] });

  return (cursosRes.data.courses ?? [])
    .map((curso) => curso.name)
    .filter((nombre): nombre is string => Boolean(nombre));
}

/**
 * Versiones cacheadas de las lecturas de Classroom.
 *
 * - `cache()` de React deduplica llamadas dentro de un mismo request.
 * - `unstable_cache` persiste el resultado entre requests durante `revalidate`
 *   segundos. La clave es únicamente `userId`: el `accessToken` de Google rota
 *   ~cada hora y se pasa por closure (no va en `keyParts`) para que un refresh
 *   de token no invalide el cache.
 * - Los tags permiten forzar datos frescos con `revalidateTag` (botón "Actualizar").
 */

export const getNombresCursos = cache((accessToken: string, userId: string) =>
  unstable_cache(
    () => fetchNombresCursos(accessToken),
    ["nombres-cursos", userId],
    { revalidate: 180, tags: ["nombres-cursos", `u:${userId}`] },
  )(),
);

export const getTareas = cache((accessToken: string, userId: string) =>
  unstable_cache(
    () => fetchTareasDesdeClassroom(accessToken),
    ["tareas", userId],
    { revalidate: 180, tags: ["tareas", `u:${userId}`] },
  )(),
);

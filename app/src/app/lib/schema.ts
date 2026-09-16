/**
 * Esquema de la base (Drizzle).
 *
 * El dueño de cada fila se identifica por su email (`session.user.email`), que es
 * el único identificador de usuario que expone la sesión JWT — mismo criterio
 * que el `userId` usado en el resto del código y en los tags de cache.
 */
import { sql } from "drizzle-orm";
import type { TareaDelFeed } from "./classroom";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const notas = pgTable(
  "notas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerEmail: text("owner_email").notNull(),
    titulo: text("titulo").notNull().default(""),
    contenido: text("contenido").notNull().default(""),
    /**
     * Curso al que pertenece la nota, por nombre (igual que `eventos.curso` y
     * `cursos_archivados.curso`). `null` es "sin curso", que es un estado
     * legítimo: no todas las notas son de una materia.
     */
    curso: text("curso"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (tabla) => [index("notas_owner_email_idx").on(tabla.ownerEmail)],
);

export type NotaRow = typeof notas.$inferSelect;

/**
 * Cursos que el usuario sacó de la vista. Se guardan por nombre porque es el
 * único identificador de curso que circula en la app (`Tarea.curso`,
 * `getNombresCursos`). No toca nada en Google Classroom.
 */
export const cursosArchivados = pgTable(
  "cursos_archivados",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerEmail: text("owner_email").notNull(),
    curso: text("curso").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (tabla) => [
    uniqueIndex("cursos_archivados_owner_curso_idx").on(
      tabla.ownerEmail,
      tabla.curso,
    ),
  ],
);

/**
 * Nombres personalizados para los cursos.
 * Mapea el nombre original del curso a un nombre más corto o descriptivo
 * elegido por el usuario.
 */
export const cursosRenombrados = pgTable(
  "cursos_renombrados",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerEmail: text("owner_email").notNull(),
    cursoOriginal: text("curso_original").notNull(),
    cursoRenombrado: text("curso_renombrado").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (tabla) => [
    uniqueIndex("cursos_renombrados_owner_original_idx").on(
      tabla.ownerEmail,
      tabla.cursoOriginal,
    ),
  ],
);

export const eventos = pgTable(
  "eventos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerEmail: text("owner_email").notNull(),
    titulo: text("titulo").notNull(),
    curso: text("curso").notNull().default("Personal"),
    descripcion: text("descripcion").notNull().default(""),
    vencimientoDia: timestamp("vencimiento_dia", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (tabla) => [index("eventos_owner_email_idx").on(tabla.ownerEmail)],
);

/**
 * Estado propio del alumno sobre una tarea de Classroom: lo que Syllo sabe y
 * Google no. Es lo que convierte la lista de entregas en una agenda.
 *
 * A diferencia de `cursos_archivados`, la clave no es un nombre sino el par
 * (courseId, courseWorkId) que devuelve Classroom: no se rompe si el usuario
 * renombra el curso ni si el profesor cambia el título de la tarea.
 *
 * Una fila por tarea con los dos flags, y cuando los dos vuelven a `false` la
 * fila se borra: la tabla solo guarda lo que el alumno tocó.
 */
export const estadosTareas = pgTable(
  "estados_tareas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerEmail: text("owner_email").notNull(),
    courseId: text("course_id").notNull(),
    courseWorkId: text("course_work_id").notNull(),
    empezada: boolean("empezada").notNull().default(false),
    fijada: boolean("fijada").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (tabla) => [
    uniqueIndex("estados_tareas_owner_clave_idx").on(
      tabla.ownerEmail,
      tabla.courseId,
      tabla.courseWorkId,
    ),
    index("estados_tareas_owner_email_idx").on(tabla.ownerEmail),
  ],
);

export type EstadoTareaRow = typeof estadosTareas.$inferSelect;

/**
 * El token secreto del feed de calendario de cada usuario.
 *
 * El feed lo consultan los servidores de Google/Apple, sin cookie: la URL es
 * la credencial, de ahí que el token sea largo y que se pueda regenerar (lo
 * cual invalida el link anterior).
 */
export const feedsCalendario = pgTable("feeds_calendario", {
  ownerEmail: text("owner_email").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Foto de los vencimientos del usuario, para que el feed pueda responder sin
 * sesión.
 *
 * Google Calendar pega a la URL del feed sin cookie, así que no hay forma de
 * llamar a Classroom en ese momento. La alternativa era guardar el
 * `refresh_token` de Google —que habilita todos los scopes concedidos, correo
 * incluido—; en vez de eso se guardan los datos ya resueltos: acá no hay
 * ninguna credencial.
 *
 * Se reescribe entera cada vez que el usuario abre el panel, y solo guarda las
 * entregas no completadas que tienen fecha: lo que efectivamente va al feed.
 */
export const snapshotTareas = pgTable("snapshot_tareas", {
  ownerEmail: text("owner_email").primaryKey(),
  tareas: jsonb("tareas").$type<TareaDelFeed[]>().notNull(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

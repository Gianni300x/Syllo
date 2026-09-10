/**
 * Esquema de la base (Drizzle).
 *
 * El dueño de cada fila se identifica por su email (`session.user.email`), que es
 * el único identificador de usuario que expone la sesión JWT — mismo criterio
 * que el `userId` usado en el resto del código y en los tags de cache.
 */
import { sql } from "drizzle-orm";
import {
  index,
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

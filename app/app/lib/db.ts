/**
 * Conexión a Postgres (Neon serverless) + Drizzle.
 *
 * `connection()` fuerza que la lectura de `DATABASE_URL` ocurra en runtime y no
 * quede inlineada en el build (requisito de Next 16 para env vars de servidor).
 * El cliente se crea una sola vez por proceso.
 */
import { connection } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb() {
  await connection();
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Falta la variable de entorno DATABASE_URL");
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}

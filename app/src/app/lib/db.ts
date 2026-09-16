/**
 * Conexión a Postgres (Neon serverless) + Drizzle.
 *
 * `connection()` fuerza que la lectura de `DATABASE_URL` ocurra en runtime y no
 * quede inlineada en el build (requisito de Next 16 para env vars de servidor).
 * El cliente se crea una sola vez por proceso.
 */
// lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!db) {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error("Falta la variable de entorno DATABASE_URL");
    }

    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: true },
    });

    db = drizzle(pool);
  }

  return db;
}

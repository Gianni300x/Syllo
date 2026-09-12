import { getDb } from "./db";
import { eventos } from "./schema";
import { eq } from "drizzle-orm";

export async function getEventos(userId: string) {
  const db = getDb();
  return db.select().from(eventos).where(eq(eventos.ownerEmail, userId));
}

export async function addEvento(userId: string, titulo: string, vencimientoDia: Date, curso: string, descripcion: string) {
  const db = getDb();
  await db.insert(eventos).values({
    ownerEmail: userId,
    titulo,
    vencimientoDia,
    curso,
    descripcion
  });
}

import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const VERSION = "v1";

function clave(): Buffer {
  const secreto = process.env.CVG_ENCRYPTION_KEY ?? process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta CVG_ENCRYPTION_KEY o AUTH_SECRET");
  return createHash("sha256").update(secreto).digest();
}

export function cifrarUrlCvg(url: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", clave(), iv);
  const contenido = Buffer.concat([cipher.update(url, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv, tag, contenido]
    .map((parte) => (typeof parte === "string" ? parte : parte.toString("base64url")))
    .join(":");
}

export function descifrarUrlCvg(valor: string): string {
  const [version, iv64, tag64, contenido64] = valor.split(":");
  if (version !== VERSION || !iv64 || !tag64 || !contenido64) {
    throw new Error("Formato de calendario cifrado inválido");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    clave(),
    Buffer.from(iv64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(contenido64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { Tarea } from "../../app/lib/classroom";
import { generarIcs } from "../../app/lib/ics";

const HOY = new Date(2026, 8, 12, 12, 0, 0); // 12 de septiembre de 2026

beforeEach(() => {
  vi.useFakeTimers();
  // `generarIcs` estampa DTSTAMP con la hora actual: sin congelarla el
  // resultado cambiaría en cada corrida.
  vi.setSystemTime(HOY);
});

afterAll(() => {
  vi.useRealTimers();
});

function tarea(parcial: Partial<Tarea> = {}): Tarea {
  return {
    curso: "Análisis",
    titulo: "TP 1",
    descripcion: "",
    puntos: null,
    vencimiento: { year: 2026, month: 9, day: 12 },
    estado: "CREATED",
    link: "https://classroom.google.com/x",
    ...parcial,
  };
}

/** Deshace el folding para poder buscar una propiedad por su nombre. */
function desdoblar(ics: string): string[] {
  return ics.replace(/\r\n /g, "").split("\r\n");
}

const contar = (ics: string, prefijo: string) =>
  desdoblar(ics).filter((l) => l.startsWith(prefijo)).length;

describe("generarIcs", () => {
  test("arma un calendario válido con un evento", () => {
    const lineas = desdoblar(generarIcs([tarea()]));
    expect(lineas[0]).toBe("BEGIN:VCALENDAR");
    expect(lineas).toContain("VERSION:2.0");
    expect(lineas).toContain("END:VCALENDAR");
    expect(contar(generarIcs([tarea()]), "BEGIN:VEVENT")).toBe(1);
  });

  test("saltea las entregadas y las que no tienen vencimiento", () => {
    const ics = generarIcs([
      tarea({ estado: "TURNED_IN" }),
      tarea({ estado: "RETURNED" }),
      tarea({ vencimiento: null }),
    ]);
    expect(contar(ics, "BEGIN:VEVENT")).toBe(0);
  });

  test("DTEND es el día siguiente: en eventos de día completo es exclusivo", () => {
    const lineas = desdoblar(generarIcs([tarea()]));
    expect(lineas).toContain("DTSTART;VALUE=DATE:20260912");
    expect(lineas).toContain("DTEND;VALUE=DATE:20260913");
  });

  test("el DTEND cruza bien el fin de mes", () => {
    const lineas = desdoblar(
      generarIcs([tarea({ vencimiento: { year: 2026, month: 9, day: 30 } })]),
    );
    expect(lineas).toContain("DTSTART;VALUE=DATE:20260930");
    expect(lineas).toContain("DTEND;VALUE=DATE:20261001");
  });

  test("el resumen lleva curso y título", () => {
    const lineas = desdoblar(
      generarIcs([tarea({ curso: "Física", titulo: "Parcial" })]),
    );
    expect(lineas).toContain("SUMMARY:Física: Parcial");
  });

  test("omite la URL de los eventos personales, que no tienen link", () => {
    expect(contar(generarIcs([tarea({ link: "#" })]), "URL:")).toBe(0);
    expect(contar(generarIcs([tarea()]), "URL:")).toBe(1);
  });

  test("omite DESCRIPTION cuando la tarea no tiene descripción", () => {
    expect(contar(generarIcs([tarea()]), "DESCRIPTION:")).toBe(0);
    expect(contar(generarIcs([tarea({ descripcion: "Leer" })]), "DESCRIPTION:")).toBe(1);
  });

  test("escapa comas, puntos y coma y saltos de línea", () => {
    const lineas = desdoblar(
      generarIcs([tarea({ descripcion: "Leer cap 1, 2; y 3\nDespués resolver" })]),
    );
    const desc = lineas.find((l) => l.startsWith("DESCRIPTION:"));
    // `String.raw` para que los backslashes se lean tal cual: el ICS exige
    // escapar coma, punto y coma y salto de línea.
    expect(desc).toBe(
      String.raw`DESCRIPTION:Leer cap 1\, 2\; y 3\nDespués resolver`,
    );
  });

  test("ninguna línea supera los 75 bytes: se pliegan con un espacio", () => {
    const ics = generarIcs([
      tarea({
        titulo:
          "Trabajo práctico integrador de análisis matemático II con entrega grupal y defensa oral en el aula",
      }),
    ]);
    for (const linea of ics.split("\r\n")) {
      expect(Buffer.byteLength(linea, "utf8")).toBeLessThanOrEqual(75);
    }
    // Las continuaciones arrancan con espacio; sin eso el archivo es inválido.
    expect(ics).toContain("\r\n ");
  });

  test("el UID es estable entre corridas con la misma tarea", () => {
    const uid = (ics: string) =>
      desdoblar(ics).find((l) => l.startsWith("UID:"));
    expect(uid(generarIcs([tarea()]))).toBe(uid(generarIcs([tarea()])));
  });

  test("tareas distintas no comparten UID", () => {
    const lineas = desdoblar(
      generarIcs([tarea({ titulo: "TP 1" }), tarea({ titulo: "TP 2" })]),
    ).filter((l) => l.startsWith("UID:"));
    expect(lineas).toHaveLength(2);
    expect(lineas[0]).not.toBe(lineas[1]);
  });
});

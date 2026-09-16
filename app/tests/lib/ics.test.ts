import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { Tarea } from "@/features/tareas/services/classroom";
import { generarIcs } from "../../src/app/lib/ics";

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

/** Las líneas del VEVENT, sin las del VALARM que lleva adentro. */
function lineasDelEvento(ics: string): string[] {
  const fuera: string[] = [];
  let dentroDeAlarma = false;
  for (const linea of desdoblar(ics)) {
    if (linea === "BEGIN:VALARM") dentroDeAlarma = true;
    else if (linea === "END:VALARM") dentroDeAlarma = false;
    else if (!dentroDeAlarma) fuera.push(linea);
  }
  return fuera;
}

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
    // Se miran solo las líneas del VEVENT: el VALARM siempre trae la suya.
    const descripcionesDel = (t: Tarea) =>
      lineasDelEvento(generarIcs([t])).filter((l) =>
        l.startsWith("DESCRIPTION:"),
      ).length;

    expect(descripcionesDel(tarea())).toBe(0);
    expect(descripcionesDel(tarea({ descripcion: "Leer" }))).toBe(1);
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

describe("generarIcs > UID estable", () => {
  const conIds = (parcial: Partial<Tarea> = {}) =>
    tarea({ courseId: "c1", courseWorkId: "w1", ...parcial });

  const uidDe = (t: Tarea) =>
    desdoblar(generarIcs([t])).find((l) => l.startsWith("UID:"));

  test("usa los ids de Classroom", () => {
    expect(uidDe(conIds())).toBe("UID:c1-w1@syllo.app");
  });

  test("no cambia si el usuario renombra el curso", () => {
    // Es el bug que tenía el UID viejo (hash de curso+título+fecha): el
    // calendario borraba el evento y creaba otro en su lugar.
    expect(uidDe(conIds({ curso: "Análisis Matemático II" }))).toBe(
      uidDe(conIds()),
    );
  });

  test("no cambia si se mueve la fecha de entrega", () => {
    expect(uidDe(conIds({ vencimiento: { year: 2026, month: 10, day: 1 } }))).toBe(
      uidDe(conIds()),
    );
  });

  test("distingue dos tareas del mismo curso", () => {
    expect(uidDe(conIds({ courseWorkId: "w2" }))).not.toBe(uidDe(conIds()));
  });

  test("usa el id del evento personal cuando no hay ids de Classroom", () => {
    expect(uidDe(tarea({ eventoId: "abc-123", link: "#" }))).toBe(
      "UID:evento-abc-123@syllo.app",
    );
  });
});

describe("generarIcs > recordatorio", () => {
  test("cada evento lleva una alarma el día anterior a las 9", () => {
    const lineas = desdoblar(generarIcs([tarea()]));

    expect(lineas).toContain("BEGIN:VALARM");
    expect(lineas).toContain("ACTION:DISPLAY");
    // DTSTART es la medianoche del día de entrega: 15 horas antes son las 9
    // de la mañana del día anterior.
    expect(lineas).toContain("TRIGGER;RELATED=START:-PT15H");
    expect(lineas).toContain("END:VALARM");
  });

  test("la alarma va adentro del VEVENT", () => {
    const lineas = desdoblar(generarIcs([tarea()]));
    const inicioEvento = lineas.indexOf("BEGIN:VEVENT");
    const finEvento = lineas.indexOf("END:VEVENT");
    const alarma = lineas.indexOf("BEGIN:VALARM");

    expect(alarma).toBeGreaterThan(inicioEvento);
    expect(alarma).toBeLessThan(finEvento);
  });
});

describe("generarIcs > opciones", () => {
  test("aplica los renombres de curso al SUMMARY", () => {
    const lineas = desdoblar(
      generarIcs([tarea()], { renombres: { Análisis: "AM2" } }),
    );

    expect(lineas).toContain("SUMMARY:AM2: TP 1");
  });

  test("solo el feed lleva las cabeceras de refresco", () => {
    expect(desdoblar(generarIcs([tarea()]))).not.toContain(
      "X-PUBLISHED-TTL:PT6H",
    );

    const feed = desdoblar(generarIcs([tarea()], { comoFeed: true }));
    expect(feed).toContain("REFRESH-INTERVAL;VALUE=DURATION:PT6H");
    expect(feed).toContain("X-PUBLISHED-TTL:PT6H");
  });

  test("el nombre del calendario es configurable", () => {
    expect(desdoblar(generarIcs([], { nombre: "Cursada" }))).toContain(
      "X-WR-CALNAME:Cursada",
    );
  });
});

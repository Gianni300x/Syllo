import { describe, expect, it } from "vitest";
import { parsearCalendarioCvg } from "@/features/cvg/services/ics-parser";

describe("parsearCalendarioCvg", () => {
  it("lee eventos de Moodle, líneas plegadas y texto escapado", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:actividad-1@cvg",
      "DTSTART;VALUE=DATE:20261003",
      "SUMMARY:Entrega de TP\\, segunda parte",
      "DESCRIPTION:Curso: Algoritmos y Estructuras de Datos\\nVer consign",
      " a en https://frro.cvg.utn.edu.ar/mod/assign/view.php?id=10",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    expect(parsearCalendarioCvg(ics)).toEqual([
      {
        id: "actividad-1@cvg",
        titulo: "Entrega de TP, segunda parte",
        descripcion:
          "Curso: Algoritmos y Estructuras de Datos\nVer consigna en https://frro.cvg.utn.edu.ar/mod/assign/view.php?id=10",
        curso: "Algoritmos y Estructuras de Datos",
        fecha: { year: 2026, month: 10, day: 3 },
        link: "https://frro.cvg.utn.edu.ar/mod/assign/view.php?id=10",
      },
    ]);
  });

  it("ordena por fecha y descarta eventos incompletos", () => {
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:dos
DTSTART:20261202T180000
SUMMARY:Segundo
CATEGORIES:Física
URL:https://frro.cvg.utn.edu.ar/calendar/view.php
END:VEVENT
BEGIN:VEVENT
UID:sin-fecha
SUMMARY:No aparece
END:VEVENT
BEGIN:VEVENT
UID:uno
DTSTART;VALUE=DATE:20261101
SUMMARY:Primero
END:VEVENT
END:VCALENDAR`;

    expect(parsearCalendarioCvg(ics).map((evento) => evento.id)).toEqual([
      "uno",
      "dos",
    ]);
  });

  it("rechaza contenido que no es ICS", () => {
    expect(() => parsearCalendarioCvg("<html>login</html>")).toThrow(
      "calendario válido",
    );
  });
});

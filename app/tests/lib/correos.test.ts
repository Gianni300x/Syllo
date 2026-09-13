import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import {
  detectarCurso,
  detectarOrigen,
  formatearFechaCorreo,
  parsearRemitente,
} from "../../app/lib/correos";

const HOY = new Date(2026, 8, 12, 12, 0, 0); // 12 de septiembre de 2026

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(HOY);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("detectarCurso", () => {
  const cursos = ["Historia", "Historia del Arte", "Análisis Matemático I"];

  test("elige el nombre más largo que aparezca", () => {
    // Si eligiera el primero que matchea, "Historia del Arte" se etiquetaría
    // como "Historia" y el filtro del sidebar mezclaría las dos materias.
    expect(detectarCurso("Nuevo trabajo: TP1 - Historia del Arte", cursos)).toBe(
      "Historia del Arte",
    );
  });

  test("igual reconoce el curso corto cuando es el que está", () => {
    expect(detectarCurso("Nuevo trabajo: TP1 - Historia", cursos)).toBe(
      "Historia",
    );
  });

  test("ignora tildes y mayúsculas", () => {
    expect(detectarCurso("entrega de ANALISIS MATEMATICO I", cursos)).toBe(
      "Análisis Matemático I",
    );
  });

  test("devuelve null si no hay ninguno", () => {
    expect(detectarCurso("Novedades del campus", cursos)).toBeNull();
    expect(detectarCurso("Historia", [])).toBeNull();
  });
});

describe("parsearRemitente", () => {
  test("separa nombre y mail", () => {
    expect(parsearRemitente('"Google Classroom" <no-reply@classroom.google.com>')).toEqual(
      { nombre: "Google Classroom", email: "no-reply@classroom.google.com" },
    );
  });

  test("sin comillas también", () => {
    expect(parsearRemitente("Campus Virtual <noreply@frro.utn.edu.ar>")).toEqual({
      nombre: "Campus Virtual",
      email: "noreply@frro.utn.edu.ar",
    });
  });

  test("si solo hay mail, el nombre es el mail", () => {
    expect(parsearRemitente("noreply@frro.utn.edu.ar")).toEqual({
      nombre: "noreply@frro.utn.edu.ar",
      email: "noreply@frro.utn.edu.ar",
    });
  });
});

describe("detectarOrigen", () => {
  test("el dominio de la UTN es CVG", () => {
    expect(detectarOrigen("noreply@frro.utn.edu.ar")).toBe("CVG");
    expect(detectarOrigen("NOREPLY@FRRO.UTN.EDU.AR")).toBe("CVG");
  });

  test("el resto es Classroom", () => {
    expect(detectarOrigen("no-reply@classroom.google.com")).toBe("Classroom");
  });
});

describe("formatearFechaCorreo", () => {
  test("si es de hoy muestra la hora, no la fecha", () => {
    const hoyTemprano = new Date(2026, 8, 12, 9, 30).toISOString();
    // Sin anclar el final a propósito: el formato exacto lo decide el ICU de
    // Node (hoy agrega "a. m."). Lo que importa es que muestre hora y minutos
    // y no un día, no la variante de localización.
    expect(formatearFechaCorreo(hoyTemprano)).toMatch(/^\d{2}:\d{2}/);
  });

  test("si es de este año, día y mes", () => {
    expect(formatearFechaCorreo(new Date(2026, 8, 9, 10, 0).toISOString())).toBe(
      "9 sept",
    );
  });

  test("si es de otro año, además el año", () => {
    expect(formatearFechaCorreo(new Date(2025, 2, 4, 10, 0).toISOString())).toBe(
      "4 mar 2025",
    );
  });

  test("una fecha inválida no rompe", () => {
    expect(formatearFechaCorreo("no es una fecha")).toBe("");
  });
});

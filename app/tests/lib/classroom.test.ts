import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import {
  diasHastaVencimiento,
  estaCompletada,
  etiquetaVencimiento,
  fechaVencimiento,
  formatearFecha,
  type Tarea,
} from "../../app/lib/classroom";

/**
 * Fecha de referencia de toda la suite. Sin congelar el reloj, cualquier test
 * sobre `diasHastaVencimiento` pasaría o fallaría según el día en que se corra.
 * Mediodía a propósito: así un corrimiento de horas no cambia el día.
 */
const HOY = new Date(2026, 8, 12, 12, 0, 0); // 12 de septiembre de 2026

beforeEach(() => {
  vi.useFakeTimers();
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
    vencimiento: null,
    estado: "CREATED",
    link: "https://classroom.google.com/x",
    ...parcial,
  };
}

describe("diasHastaVencimiento", () => {
  test("hoy es 0", () => {
    expect(diasHastaVencimiento({ year: 2026, month: 9, day: 12 })).toBe(0);
  });

  test("mañana es 1 y ayer es -1", () => {
    expect(diasHastaVencimiento({ year: 2026, month: 9, day: 13 })).toBe(1);
    expect(diasHastaVencimiento({ year: 2026, month: 9, day: 11 })).toBe(-1);
  });

  test("cruza el fin de mes sin equivocarse", () => {
    // Del 12 de septiembre al 1 de octubre hay 19 días.
    expect(diasHastaVencimiento({ year: 2026, month: 10, day: 1 })).toBe(19);
  });

  test("sin vencimiento devuelve null", () => {
    expect(diasHastaVencimiento(null)).toBeNull();
  });
});

describe("fechaVencimiento", () => {
  test("arma la fecha local a medianoche", () => {
    const fecha = fechaVencimiento({ year: 2026, month: 9, day: 12 });
    expect(fecha?.getFullYear()).toBe(2026);
    // El mes de `Date` va de 0 a 11: septiembre es 8.
    expect(fecha?.getMonth()).toBe(8);
    expect(fecha?.getDate()).toBe(12);
    expect(fecha?.getHours()).toBe(0);
  });
});

describe("estaCompletada", () => {
  test("TURNED_IN y RETURNED cuentan como entregadas", () => {
    expect(estaCompletada(tarea({ estado: "TURNED_IN" }))).toBe(true);
    expect(estaCompletada(tarea({ estado: "RETURNED" }))).toBe(true);
  });

  test("CREATED no", () => {
    expect(estaCompletada(tarea({ estado: "CREATED" }))).toBe(false);
  });
});

describe("formatearFecha", () => {
  test("día y mes abreviado", () => {
    expect(formatearFecha({ year: 2026, month: 9, day: 12 })).toBe("12 sept");
    expect(formatearFecha({ year: 2026, month: 1, day: 3 })).toBe("3 ene");
  });

  test("sin fecha lo dice", () => {
    expect(formatearFecha(null)).toBe("Sin fecha");
  });
});

describe("etiquetaVencimiento", () => {
  test("cubre los cuatro casos", () => {
    expect(etiquetaVencimiento(null)).toBe("Sin fecha");
    expect(etiquetaVencimiento(-3)).toBe("Vencido hace 3d");
    expect(etiquetaVencimiento(0)).toBe("Vence hoy");
    expect(etiquetaVencimiento(1)).toBe("Vence mañana");
    expect(etiquetaVencimiento(5)).toBe("5 días restantes");
  });
});

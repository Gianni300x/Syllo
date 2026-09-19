import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import {
  claveTarea,
  cuentaRegresivaEvento,
  diasHastaVencimiento,
  estaCompletada,
  etiquetaVencimiento,
  fechaVencimiento,
  formatearFecha,
  type Tarea,
} from "@/features/tareas/services/classroom";

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
    calificacion: null,
    entregaTarde: false,
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

describe("claveTarea", () => {
  const base: Tarea = {
    curso: "Análisis",
    titulo: "TP 4",
    descripcion: "",
    puntos: null,
    vencimiento: null,
    estado: "CREATED",
    calificacion: null,
    entregaTarde: false,
    link: "https://classroom.google.com/x",
  };

  test("arma la clave con los dos ids de Classroom", () => {
    expect(claveTarea({ ...base, courseId: "c1", courseWorkId: "w1" })).toBe(
      "c1/w1",
    );
  });

  test("no depende del nombre del curso, del título ni de la fecha", () => {
    const antes = { ...base, courseId: "c1", courseWorkId: "w1" };
    const despues = {
      ...antes,
      curso: "Análisis Matemático II",
      titulo: "TP 4 (reprogramado)",
      vencimiento: { year: 2026, month: 10, day: 1 },
    };

    expect(claveTarea(despues)).toBe(claveTarea(antes));
  });

  test("devuelve null para un evento personal", () => {
    expect(claveTarea({ ...base, eventoId: "e1" })).toBeNull();
  });

  test("devuelve null si falta alguno de los dos ids", () => {
    expect(claveTarea({ ...base, courseId: "c1" })).toBeNull();
    expect(claveTarea({ ...base, courseWorkId: "w1" })).toBeNull();
  });
});

describe("cuentaRegresivaEvento", () => {
  // HOY = 12 de septiembre de 2026
  test("si está completada, devuelve Completado", () => {
    const res = cuentaRegresivaEvento({ year: 2026, month: 9, day: 15 }, true);
    expect(res).toEqual({
      texto: "Completado",
      dias: 0,
      tipo: "completado",
    });
  });

  test("evento de hoy", () => {
    const res = cuentaRegresivaEvento({ year: 2026, month: 9, day: 12 });
    expect(res).toEqual({
      texto: "Hoy (0 días)",
      dias: 0,
      tipo: "hoy",
    });
  });

  test("evento de mañana", () => {
    const res = cuentaRegresivaEvento({ year: 2026, month: 9, day: 13 });
    expect(res).toEqual({
      texto: "Falta 1 día",
      dias: 1,
      tipo: "manana",
    });
  });

  test("evento en varios días", () => {
    const res = cuentaRegresivaEvento({ year: 2026, month: 9, day: 17 });
    expect(res).toEqual({
      texto: "Faltan 5 días",
      dias: 5,
      tipo: "proximo",
    });
  });

  test("evento pasado (ayer y hace varios días)", () => {
    const ayer = cuentaRegresivaEvento({ year: 2026, month: 9, day: 11 });
    expect(ayer).toEqual({
      texto: "Pasó ayer",
      dias: -1,
      tipo: "pasado",
    });

    const pasado = cuentaRegresivaEvento({ year: 2026, month: 9, day: 8 });
    expect(pasado).toEqual({
      texto: "Pasó hace 4 días",
      dias: -4,
      tipo: "pasado",
    });
  });

  test("sin vencimiento devuelve null", () => {
    expect(cuentaRegresivaEvento(null)).toBeNull();
  });
});

import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { Tarea } from "../../app/lib/classroom";
import {
  clasificarTareas,
  contarPendientesPorCurso,
} from "../../app/lib/tareas-service";

const HOY = new Date(2026, 8, 12, 12, 0, 0); // 12 de septiembre de 2026

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(HOY);
});

afterAll(() => {
  vi.useRealTimers();
});

/** Tarea que vence dentro de `dias` días (negativo = ya venció). */
function enDias(dias: number, parcial: Partial<Tarea> = {}): Tarea {
  const fecha = new Date(2026, 8, 12 + dias);
  return {
    curso: "Análisis",
    titulo: `TP ${dias}`,
    descripcion: "",
    puntos: null,
    vencimiento: {
      year: fecha.getFullYear(),
      month: fecha.getMonth() + 1,
      day: fecha.getDate(),
    },
    estado: "CREATED",
    link: "https://classroom.google.com/x",
    ...parcial,
  };
}

const titulos = (tareas: Tarea[]) => tareas.map((t) => t.titulo);

describe("clasificarTareas", () => {
  test("lo que vence hoy es urgente y de esta semana, no vencido", () => {
    const { pendientes, urgentes, estaSemana, vencidas } = clasificarTareas([
      enDias(0),
    ]);
    expect(titulos(pendientes)).toEqual(["TP 0"]);
    expect(titulos(urgentes)).toEqual(["TP 0"]);
    expect(titulos(estaSemana)).toEqual(["TP 0"]);
    expect(vencidas).toHaveLength(0);
  });

  test("el borde de urgente está en 3 días", () => {
    const { urgentes } = clasificarTareas([enDias(3), enDias(4)]);
    expect(titulos(urgentes)).toEqual(["TP 3"]);
  });

  test("el borde de esta semana está en 7 días", () => {
    const { estaSemana } = clasificarTareas([enDias(7), enDias(8)]);
    expect(titulos(estaSemana)).toEqual(["TP 7"]);
  });

  test("el borde de vencida reciente está en 30 días", () => {
    const { vencidas, vencidasRecientes } = clasificarTareas([
      enDias(-30),
      enDias(-31),
    ]);
    // Las dos están vencidas...
    expect(titulos(vencidas)).toEqual(["TP -30", "TP -31"]);
    // ...pero solo una entra en la pestaña, que se limita a 30 días.
    expect(titulos(vencidasRecientes)).toEqual(["TP -30"]);
  });

  test("una tarea sin fecha queda pendiente, no vencida ni urgente", () => {
    const sinFecha = enDias(0, { titulo: "Sin fecha", vencimiento: null });
    const { pendientes, vencidas, urgentes, estaSemana } = clasificarTareas([
      sinFecha,
    ]);
    expect(titulos(pendientes)).toEqual(["Sin fecha"]);
    expect(vencidas).toHaveLength(0);
    expect(urgentes).toHaveLength(0);
    expect(estaSemana).toHaveLength(0);
  });

  test("una entregada no aparece en ninguna categoría de pendientes", () => {
    const entregada = enDias(-5, { estado: "TURNED_IN" });
    const { pendientes, vencidas, urgentes, estaSemana, completadas } =
      clasificarTareas([entregada]);
    expect(pendientes).toHaveLength(0);
    expect(vencidas).toHaveLength(0);
    expect(urgentes).toHaveLength(0);
    expect(estaSemana).toHaveLength(0);
    expect(titulos(completadas)).toEqual(["TP -5"]);
  });
});

describe("contarPendientesPorCurso", () => {
  test("cuenta por curso y saltea las entregadas", () => {
    const conteo = contarPendientesPorCurso([
      enDias(1, { curso: "Análisis" }),
      enDias(2, { curso: "Análisis" }),
      enDias(3, { curso: "Física" }),
      enDias(4, { curso: "Física", estado: "TURNED_IN" }),
    ]);
    expect(conteo).toEqual({ Análisis: 2, Física: 1 });
  });

  test("sin tareas devuelve un objeto vacío", () => {
    expect(contarPendientesPorCurso([])).toEqual({});
  });
});

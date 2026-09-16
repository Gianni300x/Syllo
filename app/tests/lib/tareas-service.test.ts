import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { Tarea } from "../../src/app/lib/classroom";
import {
  aplicarEstados,
  tareaDelFeedComoTarea,
  tareasParaFeed,
  clasificarTareas,
  contarPendientesPorCurso,
  ordenarPorPrioridad,
} from "../../src/app/lib/tareas-service";

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

describe("clasificarTareas > empezadas", () => {
  test("junta las pendientes que el alumno marcó como empezadas", () => {
    const tareas = [
      enDias(3, { titulo: "Empezada", empezada: true }),
      enDias(4, { titulo: "Ni tocada" }),
      enDias(-2, { titulo: "Vencida empezada", empezada: true }),
      enDias(1, { titulo: "Entregada empezada", estado: "TURNED_IN", empezada: true }),
    ];

    const { empezadas } = clasificarTareas(tareas);

    // Solo las pendientes: una vencida o ya entregada no es "en progreso".
    expect(titulos(empezadas)).toEqual(["Empezada"]);
  });
});

describe("aplicarEstados", () => {
  test("pega el estado propio cruzando por courseId/courseWorkId", () => {
    const tareas = [
      enDias(3, { titulo: "TP con estado", courseId: "c1", courseWorkId: "w1" }),
      enDias(5, { titulo: "TP sin estado", courseId: "c1", courseWorkId: "w2" }),
    ];

    const [conEstado, sinEstado] = aplicarEstados(tareas, {
      "c1/w1": { empezada: true, fijada: true },
    });

    expect(conEstado.empezada).toBe(true);
    expect(conEstado.fijada).toBe(true);
    expect(sinEstado.empezada).toBeUndefined();
    expect(sinEstado.fijada).toBeUndefined();
  });

  test("deja pasar intactas las tareas sin ids (los eventos personales)", () => {
    const evento = enDias(1, { titulo: "Final", eventoId: "e1" });

    const [resultado] = aplicarEstados([evento], {
      "c1/w1": { empezada: true, fijada: true },
    });

    expect(resultado).toEqual(evento);
  });

  test("no muta las tareas originales", () => {
    const tarea = enDias(2, { courseId: "c1", courseWorkId: "w1" });

    aplicarEstados([tarea], { "c1/w1": { empezada: true, fijada: false } });

    expect(tarea.empezada).toBeUndefined();
  });
});

describe("ordenarPorPrioridad", () => {
  test("las fijadas van primero aunque venzan mucho después", () => {
    const tareas = [
      enDias(1, { titulo: "Urgente" }),
      enDias(20, { titulo: "Lejana fijada", fijada: true }),
      enDias(5, { titulo: "Del medio" }),
    ];

    expect(titulos(ordenarPorPrioridad(tareas))).toEqual([
      "Lejana fijada",
      "Urgente",
      "Del medio",
    ]);
  });

  test("dentro de cada grupo ordena por cercanía de la entrega", () => {
    const tareas = [
      enDias(9, { titulo: "Fijada lejana", fijada: true }),
      enDias(2, { titulo: "Fijada cercana", fijada: true }),
      enDias(8, { titulo: "Suelta lejana" }),
      enDias(4, { titulo: "Suelta cercana" }),
    ];

    expect(titulos(ordenarPorPrioridad(tareas))).toEqual([
      "Fijada cercana",
      "Fijada lejana",
      "Suelta cercana",
      "Suelta lejana",
    ]);
  });

  test("las tareas sin fecha quedan al final", () => {
    const tareas = [
      enDias(3, { titulo: "Con fecha" }),
      { ...enDias(3, { titulo: "Sin fecha" }), vencimiento: null },
    ];

    expect(titulos(ordenarPorPrioridad(tareas))).toEqual([
      "Con fecha",
      "Sin fecha",
    ]);
  });

  test("no muta el array original", () => {
    const tareas = [
      enDias(9, { titulo: "Lejana" }),
      enDias(1, { titulo: "Cercana" }),
    ];

    ordenarPorPrioridad(tareas);

    expect(titulos(tareas)).toEqual(["Lejana", "Cercana"]);
  });
});

describe("tareasParaFeed", () => {
  test("solo publica entregas pendientes, con fecha y con ids", () => {
    const tareas = [
      enDias(3, { titulo: "Va", courseId: "c1", courseWorkId: "w1" }),
      enDias(3, {
        titulo: "Entregada",
        estado: "TURNED_IN",
        courseId: "c1",
        courseWorkId: "w2",
      }),
      {
        ...enDias(3, { titulo: "Sin fecha", courseId: "c1", courseWorkId: "w3" }),
        vencimiento: null,
      },
      enDias(3, { titulo: "Evento personal", eventoId: "e1" }),
    ];

    expect(tareasParaFeed(tareas).map((t) => t.titulo)).toEqual(["Va"]);
  });

  test("guarda lo justo para el VEVENT, sin la descripción", () => {
    const [guardada] = tareasParaFeed([
      enDias(1, {
        descripcion: "Resolver los ejercicios del capítulo 3",
        courseId: "c1",
        courseWorkId: "w1",
      }),
    ]);

    expect(Object.keys(guardada).sort()).toEqual([
      "courseId",
      "courseWorkId",
      "curso",
      "link",
      "titulo",
      "vencimiento",
    ]);
  });

  test("la ida y vuelta conserva la clave, que es lo que fija el UID", () => {
    const original = enDias(2, { courseId: "c1", courseWorkId: "w1" });
    const [guardada] = tareasParaFeed([original]);
    const vuelta = tareaDelFeedComoTarea(guardada);

    expect(vuelta.courseId).toBe("c1");
    expect(vuelta.courseWorkId).toBe("w1");
    expect(vuelta.vencimiento).toEqual(original.vencimiento);
  });
});

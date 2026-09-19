import { describe, expect, test } from "vitest";
import {
  calificacionesDesdeTareas,
  contarCalificacionesPorCurso,
  resumirCalificaciones,
} from "@/features/calificaciones/services/calificaciones";
import type { Tarea } from "@/features/tareas/types";

function tarea(parcial: Partial<Tarea> = {}): Tarea {
  return {
    curso: "Análisis",
    titulo: "TP 1",
    descripcion: "",
    puntos: 10,
    vencimiento: null,
    estado: "CREATED",
    calificacion: null,
    entregaTarde: false,
    link: "https://classroom.google.com/x",
    courseId: "c1",
    courseWorkId: "w1",
    ...parcial,
  };
}

describe("calificacionesDesdeTareas", () => {
  test("incluye trabajos calificados y entregas esperando corrección", () => {
    const resultado = calificacionesDesdeTareas([
      tarea({ titulo: "Corregido", estado: "RETURNED", calificacion: 8 }),
      tarea({ titulo: "En espera", estado: "TURNED_IN", courseWorkId: "w2" }),
      tarea({ titulo: "Pendiente", estado: "CREATED", courseWorkId: "w3" }),
    ]);

    expect(resultado.map((item) => item.titulo)).toEqual(["Corregido", "En espera"]);
    expect(resultado.map((item) => item.estado)).toEqual([
      "calificada",
      "sin_calificar",
    ]);
  });

  test("conserva una nota cero y la marca como calificada", () => {
    const [resultado] = calificacionesDesdeTareas([
      tarea({ estado: "RETURNED", calificacion: 0 }),
    ]);

    expect(resultado.puntosObtenidos).toBe(0);
    expect(resultado.estado).toBe("calificada");
  });
});

describe("resumirCalificaciones", () => {
  test("calcula el promedio porcentual solo cuando hay puntaje máximo", () => {
    const items = calificacionesDesdeTareas([
      tarea({ calificacion: 8, estado: "RETURNED" }),
      tarea({ calificacion: 15, puntos: 20, estado: "RETURNED", courseWorkId: "w2" }),
      tarea({ calificacion: 9, puntos: null, estado: "RETURNED", courseWorkId: "w3" }),
      tarea({ estado: "TURNED_IN", courseWorkId: "w4" }),
    ]);

    expect(resumirCalificaciones(items)).toEqual({
      calificadas: 3,
      sinCalificar: 1,
      promedioPorcentual: 78,
    });
  });
});

describe("contarCalificacionesPorCurso", () => {
  test("publica el conteo que usa el filtro de cursos", () => {
    const items = calificacionesDesdeTareas([
      tarea({ calificacion: 8, estado: "RETURNED" }),
      tarea({ curso: "Física", estado: "TURNED_IN", courseWorkId: "w2" }),
    ]);

    expect(contarCalificacionesPorCurso(items)).toEqual({ Análisis: 1, Física: 1 });
  });
});

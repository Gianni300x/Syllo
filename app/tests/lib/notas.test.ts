import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import {
  contarNotasPorCurso,
  contenidoComoHtml,
  esHtml,
  estaVacio,
  fechaRelativa,
  filtrarNotas,
  nombreArchivoMd,
  notaAMarkdown,
  resumen,
  textoPlano,
  tituloMostrado,
  type Nota,
} from "../../app/lib/notas";

const HOY = new Date(2026, 8, 12, 12, 0, 0); // 12 de septiembre de 2026

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(HOY);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("esHtml", () => {
  test("reconoce el HTML del editor nuevo", () => {
    expect(esHtml("<p>Hola</p>")).toBe(true);
    expect(esHtml("  <ul><li>a</li></ul>")).toBe(true);
  });

  test("el markdown viejo no es HTML", () => {
    expect(esHtml("## Temas")).toBe(false);
    expect(esHtml("- Integrales")).toBe(false);
    expect(esHtml("")).toBe(false);
    // Un "<" suelto en el texto no alcanza: tiene que abrir una etiqueta.
    expect(esHtml("2 < 3")).toBe(false);
  });
});

describe("contenidoComoHtml", () => {
  test("convierte el markdown viejo", () => {
    expect(contenidoComoHtml("- Integrales")).toBe(
      "<ul><li>Integrales</li></ul>",
    );
  });

  test("deja intacto el HTML que ya está en el formato nuevo", () => {
    const html = "<p>Parcial el <strong>lunes</strong></p>";
    expect(contenidoComoHtml(html)).toBe(html);
  });

  test("una nota vacía queda vacía", () => {
    expect(contenidoComoHtml("")).toBe("");
    expect(contenidoComoHtml("   ")).toBe("");
  });
});

describe("estaVacio", () => {
  test("el documento vacío de Tiptap cuenta como vacío", () => {
    // Si esto fallara se guardarían notas en blanco con marcado fantasma.
    expect(estaVacio("<p></p>")).toBe(true);
    expect(estaVacio("<p><br></p>")).toBe(true);
    expect(estaVacio("")).toBe(true);
  });

  test("una nota con texto no está vacía", () => {
    expect(estaVacio("<p>Hola</p>")).toBe(false);
    expect(estaVacio("Hola")).toBe(false);
  });
});

describe("textoPlano", () => {
  test("saca las etiquetas del HTML", () => {
    expect(textoPlano("<p>Parcial el <strong>lunes</strong></p>").trim()).toBe(
      "Parcial el lunes",
    );
  });

  test("separa los bloques con saltos de línea", () => {
    expect(textoPlano("<li>Uno</li><li>Dos</li>").trim()).toBe("Uno\nDos");
  });

  test("decodifica las entidades", () => {
    expect(textoPlano("<p>2 &lt; 3 &amp; 4 &gt; 1</p>").trim()).toBe(
      "2 < 3 & 4 > 1",
    );
  });

  test("sobre markdown viejo saca las marcas", () => {
    expect(textoPlano("**Parcial**").trim()).toBe("Parcial");
  });
});

describe("tituloMostrado", () => {
  test("usa el título cuando hay", () => {
    expect(tituloMostrado({ titulo: "Álgebra", contenido: "<p>x</p>" })).toBe(
      "Álgebra",
    );
  });

  test("sin título, deriva la primera línea sin marcas", () => {
    expect(tituloMostrado({ titulo: "", contenido: "## Temas\nMás" })).toBe(
      "Temas",
    );
  });

  test("sin nada, un placeholder", () => {
    expect(tituloMostrado({ titulo: "", contenido: "" })).toBe("Sin título");
  });
});

describe("resumen", () => {
  test("colapsa los espacios y no lleva etiquetas", () => {
    expect(resumen("<p>Parcial   el\n\nlunes</p>")).toBe("Parcial el lunes");
  });

  test("recorta con puntos suspensivos", () => {
    const largo = resumen("a".repeat(200), 10);
    expect(largo).toBe(`${"a".repeat(10)}…`);
  });

  test("si entra, no recorta", () => {
    expect(resumen("corto", 10)).toBe("corto");
  });
});

describe("fechaRelativa", () => {
  const haceMinutos = (m: number) =>
    new Date(HOY.getTime() - m * 60_000).toISOString();

  test("cubre la escala de tiempos", () => {
    expect(fechaRelativa(HOY.toISOString())).toBe("recién");
    expect(fechaRelativa(haceMinutos(5))).toBe("hace 5 min");
    expect(fechaRelativa(haceMinutos(60 * 3))).toBe("hace 3 h");
    expect(fechaRelativa(haceMinutos(60 * 24))).toBe("ayer");
    expect(fechaRelativa(haceMinutos(60 * 24 * 5))).toBe("hace 5 días");
  });

  test("más de un mes muestra la fecha", () => {
    expect(fechaRelativa(haceMinutos(60 * 24 * 60))).toContain("2026");
  });
});

function nota(parcial: Partial<Nota> = {}): Nota {
  return {
    id: Math.random().toString(36).slice(2),
    titulo: "Sin título",
    contenido: "",
    curso: null,
    createdAt: HOY.toISOString(),
    updatedAt: HOY.toISOString(),
    ...parcial,
  };
}

const titulos = (notas: Nota[]) => notas.map((n) => n.titulo);

describe("filtrarNotas", () => {
  const notas = [
    nota({ titulo: "Resumen de límites", curso: "Análisis" }),
    nota({ titulo: "Fórmulas", curso: "Física" }),
    nota({ titulo: "Lista del súper", curso: null }),
  ];

  test("sin filtro ni búsqueda devuelve todo", () => {
    expect(filtrarNotas(notas, [], "")).toHaveLength(3);
  });

  test("filtra por los cursos seleccionados en el sidebar", () => {
    expect(titulos(filtrarNotas(notas, ["Análisis"], ""))).toEqual([
      "Resumen de límites",
    ]);
  });

  test("con cursos seleccionados, las notas sin curso quedan afuera", () => {
    const resultado = filtrarNotas(notas, ["Análisis", "Física"], "");
    expect(titulos(resultado)).not.toContain("Lista del súper");
  });

  test("busca en el título sin importar tildes ni mayúsculas", () => {
    expect(titulos(filtrarNotas(notas, [], "LIMITES"))).toEqual([
      "Resumen de límites",
    ]);
  });

  test("busca dentro del contenido, sea HTML o markdown viejo", () => {
    const conContenido = [
      nota({ titulo: "Una", contenido: "<p>derivadas parciales</p>" }),
      nota({ titulo: "Otra", contenido: "## Repaso de **integrales**" }),
    ];

    expect(titulos(filtrarNotas(conContenido, [], "parciales"))).toEqual(["Una"]);
    expect(titulos(filtrarNotas(conContenido, [], "integrales"))).toEqual(["Otra"]);
  });

  test("busca por el nombre corto que el usuario le puso al curso", () => {
    const resultado = filtrarNotas(notas, [], "am2", { Análisis: "AM2" });
    expect(titulos(resultado)).toEqual(["Resumen de límites"]);
  });

  test("el filtro del sidebar y la búsqueda se aplican juntos", () => {
    expect(filtrarNotas(notas, ["Física"], "límites")).toEqual([]);
  });
});

describe("contarNotasPorCurso", () => {
  test("cuenta por curso y saltea las notas sueltas", () => {
    const conteo = contarNotasPorCurso([
      nota({ curso: "Análisis" }),
      nota({ curso: "Análisis" }),
      nota({ curso: "Física" }),
      nota({ curso: null }),
    ]);

    expect(conteo).toEqual({ Análisis: 2, Física: 1 });
  });
});

describe("notaAMarkdown", () => {
  test("combina título y contenido HTML en Markdown", () => {
    const res = notaAMarkdown({
      titulo: "Fórmulas de Física",
      contenido: "<p>Velocidad: <em>v = d / t</em></p>",
    });
    expect(res).toBe("# Fórmulas de Física\n\nVelocidad: *v = d / t*");
  });

  test("no duplica el título si el contenido ya comienza con el encabezado", () => {
    const res = notaAMarkdown({
      titulo: "Resumen",
      contenido: "<h2>Resumen</h2><p>Texto</p>",
    });
    expect(res).toBe("## Resumen\n\nTexto");
  });

  test("si no tiene título, devuelve solo el contenido", () => {
    const res = notaAMarkdown({
      titulo: "",
      contenido: "<p>Nota sin título</p>",
    });
    expect(res).toBe("Nota sin título");
  });

  test("si no tiene contenido, devuelve el título", () => {
    const res = notaAMarkdown({
      titulo: "Solo Título",
      contenido: "",
    });
    expect(res).toBe("# Solo Título");
  });
});

describe("nombreArchivoMd", () => {
  test("convierte espacios a guiones y remueve caracteres prohibidos", () => {
    expect(nombreArchivoMd("Mi Nota / 2026: Álgebra")).toBe(
      "mi-nota-2026-algebra",
    );
  });

  test("devuelve fallback si queda vacío", () => {
    expect(nombreArchivoMd("   ")).toBe("nota");
    expect(nombreArchivoMd("???")).toBe("nota");
  });
});


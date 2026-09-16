import { describe, expect, test } from "vitest";
import { normalizar } from "../../src/app/lib/texto";

describe("normalizar", () => {
  test("saca tildes, mayúsculas y espacios de los bordes", () => {
    expect(normalizar("  Análisis Matemático  ")).toBe("analisis matematico");
  });

  test("la ñ también se descompone, así 'diseno' encuentra 'Diseño'", () => {
    expect(normalizar("Diseño")).toBe("diseno");
  });

  test("permite comparar lo escrito con y sin tildes", () => {
    expect(normalizar("límites").includes(normalizar("LIMITES"))).toBe(true);
  });
});

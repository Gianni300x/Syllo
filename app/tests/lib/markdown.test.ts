import { describe, expect, test } from "vitest";
import { quitarMarcas, renderMarkdown } from "../../app/lib/markdown";

describe("renderMarkdown", () => {
  test("convierte listas escritas con saltos de Windows (CRLF)", () => {
    // Este es el bug que se escapó: en JS `.` no matchea `\r`, así que el `$`
    // de los patrones fallaba y la lista quedaba como un párrafo con guiones.
    expect(renderMarkdown("- Integrales\r\n- Límites")).toBe(
      "<ul><li>Integrales</li><li>Límites</li></ul>",
    );
  });

  test("da el mismo resultado con LF que con CRLF", () => {
    const lf = "## Temas\n- Integrales";
    const crlf = "## Temas\r\n- Integrales";
    expect(renderMarkdown(crlf)).toBe(renderMarkdown(lf));
  });

  test("títulos, negrita e itálica", () => {
    expect(renderMarkdown("## Temas")).toBe("<h3>Temas</h3>");
    expect(renderMarkdown("**Parcial** el _lunes_")).toBe(
      "<p><strong>Parcial</strong> el <em>lunes</em></p>",
    );
  });

  test("una línea en blanco separa párrafos", () => {
    expect(renderMarkdown("Uno\n\nDos")).toBe("<p>Uno</p><p>Dos</p>");
  });

  test("líneas seguidas van en el mismo párrafo con salto", () => {
    expect(renderMarkdown("Uno\nDos")).toBe("<p>Uno<br />Dos</p>");
  });

  test("contenido vacío no genera nada", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("   \n  ")).toBe("");
  });

  describe("seguridad", () => {
    test("escapa el HTML del usuario en vez de ejecutarlo", () => {
      const salida = renderMarkdown('<img src=x onerror="alert(1)">');
      expect(salida).toBe(
        "<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>",
      );
      expect(salida).not.toContain("<img");
    });

    test("un link javascript: no genera un ancla", () => {
      const salida = renderMarkdown("[click](javascript:alert(1))");
      expect(salida).not.toContain("<a ");
    });

    test("un link https sí, y se abre en otra pestaña de forma segura", () => {
      const salida = renderMarkdown("[campus](https://frro.utn.edu.ar)");
      expect(salida).toContain('href="https://frro.utn.edu.ar"');
      expect(salida).toContain('rel="noreferrer noopener"');
    });
  });

  test("no convierte en itálica los guiones bajos dentro de una palabra", () => {
    expect(renderMarkdown("archivo_de_prueba")).toBe("<p>archivo_de_prueba</p>");
  });

  test("la salida no lleva clases: el estilo lo pone .nota-rica", () => {
    expect(renderMarkdown("## T\n- a\n\n**b**")).not.toContain("class=");
  });
});

describe("quitarMarcas", () => {
  test("deja el texto sin sintaxis markdown", () => {
    expect(quitarMarcas("## Temas")).toBe("Temas");
    expect(quitarMarcas("- Integrales")).toBe("Integrales");
    expect(quitarMarcas("**Parcial** el _lunes_")).toBe("Parcial el lunes");
    expect(quitarMarcas("[campus](https://x.com)")).toBe("campus");
  });

  test("también con saltos de Windows", () => {
    expect(quitarMarcas("- Uno\r\n- Dos")).toBe("Uno\nDos");
  });

  test("respeta los guiones bajos dentro de una palabra", () => {
    expect(quitarMarcas("archivo_de_prueba")).toBe("archivo_de_prueba");
  });
});

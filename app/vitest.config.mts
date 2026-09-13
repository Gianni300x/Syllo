import { defineConfig } from "vitest/config";

/**
 * Solo se testea la lógica pura de `app/lib/`: funciones sin I/O, que no tocan
 * la base ni las APIs de Google. Por eso alcanza con el entorno de Node, sin
 * DOM ni simulaciones.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

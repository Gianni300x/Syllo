import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Solo se testea la lógica pura de `src/`: funciones sin I/O, que no tocan
 * la base ni las APIs de Google. Por eso alcanza con el entorno de Node, sin
 * DOM ni simulaciones.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

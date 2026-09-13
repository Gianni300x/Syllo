/**
 * Piezas de formato de fecha compartidas. Viven acá porque las usan tanto
 * Tareas (`classroom.ts`) como Correos (`correos.ts`), y ninguna de las dos
 * capas tiene por qué depender de la otra.
 */

/** Meses abreviados en español, indexados por `Date.getMonth()`. */
export const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sept", "oct", "nov", "dic",
] as const;

/**
 * Mayúscula solo en la primera letra. `Intl` devuelve los días y meses en
 * minúscula ("sábado, 12 de septiembre"), y la clase `capitalize` de Tailwind
 * capitaliza cada palabra: dejaba "Sábado, 12 De Septiembre".
 */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

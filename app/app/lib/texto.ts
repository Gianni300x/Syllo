/**
 * Helpers de texto compartidos. Capa pura: sin I/O y sin DOM.
 */

/**
 * Normaliza un string para comparar y buscar: sin mayúsculas, sin tildes y sin
 * espacios en los bordes.
 *
 * Estaba copiado en `correos.ts` y en `dashboard.tsx`; con el buscador de
 * Notas iban a ser tres.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

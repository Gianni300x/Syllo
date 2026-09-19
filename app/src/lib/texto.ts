/**
 * Helpers de texto compartidos. Capa pura: sin I/O y sin DOM.
 */

/**
 * Normaliza un string para comparar y buscar: sin mayúsculas, sin tildes y sin
 * espacios en los bordes.
 *
 * Se comparte entre los buscadores de Novedades, Tareas y Notas; con el de
 * Notas iban a ser tres.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

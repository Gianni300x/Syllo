/**
 * Color determinístico por curso, según su posición en la lista de cursos
 * del usuario. Lo usan sidebar, calendario, correos, notas y curso-item —
 * por eso vive acá y no dentro de una sola feature.
 */
const COLORES_CURSO = [
  "text-sky-600",
  "text-amber-600",
  "text-emerald-600",
  "text-rose-600",
  "text-cyan-600",
  "text-violet-600",
];

const COLORES_CURSO_BG = [
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-violet-500",
];

export function colorParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO[indice % COLORES_CURSO.length];
}

export function bgParaCurso(nombre: string, listaCursos: string[]): string {
  const indice = listaCursos.indexOf(nombre);
  return COLORES_CURSO_BG[indice % COLORES_CURSO_BG.length];
}

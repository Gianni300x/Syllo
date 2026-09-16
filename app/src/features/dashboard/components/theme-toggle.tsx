"use client";

import { Moon, Sun } from "lucide-react";

import { alternarTema } from "@/app/lib/tema";

/** Dónde vive el botón: flotando sobre el panel, o embebido en una barra. */
export type VarianteTema = "flotante" | "barra";

const POSICION: Record<VarianteTema, string> = {
  // Solo escritorio: en mobile las tarjetas llegan al borde y el botón flotante
  // terminaba montado encima de su contenido.
  flotante: "fixed bottom-4 right-4 z-50 shadow-md",
  barra: "",
};

/**
 * Botón redondo para alternar el modo oscuro.
 *
 * Los dos íconos se renderizan siempre y los muestra o esconde el CSS según la
 * clase `dark` de `<html>`. Con un solo ícono elegido en JS, el servidor —que
 * no sabe el tema— dibujaba el equivocado y se veía cambiar al hidratar.
 *
 * Por lo mismo la etiqueta describe el control y no el estado: el ícono visible
 * ya dice en qué modo estás.
 */
export default function ThemeToggle({
  variante = "flotante",
  className = "",
}: {
  variante?: VarianteTema;
  className?: string;
}) {
  return (
    <button
      onClick={alternarTema}
      title="Cambiar entre modo claro y oscuro"
      aria-label="Cambiar entre modo claro y oscuro"
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${POSICION[variante]} ${className}`}
    >
      <Moon size={15} className="dark:hidden" />
      <Sun size={15} className="hidden dark:block" />
    </button>
  );
}

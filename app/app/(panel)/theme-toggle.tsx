"use client";

import { Moon, Sun } from "lucide-react";

import { EVENTO, esOscuro, useTemaOscuro } from "../lib/tema";

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
 * El tema se aplica como clase `dark` en `<html>` solo durante la sesión actual:
 * no se persiste, así que cada vez que se entra a Syllo el panel arranca en claro.
 */
export default function ThemeToggle({
  variante = "flotante",
  className = "",
}: {
  variante?: VarianteTema;
  className?: string;
}) {
  const oscuro = useTemaOscuro();

  function alternar() {
    const proximo = !esOscuro();
    document.documentElement.classList.toggle("dark", proximo);
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <button
      onClick={alternar}
      title={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 ${POSICION[variante]} ${className}`}
    >
      {oscuro ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

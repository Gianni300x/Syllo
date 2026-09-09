"use client";

import { Moon, Sun } from "lucide-react";

import { EVENTO, esOscuro, useTemaOscuro } from "../lib/tema";

/**
 * Botón redondo fijo abajo a la derecha del panel para alternar el modo oscuro.
 * El tema se aplica como clase `dark` en `<html>` y se recuerda en
 * `localStorage` ('syllo-tema'). El default es claro; un script inline en el
 * root layout aplica la preferencia guardada antes del primer paint.
 */
export default function ThemeToggle() {
  const oscuro = useTemaOscuro();

  function alternar() {
    const proximo = !esOscuro();
    document.documentElement.classList.toggle("dark", proximo);
    try {
      localStorage.setItem("syllo-tema", proximo ? "dark" : "light");
    } catch {
      /* localStorage no disponible: el tema igual cambia en esta sesión */
    }
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <button
      onClick={alternar}
      title={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
    >
      {oscuro ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

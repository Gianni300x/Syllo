"use client";

import { useSyncExternalStore } from "react";

/** Evento que dispara `ThemeToggle` al cambiar el tema. */
export const EVENTO = "syllo-tema-cambio";

function suscribir(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  return () => window.removeEventListener(EVENTO, cb);
}

/** `true` si `<html>` tiene la clase `dark`. Solo cliente. */
export const esOscuro = () => document.documentElement.classList.contains("dark");

/**
 * Hook reactivo al modo oscuro: se re-renderiza cuando `ThemeToggle` emite
 * el evento `syllo-tema-cambio`. En SSR devuelve `false` (default claro).
 */
export function useTemaOscuro(): boolean {
  return useSyncExternalStore(suscribir, esOscuro, () => false);
}

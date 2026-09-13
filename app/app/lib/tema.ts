"use client";

import { useSyncExternalStore } from "react";

/** Evento que dispara `ThemeToggle` al cambiar el tema. */
export const EVENTO = "syllo-tema-cambio";

/** Dónde queda guardada la elección explícita del usuario. */
export const CLAVE_TEMA = "syllo-tema";

function suscribir(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  return () => window.removeEventListener(EVENTO, cb);
}

/** `true` si `<html>` tiene la clase `dark`. Solo cliente. */
export const esOscuro = () => document.documentElement.classList.contains("dark");

/**
 * Alterna el tema y recuerda la elección.
 *
 * Sin nada guardado, Syllo sigue al sistema operativo (ver el script de
 * `app/layout.tsx`, que corre antes del primer pintado). Tocar el botón guarda
 * una preferencia explícita, que a partir de ahí le gana al sistema.
 *
 * El acceso a `localStorage` va en `try/catch`: en ventana privada o con las
 * cookies bloqueadas, leer o escribir tira excepción. El tema igual funciona
 * durante la sesión, solo no se recuerda.
 */
export function alternarTema(): void {
  const proximo = !esOscuro();
  document.documentElement.classList.toggle("dark", proximo);
  try {
    localStorage.setItem(CLAVE_TEMA, proximo ? "oscuro" : "claro");
  } catch {
    // Sin almacenamiento disponible: el tema vale solo para esta sesión.
  }
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Hook reactivo al modo oscuro: se re-renderiza cuando `alternarTema` emite el
 * evento `syllo-tema-cambio`.
 *
 * En el servidor devuelve `false` porque el HTML se genera sin saber el tema
 * del visitante; el script de `layout.tsx` corrige la clase de `<html>` antes
 * de que se vea nada, y React vuelve a leer el valor real al hidratar.
 */
export function useTemaOscuro(): boolean {
  return useSyncExternalStore(suscribir, esOscuro, () => false);
}

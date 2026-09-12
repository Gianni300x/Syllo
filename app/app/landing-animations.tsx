"use client";

import { motion, MotionConfig, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Proveedor de configuración global de Motion para respetar preferencias de accesibilidad.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

// Curva de animación sutil y refinada (easeOut suave tipo Apple / Linear)
const SMOOTH_EASE = [0.21, 0.47, 0.32, 0.98] as const;

/* =========================================================================
   Componentes para el Hero (se animan de inmediato al cargar la página)
   ========================================================================= */

interface HeroFadeProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  duration?: number;
}

export function HeroFadeIn({
  children,
  delay = 0,
  y = 16,
  duration = 0.55,
  className,
  ...props
}: HeroFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HeroFadeInLi({
  children,
  delay = 0,
  y = 12,
  duration = 0.45,
  className,
  ...props
}: HTMLMotionProps<"li"> & {
  delay?: number;
  y?: number;
  duration?: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.li>
  );
}

export function HeroFadeInSection({
  children,
  delay = 0,
  y = 20,
  duration = 0.65,
  className,
  ...props
}: HTMLMotionProps<"section"> & {
  delay?: number;
  y?: number;
  duration?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

/* =========================================================================
   Componentes de Scroll (se animan la primera vez que entran en pantalla)
   ========================================================================= */

interface ScrollFadeProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  duration?: number;
  viewportAmount?: number | "some" | "all";
}

export function ScrollFadeIn({
  children,
  delay = 0,
  y = 20,
  duration = 0.55,
  viewportAmount = 0.2,
  className,
  ...props
}: ScrollFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScrollFadeInLi({
  children,
  delay = 0,
  y = 20,
  duration = 0.5,
  viewportAmount = 0.2,
  className,
  ...props
}: HTMLMotionProps<"li"> & {
  delay?: number;
  y?: number;
  duration?: number;
  viewportAmount?: number | "some" | "all";
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.li>
  );
}

export function ScrollFadeInSection({
  children,
  delay = 0,
  y = 20,
  duration = 0.6,
  viewportAmount = 0.15,
  className,
  ...props
}: HTMLMotionProps<"section"> & {
  delay?: number;
  y?: number;
  duration?: number;
  viewportAmount?: number | "some" | "all";
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function ScrollFadeInFooter({
  children,
  delay = 0,
  y = 16,
  duration = 0.5,
  viewportAmount = 0.2,
  className,
  ...props
}: HTMLMotionProps<"footer"> & {
  delay?: number;
  y?: number;
  duration?: number;
  viewportAmount?: number | "some" | "all";
}) {
  return (
    <motion.footer
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{
        duration,
        ease: SMOOTH_EASE,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.footer>
  );
}

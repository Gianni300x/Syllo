"use client";

import { useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RubberSegmentProps<T extends string> = {
  items: readonly T[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  "aria-label": string;
};

/**
 * Selector compacto inspirado en Rubber Segment, adaptado a los colores y la
 * interacción de Syllo. Es controlado para que cada feature conserve su estado.
 */
export function RubberSegment<T extends string>({
  items,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: RubberSegmentProps<T>) {
  const reducedMotion = useReducedMotion();
  const indicatorId = useId();
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAt(index: number) {
    const item = items[index];

    if (!item) return;

    onValueChange(item);
    itemRefs.current[index]?.focus();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % items.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectAt(nextIndex);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={cn(
        "inline-flex w-full rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/80 sm:w-auto",
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item === value;

        return (
          <motion.button
            key={item}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            className={cn(
              "relative min-w-0 flex-1 rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900 sm:flex-none",
              active
                ? "text-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`rubber-segment-${indicatorId}`}
                aria-hidden="true"
                className="absolute inset-0 z-0 rounded-lg bg-indigo-600 shadow-sm dark:bg-indigo-500"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                        mass: 0.55,
                      }
                }
              />
            ) : null}
            <span className="relative z-10">{item}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

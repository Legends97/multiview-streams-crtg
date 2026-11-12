"use client";

import { useSyncExternalStore } from "react";

export type Breakpoint = "base" | "md" | "lg" | "xl";

const QUERIES: Array<{ name: Breakpoint; query: string }> = [
  { name: "xl", query: "(min-width: 1280px)" },
  { name: "lg", query: "(min-width: 1024px)" },
  { name: "md", query: "(min-width: 768px)" },
];

/**
 * Aktueller Breakpoint über matchMedia.
 *
 * Bewusst mit useSyncExternalStore: der Wert ist externer Browser-Zustand.
 * Beim Server-Rendering gilt "xl" (Desktop-First), nach dem Mount der echte
 * Wert. Davon hängt ab, wie viele Player überhaupt montiert werden.
 */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};

  const lists = QUERIES.map(({ query }) => window.matchMedia(query));

  for (const list of lists) {
    list.addEventListener("change", onChange);
  }

  return () => {
    for (const list of lists) {
      list.removeEventListener("change", onChange);
    }
  };
}

function getSnapshot(): Breakpoint {
  if (typeof window === "undefined" || !window.matchMedia) return "xl";

  for (const { name, query } of QUERIES) {
    if (window.matchMedia(query).matches) return name;
  }

  return "base";
}

function getServerSnapshot(): Breakpoint {
  return "xl";
}

/** Schmaler Viewport: nur ein Player wird montiert. */
export function isMobileBreakpoint(breakpoint: Breakpoint): boolean {
  return breakpoint === "base";
}

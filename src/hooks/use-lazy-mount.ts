"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseLazyMountOptions {
  /** Sichtbarkeit ignorieren und dauerhaft gemountet bleiben. */
  keepMounted?: boolean;
  /** Wartezeit, bevor ein unsichtbares Element zerstört wird. */
  unmountDelayMs?: number;
  /** Schwelle für den IntersectionObserver. */
  threshold?: number;
}

export interface LazyMountResult<T extends HTMLElement> {
  ref: (node: T | null) => void;
  /** Soll der schwere Inhalt (Player) montiert sein? */
  mounted: boolean;
  /** Ist das Element aktuell im Viewport? */
  visible: boolean;
}

/**
 * Montiert schwere Inhalte nur, solange sie sichtbar sind.
 *
 * Verlässt ein Tile den Viewport, wird es erst nach `unmountDelayMs`
 * zerstört — kurzes Scrollen soll keinen Neuaufbau auslösen
 * (docs/08-multistream-player.md, Abschnitt 3).
 */
export function useLazyMount<T extends HTMLElement = HTMLDivElement>({
  keepMounted = false,
  unmountDelayMs = 10_000,
  threshold = 0.1,
}: UseLazyMountOptions = {}): LazyMountResult<T> {
  const [visible, setVisible] = useState(false);
  const [graceActive, setGraceActive] = useState(false);
  const nodeRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const observe = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      nodeRef.current = node;

      if (!node || typeof IntersectionObserver === "undefined") return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry) return;

          if (entry.isIntersecting) {
            clearTimer();
            setVisible(true);
            setGraceActive(false);

            return;
          }

          setVisible(false);
          setGraceActive(true);
          clearTimer();
          timerRef.current = window.setTimeout(() => {
            setGraceActive(false);
            timerRef.current = null;
          }, unmountDelayMs);
        },
        { threshold },
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [clearTimer, threshold, unmountDelayMs],
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      clearTimer();
    },
    [clearTimer],
  );

  return {
    ref: observe,
    mounted: keepMounted || visible || graceActive,
    visible,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";

export interface UseFullscreenResult {
  isFullscreen: boolean;
  toggle: () => void;
  enter: () => void;
  exit: () => void;
}

/**
 * Vollbild für ein Element (das Stream-Grid).
 *
 * Safari benennt die API mit webkit-Prefix; das wird hier abgedeckt.
 * Vollbild ist nur aus einer Benutzeraktion heraus erlaubt.
 */
export function useFullscreen(
  targetRef: React.RefObject<HTMLElement | null>,
): UseFullscreenResult {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, []);

  const enter = useCallback(() => {
    const element = targetRef.current;

    if (!element) return;

    const request =
      element.requestFullscreen ??
      (element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
        .webkitRequestFullscreen;

    // Browser ohne Fullscreen-API: Aktion bleibt wirkungslos.
    if (!request) return;

    void request.call(element).catch(() => {
      // Vom Browser abgelehnt (z. B. ohne Benutzeraktion) — Zustand bleibt.
    });
  }, [targetRef]);

  const exit = useCallback(() => {
    if (!document.fullscreenElement) return;

    void document.exitFullscreen().catch(() => {
      // Bereits verlassen.
    });
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      exit();
    } else {
      enter();
    }
  }, [enter, exit]);

  return { isFullscreen, toggle, enter, exit };
}

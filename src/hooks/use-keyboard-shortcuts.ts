"use client";

import { useEffect, useRef } from "react";

export type ShortcutHandler = (eventKey: string) => void;

export interface ShortcutMap {
  [key: string]: ShortcutHandler;
}

/**
 * Tastenkürzel des Players.
 *
 * Greift nicht, solange ein Eingabefeld, ein Textbereich oder ein
 * contenteditable-Element den Fokus hat — sonst würde das Tippen im Chat
 * das Layout umschalten (docs/08-multistream-player.md, Abschnitt 2).
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true): void {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey) return;
      if (isTypingTarget(keyEvent.target)) return;

      const handler = shortcutsRef.current[keyEvent.key.toLowerCase()];

      if (!handler) return;

      keyEvent.preventDefault();
      handler(keyEvent.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

"use client";

import { useEffect, useRef } from "react";

export type ShortcutHandler = (eventKey: string) => void;

export interface ShortcutMap {
  [key: string]: ShortcutHandler;
}

/**
 * Tastenkürzel des Players.
 *
 * Greift nicht, solange ein Eingabefeld, ein Textbereich, ein
 * contenteditable-Element ODER ein eingebettetes Fenster den Fokus hat —
 * sonst würde das Tippen im Chat das Layout umschalten
 * (docs/08-multistream-player.md, Abschnitt 2).
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

      // Beides pruefen: bei einem fokussierten iframe ist das Ziel je nach
      // Browser das iframe selbst oder weiterhin der Body.
      if (isTypingTarget(keyEvent.target)) return;
      if (isTypingTarget(document.activeElement)) return;

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
    // Eingebettetes Fenster, etwa der Twitch-Chat: was darin getippt wird,
    // geht uns nichts an. Ohne diese Zeile verschluckt das Kuerzel den
    // Tastendruck, bevor er im Chat ankommt.
    tag === "iframe" ||
    target.isContentEditable
  );
}

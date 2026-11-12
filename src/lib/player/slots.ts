import type { StreamConfig } from "@/types/stream";

/**
 * Reine Helfer für die Slot-Belegung des Multistream-Grids.
 * Ohne React, damit sie testbar sind (docs/12-qualität-und-tests.md).
 */

/**
 * Belegt `slotCount` Slots: bestehende Zuordnungen bleiben erhalten, neue
 * Slots werden mit noch nicht verwendeten Streams in Reihenfolge gefüllt.
 */
export function buildSlots(
  slotCount: number,
  current: (string | null)[],
  availableIds: string[],
): (string | null)[] {
  const available = new Set(availableIds);
  const used = new Set<string>();
  const next: (string | null)[] = [];

  for (let index = 0; index < slotCount; index += 1) {
    const candidate = current[index] ?? null;

    if (candidate && available.has(candidate) && !used.has(candidate)) {
      next.push(candidate);
      used.add(candidate);
    } else {
      next.push(null);
    }
  }

  // Leere Slots mit noch freien Streams füllen.
  const unused = availableIds.filter((id) => !used.has(id));

  for (let index = 0; index < next.length; index += 1) {
    if (next[index] === null) {
      const fill = unused.shift();

      if (fill) {
        next[index] = fill;
        used.add(fill);
      }
    }
  }

  return next;
}

/**
 * Setzt einen Stream in einen Slot. Läuft der Stream bereits in einem
 * anderen Slot, werden beide getauscht statt doppelt geladen.
 */
export function assignStreamToSlot(
  slots: (string | null)[],
  slotIndex: number,
  streamId: string | null,
): (string | null)[] {
  if (slotIndex < 0 || slotIndex >= slots.length) return slots;

  const next = [...slots];
  const previous = next[slotIndex] ?? null;
  const existingIndex = streamId ? next.indexOf(streamId) : -1;

  next[slotIndex] = streamId;

  if (existingIndex >= 0 && existingIndex !== slotIndex) {
    next[existingIndex] = previous;
  }

  return next;
}

/** Vertauscht zwei Slots. */
export function swapSlots(
  slots: (string | null)[],
  a: number,
  b: number,
): (string | null)[] {
  if (a === b) return slots;
  if (a < 0 || b < 0 || a >= slots.length || b >= slots.length) return slots;

  const next = [...slots];
  const slotA = next[a] ?? null;
  const slotB = next[b] ?? null;
  next[a] = slotB;
  next[b] = slotA;

  return next;
}

/**
 * Entfernt unbekannte oder inaktive Stream-IDs aus einer gespeicherten
 * Belegung — Config kann sich seit dem letzten Besuch geändert haben.
 */
export function sanitizeSlots(
  slots: unknown,
  activeStreams: StreamConfig[],
): (string | null)[] {
  if (!Array.isArray(slots)) return [];

  const activeIds = new Set(activeStreams.map((stream) => stream.id));
  const seen = new Set<string>();

  return slots.map((value) => {
    if (typeof value !== "string") return null;
    if (!activeIds.has(value)) return null;
    if (seen.has(value)) return null;

    seen.add(value);

    return value;
  });
}

/** Erster belegter Slot — Ziel für den Audio-Fokus nach einem Layoutwechsel. */
export function firstAssignedStream(slots: (string | null)[]): string | null {
  return slots.find((slot): slot is string => typeof slot === "string") ?? null;
}

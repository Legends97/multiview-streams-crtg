import type { RaceClock } from "@/types/race";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/**
 * Zeitstempel für das Server-Rendering.
 *
 * Bewusst eine eigene Funktion: ein direkter Date.now()-Aufruf im Rumpf einer
 * Komponente verstößt gegen die Purity-Regel des React Compilers. Für das
 * Server-Rendering ist der Zeitstempel korrekt — er wird an den Client
 * übergeben, damit der erste Client-Render identisch ausfällt.
 */
export function getServerNow(): number {
  return Date.now();
}

/**
 * Berechnet Rennzeit, Restzeit und Fortschritt.
 * Reine Funktion, damit sie ohne React testbar ist.
 */
export function computeRaceClock(
  startsAt: string,
  durationHours: number,
  now: number = Date.now(),
): RaceClock {
  const start = Date.parse(startsAt);

  if (Number.isNaN(start)) {
    throw new Error(`Ungültige Startzeit: ${startsAt}`);
  }

  const durationMs = durationHours * MS_PER_HOUR;
  const end = start + durationMs;

  if (now < start) {
    return {
      phase: "before",
      msToStart: start - now,
      elapsedMs: 0,
      remainingMs: durationMs,
      progress: 0,
    };
  }

  if (now >= end) {
    return {
      phase: "after",
      msToStart: 0,
      elapsedMs: durationMs,
      remainingMs: 0,
      progress: 1,
    };
  }

  const elapsedMs = now - start;

  return {
    phase: "running",
    msToStart: 0,
    elapsedMs,
    remainingMs: end - now,
    progress: elapsedMs / durationMs,
  };
}

/** Formatiert eine Dauer als HH:MM:SS, Stunden ohne Begrenzung auf 24. */
export function formatDuration(ms: number): string {
  const safeMs = Math.max(0, ms);
  const hours = Math.floor(safeMs / MS_PER_HOUR);
  const minutes = Math.floor((safeMs % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((safeMs % MS_PER_MINUTE) / MS_PER_SECOND);

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

/** Formatiert eine Dauer grob, z. B. "3 Tage 4 Std" oder "12 Min". */
export function formatCountdown(ms: number): string {
  const safeMs = Math.max(0, ms);
  const days = Math.floor(safeMs / (24 * MS_PER_HOUR));
  const hours = Math.floor((safeMs % (24 * MS_PER_HOUR)) / MS_PER_HOUR);
  const minutes = Math.floor((safeMs % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days > 0) return `${days} ${days === 1 ? "Tag" : "Tage"} ${hours} Std`;
  if (hours > 0) return `${hours} Std ${minutes} Min`;

  return `${minutes} Min`;
}

/**
 * Zeitzone des Events. Fest verdrahtet, und zwar aus zwei Gruenden:
 *
 * 1. Server-Rendering: Vercel laeuft in UTC. Ohne feste Zeitzone gibt der
 *    Server deutsche Zeiten eine Stunde zu frueh aus.
 * 2. Zuschauer im Ausland sollen die offizielle Rennzeit sehen, nicht ihre
 *    eigene Ortszeit — sonst stimmt der Zeitplan fuer sie nicht mit dem
 *    ueberein, was im Stream und im Teamfunk gesagt wird.
 */
export const EVENT_TIME_ZONE = "Europe/Berlin";

/** Datum und Uhrzeit in deutscher Schreibweise, in deutscher Zeit. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
}

/** Relative Zeitangabe für Chat-Zeitstempel ("vor 3 Min"). */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diff = now - Date.parse(iso);

  if (diff < MS_PER_MINUTE) return "gerade jetzt";
  if (diff < MS_PER_HOUR) return `vor ${Math.floor(diff / MS_PER_MINUTE)} Min`;
  if (diff < 24 * MS_PER_HOUR) return `vor ${Math.floor(diff / MS_PER_HOUR)} Std`;

  return formatDateTime(iso);
}

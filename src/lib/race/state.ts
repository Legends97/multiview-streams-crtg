import { race } from "@/config/race";
import { computeRaceClock } from "@/lib/utils/time";
import type { RaceState, RaceStatus } from "@/types/race";

/**
 * Aus der Konfiguration abgeleiteter Rennstatus.
 * Dient als Fallback, solange in race_state kein Status gesetzt ist.
 */
export function deriveStatusFromClock(
  startsAt: string = race.startsAt,
  now: number = Date.now(),
): RaceStatus {
  const clock = computeRaceClock(startsAt, race.durationHours, now);

  if (clock.phase === "before") return "UPCOMING";
  if (clock.phase === "after") return "FINISHED";

  return "LIVE";
}

/** Zustand, wenn die Datenbank keinen Eintrag liefert. */
export function getFallbackRaceState(now: number = Date.now()): RaceState {
  return {
    status: deriveStatusFromClock(race.startsAt, now),
    currentDriverId: null,
    startedAt: null,
    note: null,
    updatedAt: new Date(now).toISOString(),
  };
}

/** Effektive Startzeit: tatsächlicher Start schlägt die Konfiguration. */
export function getEffectiveStart(state: RaceState | null): string {
  return state?.startedAt ?? race.startsAt;
}

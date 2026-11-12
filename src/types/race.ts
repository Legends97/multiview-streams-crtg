/** Mögliche Rennstatus, identisch mit dem Postgres-Enum race_status. */
export type RaceStatus =
  | "UPCOMING"
  | "LIVE"
  | "FULL_COURSE_YELLOW"
  | "SAFETY_CAR"
  | "RED_FLAG"
  | "FINISHED";

export const RACE_STATUSES: readonly RaceStatus[] = [
  "UPCOMING",
  "LIVE",
  "FULL_COURSE_YELLOW",
  "SAFETY_CAR",
  "RED_FLAG",
  "FINISHED",
] as const;

export interface TrackInfo {
  name: string;
  country: string;
  lengthKm: number;
  /** Kurvenzahl, falls eindeutig belegbar. Bei der Nordschleife umstritten. */
  turns?: number;
  layoutImage?: string;
}

export interface TeamInfo {
  name: string;
  /** Nur bei Teams mit einem einzigen Fahrzeug. Sonst stehen Nummer und
   *  Modell je Fahrer in src/config/streams.ts. */
  carNumber?: number;
  car?: string;
  logo?: string;
}

/** Ein Fahrzeug im Rennen, abgeleitet aus der Stream-Konfiguration. */
export interface RaceEntry {
  streamId: string;
  driverName: string;
  car: string;
  carNumber: number;
  carClass: string;
}

/** Statische Rennkonfiguration aus src/config/race.ts. */
export interface RaceConfig {
  name: string;
  series: string;
  class: string;
  track: TrackInfo;
  team: TeamInfo;
  /** ISO-8601 mit Zeitzonen-Offset. */
  startsAt: string;
  durationHours: number;
  simulator: string;
}

/** Dynamischer Rennzustand aus der Tabelle race_state. */
export interface RaceState {
  status: RaceStatus;
  currentDriverId: string | null;
  /** Tatsächlicher Start; hat Vorrang vor RaceConfig.startsAt. */
  startedAt: string | null;
  note: string | null;
  updatedAt: string;
}

/** Dynamische Fahrerdaten aus der Tabelle drivers. */
export interface DriverRecord {
  streamId: string;
  displayName: string | null;
  roleLabel: string | null;
  bio: string | null;
  country: string | null;
  stintStart: string | null;
  stintEnd: string | null;
  sortOrder: number;
}

/** Abgeleitete Rennuhr, berechnet im Client. */
export interface RaceClock {
  phase: "before" | "running" | "after";
  /** Millisekunden bis zum Start (nur in Phase "before"). */
  msToStart: number;
  /** Vergangene Rennzeit in Millisekunden. */
  elapsedMs: number;
  /** Verbleibende Rennzeit in Millisekunden. */
  remainingMs: number;
  /** Fortschritt 0..1. */
  progress: number;
}

/**
 * Ein Fahrer-Stream, wie er in src/config/streams.ts definiert wird.
 * Die `id` wird in user_settings und drivers.stream_id referenziert und darf
 * nachträglich nicht geändert werden.
 */
export interface StreamConfig {
  id: string;
  name: string;
  twitchChannel: string;
  role: string;
  active: boolean;
  priority?: number;
  avatar?: string;
  description?: string;
  /** Fahrzeugmodell, z. B. "Mercedes-AMG GT4". */
  car?: string;
  /** Startnummer des Fahrzeugs. */
  carNumber?: number;
  /** Fahrzeugklasse, z. B. "GT4" oder "GT2". */
  carClass?: string;
}

/** Laufzeit-Status eines Streams, aus Player-Events und/oder Helix-API. */
export type StreamStatus = "unknown" | "loading" | "live" | "offline" | "not_found" | "error";

/** Live-Status eines Kanals, wie ihn /api/twitch/status liefert. */
export interface StreamLiveInfo {
  live: boolean;
  viewers: number;
  title?: string;
  startedAt?: string;
}

/** Antwortform von /api/twitch/status: Stream-ID -> Live-Info. */
export type StreamStatusMap = Record<string, StreamLiveInfo>;

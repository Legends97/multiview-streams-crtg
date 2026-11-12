import { parseConfig, streamsSchema } from "@/lib/validation/config";
import type { StreamConfig } from "@/types/stream";

/**
 * ZENTRALE STREAM-KONFIGURATION
 * =============================
 * Die Twitch-Kanäle der Fahrer werden ausschließlich hier gepflegt, nicht
 * im Admin-Panel (Begründung: docs/01-architektur.md, Abschnitt 7).
 *
 * WICHTIG:
 * - `twitchChannel` ist der Twitch-Login (der Teil nach twitch.tv/),
 *   nicht der Anzeigename und keine URL.
 * - `id` wird in user_settings und drivers.stream_id referenziert und darf
 *   NACHTRAEGLICH NICHT GEAENDERT werden.
 * - Fahrer entfernen: `active: false` setzen, nicht löschen.
 * - Weiteren Fahrer aufnehmen: Objekt ergänzen, Anleitung in
 *   docs/07-konfiguration.md.
 *
 * `name` und `role` sind frei wählbare Anzeigetexte und dürfen jederzeit
 * angepasst werden. `car`, `carNumber` und `carClass` beschreiben das
 * Fahrzeug des jeweiligen Fahrers — in einem Multiklasse-Rennen fährt
 * jeder sein eigenes Auto.
 */
const rawStreams: StreamConfig[] = [
  {
    id: "legends-l97",
    name: "Legends",
    twitchChannel: "legends_l97",
    role: "Fahrer",
    active: true,
    priority: 1,
    car: "Mercedes-AMG GT4",
    carNumber: 360,
    carClass: "GT4",
  },
  {
    id: "keks-honda",
    name: "Keks Honda",
    twitchChannel: "keks__honda",
    role: "Fahrer",
    active: true,
    priority: 2,
    car: "Aston Martin V8 Vantage GT4",
    carNumber: 340,
    carClass: "GT4",
  },
  {
    id: "thebennibluetv",
    name: "TheBenniBlueTV",
    twitchChannel: "thebennibluetv",
    role: "Fahrer",
    active: true,
    priority: 3,
    car: "KTM X-Bow GT2",
    carNumber: 317,
    carClass: "GT2",
  },
];

/** Validierte Streams. Ein Fehler bricht Build bzw. Start ab. */
export const streams: StreamConfig[] = parseConfig(
  streamsSchema,
  rawStreams,
  "src/config/streams.ts",
);

/** Aktive Streams, sortiert nach priority (kleinere Zahl zuerst). */
export function getActiveStreams(): StreamConfig[] {
  return streams
    .filter((stream) => stream.active)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function getStreamById(id: string): StreamConfig | undefined {
  return streams.find((stream) => stream.id === id);
}

/** Anzahl gleichzeitig verfügbarer Streams — begrenzt die Layout-Auswahl. */
export function getActiveStreamCount(): number {
  return getActiveStreams().length;
}

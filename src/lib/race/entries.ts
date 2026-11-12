import { getActiveStreams } from "@/config/streams";
import type { RaceEntry } from "@/types/race";
import type { StreamConfig } from "@/types/stream";

/**
 * Fahrzeuge im Rennen, abgeleitet aus der Stream-Konfiguration.
 *
 * In einem Multiklasse-Rennen fährt jeder Fahrer sein eigenes Auto mit
 * eigener Startnummer und Klasse. Nur Fahrer mit vollständigen Angaben
 * erscheinen hier — unvollständige werden still ausgelassen, statt
 * erfundene Werte anzuzeigen.
 */
export function getRaceEntries(): RaceEntry[] {
  return getActiveStreams()
    .filter(
      (stream): stream is StreamConfig &
        Required<Pick<StreamConfig, "car" | "carNumber" | "carClass">> =>
        Boolean(stream.car && stream.carNumber && stream.carClass),
    )
    .map((stream) => ({
      streamId: stream.id,
      driverName: stream.name,
      car: stream.car,
      carNumber: stream.carNumber,
      carClass: stream.carClass,
    }));
}

/** Vertretene Klassen, alphabetisch und ohne Dubletten. */
export function getRaceClasses(): string[] {
  return Array.from(new Set(getRaceEntries().map((entry) => entry.carClass))).sort();
}

/** Kurzform für ein Fahrzeug: "#360 Mercedes-AMG GT4". */
export function formatEntry(stream: StreamConfig): string | null {
  if (!stream.car || !stream.carNumber) return null;

  return `#${stream.carNumber} ${stream.car}`;
}

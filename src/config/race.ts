import { parseConfig, raceConfigSchema } from "@/lib/validation/config";
import type { RaceConfig } from "@/types/race";

/**
 * RENNKONFIGURATION
 * =================
 * Statische Angaben zum Event. Während des Rennens veränderliche Werte
 * (Status, aktueller Fahrer, Notiz) liegen in der Tabelle race_state und
 * werden über /admin/race gesetzt.
 *
 * Quelle der Eventdaten:
 * https://www.thesimgrid.com/championships/26993
 *
 * startsAt MUSS einen Zeitzonen-Offset enthalten, sonst rechnen Browser in
 * anderen Zeitzonen falsch. Die SimGrid-Seite nennt UTC; Deutschland liegt
 * im November auf MEZ (UTC+1), daher 10:30 UTC = 11:30 Uhr.
 *
 */
const rawRace: RaceConfig = {
  name: "24 H Nordschleife für November",
  series: "ACM Racing — 2026 Fundraiser Endurance Series",
  class: "Multiklasse",
  track: {
    name: "Nürburgring Nordschleife",
    country: "DE",
    // 24h-Layout: Nordschleife plus GP-Strecke.
    lengthKm: 25.378,
  },
  team: {
    // Multiklasse-Event: Fahrzeug, Startnummer und Klasse stehen je Fahrer
    // in src/config/streams.ts, nicht hier.
    name: "Chaos Racing Team Germany",
  },
  startsAt: "2026-11-14T11:30:00+01:00",
  durationHours: 24,
  simulator: "Assetto Corsa Competizione",
};

export const race: RaceConfig = parseConfig(
  raceConfigSchema,
  rawRace,
  "src/config/race.ts",
);

/** Geplantes Rennende aus Startzeit und Dauer. */
export function getPlannedEnd(startsAt: string = race.startsAt): Date {
  return new Date(new Date(startsAt).getTime() + race.durationHours * 3_600_000);
}

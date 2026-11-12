import { eventConfigSchema, parseConfig } from "@/lib/validation/config";
import type { EventConfig } from "@/types/event";

/**
 * EVENT-KONFIGURATION
 * ===================
 * Texte, Zeitplan, Social-Media-Links und Sponsoren der Event-Seite.
 *
 * PLATZHALTERTEXTE UND -LINKS — vor dem Event ersetzen.
 * Sponsorenlogos nach public/sponsors/ legen, Pfade hier eintragen.
 */
const rawEvent: EventConfig = {
  title: "24H RACE LIVE",
  // Steht in der Browser-Registerkarte, auf jeder Seite gleich.
  browserTitle: "CRTG 24H Nordschleife",
  subtitle: "Unser Team bei den 24 Stunden der Nordschleife",
  description:
    "24 Stunden Nordschleife: alle Onboard-Perspektiven unseres Teams gleichzeitig. Wechsle jederzeit den Blickwinkel und bleib im Chat mit der Community in Verbindung.",
  teamDescription:
    "Wir fahren die 24 Stunden der Nordschleife bei ACM Racing. Gefahren wird in Assetto Corsa Competizione, bei wechselndem Wetter, ohne Pflicht-Boxenstopps und mit einem Stint-Timer von 65 Minuten. Vorbereitung, Fahrerwechsel und Strategie laufen bei uns wie im echten Motorsport: geplant, abgesprochen und rund um die Uhr besetzt.",
  // Eckdaten laut Ausschreibung des Veranstalters.
  facts: [
    { label: "Simulator", value: "Assetto Corsa Competizione" },
    { label: "Renndauer", value: "24 Stunden" },
    { label: "Strecke", value: "Nürburgring Nordschleife, 25,378 km" },
    { label: "Format", value: "Multiklasse, bis zu 70 Startplätze" },
    { label: "Boxenstopps", value: "Keine Pflichtstopps" },
    { label: "Stint-Timer", value: "65 Minuten" },
    { label: "Wetter", value: "Wechselhaft" },
    { label: "Fahrer pro Team", value: "1 bis 6" },
  ],

  // Zeiten in MEZ (+01:00). Dauer in Minuten, wo bekannt.
  schedule: [
    { label: "Freies Training", at: "2026-11-14T10:00:00+01:00", durationMinutes: 50 },
    { label: "Fahrerbriefing", at: "2026-11-14T10:50:00+01:00", durationMinutes: 10 },
    { label: "Qualifying", at: "2026-11-14T11:00:00+01:00", durationMinutes: 25 },
    { label: "Rennstart", at: "2026-11-14T11:30:00+01:00" },
    { label: "Zielflagge", at: "2026-11-15T11:30:00+01:00" },
  ],
  // Leer = der Bereich "Folgen" erscheint weder im Footer noch auf der
  // Event-Seite. Zum Aktivieren echte Links eintragen, z. B.
  // { platform: "discord", label: "Discord", url: "https://discord.gg/..." }
  social: [],
  // Leer = der Sponsorenbereich erscheint weder im Footer noch auf der
  // Event-Seite. Zum Aktivieren Logos nach public/sponsors/ legen und hier
  // eintragen: { name, logo: "/sponsors/datei.svg", tier: "main" | "partner" }
  sponsors: [],
};

export const event: EventConfig = parseConfig(
  eventConfigSchema,
  rawEvent,
  "src/config/event.ts",
);

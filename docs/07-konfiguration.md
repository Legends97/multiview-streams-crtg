# 07 — Konfiguration

Alles, was sich pro Rennen oder pro Team ändert, liegt in `src/config/`. Diese Dateien sind
die einzige Stelle, an der Namen, Kanäle, Zeiten und Sponsoren gepflegt werden.

| Datei | Inhalt | Ändert sich |
| --- | --- | --- |
| `streams.ts` | Fahrer und ihre Twitch-Kanäle | pro Rennen |
| `race.ts` | Rennen, Strecke, Fahrzeug, Team, Zeiten | pro Rennen |
| `event.ts` | Teamtexte, Social Media, Sponsoren | selten |
| `layouts.ts` | Layout-Presets des Players | fast nie |

**Abgrenzung:** Twitch-Kanäle bleiben bewusst im Code und werden **nicht** über das
Admin-Panel verwaltet (Begründung in [`01-architektur.md`](01-architektur.md), Abschnitt 7).
Während des Rennens veränderliche Angaben — Rennstatus, aktueller Fahrer, Stint-Zeiten,
Laufband-Notiz — liegen in der Datenbank und sind über `/admin/race` und `/admin/drivers`
editierbar. Die Datenbank überschreibt dabei die Config, nicht umgekehrt.

---

## 1. `src/config/streams.ts`

```ts
import type { StreamConfig } from "@/types/stream";

export const streams: StreamConfig[] = [
  {
    id: "driver-1",
    name: "Driver 1",
    twitchChannel: "TWITCH_CHANNEL_1",
    role: "Main Driver",
    active: true,
    priority: 1,
    avatar: "/drivers/driver-1.webp",
  },
  {
    id: "driver-2",
    name: "Driver 2",
    twitchChannel: "TWITCH_CHANNEL_2",
    role: "Second Driver",
    active: true,
    priority: 2,
    avatar: "/drivers/driver-2.webp",
  },
];
```

| Feld | Typ | Pflicht | Bedeutung |
| --- | --- | --- | --- |
| `id` | `string` | ja | eindeutiger, stabiler Slug. Wird in `user_settings` und `drivers.stream_id` referenziert — **nachträglich nicht ändern**, sonst verlieren Benutzer ihr Layout |
| `name` | `string` | ja | Anzeigename im Overlay und in der Fahrerauswahl |
| `twitchChannel` | `string` | ja | Twitch-Login (der Teil nach `twitch.tv/`), klein geschrieben, ohne URL |
| `role` | `string` | ja | Rollenbezeichnung, zum Beispiel "Main Driver", "Onboard 2", "Team Radio" |
| `active` | `boolean` | ja | `false` blendet den Stream überall aus, ohne den Eintrag zu löschen |
| `priority` | `number` | nein | Sortierung und Slot-Vorbelegung, kleinere Zahl zuerst |
| `avatar` | `string` | nein | Pfad in `public/drivers/` |
| `description` | `string` | nein | ein Satz für die Event-Seite |

### Typdefinition

```ts
// src/types/stream.ts
export interface StreamConfig {
  id: string;
  name: string;
  twitchChannel: string;
  role: string;
  active: boolean;
  priority?: number;
  avatar?: string;
  description?: string;
}
```

### Validierung

```ts
// src/lib/validation/config.ts
import { z } from "zod";

export const streamConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/, "id: nur a-z, 0-9 und Bindestrich"),
  name: z.string().min(1).max(40),
  twitchChannel: z
    .string()
    .regex(/^[a-zA-Z0-9_]{4,25}$/, "twitchChannel: Twitch-Login, keine URL")
    .transform((value) => value.toLowerCase()),
  role: z.string().min(1).max(30),
  active: z.boolean(),
  priority: z.number().int().positive().optional(),
  avatar: z.string().startsWith("/").optional(),
  description: z.string().max(200).optional(),
});

export const streamsSchema = z
  .array(streamConfigSchema)
  .min(1, "Mindestens ein Stream muss konfiguriert sein")
  .max(16, "Mehr als 16 Streams werden nicht unterstützt")
  .superRefine((list, ctx) => {
    const seen = new Set<string>();
    for (const stream of list) {
      if (seen.has(stream.id)) {
        ctx.addIssue({ code: "custom", message: `Doppelte id: ${stream.id}` });
      }
      seen.add(stream.id);
    }
  });
```

Die Validierung läuft beim Import der Config. Ein Fehler bricht Build und Start mit einer
klaren Meldung ab — besser als ein schwarzes Tile zur Rennmitte.

### Selektoren

```ts
// src/config/streams.ts (Fortsetzung)
export function getActiveStreams(): StreamConfig[] {
  return streams
    .filter((s) => s.active)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function getStreamById(id: string): StreamConfig | undefined {
  return streams.find((s) => s.id === id);
}
```

Komponenten nutzen immer diese Funktionen, niemals das Array direkt.

### Einen Fahrer hinzufügen

1. Objekt in `streams` ergänzen, `id` eindeutig und klein geschrieben wählen.
2. `twitchChannel` exakt wie der Twitch-Login setzen (nicht der Anzeigename).
3. Avatar als WebP nach `public/drivers/` legen, Pfad eintragen.
4. `npm run dev` starten und prüfen, ob Player und Chat laden.
5. `npm run typecheck && npm run lint && npm run build`.
6. Deployen — die Website lädt die Kanäle automatisch.

Einen Fahrer **entfernen**: `active: false` setzen statt löschen. So bleiben gespeicherte
Layouts gültig, und der Eintrag ist nach dem Rennen noch nachvollziehbar.

---

## 2. `src/config/race.ts`

```ts
import type { RaceConfig } from "@/types/race";

export const race: RaceConfig = {
  name: "24H Series — Spa-Francorchamps",
  series: "24H SERIES ESPORTS",
  class: "GT3",
  track: {
    name: "Circuit de Spa-Francorchamps",
    country: "BE",
    lengthKm: 7.004,
    turns: 19,
    layoutImage: "/logos/track-spa.svg",
  },
  team: {
    name: "TEAMNAME",
    carNumber: 24,
    car: "BMW M4 GT3",
    logo: "/logos/team.svg",
  },
  startsAt: "2026-05-16T14:00:00+02:00",
  durationHours: 24,
  simulator: "iRacing",
};
```

| Feld | Bedeutung |
| --- | --- |
| `startsAt` | ISO-8601 **mit Zeitzonen-Offset**. Ohne Offset rechnen Browser in anderen Zeitzonen falsch |
| `durationHours` | Renndauer, Basis für Restzeit und Fortschritt |
| `track.*` | Streckenangaben für Race- und Event-Seite |
| `team.*` | Teamname, Startnummer, Fahrzeug, Logo |
| `simulator` | Simulator, erscheint im Hero |

Der tatsächliche Start kann in `race_state.started_at` abweichen (verzögerter Start). Ist
der Wert gesetzt, hat er Vorrang vor `startsAt`.

Rennzeit-Berechnung (Hook `useRaceClock`): läuft rein clientseitig aus `startsAt` bzw.
`started_at` und `durationHours`, aktualisiert sich pro Sekunde und erzeugt keinen
Netzwerkverkehr.

---

## 3. `src/config/event.ts`

```ts
import type { EventConfig } from "@/types/event";

export const event: EventConfig = {
  title: "24H RACE LIVE",
  subtitle: "Unser Team im 24-Stunden-Rennen",
  description: "Zwei Sätze zum Event, erscheinen im Hero und auf der Event-Seite.",
  teamDescription: "Längerer Text über das Team für die Event-Seite.",
  schedule: [
    { label: "Qualifying", at: "2026-05-16T12:00:00+02:00" },
    { label: "Rennstart", at: "2026-05-16T14:00:00+02:00" },
    { label: "Zielflagge", at: "2026-05-17T14:00:00+02:00" },
  ],
  social: [
    { platform: "twitch", label: "Team-Twitch", url: "https://twitch.tv/…" },
    { platform: "youtube", label: "YouTube", url: "https://youtube.com/…" },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com/…" },
    { platform: "discord", label: "Discord", url: "https://discord.gg/…" },
  ],
  sponsors: [
    { name: "Sponsor 1", logo: "/sponsors/sponsor-1.svg", url: "https://…", tier: "main" },
    { name: "Sponsor 2", logo: "/sponsors/sponsor-2.svg", url: "https://…", tier: "partner" },
  ],
};
```

- `social[].platform` ist auf die unterstützten Werte beschränkt, damit das passende
  Lucide-Icon gewählt werden kann
- `sponsors[].tier`: `main` wird grösser dargestellt als `partner`
- Logos als SVG oder WebP mit transparentem Hintergrund; die Darstellung wandelt sie in
  Graustufen und zeigt Farbe erst beim Hover

---

## 4. `src/config/layouts.ts`

```ts
import type { LayoutPreset } from "@/types/layout";

export const layouts: LayoutPreset[] = [
  { id: "single", label: "1 Stream",  slots: 1, grid: { cols: 1, rows: 1 } },
  { id: "dual",   label: "2 Streams", slots: 2, grid: { cols: 2, rows: 1 } },
  { id: "triple", label: "3 Streams", slots: 3, grid: { cols: 3, rows: 1 }, featured: true },
  { id: "quad",   label: "4 Streams", slots: 4, grid: { cols: 2, rows: 2 } },
  { id: "six",    label: "6 Streams", slots: 6, grid: { cols: 3, rows: 2 }, heavy: true },
  { id: "eight",  label: "8 Streams", slots: 8, grid: { cols: 4, rows: 2 }, heavy: true },
];

export const defaultLayoutId = "quad";
```

| Feld | Bedeutung |
| --- | --- |
| `slots` | Anzahl gleichzeitig gemounteter Player |
| `grid` | Spalten und Zeilen auf Desktop; mobile Varianten stehen im Design-System |
| `featured` | erster Slot wird gross dargestellt (1 gross + 2 klein) |
| `heavy` | zeigt den Performance-Hinweis und schlägt niedrigere Qualität vor |

Die `id`-Werte stimmen mit dem `check`-Constraint auf `user_settings.layout` überein
([`04-datenmodell.md`](04-datenmodell.md)). Ein neues Preset erfordert deshalb eine
Migration.

---

## 5. Was **nicht** in die Config gehört

| Nicht hierher | Richtiger Ort |
| --- | --- |
| Supabase-URL, Keys | Umgebungsvariablen ([`11-umgebungsvariablen.md`](11-umgebungsvariablen.md)) |
| Twitch-Client-Secret | serverseitige Umgebungsvariable |
| Erlaubte Parent-Domains | `NEXT_PUBLIC_TWITCH_PARENTS` |
| Rennstatus, aktueller Fahrer | Tabelle `race_state` |
| Stint-Zeiten, Fahrer-Bio | Tabelle `drivers` |
| Benutzer, Rollen | Tabelle `profiles` |
| Farben, Abstände | Design-Tokens in `src/styles/` |

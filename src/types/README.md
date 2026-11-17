# `src/types` — Gemeinsame Typen

Domänentypen, die mehr als eine Datei braucht. Lokale Props-Typen bleiben bei ihrer
Komponente.

| Datei | Inhalt |
| --- | --- |
| `stream.ts` | `StreamConfig` (inklusive `car`, `carNumber`, `carClass`), `StreamStatus`, `StreamLiveInfo`, `StreamStatusMap` |
| `layout.ts` | `LayoutId`, `LayoutPreset`, `GridSpec`, `ChatTab`, `PlayerLayoutState` |
| `race.ts` | `RaceConfig`, `RaceStatus`, `RaceState`, `RaceEntry`, `TrackInfo`, `TeamInfo`, `DriverRecord`, `RaceClock` |
| `event.ts` | `EventConfig` (inklusive `browserTitle`), `SocialLink`, `Sponsor`, `ScheduleEntry` |
| `chat.ts` | `ChatMessage`, `ChatBan`, `ChatRestriction`, `ModerationAction` |
| `user.ts` | `UserRole`, `ROLE_RANK`, `Profile`, `SessionUser`, `UserSettings` |
| `twitch.d.ts` | Typen für das global geladene Twitch-Embed-Script |

`database.ts` (generierte Supabase-Typen) entsteht erst mit der ersten Migration, die
über `0001_profiles.sql` hinausgeht.

## Regeln

- `database.ts` wird generiert und **nicht** per Hand bearbeitet:

  ```bash
  npx supabase gen types typescript --project-id <ref> > src/types/database.ts
  ```

  Nach jeder Migration neu erzeugen.
- Domänentypen sind nicht identisch mit Datenbankzeilen. Datenzugriffsfunktionen in
  `src/lib/` bilden `database.ts`-Zeilen auf die Typen hier ab, damit die UI nicht an das
  Datenbankschema gekoppelt ist
- `UserRole` und `RaceStatus` spiegeln die Postgres-Enums aus
  [`../../docs/04-datenmodell.md`](../../docs/04-datenmodell.md). Eine Änderung dort
  erfordert eine Änderung hier
- `LayoutId` entspricht dem `check`-Constraint auf `user_settings.layout`
- Nur Typen und Interfaces, keine Laufzeitwerte. Zod-Schemas gehören nach
  `src/lib/validation/`
- Kein `any`. Unbekanntes ist `unknown` und wird validiert, bevor es verwendet wird

# `src/types` — Gemeinsame Typen

Domänentypen, die mehr als eine Datei braucht. Lokale Props-Typen bleiben bei ihrer
Komponente.

| Datei | Inhalt |
| --- | --- |
| `stream.ts` | `StreamConfig`, `StreamStatus`, `SlotId` |
| `layout.ts` | `LayoutId`, `LayoutPreset`, `GridSpec` |
| `race.ts` | `RaceConfig`, `RaceStatus`, `RaceState`, `Driver`, `Stint` |
| `event.ts` | `EventConfig`, `SocialLink`, `Sponsor`, `ScheduleEntry` |
| `chat.ts` | `ChatMessage`, `ChatBan`, `ChatTab` |
| `user.ts` | `Profile`, `UserRole`, `UserSettings` |
| `database.ts` | generierte Supabase-Typen |

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

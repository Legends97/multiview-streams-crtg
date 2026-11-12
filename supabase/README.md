# `supabase` — Datenbank

| Ordner | Inhalt |
| --- | --- |
| `migrations/` | SQL-Migrationen: Schema, Enums, Trigger, RLS-Policies, Realtime |

Die Migrationen entstehen gemäss [`../docs/02-entwicklungsplan.md`](../docs/02-entwicklungsplan.md).
Der vollständige SQL-Inhalt steht als Referenz in
[`../docs/04-datenmodell.md`](../docs/04-datenmodell.md).

## Geplante Reihenfolge

| Datei | Inhalt | Phase |
| --- | --- | --- |
| `0001_profiles.sql` | Enums, Hilfsfunktionen, `profiles`, Trigger, Storage-Policies | 5 |
| `0002_chat.sql` | `chat_messages`, `chat_bans`, `is_chat_restricted`, Realtime | 6 |
| `0003_user_settings.sql` | `user_settings` | 7 |
| `0004_race.sql` | `race_status`, `race_state`, `drivers`, Realtime | 8 |
| `0005_viewer_stats.sql` | `viewer_stats` | 10 |

## Regeln

- Nummerierung aufsteigend, Reihenfolge ist bindend
- **Bestehende Migrationen werden nie nachträglich bearbeitet.** Korrekturen kommen als
  neue Datei, sonst laufen Produktion und lokale Umgebung auseinander
- Jede neue Tabelle erhält im selben Commit `enable row level security` **und** mindestens
  eine Policy
- Nach jeder Migration die Typen neu generieren:

  ```bash
  npx supabase gen types typescript --project-id <ref> > src/types/database.ts
  ```

## Befehle

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase migration new <name>    # neue Migrationsdatei
npx supabase db push                 # anwenden
npx supabase migration list          # Zustand prüfen
```

Einrichtung und Smoke-Tests: [`../docs/05-supabase-setup.md`](../docs/05-supabase-setup.md)

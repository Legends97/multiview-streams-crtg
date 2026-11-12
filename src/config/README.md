# `src/config` — Zentrale Konfiguration

Hier wird gepflegt, was sich pro Rennen oder pro Team ändert. Diese vier Dateien sind die
einzige Stelle für Fahrer, Kanäle, Zeiten und Sponsoren.

| Datei | Inhalt | Ändert sich |
| --- | --- | --- |
| `streams.ts` | Fahrer und ihre Twitch-Kanäle, plus `getActiveStreams()`, `getStreamById()` | pro Rennen |
| `race.ts` | Rennname, Strecke, Klasse, Team, Fahrzeug, Startzeit, Dauer | pro Rennen |
| `event.ts` | Teamtexte, Zeitplan, Social Media, Sponsoren | selten |
| `layouts.ts` | Layout-Presets des Players und Default-Layout | fast nie |

## Fahrer hinzufügen

1. Objekt in `streams` ergänzen, `id` eindeutig und klein geschrieben
2. `twitchChannel` exakt wie der Twitch-Login (nicht der Anzeigename, keine URL)
3. Avatar als WebP nach `public/drivers/` legen und Pfad eintragen
4. `npm run dev`, Player und Chat prüfen
5. `npm run typecheck && npm run lint && npm run build`, dann deployen

Einen Fahrer entfernen: `active: false` setzen statt löschen. Die `id` wird in
`user_settings` und `drivers.stream_id` referenziert und darf nachträglich nicht geändert
werden.

## Regeln

- Keine Secrets, Keys oder URLs mit Zugangsdaten — die gehören in Umgebungsvariablen
  ([`../../docs/11-umgebungsvariablen.md`](../../docs/11-umgebungsvariablen.md))
- Keine Werte, die sich während des Rennens ändern: Rennstatus, aktueller Fahrer und
  Stint-Zeiten liegen in der Datenbank und sind über `/admin/race` editierbar
- Jede Datei wird beim Import mit einem Zod-Schema aus `src/lib/validation/config.ts`
  geprüft. Ein Fehler bricht Build oder Start mit klarer Meldung ab
- Zeitangaben immer als ISO-8601 **mit Zeitzonen-Offset** (`2026-05-16T14:00:00+02:00`)
- Komponenten nutzen die Selektoren, nicht die Arrays direkt

Feldbeschreibungen und Beispiele:
[`../../docs/07-konfiguration.md`](../../docs/07-konfiguration.md)

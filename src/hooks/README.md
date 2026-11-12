# `src/hooks` — React-Hooks

Wiederverwendbare Client-Logik. Jeder Hook steckt in einer eigenen Datei, benannt
`use-<thema>.ts`, mit gleichnamigem benanntem Export.

## Vorgesehene Hooks

| Hook | Zweck |
| --- | --- |
| `use-race-clock.ts` | Rennzeit, Restzeit und Fortschritt aus `race.startsAt` bzw. `race_state.started_at`; rein lokaler Timer, kein Netzwerkverkehr |
| `use-race-state.ts` | Realtime-Subscription auf `race_state`, liefert Status, aktuellen Fahrer und Notiz |
| `use-community-chat.ts` | Realtime-Subscription auf `chat_messages`, Nachrichtenliste, Senden, Auto-Scroll-Steuerung |
| `use-twitch-player.ts` | Lebenszyklus einer Player-Instanz (Instanz im Ref, Mute, Volume, Qualität, Events) |
| `use-stream-status.ts` | Live-Status aus `/api/twitch/status`, mit Fallback auf Player-Events |
| `use-viewer-count.ts` | aggregierte Zuschauerzahl für den Header |
| `use-media-query.ts` | Breakpoint-Erkennung für das Grid-Verhalten |
| `use-fullscreen.ts` | Fullscreen-API inklusive Safari-Besonderheiten |
| `use-keyboard-shortcuts.ts` | Tastenkürzel des Players, inaktiv in Eingabefeldern |
| `use-debounced-callback.ts` | Debounce für das Speichern der Einstellungen |
| `use-local-storage.ts` | versionierter Zugriff auf `localStorage` mit try/catch |

## Regeln

- Jeder Hook räumt im Effekt-Return vollständig auf: Subscriptions beenden, Timer löschen,
  Player zerstören, Event-Listener entfernen
- Genau eine Realtime-Subscription pro Kanal und Hook-Instanz
- Hochfrequente Werte (Volume, Timer) bleiben lokal und werden debounced nach oben gemeldet
- Kein Zugriff auf `window` oder `document` ausserhalb von Effekten
- Hooks enthalten keine Darstellung und kein JSX

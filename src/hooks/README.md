# `src/hooks` — React-Hooks

Wiederverwendbare Client-Logik. Jeder Hook steckt in einer eigenen Datei, benannt
`use-<thema>.ts`, mit gleichnamigem benanntem Export.

## Vorhandene Hooks

| Hook | Zweck |
| --- | --- |
| `use-race-clock.ts` | Rennzeit, Restzeit und Fortschritt aus `race.startsAt` bzw. `race_state.started_at`; rein lokaler Timer, kein Netzwerkverkehr |
| `use-breakpoint.ts` | Breakpoint-Erkennung für das Grid-Verhalten |
| `use-fullscreen.ts` | Fullscreen-API inklusive Safari-Besonderheiten |
| `use-keyboard-shortcuts.ts` | Tastenkürzel des Players, inaktiv in Eingabefeldern und im fokussierten Chat-iframe |
| `use-lazy-mount.ts` | mountet schwere Inhalte erst, wenn sie sichtbar werden |

Der Lebenszyklus der Player-Instanz steckt in `src/components/stream/twitch-player.tsx`
und nicht in einem Hook: die Instanz gehört genau einer Kachel. Die Twitch-Sitzung der
Zuschauer liest `twitch-chat-composer.tsx` über `useSyncExternalStore` aus
`src/lib/twitch/auth.ts`.

## Mit ihren Phasen geplant

| Hook | Zweck | Phase |
| --- | --- | --- |
| `use-race-state.ts` | Realtime-Subscription auf `race_state` | 8 (Datenbankteil) |
| `use-community-chat.ts` | Realtime-Subscription auf `chat_messages` | 6 |
| `use-stream-status.ts` | Live-Status aus `/api/twitch/status` | 11 |
| `use-viewer-count.ts` | aggregierte Zuschauerzahl für den Header | 11 |
| `use-debounced-callback.ts` | Debounce für das Speichern der Einstellungen | 7 |
| `use-local-storage.ts` | versionierter Zugriff auf `localStorage` | 7 |

## Regeln

- Jeder Hook räumt im Effekt-Return vollständig auf: Subscriptions beenden, Timer löschen,
  Player zerstören, Event-Listener entfernen
- Genau eine Realtime-Subscription pro Kanal und Hook-Instanz
- Hochfrequente Werte (Volume, Timer) bleiben lokal und werden debounced nach oben gemeldet
- Kein Zugriff auf `window` oder `document` ausserhalb von Effekten
- Hooks enthalten keine Darstellung und kein JSX

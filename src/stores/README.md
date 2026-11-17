# `src/stores` — Client-State

Nur Zustand, der im Browser lebt und nicht aus der Datenbank kommt. Persistente Daten
gehören nach Supabase, Konfiguration nach `src/config/`.

| Store | Inhalt |
| --- | --- |
| `player-store.ts` | Layout, Slot-Belegung, Fokus-Stream, Mute- und Volume-Werte, Chat-Sichtbarkeit, Chat-Tab, Theater Mode, Live-Status je Stream (`statuses`), Startsignal für alle Kacheln (`startEpoch`) |

`ui-store.ts` ist noch nicht nötig: Overlays und Hinweise leben bisher lokal in ihren
Komponenten. Er kommt erst, wenn Zustand wirklich zwischen Bereichen geteilt wird.

`statuses` meldet jede Kachel selbst aus den Player-Events; das Chat-Panel liest daraus,
welche Fahrer gerade senden, und zeigt deren Chats gleichzeitig. `startEpoch` ist der
Knopf "Streams starten" in der Werkzeugleiste: er erhöht sich und jede Kachel versucht
daraufhin erneut, die Wiedergabe zu starten, falls der Browser das Autoplay unterbunden hat.

## Regeln

- Stores halten **nur serialisierbare Werte**. Player-Instanzen und DOM-Referenzen gehören
  in `useRef`, nie in den Store
- Selektive Abos: Komponenten lesen gezielt ihren Teil (`useStreamSlot(slotId)`), damit eine
  Volume-Änderung nicht das ganze Grid neu rendert
- Mutationen laufen über benannte Aktionen im Store, nicht über direktes Setzen von aussen
- Persistenz:
  - eingeloggt → debounced per Server Action nach `user_settings`
  - Gast → `localStorage` unter einem versionierten Schlüssel (`multistream.player.v1`)
- Beim Laden wird die Slot-Belegung gegen `getActiveStreams()` gefiltert; unbekannte oder
  inaktive Stream-IDs werden verworfen
- Schema-Änderung heisst neue Version im Schlüssel. Alte Zustände werden verworfen, nicht
  migriert

Details: [`../../docs/08-multistream-player.md`](../../docs/08-multistream-player.md),
Abschnitte 4 und 5.

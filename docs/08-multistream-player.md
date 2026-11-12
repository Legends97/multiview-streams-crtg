# 08 — Multistream-Player

Der Player ist das Herzstück. Er muss 24 Stunden ohne Reload durchhalten, auf
Mittelklasse-Hardware bedienbar bleiben und bei einem ausgefallenen Stream nicht das ganze
Grid mitreissen.

Technische Grundlagen der Twitch-Einbindung: [`06-twitch-embed.md`](06-twitch-embed.md).

---

## 1. Layout-Matrix

| Preset | Slots | Desktop (`xl`) | Tablet (`md`) | Mobil | Hinweis |
| --- | --- | --- | --- | --- | --- |
| `single` | 1 | 1 × 1 | 1 × 1 | 1 × 1 | Standard für schwache Geräte |
| `dual` | 2 | 2 × 1 | 1 × 2 | 1 Player + Leiste | |
| `triple` | 3 | 1 gross links, 2 gestapelt rechts | 1 × 3 | 1 Player + Leiste | `featured` |
| `quad` | 4 | 2 × 2 | 2 × 2 | 1 Player + Leiste | Default |
| `six` | 6 | 3 × 2 | 2 × 3 | 1 Player + Leiste | `heavy` |
| `eight` | 8 | 4 × 2 | 2 × 4 | 1 Player + Leiste | `heavy` |

- Jedes Tile behält 16:9
- Die Grid-Höhe ist `100dvh` minus Header und Toolbar, damit im Theater Mode nichts
  gescrollt werden muss
- Mobil ist immer nur **ein** Player gemountet; die übrigen Fahrer erscheinen als
  horizontale Auswahlleiste mit Thumbnail und Namen
- Die Presets stehen in `src/config/layouts.ts`

---

## 2. Interaktionen

| Aktion | Bedienung | Verhalten |
| --- | --- | --- |
| Layout wechseln | Toolbar-Switcher, `1`–`6` | Slots werden neu belegt, nur Differenz wird gemountet |
| Fahrer in Slot setzen | Dropdown im Slot-Overlay | tauscht mit dem bisherigen Slot, wenn der Fahrer schon läuft |
| Streams tauschen | Drag auf ein anderes Tile | Slot-Belegung wird vertauscht, keine Neuinitialisierung |
| Maximieren | Doppelklick oder Button | Tile wird zum `single`-Layout; zurück mit `Esc`, voriges Layout bleibt gemerkt |
| Fokus setzen | Klick auf ein Tile | Tile erhält Ton und bestimmt den Twitch-Chat |
| Stummschalten | Button im Overlay, `m` | nur dieses Tile |
| Lautstärke | Slider im Overlay, `↑`/`↓` | pro Stream, wird gespeichert |
| Vollbild | Button, `f` | Fullscreen-API auf den Grid-Container |
| Theater Mode | Button, `t` | Header und Footer verstecken, Grid auf volle Höhe |
| Chat ein/aus | Button, `c` | Chat-Panel wird unmountet, Grid nimmt die Breite ein |
| Qualität | Overlay-Menü | `setQuality` pro Player |
| Zurücksetzen | Toolbar | Default-Layout und Default-Belegung |

Tastenkürzel greifen nur, wenn kein Eingabefeld fokussiert ist. Die Liste ist über ein
`?`-Overlay einsehbar.

### Fokus-Audio

Genau ein Stream ist unmuted. Beim Fokuswechsel wird zuerst der alte Player stumm
geschaltet, dann der neue entmutet — nie umgekehrt, sonst gibt es eine hörbare Überlappung.
Der Fokus bestimmt zusätzlich den Kanal des Twitch-Chats.

---

## 3. Intelligentes Stream-Loading

Vier Regeln, in dieser Reihenfolge:

1. **Nur Slots des aktiven Layouts werden gemountet.** Ein Fahrer, der nicht im Grid ist,
   hat keine Player-Instanz. Kein Vorladen "auf Vorrat".
2. **Sichtbarkeit zählt.** Tiles werden per `IntersectionObserver` beobachtet. Ein Tile, das
   aus dem Viewport scrollt (Tablet, Mobil), wird pausiert; ist es vollständig verlassen und
   nicht im Fokus, wird es nach 10 Sekunden zerstört.
3. **Tab im Hintergrund.** Bei `document.visibilityState === "hidden"` werden alle Player
   ohne aktiven Ton pausiert und bei Rückkehr wieder gestartet.
4. **Qualitätsdrosselung.** Bei `heavy`-Layouts (6, 8) wird nach `READY` automatisch
   `setQuality("480p")` gesetzt; der fokussierte Stream behält `auto`. Die Drosselung ist im
   Overlay sichtbar und manuell übersteuerbar.

Dazu:

- Mounten wird gestaffelt (etwa 150 ms Versatz pro Player), damit nicht acht iframes
  gleichzeitig Verbindungen aufbauen
- Der Layout-Switcher zeigt bei 6 und 8 Streams einen Hinweis auf CPU- und Bandbreitenbedarf
- Beim Unmount immer `player.destroy()` und Container leeren

---

## 4. Re-Render-Vermeidung

Der häufigste Fehler in einem solchen Grid ist ein Player, der bei jedem Store-Update neu
aufgebaut wird. Dagegen:

- **Player-Instanz in `useRef`**, niemals in State. State hält nur serialisierbare Werte
  (Kanal, Mute, Volume, Status)
- **`useEffect` nur mit `[channel]`** als Abhängigkeit. Mute, Volume und Qualität laufen über
  separate Effekte, die die bestehende Instanz ansprechen
- **Stabile `key`s:** `key={slotId}`, nicht der Array-Index. Ein Tausch darf keinen Remount
  auslösen
- **`React.memo`** auf `StreamSlot` und `TwitchPlayer`; Vergleich auf die wenigen Props, die
  wirklich zählen
- **Selektive Store-Abos:** jede Komponente liest nur ihren Teil
  (`useStreamSlot(slotId)`), nicht den ganzen Store. Kein grosser Context, der bei jeder
  Volume-Änderung alles neu rendert
- **Callbacks memoisieren** (`useCallback`), damit memoisierte Kinder nicht invalidieren
- Hochfrequente Werte (Volume-Slider, Rennuhr) werden lokal gehalten und debounced nach
  oben gemeldet
- Kontrolle: React DevTools Profiler mit "Highlight updates" — ein Volume-Slider darf nur
  sein eigenes Overlay neu rendern

---

## 5. Zustand und Persistenz

```ts
// src/stores/player-store.ts (Form, nicht vollständig)
interface PlayerState {
  layoutId: LayoutId;
  slots: (string | null)[];        // Stream-IDs je Slot
  focusedStreamId: string | null;  // genau dieser Stream hat Ton
  volumes: Record<string, number>; // 0..1 pro Stream
  muted: Record<string, boolean>;
  chatVisible: boolean;
  chatTab: "twitch" | "community";
  theaterMode: boolean;
}
```

- Änderungen wirken sofort im Store (optimistisch)
- Für eingeloggte Benutzer: debounced (etwa 800 ms) per Server Action nach `user_settings`
- Für Gäste: `localStorage` unter einem versionierten Schlüssel
  (`multistream.player.v1`)
- Beim Laden wird die Belegung gegen `getActiveStreams()` gefiltert: unbekannte oder
  inaktive IDs fallen heraus und werden durch die nächsten Fahrer nach `priority` ersetzt
- Schema-Änderungen erhöhen die Version im Schlüssel; alte Zustände werden verworfen, nicht
  migriert

---

## 6. Fehlerzustände

| Fall | Erkennung | Reaktion |
| --- | --- | --- |
| Kanal offline | Player-Event `OFFLINE` oder Helix-Status | gedimmtes Tile, Badge "OFFLINE", Button "Erneut versuchen" |
| Kanal existiert nicht | Helix meldet den Login nicht | Badge "Kanal nicht gefunden", Hinweis auf die Config |
| Wiedergabe blockiert | `PLAYBACK_BLOCKED` | Play-Button-Overlay |
| Kanal sendet, Video startet nicht | `ONLINE` ohne `PLAYING` | zwei automatische `play()`-Versuche, danach durchscheinendes Overlay "Stream starten" über dem geladenen Player |
| Gar keine Rückmeldung | weder `ONLINE` noch `OFFLINE` nach 15 s | Hinweis "Keine Rückmeldung" mit "Erneut versuchen"; der Player bleibt montiert |
| Script lädt nicht | `onerror` im Loader | Fehlerkarte mit Reload, restliche UI bleibt bedienbar |
| Verbindung abgebrochen | `ENDED` ohne Benutzeraktion | drei Reconnect-Versuche mit 2 s, 5 s, 15 s Abstand, dann Offline-Darstellung |
| Stream während des Rennens weg | Event-Kombination | Tile bleibt im Slot, der Fahrer verschwindet nicht aus der Auswahl |

Jedes Tile ist von einer eigenen Error-Boundary umgeben. Eine defekte Player-Instanz
beendet nie das Grid.

---

## 7. Abnahmekriterien

- [ ] Alle sechs Layouts laufen mit echten Kanälen
- [ ] Layoutwechsel von 4 auf 6 mountet genau zwei zusätzliche Player (DevTools-Netzwerk)
- [ ] Layoutwechsel von 6 auf 2 zerstört vier Player, kein Audio bleibt hörbar
- [ ] Volume-Änderung rendert nur das betroffene Overlay neu
- [ ] Tausch zweier Tiles erzeugt keinen Player-Remount (kein schwarzes Flackern)
- [ ] Genau ein Stream hat Ton, jederzeit
- [ ] Offline-Kanal zeigt die Fallback-Karte, die anderen Tiles laufen weiter
- [ ] Layout übersteht einen Reload (eingeloggt und als Gast)
- [ ] Nach 60 Minuten Dauerbetrieb mit vier Streams keine wachsende Speichernutzung
- [ ] Mobil: nur ein Player gemountet, Auswahlleiste bedienbar
- [ ] Tastenkürzel funktionieren und greifen nicht in Eingabefeldern

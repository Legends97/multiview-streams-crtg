# 06 — Twitch-Embeds

Alles, was von Twitch kommt, läuft über die offiziellen Embeds. Kein eigener Player, kein
Proxying von Video, kein IRC-Nachbau für den Twitch-Chat.

---

## 1. Welche Varianten es gibt

| Variante | Script / URL | Liefert | Einsatz hier |
| --- | --- | --- | --- |
| **Interactive Frames (Embed)** | `https://embed.twitch.tv/embed/v1.js` → `new Twitch.Embed(...)` | Video **und** Chat in einem iframe | nicht verwendet (Chat soll separat steuerbar sein) |
| **Embedded Player** | `https://player.twitch.tv/js/embed/v1.js` → `new Twitch.Player(...)` | nur Video, mit JS-API | **Multistream-Grid** |
| **Embedded Chat** | `https://www.twitch.tv/embed/<channel>/chat?parent=<host>` als iframe | nur Chat, inklusive Login und Emotes | **Chat-Panel, Tab "Twitch"** |

Für das Grid wird der **Embedded Player** gebraucht, weil nur er eine JS-API für Mute,
Volume, Qualität und Kanalwechsel bietet. Der Chat kommt als eigenes iframe, damit er
unabhängig vom fokussierten Stream umgeschaltet und ausgeblendet werden kann.

---

## 2. Der `parent`-Parameter

Twitch verlangt bei jedem Embed die Angabe der Domain, die das iframe einbettet. Stimmt sie
nicht mit der tatsächlichen Host-Domain überein, bleibt der Player schwarz oder der Chat
zeigt "This content is not available".

Regeln:

- Nur der Hostname, **ohne** Protokoll, ohne Port, ohne Pfad: `meine-domain.de`,
  nicht `https://meine-domain.de:443/`
- `localhost` ist erlaubt (Port wird ignoriert)
- **Keine Wildcards.** `*.vercel.app` funktioniert nicht, jede Domain muss einzeln genannt
  werden
- Beim Chat-iframe können mehrere `parent`-Parameter angehängt werden:
  `?parent=a.de&parent=b.de`
- Produktion muss über HTTPS laufen, sonst verweigern Browser das iframe

### Konfiguration im Projekt

```env
# .env.local / Vercel
NEXT_PUBLIC_TWITCH_PARENTS=localhost,multistream-24h.vercel.app,24h.mein-team.de
```

```ts
// src/lib/twitch/parents.ts
/**
 * Erlaubte Parent-Hosts für Twitch-Embeds.
 * Reihenfolge ist irrelevant; der aktuelle Host muss enthalten sein.
 */
export function getTwitchParents(): string[] {
  const configured = (process.env.NEXT_PUBLIC_TWITCH_PARENTS ?? "")
    .split(",")
    .map((host) => host.trim().replace(/^https?:\/\//, "").split("/")[0])
    .filter(Boolean);

  // Laufzeit-Host ergänzen, damit Vercel-Preview-Deployments funktionieren.
  if (typeof window !== "undefined") {
    const current = window.location.hostname;
    if (current && !configured.includes(current)) {
      configured.push(current);
    }
  }

  return Array.from(new Set(configured));
}
```

Das Ergänzen des Laufzeit-Hosts ist der einzige praktikable Weg für Vercel-Previews, deren
URL pro Deployment wechselt. Für die Produktionsdomain wird der Host trotzdem explizit in
der Variable eingetragen, damit serverseitig gerendertes Markup bereits korrekt ist.

---

## 3. Player einbinden

```ts
// src/lib/twitch/load-embed.ts
const PLAYER_SCRIPT = "https://player.twitch.tv/js/embed/v1.js";
let loader: Promise<void> | null = null;

/** Lädt das Twitch-Player-Script genau einmal pro Seitenaufruf. */
export function loadTwitchPlayerScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Twitch-Script nur im Browser"));
  }
  if (window.Twitch?.Player) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PLAYER_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      reject(new Error("Twitch-Player-Script konnte nicht geladen werden"));
    };
    document.head.appendChild(script);
  });

  return loader;
}
```

Instanziierung in `TwitchPlayer`:

```ts
const player = new window.Twitch.Player(containerId, {
  channel,
  parent: getTwitchParents(),
  width: "100%",
  height: "100%",
  autoplay: true,
  muted: true,          // Pflicht, siehe Abschnitt 4
  controls: false,      // eigene Overlay-Steuerung
  playsinline: true,
});
```

**Lebenszyklus**

- Die Instanz wird in einem `useRef` gehalten, nie in State
- `useEffect` mit Abhängigkeit **nur** auf `channel`; Lautstärke, Mute und Grösse werden
  über die API gesetzt, nicht durch Neuaufbau
- Beim Unmount `player.destroy()` aufrufen und den Container leeren, sonst bleiben
  Audio-Streams und Netzwerkverbindungen bestehen
- Relevante API: `setMuted`, `setVolume`, `setChannel`, `setQuality`, `getQualities`,
  `pause`, `play`
- Nützliche Events: `Twitch.Player.READY`, `PLAYING`, `OFFLINE`, `ENDED`, `PLAYBACK_BLOCKED`

---

## 4. Autoplay, Audio und Browser-Richtlinien

- Autoplay mit Ton ist in allen aktuellen Browsern blockiert. **Jeder Player startet
  stumm.** Kein Workaround, kein Versuch, es anders zu lösen
- Ton erfordert eine Benutzeraktion. Die Oberfläche macht das sichtbar: ein deutlicher
  "Ton aktivieren"-Zustand auf dem fokussierten Tile
- Genau ein Stream darf unmuted sein (Fokus-Audio). Beim Wechsel wird der alte Stream
  stumm geschaltet, bevor der neue Ton erhält
- Safari/iOS: Vollbild und Autoplay sind zusätzlich eingeschränkt; `playsinline: true` ist
  Pflicht, Vollbild nur über eine Benutzeraktion
- `PLAYBACK_BLOCKED` abfangen und einen Play-Button über dem Tile anzeigen, statt stumm zu
  scheitern
- **Wichtig:** Lehnt der Browser den Start ab, meldet Twitch häufig überhaupt nichts —
  weder `PLAYING` noch `PLAYBACK_BLOCKED`. Der Player bleibt still auf "bereit" stehen.
  Deshalb gilt `ONLINE` als Beleg dafür, dass der Kanal sendet, und `PLAYING` getrennt
  davon als Beleg dafür, dass Video läuft. Wer nur auf `PLAYING` wartet, zeigt einen
  laufenden Stream fälschlich als tot an
- Nach `ONLINE` ruft der Player zweimal selbst `play()` auf (nach 2,5 s und 7 s). Bleibt es
  dabei, bietet die Kachel einen Startknopf an; die Werkzeugleiste startet mit
  "Streams starten" alle Kacheln auf einmal. Der Klick liefert die Nutzeraktion, die der
  Browser verlangt
- Lautstärke pro Stream in `user_settings.volumes` speichern, damit sie beim nächsten
  Besuch wieder stimmt

---

## 5. Chat einbinden

```tsx
const src = new URL(`https://www.twitch.tv/embed/${channel}/chat`);
getTwitchParents().forEach((p) => src.searchParams.append("parent", p));
src.searchParams.set("darkpopout", "");   // dunkles Chat-Theme

<iframe
  key={channel}            // Kanalwechsel erzwingt einen frischen Chat
  src={src.toString()}
  title={`Twitch-Chat von ${channel}`}
  className="h-full w-full border-0"
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals
           allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
/>;
```

Hinweise:

- **Es laufen alle Chats der sendenden Fahrer gleichzeitig**, untereinander im
  Chat-Bereich. Der Live-Status kommt aus `usePlayerStore().statuses`, den die
  Kacheln aus den Player-Ereignissen melden. Sendet niemand, bleibt der Chat des
  fokussierten Fahrers stehen
- `key={channel}` ist wichtig: ohne Remount behält das iframe den alten Kanal
- **`allow-storage-access-by-user-activation` nicht weglassen.** Ohne diese Freigabe
  bleibt das Chat-Fenster leer, sobald der Browser Drittanbieter-Cookies blockiert —
  Twitch kann dann nicht auf die eigene Anmeldung zugreifen. Der offizielle
  Twitch-Player setzt dieselben Freigaben fuer sein eigenes iframe
- Als Rückfallebene steht unter dem Chat ein Knopf "Chat in eigenem Fenster öffnen"
  (`buildChatPopoutUrl`). Dort gelten die Embed-Beschränkungen nicht, Lesen und Schreiben
  funktionieren auch bei strengen Cookie-Einstellungen
- Das Chat-Embed bringt seinen eigenen Twitch-Login mit; die Plattform-Anmeldung hat damit
  nichts zu tun. Das wird in der UI erklärt, sonst entsteht Verwirrung
- Moderationswerkzeuge im Twitch-Chat gehören zu Twitch, nicht zur Plattform. Die eigene
  Moderation betrifft ausschliesslich den Community-Chat
- Drittanbieter-Cookies: Blockiert der Browser sie, ist der Chat nur lesend nutzbar. Ein
  Hinweis mit Link "In Twitch öffnen" abfangen
- Der Chat darf im Theater Mode ausgeblendet werden, wird dabei aber bewusst **unmountet**,
  um die Verbindung zu beenden

---

## 6. Offline-Erkennung und Fallbacks

Der Player meldet `OFFLINE`, wenn ein Kanal nicht sendet, unterscheidet aber nicht zwischen
"offline" und "existiert nicht". Für belastbare Information kommt die Helix-API dazu:

```
GET /api/twitch/status
→ { "driver-1": { "live": true, "viewers": 184 }, "driver-2": { "live": false } }
```

Umsetzung (Phase 11):

- Route Handler `src/app/api/twitch/status/route.ts`
- Server-zu-Server mit **App Access Token** (Client Credentials), Client-ID und Secret als
  serverseitige Variablen
- Ein Request für alle Kanäle: `GET https://api.twitch.tv/helix/streams?user_login=a&user_login=b…`
  (bis 100 Logins pro Aufruf)
- Antwort mit `revalidate` von 60 Sekunden cachen; Twitch-Rate-Limits beachten
- Ergebnis zusätzlich in `viewer_stats` schreiben (Service-Role-Key, serverseitig)
- Fällt die API aus, bleibt die UI funktionsfähig: unbekannter Status wird als "unbekannt"
  behandelt, nicht als offline

Diese Route ist **optional**. Ohne Twitch-Credentials läuft die Plattform vollständig,
zeigt dann aber nur den Status, den der Player selbst meldet, und keine Zuschauerzahlen.

### Fallback-Darstellung

| Zustand | Darstellung im Tile |
| --- | --- |
| lädt | Skeleton mit Fahrername und Rolle |
| offline | gedimmtes Tile, Fahrername, Badge "OFFLINE", Button "Erneut versuchen" |
| Kanal unbekannt | Badge "Kanal nicht gefunden", Hinweis auf `src/config/streams.ts` |
| Wiedergabe blockiert | Overlay mit Play-Button |
| Script-Fehler | Fehlerkarte mit Reload-Hinweis, restliches Grid bleibt bedienbar |

Ein defekter Stream darf nie das ganze Grid mitnehmen: jedes Tile hat eine eigene
Error-Boundary.

---

## 7. Grenzen bei vielen parallelen Playern

Realistische Beobachtungen, die das Verhalten der Anwendung bestimmen:

- Jeder Player ist ein eigenes iframe mit eigener Videodekodierung. Ab etwa vier
  gleichzeitigen 1080p-Streams wird CPU oder GPU auf Mittelklasse-Hardware zum Engpass
- 8 × 1080p60 sind für die meisten Zuschauer nicht realistisch nutzbar. Deshalb: ab Layout
  "six" automatisch eine niedrigere Qualität vorschlagen (`setQuality("480p")`) und als
  Hinweis anzeigen, statt still zu scheitern
- Netzwerk: 8 Streams à 3–6 Mbit/s übersteigen viele Anschlüsse. Hinweis im
  Layout-Switcher bei 6 und 8
- Browser begrenzen gleichzeitige Verbindungen pro Host; zu viele Player erhöhen die
  Startverzögerung spürbar
- Nur sichtbare Player werden gemountet. Beim Verlassen des Tabs werden Hintergrundplayer
  pausiert (`document.visibilitychange`), sofern Ton nicht aktiv ist
- Mobil wird grundsätzlich nur ein Player gemountet

Details zur Loading-Strategie: [`08-multistream-player.md`](08-multistream-player.md).

---

## 8. Content-Security-Policy

Wenn eine CSP gesetzt wird (empfohlen in `next.config.ts`), müssen diese Quellen erlaubt
sein, sonst bleiben Player und Chat leer:

```
frame-src   https://player.twitch.tv https://www.twitch.tv https://embed.twitch.tv https://clips.twitch.tv;
script-src  'self' https://player.twitch.tv https://embed.twitch.tv;
img-src     'self' data: https://static-cdn.jtvnw.net https://*.supabase.co;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.twitch.tv;
media-src   https://*.ttvnw.net;
```

Beim Debuggen eines leeren Embeds immer zuerst die Browser-Konsole prüfen: fast alle Fälle
sind entweder ein fehlender `parent`-Host oder eine blockierende CSP.

# 01 — Architektur

## 1. Systemübersicht

```
┌──────────────────────────────────────────────────────────────────┐
│ Browser (Zuschauer)                                              │
│                                                                  │
│  React Client Components                                         │
│   ├─ Multistream-Grid  ──► Twitch Embedded Player (iframe)       │
│   ├─ Chat-Panel        ──► Twitch Embedded Chat   (iframe)       │
│   └─ Chat-Panel        ──► Supabase Realtime (WebSocket)         │
└───────────┬──────────────────────────────┬───────────────────────┘
            │ HTTP / RSC-Payload           │ WebSocket + REST
            ▼                              ▼
┌───────────────────────────┐   ┌──────────────────────────────────┐
│ Next.js auf Vercel        │   │ Supabase                         │
│  ├─ Server Components     │   │  ├─ Auth (E-Mail/Passwort)       │
│  ├─ Server Actions        │──►│  ├─ Postgres + RLS               │
│  ├─ Route Handler (/api)  │   │  ├─ Realtime (chat_messages)     │
│  └─ Middleware (Session)  │   │  └─ Storage (Avatare)            │
└───────────────────────────┘   └──────────────────────────────────┘
            │
            ▼ nur lesend, serverseitig
┌───────────────────────────┐
│ Twitch Helix API          │  Live-Status der konfigurierten Kanäle
└───────────────────────────┘
```

Twitch-Video und Twitch-Chat laufen **direkt vom Browser zu Twitch** über die offiziellen
Embeds. Es gibt kein Proxying von Videodaten. Der Server berührt Twitch nur optional für den
Live-Status (siehe [`06-twitch-embed.md`](06-twitch-embed.md), Abschnitt Offline-Erkennung).

## 2. Schichtenmodell

| Schicht | Ort | Verantwortung |
| --- | --- | --- |
| Präsentation | `src/components/`, `src/app/**/page.tsx` | Darstellung, lokaler UI-State |
| Orchestrierung | `src/app/**/layout.tsx`, Server Components | Daten laden, Zugriff prüfen, Props verteilen |
| Business-Logik | `src/lib/`, Server Actions | Regeln, Validierung, Berechtigungen, Spam-Schutz |
| Datenzugriff | `src/lib/supabase/`, `src/lib/twitch/` | Queries, Mutationen, externe APIs |
| Konfiguration | `src/config/` | Streams, Rennen, Event, Layout-Presets |

Regel: eine Schicht ruft nur die direkt darunterliegende. UI greift nie direkt auf
Supabase-Queries zu.

## 3. Routing-Karte

| Route | Rendering | Zugriff | Inhalt |
| --- | --- | --- | --- |
| `/` | Server | öffentlich | Landing/Hero mit Rennstatus, Einstieg in den Live-Bereich |
| `/live` | Server-Shell + Client-Player | öffentlich (Chat nur eingeloggt) | Multistream-Oberfläche mit Chat |
| `/race` | Server | öffentlich | Race-Information-System, Stints, Fahrerwechsel |
| `/event` | Server | öffentlich | Team, Fahrer, Fahrzeug, Strecke, Sponsoren |
| `/login` | Server + Form | nur Gäste | Anmeldung |
| `/register` | Server + Form | nur Gäste | Registrierung |
| `/reset-password` | Server + Form | nur Gäste | Passwort zurücksetzen |
| `/profile` | Server | eingeloggt | Profil, Benutzername, Avatar |
| `/settings` | Server | eingeloggt | Account- und Player-Einstellungen |
| `/admin` | Server | Admin | Übersicht, Statistiken |
| `/admin/users` | Server | Admin | Benutzer- und Rollenverwaltung |
| `/admin/chat` | Server | Moderator, Admin | Chat-Moderation, Bans |
| `/admin/race` | Server | Admin | Rennstatus, Rennzeiten |
| `/admin/drivers` | Server | Admin | Fahrerinformationen, aktueller Fahrer |
| `/api/auth/callback` | Route Handler | öffentlich | Supabase-Auth-Callback |
| `/api/twitch/status` | Route Handler | öffentlich, gecacht | Live-Status der Kanäle |

Route-Gruppen: `(auth)` für Gast-Routen mit schmalem Layout, `(main)` für das
Broadcast-Layout mit Header. `/admin` liegt bewusst ausserhalb der Gruppen und hat ein
eigenes Layout mit Rollenprüfung.

## 4. Datenflüsse

### 4.1 Stream-Auswahl und Layout

1. `src/config/streams.ts` wird zur Build-Zeit importiert und liefert die aktiven Fahrer.
2. Die Live-Seite lädt serverseitig die gespeicherten Benutzereinstellungen
   (`user_settings`), falls eingeloggt, sonst gilt das Default-Preset aus `layouts.ts`.
3. Der Client-Store (`src/stores/player-store.ts`) hält Layout, Slot-Belegung, Fokus-Slot,
   Mute- und Volume-Zustände.
4. Jede Änderung aktualisiert den Store sofort (optimistisch) und wird für eingeloggte
   Benutzer debounced per Server Action in `user_settings` persistiert.
5. Nicht eingeloggte Benutzer behalten ihr Layout über `localStorage`.

### 4.2 Community-Chat

1. Server Component lädt die letzten N Nachrichten (`chat_messages`, nach Zeit absteigend).
2. Der Client abonniert den Realtime-Kanal für `INSERT` und `DELETE` auf `chat_messages`.
3. Senden läuft über eine Server Action: Auth prüfen → Ban/Timeout prüfen → Rate-Limit →
   Zod-Validierung → Insert. Die eigene Nachricht erreicht den Client über Realtime.
4. Moderation (löschen, timeouten, bannen) sind eigene Server Actions mit Rollenprüfung;
   die RLS-Policies erlauben sie unabhängig davon nur Moderatoren und Admins.

### 4.3 Rennstatus

1. Basis ist `src/config/race.ts` (Startzeit, Dauer, Strecke, Fahrzeug, Team).
2. Der dynamische Zustand liegt in der Tabelle `race_state` (Status, aktueller Fahrer, Notiz).
3. Live- und Race-Seite abonnieren `race_state` per Realtime, damit ein Statuswechsel
   (zum Beispiel SAFETY CAR) ohne Reload bei allen Zuschauern ankommt.
4. Rennzeit und Restzeit werden **clientseitig** aus `startsAt` und `durationHours`
   berechnet, damit kein Sekundentakt über das Netz läuft.

### 4.4 Authentifizierung

Middleware erneuert bei jedem Request das Supabase-Session-Cookie und blockt geschützte
Routen früh. Rollen werden nie aus dem Cookie, sondern immer aus `profiles.role` gelesen.
Details in [`09-auth-und-rollen.md`](09-auth-und-rollen.md).

## 5. Komponentenhierarchie der Live-Seite

```
app/(main)/live/page.tsx            Server: Config, Settings, Chat-Historie, Race-State
└─ <LiveWorkspace>                  Client: Theater/Fullscreen-Zustand, Tastenkürzel
   ├─ <StreamToolbar>               Layout-Switcher, Fahrerauswahl, Chat-Toggle
   ├─ <StreamGrid>                  CSS-Grid nach Layout, memoisiert
   │  └─ <StreamSlot>  × n          Slot-Rahmen, Tauschen, Platzhalter
   │     ├─ <TwitchPlayer>          Player-Instanz in Ref, kein Remount bei Rerender
   │     └─ <StreamOverlay>         Fahrername, Rolle, Live-Badge, Mute, Volume, Maximieren
   └─ <ChatPanel>                   Tab-Umschaltung
      ├─ <TwitchChatEmbed>          iframe für den fokussierten Kanal
      └─ <CommunityChat>            Realtime-Liste, Eingabe, Moderationsaktionen
```

## 6. State-Strategie

| Art von Zustand | Ort | Begründung |
| --- | --- | --- |
| Config (Streams, Event, Rennbasis) | Import aus `src/config/` | ändert sich nur per Deployment |
| Persistente Daten (Profile, Chat, Race-State) | Supabase, geladen in Server Components | eine Quelle der Wahrheit, RLS-geschützt |
| Live-Änderungen (Chat, Race-State) | Supabase Realtime im Client | ohne Reload, geringe Latenz |
| Player-Layout, Mute, Volume, Fokus | Client-Store + Persistenz | hochfrequent, nur UI-relevant |
| Player-Instanzen | `useRef` | dürfen bei Rerender nicht neu erzeugt werden |
| Rennzeit und Countdown | lokaler Timer aus Config | kein Netzwerkverkehr im Sekundentakt |

## 7. Architekturentscheidungen

| Entscheidung | Begründung | Konsequenz |
| --- | --- | --- |
| Streams in Code statt Datenbank | Fahrerliste ist zum Rennen fix, kein Admin-Risiko während des Events, kein Query auf dem kritischen Pfad | Kanaländerung erfordert ein Deployment |
| Offizielle Twitch-Embeds statt eigenem Player | Twitch-Nutzungsbedingungen, Werbung, Chat-Funktionen, Wartungsaufwand | Autoplay- und Audio-Policies der Browser gelten |
| Zwei Chats parallel | Twitch-Chat ist nicht ersetzbar, Community-Chat erlaubt Moderation und Historie über alle Fahrer hinweg | zwei Moderationswelten, in der UI klar getrennt |
| Server Components als Standard | kleineres Client-Bundle, Secrets bleiben serverseitig | bewusst gesetzte `"use client"`-Grenzen |
| Rollen in `profiles.role` plus RLS | Berechtigung nicht umgehbar, auch nicht per manipuliertem Client | jede Policy muss die Rolle prüfen |
| Layout clientseitig, Persistenz debounced | flüssige Bedienung ohne Request pro Klick | kurzzeitig abweichender Server-Zustand |

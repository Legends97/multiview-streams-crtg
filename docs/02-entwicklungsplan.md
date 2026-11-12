# 02 — Entwicklungsplan

Umsetzung in 13 Phasen. Jede Phase endet mit dem Qualitäts-Gate:

```bash
npm run typecheck && npm run lint && npm run build
```

Erst wenn alle drei Befehle fehlerfrei durchlaufen und die Definition of Done erfüllt ist,
beginnt die nächste Phase. Gefundene Fehler werden sofort behoben, nicht vertagt.

---

## Phase 0 — Projekt-Setup und Tooling

**Ziel:** lauffähiges, leeres Next.js-Projekt mit allen Werkzeugen.

- Next.js mit TypeScript, App Router und `src/`-Verzeichnis initialisieren
- Tailwind CSS einrichten, shadcn/ui initialisieren, `lucide-react` und Framer Motion
  installieren
- `tsconfig.json` auf `strict`, Alias `@/*` auf `src/*`
- ESLint und Prettier konfigurieren, Scripts `dev`, `build`, `start`, `lint`, `typecheck`
- `.gitignore`, `.env.example`, Git-Repository initialisieren

**Dateien:** `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`,
`eslint.config.mjs`, `.env.example`, `src/app/layout.tsx`, `src/app/page.tsx`

**Definition of Done:** `npm run dev` zeigt eine leere Seite im Dark-Mode-Hintergrund,
Gate grün.

---

## Phase 1 — Design-System und Layout-Shell

**Ziel:** das Projekt sieht aus wie ein Broadcast-Produkt, bevor Funktionen dazukommen.

- Design-Tokens als CSS-Variablen in `src/styles/globals.css`, Mapping in `tailwind.config.ts`
- Schriftarten laden, Typografie-Skala, Basis-Utilities
- Header mit Logo, Event-Name, Navigation, Live-Badge, Zuschauerzahl, Auth-Slot
- Footer, Seitenrahmen, Container-Breiten
- Basis-Komponenten: `Button`, `Badge`, `Card`, `Dialog`, `Tabs`, `Tooltip`, `Avatar`,
  `StatusBadge`, `LiveDot`
- Route-Gruppen `(main)` und `(auth)` mit ihren Layouts

**Dateien:** `src/styles/`, `src/app/(main)/layout.tsx`, `src/app/(auth)/layout.tsx`,
`src/components/layout/*`, `src/components/ui/*`

**Definition of Done:** Header und Shell sind auf Desktop, Tablet und Smartphone korrekt,
alle Farben kommen aus Tokens, Gate grün.

---

## Phase 2 — Konfigurations-Layer

**Ziel:** eine einzige Stelle für Streams, Rennen und Event.

- `src/types/` für `Driver`, `StreamConfig`, `RaceConfig`, `EventConfig`, `LayoutPreset`
- `src/config/streams.ts`, `race.ts`, `event.ts`, `layouts.ts` mit echten Beispielwerten
- Zod-Schemas in `src/lib/validation/config.ts`, die die Config beim Start prüfen
  (doppelte `id`, leerer `twitchChannel`, unbekannte Rolle → sprechender Fehler)
- Selektoren: `getActiveStreams()`, `getStreamById()`, `getDefaultLayout()`

**Dateien:** `src/config/*`, `src/types/*`, `src/lib/validation/config.ts`

**Definition of Done:** Ein Fahrer lässt sich durch Eintragen eines Objekts hinzufügen, eine
fehlerhafte Config bricht den Build oder Start mit klarer Meldung ab, Gate grün.

---

## Phase 3 — Multistream-Player

**Ziel:** das Herzstück funktioniert mit echten Twitch-Kanälen.

- Twitch-Embed-Script-Loader (einmalig, idempotent) in `src/lib/twitch/load-embed.ts`
- `TwitchPlayer`-Komponente: Instanz in Ref, Mount/Unmount, Mute, Volume, Qualität
- `StreamGrid` mit Layouts 1, 2, 3, 4, 6, 8 und responsivem Verhalten
- `StreamSlot` mit Overlay: Fahrername, Rolle, Live-Badge, Mute, Volume, Maximieren, Tauschen
- `StreamToolbar` mit Layout-Switcher und Fahrerauswahl
- `player-store` für Layout, Slots, Fokus, Audio
- Fokus-Audio: genau ein Stream unmuted, alle anderen stumm
- Lazy Mounting, Platzhalterkarten, Fehler-Fallback bei Offline-Kanälen

**Dateien:** `src/components/stream/*`, `src/lib/twitch/*`, `src/stores/player-store.ts`,
`src/app/(main)/live/page.tsx`

**Definition of Done:** Alle sechs Layouts laufen mit echten Kanälen, Layoutwechsel mountet
nur die neu benötigten Player, kein Audio-Chaos, kein Remount beim Rerender, Gate grün.
Manuelle Prüfung mit mindestens vier gleichzeitigen Streams.

---

## Phase 4 — Twitch-Chat-Embed

**Ziel:** der originale Twitch-Chat des fokussierten Streams.

- `TwitchChatEmbed` mit `parent`-Ableitung aus `NEXT_PUBLIC_TWITCH_PARENTS`
- `ChatPanel` mit Tabs für Twitch-Chat und Community-Chat (zweiter Tab zunächst deaktiviert)
- Chat ein-/ausblenden, Breite auf Desktop, Overlay-Variante auf Mobil
- Wechsel des Fokus-Streams lädt den passenden Chat nachweislich neu

**Dateien:** `src/components/chat/TwitchChatEmbed.tsx`, `src/components/chat/ChatPanel.tsx`

**Definition of Done:** Twitch-Chat lädt lokal und im Preview-Deployment, Fokuswechsel
funktioniert, Gate grün.

---

## Phase 5 — Supabase-Auth und Profile

**Ziel:** vollständige Accounts.

- Supabase-Clients: Browser, Server, Middleware (`src/lib/supabase/*`)
- Migration für `profiles`, Enum `user_role`, Signup-Trigger, RLS-Policies
- Registrierung, Login, Logout, Passwort-Reset, E-Mail-Verifizierung als Server Actions
- Middleware für Session-Refresh und Route-Guards
- Profilseite mit Benutzername und Avatar-Upload in den Storage-Bucket
- Header zeigt Benutzermenü statt Login-Buttons

**Dateien:** `src/lib/supabase/*`, `src/app/(auth)/**`, `src/app/(main)/profile/page.tsx`,
`src/proxy.ts`, `supabase/migrations/0001_profiles.sql`

**Definition of Done:** Registrieren, Verifizieren, Einloggen, Passwort zurücksetzen,
Profil ändern, Avatar hochladen funktionieren echt; geschützte Routen sind für Gäste
gesperrt; Gate grün.

---

## Phase 6 — Community-Chat mit Moderation

**Ziel:** eigener Realtime-Chat mit Moderationswerkzeugen.

- Migration für `chat_messages`, `chat_bans`, Indizes, RLS, Realtime-Publication
- Server Actions: `sendMessage`, `deleteMessage`, `timeoutUser`, `banUser`, `unbanUser`
- Spam-Schutz: Cooldown pro Benutzer, Längenlimit, Dubletten-Erkennung, Rate-Limit
- Client: Realtime-Subscription, virtualisierte oder begrenzte Nachrichtenliste,
  Auto-Scroll mit Pause bei manuellem Hochscrollen
- Nachrichtendarstellung mit Avatar, Benutzername, Rollen-Badge, Zeitstempel
- Moderationsaktionen im Kontextmenü, nur für Moderator und Admin sichtbar

**Dateien:** `src/components/chat/CommunityChat.tsx`, `src/lib/chat/*`,
`supabase/migrations/0002_chat.sql`

**Definition of Done:** Zwei Browser sehen Nachrichten in Echtzeit; ein Gast kann nicht
schreiben; ein getimeouteter Benutzer wird serverseitig **und** per RLS abgewiesen; Löschen
verschwindet bei allen; Gate grün.

---

## Phase 7 — Layout-Persistenz und Einstellungen

**Ziel:** jeder Zuschauer findet sein Setup wieder.

- Migration für `user_settings`
- Server Action zum Speichern von Layout, Slot-Belegung, Volumes, Chat-Sichtbarkeit
- Debounced Autosave, Wiederherstellung beim Laden der Live-Seite
- `localStorage`-Fallback für Gäste
- Einstellungsseite: Default-Layout, Audio-Verhalten, Chat-Standard-Tab, Account-Aktionen

**Dateien:** `src/app/(main)/settings/page.tsx`, `src/lib/settings/*`,
`supabase/migrations/0003_user_settings.sql`

**Definition of Done:** Layout übersteht Reload und Gerätewechsel bei eingeloggten
Benutzern, Gate grün.

---

## Phase 8 — Race-Information-System

**Ziel:** Rennstatus und Rennzeit überall sichtbar.

- Migration für `race_state` mit Enum `race_status`, Startzeile, RLS (lesen öffentlich,
  schreiben nur Admin)
- Hook `useRaceClock` für Rennzeit, Restzeit und Fortschritt aus der Config
- Realtime-Subscription auf `race_state`
- Komponenten: `RaceStatusBar`, `RaceClock`, `CurrentDriverCard`, `StintTimeline`
- Race-Seite mit Rennname, Strecke, Klasse, Team, Fahrzeug, Startnummer, Teammitgliedern
- Hero auf der Startseite mit Countdown vor dem Start und Rennzeit während des Rennens

**Dateien:** `src/components/race/*`, `src/hooks/use-race-clock.ts`,
`src/app/(main)/race/page.tsx`, `supabase/migrations/0004_race.sql`

**Definition of Done:** Statuswechsel im Admin erscheint ohne Reload auf Live- und
Race-Seite; Countdown und Restzeit stimmen über Zeitzonen hinweg; Gate grün.

---

## Phase 9 — Event-Seite

**Ziel:** Team- und Sponsorenpräsentation im Broadcast-Look.

- Event-Hero, Teamvorstellung, Fahrerkarten, Fahrzeugdaten, Streckeninformationen
- Zeitplan, Event-Beschreibung, Social-Media-Links, Sponsorenbereich
- Inhalte vollständig aus `src/config/event.ts`, Bilder aus `public/`

**Dateien:** `src/app/(main)/event/page.tsx`, `src/components/race/*`,
`src/config/event.ts`

**Definition of Done:** Alle Inhalte konfigurierbar, keine toten Links, responsiv,
Gate grün.

---

## Phase 10 — Admin-Dashboard

**Ziel:** Betrieb während des Rennens steuerbar.

- `/admin`-Layout mit Rollenprüfung (nur Admin; `/admin/chat` auch Moderator)
- Benutzerliste mit Suche, Rollenwechsel, Ban-Verwaltung
- Chat-Moderation: letzte Nachrichten, Löschen, Timeouts, aktive Bans
- Rennsteuerung: Status setzen, aktuellen Fahrer wechseln, Notiz veröffentlichen
- Fahrerverwaltung für die dynamischen Fahrerdaten
- Zuschauerstatistiken aus `viewer_stats`

**Dateien:** `src/app/admin/**`, `src/components/admin/*`,
`supabase/migrations/0005_viewer_stats.sql`

**Definition of Done:** Ein Nicht-Admin erhält auf allen Admin-Routen und bei allen
Admin-Actions eine Ablehnung (nicht nur eine versteckte Navigation); jede Aktion wirkt
sofort; Gate grün.

---

## Phase 11 — Performance, Fehlerbehandlung, Feinschliff

**Ziel:** das Produkt hält 24 Stunden durch.

- Live-Status-Abfrage über `/api/twitch/status` mit Cache und Offline-Kennzeichnung
- Fehler- und Ladezustände: `error.tsx`, `loading.tsx`, Skeletons, Reconnect-Logik
- Re-Render-Audit mit React DevTools, Memoisierung nachziehen
- Lighthouse- und CPU-Messung mit 4, 6 und 8 Streams, Qualitätsdrosselung justieren
- Tastenkürzel, Vollbild, Theater Mode final, Fokus-Reihenfolge und Kontraste prüfen
- Metadaten, Open-Graph-Bild, Favicon, `robots.txt`, `sitemap.ts`

**Dateien:** quer durch `src/`, `src/app/api/twitch/status/route.ts`

**Definition of Done:** Keine Konsolenfehler, Offline-Kanäle werden erkannt und beschriftet,
Testmatrix aus [`12-qualitaet-und-tests.md`](12-qualitaet-und-tests.md) abgearbeitet,
Gate grün.

---

## Phase 12 — Deployment

**Ziel:** produktiv auf Vercel.

- Environment-Variablen in allen drei Scopes setzen
- Supabase Site-URL und Redirect-URLs auf die Domain erweitern
- `NEXT_PUBLIC_TWITCH_PARENTS` um Produktions- und Preview-Domain ergänzen
- Migrationen auf dem Produktionsprojekt ausführen, ersten Admin setzen
- Post-Deploy-Checkliste aus [`10-deployment-vercel.md`](10-deployment-vercel.md)

**Definition of Done:** Ein frischer Benutzer kann auf der Produktionsdomain registrieren,
Streams sehen, beide Chats nutzen und sein Layout wiederfinden.

---

## Abhängigkeiten auf einen Blick

```
0 → 1 → 2 → 3 → 4
            └→ 5 → 6 → 7
                 └→ 8 → 9
                      └→ 10 → 11 → 12
```

Phase 4 braucht nur Phase 3, Phase 6 und 7 brauchen Phase 5, Phase 10 braucht 5, 6 und 8.

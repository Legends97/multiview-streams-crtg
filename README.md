# 24H Sim Racing Multistream Platform

Multistream-Webplattform für ein Sim-Racing-Team während eines 24-Stunden-Rennens.
Zuschauer verfolgen mehrere Twitch-Livestreams der Fahrer gleichzeitig, wechseln zwischen
Layouts, nutzen den originalen Twitch-Chat und einen plattformeigenen Community-Chat.

Optik und Bedienung orientieren sich am Twitch Theater Mode, das Produkt hat aber eine
eigenständige Motorsport-Broadcast-Identität und deutlich mehr Funktionen.

> **Status:** Dokumentations- und Strukturphase. Es existiert noch kein Anwendungscode.
> Der Umsetzungsfahrplan steht in [`docs/02-entwicklungsplan.md`](docs/02-entwicklungsplan.md).

---

## Features (Zielbild)

- **Multistream-Player** mit Layouts für 1, 2, 3, 4, 6 und 8 Streams
- Stream maximieren, tauschen, stummschalten, Lautstärke pro Stream, Fokus-Audio
- **Vollbild- und Theater-Mode**, Chat ein-/ausblendbar, Layout wird pro Benutzer gespeichert
- **Twitch-Chat** des aktuell fokussierten Streams über das offizielle Chat-Embed
- **Community-Chat** über Supabase Realtime mit Moderation, Timeouts, Bans und Spam-Schutz
- **Accounts** mit E-Mail/Passwort, Verifizierung, Passwort-Reset, Profil und Avatar
- **Rollen** User / Moderator / Admin, durchgesetzt per Route-Guard, Server-Validierung und RLS
- **Race-Information-System**: Rennstatus, Rennzeit, verbleibende Zeit, aktueller Fahrer, Stints
- **Event-Seite** mit Team, Fahrern, Fahrzeug, Strecke, Social-Media und Sponsoren
- **Admin-Dashboard** für Benutzer, Rollen, Chat-Moderation, Rennstatus und Fahrerdaten
- Intelligentes Stream-Loading, Offline-Erkennung und Fehler-Fallbacks

Die Twitch-Kanäle werden **nicht** über das Admin-Panel verwaltet, sondern zentral in
`src/config/streams.ts` definiert — siehe [`docs/07-konfiguration.md`](docs/07-konfiguration.md).

---

## Tech-Stack

| Bereich | Technologie |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS, shadcn/ui, Lucide Icons |
| Animation | Framer Motion (dezent, siehe Design-System) |
| Backend | Supabase (Auth, Postgres, Realtime, Storage) |
| Streaming | Twitch Embedded Player API, Twitch Embedded Chat |
| Hosting | Vercel |

Es werden jeweils die aktuellen stabilen Versionen verwendet. Die konkret installierten
Versionen werden in Phase 0 in der `package.json` festgeschrieben.

---

## Quickstart

Voraussetzungen: Node.js 20 oder neuer, npm, ein Supabase-Projekt.

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen anlegen
cp .env.example .env.local
# Werte eintragen, siehe docs/11-umgebungsvariablen.md

# 3. Supabase vorbereiten (Schema, RLS, Storage, Auth-URLs)
# Anleitung: docs/05-supabase-setup.md

# 4. Twitch-Kanäle der Fahrer eintragen
# src/config/streams.ts, siehe docs/07-konfiguration.md

# 5. Entwicklungsserver starten
npm run dev
```

Danach läuft die Anwendung auf <http://localhost:3000>.

### Scripts

| Script | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktionsbuild (Pflicht-Gate nach jeder Phase) |
| `npm run start` | Produktionsbuild lokal starten |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## Projektstruktur

```
multistream/
├─ docs/              Projektdokumentation (Architektur, Setup, Richtlinien)
├─ src/
│  ├─ app/            App Router: Routen, Layouts, Server Actions, API-Routen
│  ├─ components/     React-Komponenten nach Domäne gruppiert
│  ├─ lib/            Datenzugriff, Twitch-Integration, Validierung, Helfer
│  ├─ hooks/          Wiederverwendbare React-Hooks
│  ├─ stores/         Client-State (Player-Layout, UI-Zustand)
│  ├─ types/          Gemeinsame TypeScript-Typen
│  ├─ config/         Zentrale Konfiguration (Streams, Rennen, Event, Layouts)
│  └─ styles/         Globale Styles und Design-Tokens
├─ supabase/
│  └─ migrations/     SQL-Migrationen (Schema, RLS, Trigger)
└─ public/            Statische Assets (Logos, Fahrerbilder, Sponsoren)
```

Jeder Ordner enthält eine `README.md`, die seinen Zweck und die Namenskonventionen beschreibt.

---

## Dokumentation

| Datei | Inhalt |
| --- | --- |
| [`docs/01-architektur.md`](docs/01-architektur.md) | Systemübersicht, Schichten, Routing, Datenflüsse, State-Strategie |
| [`docs/02-entwicklungsplan.md`](docs/02-entwicklungsplan.md) | Phasen 0–12 mit Deliverables, Build-Gates und Definition of Done |
| [`docs/03-design-system.md`](docs/03-design-system.md) | Farben, Typografie, Spacing, Komponenten-Inventar, Breakpoints |
| [`docs/04-datenmodell.md`](docs/04-datenmodell.md) | Tabellen, Enums, Indizes, RLS-Policies, Trigger |
| [`docs/05-supabase-setup.md`](docs/05-supabase-setup.md) | Supabase-Projekt, Auth, Storage, Migrationen, erster Admin |
| [`docs/06-twitch-embed.md`](docs/06-twitch-embed.md) | Player- und Chat-Embed, `parent`-Parameter, Autoplay, Grenzen |
| [`docs/07-konfiguration.md`](docs/07-konfiguration.md) | `streams.ts`, `race.ts`, `event.ts`, `layouts.ts` |
| [`docs/08-multistream-player.md`](docs/08-multistream-player.md) | Layout-Matrix, Interaktionen, Loading-Strategie, Performance |
| [`docs/09-auth-und-rollen.md`](docs/09-auth-und-rollen.md) | Auth-Flows, Rollenmodell, Berechtigungsmatrix, Moderation |
| [`docs/10-deployment-vercel.md`](docs/10-deployment-vercel.md) | Vercel-Setup, Env-Scopes, Domain, Post-Deploy-Checkliste |
| [`docs/11-umgebungsvariablen.md`](docs/11-umgebungsvariablen.md) | Alle Variablen mit Scope, Pflichtstatus und Fundort |
| [`docs/12-qualitaet-und-tests.md`](docs/12-qualitaet-und-tests.md) | Gates, Testmatrix, Fehlerfälle, Go-Live-Checkliste |

Arbeitsregeln für Entwickler und KI-Agenten: [`CLAUDE.md`](CLAUDE.md).

---

## Deployment

Kurzfassung — Details in [`docs/10-deployment-vercel.md`](docs/10-deployment-vercel.md):

1. Repository mit Vercel verbinden, Framework-Preset Next.js.
2. Environment-Variablen für Production, Preview und Development setzen.
3. In Supabase Site-URL und Redirect-URLs auf die Vercel-Domain erweitern.
4. `NEXT_PUBLIC_TWITCH_PARENTS` um die Vercel-Domain ergänzen, sonst bleiben die Embeds leer.
5. Deployen und die Post-Deploy-Checkliste abarbeiten.

Es werden keine Zugangsdaten im Code hinterlegt. Alles Sensible läuft über
Environment-Variablen.

---

## Hinweise

- Dark Mode ist der Standard und einzige Modus.
- Mehrere parallele Twitch-Player belasten Browser und Netzwerk stark. Die Loading-Strategie
  in [`docs/08-multistream-player.md`](docs/08-multistream-player.md) ist kein optionales Extra.
- Interne Projektdokumentation. Team- und Sponsorennamen gehören in `src/config/event.ts`,
  nicht in den Code.

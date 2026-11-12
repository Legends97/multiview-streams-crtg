# 11 — Umgebungsvariablen

Alle Variablen, ihre Scopes und ihr Fundort. Diese Datei und `.env.example` werden immer
gemeinsam aktualisiert.

---

## 1. Übersicht

| Variable | Scope | Pflicht | Beispielwert |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | **ja** | `https://24h.mein-team.de` |
| `NEXT_PUBLIC_TWITCH_PARENTS` | Client + Server | **ja** | `localhost,24h.mein-team.de` |
| `NEXT_PUBLIC_TWITCH_CLIENT_ID` | Client + Server | nein | `abcd1234efgh5678ijkl` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | nein | `https://abcdefghijkl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | nein | `eyJhbGciOi…` |
| `SUPABASE_SERVICE_ROLE_KEY` | **nur Server** | nein | `eyJhbGciOi…` |
| `TWITCH_CLIENT_ID` | nur Server | nein | `abcd1234efgh5678ijkl` |
| `TWITCH_CLIENT_SECRET` | nur Server | nein | `zyxw9876vuts5432rqpo` |

**Abstufung:** Pflicht sind nur die beiden ersten Variablen. Ohne Supabase laufen
Multistream-Player, Twitch-Chat sowie Renn- und Event-Seite vollständig; es fehlen
Anmeldung, Community-Chat und serverseitig gespeicherte Layouts. Die Anwendung
blendet diese Funktionen dann aus, statt mit einem Fehler abzubrechen
(`hasSupabaseConfig()` in `src/lib/env.ts`).

`NEXT_PUBLIC_`-Variablen landen im Client-Bundle und sind damit öffentlich. Alles ohne
dieses Prefix bleibt serverseitig.

---

## 2. Beschreibung

### `NEXT_PUBLIC_TWITCH_CLIENT_ID`
Client-ID einer Twitch-Anwendung aus <https://dev.twitch.tv/console/apps>. Erlaubt den
Zuschauern, sich auf der Seite bei Twitch anzumelden und **direkt im eingeblendeten Chat
zu schreiben** — das Eingabefeld im eingebetteten Twitch-Fenster bleibt wirkungslos,
sobald der Browser Cookies von twitch.tv in fremden Seiten blockiert.

Die Client-ID ist öffentlich und kein Geheimnis; deshalb das `NEXT_PUBLIC_`-Prefix. Das
**Client Secret wird nicht verwendet** und gehört nicht in diese Variable.

In der Twitch-Konsole muss als OAuth Redirect URL exakt eingetragen sein:

```
https://<deine-domain>/auth/twitch
http://localhost:3000/auth/twitch
```

Fehlt die Variable, entfällt das eigene Eingabefeld und es bleibt beim Lesen plus dem
Knopf „Schreiben“, der den Chat im eigenen Fenster öffnet.

### `NEXT_PUBLIC_SUPABASE_URL`
URL des Supabase-Projekts. Dashboard → **Project Settings → API → Project URL**. Ohne
Schrägstrich am Ende.

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
Öffentlicher Schlüssel für Client und Server. Dashboard → **Project Settings → API →
anon / publishable key**. Er ist für die Öffentlichkeit gedacht; die Absicherung leisten die
RLS-Policies, nicht die Geheimhaltung dieses Schlüssels.

### `SUPABASE_SERVICE_ROLE_KEY`
Dashboard → **Project Settings → API → service_role / secret key**. **Umgeht RLS
vollständig.**

- Niemals mit `NEXT_PUBLIC_`-Prefix
- Niemals in einer Client Component importieren
- Niemals committen
- Verwendung ausschliesslich in `src/lib/supabase/admin.ts` (Konto löschen,
  `viewer_stats` schreiben)

Gelangt der Schlüssel an die Öffentlichkeit, hat jeder vollen Lese- und Schreibzugriff auf
die Datenbank. Dann sofort im Dashboard rotieren.

### `NEXT_PUBLIC_SITE_URL`
Öffentliche Basis-URL der Anwendung, mit Protokoll, ohne Schrägstrich am Ende. Wird für
`emailRedirectTo`, `resetPasswordForEmail`, kanonische Links und Open-Graph-Metadaten
benutzt. Lokal `http://localhost:3000`, produktiv die eigene Domain.

### `NEXT_PUBLIC_TWITCH_PARENTS`
Kommaseparierte Liste der Hosts, die Twitch-Embeds einbetten dürfen.

- Nur Hostnamen: kein `https://`, kein Port, kein Pfad
- Keine Wildcards — Twitch unterstützt sie nicht
- `localhost` immer mit aufnehmen, sonst funktioniert die lokale Entwicklung nicht
- Produktionsdomain und, falls genutzt, der stabile Preview-Alias gehören dazu

```env
NEXT_PUBLIC_TWITCH_PARENTS=localhost,multistream-24h.vercel.app,24h.mein-team.de
```

Fehlt der aktuelle Host, bleiben Player und Chat schwarz. Details:
[`06-twitch-embed.md`](06-twitch-embed.md).

### `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`
Optional. Nur nötig für die Live-Status- und Zuschauerabfrage über die Helix-API
(`/api/twitch/status`). Registrierung einer Anwendung unter
<https://dev.twitch.tv/console/apps>:

- OAuth Redirect URL: `http://localhost:3000` (wird für Client-Credentials nicht genutzt,
  ist bei der Registrierung aber Pflichtfeld)
- Category: Website Integration
- Client Type: Confidential

Ohne diese Variablen läuft die Plattform vollständig; es fehlen dann die Zuschauerzahlen und
die Unterscheidung zwischen "offline" und "Kanal existiert nicht".

---

## 3. `.env.example`

Diese Datei wird in Phase 0 angelegt und enthält **nur Platzhalter**:

```env
# Supabase — Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Öffentliche Basis-URL der Anwendung (ohne Slash am Ende)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Erlaubte Parent-Hosts für Twitch-Embeds (nur Hostnamen, kommasepariert)
NEXT_PUBLIC_TWITCH_PARENTS=localhost

# Optional: Twitch Helix API für Live-Status und Zuschauerzahlen
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```

---

## 4. Regeln

- `.env.local` steht in `.gitignore` und wird nie committet
- Echte Werte stehen ausschliesslich in `.env.local` und in den Vercel-Projekteinstellungen
- `.env.example` enthält nur Platzhalter, aber **alle** Variablen
- Neue Variable: gleichzeitig in `.env.example`, in dieser Datei und in allen drei
  Vercel-Scopes anlegen
- Kein Secret im Code, keine Keys in Kommentaren, keine Keys in Fehlermeldungen
- Keine Secrets mit `NEXT_PUBLIC_`-Prefix
- Variablen werden an genau einer Stelle gelesen (`src/lib/env.ts`) und dort beim Start mit
  Zod geprüft; fehlt eine Pflichtvariable, bricht der Start mit klarer Meldung ab

```ts
// src/lib/env.ts (Prinzip)
import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_TWITCH_PARENTS: z.string().min(1),
  TWITCH_CLIENT_ID: z.string().optional(),
  TWITCH_CLIENT_SECRET: z.string().optional(),
});

export const env = serverSchema.parse(process.env);
```

Die Client-Variante prüft nur die `NEXT_PUBLIC_`-Werte und wird getrennt exportiert, damit
nichts Serverseitiges ins Bundle gerät.

---

## 5. Nach einer Änderung

| Umgebung | Was zu tun ist |
| --- | --- |
| Lokal | Entwicklungsserver neu starten (`.env.local` wird nicht heiss nachgeladen) |
| Vercel | Variable im richtigen Scope setzen und **neu deployen** — `NEXT_PUBLIC_*` wird in den Build eingebacken |
| Domainwechsel | `NEXT_PUBLIC_SITE_URL` und `NEXT_PUBLIC_TWITCH_PARENTS` anpassen, Supabase-Redirect-URLs ergänzen, neu deployen |

# 10 — Deployment auf Vercel

---

## 1. Voraussetzungen

- Repository auf GitHub, GitLab oder Bitbucket
- Supabase-Projekt vollständig eingerichtet ([`05-supabase-setup.md`](05-supabase-setup.md))
- `npm run typecheck && npm run lint && npm run build` läuft lokal fehlerfrei durch
- Twitch-Kanäle in `src/config/streams.ts` eingetragen

## 2. Projekt in Vercel anlegen

1. <https://vercel.com/new> → Repository importieren
2. Framework-Preset: **Next.js** (wird automatisch erkannt)
3. Root Directory: Projektwurzel
4. Build Command: `npm run build` (Standard)
5. Output: automatisch (`.next`)
6. Node-Version: 20 oder neuer unter **Settings → General**
7. **Noch nicht deployen** — zuerst die Umgebungsvariablen setzen

## 3. Umgebungsvariablen setzen

Unter **Settings → Environment Variables**. Vollständige Beschreibung in
[`11-umgebungsvariablen.md`](11-umgebungsvariablen.md).

| Variable | Production | Preview | Development |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Produktionsdomain | Preview-Domain oder Alias | `http://localhost:3000` |
| `NEXT_PUBLIC_TWITCH_PARENTS` | Produktionsdomain + `localhost` | Alias-Domain + `localhost` | `localhost` |
| `TWITCH_CLIENT_ID` | optional | optional | optional |
| `TWITCH_CLIENT_SECRET` | optional | optional | optional |

Wichtig:

- `NEXT_PUBLIC_*`-Variablen werden **zur Build-Zeit** eingebacken. Eine Änderung wirkt erst
  nach einem neuen Deployment, nicht nach einem Neustart
- `SUPABASE_SERVICE_ROLE_KEY` niemals mit `NEXT_PUBLIC_`-Prefix anlegen
- Für Previews empfiehlt sich eine stabile Alias-Domain (zum Beispiel
  `multistream-preview.vercel.app`), weil pro Deployment sonst eine neue Host-Domain
  entsteht und `parent` nicht vorab konfiguriert werden kann

## 4. Erstes Deployment

**Deploy** auslösen und das Build-Log lesen. Typische Abbrüche:

| Fehlermeldung | Ursache |
| --- | --- |
| `Type error: …` | Gate lokal nicht gelaufen |
| `Missing environment variable` | Variable fehlt im gewählten Scope |
| `supabaseUrl is required` | `NEXT_PUBLIC_SUPABASE_URL` nicht gesetzt |
| `Module not found` | Import mit falscher Gross-/Kleinschreibung — Vercel ist case-sensitiv, Windows nicht |

Der letzte Punkt trifft bei Entwicklung unter Windows regelmässig zu: `StreamTile` und
`streamtile` sind lokal identisch, auf Vercel nicht.

## 5. Domain einrichten

1. **Settings → Domains** → eigene Domain hinzufügen
2. DNS-Einträge beim Registrar setzen, TLS wird automatisch ausgestellt
3. Produktionsdomain als primär festlegen

### Nach dem Domain-Setup zwingend nachziehen

1. `NEXT_PUBLIC_SITE_URL` auf `https://<domain>` setzen
2. `NEXT_PUBLIC_TWITCH_PARENTS` um `<domain>` ergänzen
3. In Supabase unter **Authentication → URL Configuration**:
   - Site URL auf `https://<domain>`
   - Redirect URLs um `https://<domain>/api/auth/callback` und
     `https://<domain>/reset-password` ergänzen
4. **Neu deployen** — ohne neuen Build greifen die `NEXT_PUBLIC_`-Werte nicht

Wird Schritt 2 vergessen, bleiben alle Twitch-Embeds schwarz. Wird Schritt 3 vergessen,
scheitert jede Registrierung beim Bestätigungslink.

## 6. Preview-Deployments

- Jeder Push auf einen Branch erzeugt ein Preview-Deployment
- Preview-Hosts sind pro Deployment eindeutig; `getTwitchParents()` ergänzt deshalb zur
  Laufzeit den aktuellen `window.location.hostname`
  ([`06-twitch-embed.md`](06-twitch-embed.md))
- Für Auth in Previews muss eine passende Redirect-URL in Supabase hinterlegt sein; am
  einfachsten über einen stabilen Branch-Alias
- Previews zeigen auf **dasselbe** Supabase-Projekt. Wer getrennte Daten braucht, legt ein
  zweites Supabase-Projekt an und setzt die Variablen im Preview-Scope darauf

## 7. Caching und Laufzeit

- Die Live-Seite ist dynamisch (Session, `user_settings`) und darf nicht statisch
  gerendert werden; wo nötig `export const dynamic = "force-dynamic"`
- `/api/twitch/status` cachen (`revalidate = 60`), um Twitch-Rate-Limits zu respektieren
- Event- und Race-Seite können mit `revalidate` arbeiten, solange der Realtime-Teil
  clientseitig nachlädt
- Region der Vercel-Funktionen nahe der Supabase-Region wählen (Frankfurt), das senkt die
  Latenz für Server Actions deutlich

---

## 8. Post-Deploy-Checkliste

Auf der **Produktionsdomain** durchführen, nicht in der Preview:

- [ ] Startseite lädt, Hero zeigt Countdown oder Rennzeit
- [ ] `/live` lädt, Player starten stumm und spielen
- [ ] Alle Layouts (1, 2, 3, 4, 6, 8) funktionieren
- [ ] Ton lässt sich auf einem Stream aktivieren, nur einer hat Ton
- [ ] Twitch-Chat lädt und wechselt mit dem Fokus-Stream
- [ ] Registrierung funktioniert, Bestätigungsmail kommt an
- [ ] Bestätigungslink führt eingeloggt auf `/live`
- [ ] Passwort-Reset funktioniert vollständig
- [ ] Community-Chat: Nachricht erscheint in einem zweiten Browser in Echtzeit
- [ ] Gast kann den Community-Chat nicht lesen und nicht schreiben
- [ ] Layout übersteht Reload und Neuanmeldung
- [ ] Avatar-Upload funktioniert, Bild wird angezeigt
- [ ] `/admin` ist für Nicht-Admins nicht erreichbar (404)
- [ ] Rennstatuswechsel im Admin erreicht offene Clients ohne Reload
- [ ] Mobil: ein Player, Auswahlleiste, Chat als Overlay
- [ ] Browser-Konsole frei von Fehlern
- [ ] Keine Secrets im Client-Bundle (`SUPABASE_SERVICE_ROLE_KEY` im Browser suchen → nichts)

## 9. Typische Fehlerbilder

| Symptom | Ursache | Behebung |
| --- | --- | --- |
| Player und Chat schwarz | Domain fehlt in `NEXT_PUBLIC_TWITCH_PARENTS` | Variable ergänzen, neu deployen |
| Chat zeigt "content is not available" | `parent` falsch oder mit Protokoll geschrieben | nur Hostname eintragen |
| Nach Bestätigungslink Fehlerseite | Redirect-URL in Supabase fehlt | URL ergänzen |
| Login funktioniert, nach Reload ausgeloggt | Middleware erneuert die Session nicht | `src/proxy.ts` und Matcher prüfen |
| Chat sendet nicht, Fehler 42501 | RLS-Policy greift (Ban, Rate-Limit, fehlende Policy) | Policy und `chat_bans` prüfen |
| Realtime still | Tabelle nicht in `supabase_realtime` | Publication ergänzen |
| Build lokal grün, auf Vercel rot | Gross-/Kleinschreibung in Importen | Import korrigieren |
| Variable geändert, nichts passiert | `NEXT_PUBLIC_*` wird eingebacken | neu deployen |

## 10. Betrieb während des Rennens

- Vor dem Rennstart alle Änderungen deployen; während des Rennens nicht deployen, ausser
  bei einem Fehler, der die Übertragung blockiert
- Alle Rennänderungen (Status, aktueller Fahrer, Notiz) laufen über `/admin/race` und
  brauchen kein Deployment
- Fällt ein Fahrer-Stream dauerhaft aus: `active: false` wäre ein Deployment — besser ist
  es, den Slot in der Oberfläche umzubelegen
- Vercel-Logs und Supabase-Logs während des Events offen halten
- Mindestens zwei Personen mit Admin-Rolle, damit Moderation rund um die Uhr möglich ist

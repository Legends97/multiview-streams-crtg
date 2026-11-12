# 12 — Qualität und Tests

---

## 1. Automatisches Gate

Nach jeder Phase aus [`02-entwicklungsplan.md`](02-entwicklungsplan.md) und vor jedem
"fertig":

```bash
npm run typecheck   # tsc --noEmit, keine Fehler
npm run lint        # ESLint, keine Fehler
npm run build       # Produktionsbuild muss durchlaufen
```

Regeln:

- Alle drei Befehle müssen fehlerfrei sein. Eine Phase mit rotem Gate ist nicht fertig
- Warnungen werden gelesen und bewertet, nicht pauschal ignoriert
- Kein `any`, kein `@ts-ignore`, kein `eslint-disable` ohne begründenden Kommentar
- `npm run build` fängt Fehler, die `dev` nicht zeigt (Server/Client-Grenzen, fehlende
  Suspense-Boundaries, falsche Importe)

Empfehlenswert, aber optional: ein Pre-Push-Hook, der das Gate ausführt.

---

## 2. Manuelle Testmatrix

### Player

| Fall | Erwartung |
| --- | --- |
| Layouts 1, 2, 3, 4, 6, 8 | alle Slots laden, Seitenverhältnis 16:9 bleibt |
| Layoutwechsel 4 → 6 | genau zwei zusätzliche Player werden gemountet |
| Layoutwechsel 6 → 2 | vier Player zerstört, kein Audio bleibt hörbar |
| Fahrer in Slot tauschen | kein schwarzes Flackern, kein Remount |
| Maximieren und `Esc` | voriges Layout wird exakt wiederhergestellt |
| Mute und Volume | wirken nur auf das betroffene Tile |
| Fokuswechsel | genau ein Stream hat Ton, Twitch-Chat wechselt mit |
| Vollbild und Theater Mode | kein Scrollen nötig, Rückkehr sauber |
| Reload | Layout, Belegung, Volumes wiederhergestellt |
| 60 Minuten mit 4 Streams | Speicherverbrauch wächst nicht kontinuierlich |

### Browser und Geräte

| Umgebung | Prüfen |
| --- | --- |
| Chrome Desktop | Referenz, alle Layouts |
| Firefox Desktop | Autoplay, Fullscreen, Realtime |
| Safari macOS | Autoplay-Policy, Vollbild, Schriftdarstellung |
| Edge Desktop | wie Chrome, nur Stichprobe |
| Safari iOS | `playsinline`, ein Player, Chat-Overlay |
| Chrome Android | ein Player, Auswahlleiste, Vollbild |

### Breakpoints

320, 375, 768, 1024, 1280, 1536 und 1920 px prüfen: kein horizontales Scrollen, Header
bleibt lesbar, Chat-Verhalten wie in [`03-design-system.md`](03-design-system.md)
beschrieben, Touch-Ziele mindestens 40 px.

---

## 3. Fehler- und Grenzfälle

| Fall | Erwartung |
| --- | --- |
| Kanal offline | gedimmtes Tile mit Badge "OFFLINE" und Retry |
| Kanal existiert nicht | Badge "Kanal nicht gefunden", andere Tiles laufen weiter |
| Alle Kanäle offline | Grid zeigt Platzhalter, Seite bleibt bedienbar |
| Twitch-Script blockiert (Adblocker) | Fehlerkarte mit Hinweis, kein weisser Bildschirm |
| Drittanbieter-Cookies blockiert | Twitch-Chat nur lesend, Hinweis plus "In Twitch öffnen" |
| Netzwerk offline und zurück | Reconnect-Versuche, dann Offline-Darstellung |
| Supabase nicht erreichbar | Streams laufen weiter, Chat zeigt Verbindungshinweis |
| Realtime-Verbindung bricht | automatischer Reconnect, Nachrichtenlücke wird nachgeladen |
| Sehr lange Nachricht | bei 500 Zeichen abgeschnitten, Umbruch ohne Layoutbruch |
| Emoji und RTL-Text im Chat | korrekte Darstellung, keine Höhensprünge |
| Zeitzonen | Countdown stimmt in UTC, Europe/Berlin und Amerika |
| Config mit doppelter `id` | Start bricht mit klarer Meldung ab |
| `active: false` für alle Streams | klare Leermeldung, kein Absturz |

---

## 4. Chat-Last und Realtime

- Zwei Browser parallel: Nachricht erscheint in unter einer Sekunde
- 200 Nachrichten in kurzer Folge einfügen: Liste bleibt scrollbar, keine Ruckler
- Auto-Scroll pausiert, wenn der Benutzer hochscrollt, und zeigt "Neue Nachrichten"
- Soft Delete verschwindet bei allen Clients
- Verbindungsabbruch und Rückkehr: keine Duplikate, keine Lücken
- Mehrere Tabs desselben Benutzers: genau eine Subscription pro Tab, Cleanup beim Schliessen

---

## 5. Sicherheits-Negativtests

Pflichtbestandteil. Eine Policy, die nur das Erlaubte beweist, ist nicht geprüft.

| Test | Erwartung |
| --- | --- |
| Gast ruft `/profile`, `/settings` auf | Redirect auf `/login?next=…` |
| Gast ruft `/admin` auf | 404 |
| `user` ruft `/admin` und `/admin/users` auf | 404 |
| `user` ruft eine Admin-Server-Action direkt auf | Ablehnung |
| `moderator` versucht eine Rolle zu vergeben | Ablehnung |
| `moderator` versucht einen Admin zu sperren | Ablehnung |
| `user` setzt `profiles.role` bei sich selbst per API | RLS lehnt ab |
| `user` liest `viewer_stats` per API | RLS lehnt ab |
| Gast liest `chat_messages` per API | RLS lehnt ab |
| Gesperrter Benutzer sendet per API | RLS lehnt ab |
| Mehr als 10 Nachrichten pro Minute | Rate-Limit greift in Action **und** Policy |
| Upload in den Avatar-Ordner eines anderen | Storage-Policy lehnt ab |
| 3 MB oder PDF als Avatar | serverseitig abgelehnt |
| Login-Redirect auf `https://fremde-domain` | ignoriert, Fallback `/live` |
| Suche nach `service_role` im Client-Bundle | kein Treffer |

Für die API-Tests genügt `curl` mit dem Anon-Key gegen die REST-Endpunkte von Supabase —
genau so würde ein manipulierter Client arbeiten.

---

## 6. Performance-Budget

| Messpunkt | Ziel |
| --- | --- |
| Lighthouse Performance (`/`, Desktop) | ≥ 90 |
| Lighthouse Accessibility (alle Seiten) | ≥ 95 |
| LCP auf `/live` (ohne Videostart) | < 2,5 s |
| CLS | < 0,1 |
| JS-Bundle der Live-Seite (initial) | < 300 kB gzip |
| CPU-Last mit 4 Streams à 720p | unter 70 % auf Mittelklasse-Notebook |
| Re-Renders bei Volume-Änderung | nur das betroffene Overlay |
| Speicher nach 60 min mit 4 Streams | stabil, kein kontinuierliches Wachstum |

Messung: Chrome DevTools Performance und Memory, React DevTools Profiler mit
"Highlight updates", Lighthouse im Inkognito-Fenster ohne Erweiterungen.

---

## 7. Go-Live-Checkliste vor dem Rennen

Spätestens 48 Stunden vor dem Start:

- [ ] Alle Fahrer mit korrektem `twitchChannel` in `src/config/streams.ts`
- [ ] `race.ts` mit richtigem `startsAt` inklusive Zeitzonen-Offset und `durationHours`
- [ ] `event.ts` mit Team, Fahrern, Sponsoren und funktionierenden Links
- [ ] Alle Bilder in `public/` vorhanden und optimiert (WebP oder SVG)
- [ ] Produktionsdomain in `NEXT_PUBLIC_TWITCH_PARENTS` und `NEXT_PUBLIC_SITE_URL`
- [ ] Supabase-Redirect-URLs vollständig
- [ ] Alle Migrationen auf dem Produktionsprojekt ausgeführt
- [ ] Mindestens zwei Admins und ausreichend Moderatoren angelegt
- [ ] SMTP für Auth-Mails konfiguriert (der eingebaute Versand ist zu stark limitiert)
- [ ] Post-Deploy-Checkliste aus [`10-deployment-vercel.md`](10-deployment-vercel.md) grün
- [ ] Testlauf mit mindestens drei echten, gleichzeitig laufenden Streams
- [ ] Probe-Statuswechsel (LIVE → SAFETY CAR → LIVE) auf mehreren Clients beobachtet
- [ ] Moderationsablauf einmal real geübt (löschen, timeouten, entsperren)
- [ ] Browser-Konsole in Produktion fehlerfrei
- [ ] Jemand ist während des Rennens für Moderation und Admin erreichbar
- [ ] Rückfallebene bekannt: direkte Twitch-Links der Fahrer, falls die Plattform ausfällt

---

## 8. Automatisierte Tests

Für ein einmaliges Event ist eine volle Testsuite nicht wirtschaftlich. Sinnvoll sind
gezielt wenige Tests an den Stellen, an denen ein Fehler teuer ist:

| Bereich | Form | Priorität |
| --- | --- | --- |
| Config-Validierung (Zod-Schemas) | Unit-Test | hoch |
| Rennzeit- und Restzeit-Berechnung, Zeitzonen | Unit-Test | hoch |
| Slot-Zuweisung und Layoutwechsel-Logik | Unit-Test | mittel |
| Spam-Schutz-Logik | Unit-Test | mittel |
| RLS-Policies | SQL-Skript mit gesetztem `request.jwt.claim.sub` | hoch |
| Auth- und Chat-Flows | End-to-End (Playwright) | niedrig |

Begründung: Zeitberechnung und Policies sind die Stellen, an denen ein Fehler erst während
des Rennens auffällt und dann nicht mehr korrigierbar ist. Die Oberfläche lässt sich
dagegen zuverlässig manuell prüfen.

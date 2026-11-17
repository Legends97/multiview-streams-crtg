# `src/lib` — Business-Logik und Datenzugriff

Alles, was nicht Darstellung ist. Komponenten rufen diese Funktionen auf, nie umgekehrt.

| Ordner / Datei | Inhalt |
| --- | --- |
| `supabase/client.ts` | Browser-Client für Client Components und Realtime |
| `supabase/server.ts` | Server-Client für Server Components, Actions, Route Handler |
| `supabase/middleware.ts` | Client für den Session-Refresh in `src/proxy.ts` |
| `supabase/admin.ts` | Service-Role-Client, **nur serverseitig**, umgeht RLS |
| `twitch/load-embed.ts` | einmaliges, idempotentes Laden des Player-Scripts |
| `twitch/parents.ts` | erlaubte `parent`-Hosts aus `NEXT_PUBLIC_TWITCH_PARENTS`, Kanal- und Popout-URLs |
| `twitch/auth.ts` | Twitch-Anmeldung der Zuschauer (Implicit Grant, Sitzung im `localStorage`) |
| `twitch/chat-api.ts` | Helix: Zuschauer und Kanal auflösen, Chat-Nachricht senden |
| `player/grid.ts`, `player/slots.ts` | Grid-Klassen je Layout, Slot-Belegung und -Tausch |
| `race/entries.ts` | Fahrzeuge, Klassen und `getVehicleCount()` aus der Stream-Config |
| `race/state.ts`, `race/status.ts` | Rennzustand ohne Datenbank, Beschriftung der Status |
| `validation/config.ts` | Zod-Schemas für `src/config/` |
| `auth/guards.ts` | `requireUser()`, `requireRole()` — lesen die Rolle frisch aus `profiles` |
| `env.ts` | öffentliche, validierte Umgebungsvariablen plus `hasTwitchClientId()`, `hasSupabaseConfig()` |
| `env.server.ts` | serverseitige Secrets, nie im Client-Bundle |
| `utils/` | kleine reine Helfer (`cn`, Zeit, Text, Social-Icons) |

Noch nicht gebaut, kommen mit ihren Phasen: `chat/` (Community-Chat, Phase 6),
`settings/` (`user_settings`, Phase 7), `twitch/helix.ts` (Live-Status und
Zuschauerzahlen, Phase 11) und weitere Schemas in `validation/`.

## Konventionen

- Dateinamen in `kebab-case.ts`, benannte Exporte
- Jede Funktion hat explizite Ein- und Ausgabetypen, kein `any`
- Datenzugriffsfunktionen geben Domänentypen aus `src/types/` zurück, keine rohen
  Supabase-Zeilen
- Fehler werden als Ergebnis zurückgegeben oder als typisierte Fehler geworfen, nie
  verschluckt
- `admin.ts` darf nur aus serverseitigen Modulen importiert werden. Jede Verwendung prüft
  vorher selbst die Rolle
- `utils/` enthält ausschliesslich reine Funktionen ohne Seiteneffekte

Siehe [`../../docs/01-architektur.md`](../../docs/01-architektur.md) (Schichtenmodell) und
[`../../docs/09-auth-und-rollen.md`](../../docs/09-auth-und-rollen.md).

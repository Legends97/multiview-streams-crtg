# `src/lib` — Business-Logik und Datenzugriff

Alles, was nicht Darstellung ist. Komponenten rufen diese Funktionen auf, nie umgekehrt.

| Ordner / Datei | Inhalt |
| --- | --- |
| `supabase/client.ts` | Browser-Client für Client Components und Realtime |
| `supabase/server.ts` | Server-Client für Server Components, Actions, Route Handler |
| `supabase/middleware.ts` | Client für den Session-Refresh in der Middleware |
| `supabase/admin.ts` | Service-Role-Client, **nur serverseitig**, umgeht RLS |
| `twitch/load-embed.ts` | einmaliges, idempotentes Laden des Player-Scripts |
| `twitch/parents.ts` | erlaubte `parent`-Hosts aus `NEXT_PUBLIC_TWITCH_PARENTS` |
| `twitch/helix.ts` | optionale Helix-Abfrage für Live-Status und Zuschauerzahlen |
| `validation/` | Zod-Schemas für Config, Auth, Chat, Profil, Admin-Eingaben |
| `auth/guards.ts` | `requireUser()`, `requireRole()` — lesen die Rolle frisch aus `profiles` |
| `chat/` | Nachrichten laden, senden, moderieren, Spam-Schutz |
| `settings/` | `user_settings` lesen und schreiben |
| `race/` | `race_state` und `drivers` lesen und schreiben |
| `env.ts` | zentrale, validierte Umgebungsvariablen |
| `utils/` | kleine reine Helfer (`cn`, Zeitformatierung, Slugs) |

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

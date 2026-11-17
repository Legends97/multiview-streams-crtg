# `src/app` — App Router

Routen, Layouts, Server Actions und Route Handler. Server Components sind der Standard;
`"use client"` nur dort, wo Interaktivität, Browser-APIs oder Realtime gebraucht werden.

## Struktur

### Gebaut

| Pfad | Route | Zugriff |
| --- | --- | --- |
| `layout.tsx` | Root-Layout, Schriften, globale Styles, Browser-Titel aus `event.browserTitle` | — |
| `(main)/page.tsx` | `/` Landing mit Hero, Rennstatus und Fahrern | öffentlich |
| `(main)/live/` | `/live` Multistream-Oberfläche mit Twitch-Chat | öffentlich |
| `(main)/race/` | `/race` Race-Information-System | öffentlich |
| `(main)/event/` | `/event` Team, Fahrer, Fahrzeuge, Sponsoren | öffentlich |
| `auth/twitch/` | `/auth/twitch` Rückleitung der Twitch-Anmeldung der Zuschauer | öffentlich |

Der Twitch-Chat auf `/live` braucht **kein** Konto auf dieser Seite. Zum Mitlesen gar
nichts, zum Schreiben eine einmalige Twitch-Anmeldung im Browser des Zuschauers.
`(auth)/layout.tsx` steht bereits, hat aber noch keine Seiten.

### Mit ihren Phasen geplant

| Pfad | Route | Phase |
| --- | --- | --- |
| `(auth)/login/`, `(auth)/register/`, `(auth)/reset-password/` | nur Gäste | 5 |
| `(main)/profile/`, `(main)/settings/` | eingeloggt | 5, 7 |
| `admin/`, `admin/users/`, `admin/chat/`, `admin/race/`, `admin/drivers/` | Moderator, Admin | 10 |
| `api/auth/callback`, `api/twitch/status` | Route Handler | 5, 11 |

Die Zugriffsprüfung für diese Routen steht schon in `src/proxy.ts` (Next.js 16 nennt die
frühere Middleware so) und greift, sobald Supabase konfiguriert ist.

Die Route-Gruppen `(auth)` und `(main)` erscheinen nicht in der URL. Sie existieren, damit
Gast-Routen ein schmales Layout und der Broadcast-Bereich den Header bekommen. `admin/`
liegt bewusst aussen und hat ein eigenes Layout mit Rollenprüfung.

## Konventionen

- Next.js-Spezialdateien nutzen Default-Exports: `page.tsx`, `layout.tsx`, `route.ts`,
  `error.tsx`, `loading.tsx`, `not-found.tsx`
- Server Actions liegen als `actions.ts` neben der Route, die sie nutzt, und beginnen mit
  `"use server"`
- Jede Action prüft zuerst Auth und Rolle (`src/lib/auth/guards.ts`), dann die Eingabe
  (Zod aus `src/lib/validation/`), dann folgt der Datenzugriff
- Keine Datenbank-Queries direkt in `page.tsx` — immer über `src/lib/`
- Jede interaktive Route hat `loading.tsx` und `error.tsx`

Routing-Karte und Datenflüsse: [`../../docs/01-architektur.md`](../../docs/01-architektur.md)

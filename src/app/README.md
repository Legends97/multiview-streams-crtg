# `src/app` — App Router

Routen, Layouts, Server Actions und Route Handler. Server Components sind der Standard;
`"use client"` nur dort, wo Interaktivität, Browser-APIs oder Realtime gebraucht werden.

## Struktur

| Pfad | Route | Zugriff |
| --- | --- | --- |
| `layout.tsx` | Root-Layout, Schriften, globale Styles | — |
| `page.tsx` | `/` Landing mit Hero und Rennstatus | öffentlich |
| `(auth)/login/` | `/login` | nur Gäste |
| `(auth)/register/` | `/register` | nur Gäste |
| `(auth)/reset-password/` | `/reset-password` | nur Gäste |
| `(main)/live/` | `/live` Multistream-Oberfläche | öffentlich, Chat nur eingeloggt |
| `(main)/race/` | `/race` Race-Information-System | öffentlich |
| `(main)/event/` | `/event` Team, Fahrer, Sponsoren | öffentlich |
| `(main)/profile/` | `/profile` | eingeloggt |
| `(main)/settings/` | `/settings` | eingeloggt |
| `admin/` | `/admin` Übersicht und Statistiken | Admin |
| `admin/users/` | Benutzer und Rollen | Admin |
| `admin/chat/` | Chat-Moderation | Moderator, Admin |
| `admin/race/` | Rennstatus und Rennzeiten | Admin |
| `admin/drivers/` | Fahrerdaten | Admin |
| `api/` | Route Handler (`auth/callback`, `twitch/status`) | siehe Doku |

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

# Arbeitsregeln für dieses Projekt

Gilt für Menschen und KI-Agenten, die in diesem Repository arbeiten. Kurz, verbindlich,
ohne Interpretationsspielraum.

---

## 1. Fahrplan

Umgesetzt wird in der Reihenfolge aus [`docs/02-entwicklungsplan.md`](docs/02-entwicklungsplan.md).
Keine Phase wird übersprungen, keine Phase wird halb fertig verlassen. Vor dem Beginn einer
Phase die zugehörige Fachdoku in `docs/` lesen.

## 2. Stack-Entscheidungen (nicht eigenmächtig ändern)

- Next.js App Router, React Server Components als Standard
- TypeScript im `strict`-Modus
- Tailwind CSS + shadcn/ui, Icons ausschliesslich aus `lucide-react`
- Animationen ausschliesslich mit Framer Motion
- Supabase für Auth, Datenbank, Realtime und Storage
- Twitch Embedded Player API und Twitch Embedded Chat für alles, was von Twitch kommt

Keine zusätzliche Bibliothek ohne Not. Wenn eine nötig ist: begründen, aktuelle stabile
Version pinnen, in der README im Stack-Abschnitt ergänzen.

## 3. Projektkonventionen

- `src/`-Layout, Imports über den Alias `@/` (z. B. `@/components/stream/StreamTile`)
- Komponentendateien in `PascalCase.tsx`, alles andere in `kebab-case.ts`
- Hooks beginnen mit `use`, liegen in `src/hooks/`
- Ein Export pro Komponentendatei, Default-Exports nur für Next.js-Spezialdateien
  (`page.tsx`, `layout.tsx`, `route.ts`, `error.tsx`, `loading.tsx`)
- `"use client"` nur dort, wo Interaktivität, Browser-APIs oder Realtime gebraucht werden,
  und so tief im Baum wie möglich
- Reihenfolge in Komponenten: Typen → Konstanten → Komponente → Hilfsfunktionen

## 4. Schichtentrennung

| Schicht | Ort | Darf |
| --- | --- | --- |
| UI | `src/components/`, `src/app/**/page.tsx` | Darstellung, lokaler UI-State |
| Business-Logik | `src/lib/`, Server Actions | Regeln, Validierung, Berechtigungen |
| Datenzugriff | `src/lib/supabase/`, `src/lib/twitch/` | Queries, Mutationen, externe APIs |

Komponenten rufen niemals direkt den Supabase-Client mit eigenen Queries auf. Jeder
Datenzugriff läuft über eine Funktion in `src/lib/` mit typisierter Ein- und Ausgabe.

## 5. Design

Farben, Abstände, Radien und Typografie kommen ausschliesslich aus den Tokens in
[`docs/03-design-system.md`](docs/03-design-system.md) bzw. `src/styles/`. Keine Hex-Werte
direkt in Komponenten, keine willkürlichen Pixelwerte. Dark Mode ist der einzige Modus.
Keine Glow-Orgien, keine verspielten Gaming-Elemente, Glassmorphism nur in Overlays über
Video.

## 6. Verbote

- Keine Demo-Attrappen: kein Button ohne Funktion, kein Formular ohne Handler
- Keine Fake-Daten in der UI, wo echte Daten gehören; Platzhalterinhalte nur in `config/`
  und dort klar als auszutauschende Beispielwerte markiert
- Kein `any`, kein `@ts-ignore`, kein `as unknown as`, um Typfehler wegzudrücken
- Keine hardcodierten Zugangsdaten, Keys, E-Mail-Adressen oder Tokens
- Kein `SUPABASE_SERVICE_ROLE_KEY` in Client-Code oder in einer `NEXT_PUBLIC_`-Variable
- Keine Funktion als "fertig" melden, die nicht gebaut, geladen und bedient wurde

## 7. Sicherheit

- Jede Mutation wird serverseitig validiert (Zod in `src/lib/validation/`), auch wenn das
  Formular bereits validiert
- Berechtigungen werden dreifach durchgesetzt: Route-Guard, Server-Prüfung, RLS-Policy
- RLS ist auf jeder Tabelle aktiv. Eine Tabelle ohne Policy gilt als Fehler
- Rollen kommen aus der Datenbank (`profiles.role`), niemals aus Client-State

## 8. Performance

- Stream-Player werden lazy gemountet und beim Entfernen aus dem Layout unmountet
- Player-Instanzen in Refs halten, nicht in State
- Listen und Tiles memoisieren, stabile `key`s verwenden, Context klein halten
- Realtime-Subscriptions genau einmal pro Kanal, Cleanup im Effekt-Return

## 9. Qualitäts-Gate

Nach jeder Phase und vor jedem "fertig":

```bash
npm run typecheck && npm run lint && npm run build
```

Alle drei müssen fehlerfrei durchlaufen. Warnungen werden gelesen, nicht ignoriert.
Zusätzlich die zur Phase passenden manuellen Checks aus
[`docs/12-qualitaet-und-tests.md`](docs/12-qualitaet-und-tests.md).

## 10. Dokumentation pflegen

Wer Verhalten ändert, aktualisiert im selben Schritt die betroffene Datei in `docs/`.
Neue Umgebungsvariablen gehören gleichzeitig in `.env.example` und in
[`docs/11-umgebungsvariablen.md`](docs/11-umgebungsvariablen.md).

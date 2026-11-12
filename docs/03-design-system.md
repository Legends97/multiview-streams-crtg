# 03 — Design-System

Designrichtung: professioneller Motorsport-Broadcast. Dark Mode ist der einzige Modus.
Ruhige Flächen, harte Informationshierarchie, Akzentrot nur für Status und Aktion.
Keine Glow-Effekte, keine Gaming-Ästhetik, Glassmorphism ausschliesslich in Overlays
über Video.

---

## 1. Farben

| Token | Hex | Verwendung |
| --- | --- | --- |
| `--color-bg` | `#080A0F` | Seitenhintergrund |
| `--color-surface` | `#10141C` | Sekundärflächen, Header, Sidebars, Toolbars |
| `--color-card` | `#171C26` | Karten, Panels, Eingabefelder |
| `--color-accent` | `#E10600` | Live-Status, primäre Aktion, aktive Zustände |
| `--color-text` | `#FFFFFF` | Primärtext, Überschriften, Zahlen |
| `--color-text-muted` | `#9299A8` | Sekundärtext, Labels, Metadaten |
| `--color-border` | `#252B36` | Rahmen, Trennlinien, Grid-Lücken |

Abgeleitete Zustände:

| Token | Wert | Verwendung |
| --- | --- | --- |
| `--color-accent-hover` | `#C20500` | Hover auf primärer Aktion |
| `--color-accent-soft` | `rgba(225, 6, 0, 0.12)` | Badge-Hintergrund, aktive Tab-Fläche |
| `--color-card-hover` | `#1C222E` | Hover auf Karten und Listenzeilen |
| `--color-overlay` | `rgba(8, 10, 15, 0.72)` | Overlay über Video, Modal-Backdrop |

Statusfarben für den Rennstatus:

| Status | Farbe | Hinweis |
| --- | --- | --- |
| `UPCOMING` | `#9299A8` | neutral |
| `LIVE` | `#E10600` | Akzent, mit pulsierendem Punkt |
| `FULL_COURSE_YELLOW` | `#F5C518` | Text auf Gelb immer `#080A0F` |
| `SAFETY_CAR` | `#F5C518` | gelb mit Auto-Icon |
| `RED_FLAG` | `#E10600` | Fläche gefüllt, nicht nur Rahmen |
| `FINISHED` | `#4B5565` | gedimmt, Zielflagge-Icon |

**Regeln**

- Farben nur über Tokens verwenden, nie als Hex-Wert in Komponenten
- Rot nie als Fläche für reine Dekoration
- Gelbe Flächen immer mit dunklem Text, Kontrast mindestens 4.5:1 für Text
- Fokus-Ring sichtbar: 2 px `--color-accent` mit 2 px Abstand zum Element

### Definition

```css
/* src/styles/globals.css */
:root {
  --color-bg: #080a0f;
  --color-surface: #10141c;
  --color-card: #171c26;
  --color-card-hover: #1c222e;
  --color-accent: #e10600;
  --color-accent-hover: #c20500;
  --color-accent-soft: rgba(225, 6, 0, 0.12);
  --color-text: #ffffff;
  --color-text-muted: #9299a8;
  --color-border: #252b36;
  --color-overlay: rgba(8, 10, 15, 0.72);
}
```

Die Tokens werden in `tailwind.config.ts` auf Tailwind-Farben gemappt
(`bg`, `surface`, `card`, `accent`, `muted`, `border`), damit `bg-card` oder
`text-muted` nutzbar sind.

---

## 2. Typografie

| Rolle | Schrift | Einsatz |
| --- | --- | --- |
| Display | kondensierte, technische Sans (zum Beispiel Barlow Condensed) | Hero, Rennzeit, Startnummer |
| UI | neutrale Sans (zum Beispiel Inter) | gesamte Oberfläche |
| Mono | `ui-monospace` | Rundenzeiten, Zähler, Zeitstempel |

Schriften über `next/font` laden, als CSS-Variablen (`--font-display`, `--font-sans`,
`--font-mono`) bereitstellen.

| Stil | Grösse / Zeilenhöhe | Gewicht | Zusatz |
| --- | --- | --- | --- |
| Display XL | 56 / 60 | 700 | `tracking-tight`, Grossbuchstaben |
| Display L | 40 / 44 | 700 | Seitentitel |
| H1 | 32 / 40 | 600 | |
| H2 | 24 / 32 | 600 | |
| H3 | 20 / 28 | 600 | |
| Body | 16 / 24 | 400 | Standard |
| Body S | 14 / 20 | 400 | Chat, Tabellen |
| Caption | 12 / 16 | 500 | Labels, `tracking-wide`, Grossbuchstaben |
| Numeric | 16 / 20 | 600 | Mono, `tabular-nums` für Timer |

Timer und Countdown immer mit `tabular-nums`, sonst springt das Layout im Sekundentakt.

---

## 3. Spacing, Radien, Schatten

- Spacing-Skala: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px — nichts dazwischen
- Grid-Lücke im Multistream: 8 px auf Desktop, 4 px auf Mobil, 0 px im Vollbild
- Radien: `sm` 6 px (Badges, Inputs), `md` 10 px (Karten, Panels), `lg` 14 px (Dialoge),
  Stream-Tiles 10 px mit `overflow-hidden`
- Schatten sparsam, nur für schwebende Ebenen:
  `0 8px 24px rgba(0, 0, 0, 0.45)` für Dialoge und Dropdowns
- Trennung bevorzugt über `--color-border`, nicht über Schatten

---

## 4. Animation

- Dauer: 120 ms für Hover und Fokus, 180 ms für Panels und Tabs, 240 ms für Overlays
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Framer Motion nur für: Chat-Panel ein/aus, Layoutwechsel im Grid, Statuswechsel-Badge,
  Modal-Einblendung
- Nie animiert: Video-Container-Grösse im Dauerbetrieb, Listenelemente im Chat bei hoher
  Nachrichtenfrequenz
- `prefers-reduced-motion` respektieren: Bewegung auf Opazität reduzieren
- Der Live-Punkt pulsiert, alles andere pulsiert nicht

---

## 5. Komponenten-Inventar

| Komponente | Ort | Zweck |
| --- | --- | --- |
| `SiteHeader` | `components/layout` | Logo, Event-Name, Navigation, Live-Badge, Zuschauerzahl, Auth-Menü |
| `SiteFooter` | `components/layout` | Links, Sponsoren-Zeile, Rechtliches |
| `HeroBanner` | `components/layout` | "24H RACE LIVE", Event-Titel, Team, Status, Countdown |
| `StatusBadge` | `components/race` | Rennstatus in Statusfarbe mit Icon |
| `LiveDot` | `components/ui` | pulsierender Punkt, nur bei `LIVE` |
| `RaceClock` | `components/race` | Rennzeit, Restzeit, Fortschrittsbalken |
| `CurrentDriverCard` | `components/race` | aktueller Fahrer, Stint-Dauer, nächster Wechsel |
| `StintTimeline` | `components/race` | Fahrerwechsel über 24 Stunden |
| `StreamToolbar` | `components/stream` | Layout-Switcher, Fahrerauswahl, Chat-Toggle, Vollbild |
| `StreamGrid` | `components/stream` | Grid nach Layout |
| `StreamSlot` | `components/stream` | Rahmen, Platzhalter, Tausch-Ziel |
| `TwitchPlayer` | `components/stream` | Player-Instanz |
| `StreamOverlay` | `components/stream` | Fahrername, Rolle, Live-Badge, Mute, Volume, Maximieren |
| `ChatPanel` | `components/chat` | Tabs Twitch / Community, Breite, Mobil-Overlay |
| `TwitchChatEmbed` | `components/chat` | offizielles Chat-iframe |
| `CommunityChat` | `components/chat` | Realtime-Liste, Eingabe, Moderation |
| `ChatMessage` | `components/chat` | Avatar, Name, Rollen-Badge, Zeit, Text |
| `DriverCard` | `components/race` | Fahrerprofil für Event-Seite |
| `SponsorRow` | `components/layout` | Sponsorenlogos, Graustufe bis Hover |
| `AuthForm` | `components/auth` | Login, Registrierung, Reset mit Fehlerdarstellung |
| `DataTable` | `components/admin` | Benutzer- und Moderationslisten |

Alles Generische (Button, Input, Dialog, Tabs, Tooltip, Select, Switch, Dropdown) kommt aus
shadcn/ui und wird einmalig an die Tokens angepasst, nicht pro Verwendungsstelle.

---

## 6. Breakpoints und Player-Grid

| Breakpoint | Breite | Verhalten |
| --- | --- | --- |
| `base` | < 640 px | ein Stream sichtbar, weitere als horizontale Auswahlleiste; Chat als Overlay-Tab |
| `sm` | ≥ 640 px | 1 Spalte, Chat als Vollbild-Overlay |
| `md` | ≥ 768 px | bis 2 Spalten, Chat unter dem Grid |
| `lg` | ≥ 1024 px | bis 3 Spalten, Chat rechts, 320 px |
| `xl` | ≥ 1280 px | volle Layout-Matrix, Chat rechts, 340 px |
| `2xl` | ≥ 1536 px | wie `xl`, maximale Inhaltsbreite 1920 px |

Grid-Definitionen pro Layout:

| Layout | Desktop (`xl`) | Tablet (`md`) | Mobil |
| --- | --- | --- | --- |
| 1 | 1 × 1 | 1 × 1 | 1 × 1 |
| 2 | 2 × 1 | 1 × 2 | 1 × 1 + Leiste |
| 3 | 1 gross links + 2 rechts gestapelt | 1 × 3 | 1 × 1 + Leiste |
| 4 | 2 × 2 | 2 × 2 | 1 × 1 + Leiste |
| 6 | 3 × 2 | 2 × 3 | 1 × 1 + Leiste |
| 8 | 4 × 2 | 2 × 4 | 1 × 1 + Leiste |

Jedes Tile behält 16:9. Die Grid-Höhe ergibt sich aus der verfügbaren Viewport-Höhe minus
Header und Toolbar, damit im Theater Mode nicht gescrollt werden muss.

---

## 7. Barrierefreiheit (Mindestanforderungen)

- Kontrast: Text mindestens 4.5:1, grosse Überschriften mindestens 3:1
- Jede Aktion per Tastatur erreichbar, Fokus immer sichtbar
- Icon-Buttons haben `aria-label` (Mute, Maximieren, Vollbild, Chat)
- Statusänderungen des Rennens als `aria-live="polite"` ankündigen
- Chat-Liste als `role="log"` mit `aria-live="polite"`
- Keine Information allein über Farbe: Status immer Farbe plus Text plus Icon
- `prefers-reduced-motion` abschalten statt ignorieren

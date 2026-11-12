# `src/components` — Komponenten

Nach Domäne gruppiert, nicht nach technischem Typ.

| Ordner | Inhalt | Beispiele |
| --- | --- | --- |
| `ui/` | generische Bausteine, shadcn/ui-Ableitungen | `Button`, `Dialog`, `Tabs`, `Avatar`, `LiveDot` |
| `layout/` | Seitenrahmen | `SiteHeader`, `SiteFooter`, `HeroBanner`, `SponsorRow` |
| `stream/` | Multistream-Player | `StreamGrid`, `StreamSlot`, `TwitchPlayer`, `StreamOverlay`, `StreamToolbar` |
| `chat/` | beide Chats | `ChatPanel`, `TwitchChatEmbed`, `CommunityChat`, `ChatMessage` |
| `race/` | Renninformationen | `StatusBadge`, `RaceClock`, `CurrentDriverCard`, `StintTimeline`, `DriverCard` |
| `auth/` | Formulare und Benutzermenü | `AuthForm`, `UserMenu`, `AvatarUpload` |
| `admin/` | Dashboard-Bausteine | `DataTable`, `RoleSelect`, `RaceControls`, `ModerationList` |

## Konventionen

- Dateiname gleich Komponentenname in `PascalCase.tsx`, ein Export pro Datei
- Reihenfolge in der Datei: Typen → Konstanten → Komponente → Hilfsfunktionen
- `"use client"` so tief im Baum wie möglich. Ein interaktives Overlay macht nicht die
  ganze Seite zur Client Component
- Keine Datenbankzugriffe und keine `fetch`-Aufrufe in Komponenten. Daten kommen als Props
  aus Server Components oder über Hooks aus `src/hooks/`
- Keine Hex-Farben und keine freien Pixelwerte — nur Design-Tokens
  ([`../../docs/03-design-system.md`](../../docs/03-design-system.md))
- Icon-Buttons brauchen `aria-label`
- `React.memo` dort, wo es messbar hilft (`StreamSlot`, `TwitchPlayer`, `ChatMessage`),
  nicht pauschal
- Generisches gehört nach `ui/`. Wenn eine Komponente an zwei Orten gebraucht wird, wandert
  sie dorthin, statt kopiert zu werden

Komponenten-Inventar und Zustände: [`../../docs/03-design-system.md`](../../docs/03-design-system.md)

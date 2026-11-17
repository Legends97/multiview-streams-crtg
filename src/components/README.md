# `src/components` — Komponenten

Nach Domäne gruppiert, nicht nach technischem Typ.

| Ordner | Inhalt | Dateien |
| --- | --- | --- |
| `ui/` | generische Bausteine, Ableitungen von Radix | `button`, `badge`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `slider`, `switch`, `tabs`, `tooltip`, `avatar`, `live-dot`, `skeleton`, `error-boundary` |
| `layout/` | Seitenrahmen | `site-header`, `site-footer`, `mobile-nav`, `nav-link`, `hero-banner`, `sponsor-row` |
| `stream/` | Multistream-Player | `live-workspace`, `stream-grid`, `stream-slot`, `twitch-player`, `stream-overlay`, `stream-toolbar`, `stream-selector-strip` |
| `chat/` | Twitch-Chat und Community-Chat | `chat-panel`, `twitch-chat-embed`, `twitch-chat-composer`, `community-chat-gate` |
| `race/` | Renninformationen | `status-badge`, `race-clock`, `driver-card`, `entry-table` |

Noch nicht gebaut: `auth/` (Formulare, Benutzermenü, Phase 5) und `admin/`
(Dashboard-Bausteine, Phase 10). Der Community-Chat selbst fehlt ebenfalls noch;
`community-chat-gate` zeigt bis dahin nur den Hinweis, dass Supabase nicht
konfiguriert ist.

## Konventionen

- Dateiname in `kebab-case.tsx`, die Komponente darin in `PascalCase`
  (`stream-slot.tsx` → `StreamSlot`), ein Export pro Datei
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

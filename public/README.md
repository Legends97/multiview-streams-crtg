# `public` — Statische Assets

Alles hier wird unverändert unter `/` ausgeliefert. `public/logos/team.svg` ist im Code
`/logos/team.svg`.

| Ordner | Inhalt | Format |
| --- | --- | --- |
| `logos/` | Team-Logo, Event-Logo, Streckengrafiken | SVG bevorzugt |
| `drivers/` | Fahrerporträts und Avatare | WebP, 512 × 512 oder 16:9 |
| `sponsors/` | Sponsorenlogos | SVG oder WebP mit Transparenz |

Zusätzlich in der Wurzel: `favicon.ico`, `icon.svg`, `opengraph-image.png`
(1200 × 630), `robots.txt`.

## Regeln

- Dateinamen klein geschrieben, mit Bindestrich, ohne Leerzeichen und Umlaute:
  `driver-1.webp`, nicht `Driver 1.WEBP`. Vercel unterscheidet Gross- und Kleinschreibung,
  Windows nicht — darum entstehen hier sonst Fehler, die erst im Deployment auffallen
- Bilder vor dem Einchecken optimieren: Fotos als WebP, Logos als SVG
- Fahrerbilder: ein Bild pro Eintrag in `src/config/streams.ts`, Pfad dort als `avatar`
  eintragen
- Sponsorenlogos mit transparentem Hintergrund; die Darstellung legt Graustufen an und
  zeigt Farbe erst beim Hover
- Keine Benutzer-Uploads hier ablegen — Avatare von Benutzern liegen im Supabase-Bucket
  `avatars`
- Keine Dateien über 500 kB; Bilder im Code über `next/image` einbinden

Verwendung der Pfade: [`../docs/07-konfiguration.md`](../docs/07-konfiguration.md)

# `src/styles` — Globale Styles und Tokens

| Datei | Inhalt |
| --- | --- |
| `globals.css` | Tailwind-Direktiven, Design-Tokens auf `:root`, Basis-Reset, Fokus-Stile, Scrollbar |

## Regeln

- Die Farb-, Radius- und Schattentokens aus
  [`../../docs/03-design-system.md`](../../docs/03-design-system.md) stehen **nur hier** im
  `@theme`-Block. Tailwind 4 leitet die Klassen daraus selbst ab (`bg-card`, `text-muted`,
  `border-border`, `bg-accent`) — es gibt keine `tailwind.config.ts`
- Komponenten verwenden ausschliesslich diese Klassen, keine Hex-Werte
- Dark Mode ist der einzige Modus. Es gibt keinen Light-Mode-Zweig und keinen Theme-Umschalter
- Schriften werden über `next/font` im Root-Layout geladen und hier nur als Variablen
  verwendet (`--font-display`, `--font-sans`, `--font-mono`)
- Globale Selektoren sparsam: Reset, `:focus-visible`, `::selection`, Scrollbar,
  `prefers-reduced-motion`. Alles andere ist komponentenlokal
- Timer und Zähler nutzen `font-variant-numeric: tabular-nums`, damit das Layout im
  Sekundentakt nicht springt
- Keine `!important`, keine Utility-Nachbauten von Tailwind

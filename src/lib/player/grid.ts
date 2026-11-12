import type { Breakpoint } from "@/hooks/use-breakpoint";
import type { LayoutPreset } from "@/types/layout";

export interface GridGeometry {
  cols: number;
  rows: number;
  /** Positionsangaben je Slot, nur für das hervorgehobene Layout nötig. */
  placement: Array<{ column?: string; row?: string } | undefined>;
}

/**
 * Spalten, Zeilen und Slot-Positionen für das aktuelle Layout und den
 * aktuellen Breakpoint (docs/03-design-system.md, Abschnitt 6).
 */
export function getGridGeometry(
  preset: LayoutPreset,
  breakpoint: Breakpoint,
): GridGeometry {
  const maxCols = breakpoint === "xl" ? 4 : breakpoint === "lg" ? 3 : 2;
  const cols = Math.min(preset.grid.cols, maxCols);
  const rows = Math.ceil(preset.slots / cols);

  // Hervorgehobenes Layout: erster Stream groß, restliche gestapelt.
  // Nur sinnvoll, wenn genug Spalten zur Verfügung stehen.
  if (preset.featured && cols >= 3 && preset.slots === 3) {
    return {
      cols: 3,
      rows: 2,
      placement: [
        { column: "1 / span 2", row: "1 / span 2" },
        { column: "3", row: "1" },
        { column: "3", row: "2" },
      ],
    };
  }

  return {
    cols,
    rows,
    placement: Array.from({ length: preset.slots }, () => undefined),
  };
}

/**
 * Empfohlene Streamqualität.
 * In großen Layouts wird gedrosselt, der Fokus-Stream bleibt auf "auto"
 * (docs/08-multistream-player.md, Abschnitt 3).
 */
export function getPreferredQuality(
  preset: LayoutPreset,
  isFocused: boolean,
  override: string | null,
): string {
  if (override) return override;
  if (isFocused) return "auto";
  if (preset.heavy) return "480p";
  if (preset.slots >= 4) return "720p";

  return "auto";
}

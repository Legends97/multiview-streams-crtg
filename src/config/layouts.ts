import { layoutsSchema, parseConfig } from "@/lib/validation/config";
import type { LayoutId, LayoutPreset } from "@/types/layout";

/**
 * LAYOUT-PRESETS DES MULTISTREAM-PLAYERS
 * ======================================
 * Die IDs entsprechen dem check-Constraint auf user_settings.layout.
 * Ein neues Preset erfordert daher eine Migration.
 * Grid-Verhalten je Breakpoint: docs/03-design-system.md, Abschnitt 6.
 */
const rawLayouts: LayoutPreset[] = [
  { id: "single", label: "1 Stream", slots: 1, grid: { cols: 1, rows: 1 } },
  { id: "dual", label: "2 Streams", slots: 2, grid: { cols: 2, rows: 1 } },
  { id: "triple", label: "3 Streams", slots: 3, grid: { cols: 3, rows: 1 }, featured: true },
  { id: "quad", label: "4 Streams", slots: 4, grid: { cols: 2, rows: 2 } },
  { id: "six", label: "6 Streams", slots: 6, grid: { cols: 3, rows: 2 }, heavy: true },
  { id: "eight", label: "8 Streams", slots: 8, grid: { cols: 4, rows: 2 }, heavy: true },
];

export const layouts: LayoutPreset[] = parseConfig(
  layoutsSchema,
  rawLayouts,
  "src/config/layouts.ts",
);

/** Höchstes Layout, das ohne ausdrückliche Wahl verwendet wird. */
const DEFAULT_MAX_SLOTS = 4;

export const defaultLayoutId: LayoutId = "quad";

/**
 * Standard-Layout für die vorhandene Fahrerzahl.
 *
 * Bei drei Fahrern wäre ein 4er-Grid mit einem leeren Slot unsinnig, bei
 * acht Fahrern soll nicht ungefragt die schwerste Ansicht starten. Daher:
 * das größte Layout, das voll belegt ist, höchstens aber `quad`.
 */
export function getDefaultLayoutId(availableStreams: number): LayoutId {
  const limit = Math.min(Math.max(availableStreams, 1), DEFAULT_MAX_SLOTS);
  const candidates = layouts.filter((layout) => layout.slots <= limit);
  const best = candidates.at(-1);

  return best?.id ?? "single";
}

export function getLayout(id: LayoutId): LayoutPreset {
  const preset = layouts.find((layout) => layout.id === id);

  // Kann nur bei inkonsistenter Config auftreten; defaultLayoutId ist validiert.
  return preset ?? getDefaultLayout();
}

export function getDefaultLayout(): LayoutPreset {
  const preset = layouts.find((layout) => layout.id === defaultLayoutId);

  if (!preset) {
    throw new Error(
      `defaultLayoutId "${defaultLayoutId}" fehlt in src/config/layouts.ts`,
    );
  }

  return preset;
}

/**
 * Layouts, die mit der Anzahl verfügbarer Streams sinnvoll sind.
 * Bei drei aktiven Fahrern wird kein 8er-Grid angeboten.
 */
export function getUsableLayouts(availableStreams: number): LayoutPreset[] {
  const usable = layouts.filter((layout) => layout.slots <= Math.max(availableStreams, 1));

  return usable.length > 0 ? usable : [getLayout("single")];
}

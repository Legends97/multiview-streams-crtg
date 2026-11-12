/**
 * Layout-Presets des Multistream-Players.
 * Die IDs entsprechen dem check-Constraint auf user_settings.layout
 * (siehe docs/04-datenmodell.md) — eine Aenderung erfordert eine Migration.
 */
export type LayoutId = "single" | "dual" | "triple" | "quad" | "six" | "eight";

export interface GridSpec {
  cols: number;
  rows: number;
}

export interface LayoutPreset {
  id: LayoutId;
  label: string;
  slots: number;
  grid: GridSpec;
  /** Erster Slot wird groß dargestellt (1 groß + Rest gestapelt). */
  featured?: boolean;
  /** Hoher Ressourcenbedarf: Performance-Hinweis und Qualitätsdrosselung. */
  heavy?: boolean;
}

export type ChatTab = "twitch" | "community";

/** Persistierbarer Zustand des Players. */
export interface PlayerLayoutState {
  layoutId: LayoutId;
  /** Stream-IDs je Slot; null = leerer Slot. */
  slots: (string | null)[];
  focusedStreamId: string | null;
  volumes: Record<string, number>;
  muted: Record<string, boolean>;
  chatVisible: boolean;
  chatTab: ChatTab;
  theaterMode: boolean;
}

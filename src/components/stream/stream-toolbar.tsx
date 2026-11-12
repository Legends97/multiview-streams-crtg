"use client";

import {
  Keyboard,
  Maximize,
  MessageSquare,
  Minimize,
  Monitor,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { getUsableLayouts } from "@/config/layouts";
import { cn } from "@/lib/utils/cn";
import { usePlayerStore } from "@/stores/player-store";
import type { LayoutId } from "@/types/layout";

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: "1 – 6", description: "Layout umschalten" },
  { keys: "m", description: "Fokus-Stream stummschalten" },
  { keys: "c", description: "Chat ein- oder ausblenden" },
  { keys: "t", description: "Theater Mode" },
  { keys: "f", description: "Vollbild" },
  { keys: "Esc", description: "Maximierung oder Theater Mode beenden" },
];

export interface StreamToolbarProps {
  availableCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

/** Layout-Auswahl und Ansichtsoptionen über dem Grid. */
export function StreamToolbar({
  availableCount,
  isFullscreen,
  onToggleFullscreen,
}: StreamToolbarProps) {
  const { layoutId, chatVisible, theaterMode, maximizedSlot } = usePlayerStore(
    useShallow((state) => ({
      layoutId: state.layoutId,
      chatVisible: state.chatVisible,
      theaterMode: state.theaterMode,
      maximizedSlot: state.maximizedSlot,
    })),
  );

  const setLayout = usePlayerStore((state) => state.setLayout);
  const setChatVisible = usePlayerStore((state) => state.setChatVisible);
  const setTheaterMode = usePlayerStore((state) => state.setTheaterMode);
  const restoreLayout = usePlayerStore((state) => state.restoreLayout);
  const reset = usePlayerStore((state) => state.reset);

  const usableLayouts = getUsableLayouts(availableCount);
  const activePreset = usableLayouts.find((preset) => preset.id === layoutId);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
      {/* Layout-Auswahl */}
      <div
        className="flex items-center gap-1 rounded-sm border border-border bg-card p-1"
        role="group"
        aria-label="Layout wählen"
      >
        {usableLayouts.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleLayoutClick(preset.id, maximizedSlot, restoreLayout, setLayout)}
            aria-pressed={preset.id === layoutId && maximizedSlot === null}
            title={`${preset.label}${preset.heavy ? " — hoher Ressourcenbedarf" : ""}`}
            className={cn(
              "tabular flex h-7 min-w-8 items-center justify-center gap-1 rounded-sm px-2 text-xs font-medium transition-colors",
              preset.id === layoutId && maximizedSlot === null
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-card-hover hover:text-foreground",
            )}
          >
            {preset.slots}
            {preset.heavy ? <TriangleAlert className="size-3" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>

      {activePreset?.heavy ? (
        <Badge variant="warning" className="hidden sm:inline-flex">
          <TriangleAlert className="size-3" aria-hidden="true" />
          {activePreset.slots} Streams: hohe CPU- und Bandbreitenlast
        </Badge>
      ) : null}

      {maximizedSlot !== null ? (
        <Button variant="secondary" size="sm" onClick={restoreLayout}>
          <Minimize />
          Maximierung beenden
        </Button>
      ) : null}

      <div className="ml-auto flex items-center gap-1.5">
        <SimpleTooltip label="Chat ein- oder ausblenden (c)">
          <Button
            variant={chatVisible ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChatVisible(!chatVisible)}
            aria-pressed={chatVisible}
          >
            <MessageSquare />
            <span className="hidden sm:inline">Chat</span>
          </Button>
        </SimpleTooltip>

        <SimpleTooltip label="Theater Mode (t)">
          <Button
            variant={theaterMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTheaterMode(!theaterMode)}
            aria-pressed={theaterMode}
          >
            <Monitor />
            <span className="hidden lg:inline">Theater</span>
          </Button>
        </SimpleTooltip>

        <SimpleTooltip label="Vollbild (f)">
          <Button variant="ghost" size="icon-sm" onClick={onToggleFullscreen} aria-label="Vollbild">
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </SimpleTooltip>

        <Dialog>
          <SimpleTooltip label="Tastenkürzel">
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tastenkürzel anzeigen">
                <Keyboard />
              </Button>
            </DialogTrigger>
          </SimpleTooltip>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tastenkürzel</DialogTitle>
              <DialogDescription>
                Gilt, solange kein Eingabefeld den Fokus hat.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <dl className="grid gap-2">
                {SHORTCUTS.map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center gap-4">
                    <dt className="w-20 shrink-0 font-mono text-xs uppercase text-accent">
                      {shortcut.keys}
                    </dt>
                    <dd className="text-sm text-muted">{shortcut.description}</dd>
                  </div>
                ))}
              </dl>
            </DialogBody>
          </DialogContent>
        </Dialog>

        <SimpleTooltip label="Layout zurücksetzen">
          <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Layout zurücksetzen">
            <RotateCcw />
          </Button>
        </SimpleTooltip>
      </div>
    </div>
  );
}

function handleLayoutClick(
  id: LayoutId,
  maximizedSlot: number | null,
  restoreLayout: () => void,
  setLayout: (id: LayoutId) => void,
): void {
  if (maximizedSlot !== null) restoreLayout();
  setLayout(id);
}

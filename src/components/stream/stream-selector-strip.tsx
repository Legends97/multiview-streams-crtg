"use client";

import { LiveDot } from "@/components/ui/live-dot";
import { cn } from "@/lib/utils/cn";
import type { StreamConfig, StreamStatusMap } from "@/types/stream";

/**
 * Horizontale Fahrerauswahl für schmale Viewports.
 * Dort läuft nur ein Player; hier wird gewechselt.
 */
export function StreamSelectorStrip({
  availableStreams,
  statusMap,
  activeStreamId,
  onSelect,
}: {
  availableStreams: StreamConfig[];
  statusMap?: StreamStatusMap;
  activeStreamId: string | null;
  onSelect: (streamId: string) => void;
}) {
  return (
    <div
      className="flex shrink-0 gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Fahrer auswählen"
    >
      {availableStreams.map((stream) => {
        const isActive = stream.id === activeStreamId;
        const live = statusMap?.[stream.id]?.live;

        return (
          <button
            key={stream.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(stream.id)}
            className={cn(
              "flex shrink-0 flex-col items-start gap-0.5 rounded-sm border px-3 py-2 text-left transition-colors",
              isActive
                ? "border-accent bg-accent-soft"
                : "border-border bg-card hover:bg-card-hover",
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              {live ? <LiveDot /> : <LiveDot active={false} />}
              {stream.carNumber ? `#${stream.carNumber} ` : ""}
              {stream.name}
            </span>
            <span className="text-[11px] text-muted">
              {stream.carClass ?? stream.role}
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { StreamSelectorStrip } from "@/components/stream/stream-selector-strip";
import { StreamSlot } from "@/components/stream/stream-slot";
import { getLayout } from "@/config/layouts";
import { getStreamById } from "@/config/streams";
import { useBreakpoint, isMobileBreakpoint } from "@/hooks/use-breakpoint";
import { getGridGeometry, getPreferredQuality } from "@/lib/player/grid";
import { cn } from "@/lib/utils/cn";
import {
  DEFAULT_VOLUME,
  usePlayerStore,
} from "@/stores/player-store";
import type { StreamConfig, StreamStatusMap } from "@/types/stream";

export interface StreamGridProps {
  availableStreams: StreamConfig[];
  statusMap?: StreamStatusMap;
  qualityOverride?: string | null;
  className?: string;
}

/**
 * Das Multistream-Grid.
 *
 * Auf schmalen Viewports wird bewusst nur ein Player montiert; die übrigen
 * Fahrer erscheinen als Auswahlleiste (docs/08-multistream-player.md).
 */
export function StreamGrid({
  availableStreams,
  statusMap,
  qualityOverride = null,
  className,
}: StreamGridProps) {
  const breakpoint = useBreakpoint();
  const mobile = isMobileBreakpoint(breakpoint);

  const { layoutId, slots, focusedStreamId, maximizedSlot } = usePlayerStore(
    useShallow((state) => ({
      layoutId: state.layoutId,
      slots: state.slots,
      focusedStreamId: state.focusedStreamId,
      maximizedSlot: state.maximizedSlot,
    })),
  );

  const startEpoch = usePlayerStore((state) => state.startEpoch);
  const volumes = usePlayerStore((state) => state.volumes);
  const muted = usePlayerStore((state) => state.muted);

  const focusStream = usePlayerStore((state) => state.focusStream);
  const assignStream = usePlayerStore((state) => state.assignStream);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const maximizeSlot = usePlayerStore((state) => state.maximizeSlot);
  const setStreamStatus = usePlayerStore((state) => state.setStreamStatus);

  const preset = getLayout(layoutId);
  const geometry = getGridGeometry(preset, breakpoint);

  const handleAssign = useCallback(
    (slotIndex: number, streamId: string) => assignStream(slotIndex, streamId),
    [assignStream],
  );

  const handleVolume = useCallback(
    (streamId: string, volume: number) => setVolume(streamId, volume),
    [setVolume],
  );

  // Welche Slots werden dargestellt?
  const visibleIndexes = (() => {
    if (maximizedSlot !== null) return [maximizedSlot];

    if (mobile) {
      const focusIndex = slots.findIndex((slot) => slot === focusedStreamId);

      return [focusIndex >= 0 ? focusIndex : 0];
    }

    return slots.map((_, index) => index);
  })();

  const singleTile = visibleIndexes.length === 1;

  return (
    <div className={cn("flex min-h-0 flex-col gap-2", className)}>
      <div
        className={cn("grid min-h-0 flex-1 gap-1 sm:gap-2")}
        style={
          singleTile
            ? { gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)" }
            : {
                gridTemplateColumns: `repeat(${geometry.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${geometry.rows}, minmax(0, 1fr))`,
              }
        }
      >
        {visibleIndexes.map((slotIndex) => {
          const streamId = slots[slotIndex] ?? null;
          const stream = streamId ? (getStreamById(streamId) ?? null) : null;
          const isFocused = Boolean(streamId) && streamId === focusedStreamId;
          const placement = singleTile ? undefined : geometry.placement[slotIndex];

          return (
            <StreamSlot
              key={`slot-${slotIndex}`}
              slotIndex={slotIndex}
              stream={stream}
              externalStatus={
                stream && statusMap?.[stream.id]
                  ? statusMap[stream.id]!.live
                    ? "live"
                    : "offline"
                  : undefined
              }
              muted={streamId ? (muted[streamId] ?? !isFocused) : true}
              volume={streamId ? (volumes[streamId] ?? DEFAULT_VOLUME) : DEFAULT_VOLUME}
              quality={getPreferredQuality(preset, isFocused, qualityOverride)}
              isFocused={isFocused}
              isMaximized={maximizedSlot === slotIndex}
              availableStreams={availableStreams}
              assignedIds={slots}
              startEpoch={startEpoch}
              onStatusReport={setStreamStatus}
              onFocus={focusStream}
              onAssign={handleAssign}
              onToggleMute={toggleMute}
              onVolumeChange={handleVolume}
              onMaximize={maximizeSlot}
              className="min-h-0"
              {...(placement
                ? { style: { gridColumn: placement.column, gridRow: placement.row } }
                : {})}
            />
          );
        })}
      </div>

      {mobile && maximizedSlot === null ? (
        <StreamSelectorStrip
          availableStreams={availableStreams}
          statusMap={statusMap}
          activeStreamId={focusedStreamId}
          onSelect={(streamId) => {
            const slotIndex = slots.findIndex((slot) => slot === streamId);

            if (slotIndex >= 0) {
              focusStream(streamId);
            } else {
              assignStream(0, streamId);
              focusStream(streamId);
            }
          }}
        />
      ) : null}
    </div>
  );
}

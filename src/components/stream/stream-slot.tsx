"use client";

import { AlertCircle, Plus, RefreshCw, WifiOff } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { StreamOverlay } from "@/components/stream/stream-overlay";
import { TwitchPlayer } from "@/components/stream/twitch-player";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import { cn } from "@/lib/utils/cn";
import type { StreamConfig, StreamStatus } from "@/types/stream";

export interface StreamSlotProps {
  slotIndex: number;
  stream: StreamConfig | null;
  /** Externer Live-Status (Helix), falls bekannt. */
  externalStatus?: StreamStatus;
  muted: boolean;
  volume: number;
  quality: string;
  isFocused: boolean;
  isMaximized: boolean;
  availableStreams: StreamConfig[];
  assignedIds: (string | null)[];
  onFocus: (streamId: string) => void;
  onAssign: (slotIndex: number, streamId: string) => void;
  onToggleMute: (streamId: string) => void;
  onVolumeChange: (streamId: string, volume: number) => void;
  onMaximize: (slotIndex: number) => void;
  className?: string;
  /** Grid-Platzierung, nur für das hervorgehobene Layout. */
  style?: React.CSSProperties;
}

/**
 * Ein Slot im Multistream-Grid: Rahmen, Player, Overlay und Fehlerzustände.
 * Memoisiert, damit eine Lautstärkeänderung in einem anderen Slot hier
 * keinen Rerender auslöst.
 */
function StreamSlotComponent({
  slotIndex,
  stream,
  externalStatus,
  muted,
  volume,
  quality,
  isFocused,
  isMaximized,
  availableStreams,
  assignedIds,
  onFocus,
  onAssign,
  onToggleMute,
  onVolumeChange,
  onMaximize,
  className,
  style,
}: StreamSlotProps) {
  const [playerStatus, setPlayerStatus] = useState<StreamStatus>("unknown");
  const [reloadKey, setReloadKey] = useState(0);
  const { ref, mounted } = useLazyMount<HTMLDivElement>({ keepMounted: isFocused });

  const handleStatusChange = useCallback((next: StreamStatus) => {
    setPlayerStatus(next);
  }, []);

  const status: StreamStatus =
    externalStatus === "not_found"
      ? "not_found"
      : playerStatus === "unknown" && externalStatus
        ? externalStatus
        : playerStatus;

  // Leerer Slot: Auswahl anbieten, nichts laden.
  if (!stream) {
    return (
      <div
        style={style}
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-border bg-surface",
          className,
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus />
              Fahrer wählen
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Freier Slot {slotIndex + 1}</DropdownMenuLabel>
            {availableStreams.map((candidate) => (
              <DropdownMenuItem
                key={candidate.id}
                onSelect={() => onAssign(slotIndex, candidate.id)}
              >
                {candidate.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const showPlayer = mounted && status !== "offline" && status !== "not_found";

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-md border bg-black",
        isFocused ? "border-accent" : "border-border",
        className,
      )}
      onClick={() => onFocus(stream.id)}
      onDoubleClick={() => onMaximize(slotIndex)}
      role="group"
      aria-label={`Stream von ${stream.name}`}
    >
      {showPlayer ? (
        <ErrorBoundary
          fallback={(_error, reset) => (
            <SlotFallback
              icon={<AlertCircle className="size-6 text-danger" />}
              title="Player-Fehler"
              hint="Die Wiedergabe wurde unterbrochen."
              actionLabel="Neu laden"
              onAction={reset}
            />
          )}
        >
          <TwitchPlayer
            key={`${stream.twitchChannel}-${reloadKey}`}
            channel={stream.twitchChannel}
            muted={muted}
            volume={volume}
            quality={quality}
            onStatusChange={handleStatusChange}
          />
        </ErrorBoundary>
      ) : null}

      {/* Ladezustand */}
      {mounted && status === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <Skeleton className="size-full" />
          <p className="absolute text-xs uppercase tracking-wide text-muted">
            {stream.name} wird geladen
          </p>
        </div>
      ) : null}

      {/* Offline oder Kanal unbekannt */}
      {status === "offline" || status === "not_found" ? (
        <SlotFallback
          icon={<WifiOff className="size-6 text-muted" />}
          title={status === "offline" ? "Offline" : "Kanal nicht gefunden"}
          hint={
            status === "offline"
              ? `${stream.name} sendet derzeit nicht.`
              : `Der Kanal "${stream.twitchChannel}" existiert nicht. Eintrag in src/config/streams.ts prüfen.`
          }
          actionLabel={status === "offline" ? "Erneut versuchen" : undefined}
          onAction={
            status === "offline"
              ? () => {
                  setPlayerStatus("loading");
                  setReloadKey((key) => key + 1);
                }
              : undefined
          }
        />
      ) : null}

      {/* Noch nicht sichtbar: Platzhalter ohne Player */}
      {!mounted ? (
        <div className="flex size-full items-center justify-center bg-surface">
          <p className="text-xs uppercase tracking-wide text-subtle">{stream.name}</p>
        </div>
      ) : null}

      <StreamOverlay
        stream={stream}
        status={status}
        muted={muted}
        volume={volume}
        isFocused={isFocused}
        isMaximized={isMaximized}
        availableStreams={availableStreams}
        assignedIds={assignedIds}
        onAssign={(streamId) => onAssign(slotIndex, streamId)}
        onToggleMute={() => onToggleMute(stream.id)}
        onVolumeChange={(next) => onVolumeChange(stream.id, next)}
        onMaximize={() => onMaximize(slotIndex)}
      />
    </div>
  );
}

function SlotFallback({
  icon,
  title,
  hint,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface px-4 text-center">
      {icon}
      <p className="font-display text-sm font-semibold uppercase">{title}</p>
      <p className="max-w-xs text-xs text-muted">{hint}</p>
      {actionLabel && onAction ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          <RefreshCw />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export const StreamSlot = memo(StreamSlotComponent);

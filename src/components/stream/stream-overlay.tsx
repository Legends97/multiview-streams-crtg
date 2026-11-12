"use client";

import {
  ExternalLink,
  Maximize2,
  Minimize2,
  UserCog,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LiveDot } from "@/components/ui/live-dot";
import { Slider } from "@/components/ui/slider";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { buildChannelUrl } from "@/lib/twitch/parents";
import { cn } from "@/lib/utils/cn";
import type { StreamConfig, StreamStatus } from "@/types/stream";

export interface StreamOverlayProps {
  stream: StreamConfig;
  status: StreamStatus;
  muted: boolean;
  volume: number;
  isFocused: boolean;
  isMaximized: boolean;
  availableStreams: StreamConfig[];
  assignedIds: (string | null)[];
  onAssign: (streamId: string) => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onMaximize: () => void;
}

/** Bedienelemente und Beschriftung über einem Stream-Tile. */
export function StreamOverlay({
  stream,
  status,
  muted,
  volume,
  isFocused,
  isMaximized,
  availableStreams,
  assignedIds,
  onAssign,
  onToggleMute,
  onVolumeChange,
  onMaximize,
}: StreamOverlayProps) {
  return (
    <>
      {/* Kopfzeile: dauerhaft sichtbar, damit der Fahrer immer erkennbar ist */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-background/85 to-transparent p-2.5">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold uppercase leading-tight">
            {stream.carNumber ? (
              <span className="text-accent">#{stream.carNumber} </span>
            ) : null}
            {stream.name}
          </p>
          <p className="truncate text-[11px] uppercase tracking-wide text-muted">
            {stream.car ?? stream.role}
            {stream.carClass ? ` · ${stream.carClass}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {status === "live" ? (
            <Badge variant="accent" className="gap-1.5">
              <LiveDot className="bg-foreground" />
              Live
            </Badge>
          ) : null}
          {isFocused ? <Badge variant="accentSoft">Ton</Badge> : null}
        </div>
      </div>

      {/* Steuerung: bei Hover und Tastaturfokus */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2 p-2.5",
          "bg-gradient-to-t from-background/90 to-transparent",
          "opacity-0 transition-opacity duration-[120ms] ease-[var(--ease-standard)]",
          "group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        <SimpleTooltip label={muted ? "Ton aktivieren" : "Stummschalten"}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={muted ? `Ton von ${stream.name} aktivieren` : `${stream.name} stummschalten`}
            onClick={onToggleMute}
            className="bg-background/70 text-foreground hover:bg-background"
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
        </SimpleTooltip>

        <Slider
          value={[Math.round(volume * 100)]}
          onValueChange={(next) => {
            const value = next[0];

            if (typeof value === "number") onVolumeChange(value / 100);
          }}
          min={0}
          max={100}
          step={1}
          aria-label={`Lautstärke von ${stream.name}`}
          className="w-20 shrink-0"
        />

        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <SimpleTooltip label="Fahrer in diesem Slot wechseln">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Fahrer wechseln"
                  className="bg-background/70 text-foreground hover:bg-background"
                >
                  <UserCog />
                </Button>
              </DropdownMenuTrigger>
            </SimpleTooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Fahrer in diesem Slot</DropdownMenuLabel>
              {availableStreams.map((candidate) => (
                <DropdownMenuItem
                  key={candidate.id}
                  onSelect={() => onAssign(candidate.id)}
                  className={cn(candidate.id === stream.id && "text-accent")}
                >
                  <span className="flex-1">{candidate.name}</span>
                  <span className="text-xs text-subtle">
                    {assignedIds.includes(candidate.id) ? "im Grid" : ""}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href={buildChannelUrl(stream.twitchChannel)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                  Auf Twitch öffnen
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SimpleTooltip label={isMaximized ? "Verkleinern" : "Maximieren"}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isMaximized ? "Stream verkleinern" : "Stream maximieren"}
              onClick={onMaximize}
              className="bg-background/70 text-foreground hover:bg-background"
            >
              {isMaximized ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </SimpleTooltip>
        </div>
      </div>
    </>
  );
}

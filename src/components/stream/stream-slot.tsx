"use client";

import { AlertCircle, Play, Plus, RefreshCw, WifiOff } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

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

/**
 * Wartezeit, bis eine Kachel ohne jede Rückmeldung als haengend gilt.
 *
 * Betrifft nur den Fall, dass Twitch weder "online" noch "offline" meldet —
 * die Kachel wuerde sonst dauerhaft "wird geladen" anzeigen.
 */
const LOADING_TIMEOUT_MS = 15_000;

/**
 * Wartezeit, bis einem sendenden Kanal ohne laufendes Video der Startknopf
 * angeboten wird. Lange genug, damit Autoplay und die beiden automatischen
 * Startversuche des Players zuerst greifen koennen.
 */
const START_HINT_DELAY_MS = 9000;

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
  /** Zaehlt hoch, wenn alle Streams gemeinsam gestartet werden sollen. */
  startEpoch?: number;
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
  startEpoch = 0,
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
  // Laeuft tatsaechlich Video? Ein sendender Kanal allein genuegt nicht.
  const [playing, setPlaying] = useState(false);
  // Lokale Startversuche dieser Kachel.
  const [localStarts, setLocalStarts] = useState(0);
  // Kachel haengt im Ladezustand fest, ohne dass Twitch etwas meldet.
  const [stalled, setStalled] = useState(false);
  // Wurde der Startknopf freigeschaltet? Wird nur im Timer gesetzt.
  const [hintArmed, setHintArmed] = useState(false);
  const { ref, mounted } = useLazyMount<HTMLDivElement>({ keepMounted: isFocused });

  const handleStatusChange = useCallback((next: StreamStatus) => {
    setPlayerStatus(next);

    // Sobald eine eindeutige Rueckmeldung kommt, ist die Kachel nicht mehr
    // haengend — auch wenn der Stream erst nach der Wartezeit startet.
    if (next !== "loading" && next !== "unknown") setStalled(false);
    if (next === "offline" || next === "not_found") setPlaying(false);
  }, []);

  const handlePlaybackChange = useCallback((next: boolean) => {
    setPlaying(next);

    if (next) setHintArmed(false);
  }, []);

  const startPlayback = useCallback(() => setLocalStarts((count) => count + 1), []);

  const retry = useCallback(() => {
    setStalled(false);
    setPlaying(false);
    setHintArmed(false);
    setPlayerStatus("loading");
    setReloadKey((key) => key + 1);
  }, []);

  // Startsignal an den Player: der lokale Zaehler und der Zeitstempel der
  // Toolbar zusammen. Jede Aenderung einer der beiden Quellen ergibt einen
  // neuen Wert und damit genau einen Startversuch.
  const startSignal = localStarts + startEpoch;

  const status: StreamStatus =
    externalStatus === "not_found"
      ? "not_found"
      : playerStatus === "unknown" && externalStatus
        ? externalStatus
        : playerStatus;

  const waiting = status === "loading" || status === "unknown";

  // Wartezeit starten, solange die Kachel montiert ist und nichts meldet.
  useEffect(() => {
    if (!mounted || !waiting || stalled) return;

    const timer = window.setTimeout(() => setStalled(true), LOADING_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [mounted, waiting, stalled, reloadKey]);

  // Sendender Kanal, aber kein Video: nach kurzer Wartezeit zum Start bitten.
  useEffect(() => {
    if (!mounted || status !== "live" || playing) return;

    const timer = window.setTimeout(() => setHintArmed(true), START_HINT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [mounted, status, playing, reloadKey]);

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
  const showStalled = showPlayer && stalled;
  const showStartButton = showPlayer && status === "live" && !playing && hintArmed;

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
            startSignal={startSignal}
            onStatusChange={handleStatusChange}
            onPlaybackChange={handlePlaybackChange}
          />
        </ErrorBoundary>
      ) : null}

      {/* Ladezustand */}
      {mounted && status === "loading" && !stalled ? (
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
          onAction={status === "offline" ? retry : undefined}
        />
      ) : null}

      {/* Der Kanal sendet, aber der Browser hat die Wiedergabe nicht von
          selbst gestartet. Bewusst durchscheinend: dahinter liegt der
          fertig geladene Stream, ein Klick genügt. */}
      {showStartButton ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-4 text-center">
          <p className="font-display text-sm font-semibold uppercase">
            {stream.name} ist live
          </p>
          <Button
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              startPlayback();
            }}
          >
            <Play />
            Stream starten
          </Button>
          <p className="max-w-xs text-xs text-muted">
            Der Browser startet Videos erst nach einem Klick.
          </p>
        </div>
      ) : null}

      {/* Keine Rueckmeldung innerhalb der Wartezeit. Der Player bleibt im
          Hintergrund montiert: startet der Stream doch noch, uebernimmt er. */}
      {showStalled ? (
        <SlotFallback
          icon={<WifiOff className="size-6 text-muted" />}
          title="Keine Rückmeldung"
          hint={`${stream.name} sendet vermutlich nicht. Läuft der Stream doch, erscheint er automatisch.`}
          actionLabel="Erneut versuchen"
          onAction={retry}
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

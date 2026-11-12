"use client";

import { useRaceClock } from "@/hooks/use-race-clock";
import { cn } from "@/lib/utils/cn";
import { formatCountdown, formatDuration } from "@/lib/utils/time";

export interface RaceClockProps {
  startsAt: string;
  durationHours: number;
  serverNow: number;
  className?: string;
  /** Kompakte Variante für Header und Toolbar. */
  compact?: boolean;
}

/**
 * Rennuhr: vor dem Start ein Countdown, während des Rennens Rennzeit und
 * Restzeit mit Fortschrittsbalken, danach die Gesamtdauer.
 */
export function RaceClock({
  startsAt,
  durationHours,
  serverNow,
  className,
  compact = false,
}: RaceClockProps) {
  const clock = useRaceClock({ startsAt, durationHours, serverNow });

  if (compact) {
    return (
      <span className={cn("tabular font-mono text-sm", className)}>
        {clock.phase === "before"
          ? `Start in ${formatCountdown(clock.msToStart)}`
          : formatDuration(clock.phase === "after" ? durationHours * 3_600_000 : clock.elapsedMs)}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {clock.phase === "before" ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Rennstart in
          </p>
          <p className="tabular font-display text-5xl font-bold leading-none">
            {formatDuration(clock.msToStart)}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Rennzeit</p>
            <p className="tabular font-display text-5xl font-bold leading-none">
              {formatDuration(clock.elapsedMs)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {clock.phase === "after" ? "Beendet" : "Verbleibend"}
            </p>
            <p className="tabular font-display text-5xl font-bold leading-none text-muted">
              {formatDuration(clock.remainingMs)}
            </p>
          </div>
        </div>
      )}

      {/* Fortschritt über die Renndistanz */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Rennfortschritt"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clock.progress * 100)}
      >
        <div
          className="h-full bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${clock.progress * 100}%` }}
        />
      </div>
    </div>
  );
}

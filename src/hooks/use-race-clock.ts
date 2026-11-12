"use client";

import { useEffect, useMemo, useState } from "react";

import { computeRaceClock } from "@/lib/utils/time";
import type { RaceClock } from "@/types/race";

export interface UseRaceClockOptions {
  startsAt: string;
  durationHours: number;
  /**
   * Zeitstempel des Server-Renderings. Der erste Client-Render nutzt denselben
   * Wert, damit keine Hydration-Abweichung entsteht; danach läuft die lokale Uhr.
   */
  serverNow: number;
}

/**
 * Rennzeit, Restzeit und Fortschritt — rein lokal berechnet, ein Tick pro
 * Sekunde, kein Netzwerkverkehr (docs/01-architektur.md, Abschnitt 4.3).
 */
export function useRaceClock({
  startsAt,
  durationHours,
  serverNow,
}: UseRaceClockOptions): RaceClock {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    // Nur das Intervall anlegen; der erste Tick korrigiert serverNow nach
    // einer Sekunde. Ein sofortiges setState im Effekt-Rumpf würde eine
    // zusätzliche Renderkaskade auslösen.
    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(interval);
  }, []);

  return useMemo(
    () => computeRaceClock(startsAt, durationHours, now),
    [startsAt, durationHours, now],
  );
}

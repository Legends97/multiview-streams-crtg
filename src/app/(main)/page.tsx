import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { HeroBanner } from "@/components/layout/hero-banner";
import { DriverCard } from "@/components/race/driver-card";
import { Button } from "@/components/ui/button";
import { event } from "@/config/event";
import { getActiveStreams } from "@/config/streams";
import { getFallbackRaceState } from "@/lib/race/state";
import { formatDateTime, getServerNow } from "@/lib/utils/time";

// Enthält die Rennuhr, darf daher nicht statisch vorgerendert werden.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const serverNow = getServerNow();
  const raceState = getFallbackRaceState(serverNow);
  const drivers = getActiveStreams();

  return (
    <>
      <HeroBanner raceState={raceState} serverNow={serverNow} />

      <section className="mx-auto max-w-[1920px] px-4 py-14 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase">Unsere Fahrer</h2>
            <p className="mt-2 text-sm text-muted">
              Jeder Fahrer streamt seine eigene Onboard-Perspektive. In der Übertragung
              laufen bis zu acht Streams gleichzeitig.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/event">
              Team und Fahrzeug
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {drivers.map((stream) => (
            <DriverCard
              key={stream.id}
              stream={stream}
              isCurrent={raceState.currentDriverId === stream.id}
            />
          ))}
        </div>
      </section>

      {event.schedule.length > 0 ? (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1920px] px-4 py-14 lg:px-6">
            <h2 className="font-display text-3xl font-bold uppercase">Zeitplan</h2>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {event.schedule.map((entry) => (
                <li
                  key={`${entry.label}-${entry.at}`}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    {entry.label}
                  </p>
                  <p className="tabular mt-1 font-mono text-sm">{formatDateTime(entry.at)}</p>
                  {entry.durationMinutes ? (
                    <p className="mt-0.5 text-xs text-muted">
                      {entry.durationMinutes} Minuten
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}

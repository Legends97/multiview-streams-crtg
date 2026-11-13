import { ArrowRight, Gauge, MapPin, Users } from "lucide-react";
import Link from "next/link";

import { RaceClock } from "@/components/race/race-clock";
import { StatusBadge } from "@/components/race/status-badge";
import { Button } from "@/components/ui/button";
import { event } from "@/config/event";
import { race } from "@/config/race";
import { getActiveStreams } from "@/config/streams";
import { getRaceClasses, getVehicleCount } from "@/lib/race/entries";
import { getRaceStatusMeta } from "@/lib/race/status";
import type { RaceState } from "@/types/race";

/** Hero der Startseite: Event-Titel, Rennstatus, Rennuhr, Einstieg in /live. */
export function HeroBanner({
  raceState,
  serverNow,
}: {
  raceState: RaceState;
  serverNow: number;
}) {
  const startsAt = raceState.startedAt ?? race.startsAt;
  const meta = getRaceStatusMeta(raceState.status);
  const driverCount = getActiveStreams().length;
  const vehicleCount = getVehicleCount();
  const classes = getRaceClasses();

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      {/* Dezente Fläche, kein Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,60,109,0.45),transparent_62%),radial-gradient(ellipse_at_bottom_left,rgba(58,9,96,0.4),transparent_58%)]"
      />

      <div className="relative mx-auto max-w-[1920px] px-4 py-14 lg:px-6 lg:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={raceState.status} />
              <span className="text-xs font-medium uppercase tracking-widest text-muted">
                {race.series}
              </span>
            </div>

            <h1 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>

            <p className="mt-4 text-lg text-muted">{race.name}</p>
            <p className="mt-2 max-w-xl text-sm text-muted">{event.description}</p>

            {raceState.note ? (
              <p className="mt-5 rounded-sm border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm">
                {raceState.note}
              </p>
            ) : null}

            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted" aria-hidden="true" />
                <dt className="sr-only">Strecke</dt>
                <dd>{race.track.name}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="size-4 text-muted" aria-hidden="true" />
                <dt className="sr-only">Fahrzeuge</dt>
                <dd>
                  {race.team.car && race.team.carNumber
                    ? `#${race.team.carNumber} ${race.team.car} · ${race.class}`
                    : vehicleCount > 0
                      ? `${vehicleCount} ${vehicleCount === 1 ? "Fahrzeug" : "Fahrzeuge"} · ${classes.join(" / ")}`
                      : race.class}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted" aria-hidden="true" />
                <dt className="sr-only">Fahrer</dt>
                <dd>
                  {driverCount} {driverCount === 1 ? "Fahrer" : "Fahrer im Wechsel"}
                </dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/live">
                  Zur Übertragung
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/race">Renninformationen</Link>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-sm shrink-0 rounded-md border border-border bg-card p-6">
            <RaceClock
              startsAt={startsAt}
              durationHours={race.durationHours}
              serverNow={serverNow}
            />
            <p className="mt-4 text-xs text-muted">{meta.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

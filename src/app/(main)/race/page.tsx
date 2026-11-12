import { ArrowRight, Flag, Gauge, MapPin, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EntryTable } from "@/components/race/entry-table";
import { RaceClock } from "@/components/race/race-clock";
import { StatusBadge } from "@/components/race/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { event } from "@/config/event";
import { getPlannedEnd, race } from "@/config/race";
import { getActiveStreams } from "@/config/streams";
import { getRaceClasses } from "@/lib/race/entries";
import { getRaceStatusMeta } from "@/lib/race/status";
import { getFallbackRaceState } from "@/lib/race/state";
import { formatDateTime, getServerNow } from "@/lib/utils/time";

export const metadata: Metadata = {
  title: "Rennen",
  description: "Rennstatus, Rennzeit, Fahrzeuge und Zeitplan des 24-Stunden-Rennens.",
};

// Enthält die Rennuhr.
export const dynamic = "force-dynamic";

export default function RacePage() {
  const serverNow = getServerNow();
  const raceState = getFallbackRaceState(serverNow);
  const meta = getRaceStatusMeta(raceState.status);
  const streams = getActiveStreams();
  const classes = getRaceClasses();
  const startsAt = raceState.startedAt ?? race.startsAt;
  const endsAt = getPlannedEnd(startsAt).toISOString();

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-10 lg:px-6 lg:py-14">
      {/* Kopf: Status und Uhr */}
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={raceState.status} />
            <span className="text-xs font-medium uppercase tracking-widest text-muted">
              {race.series}
            </span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase lg:text-5xl">
            {race.name}
          </h1>
          <p className="mt-2 text-sm text-muted">{meta.description}</p>

          {raceState.note ? (
            <p className="mt-5 max-w-xl rounded-sm border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm">
              {raceState.note}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-sm shrink-0 rounded-md border border-border bg-card p-6">
          <RaceClock
            startsAt={startsAt}
            durationHours={race.durationHours}
            serverNow={serverNow}
          />
        </div>
      </header>

      {/* Eckdaten */}
      <section className="mt-12" aria-labelledby="eckdaten">
        <h2 id="eckdaten" className="font-display text-2xl font-bold uppercase">
          Eckdaten
        </h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DataTile icon={<MapPin className="size-4" />} label="Strecke" value={race.track.name} />
          <DataTile
            icon={<Gauge className="size-4" />}
            label="Streckenlänge"
            value={`${race.track.lengthKm.toLocaleString("de-DE")} km`}
          />
          <DataTile
            icon={<Timer className="size-4" />}
            label="Renndauer"
            value={`${race.durationHours} Stunden`}
          />
          <DataTile
            icon={<Flag className="size-4" />}
            label="Klassen"
            value={classes.length > 0 ? classes.join(" / ") : race.class}
          />
          <DataTile label="Simulator" value={race.simulator} />
          <DataTile label="Team" value={race.team.name} />
          <DataTile label="Rennstart" value={formatDateTime(startsAt)} />
          <DataTile label="Zielflagge" value={formatDateTime(endsAt)} />
        </dl>
      </section>

      {/* Fahrzeuge */}
      <section className="mt-12" aria-labelledby="fahrzeuge">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="fahrzeuge" className="font-display text-2xl font-bold uppercase">
              Fahrzeuge
            </h2>
            <p className="mt-2 text-sm text-muted">
              Jeder Fahrer startet mit eigenem Fahrzeug und eigener Startnummer.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/live">
              Zur Übertragung
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <EntryTable
          streams={streams}
          currentDriverId={raceState.currentDriverId}
          className="mt-5"
        />
      </section>

      {/* Zeitplan */}
      {event.schedule.length > 0 ? (
        <section className="mt-12" aria-labelledby="zeitplan">
          <h2 id="zeitplan" className="font-display text-2xl font-bold uppercase">
            Zeitplan
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {event.schedule.map((entry) => (
              <li key={`${entry.label}-${entry.at}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-accent">{entry.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="tabular font-mono text-sm">{formatDateTime(entry.at)}</p>
                    {entry.durationMinutes ? (
                      <p className="mt-1 text-xs text-muted">
                        {entry.durationMinutes} Minuten
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-subtle">
            Alle Zeiten in mitteleuropäischer Zeit.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function DataTile({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-subtle">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        {label}
      </dt>
      <dd className="mt-1.5 text-sm">{value}</dd>
    </div>
  );
}

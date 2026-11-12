import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SponsorRow } from "@/components/layout/sponsor-row";
import { DriverCard } from "@/components/race/driver-card";
import { EntryTable } from "@/components/race/entry-table";
import { StatusBadge } from "@/components/race/status-badge";
import { Button } from "@/components/ui/button";
import { event } from "@/config/event";
import { race } from "@/config/race";
import { getActiveStreams } from "@/config/streams";
import { getFallbackRaceState } from "@/lib/race/state";
import { getSocialIcon } from "@/lib/utils/social";
import { formatDateTime, getServerNow } from "@/lib/utils/time";

export const metadata: Metadata = {
  title: "Event",
  description:
    "Team, Fahrer, Fahrzeuge, Strecke und Zeitplan des 24-Stunden-Rennens auf der Nordschleife.",
};

export const dynamic = "force-dynamic";

export default function EventPage() {
  const serverNow = getServerNow();
  const raceState = getFallbackRaceState(serverNow);
  const streams = getActiveStreams();

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-10 lg:px-6 lg:py-14">
      {/* Kopf */}
      <header className="max-w-3xl">
        {race.team.logo ? (
          <Image
            src={race.team.logo}
            alt={race.team.name}
            width={493}
            height={400}
            priority
            className="mb-7 h-28 w-auto sm:h-36"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={raceState.status} />
          <span className="text-xs font-medium uppercase tracking-widest text-muted">
            {race.series}
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase lg:text-5xl">
          {event.subtitle}
        </h1>
        <p className="mt-4 text-base text-muted">{event.teamDescription}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/live">
              Zur Übertragung
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/race">Renninformationen</Link>
          </Button>
        </div>
      </header>

      {/* Fahrer */}
      <section className="mt-14" aria-labelledby="fahrer">
        <h2 id="fahrer" className="font-display text-2xl font-bold uppercase">
          Fahrer
        </h2>
        <p className="mt-2 text-sm text-muted">
          {race.team.name} startet mit {streams.length}{" "}
          {streams.length === 1 ? "Fahrzeug" : "Fahrzeugen"}.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {streams.map((stream) => (
            <DriverCard
              key={stream.id}
              stream={stream}
              isCurrent={raceState.currentDriverId === stream.id}
            />
          ))}
        </div>

        <EntryTable
          streams={streams}
          currentDriverId={raceState.currentDriverId}
          className="mt-6"
        />
      </section>

      {/* Eckdaten des Events */}
      {event.facts.length > 0 ? (
        <section className="mt-14" aria-labelledby="format">
          <h2 id="format" className="font-display text-2xl font-bold uppercase">
            Format
          </h2>
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {event.facts.map((fact) => (
              <div key={fact.label} className="border-l-2 border-border pl-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Zeitplan */}
      {event.schedule.length > 0 ? (
        <section className="mt-14" aria-labelledby="ablauf">
          <h2 id="ablauf" className="font-display text-2xl font-bold uppercase">
            Ablauf
          </h2>
          <ol className="mt-6 border-l border-border">
            {event.schedule.map((entry) => (
              <li key={`${entry.label}-${entry.at}`} className="relative py-3 pl-6">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-5 size-2 -translate-x-1/2 rounded-full bg-accent"
                />
                <p className="font-display text-base font-semibold uppercase">
                  {entry.label}
                </p>
                <p className="tabular font-mono text-sm text-muted">
                  {formatDateTime(entry.at)}
                  {entry.durationMinutes ? ` · ${entry.durationMinutes} Minuten` : ""}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-subtle">
            Alle Zeiten in mitteleuropäischer Zeit.
          </p>
        </section>
      ) : null}

      {/* Social Media */}
      {event.social.length > 0 ? (
        <section className="mt-14" aria-labelledby="social">
          <h2 id="social" className="font-display text-2xl font-bold uppercase">
            Folgen
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {event.social.map((link) => {
              const Icon = getSocialIcon(link.platform);

              return (
                <li key={link.url}>
                  <Button asChild variant="secondary">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <Icon />
                      {link.label}
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Sponsoren */}
      {event.sponsors.length > 0 ? (
        <section className="mt-14" aria-labelledby="sponsoren">
          <h2 id="sponsoren" className="font-display text-2xl font-bold uppercase">
            Partner
          </h2>
          <SponsorRow className="mt-6 justify-start" />
        </section>
      ) : null}
    </div>
  );
}

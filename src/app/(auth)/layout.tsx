import Image from "next/image";
import Link from "next/link";

import { event } from "@/config/event";
import { race } from "@/config/race";
import { initials } from "@/lib/utils/text";

/** Schmales Layout für Anmeldung, Registrierung und Passwort-Reset. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-md items-center px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3 rounded-sm">
            {race.team.logo ? (
              <Image
                src={race.team.logo}
                alt={race.team.name}
                width={493}
                height={400}
                className="h-10 w-auto shrink-0"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent font-display text-base font-bold leading-none tracking-tight"
              >
                {race.team.carNumber ?? initials(race.team.name)}
              </span>
            )}
            <span className="flex min-w-0 flex-col leading-tight">
              {race.team.logo ? null : (
                <span className="truncate font-display text-base font-semibold uppercase tracking-wide">
                  {race.team.name}
                </span>
              )}
              <span className="text-[11px] uppercase tracking-widest text-muted">
                {event.title}
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-border bg-surface py-5">
        <p className="mx-auto max-w-md px-4 text-xs text-subtle">
          Das Konto gilt nur für diese Plattform. Für den Twitch-Chat ist zusätzlich
          eine Twitch-Anmeldung im Chat-Fenster nötig.
        </p>
      </footer>
    </div>
  );
}

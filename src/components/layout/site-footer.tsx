import Link from "next/link";

import { SponsorRow } from "@/components/layout/sponsor-row";
import { event } from "@/config/event";
import { mainNav } from "@/config/navigation";
import { race } from "@/config/race";
import { getSocialIcon } from "@/lib/utils/social";

export function SiteFooter() {
  return (
    <footer data-chrome className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1920px] px-4 py-10 lg:px-6">
        <SponsorRow className="pb-10" />

        <div className="flex flex-col gap-8 border-t border-border pt-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold uppercase">{race.team.name}</p>
            <p className="mt-2 text-sm text-muted">{event.subtitle}</p>
            <p className="mt-1 text-xs text-subtle">
              {race.name} · {race.class} · {race.simulator}
            </p>
          </div>

          <nav aria-label="Fußnavigation" className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-subtle">Bereiche</p>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {event.social.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">Folgen</p>
              <ul className="flex flex-col gap-2">
                {event.social.map((link) => {
                  const Icon = getSocialIcon(link.platform);

                  return (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <p className="mt-8 text-xs text-subtle">
          Twitch-Streams und Twitch-Chat werden über die offiziellen Twitch-Embeds
          eingebunden. Twitch ist eine Marke von Twitch Interactive, Inc.
        </p>
      </div>
    </footer>
  );
}

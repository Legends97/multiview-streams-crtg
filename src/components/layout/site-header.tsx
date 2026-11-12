import { Eye } from "lucide-react";
import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { StatusBadge } from "@/components/race/status-badge";
import { Button } from "@/components/ui/button";
import { event } from "@/config/event";
import { mainNav } from "@/config/navigation";
import { race } from "@/config/race";
import { hasSupabaseConfig } from "@/lib/env";
import { initials } from "@/lib/utils/text";
import type { RaceStatus } from "@/types/race";
import type { SessionUser } from "@/types/user";

export interface SiteHeaderProps {
  status: RaceStatus;
  /** Aggregierte Zuschauerzahl; null, wenn nicht verfügbar. */
  viewers?: number | null;
  user?: SessionUser | null;
  /** Benutzermenü, wird vom Layout eingesetzt (Client Component). */
  userMenu?: React.ReactNode;
}

export function SiteHeader({ status, viewers = null, user = null, userMenu }: SiteHeaderProps) {
  return (
    <header
      data-chrome
      className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center gap-3 px-4 lg:gap-6 lg:px-6">
        {/* Team-Marke */}
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-sm">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent font-display text-base font-bold leading-none tracking-tight text-foreground"
          >
            {race.team.carNumber ?? initials(race.team.name)}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-base font-semibold uppercase tracking-wide">
              {race.team.name}
            </span>
            <span className="hidden truncate text-[11px] uppercase tracking-widest text-muted sm:block">
              {event.title}
            </span>
          </span>
        </Link>

        {/* Hauptnavigation */}
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          {/* Rennstatus */}
          <StatusBadge status={status} className="hidden sm:inline-flex" />

          {/* Zuschauerzahl — nur wenn wirklich bekannt */}
          {viewers !== null ? (
            <span
              className="hidden items-center gap-1.5 text-sm text-muted lg:flex"
              title="Zuschauer auf allen Kanälen"
            >
              <Eye className="size-4" aria-hidden="true" />
              <span className="tabular">{viewers.toLocaleString("de-DE")}</span>
            </span>
          ) : null}

          {/* Benutzerbereich — nur wenn Konten überhaupt möglich sind */}
          {user && userMenu ? (
            userMenu
          ) : hasSupabaseConfig() ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Anmelden</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/register">Registrieren</Link>
              </Button>
            </div>
          ) : null}

          <MobileNav />
        </div>
      </div>
    </header>
  );
}

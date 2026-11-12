import { User } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { StreamConfig } from "@/types/stream";

/** Fahrerkarte für Startseite und Event-Seite. */
export function DriverCard({
  stream,
  isCurrent = false,
  className,
}: {
  stream: StreamConfig;
  isCurrent?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-md border bg-card transition-colors",
        isCurrent ? "border-accent" : "border-border hover:border-border-strong",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-surface">
        {stream.avatar ? (
          <Image
            src={stream.avatar}
            alt={stream.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <User className="size-10 text-subtle" aria-hidden="true" />
          </div>
        )}

        {/* Startnummer als Fahrzeugkennzeichnung */}
        {stream.carNumber ? (
          <span
            className="absolute right-3 top-3 rounded-sm bg-background/80 px-2 py-0.5 font-display text-sm font-bold leading-none"
            aria-label={`Startnummer ${stream.carNumber}`}
          >
            #{stream.carNumber}
          </span>
        ) : null}

        {isCurrent ? (
          <Badge variant="accent" className="absolute left-3 top-3">
            Am Steuer
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-display text-lg font-semibold uppercase leading-tight">
          {stream.name}
        </p>

        {stream.car ? (
          <p className="text-sm text-muted">{stream.car}</p>
        ) : null}

        <p className="text-xs font-medium uppercase tracking-wide text-foreground">
          {stream.carClass ?? stream.role}
        </p>

        {stream.description ? (
          <p className="mt-2 text-sm text-muted">{stream.description}</p>
        ) : null}
      </div>
    </article>
  );
}

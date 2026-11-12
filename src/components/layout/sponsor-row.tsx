import Image from "next/image";

import { event } from "@/config/event";
import { cn } from "@/lib/utils/cn";

/**
 * Sponsorenlogos. Graustufen bis Hover, Haupt-Sponsoren größer.
 * Logos liegen in public/sponsors/ (siehe public/README.md).
 */
export function SponsorRow({ className }: { className?: string }) {
  if (event.sponsors.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6", className)}>
      {event.sponsors.map((sponsor) => {
        const size = sponsor.tier === "main" ? { w: 160, h: 48 } : { w: 120, h: 36 };

        const logo = (
          <Image
            src={sponsor.logo}
            alt={sponsor.name}
            width={size.w}
            height={size.h}
            className="h-8 w-auto opacity-70 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0 sm:h-10"
          />
        );

        return sponsor.url ? (
          <a
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm"
            title={sponsor.name}
          >
            {logo}
          </a>
        ) : (
          <span key={sponsor.name} title={sponsor.name}>
            {logo}
          </span>
        );
      })}
    </div>
  );
}

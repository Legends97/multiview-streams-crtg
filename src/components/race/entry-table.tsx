import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buildChannelUrl } from "@/lib/twitch/parents";
import { cn } from "@/lib/utils/cn";
import type { StreamConfig } from "@/types/stream";

/**
 * Übersicht der Fahrzeuge: Startnummer, Fahrer, Modell, Klasse und
 * Twitch-Kanal. Wird auf der Renn- und der Event-Seite verwendet.
 */
export function EntryTable({
  streams,
  currentDriverId = null,
  className,
}: {
  streams: StreamConfig[];
  currentDriverId?: string | null;
  className?: string;
}) {
  if (streams.length === 0) return null;

  return (
    <div className={cn("overflow-x-auto rounded-md border border-border", className)}>
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left">
            <th scope="col" className="px-4 py-3 text-xs uppercase tracking-wide text-subtle">
              Nr.
            </th>
            <th scope="col" className="px-4 py-3 text-xs uppercase tracking-wide text-subtle">
              Fahrer
            </th>
            <th scope="col" className="px-4 py-3 text-xs uppercase tracking-wide text-subtle">
              Fahrzeug
            </th>
            <th scope="col" className="px-4 py-3 text-xs uppercase tracking-wide text-subtle">
              Klasse
            </th>
            <th scope="col" className="px-4 py-3 text-xs uppercase tracking-wide text-subtle">
              Kanal
            </th>
          </tr>
        </thead>
        <tbody>
          {streams.map((stream) => (
            <tr
              key={stream.id}
              className={cn(
                "border-b border-border last:border-b-0",
                stream.id === currentDriverId ? "bg-accent-soft" : "bg-card",
              )}
            >
              <td className="tabular px-4 py-3 font-display text-base font-bold">
                {stream.carNumber ? `#${stream.carNumber}` : "—"}
              </td>
              <td className="px-4 py-3">
                <span className="font-medium">{stream.name}</span>
                {stream.id === currentDriverId ? (
                  <Badge variant="accent" className="ml-2">
                    Am Steuer
                  </Badge>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted">{stream.car ?? "—"}</td>
              <td className="px-4 py-3">
                {stream.carClass ? (
                  <Badge variant="outline">{stream.carClass}</Badge>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <a
                  href={buildChannelUrl(stream.twitchChannel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
                >
                  {stream.twitchChannel}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  buildChatEmbedUrl,
  buildChatPopoutUrl,
  getTwitchParents,
} from "@/lib/twitch/parents";
import { cn } from "@/lib/utils/cn";

/**
 * Offizielles Twitch-Chat-Embed eines Kanals.
 *
 * `key` am iframe ist entscheidend: ohne Remount behält das iframe den
 * alten Kanal (docs/06-twitch-embed.md, Abschnitt 5).
 *
 * BEWUSST OHNE `sandbox`: Twitch dokumentiert das Chat-Embed ohne Sandbox.
 * Mit Sandbox erkennt der Chat die Twitch-Anmeldung des Zuschauers nicht
 * zuverlässig, und das Eingabefeld bleibt wirkungslos. Die Quelle ist fest
 * auf twitch.tv verdrahtet, nicht konfigurierbar.
 */
export function TwitchChatEmbed({
  channel,
  channelLabel,
  className,
}: {
  channel: string | null;
  channelLabel?: string;
  className?: string;
}) {
  const src = useMemo(
    () => (channel ? buildChatEmbedUrl(channel, getTwitchParents()) : null),
    [channel],
  );

  if (!channel || !src) {
    return (
      <div className={cn("flex h-full items-center justify-center p-6 text-center", className)}>
        <p className="text-sm text-muted">
          Kein Stream im Fokus. Klicke auf ein Stream-Tile, um dessen Twitch-Chat zu laden.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-card px-3 py-1.5">
        <p className="flex-1 truncate text-xs font-medium uppercase tracking-wide text-muted">
          {channelLabel ?? channel}
        </p>
        <Button asChild variant="secondary" size="sm" className="h-7 shrink-0 px-2 text-xs">
          <a
            href={buildChatPopoutUrl(channel)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat von ${channelLabel ?? channel} zum Schreiben in eigenem Fenster öffnen`}
            title="Twitch erlaubt das Schreiben nur im eigenen Fenster"
          >
            <ExternalLink />
            Schreiben
          </a>
        </Button>
      </div>

      <iframe
        key={channel}
        src={src}
        title={`Twitch-Chat von ${channelLabel ?? channel}`}
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  );
}

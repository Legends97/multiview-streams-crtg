"use client";

import { ExternalLink, Info } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { buildChannelUrl, buildChatEmbedUrl, getTwitchParents } from "@/lib/twitch/parents";
import { cn } from "@/lib/utils/cn";

/**
 * Offizielles Twitch-Chat-Embed des fokussierten Kanals.
 *
 * `key` am iframe ist entscheidend: ohne Remount behält das iframe den
 * alten Kanal (docs/06-twitch-embed.md, Abschnitt 5).
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
    <div className={cn("flex h-full flex-col", className)}>
      <iframe
        key={channel}
        src={src}
        title={`Twitch-Chat von ${channelLabel ?? channel}`}
        className="min-h-0 w-full flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
      />

      <div className="flex items-start gap-2 border-t border-border bg-surface px-3 py-2">
        <Info className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden="true" />
        <p className="text-[11px] leading-snug text-subtle">
          Zum Schreiben ist eine Twitch-Anmeldung im Chat-Fenster nötig. Blockiert der
          Browser Drittanbieter-Cookies, ist der Chat nur lesbar.
        </p>
        <Button asChild variant="ghost" size="icon-sm" className="ml-auto shrink-0">
          <a
            href={buildChannelUrl(channel)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kanal auf Twitch öffnen"
          >
            <ExternalLink />
          </a>
        </Button>
      </div>
    </div>
  );
}

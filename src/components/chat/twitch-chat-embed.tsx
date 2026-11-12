"use client";

import { ExternalLink, Info } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  buildChatEmbedUrl,
  buildChatPopoutUrl,
  getTwitchParents,
} from "@/lib/twitch/parents";
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
        // Dieselben Freigaben, die der offizielle Twitch-Player fuer sein
        // eigenes iframe setzt. Ohne allow-storage-access-by-user-activation
        // bleibt der Chat leer, sobald Drittanbieter-Cookies blockiert sind.
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
      />

      <div className="shrink-0 border-t border-border bg-surface px-3 py-2">
        <Button asChild variant="secondary" size="sm" className="w-full">
          <a
            href={buildChatPopoutUrl(channel)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink />
            Chat in eigenem Fenster öffnen
          </a>
        </Button>

        <div className="mt-2 flex items-start gap-2">
          <Info className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden="true" />
          <p className="text-[11px] leading-snug text-subtle">
            Bleibt das Fenster leer oder lässt sich nichts schreiben, blockiert dein
            Browser Drittanbieter-Cookies. Im eigenen Fenster funktioniert der Chat
            dann trotzdem.
          </p>
        </div>
      </div>
    </div>
  );
}

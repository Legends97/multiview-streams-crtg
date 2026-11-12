"use client";

import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

import { TwitchChatComposer } from "@/components/chat/twitch-chat-composer";
import { Button } from "@/components/ui/button";
import { hasTwitchClientId } from "@/lib/env";
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
/** Hoehe von Twitchs eigener Eingabeleiste am unteren Rand des Fensters. */
const TWITCH_COMPOSER_HEIGHT_PX = 96;

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

  // Nur verdecken, wenn es Ersatz gibt — sonst bliebe gar kein Feld.
  const hideTwitchComposer = hasTwitchClientId();

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

      {/* Twitchs eigene Eingabeleiste sitzt unten im Fenster und bleibt
          wirkungslos, sobald der Browser Cookies von twitch.tv blockiert.
          Sie laesst sich von aussen nicht entfernen — also laeuft das
          Fenster unten ueber und der Ueberstand wird abgeschnitten. */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <iframe
          key={channel}
          src={src}
          title={`Twitch-Chat von ${channelLabel ?? channel}`}
          className="absolute inset-x-0 top-0 border-0"
          style={{
            height: hideTwitchComposer
              ? `calc(100% + ${TWITCH_COMPOSER_HEIGHT_PX}px)`
              : "100%",
          }}
        />
      </div>

      <TwitchChatComposer channel={channel} />
    </div>
  );
}

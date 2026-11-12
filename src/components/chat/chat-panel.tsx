"use client";

import { Info, X } from "lucide-react";

import { TwitchChatEmbed } from "@/components/chat/twitch-chat-embed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasSupabaseConfig } from "@/lib/env";
import { cn } from "@/lib/utils/cn";
import { usePlayerStore } from "@/stores/player-store";
import type { ChatTab } from "@/types/layout";
import type { StreamConfig } from "@/types/stream";

/** Mindesthöhe eines Chats, wenn mehrere untereinander stehen. */
const STACKED_CHAT_CLASS = "min-h-64 flex-1";

export interface ChatPanelProps {
  /**
   * Fahrer, deren Twitch-Chat angezeigt wird. Im Normalfall alle, die
   * gerade senden — waehrend des Rennens also mehrere gleichzeitig.
   */
  streams: StreamConfig[];
  /** Community-Chat; wird vom Server-Layout eingesetzt. */
  communityChat: React.ReactNode;
  className?: string;
}

/**
 * Chat-Bereich neben dem Grid.
 *
 * Der Community-Chat braucht Konten und damit Supabase. Ist das nicht
 * konfiguriert, entfaellt die Tab-Leiste komplett und es laufen nur die
 * offiziellen Twitch-Chats.
 */
export function ChatPanel({ streams, communityChat, className }: ChatPanelProps) {
  const chatTab = usePlayerStore((state) => state.chatTab);
  const setChatTab = usePlayerStore((state) => state.setChatTab);
  const setChatVisible = usePlayerStore((state) => state.setChatVisible);
  const showCommunity = hasSupabaseConfig();

  const closeButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Chat ausblenden"
      onClick={() => setChatVisible(false)}
    >
      <X />
    </Button>
  );

  const stacked = streams.length > 1;

  const twitchChats = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
        {streams.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="text-sm text-muted">
              Kein Fahrer sendet gerade. Sobald jemand auf Sendung geht, erscheint sein
              Chat hier.
            </p>
          </div>
        ) : (
          streams.map((stream) => (
            <TwitchChatEmbed
              key={stream.id}
              channel={stream.twitchChannel}
              channelLabel={stream.name}
              className={stacked ? STACKED_CHAT_CLASS : "flex-1"}
            />
          ))
        )}
      </div>

      <div className="flex shrink-0 items-start gap-2 border-t border-border bg-surface px-3 py-2">
        <Info className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden="true" />
        <p className="text-[11px] leading-snug text-subtle">
          Zum Mitschreiben musst du bei Twitch angemeldet sein. Klappt es im Fenster
          hier nicht, blockiert dein Browser Cookies von Twitch — dann hilft
          „Schreiben“ am jeweiligen Chat.
        </p>
      </div>
    </div>
  );

  // Ohne Community-Chat: nur die Twitch-Chats, ohne Tab-Leiste.
  if (!showCommunity) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 flex-col border-l border-border bg-surface",
          className,
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <p className="flex-1 truncate text-xs font-medium uppercase tracking-wide text-muted">
            Twitch-Chat
            {streams.length === 1 && streams[0] ? ` · ${streams[0].name}` : ""}
          </p>
          {closeButton}
        </div>
        {twitchChats}
      </div>
    );
  }

  return (
    <Tabs
      value={chatTab}
      onValueChange={(value) => setChatTab(value as ChatTab)}
      className={cn("flex h-full min-h-0 flex-col border-l border-border bg-surface", className)}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-2">
        <TabsList className="flex-1">
          <TabsTrigger value="twitch" className="flex-1">
            Twitch
          </TabsTrigger>
          <TabsTrigger value="community" className="flex-1">
            Community
          </TabsTrigger>
        </TabsList>
        {closeButton}
      </div>

      {/* forceMount wird bewusst NICHT genutzt: der inaktive Tab bleibt
          unmontiert, damit keine unnoetige Verbindung offen ist. */}
      <TabsContent value="twitch" className="flex min-h-0 flex-1 flex-col">
        {twitchChats}
      </TabsContent>

      <TabsContent value="community" className="flex min-h-0 flex-1 flex-col">
        {communityChat}
      </TabsContent>
    </Tabs>
  );
}

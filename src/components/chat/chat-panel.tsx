"use client";

import { X } from "lucide-react";

import { TwitchChatEmbed } from "@/components/chat/twitch-chat-embed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasSupabaseConfig } from "@/lib/env";
import { cn } from "@/lib/utils/cn";
import { usePlayerStore } from "@/stores/player-store";
import type { ChatTab } from "@/types/layout";

export interface ChatPanelProps {
  /** Twitch-Kanal des fokussierten Streams. */
  channel: string | null;
  channelLabel?: string;
  /** Community-Chat; wird vom Server-Layout eingesetzt. */
  communityChat: React.ReactNode;
  className?: string;
}

/**
 * Chat-Bereich neben dem Grid.
 *
 * Der Community-Chat braucht Konten und damit Supabase. Ist das nicht
 * konfiguriert, entfaellt die Tab-Leiste komplett und es laeuft nur der
 * offizielle Twitch-Chat des fokussierten Streams.
 */
export function ChatPanel({
  channel,
  channelLabel,
  communityChat,
  className,
}: ChatPanelProps) {
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

  // Ohne Community-Chat: nur der Twitch-Chat, ohne Tab-Leiste.
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
            Twitch-Chat{channelLabel ? ` · ${channelLabel}` : ""}
          </p>
          {closeButton}
        </div>
        <div className="min-h-0 flex-1">
          <TwitchChatEmbed channel={channel} channelLabel={channelLabel} />
        </div>
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
      <TabsContent value="twitch" className="min-h-0 flex-1">
        <TwitchChatEmbed channel={channel} channelLabel={channelLabel} />
      </TabsContent>

      <TabsContent value="community" className="flex min-h-0 flex-1 flex-col">
        {communityChat}
      </TabsContent>
    </Tabs>
  );
}

"use client";

import { X } from "lucide-react";

import { TwitchChatEmbed } from "@/components/chat/twitch-chat-embed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
 * Chat-Bereich neben dem Grid: offizieller Twitch-Chat des fokussierten
 * Streams oder der plattformeigene Community-Chat.
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
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Chat ausblenden"
          onClick={() => setChatVisible(false)}
        >
          <X />
        </Button>
      </div>

      {/* forceMount wird bewusst NICHT genutzt: der inaktive Tab bleibt
          unmontiert, damit keine unnötige Verbindung offen ist. */}
      <TabsContent value="twitch" className="min-h-0 flex-1">
        <TwitchChatEmbed channel={channel} channelLabel={channelLabel} />
      </TabsContent>

      <TabsContent value="community" className="flex min-h-0 flex-1 flex-col">
        {communityChat}
      </TabsContent>
    </Tabs>
  );
}

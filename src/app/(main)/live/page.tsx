import type { Metadata } from "next";

import { CommunityChatGate } from "@/components/chat/community-chat-gate";
import { LiveWorkspace } from "@/components/stream/live-workspace";
import { getActiveStreams } from "@/config/streams";

export const metadata: Metadata = {
  title: "Live",
  description:
    "Mehrere Onboard-Streams gleichzeitig verfolgen, Layout wechseln und im Chat mitreden.",
};

// Hängt an Session und gespeicherten Einstellungen.
export const dynamic = "force-dynamic";

export default function LivePage() {
  const availableStreams = getActiveStreams();

  return (
    <LiveWorkspace
      availableStreams={availableStreams}
      initialState={null}
      communityChat={<CommunityChatGate />}
    />
  );
}

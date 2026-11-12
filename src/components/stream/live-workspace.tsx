"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { ChatPanel } from "@/components/chat/chat-panel";
import { StreamGrid } from "@/components/stream/stream-grid";
import { StreamToolbar } from "@/components/stream/stream-toolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsableLayouts } from "@/config/layouts";
import { getStreamById } from "@/config/streams";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { usePlayerStore } from "@/stores/player-store";
import type { PlayerLayoutState } from "@/types/layout";
import type { StreamConfig, StreamStatusMap } from "@/types/stream";

export interface LiveWorkspaceProps {
  availableStreams: StreamConfig[];
  /** Gespeicherter Zustand aus user_settings oder localStorage. */
  initialState: Partial<PlayerLayoutState> | null;
  statusMap?: StreamStatusMap;
  communityChat: React.ReactNode;
}

/**
 * Arbeitsfläche der Live-Seite: Toolbar, Grid und Chat.
 * Hält Vollbild, Theater Mode und Tastenkürzel.
 */
export function LiveWorkspace({
  availableStreams,
  initialState,
  statusMap,
  communityChat,
}: LiveWorkspaceProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(gridRef);

  const { hydrated, chatVisible, theaterMode, focusedStreamId, maximizedSlot } =
    usePlayerStore(
      useShallow((state) => ({
        hydrated: state.hydrated,
        chatVisible: state.chatVisible,
        theaterMode: state.theaterMode,
        focusedStreamId: state.focusedStreamId,
        maximizedSlot: state.maximizedSlot,
      })),
    );

  const statuses = usePlayerStore((state) => state.statuses);
  const initialize = usePlayerStore((state) => state.initialize);
  const setChatVisible = usePlayerStore((state) => state.setChatVisible);
  const setTheaterMode = usePlayerStore((state) => state.setTheaterMode);
  const setLayout = usePlayerStore((state) => state.setLayout);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const restoreLayout = usePlayerStore((state) => state.restoreLayout);

  const availableIds = useMemo(
    () => availableStreams.map((stream) => stream.id),
    [availableStreams],
  );

  // Zustand übernehmen (Server-Einstellungen oder Standard).
  useEffect(() => {
    initialize({ availableIds, state: initialState });
  }, [availableIds, initialState, initialize]);

  // Theater Mode blendet Header und Footer aus (CSS in globals.css).
  useEffect(() => {
    document.body.dataset.theater = theaterMode ? "true" : "false";

    return () => {
      document.body.dataset.theater = "false";
    };
  }, [theaterMode]);

  const usableLayouts = useMemo(
    () => getUsableLayouts(availableStreams.length),
    [availableStreams.length],
  );

  const shortcuts = useMemo(
    () => ({
      "1": () => usableLayouts[0] && setLayout(usableLayouts[0].id),
      "2": () => usableLayouts[1] && setLayout(usableLayouts[1].id),
      "3": () => usableLayouts[2] && setLayout(usableLayouts[2].id),
      "4": () => usableLayouts[3] && setLayout(usableLayouts[3].id),
      "5": () => usableLayouts[4] && setLayout(usableLayouts[4].id),
      "6": () => usableLayouts[5] && setLayout(usableLayouts[5].id),
      m: () => {
        if (focusedStreamId) toggleMute(focusedStreamId);
      },
      c: () => setChatVisible(!chatVisible),
      t: () => setTheaterMode(!theaterMode),
      f: () => toggleFullscreen(),
      escape: () => {
        if (maximizedSlot !== null) {
          restoreLayout();

          return;
        }

        if (theaterMode) setTheaterMode(false);
      },
    }),
    [
      chatVisible,
      focusedStreamId,
      maximizedSlot,
      restoreLayout,
      setChatVisible,
      setLayout,
      setTheaterMode,
      theaterMode,
      toggleFullscreen,
      toggleMute,
      usableLayouts,
    ],
  );

  useKeyboardShortcuts(shortcuts);

  const focusedStream = focusedStreamId ? getStreamById(focusedStreamId) : undefined;

  // Jeder sendende Fahrer bekommt seinen Chat. Solange noch keiner als live
  // erkannt ist, bleibt der fokussierte Fahrer als Rueckfallebene stehen.
  const chatStreams = useMemo(() => {
    const live = availableStreams.filter((stream) => statuses[stream.id] === "live");

    if (live.length > 0) return live;

    return focusedStream ? [focusedStream] : [];
  }, [availableStreams, statuses, focusedStream]);

  return (
    <div
      data-workspace
      className="flex h-[calc(100dvh-4rem)] min-h-[32rem] flex-col bg-background"
    >
      <StreamToolbar
        availableCount={availableStreams.length}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div ref={gridRef} className="flex min-h-0 flex-1 flex-col bg-black p-1 sm:p-2">
          {hydrated ? (
            <StreamGrid
              availableStreams={availableStreams}
              statusMap={statusMap}
              className="min-h-0 flex-1"
            />
          ) : (
            <Skeleton className="size-full" />
          )}
        </div>

        {chatVisible ? (
          <ChatPanel
            streams={chatStreams}
            communityChat={communityChat}
            className="h-72 w-full shrink-0 border-l-0 border-t lg:h-auto lg:w-80 lg:border-l lg:border-t-0 xl:w-[340px]"
          />
        ) : (
          <div className="hidden shrink-0 border-l border-border bg-surface p-2 lg:block">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Chat einblenden"
              onClick={() => setChatVisible(true)}
            >
              <MessageSquare />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

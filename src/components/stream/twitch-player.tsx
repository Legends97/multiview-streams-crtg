"use client";

import { useEffect, useRef } from "react";

import { loadTwitchPlayer } from "@/lib/twitch/load-embed";
import { getTwitchParents } from "@/lib/twitch/parents";
import type { StreamStatus } from "@/types/stream";
import type { TwitchPlayerInstance } from "@/types/twitch";

const RECONNECT_DELAYS_MS = [2000, 5000, 15_000];

export interface TwitchPlayerProps {
  channel: string;
  muted: boolean;
  /** 0..1 */
  volume: number;
  /** z. B. "480p" für die Drosselung in großen Layouts, "auto" sonst. */
  quality?: string;
  onStatusChange?: (status: StreamStatus) => void;
}

/**
 * Eine Instanz des offiziellen Twitch Embedded Players.
 *
 * Die Instanz lebt in einem Ref und wird ausschließlich bei einem
 * Kanalwechsel neu erzeugt. Lautstärke, Stummschaltung und Qualität laufen
 * über die API der bestehenden Instanz — ein Rerender darf den Player nie
 * neu aufbauen (docs/08-multistream-player.md, Abschnitt 4).
 */
export function TwitchPlayer({
  channel,
  muted,
  volume,
  quality = "auto",
  onStatusChange,
}: TwitchPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<TwitchPlayerInstance | null>(null);
  const readyRef = useRef(false);
  const statusRef = useRef(onStatusChange);
  const reconnectRef = useRef<{ attempt: number; timer: number | null }>({
    attempt: 0,
    timer: null,
  });

  // Immer den aktuellen Callback verwenden, ohne den Player neu zu erzeugen.
  useEffect(() => {
    statusRef.current = onStatusChange;
  }, [onStatusChange]);

  // Player aufbauen — nur vom Kanal abhängig.
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let cancelled = false;
    readyRef.current = false;
    statusRef.current?.("loading");

    const report = (status: StreamStatus) => {
      if (!cancelled) statusRef.current?.(status);
    };

    loadTwitchPlayer()
      .then((PlayerConstructor) => {
        if (cancelled) return;

        const player = new PlayerConstructor(container, {
          channel,
          parent: getTwitchParents(),
          width: "100%",
          height: "100%",
          // Autoplay ist nur stumm erlaubt; Ton folgt per Benutzeraktion.
          autoplay: true,
          muted: true,
          controls: false,
          playsinline: true,
        });

        playerRef.current = player;

        const handleReady = () => {
          readyRef.current = true;

          try {
            player.setMuted(muted);
            player.setVolume(volume);
            if (quality !== "auto") player.setQuality(quality);
          } catch {
            // Einzelne Setter können direkt nach READY noch fehlschlagen;
            // die separaten Effekte setzen die Werte danach erneut.
          }
        };

        const handlePlaying = () => {
          reconnectRef.current.attempt = 0;
          report("live");
        };

        const handleOffline = () => report("offline");
        const handleBlocked = () => report("error");

        const handleEnded = () => {
          // Verbindung weg: gestaffelt erneut versuchen, dann aufgeben.
          const { attempt } = reconnectRef.current;
          const delay = RECONNECT_DELAYS_MS[attempt];

          if (delay === undefined) {
            report("offline");

            return;
          }

          reconnectRef.current.attempt = attempt + 1;
          reconnectRef.current.timer = window.setTimeout(() => {
            try {
              player.play();
            } catch {
              report("offline");
            }
          }, delay);
        };

        player.addEventListener(PlayerConstructor.READY, handleReady);
        player.addEventListener(PlayerConstructor.PLAYING, handlePlaying);
        player.addEventListener(PlayerConstructor.OFFLINE, handleOffline);
        player.addEventListener(PlayerConstructor.ENDED, handleEnded);
        player.addEventListener(PlayerConstructor.PLAYBACK_BLOCKED, handleBlocked);
      })
      .catch(() => report("error"));

    return () => {
      cancelled = true;

      if (reconnectRef.current.timer !== null) {
        window.clearTimeout(reconnectRef.current.timer);
        reconnectRef.current = { attempt: 0, timer: null };
      }

      const player = playerRef.current;
      playerRef.current = null;
      readyRef.current = false;

      if (player) {
        try {
          // Beendet Wiedergabe, Audio und Netzwerkverbindung des iframes.
          player.destroy();
        } catch {
          // Bereits entfernt — nichts zu tun.
        }
      }

      if (container) container.innerHTML = "";
    };
    // muted, volume und quality absichtlich nicht in den Abhängigkeiten:
    // sie werden unten auf der bestehenden Instanz gesetzt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  // Stummschaltung auf der bestehenden Instanz.
  useEffect(() => {
    const player = playerRef.current;

    if (!player) return;

    try {
      player.setMuted(muted);
    } catch {
      // Player noch nicht bereit; handleReady setzt den Wert.
    }
  }, [muted]);

  // Lautstärke auf der bestehenden Instanz.
  useEffect(() => {
    const player = playerRef.current;

    if (!player) return;

    try {
      player.setVolume(volume);
    } catch {
      // siehe oben
    }
  }, [volume]);

  // Qualität (Drosselung in großen Layouts).
  useEffect(() => {
    const player = playerRef.current;

    if (!player || !readyRef.current || quality === "auto") return;

    try {
      player.setQuality(quality);
    } catch {
      // Qualitätsstufe nicht verfügbar — Twitch wählt selbst.
    }
  }, [quality]);

  return <div ref={containerRef} className="size-full [&_iframe]:size-full" />;
}

"use client";

import { useEffect, useRef } from "react";

import { loadTwitchPlayer } from "@/lib/twitch/load-embed";
import { getTwitchParents } from "@/lib/twitch/parents";
import type { StreamStatus } from "@/types/stream";
import type { TwitchPlayerInstance } from "@/types/twitch";

const RECONNECT_DELAYS_MS = [2000, 5000, 15_000];

/**
 * Die Wiedergabe startet nicht immer von selbst: Browser blockieren Autoplay
 * je nach Einstellung, und Twitch meldet in diesem Fall GAR NICHTS — der
 * Player bleibt still auf "bereit" stehen. Darum nach dem Online-Signal
 * zweimal nachfassen, bevor die Kachel zum Klick auffordert.
 */
const PLAY_NUDGE_DELAYS_MS = [2500, 7000];

export interface TwitchPlayerProps {
  channel: string;
  muted: boolean;
  /** 0..1 */
  volume: number;
  /** z. B. "480p" für die Drosselung in großen Layouts, "auto" sonst. */
  quality?: string;
  onStatusChange?: (status: StreamStatus) => void;
  /** Meldet, ob gerade tatsächlich Video läuft. */
  onPlaybackChange?: (playing: boolean) => void;
  /**
   * Zählt hoch, wenn die Wiedergabe auf Wunsch des Zuschauers starten soll.
   * Browser erlauben den Start oft nur nach einem echten Klick.
   */
  startSignal?: number;
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
  onPlaybackChange,
  startSignal = 0,
}: TwitchPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<TwitchPlayerInstance | null>(null);
  const readyRef = useRef(false);
  const playingRef = useRef(false);
  const statusRef = useRef(onStatusChange);
  const playbackRef = useRef(onPlaybackChange);
  const nudgeTimersRef = useRef<number[]>([]);
  const lastStartSignalRef = useRef(startSignal);
  const reconnectRef = useRef<{ attempt: number; timer: number | null }>({
    attempt: 0,
    timer: null,
  });

  // Immer den aktuellen Callback verwenden, ohne den Player neu zu erzeugen.
  useEffect(() => {
    statusRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    playbackRef.current = onPlaybackChange;
  }, [onPlaybackChange]);

  // Player aufbauen — nur vom Kanal abhängig.
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let cancelled = false;
    readyRef.current = false;
    playingRef.current = false;
    statusRef.current?.("loading");

    const timers = nudgeTimersRef.current;

    const report = (status: StreamStatus) => {
      if (!cancelled) statusRef.current?.(status);
    };

    const reportPlayback = (playing: boolean) => {
      playingRef.current = playing;

      if (!cancelled) playbackRef.current?.(playing);
    };

    const clearNudges = () => {
      for (const timer of timers) window.clearTimeout(timer);
      timers.length = 0;
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

        // Der Kanal sendet. Das heißt noch nicht, dass Video läuft.
        const handleOnline = () => {
          report("live");
          clearNudges();

          for (const delay of PLAY_NUDGE_DELAYS_MS) {
            timers.push(
              window.setTimeout(() => {
                if (playingRef.current || cancelled) return;

                try {
                  player.play();
                } catch {
                  // Der Browser verlangt eine echte Nutzeraktion. Die Kachel
                  // bietet dafür einen Startknopf an.
                }
              }, delay),
            );
          }
        };

        const handlePlaying = () => {
          reconnectRef.current.attempt = 0;
          clearNudges();
          report("live");
          reportPlayback(true);
        };

        const handlePause = () => reportPlayback(false);

        const handleOffline = () => {
          clearNudges();
          reportPlayback(false);
          report("offline");
        };

        // Autoplay abgelehnt: der Kanal sendet, nur der Browser spielt nicht.
        const handleBlocked = () => {
          reportPlayback(false);
          report("live");
        };

        const handleEnded = () => {
          reportPlayback(false);

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
        player.addEventListener(PlayerConstructor.ONLINE, handleOnline);
        player.addEventListener(PlayerConstructor.PLAYING, handlePlaying);
        player.addEventListener(PlayerConstructor.PAUSE, handlePause);
        player.addEventListener(PlayerConstructor.OFFLINE, handleOffline);
        player.addEventListener(PlayerConstructor.ENDED, handleEnded);
        player.addEventListener(PlayerConstructor.PLAYBACK_BLOCKED, handleBlocked);
      })
      .catch(() => report("error"));

    return () => {
      cancelled = true;
      clearNudges();

      if (reconnectRef.current.timer !== null) {
        window.clearTimeout(reconnectRef.current.timer);
        reconnectRef.current = { attempt: 0, timer: null };
      }

      const player = playerRef.current;
      playerRef.current = null;
      readyRef.current = false;
      playingRef.current = false;

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

  // Start durch den Zuschauer: der Klick liefert die Nutzeraktion, die der
  // Browser für Wiedergabe und Ton verlangt.
  useEffect(() => {
    if (startSignal === lastStartSignalRef.current) return;

    lastStartSignalRef.current = startSignal;

    const player = playerRef.current;

    if (!player) return;

    try {
      player.play();
      player.setMuted(muted);
      player.setVolume(volume);
    } catch {
      // Player noch nicht bereit; die Setter-Effekte greifen danach.
    }
    // muted und volume absichtlich nicht in den Abhängigkeiten: der Effekt
    // darf ausschließlich auf das Startsignal reagieren.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal]);

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

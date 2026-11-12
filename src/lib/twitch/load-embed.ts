import type { TwitchPlayerConstructor } from "@/types/twitch";

const PLAYER_SCRIPT_URL = "https://player.twitch.tv/js/embed/v1.js";
const SCRIPT_ID = "twitch-player-embed";

let loader: Promise<TwitchPlayerConstructor> | null = null;

/**
 * Lädt das Twitch-Player-Script genau einmal pro Seitenaufruf und liefert
 * den Player-Konstruktor. Parallele Aufrufe teilen dasselbe Promise, damit
 * acht Tiles nicht acht Script-Tags erzeugen.
 */
export function loadTwitchPlayer(): Promise<TwitchPlayerConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Twitch-Player ist nur im Browser verfügbar"));
  }

  const existing = window.Twitch?.Player;
  if (existing) return Promise.resolve(existing);

  if (loader) return loader;

  loader = new Promise<TwitchPlayerConstructor>((resolve, reject) => {
    const onReady = () => {
      const player = window.Twitch?.Player;

      if (player) {
        resolve(player);
      } else {
        loader = null;
        reject(new Error("Twitch-Script geladen, aber Twitch.Player fehlt"));
      }
    };

    const onError = () => {
      // Nächster Versuch darf neu laden (z. B. nach Netzwerkwechsel oder
      // wenn ein Blocker deaktiviert wurde).
      loader = null;
      reject(
        new Error(
          "Twitch-Player-Script konnte nicht geladen werden. Mögliche Ursachen: " +
            "Netzwerkfehler, Adblocker oder blockierende Content-Security-Policy.",
        ),
      );
    };

    const alreadyInDom = document.getElementById(SCRIPT_ID);

    if (alreadyInDom) {
      alreadyInDom.addEventListener("load", onReady, { once: true });
      alreadyInDom.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = PLAYER_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
  });

  return loader;
}

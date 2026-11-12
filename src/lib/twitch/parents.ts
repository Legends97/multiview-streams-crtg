import { env } from "@/lib/env";

/**
 * Erlaubte Parent-Hosts für Twitch-Embeds.
 *
 * Twitch verlangt den einbettenden Hostnamen — ohne Protokoll, ohne Port,
 * ohne Pfad und ohne Wildcards. Fehlt der aktuelle Host, bleiben Player und
 * Chat schwarz (docs/06-twitch-embed.md).
 */
export function getTwitchParents(): string[] {
  const configured = env.NEXT_PUBLIC_TWITCH_PARENTS.split(",")
    .map(normalizeHost)
    .filter(Boolean);

  // Laufzeit-Host ergänzen: Vercel-Preview-Domains wechseln pro Deployment
  // und können daher nicht vorab konfiguriert werden.
  if (typeof window !== "undefined") {
    const current = normalizeHost(window.location.hostname);

    if (current) configured.push(current);
  }

  return Array.from(new Set(configured));
}

function normalizeHost(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//, "")
    .split("/")[0]!
    .split(":")[0]!
    .toLowerCase();
}

/**
 * URL des offiziellen Twitch-Chat-Embeds für einen Kanal.
 * Mehrere parent-Parameter sind erlaubt und hier auch nötig.
 */
export function buildChatEmbedUrl(channel: string, parents: string[]): string {
  const url = new URL(`https://www.twitch.tv/embed/${channel}/chat`);

  for (const parent of parents) {
    url.searchParams.append("parent", parent);
  }

  // Dunkles Chat-Theme passend zum Dark Mode der Plattform.
  url.searchParams.set("darkpopout", "");

  return url.toString();
}

/**
 * Twitch-Chat in einem eigenen Fenster.
 *
 * Rückfallebene, wenn das eingebettete Chat-Fenster leer bleibt: Browser,
 * die Drittanbieter-Cookies blockieren, verweigern dem Embed den Zugriff auf
 * die Twitch-Anmeldung. Im eigenen Fenster gelten diese Beschränkungen nicht.
 */
export function buildChatPopoutUrl(channel: string): string {
  return `https://www.twitch.tv/popout/${channel}/chat?popout=`;
}

/** Direktlink auf den Kanal, als Rückfallebene für blockierte Embeds. */
export function buildChannelUrl(channel: string): string {
  return `https://www.twitch.tv/${channel}`;
}

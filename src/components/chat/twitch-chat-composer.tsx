"use client";

import { LogIn, Send } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  isTwitchLoginAvailable,
  clearSession,
  readSession,
  startTwitchLogin,
  subscribeSession,
  type TwitchSession,
} from "@/lib/twitch/auth";
import {
  TwitchAuthError,
  fetchBroadcasterId,
  sendChatMessage,
} from "@/lib/twitch/chat-api";
import { cn } from "@/lib/utils/cn";

/** Twitch begrenzt Chat-Nachrichten auf 500 Zeichen. */
const MAX_LENGTH = 500;

/** Kanal-Login -> Broadcaster-ID. Spart Abfragen bei jeder Nachricht. */
const broadcasterIds = new Map<string, string>();

/**
 * Eigenes Eingabefeld fuer den Twitch-Chat.
 *
 * Das Feld im eingebetteten Twitch-Fenster bleibt wirkungslos, sobald der
 * Browser Cookies von twitch.tv in fremden Seiten blockiert. Hier meldet
 * sich der Zuschauer einmal direkt bei uns an; gesendet wird danach ueber
 * die Twitch-API in seinem Namen (docs/06-twitch-embed.md).
 */
export function TwitchChatComposer({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) {
  const session = useTwitchSession();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const text = message.trim();

      if (!session || !text || sending) return;

      setSending(true);
      setError(null);

      try {
        let broadcasterId = broadcasterIds.get(channel);

        if (!broadcasterId) {
          broadcasterId = await fetchBroadcasterId(session.accessToken, channel);
          broadcasterIds.set(channel, broadcasterId);
        }

        const result = await sendChatMessage({
          accessToken: session.accessToken,
          broadcasterId,
          senderId: session.userId,
          message: text,
        });

        if (result.ok) {
          setMessage("");
        } else {
          setError(result.reason);
        }
      } catch (cause) {
        if (cause instanceof TwitchAuthError) {
          clearSession();
          setError("Die Twitch-Anmeldung ist abgelaufen. Bitte neu anmelden.");
        } else {
          setError("Senden fehlgeschlagen. Besteht noch eine Verbindung?");
        }
      } finally {
        setSending(false);
      }
    },
    [channel, message, sending, session],
  );

  // Ohne hinterlegte Twitch-Anwendung gibt es diese Funktion nicht.
  if (!isTwitchLoginAvailable()) return null;

  if (!session) {
    return (
      <div className={cn("shrink-0 border-t border-border bg-surface px-3 py-2", className)}>
        <Button
          size="sm"
          className="w-full"
          onClick={() => startTwitchLogin(window.location.pathname)}
        >
          <LogIn />
          Mit Twitch anmelden zum Schreiben
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("shrink-0 border-t border-border bg-surface px-3 py-2", className)}
    >
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={MAX_LENGTH}
          disabled={sending}
          placeholder={`Als ${session.login} schreiben`}
          aria-label={`Nachricht in den Chat von ${channel} schreiben`}
          className={cn(
            "h-9 min-w-0 flex-1 rounded-sm border border-border bg-card px-2.5 text-sm",
            "placeholder:text-subtle focus:border-accent focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <Button type="submit" size="icon-sm" disabled={sending || !message.trim()} aria-label="Senden">
          <Send />
        </Button>
      </div>

      {error ? (
        <p className="mt-1.5 text-[11px] leading-snug text-danger">{error}</p>
      ) : null}
    </form>
  );
}

/** Aktuelle Twitch-Sitzung, auch bei Aenderung in einem anderen Tab. */
function useTwitchSession(): TwitchSession | null {
  return useSyncExternalStore(subscribeSession, readSession, () => null);
}

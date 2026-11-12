import { z } from "zod";

import { requireTwitchClientId } from "@/lib/env";

/**
 * Zugriff auf die Twitch-Helix-API im Namen des angemeldeten Zuschauers.
 *
 * Nur zwei Dinge: herausfinden, wer der Zuschauer ist und wem der Kanal
 * gehoert, und eine Chat-Nachricht senden. Alle Antworten werden validiert,
 * bevor sie verwendet werden.
 */

const HELIX = "https://api.twitch.tv/helix";

const usersSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.string().min(1),
        login: z.string().min(1),
      }),
    )
    .min(1, "Twitch hat keinen Benutzer zurueckgegeben"),
});

const sendSchema = z.object({
  data: z
    .array(
      z.object({
        message_id: z.string().optional(),
        is_sent: z.boolean(),
        drop_reason: z
          .object({ code: z.string(), message: z.string().optional() })
          .nullish(),
      }),
    )
    .min(1, "Twitch hat keine Sendebestaetigung zurueckgegeben"),
});

export interface TwitchUser {
  id: string;
  login: string;
}

export type SendResult = { ok: true } | { ok: false; reason: string };

/** Token ist abgelaufen oder zurueckgezogen; der Zuschauer muss sich neu anmelden. */
export class TwitchAuthError extends Error {
  constructor() {
    super("Die Twitch-Anmeldung ist abgelaufen.");
    this.name = "TwitchAuthError";
  }
}

/** Der angemeldete Zuschauer selbst (ohne Parameter liefert Twitch ihn). */
export async function fetchCurrentUser(accessToken: string): Promise<TwitchUser> {
  const payload = await helixGet(`${HELIX}/users`, accessToken);
  const parsed = usersSchema.parse(payload);

  return parsed.data[0]!;
}

/** Besitzer eines Kanals anhand des Twitch-Logins. */
export async function fetchBroadcasterId(
  accessToken: string,
  login: string,
): Promise<string> {
  const url = new URL(`${HELIX}/users`);

  url.searchParams.set("login", login);

  const payload = await helixGet(url.toString(), accessToken);
  const parsed = usersSchema.parse(payload);

  return parsed.data[0]!.id;
}

/**
 * Sendet eine Nachricht. Twitch antwortet auch bei HTTP 200 mit einer
 * Ablehnung (`is_sent: false`), etwa bei Slow-Mode oder Sperre — deshalb
 * wird beides unterschieden.
 */
export async function sendChatMessage(input: {
  accessToken: string;
  broadcasterId: string;
  senderId: string;
  message: string;
}): Promise<SendResult> {
  const response = await fetch(`${HELIX}/chat/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Client-Id": requireTwitchClientId(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      broadcaster_id: input.broadcasterId,
      sender_id: input.senderId,
      message: input.message,
    }),
  });

  if (response.status === 401) throw new TwitchAuthError();

  if (!response.ok) {
    return { ok: false, reason: await describeHttpError(response) };
  }

  const parsed = sendSchema.parse(await response.json());
  const result = parsed.data[0]!;

  if (result.is_sent) return { ok: true };

  return { ok: false, reason: describeDropReason(result.drop_reason) };
}

async function helixGet(url: string, accessToken: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": requireTwitchClientId(),
    },
  });

  if (response.status === 401) throw new TwitchAuthError();

  if (!response.ok) {
    throw new Error(await describeHttpError(response));
  }

  return response.json();
}

async function describeHttpError(response: Response): Promise<string> {
  if (response.status === 403) {
    return "Twitch hat das Senden abgelehnt. Fehlt der Anwendung die Berechtigung?";
  }

  if (response.status === 422) {
    return "Twitch hat die Nachricht abgelehnt (zu lang oder nicht erlaubt).";
  }

  if (response.status === 429) {
    return "Zu viele Nachrichten in kurzer Zeit. Kurz warten.";
  }

  let detail = "";

  try {
    const body: unknown = await response.json();

    if (body && typeof body === "object" && "message" in body) {
      const value = (body as { message?: unknown }).message;

      if (typeof value === "string") detail = ` ${value}`;
    }
  } catch {
    // Keine lesbare Antwort — der Statuscode muss reichen.
  }

  return `Twitch meldet Fehler ${response.status}.${detail}`;
}

function describeDropReason(
  reason: { code: string; message?: string } | null | undefined,
): string {
  if (!reason) return "Twitch hat die Nachricht ohne Begruendung verworfen.";

  switch (reason.code) {
    case "msg_duplicate":
      return "Dieselbe Nachricht wurde gerade schon gesendet.";
    case "msg_ratelimit":
      return "Zu schnell geschrieben. Kurz warten.";
    case "slow_mode":
      return "Im Kanal laeuft der Slow-Mode. Kurz warten.";
    case "followers_only":
      return "Dieser Chat ist nur fuer Follower.";
    case "subs_only":
      return "Dieser Chat ist nur fuer Abonnenten.";
    case "emote_only":
      return "Dieser Chat erlaubt nur Emotes.";
    case "user_banned":
      return "Du bist in diesem Chat gesperrt.";
    case "user_timed_out":
      return "Du hast in diesem Chat gerade ein Timeout.";
    case "automod_held":
      return "AutoMod prueft die Nachricht. Sie erscheint erst nach Freigabe.";
    default:
      return reason.message
        ? `Twitch hat die Nachricht verworfen: ${reason.message}`
        : `Twitch hat die Nachricht verworfen (${reason.code}).`;
  }
}

"use client";

import { z } from "zod";

import { hasTwitchClientId, requireTwitchClientId, siteUrl } from "@/lib/env";

/**
 * Anmeldung des Zuschauers bei Twitch — ausschliesslich, damit er auf
 * unserer Seite in den Chat schreiben kann.
 *
 * Warum ueberhaupt: Im eingebetteten Twitch-Chat erkennt Twitch die
 * Anmeldung nur, wenn der Browser Cookies von twitch.tv in fremden Seiten
 * zulaesst. Viele Browser tun das nicht mehr; das Eingabefeld dort bleibt
 * dann wirkungslos (docs/06-twitch-embed.md). Mit einer eigenen Anmeldung
 * sind wir davon unabhaengig.
 *
 * Verfahren: Implicit Grant Flow von Twitch, weil die Seite keinen
 * Server-Anteil mit Geheimnis hat. Das Token kommt im URL-Fragment zurueck
 * und gilt nur fuer diesen einen Zweck.
 */

const SESSION_KEY = "crtg.twitch.session";
const STATE_KEY = "crtg.twitch.state";
const RETURN_KEY = "crtg.twitch.return";

/** Benachrichtigt offene Komponenten ueber An- und Abmeldung. */
const SESSION_EVENT = "crtg:twitch-session";

/** Nur Senden im Namen des Zuschauers. Kein Lesen, keine Moderation. */
export const TWITCH_SCOPES = ["user:write:chat"] as const;

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  login: z.string().min(1),
  userId: z.string().min(1),
});

export type TwitchSession = z.infer<typeof sessionSchema>;

/** Zwischengespeicherte Sitzung, damit useSyncExternalStore stabil bleibt. */
let cachedRaw: string | null = null;
let cachedSession: TwitchSession | null = null;

export function isTwitchLoginAvailable(): boolean {
  return hasTwitchClientId();
}

/** Muss exakt mit der in der Twitch-Konsole hinterlegten URL uebereinstimmen. */
export function getTwitchRedirectUri(): string {
  return `${siteUrl}/auth/twitch`;
}

/**
 * Schickt den Zuschauer zu Twitch. `returnPath` ist der Pfad, auf den er
 * danach zurueckkehrt.
 */
export function startTwitchLogin(returnPath: string): void {
  const state = createState();

  writeSessionStorage(STATE_KEY, state);
  writeSessionStorage(RETURN_KEY, returnPath);

  const url = new URL("https://id.twitch.tv/oauth2/authorize");

  url.searchParams.set("client_id", requireTwitchClientId());
  url.searchParams.set("redirect_uri", getTwitchRedirectUri());
  url.searchParams.set("response_type", "token");
  url.searchParams.set("scope", TWITCH_SCOPES.join(" "));
  url.searchParams.set("state", state);

  window.location.assign(url.toString());
}

export function readSession(): TwitchSession | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(SESSION_KEY);
  } catch {
    // Privater Modus oder blockierter Speicher: dann eben keine Anmeldung.
    return null;
  }

  if (raw === cachedRaw) return cachedSession;

  cachedRaw = raw;

  if (!raw) {
    cachedSession = null;

    return null;
  }

  try {
    const parsed = sessionSchema.safeParse(JSON.parse(raw));

    cachedSession = parsed.success ? parsed.data : null;
  } catch {
    cachedSession = null;
  }

  return cachedSession;
}

export function storeSession(session: TwitchSession): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Nicht speicherbar: die Anmeldung gilt dann nur fuer diese Seite.
  }

  notifySessionChange();
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // nichts zu tun
  }

  notifySessionChange();
}

/** Abonniert An- und Abmeldung, auch aus anderen Tabs. */
export function subscribeSession(onChange: () => void): () => void {
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Prueft den Schutzwert aus dem Anmeldevorgang und verbraucht ihn. */
export function consumeState(received: string | null): boolean {
  const expected = readSessionStorage(STATE_KEY);

  removeSessionStorage(STATE_KEY);

  return Boolean(expected) && expected === received;
}

export function consumeReturnPath(): string {
  const stored = readSessionStorage(RETURN_KEY);

  removeSessionStorage(RETURN_KEY);

  // Nur seiteninterne Pfade zulassen, niemals eine fremde Adresse.
  if (stored && stored.startsWith("/") && !stored.startsWith("//")) return stored;

  return "/live";
}

function notifySessionChange(): void {
  cachedRaw = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function createState(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readSessionStorage(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ohne Speicher laeuft der Vorgang trotzdem, nur ohne Schutzwert.
  }
}

function removeSessionStorage(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // nichts zu tun
  }
}

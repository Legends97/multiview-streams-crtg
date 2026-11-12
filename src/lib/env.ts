import { z } from "zod";

/**
 * Öffentliche Umgebungsvariablen (Client und Server).
 *
 * Die Werte werden einzeln und literal gelesen, damit Next.js sie im
 * Client-Bundle ersetzen kann. Dynamischer Zugriff wie process.env[name]
 * funktioniert dort nicht.
 *
 * Die Supabase-Variablen sind bewusst optional: Streams, Twitch-Chat,
 * Renn- und Event-Seite laufen ohne Datenbank. Erst Anmeldung,
 * Community-Chat und gespeicherte Layouts brauchen Supabase. Fehlen die
 * Werte, bleiben diese Funktionen aus, statt die ganze Seite lahmzulegen.
 *
 * Serverseitige Secrets stehen in env.server.ts.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url("NEXT_PUBLIC_SITE_URL muss eine URL sein"),
  NEXT_PUBLIC_TWITCH_PARENTS: z
    .string()
    .min(1, "NEXT_PUBLIC_TWITCH_PARENTS fehlt (mindestens localhost)"),
  NEXT_PUBLIC_TWITCH_CLIENT_ID: z
    .string()
    .min(10, "NEXT_PUBLIC_TWITCH_CLIENT_ID ist zu kurz")
    .optional(),
  NEXT_PUBLIC_SUPABASE_URL: z
    .url("NEXT_PUBLIC_SUPABASE_URL muss eine URL sein")
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY ist zu kurz")
    .optional(),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TWITCH_PARENTS: process.env.NEXT_PUBLIC_TWITCH_PARENTS,
  NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
});

if (!parsed.success) {
  throw new Error(
    `Fehlende oder ungültige Umgebungsvariablen:\n${z.prettifyError(parsed.error)}\n` +
      "Siehe .env.example und docs/11-umgebungsvariablen.md",
  );
}

export const env = parsed.data;

/** Basis-URL ohne Slash am Ende, für Redirects und Metadaten. */
export const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

/**
 * Ist die Twitch-Anwendung hinterlegt? Steuert, ob Zuschauer sich bei
 * Twitch anmelden und direkt auf der Seite in den Chat schreiben koennen.
 * Die Client-ID ist oeffentlich, kein Geheimnis.
 */
export function hasTwitchClientId(): boolean {
  return Boolean(env.NEXT_PUBLIC_TWITCH_CLIENT_ID);
}

/** Client-ID oder ein klarer Fehler. Aufrufer pruefen vorher. */
export function requireTwitchClientId(): string {
  const clientId = env.NEXT_PUBLIC_TWITCH_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "Twitch-Anmeldung ist nicht konfiguriert: NEXT_PUBLIC_TWITCH_CLIENT_ID fehlt. " +
        "Siehe docs/11-umgebungsvariablen.md",
    );
  }

  return clientId;
}

/**
 * Ist Supabase konfiguriert? Steuert, ob Anmeldung, Community-Chat und
 * gespeicherte Layouts angeboten werden.
 */
export function hasSupabaseConfig(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Supabase-Zugangsdaten oder ein klarer Fehler.
 * Aufrufer prüfen vorher mit hasSupabaseConfig().
 */
export function requireSupabaseConfig(): { url: string; anonKey: string } {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase ist nicht konfiguriert: NEXT_PUBLIC_SUPABASE_URL und " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen. Siehe docs/05-supabase-setup.md",
    );
  }

  return { url, anonKey };
}

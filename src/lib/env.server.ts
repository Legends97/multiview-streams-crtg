import "server-only";

import { z } from "zod";

/**
 * Serverseitige Umgebungsvariablen.
 *
 * Der Import von "server-only" lässt den Build fehlschlagen, falls diese
 * Datei je aus einer Client Component importiert wird. Damit kann der
 * Service-Role-Key nicht versehentlich im Browser-Bundle landen.
 */
const serverSchema = z.object({
  // Optional, solange keine Funktion ihn braucht (Konto löschen,
  // viewer_stats schreiben). Siehe hasServiceRoleKey().
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, "SUPABASE_SERVICE_ROLE_KEY ist zu kurz")
    .optional(),
  TWITCH_CLIENT_ID: z.string().optional(),
  TWITCH_CLIENT_SECRET: z.string().optional(),
});

const parsed = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID || undefined,
  TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET || undefined,
});

if (!parsed.success) {
  throw new Error(
    `Fehlende oder ungültige serverseitige Umgebungsvariablen:\n${z.prettifyError(parsed.error)}\n` +
      "Siehe .env.example und docs/11-umgebungsvariablen.md",
  );
}

export const serverEnv = parsed.data;

/**
 * Die Twitch-Helix-Abfrage ist optional. Ohne Credentials läuft die
 * Plattform vollständig, nur ohne Zuschauerzahlen und ohne die
 * Unterscheidung zwischen "offline" und "Kanal existiert nicht".
 */
export function hasServiceRoleKey(): boolean {
  return Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);
}

/** Service-Role-Key oder ein klarer Fehler. */
export function requireServiceRoleKey(): string {
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY fehlt. Siehe docs/11-umgebungsvariablen.md",
    );
  }

  return key;
}

export function hasTwitchApiCredentials(): boolean {
  return Boolean(serverEnv.TWITCH_CLIENT_ID && serverEnv.TWITCH_CLIENT_SECRET);
}

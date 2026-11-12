"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseConfig } from "@/lib/env";

/**
 * Supabase-Client für Client Components und Realtime.
 * Nutzt ausschließlich den öffentlichen anon-Key; der Zugriff wird durch
 * RLS begrenzt (docs/09-auth-und-rollen.md).
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseConfig();

  return createBrowserClient(url, anonKey);
}

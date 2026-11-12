import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireSupabaseConfig } from "@/lib/env";
import { requireServiceRoleKey } from "@/lib/env.server";

/**
 * Service-Role-Client. UMGEHT RLS VOLLSTAENDIG.
 *
 * Nur für Vorgänge, die anders nicht möglich sind:
 * - Konto endgültig löschen (auth.users)
 * - viewer_stats schreiben (serverseitiger Job)
 *
 * Jede aufrufende Stelle prüft vorher selbst die Berechtigung. Der Import
 * von "server-only" verhindert, dass dieser Client je im Browser landet.
 */
export function createAdminClient() {
  const { url } = requireSupabaseConfig();

  return createClient(url, requireServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

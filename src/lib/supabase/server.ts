import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabaseConfig } from "@/lib/env";

/**
 * Supabase-Client für Server Components, Server Actions und Route Handler.
 *
 * In Server Components ist das Setzen von Cookies nicht erlaubt; der
 * Session-Refresh passiert in der Middleware. Der try/catch deckt genau
 * diesen Fall ab.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Aufruf aus einer Server Component: der Proxy erneuert die
          // Session bereits bei jedem Request.
        }
      },
    },
  });
}

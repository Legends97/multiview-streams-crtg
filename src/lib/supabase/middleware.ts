import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseConfig, requireSupabaseConfig } from "@/lib/env";

export interface SessionResult {
  response: NextResponse;
  user: { id: string } | null;
  role: string | null;
}

/**
 * Erneuert das Session-Cookie bei jedem Request und liefert den
 * angemeldeten Benutzer samt Rolle zurück.
 *
 * Ohne diesen Refresh läuft die Session im Server-Rendering ab und der
 * Benutzer gilt nach einem Reload als abgemeldet.
 *
 * Ist Supabase nicht konfiguriert, passiert hier nichts: Streams, Chat und
 * Renninformationen funktionieren auch ohne Datenbank.
 */
export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let response = NextResponse.next({ request });

  if (!hasSupabaseConfig()) {
    return { response, user: null, role: null };
  }

  const { url, anonKey } = requireSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    // getUser() validiert das Token gegen Supabase — getSession() würde dem
    // Cookie-Inhalt vertrauen und ist für Zugriffsentscheidungen ungeeignet.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let role: string | null = null;

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      role = (data?.role as string | undefined) ?? null;
    }

    return { response, user, role };
  } catch {
    // Supabase nicht erreichbar oder fehlkonfiguriert: die Seite bleibt
    // bedienbar, der Benutzer gilt als nicht angemeldet. Geschützte Routen
    // sperren dadurch, statt dass die gesamte Anwendung ausfällt.
    return { response, user: null, role: null };
  }
}

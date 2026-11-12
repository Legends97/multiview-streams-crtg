import { LogIn, MessageCircle, Tv } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { hasSupabaseConfig } from "@/lib/env";

/**
 * Inhalt des Community-Tabs, solange niemand angemeldet ist.
 *
 * Ohne konfiguriertes Supabase gibt es keine Konten — dann wird das auch
 * so gesagt, statt auf eine Anmeldung zu verweisen, die es nicht gibt
 * (docs/09-auth-und-rollen.md, Berechtigungsmatrix).
 */
export function CommunityChatGate() {
  if (!hasSupabaseConfig()) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <Tv className="size-7 text-subtle" aria-hidden="true" />
        <p className="font-display text-sm font-semibold uppercase">
          Community-Chat nicht aktiv
        </p>
        <p className="max-w-[16rem] text-xs text-muted">
          Für dieses Event läuft die Unterhaltung im Twitch-Chat des jeweiligen
          Fahrers. Wechsle dafür oben auf den Reiter „Twitch“.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <MessageCircle className="size-7 text-subtle" aria-hidden="true" />
      <p className="font-display text-sm font-semibold uppercase">Community-Chat</p>
      <p className="max-w-[16rem] text-xs text-muted">
        Zum Mitlesen und Schreiben im Community-Chat ist ein Konto auf dieser Plattform
        nötig. Der Twitch-Chat funktioniert unabhängig davon.
      </p>
      <div className="mt-1 flex flex-col gap-2">
        <Button asChild size="sm">
          <Link href="/login?next=/live">
            <LogIn />
            Anmelden
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/register">Konto erstellen</Link>
        </Button>
      </div>
    </div>
  );
}

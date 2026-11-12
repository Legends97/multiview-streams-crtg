"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  consumeReturnPath,
  consumeState,
  storeSession,
} from "@/lib/twitch/auth";
import { fetchCurrentUser } from "@/lib/twitch/chat-api";

/**
 * Rueckleitung von Twitch nach der Anmeldung.
 *
 * Twitch liefert das Token im URL-Fragment (`#access_token=...`). Das
 * Fragment erreicht den Server nie, der Austausch passiert also
 * ausschliesslich im Browser (docs/06-twitch-embed.md).
 */
export default function TwitchAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const denied = query.get("error_description") ?? query.get("error");

      if (denied) {
        setError(`Twitch hat die Anmeldung abgelehnt: ${denied}`);

        return;
      }

      const accessToken = fragment.get("access_token");

      if (!accessToken) {
        setError("Twitch hat kein Token zurueckgegeben.");

        return;
      }

      if (!consumeState(fragment.get("state"))) {
        setError("Der Schutzwert der Anmeldung passt nicht. Bitte erneut versuchen.");

        return;
      }

      try {
        const user = await fetchCurrentUser(accessToken);

        storeSession({ accessToken, login: user.login, userId: user.id });

        // Token aus der Adresszeile entfernen, bevor es im Verlauf landet.
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(consumeReturnPath());
      } catch {
        setError("Die Anmeldung konnte nicht abgeschlossen werden.");
      }
    };

    void finish();
  }, [router]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      {error ? (
        <>
          <h1 className="font-display text-xl font-semibold uppercase">
            Anmeldung fehlgeschlagen
          </h1>
          <p className="max-w-md text-sm text-muted">{error}</p>
          <Button onClick={() => router.replace("/live")}>Zurück zur Live-Seite</Button>
        </>
      ) : (
        <p className="text-sm text-muted">Anmeldung bei Twitch wird abgeschlossen …</p>
      )}
    </main>
  );
}

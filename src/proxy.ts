import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/** Routen, die eine Anmeldung voraussetzen. */
const PROTECTED_PREFIXES = ["/profile", "/settings"];

/** Routen, die nur für Gäste sinnvoll sind. */
const GUEST_ONLY_PREFIXES = ["/login", "/register"];

/** Admin-Bereich; /admin/chat ist zusätzlich für Moderatoren offen. */
const ADMIN_PREFIX = "/admin";
const MODERATOR_PATHS = ["/admin/chat"];

export async function proxy(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  // 1. Geschützte Routen für Gäste sperren.
  if (!user && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;

    return NextResponse.redirect(url);
  }

  // 2. Angemeldete Benutzer brauchen Login und Registrierung nicht.
  if (user && GUEST_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const url = request.nextUrl.clone();
    url.pathname = "/live";
    url.search = "";

    return NextResponse.redirect(url);
  }

  // 3. Admin-Bereich: 404 statt 403 — das verrät die Existenz nicht.
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const needsModerator = MODERATOR_PATHS.some((path) => pathname.startsWith(path));
    const allowed = needsModerator
      ? role === "moderator" || role === "admin"
      : role === "admin";

    if (!allowed) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer statischen Assets. Der Session-Refresh muss auf
     * möglichst vielen Requests laufen, aber nicht auf Bildern.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__0e7d2ktukvzr3._.js",
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/src/lib/env.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>env,
    "siteUrl",
    ()=>siteUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [middleware-edge] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [middleware-edge] (ecmascript) <export * as z .url>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [middleware-edge] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$prettifyError$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [middleware-edge] (ecmascript) <export * as z .prettifyError>");
;
/**
 * Oeffentliche Umgebungsvariablen (Client und Server).
 *
 * Die Werte werden einzeln und literal gelesen, damit Next.js sie im
 * Client-Bundle ersetzen kann. Dynamischer Zugriff wie process.env[name]
 * funktioniert dort nicht.
 *
 * Serverseitige Secrets stehen in env.server.ts.
 */ const clientSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    NEXT_PUBLIC_SUPABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__["z"].url("NEXT_PUBLIC_SUPABASE_URL muss eine URL sein"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt oder ist zu kurz"),
    NEXT_PUBLIC_SITE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__["z"].url("NEXT_PUBLIC_SITE_URL muss eine URL sein"),
    NEXT_PUBLIC_TWITCH_PARENTS: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(1, "NEXT_PUBLIC_TWITCH_PARENTS fehlt (mindestens localhost)")
});
const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: ("TURBOPACK compile-time value", "https://placeholder-project.supabase.co"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ("TURBOPACK compile-time value", "placeholder-anon-key-replace-me-0000"),
    NEXT_PUBLIC_SITE_URL: ("TURBOPACK compile-time value", "http://localhost:3000"),
    NEXT_PUBLIC_TWITCH_PARENTS: ("TURBOPACK compile-time value", "localhost")
});
if (!parsed.success) {
    throw new Error(`Fehlende oder ungueltige Umgebungsvariablen:\n${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$prettifyError$3e$__["z"].prettifyError(parsed.error)}\n` + "Siehe .env.example und docs/11-umgebungsvariablen.md");
}
const env = parsed.data;
const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}),
"[project]/src/lib/supabase/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [middleware-edge] (ecmascript)");
;
;
;
async function updateSession(request) {
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_SUPABASE_URL, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                for (const { name, value } of cookiesToSet){
                    request.cookies.set(name, value);
                }
                response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                for (const { name, value, options } of cookiesToSet){
                    response.cookies.set(name, value, options);
                }
            }
        }
    });
    try {
        // getUser() validiert das Token gegen Supabase — getSession() wuerde dem
        // Cookie-Inhalt vertrauen und ist fuer Zugriffsentscheidungen ungeeignet.
        const { data: { user } } = await supabase.auth.getUser();
        let role = null;
        if (user) {
            const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
            role = data?.role ?? null;
        }
        return {
            response,
            user,
            role
        };
    } catch  {
        // Supabase nicht erreichbar oder fehlkonfiguriert: die Seite bleibt
        // bedienbar, der Benutzer gilt als nicht angemeldet. Geschuetzte Routen
        // sperren dadurch, statt dass die gesamte Anwendung ausfaellt.
        return {
            response,
            user: null,
            role: null
        };
    }
}
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/middleware.ts [middleware-edge] (ecmascript)");
;
;
/** Routen, die eine Anmeldung voraussetzen. */ const PROTECTED_PREFIXES = [
    "/profile",
    "/settings"
];
/** Routen, die nur fuer Gaeste sinnvoll sind. */ const GUEST_ONLY_PREFIXES = [
    "/login",
    "/register"
];
/** Admin-Bereich; /admin/chat ist zusaetzlich fuer Moderatoren offen. */ const ADMIN_PREFIX = "/admin";
const MODERATOR_PATHS = [
    "/admin/chat"
];
async function middleware(request) {
    const { response, user, role } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["updateSession"])(request);
    const { pathname, search } = request.nextUrl;
    // 1. Geschuetzte Routen fuer Gaeste sperren.
    if (!user && PROTECTED_PREFIXES.some((prefix)=>pathname.startsWith(prefix))) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = `?next=${encodeURIComponent(pathname + search)}`;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    // 2. Angemeldete Benutzer brauchen Login und Registrierung nicht.
    if (user && GUEST_ONLY_PREFIXES.some((prefix)=>pathname.startsWith(prefix))) {
        const url = request.nextUrl.clone();
        url.pathname = "/live";
        url.search = "";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    // 3. Admin-Bereich: 404 statt 403 — das verraet die Existenz nicht.
    if (pathname.startsWith(ADMIN_PREFIX)) {
        const needsModerator = MODERATOR_PATHS.some((path)=>pathname.startsWith(path));
        const allowed = needsModerator ? role === "moderator" || role === "admin" : role === "admin";
        if (!allowed) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(new URL("/not-found", request.url));
        }
    }
    return response;
}
const config = {
    matcher: [
        /*
     * Alle Pfade ausser statischen Assets. Der Session-Refresh muss auf
     * moeglichst vielen Requests laufen, aber nicht auf Bildern.
     */ "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0e7d2ktukvzr3._.js.map
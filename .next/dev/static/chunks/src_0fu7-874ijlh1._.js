(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/race/race-clock.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RaceClock",
    ()=>RaceClock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$race$2d$clock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-race-clock.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/time.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RaceClock({ startsAt, durationHours, serverNow, className, compact = false }) {
    _s();
    const clock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$race$2d$clock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRaceClock"])({
        startsAt,
        durationHours,
        serverNow
    });
    if (compact) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("tabular font-mono text-sm", className),
            children: clock.phase === "before" ? `Start in ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCountdown"])(clock.msToStart)}` : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(clock.phase === "after" ? durationHours * 3_600_000 : clock.elapsedMs)
        }, void 0, false, {
            fileName: "[project]/src/components/race/race-clock.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-3", className),
        children: [
            clock.phase === "before" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-medium uppercase tracking-wide text-muted",
                        children: "Rennstart in"
                    }, void 0, false, {
                        fileName: "[project]/src/components/race/race-clock.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "tabular font-display text-5xl font-bold leading-none",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(clock.msToStart)
                    }, void 0, false, {
                        fileName: "[project]/src/components/race/race-clock.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/race/race-clock.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-medium uppercase tracking-wide text-muted",
                                children: "Rennzeit"
                            }, void 0, false, {
                                fileName: "[project]/src/components/race/race-clock.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "tabular font-display text-5xl font-bold leading-none",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(clock.elapsedMs)
                            }, void 0, false, {
                                fileName: "[project]/src/components/race/race-clock.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/race/race-clock.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-medium uppercase tracking-wide text-muted",
                                children: clock.phase === "after" ? "Beendet" : "Verbleibend"
                            }, void 0, false, {
                                fileName: "[project]/src/components/race/race-clock.tsx",
                                lineNumber: 59,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "tabular font-display text-5xl font-bold leading-none text-muted",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(clock.remainingMs)
                            }, void 0, false, {
                                fileName: "[project]/src/components/race/race-clock.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/race/race-clock.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/race/race-clock.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1 w-full overflow-hidden rounded-full bg-border",
                role: "progressbar",
                "aria-label": "Rennfortschritt",
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-valuenow": Math.round(clock.progress * 100),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full bg-accent transition-[width] duration-1000 ease-linear",
                    style: {
                        width: `${clock.progress * 100}%`
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/race/race-clock.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/race/race-clock.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/race/race-clock.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(RaceClock, "XKjA63OcpJXkSErru3ddahOGsfw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$race$2d$clock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRaceClock"]
    ];
});
_c = RaceClock;
var _c;
__turbopack_context__.k.register(_c, "RaceClock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-race-clock.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRaceClock",
    ()=>useRaceClock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/time.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useRaceClock({ startsAt, durationHours, serverNow }) {
    _s();
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(serverNow);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRaceClock.useEffect": ()=>{
            // Nur das Intervall anlegen; der erste Tick korrigiert serverNow nach
            // einer Sekunde. Ein sofortiges setState im Effekt-Rumpf würde eine
            // zusätzliche Renderkaskade auslösen.
            const interval = window.setInterval({
                "useRaceClock.useEffect.interval": ()=>setNow(Date.now())
            }["useRaceClock.useEffect.interval"], 1000);
            return ({
                "useRaceClock.useEffect": ()=>window.clearInterval(interval)
            })["useRaceClock.useEffect"];
        }
    }["useRaceClock.useEffect"], []);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useRaceClock.useMemo": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$time$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeRaceClock"])(startsAt, durationHours, now)
    }["useRaceClock.useMemo"], [
        startsAt,
        durationHours,
        now
    ]);
}
_s(useRaceClock, "smqiLFRxP0xUZzFfKcRRqJliTyA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils/time.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeRaceClock",
    ()=>computeRaceClock,
    "formatCountdown",
    ()=>formatCountdown,
    "formatDateTime",
    ()=>formatDateTime,
    "formatDuration",
    ()=>formatDuration,
    "formatRelative",
    ()=>formatRelative,
    "formatTime",
    ()=>formatTime,
    "getServerNow",
    ()=>getServerNow
]);
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
function getServerNow() {
    return Date.now();
}
function computeRaceClock(startsAt, durationHours, now = Date.now()) {
    const start = Date.parse(startsAt);
    if (Number.isNaN(start)) {
        throw new Error(`Ungültige Startzeit: ${startsAt}`);
    }
    const durationMs = durationHours * MS_PER_HOUR;
    const end = start + durationMs;
    if (now < start) {
        return {
            phase: "before",
            msToStart: start - now,
            elapsedMs: 0,
            remainingMs: durationMs,
            progress: 0
        };
    }
    if (now >= end) {
        return {
            phase: "after",
            msToStart: 0,
            elapsedMs: durationMs,
            remainingMs: 0,
            progress: 1
        };
    }
    const elapsedMs = now - start;
    return {
        phase: "running",
        msToStart: 0,
        elapsedMs,
        remainingMs: end - now,
        progress: elapsedMs / durationMs
    };
}
function formatDuration(ms) {
    const safeMs = Math.max(0, ms);
    const hours = Math.floor(safeMs / MS_PER_HOUR);
    const minutes = Math.floor(safeMs % MS_PER_HOUR / MS_PER_MINUTE);
    const seconds = Math.floor(safeMs % MS_PER_MINUTE / MS_PER_SECOND);
    return [
        hours,
        minutes,
        seconds
    ].map((part)=>part.toString().padStart(2, "0")).join(":");
}
function formatCountdown(ms) {
    const safeMs = Math.max(0, ms);
    const days = Math.floor(safeMs / (24 * MS_PER_HOUR));
    const hours = Math.floor(safeMs % (24 * MS_PER_HOUR) / MS_PER_HOUR);
    const minutes = Math.floor(safeMs % MS_PER_HOUR / MS_PER_MINUTE);
    if (days > 0) return `${days} ${days === 1 ? "Tag" : "Tage"} ${hours} Std`;
    if (hours > 0) return `${hours} Std ${minutes} Min`;
    return `${minutes} Min`;
}
function formatDateTime(iso) {
    return new Intl.DateTimeFormat("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(iso));
}
function formatTime(iso) {
    return new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(iso));
}
function formatRelative(iso, now = Date.now()) {
    const diff = now - Date.parse(iso);
    if (diff < MS_PER_MINUTE) return "gerade jetzt";
    if (diff < MS_PER_HOUR) return `vor ${Math.floor(diff / MS_PER_MINUTE)} Min`;
    if (diff < 24 * MS_PER_HOUR) return `vor ${Math.floor(diff / MS_PER_HOUR)} Std`;
    return formatDateTime(iso);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0fu7-874ijlh1._.js.map
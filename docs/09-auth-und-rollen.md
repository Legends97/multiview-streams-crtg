# 09 — Authentifizierung und Rollen

Supabase Auth mit E-Mail und Passwort. Rollen kommen ausschliesslich aus `profiles.role`
und werden auf drei Ebenen durchgesetzt.

---

## 1. Supabase-Clients

| Client | Datei | Einsatz |
| --- | --- | --- |
| Browser | `src/lib/supabase/client.ts` | Client Components, Realtime-Subscriptions |
| Server | `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handler |
| Proxy | `src/lib/supabase/middleware.ts`, aufgerufen aus `src/proxy.ts` | Session-Refresh bei jedem Request |
| Admin | `src/lib/supabase/admin.ts` | **nur** serverseitig, Service-Role-Key, umgeht RLS |

Der Admin-Client wird nur dort benutzt, wo es keinen anderen Weg gibt (Benutzer löschen,
`viewer_stats` schreiben). Jede Verwendung steht in einer Datei mit `server`-only-Import und
prüft vorher selbst die Rolle.

---

## 2. Auth-Flows

### Registrierung

1. Formular: E-Mail, Passwort, Passwort-Wiederholung, Benutzername, AGB-Hinweis
2. Clientseitige Vorvalidierung, dann Server Action
3. Server Action validiert mit Zod: E-Mail-Format, Passwort mindestens 8 Zeichen mit Zahl
   und Buchstabe, Benutzername `^[A-Za-z0-9_]{3,20}$`
4. Benutzername auf Verfügbarkeit prüfen (case-insensitive gegen `profiles`)
5. `signUp` mit `options.data = { username }` und
   `emailRedirectTo = ${NEXT_PUBLIC_SITE_URL}/api/auth/callback`
6. Der Trigger `on_auth_user_created` legt das Profil an
   ([`04-datenmodell.md`](04-datenmodell.md))
7. Seite zeigt "Bitte E-Mail bestätigen" — **kein** automatischer Login

### E-Mail-Verifizierung

1. Benutzer klickt den Link in der Mail
2. `/api/auth/callback` tauscht den Code gegen eine Session (`exchangeCodeForSession`)
3. Weiterleitung auf `/live`
4. Fehlerhafter oder abgelaufener Code führt auf `/login?error=link_invalid` mit der
   Möglichkeit, die Mail erneut zu senden

### Login

1. E-Mail und Passwort an eine Server Action
2. `signInWithPassword`
3. Fehlermeldungen bleiben unspezifisch ("E-Mail oder Passwort ist falsch"), um keine
   Konten zu bestätigen
4. Nicht verifizierte Konten erhalten einen eigenen Hinweis mit Button "Mail erneut senden"
5. Erfolg: Redirect auf das `next`-Ziel oder `/live`

### Logout

Server Action mit `signOut`, Cookies löschen, `revalidatePath("/")`, Redirect auf `/`.

### Passwort zurücksetzen

1. `/reset-password` fragt die E-Mail ab
2. `resetPasswordForEmail` mit
   `redirectTo = ${NEXT_PUBLIC_SITE_URL}/reset-password?step=update`
3. Antwort ist immer gleich, unabhängig davon, ob die Adresse existiert
4. Über den Link erhält der Benutzer eine Recovery-Session und setzt ein neues Passwort
   (`updateUser`)
5. Danach Logout aller Sitzungen und erneuter Login

### Profil

- Benutzername ändern (Einzigartigkeit erneut prüfen, maximal einmal pro 7 Tage)
- Anzeigename ändern
- Avatar hochladen: Typ `png`/`jpeg`/`webp`, maximal 2 MB, Pfad `avatars/<user_id>/<name>`,
  alte Datei löschen, `profiles.avatar_url` aktualisieren
- E-Mail ändern über `updateUser` mit Bestätigung an die neue Adresse
- Konto löschen: Server Action mit Admin-Client, löscht `auth.users`; die Daten in
  `profiles`, `user_settings` und `chat_messages` folgen per `on delete cascade`

---

## 3. Rollen

| Rolle | Vergabe |
| --- | --- |
| `user` | automatisch bei Registrierung |
| `moderator` | durch einen Admin über `/admin/users` |
| `admin` | durch einen Admin; der erste Admin einmalig per SQL ([`05-supabase-setup.md`](05-supabase-setup.md)) |

Regeln:

- Niemand kann seine eigene Rolle ändern (durch `with check` in der Policy erzwungen)
- Ein Admin kann sich nicht selbst die Admin-Rolle entziehen, solange er der letzte Admin
  ist (Prüfung in der Server Action)
- Moderatoren können keine Rollen vergeben

---

## 4. Berechtigungsmatrix

| Funktion | Gast | User | Moderator | Admin |
| --- | --- | --- | --- | --- |
| Streams ansehen, Layouts wechseln | ✅ | ✅ | ✅ | ✅ |
| Layout lokal speichern | ✅ (`localStorage`) | ✅ (Konto) | ✅ | ✅ |
| Twitch-Chat lesen und schreiben | ✅ (Twitch-Login) | ✅ | ✅ | ✅ |
| Community-Chat lesen | ❌ | ✅ | ✅ | ✅ |
| Community-Chat schreiben | ❌ | ✅ | ✅ | ✅ |
| Race- und Event-Seite | ✅ | ✅ | ✅ | ✅ |
| Eigenes Profil bearbeiten | ❌ | ✅ | ✅ | ✅ |
| Nachrichten löschen | ❌ | ❌ | ✅ | ✅ |
| Benutzer timeouten | ❌ | ❌ | ✅ | ✅ |
| Benutzer permanent sperren | ❌ | ❌ | ✅ | ✅ |
| Gelöschte Nachrichten sehen | ❌ | ❌ | ✅ | ✅ |
| `/admin/chat` öffnen | ❌ | ❌ | ✅ | ✅ |
| Rollen vergeben | ❌ | ❌ | ❌ | ✅ |
| Rennstatus und Rennzeiten ändern | ❌ | ❌ | ❌ | ✅ |
| Fahrerdaten bearbeiten | ❌ | ❌ | ❌ | ✅ |
| Zuschauerstatistiken sehen | ❌ | ❌ | ❌ | ✅ |
| Konten löschen | ❌ | ❌ | ❌ | ✅ |

Ein Moderator kann keinen Admin und keinen anderen Moderator sperren.

---

## 5. Durchsetzung auf drei Ebenen

### Ebene 1 — Proxy und Route-Guards

Ab Next.js 16 heisst die fruehere `middleware.ts` **`proxy.ts`** und exportiert
`proxy()` statt `middleware()`. Aufgabe und Matcher sind unveraendert.

```ts
// src/proxy.ts (Prinzip)
// 1. Session-Cookie erneuern (Pflicht, sonst läuft die Session im Server-Rendering ab)
// 2. Gast auf geschützter Route  -> /login?next=<pfad>
// 3. Eingeloggt auf /login, /register -> /live
// 4. /admin/*: Rolle aus profiles lesen, sonst 404 statt 403
```

`/admin` antwortet für Unberechtigte mit `notFound()`. Ein 404 verrät weniger als ein 403.
Die Admin-Navigation wird für Unberechtigte nicht gerendert — das ist Kosmetik, nicht
Sicherheit.

### Ebene 2 — Server-Validierung

Jede Server Action beginnt mit demselben Muster:

```ts
const user = await requireUser();            // wirft bei Gast
const role = await requireRole("moderator"); // wirft bei zu niedriger Rolle
const input = schema.parse(formData);        // Zod, serverseitig
```

`requireUser` und `requireRole` liegen in `src/lib/auth/guards.ts` und lesen die Rolle
immer frisch aus `profiles`. Clientseitige Prüfungen dienen nur der Benutzerführung und
werden nie als Berechtigung gewertet.

### Ebene 3 — Row Level Security

Die Policies aus [`04-datenmodell.md`](04-datenmodell.md) sind die letzte Instanz. Selbst
wenn Guard und Validierung umgangen würden, lehnt die Datenbank ab. Jede neue Tabelle
bekommt RLS plus Policy im gleichen Commit.

---

## 6. Moderation im Community-Chat

| Aktion | Wirkung | Wer |
| --- | --- | --- |
| Nachricht löschen | Soft Delete (`deleted_at`, `deleted_by`), verschwindet bei allen per Realtime | Moderator, Admin |
| Timeout | Zeile in `chat_bans` mit `expires_at` (5 min, 30 min, 24 h) | Moderator, Admin |
| Permanente Sperre | Zeile in `chat_bans` ohne `expires_at` | Moderator, Admin |
| Entsperren | `lifted_at` setzen | Moderator, Admin |

Der betroffene Benutzer sieht im Chat statt des Eingabefelds einen Hinweis mit Grund und
Restdauer — er liest seine eigene Sperre über die Policy `chat_bans_select_own_or_mod`.

### Spam-Schutz

| Mechanismus | Wert | Ort |
| --- | --- | --- |
| Cooldown zwischen Nachrichten | 2 Sekunden | Server Action **und** RLS |
| Nachrichten pro Minute | maximal 10 | Server Action **und** RLS |
| Nachrichtenlänge | 1–500 Zeichen | Zod, `check`-Constraint |
| Identische Wiederholung | dreimal gleicher Text in 30 s wird abgelehnt | Server Action |
| Nur Whitespace | abgelehnt | `check`-Constraint |
| Links | optionale Linksperre für neue Konten (unter 24 h alt) | Server Action |

Doppelte Prüfung ist Absicht: die Server Action liefert eine verständliche Meldung, die
Policy ist die harte Grenze.

---

## 7. Sicherheitsregeln

- `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig, niemals mit `NEXT_PUBLIC_`-Prefix
- Keine Rollenprüfung anhand von Client-State oder JWT-Claims im Browser
- Keine Rückschlüsse auf existierende Konten in Fehlermeldungen
- Redirect-Ziele nach dem Login gegen eine Allowlist relativer Pfade prüfen (kein
  offener Redirect)
- Server Actions prüfen Auth **vor** jeder Datenbankoperation
- Avatar-Uploads serverseitig nach Typ und Grösse prüfen, Dateinamen neu generieren
- Rate-Limit auch auf Auth-Actions (Login-Versuche pro IP und Konto)
- Session-Refresh nur im Proxy (`src/proxy.ts`), nicht in einzelnen Komponenten

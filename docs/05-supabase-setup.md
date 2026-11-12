# 05 — Supabase-Setup

Anleitung für ein frisches Supabase-Projekt. Reihenfolge einhalten, am Ende die
Smoke-Test-Checkliste abarbeiten.

---

## 1. Projekt anlegen

1. Auf <https://supabase.com/dashboard> ein neues Projekt erstellen.
2. Region in Europa wählen (geringste Latenz für Realtime während des Rennens).
3. Datenbank-Passwort sichern — es wird für die CLI und `psql` gebraucht und ist später
   nicht mehr einsehbar.
4. Projektname zum Beispiel `multistream-24h`.

## 2. Keys übernehmen

Im Dashboard unter **Project Settings → API**:

| Dashboard-Feld | Variable | Scope |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Client und Server |
| `anon` / `publishable` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client und Server |
| `service_role` / `secret` key | `SUPABASE_SERVICE_ROLE_KEY` | **nur Server** |

In `.env.local` eintragen. Der Service-Role-Key umgeht RLS vollständig und darf niemals in
Client-Code, in eine `NEXT_PUBLIC_`-Variable oder ins Repository gelangen. Details in
[`11-umgebungsvariablen.md`](11-umgebungsvariablen.md).

## 3. Authentifizierung konfigurieren

Unter **Authentication → Providers**:

- **Email** aktivieren, **Confirm email** einschalten.
- Alle anderen Provider deaktiviert lassen (Projekt nutzt nur E-Mail/Passwort).
- Unter **Authentication → Policies / Settings**: Mindestlänge des Passworts auf 8 setzen,
  Schutz gegen kompromittierte Passwörter aktivieren, falls verfügbar.

Unter **Authentication → URL Configuration**:

| Feld | Wert lokal | Wert produktiv |
| --- | --- | --- |
| Site URL | `http://localhost:3000` | `https://<deine-domain>` |
| Redirect URLs | `http://localhost:3000/api/auth/callback` | `https://<deine-domain>/api/auth/callback` |

Zusätzlich für Vercel-Previews eintragen:
`https://*-<team-slug>.vercel.app/api/auth/callback` sowie die Reset-Route
`https://<deine-domain>/reset-password`. Fehlt eine Redirect-URL, landet der Benutzer nach
dem Bestätigungslink auf einer Fehlerseite.

E-Mail-Vorlagen unter **Authentication → Emails** anpassen (Absendername, Team-Logo, Text
auf Deutsch). Der eingebaute Mailversand ist stark limitiert — vor dem Rennen einen
SMTP-Anbieter unter **Project Settings → Auth → SMTP** hinterlegen, sonst kommen
Verifizierungsmails bei vielen gleichzeitigen Registrierungen nicht an.

## 4. Schema und RLS einspielen

Zwei Wege, beide liefern das gleiche Ergebnis. Die SQL-Inhalte stehen in
[`04-datenmodell.md`](04-datenmodell.md).

### Variante A — SQL-Editor (schnell, für das erste Setup)

1. Dashboard → **SQL Editor** → **New query**.
2. Inhalt von `supabase/migrations/0001_profiles.sql` einfügen, ausführen.
3. Für jede weitere Migration in numerischer Reihenfolge wiederholen.
4. Unter **Database → Tables** prüfen, dass jede Tabelle "RLS enabled" zeigt.

### Variante B — Supabase CLI (empfohlen, sobald es mehrere Umgebungen gibt)

```bash
npm install -D supabase

npx supabase login
npx supabase link --project-ref <project-ref>

# lokale Migrationen auf das verlinkte Projekt anwenden
npx supabase db push

# Zustand prüfen
npx supabase migration list
```

Neue Migration anlegen:

```bash
npx supabase migration new chat
# erzeugt supabase/migrations/<timestamp>_chat.sql
```

Bestehende Migrationen werden nie nachträglich bearbeitet. Korrekturen kommen als neue
Datei, damit Produktion und lokale Umgebung nicht auseinanderlaufen.

## 5. Storage für Avatare

Wird bereits von `0001_profiles.sql` mit angelegt (Bucket `avatars`, öffentlich lesbar,
Schreibrecht nur im eigenen Ordner). Manuelle Alternative:

1. **Storage → New bucket**, Name `avatars`, Public aktivieren.
2. Die vier Policies aus [`04-datenmodell.md`](04-datenmodell.md), Abschnitt 10, im
   SQL-Editor ausführen.
3. Optional unter **Storage → Settings** die maximale Dateigrösse begrenzen (2 MB genügt);
   zusätzlich prüft die Anwendung Typ (`image/png`, `image/jpeg`, `image/webp`) und Grösse
   serverseitig.

## 6. Realtime aktivieren

Die Publication wird per SQL gesetzt (`0002_chat.sql`, `0004_race.sql`). Kontrolle im
Dashboard unter **Database → Replication**: `chat_messages` und `race_state` müssen Teil
von `supabase_realtime` sein.

Prüfabfrage:

```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime';
```

## 7. Ersten Admin setzen

Rollen lassen sich nicht über die Anwendung selbst zum ersten Mal vergeben — das wäre eine
Rechteausweitung. Deshalb einmalig per SQL:

```sql
update public.profiles
set role = 'admin'
where username = '<dein-benutzername>';
```

Danach alle weiteren Rollen über `/admin/users` verwalten. Nach dem Setzen einmal ab- und
wieder anmelden, damit die Rolle serverseitig frisch gelesen wird.

## 8. Lokale Entwicklung gegen Supabase

Für dieses Projekt genügt die Entwicklung gegen das Cloud-Projekt. Wer lokal arbeiten will:

```bash
npx supabase start    # benötigt Docker
npx supabase status   # liefert lokale URL und Keys für .env.local
npx supabase stop
```

Achtung: die lokale Instanz hat eigene Keys und eigene Daten. Beim Wechsel müssen die
Variablen in `.env.local` getauscht werden.

---

## 9. Smoke-Test-Checkliste

Nach dem Setup und nach jeder Migration prüfen:

- [ ] Jede Tabelle in **Database → Tables** zeigt "RLS enabled"
- [ ] `select * from pg_policies where schemaname = 'public';` listet für jede Tabelle
      mindestens eine Policy
- [ ] Registrierung erzeugt automatisch eine Zeile in `profiles` (Trigger funktioniert)
- [ ] Bestätigungsmail kommt an, der Link landet auf `/api/auth/callback` und loggt ein
- [ ] Passwort-Reset-Mail kommt an und führt auf `/reset-password`
- [ ] Ein eingeloggter Benutzer kann eine Chat-Nachricht schreiben
- [ ] Ein ausgeloggter Besucher kann **nicht** schreiben und sieht den Community-Chat nicht
- [ ] Zwei Browser sehen neue Nachrichten in Echtzeit
- [ ] Ein Benutzer mit Rolle `user` kann `profiles.role` bei sich selbst **nicht** ändern
- [ ] Ein Statuswechsel in `race_state` erreicht offene Clients ohne Reload
- [ ] Avatar-Upload landet unter `avatars/<user_id>/…` und ist öffentlich abrufbar
- [ ] Ein Benutzer kann **nicht** in den Avatar-Ordner eines anderen schreiben

Negativtests sind Pflichtbestandteil: eine Policy, die nur das Erlaubte beweist, ist nicht
geprüft.

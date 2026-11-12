# 04 — Datenmodell

Alle Tabellen liegen im Schema `public`. **Auf jeder Tabelle ist RLS aktiv.** Eine Tabelle
ohne Policy gilt als Fehler.

Die SQL-Blöcke hier sind die Vorlage für die Migrationen in `supabase/migrations/`. Sie
werden in den Phasen 5, 6, 7, 8 und 10 (siehe [`02-entwicklungsplan.md`](02-entwicklungsplan.md))
in Dateien überführt und dort gepflegt. Diese Datei bleibt die lesbare Referenz.

---

## 1. Überblick

```
auth.users (Supabase)
   │ 1:1
   ▼
profiles ──────────┬──────────────┬───────────────────┐
   │ 1:1           │ 1:n          │ 1:n               │ n:1 (gesetzt von)
   ▼               ▼              ▼                   ▼
user_settings   chat_messages   chat_bans          race_state
                                                      │ n:1
                                                      ▼
                                                   drivers
viewer_stats  (keine Beziehung, reine Zeitreihe)
```

| Tabelle | Zweck | Phase |
| --- | --- | --- |
| `profiles` | Benutzerprofil und Rolle | 5 |
| `user_settings` | gespeichertes Player-Layout und Vorlieben | 7 |
| `chat_messages` | Community-Chat-Nachrichten | 6 |
| `chat_bans` | Timeouts und permanente Sperren | 6 |
| `race_state` | dynamischer Rennzustand (eine Zeile) | 8 |
| `drivers` | dynamische Fahrerdaten, ergänzt `config/streams.ts` | 8 |
| `viewer_stats` | Zuschauerzahlen im Zeitverlauf | 10 |

---

## 2. Enums und Hilfsfunktionen

```sql
create type user_role as enum ('user', 'moderator', 'admin');

create type race_status as enum (
  'UPCOMING',
  'LIVE',
  'FULL_COURSE_YELLOW',
  'SAFETY_CAR',
  'RED_FLAG',
  'FINISHED'
);

-- Rolle des aktuellen Benutzers, ohne Rekursion in den Policies.
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('moderator', 'admin');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'admin';
$$;

-- Aktive Sperre oder laufender Timeout?
create or replace function public.is_chat_restricted(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_bans b
    where b.user_id = target
      and b.lifted_at is null
      and (b.expires_at is null or b.expires_at > now())
  );
$$;
```

`current_user_role()` ist `security definer`, weil die Policies auf `profiles` sonst sich
selbst aufrufen würden.

---

## 3. `profiles`

Ein Profil pro Auth-Benutzer, automatisch beim Signup erzeugt.

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `id` | `uuid` | PK, FK → `auth.users(id)` `on delete cascade` |
| `username` | `text` | `not null`, `unique`, 3–20 Zeichen, `[a-zA-Z0-9_]` |
| `display_name` | `text` | optional, max. 40 Zeichen |
| `avatar_url` | `text` | optional, Storage-URL |
| `role` | `user_role` | `not null`, Default `'user'` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`, per Trigger gepflegt |

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Profile sind öffentlich lesbar (Chat zeigt Name und Avatar).
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Eigenes Profil ändern, aber nicht die eigene Rolle.
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());

-- Admins dürfen alles, inklusive Rollenwechsel.
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
```

### Trigger: Profil beim Signup anlegen

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Trigger: `updated_at`

```sql
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
```

Der gleiche Trigger wird auf `user_settings`, `race_state` und `drivers` gelegt.

---

## 4. `user_settings`

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `user_id` | `uuid` | PK, FK → `profiles(id)` `on delete cascade` |
| `layout` | `text` | `not null`, Default `'single'`, erlaubt: `single`, `dual`, `triple`, `quad`, `six`, `eight` |
| `slot_assignment` | `jsonb` | `not null`, Default `'[]'`, Array von Stream-IDs in Slot-Reihenfolge |
| `focused_stream_id` | `text` | optional |
| `volumes` | `jsonb` | `not null`, Default `'{}'`, Map Stream-ID → 0.0–1.0 |
| `chat_visible` | `boolean` | `not null`, Default `true` |
| `chat_tab` | `text` | `not null`, Default `'twitch'`, erlaubt: `twitch`, `community` |
| `theater_mode` | `boolean` | `not null`, Default `false` |
| `updated_at` | `timestamptz` | Default `now()` |

```sql
create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  layout text not null default 'single'
    check (layout in ('single','dual','triple','quad','six','eight')),
  slot_assignment jsonb not null default '[]'::jsonb,
  focused_stream_id text,
  volumes jsonb not null default '{}'::jsonb,
  chat_visible boolean not null default true,
  chat_tab text not null default 'twitch'
    check (chat_tab in ('twitch','community')),
  theater_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
  on public.user_settings for select
  using (user_id = auth.uid());

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (user_id = auth.uid());

create policy "user_settings_update_own"
  on public.user_settings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

Stream-IDs werden absichtlich als Text gespeichert, nicht als Fremdschlüssel: die Streams
leben in `src/config/streams.ts`. Unbekannte IDs werden beim Laden verworfen.

---

## 5. `chat_messages`

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `id` | `bigint` | PK, `generated always as identity` |
| `user_id` | `uuid` | `not null`, FK → `profiles(id)` `on delete cascade` |
| `content` | `text` | `not null`, 1–500 Zeichen, nicht nur Whitespace |
| `created_at` | `timestamptz` | `not null`, Default `now()` |
| `deleted_at` | `timestamptz` | optional, Soft Delete |
| `deleted_by` | `uuid` | optional, FK → `profiles(id)` `on delete set null` |

```sql
create table public.chat_messages (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null
    check (char_length(btrim(content)) between 1 and 500),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create index chat_messages_created_at_idx
  on public.chat_messages (created_at desc);
create index chat_messages_user_recent_idx
  on public.chat_messages (user_id, created_at desc);

alter table public.chat_messages enable row level security;

-- Nur eingeloggte Benutzer lesen den Community-Chat.
-- Gelöschte Nachrichten sehen nur Moderatoren.
create policy "chat_messages_select"
  on public.chat_messages for select
  to authenticated
  using (deleted_at is null or public.is_moderator());

-- Schreiben: nur als man selbst, nicht gesperrt, mit Cooldown von 2 Sekunden
-- und maximal 10 Nachrichten pro Minute.
create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not public.is_chat_restricted(auth.uid())
    and not exists (
      select 1 from public.chat_messages m
      where m.user_id = auth.uid()
        and m.created_at > now() - interval '2 seconds'
    )
    and (
      select count(*) from public.chat_messages m
      where m.user_id = auth.uid()
        and m.created_at > now() - interval '1 minute'
    ) < 10
  );

-- Löschen erfolgt als Soft Delete durch Moderatoren.
create policy "chat_messages_moderate"
  on public.chat_messages for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());
```

Das Rate-Limit steht bewusst doppelt: in der Server Action für die freundliche Fehlermeldung
und in der Policy als harte Grenze.

### Realtime

```sql
alter publication supabase_realtime add table public.chat_messages;
alter table public.chat_messages replica identity full;
alter publication supabase_realtime add table public.race_state;
```

`replica identity full` wird gebraucht, damit Clients beim Soft Delete die betroffene
Nachricht erkennen.

---

## 6. `chat_bans`

Deckt Timeout (mit `expires_at`) und permanente Sperre (`expires_at is null`) ab.

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `id` | `bigint` | PK, Identity |
| `user_id` | `uuid` | `not null`, FK → `profiles(id)` `on delete cascade` |
| `created_by` | `uuid` | `not null`, FK → `profiles(id)` `on delete set null` |
| `reason` | `text` | optional, max. 200 Zeichen |
| `created_at` | `timestamptz` | Default `now()` |
| `expires_at` | `timestamptz` | `null` = permanent |
| `lifted_at` | `timestamptz` | gesetzt beim Entsperren |

```sql
create table public.chat_bans (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  reason text check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  lifted_at timestamptz
);

create index chat_bans_active_idx
  on public.chat_bans (user_id)
  where lifted_at is null;

alter table public.chat_bans enable row level security;

-- Betroffene sehen ihre eigene Sperre (für die Hinweismeldung im Chat).
create policy "chat_bans_select_own_or_mod"
  on public.chat_bans for select
  to authenticated
  using (user_id = auth.uid() or public.is_moderator());

create policy "chat_bans_insert_mod"
  on public.chat_bans for insert
  to authenticated
  with check (public.is_moderator() and created_by = auth.uid());

create policy "chat_bans_update_mod"
  on public.chat_bans for update
  to authenticated
  using (public.is_moderator())
  with check (public.is_moderator());
```

Ein Moderator darf keinen Admin sperren. Diese Regel wird in der Server Action geprüft, da
sie eine Rollenabfrage auf den Zielbenutzer erfordert.

---

## 7. `race_state`

Genau **eine** Zeile, erzwungen über `id = 1`.

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `id` | `smallint` | PK, `check (id = 1)` |
| `status` | `race_status` | `not null`, Default `'UPCOMING'` |
| `current_driver_id` | `text` | optional, Stream-ID aus der Config |
| `started_at` | `timestamptz` | tatsächlicher Rennstart, überschreibt die Config |
| `note` | `text` | optional, max. 280 Zeichen, Laufband-Meldung |
| `updated_at` | `timestamptz` | Default `now()` |
| `updated_by` | `uuid` | FK → `profiles(id)` `on delete set null` |

```sql
create table public.race_state (
  id smallint primary key default 1 check (id = 1),
  status race_status not null default 'UPCOMING',
  current_driver_id text,
  started_at timestamptz,
  note text check (char_length(note) <= 280),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.race_state (id) values (1)
  on conflict (id) do nothing;

alter table public.race_state enable row level security;

create policy "race_state_select_all"
  on public.race_state for select
  using (true);

create policy "race_state_update_admin"
  on public.race_state for update
  using (public.is_admin())
  with check (public.is_admin());
```

---

## 8. `drivers`

Ergänzt `src/config/streams.ts` um Daten, die sich während des Events ändern dürfen.
`stream_id` verweist auf die Config-ID, nicht auf eine Tabelle.

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `stream_id` | `text` | PK, entspricht `streams[].id` |
| `display_name` | `text` | optional, überschreibt den Config-Namen |
| `role_label` | `text` | optional, zum Beispiel "Main Driver" |
| `bio` | `text` | optional, max. 600 Zeichen |
| `country` | `text` | optional, ISO-3166-1 Alpha-2 |
| `stint_start` | `timestamptz` | optional, Beginn des aktuellen Stints |
| `stint_end` | `timestamptz` | optional, geplantes Ende |
| `sort_order` | `integer` | `not null`, Default `0` |
| `updated_at` | `timestamptz` | Default `now()` |

```sql
create table public.drivers (
  stream_id text primary key,
  display_name text,
  role_label text,
  bio text check (char_length(bio) <= 600),
  country text check (country ~ '^[A-Z]{2}$'),
  stint_start timestamptz,
  stint_end timestamptz,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  check (stint_end is null or stint_start is null or stint_end > stint_start)
);

alter table public.drivers enable row level security;

create policy "drivers_select_all"
  on public.drivers for select
  using (true);

create policy "drivers_write_admin"
  on public.drivers for all
  using (public.is_admin())
  with check (public.is_admin());
```

---

## 9. `viewer_stats`

Zeitreihe für das Admin-Dashboard. Wird von `/api/twitch/status` bei jeder Aktualisierung
beschrieben (serverseitig mit Service-Role-Key, deshalb keine Insert-Policy für Clients).

| Spalte | Typ | Constraints |
| --- | --- | --- |
| `id` | `bigint` | PK, Identity |
| `recorded_at` | `timestamptz` | `not null`, Default `now()` |
| `stream_id` | `text` | `not null` |
| `is_live` | `boolean` | `not null` |
| `viewer_count` | `integer` | `not null`, Default `0`, `>= 0` |

```sql
create table public.viewer_stats (
  id bigint primary key generated always as identity,
  recorded_at timestamptz not null default now(),
  stream_id text not null,
  is_live boolean not null,
  viewer_count integer not null default 0 check (viewer_count >= 0)
);

create index viewer_stats_recorded_at_idx
  on public.viewer_stats (recorded_at desc);
create index viewer_stats_stream_idx
  on public.viewer_stats (stream_id, recorded_at desc);

alter table public.viewer_stats enable row level security;

create policy "viewer_stats_select_admin"
  on public.viewer_stats for select
  to authenticated
  using (public.is_admin());
```

Aufbewahrung: Zeilen älter als 30 Tage dürfen gelöscht werden; bei einem einzelnen Event
genügt manuelles Aufräumen nach dem Rennen.

---

## 10. Storage

Bucket `avatars`, öffentlich lesbar. Pfadkonvention: `<user_id>/<dateiname>`.

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_write_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 11. Migrationsreihenfolge

| Datei | Inhalt | Phase |
| --- | --- | --- |
| `0001_profiles.sql` | Enums, Hilfsfunktionen, `profiles`, Trigger, Storage-Policies | 5 |
| `0002_chat.sql` | `chat_messages`, `chat_bans`, `is_chat_restricted`, Realtime | 6 |
| `0003_user_settings.sql` | `user_settings` | 7 |
| `0004_race.sql` | `race_status`, `race_state`, `drivers`, Realtime | 8 |
| `0005_viewer_stats.sql` | `viewer_stats` | 10 |

`is_chat_restricted()` referenziert `chat_bans` und wird deshalb erst in `0002` angelegt.
Migrationen werden nie nachträglich verändert, Korrekturen kommen als neue Datei.

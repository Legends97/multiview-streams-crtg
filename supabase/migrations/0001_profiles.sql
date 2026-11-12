-- ---------------------------------------------------------------------------
-- 0001_profiles — Rollen, Profile, Signup-Trigger, Avatar-Storage
-- Referenz: docs/04-datenmodell.md
-- ---------------------------------------------------------------------------

-- Enums -------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('user', 'moderator', 'admin');
  end if;
end
$$;

-- Tabelle -----------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- Hilfsfunktionen ---------------------------------------------------------

-- Rolle des aktuellen Benutzers. security definer, damit die Policies auf
-- profiles sich nicht selbst aufrufen (Rekursion).
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
  select coalesce(public.current_user_role() in ('moderator', 'admin'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- updated_at automatisch pflegen
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Profil beim Signup anlegen ----------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
  final_username text;
  suffix integer := 0;
begin
  desired_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );

  -- Benutzername muss dem Format entsprechen, sonst Fallback.
  if desired_username !~ '^[A-Za-z0-9_]{3,20}$' then
    desired_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  final_username := desired_username;

  -- Kollisionen aufloesen, damit die Registrierung nie am Trigger scheitert.
  while exists (
    select 1 from public.profiles where lower(username) = lower(final_username)
  ) loop
    suffix := suffix + 1;
    final_username := substr(desired_username, 1, 16) || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    nullif(new.raw_user_meta_data->>'display_name', '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security ------------------------------------------------------

alter table public.profiles enable row level security;

-- Profile sind oeffentlich lesbar: der Chat zeigt Name, Avatar und Rolle.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Eigenes Profil aendern, aber nicht die eigene Rolle.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());

-- Admins duerfen alles, inklusive Rollenwechsel.
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Storage: Avatare -------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_write_own_folder" on storage.objects;
create policy "avatars_write_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own_folder" on storage.objects;
create policy "avatars_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own_folder" on storage.objects;
create policy "avatars_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

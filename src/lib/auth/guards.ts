import "server-only";

import { notFound, redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { ROLE_RANK, type Profile, type SessionUser, type UserRole } from "@/types/user";

/**
 * Angemeldeter Benutzer samt Profil — oder null.
 *
 * Die Rolle wird immer frisch aus profiles gelesen, nie aus Client-State
 * oder JWT-Claims (docs/09-auth-und-rollen.md, Abschnitt 5).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    profile: mapProfile(data),
  };
}

/** Wie getSessionUser, leitet Gäste aber zum Login. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }

  return user;
}

/**
 * Erzwingt eine Mindestrolle. Unberechtigte erhalten 404 statt 403 —
 * das verrät weniger über die Struktur der Anwendung.
 */
export async function requireRole(minRole: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user || !hasRole(user.profile.role, minRole)) notFound();

  return user;
}

export function hasRole(role: UserRole, minRole: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

/** Fehlerergebnis für Server Actions, wenn die Berechtigung fehlt. */
export async function checkRole(minRole: UserRole): Promise<SessionUser | null> {
  const user = await getSessionUser();

  if (!user || !hasRole(user.profile.role, minRole)) return null;

  return user;
}

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    createdAt: row.created_at,
  };
}

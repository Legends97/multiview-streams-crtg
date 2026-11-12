import type { ChatTab, LayoutId } from "@/types/layout";

/** Identisch mit dem Postgres-Enum user_role. */
export type UserRole = "user" | "moderator" | "admin";

export const ROLE_RANK: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
};

export interface Profile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

/** Angemeldeter Benutzer inklusive Profil, wie ihn die Guards liefern. */
export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile;
}

export interface UserSettings {
  userId: string;
  layout: LayoutId;
  slotAssignment: (string | null)[];
  focusedStreamId: string | null;
  volumes: Record<string, number>;
  chatVisible: boolean;
  chatTab: ChatTab;
  theaterMode: boolean;
}

import type { UserRole } from "@/types/user";

/** Eine Nachricht im Community-Chat, inklusive Autor-Daten. */
export interface ChatMessage {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
  deletedAt: string | null;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: UserRole;
  };
}

/** Timeout (mit expiresAt) oder permanente Sperre (expiresAt = null). */
export interface ChatBan {
  id: number;
  userId: string;
  createdBy: string | null;
  reason: string | null;
  createdAt: string;
  expiresAt: string | null;
  liftedAt: string | null;
}

/** Eigene Chat-Beschränkung, für den Hinweis anstelle des Eingabefelds. */
export interface ChatRestriction {
  restricted: boolean;
  reason: string | null;
  /** null = permanent. */
  expiresAt: string | null;
}

export type ModerationAction =
  | { type: "delete"; messageId: number }
  | { type: "timeout"; userId: string; minutes: number; reason?: string }
  | { type: "ban"; userId: string; reason?: string }
  | { type: "unban"; userId: string };

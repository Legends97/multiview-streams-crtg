export type SocialPlatform =
  | "twitch"
  | "youtube"
  | "instagram"
  | "discord"
  | "x"
  | "tiktok"
  | "website";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  url?: string;
  tier: "main" | "partner";
}

export interface ScheduleEntry {
  label: string;
  /** ISO-8601 mit Zeitzonen-Offset. */
  at: string;
  /** Dauer in Minuten, falls bekannt. Wird im Zeitplan angezeigt. */
  durationMinutes?: number;
}

/** Eckdaten des Formats, als Beschriftung/Wert-Paare. */
export interface EventFact {
  label: string;
  value: string;
}

/** Texte und Links der Event-Seite, aus src/config/event.ts. */
export interface EventConfig {
  title: string;
  subtitle: string;
  description: string;
  teamDescription: string;
  facts: EventFact[];
  schedule: ScheduleEntry[];
  social: SocialLink[];
  sponsors: Sponsor[];
}

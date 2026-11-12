import { AtSign, Camera, Globe, Headphones, Music, Tv, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { SocialPlatform } from "@/types/event";

/**
 * Icons für Social-Media-Links.
 * Lucide führt keine Markenlogos mehr, daher generische, eindeutige Symbole.
 */
const PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  twitch: Tv,
  youtube: Video,
  instagram: Camera,
  discord: Headphones,
  x: AtSign,
  tiktok: Music,
  website: Globe,
};

export function getSocialIcon(platform: SocialPlatform): LucideIcon {
  return PLATFORM_ICONS[platform];
}

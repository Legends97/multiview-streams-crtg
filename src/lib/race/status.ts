import { Car, CircleDot, Flag, FlagTriangleRight, Clock, OctagonAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { RaceStatus } from "@/types/race";

type BadgeVariant = "neutral" | "accent" | "warning" | "muted" | "accentSoft";

export interface RaceStatusMeta {
  label: string;
  short: string;
  variant: BadgeVariant;
  icon: LucideIcon;
  /** Zeigt der Live-Indikator Aktivität an? */
  live: boolean;
  description: string;
}

/**
 * Darstellung der Rennstatus. Jeder Status trägt Farbe, Text UND Icon,
 * damit die Information nicht allein über Farbe vermittelt wird
 * (docs/03-design-system.md, Abschnitt 7).
 */
export const RACE_STATUS_META: Record<RaceStatus, RaceStatusMeta> = {
  UPCOMING: {
    label: "Vor dem Start",
    short: "UPCOMING",
    variant: "neutral",
    icon: Clock,
    live: false,
    description: "Das Rennen hat noch nicht begonnen.",
  },
  LIVE: {
    label: "Rennen läuft",
    short: "LIVE",
    variant: "accent",
    icon: CircleDot,
    live: true,
    description: "Grüne Flagge, das Rennen läuft.",
  },
  FULL_COURSE_YELLOW: {
    label: "Full Course Yellow",
    short: "FCY",
    variant: "warning",
    icon: FlagTriangleRight,
    live: true,
    description: "Gelbphase auf der gesamten Strecke, Tempolimit.",
  },
  SAFETY_CAR: {
    label: "Safety Car",
    short: "SAFETY CAR",
    variant: "warning",
    icon: Car,
    live: true,
    description: "Safety Car auf der Strecke, Feld wird zusammengeführt.",
  },
  RED_FLAG: {
    label: "Rote Flagge",
    short: "RED FLAG",
    variant: "accentSoft",
    icon: OctagonAlert,
    live: true,
    description: "Rennen unterbrochen.",
  },
  FINISHED: {
    label: "Zielflagge",
    short: "FINISHED",
    variant: "muted",
    icon: Flag,
    live: false,
    description: "Das Rennen ist beendet.",
  },
};

export function getRaceStatusMeta(status: RaceStatus): RaceStatusMeta {
  return RACE_STATUS_META[status];
}

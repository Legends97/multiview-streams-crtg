import { CalendarDays, Flag, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

/** Hauptnavigation im Header. */
export const mainNav: NavItem[] = [
  {
    href: "/live",
    label: "Live",
    icon: Radio,
    description: "Multistream-Übertragung aller Fahrer",
  },
  {
    href: "/race",
    label: "Rennen",
    icon: Flag,
    description: "Rennstatus, Rennzeit und Fahrerwechsel",
  },
  {
    href: "/event",
    label: "Event",
    icon: CalendarDays,
    description: "Team, Fahrzeug, Strecke und Sponsoren",
  },
];

/** Navigation im Admin-Bereich. Zugriff wird serverseitig geprüft. */
export const adminNav = [
  { href: "/admin", label: "Übersicht", minRole: "admin" as const },
  { href: "/admin/users", label: "Benutzer", minRole: "admin" as const },
  { href: "/admin/chat", label: "Chat", minRole: "moderator" as const },
  { href: "/admin/race", label: "Rennen", minRole: "admin" as const },
  { href: "/admin/drivers", label: "Fahrer", minRole: "admin" as const },
];

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Klassen zusammenführen, spätere Tailwind-Utilities gewinnen. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

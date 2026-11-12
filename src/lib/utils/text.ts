/**
 * Initialen eines Namens, z. B. "Chaos Racing Team Germany" -> "CRT".
 * Dient als Markenzeichen, wenn keine Startnummer vorhanden ist.
 */
export function initials(name: string, max = 3): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, max)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

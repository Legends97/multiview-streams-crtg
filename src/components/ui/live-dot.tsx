import { cn } from "@/lib/utils/cn";

/**
 * Pulsierender Live-Punkt. Das einzige Element in der Anwendung, das
 * dauerhaft animiert ist (siehe docs/03-design-system.md, Abschnitt 4).
 */
export function LiveDot({
  className,
  active = true,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        active ? "bg-accent animate-live-pulse" : "bg-subtle",
        className,
      )}
    />
  );
}

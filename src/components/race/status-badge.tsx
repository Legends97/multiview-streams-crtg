import { Badge } from "@/components/ui/badge";
import { LiveDot } from "@/components/ui/live-dot";
import { getRaceStatusMeta } from "@/lib/race/status";
import { cn } from "@/lib/utils/cn";
import type { RaceStatus } from "@/types/race";

/**
 * Rennstatus als Badge mit Farbe, Text und Icon.
 * Bei LIVE zusätzlich der pulsierende Punkt.
 */
export function StatusBadge({
  status,
  className,
  showIcon = true,
}: {
  status: RaceStatus;
  className?: string;
  showIcon?: boolean;
}) {
  const meta = getRaceStatusMeta(status);
  const Icon = meta.icon;

  return (
    <Badge variant={meta.variant} className={cn("gap-1.5", className)}>
      {status === "LIVE" ? (
        <LiveDot className="bg-foreground" />
      ) : showIcon ? (
        <Icon className="size-3" aria-hidden="true" />
      ) : null}
      {meta.short}
    </Badge>
  );
}

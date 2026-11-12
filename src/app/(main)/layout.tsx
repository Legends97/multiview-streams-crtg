import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getFallbackRaceState } from "@/lib/race/state";

/**
 * Broadcast-Layout: Header, Inhalt, Footer.
 * Der Rennstatus kommt aus race_state, mit Fallback aus der Konfiguration.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const raceState = getFallbackRaceState();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader status={raceState.status} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </TooltipProvider>
  );
}

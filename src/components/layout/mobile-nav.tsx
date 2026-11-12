"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

/** Navigation für schmale Viewports. Schliesst sich bei Routenwechsel. */
export function MobileNav() {
  const pathname = usePathname();
  // Der Pfad, zu dem der geöffnete Zustand gehört. Wechselt die Route,
  // gilt das Menü als geschlossen — abgeleitet im Render statt per Effekt.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setOpenedAt(next ? pathname : null)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Navigation öffnen" className="md:hidden">
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Navigation</DialogTitle>
          <DialogDescription>Bereiche der Übertragung</DialogDescription>
        </DialogHeader>
        <nav className="flex flex-col p-2">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-start gap-3 rounded-sm px-3 py-3 transition-colors",
                  isActive ? "bg-accent-soft text-foreground" : "text-foreground hover:bg-card-hover",
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium uppercase tracking-wide">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

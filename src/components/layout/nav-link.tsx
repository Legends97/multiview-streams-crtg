"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

/** Navigationslink mit aktivem Zustand anhand des aktuellen Pfads. */
export function NavLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative rounded-sm px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-[120ms]",
        isActive ? "text-foreground" : "text-muted hover:text-foreground",
        className,
      )}
    >
      {children}
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-px h-0.5 bg-accent"
        />
      ) : null}
    </Link>
  );
}

import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-card text-muted border border-border",
        accent: "bg-accent text-foreground border border-white/15",
        accentSoft: "bg-accent-soft text-foreground border border-accent",
        purple: "bg-purple-soft text-foreground border border-purple",
        danger: "bg-danger text-foreground",
        warning: "bg-warning text-background",
        success: "bg-success/15 text-success border border-success/30",
        muted: "bg-surface text-subtle border border-border",
        outline: "border border-border-strong text-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };

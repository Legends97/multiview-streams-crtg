import type * as React from "react";

import { cn } from "@/lib/utils/cn";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground",
        "placeholder:text-subtle",
        "transition-colors duration-[120ms] ease-[var(--ease-standard)]",
        "hover:border-border-strong focus:border-accent focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground",
        "placeholder:text-subtle",
        "transition-colors duration-[120ms] ease-[var(--ease-standard)]",
        "hover:border-border-strong focus:border-accent focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-accent",
        className,
      )}
      {...props}
    />
  );
}

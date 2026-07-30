"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/70 transition-colors focus-visible:border-[var(--color-accent)]/70 focus-visible:outline-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

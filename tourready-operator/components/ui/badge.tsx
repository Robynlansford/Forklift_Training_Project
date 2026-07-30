import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        neutral:
          "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]",
        accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30",
        go: "bg-[rgba(34,197,94,0.12)] text-[var(--color-go)] border border-[rgba(34,197,94,0.3)]",
        caution:
          "bg-[rgba(245,158,11,0.12)] text-[var(--color-caution)] border border-[rgba(245,158,11,0.3)]",
        danger:
          "bg-[rgba(239,68,68,0.12)] text-[var(--color-hardstop)] border border-[rgba(239,68,68,0.3)]",
        blocker:
          "bg-[rgba(220,38,38,0.14)] text-[#fca5a5] border border-[rgba(220,38,38,0.4)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

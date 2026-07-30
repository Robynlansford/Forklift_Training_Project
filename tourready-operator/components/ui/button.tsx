"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-black hover:bg-[#fb8a3c] shadow-[0_6px_20px_-8px_rgba(249,115,22,0.6)]",
        secondary:
          "bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/60 hover:bg-[#243042]",
        ghost:
          "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5",
        outline:
          "border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/60 hover:bg-white/5",
        danger:
          "bg-[var(--color-hardstop)] text-white hover:bg-[#f15a5a]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };

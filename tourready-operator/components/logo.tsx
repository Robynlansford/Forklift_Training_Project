import { cn } from "@/lib/utils";

/** Wordmark + glyph. The glyph is a stylized boom/fork silhouette in safety orange. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-2)] ring-1 ring-[var(--color-border)]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 20h7v-3H6v-4l9-4 5 2"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6.5" cy="20.5" r="1.6" fill="var(--color-text)" />
          <circle cx="11.5" cy="20.5" r="1.6" fill="var(--color-text)" />
          <path
            d="M20 11l-2 9"
            stroke="var(--color-muted)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="beacon-dot absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="type-display text-[17px] tracking-[0.04em] text-[var(--color-text)]">
          TourReady<span className="text-[var(--color-accent)]"> Operator</span>
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Concert &amp; Festival Lift Cert
        </span>
      </span>
    </span>
  );
}

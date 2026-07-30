import { Radio, Dumbbell, ShieldX } from "lucide-react";
import type { Callout as CalloutData, CalloutKind } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

const STYLES: Record<
  CalloutKind,
  { label: string; icon: typeof Radio; accent: string; ring: string; bg: string }
> = {
  "tour-reality": {
    label: "Tour Reality",
    icon: Radio,
    accent: "var(--color-accent)",
    ring: "rgba(249,115,22,0.35)",
    bg: "rgba(249,115,22,0.07)",
  },
  "core-drill": {
    label: "Core Drill",
    icon: Dumbbell,
    accent: "#60a5fa",
    ring: "rgba(96,165,250,0.35)",
    bg: "rgba(96,165,250,0.07)",
  },
  "hard-rule": {
    label: "Hard Rule",
    icon: ShieldX,
    accent: "var(--color-hardstop)",
    ring: "rgba(239,68,68,0.35)",
    bg: "rgba(239,68,68,0.07)",
  },
};

export function Callout({ data }: { data: CalloutData }) {
  const s = STYLES[data.kind];
  const Icon = s.icon;
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border p-4 pl-5")}
      style={{ borderColor: s.ring, background: s.bg }}
      role="note"
    >
      <span
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: s.accent }}
        aria-hidden="true"
      />
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: s.accent }} aria-hidden="true" />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: s.accent }}
        >
          {s.label}
        </span>
        <span className="text-sm font-semibold text-[var(--color-text)]">
          · {data.title}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-text)]/85">
        {data.body}
      </p>
    </div>
  );
}

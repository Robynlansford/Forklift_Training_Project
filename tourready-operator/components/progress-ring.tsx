"use client";

import { motion } from "framer-motion";

/** Animated circular progress indicator. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 9,
  label,
  sublabel,
  color = "var(--color-accent)",
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Progress"}: ${Math.round(clamped)} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
          opacity={0.4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && (
          <span className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import type { Module } from "@/lib/curriculum";
import { moduleImage } from "@/lib/module-images";
import { ModuleIcon } from "./icon";
import { StatusPill } from "./status-pill";
import type { ModuleScore } from "@/lib/store";
import { moduleStatus } from "@/lib/store";

export function ModuleCard({
  module,
  scores,
  index,
}: {
  module: Module;
  scores: Record<string, ModuleScore>;
  index: number;
}) {
  const status = moduleStatus(module, scores);
  const score = scores[module.slug];
  const pct = score ? Math.round((score.pass / score.total) * 100) : null;
  const isCapstone = module.slug === "capstone";
  const photo = moduleImage(module.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/modules/${module.slug}`}
        className="group block h-full rounded-[var(--radius-card)]"
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] transition-colors ${
            isCapstone
              ? "border-[var(--color-accent)]/40 group-hover:border-[var(--color-accent)]"
              : "border-[var(--color-border)]/70 group-hover:border-[var(--color-accent)]/50"
          }`}
        >
          {isCapstone && (
            <span className="absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_70%)]" />
          )}

          {photo && (
            <div className="relative -mx-5 -mt-5 mb-4 h-32 overflow-hidden bg-[var(--color-surface-2)]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {/* Fade the plate into the card so the icon row reads cleanly */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/25 to-transparent" />
            </div>
          )}

          <div className="mb-4 flex items-start justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-[var(--color-border)] ${
                status === "passed"
                  ? "bg-[rgba(34,197,94,0.1)]"
                  : "bg-[var(--color-surface-2)]"
              }`}
            >
              <ModuleIcon
                name={module.icon}
                className={`h-5 w-5 ${
                  status === "passed"
                    ? "text-[var(--color-go)]"
                    : "text-[var(--color-accent)]"
                }`}
              />
            </div>
            <StatusPill status={status} />
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {isCapstone ? "Final" : `Module ${module.id}`}
            </span>
          </div>
          <h3 className="text-[15px] font-bold leading-snug tracking-tight text-[var(--color-text)]">
            {module.title}
          </h3>
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
            {module.summary}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)]/50 pt-3.5">
            <span className="flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {module.readMinutes}m
              </span>
              <span>{module.scenarios.length} scenarios</span>
              {pct !== null && (
                <span
                  className={
                    status === "passed"
                      ? "font-semibold text-[var(--color-go)]"
                      : "font-semibold text-[var(--color-hardstop)]"
                  }
                >
                  {pct}%
                </span>
              )}
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--color-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

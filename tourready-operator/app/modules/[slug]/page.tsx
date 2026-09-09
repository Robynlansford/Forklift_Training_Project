"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Target, AlertTriangle } from "lucide-react";
import { MODULES, getModule, moduleThreshold } from "@/lib/curriculum";
import { useProgress, moduleStatus } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { ModuleIcon } from "@/components/icon";
import { ModuleContent } from "@/components/module-content";
import { ScenarioTrainer } from "@/components/scenario-trainer";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";

export default function ModulePage() {
  const params = useParams<{ slug: string }>();
  const hydrated = useHydrated();
  const scores = useProgress((s) => s.scores);

  const module = getModule(params.slug);
  if (!module) return notFound();

  const idx = MODULES.findIndex((m) => m.slug === module.slug);
  const prev = idx > 0 ? MODULES[idx - 1] : null;
  const next = idx < MODULES.length - 1 ? MODULES[idx + 1] : null;
  const status = hydrated ? moduleStatus(module, scores) : "not-started";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Training Hub
      </Link>

      {/* Header */}
      <header className="mt-6 border-b border-[var(--color-border)]/60 pb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]/30">
            <ModuleIcon name={module.icon} className="h-7 w-7 text-[var(--color-accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {module.slug === "capstone" ? "Final Assessment" : `Module ${module.id}`}
              </span>
              <StatusPill status={status} />
            </div>
            <h1 className="type-display mt-1.5 text-4xl sm:text-5xl">{module.title}</h1>
            <p className="mt-1 text-[var(--color-muted)]">{module.subtitle}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {module.readMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="h-4 w-4" /> {module.scenarios.length} scenarios ·{" "}
            {Math.round(moduleThreshold(module) * 100)}% to pass
          </span>
        </div>
      </header>

      {/* Why it matters */}
      <div className="mt-8 flex gap-3.5 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)] p-5">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[var(--color-accent)]" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Why this matters
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-[var(--color-text)]/90">
            {module.whyItMatters}
          </p>
        </div>
      </div>

      {/* Theory */}
      <div className="mt-12">
        <h2 className="sr-only">Module briefing</h2>
        <ModuleContent module={module} />
      </div>

      {/* Trainer */}
      <div className="mt-14">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]/60" />
          <span className="type-eyebrow text-[var(--color-accent)]">
            Deliberate Practice
          </span>
          <div className="h-px flex-1 bg-[var(--color-border)]/60" />
        </div>
        <ScenarioTrainer module={module} />
      </div>

      {/* Prev / Next */}
      <nav className="mt-12 flex flex-col gap-3 border-t border-[var(--color-border)]/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <Link href={`/modules/${prev.slug}`} className="group min-w-0 sm:max-w-[48%]">
            <Button variant="secondary" className="w-full max-w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{prev.title}</span>
            </Button>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link href={`/modules/${next.slug}`} className="group min-w-0 sm:max-w-[48%]">
            <Button variant="primary" className="w-full max-w-full sm:w-auto">
              <span className="truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Button>
          </Link>
        ) : (
          <Link href="/certificate" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              Get Certified <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </nav>
    </div>
  );
}

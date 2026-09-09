"use client";

import Link from "next/link";
import { Lock, ArrowRight, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { MODULES, TOTAL_SCENARIOS, moduleThreshold } from "@/lib/curriculum";
import { useProgress, moduleStatus, overallProgress } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { CertificateCard } from "@/components/certificate-card";
import { ProgressRing } from "@/components/progress-ring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/status-pill";

export default function CertificatePage() {
  const hydrated = useHydrated();
  const { operatorName, scores, certificateId, certificateIssuedAt, setOperatorName } =
    useProgress();
  const overall = overallProgress(scores);

  const totalCorrect = Object.values(scores).reduce((a, b) => a + b.pass, 0);
  const lastCompletedAt = Object.values(scores)
    .map((s) => s.completedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  // Weak areas: techniques the operator missed, grouped by module.
  const weakAreas = MODULES.flatMap((m) => {
    const s = scores[m.slug];
    if (!s) return [];
    return m.scenarios
      .filter((sc) => s.verdicts[sc.id] === "FAIL")
      .map((sc) => ({ module: m.title, slug: m.slug, technique: sc.technique }));
  });

  const issuedSource = certificateIssuedAt || lastCompletedAt || "";
  const issueDate = issuedSource
    ? new Date(issuedSource).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const nextIncomplete =
    MODULES.find((m) => moduleStatus(m, scores) !== "passed") ?? MODULES[0];

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-[var(--color-muted)] sm:px-6 lg:px-8">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="type-display text-4xl sm:text-5xl">Certification &amp; Progress</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Pass all {MODULES.length} modules to issue your verifiable Tour-Ready Operator credential.
      </p>

      {overall.certified ? (
        <div className="mt-8 space-y-6">
          <Card className="p-5 no-print">
            <label className="block max-w-md">
              <span className="text-[13px] font-medium">Name on certificate</span>
              <Input
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2"
              />
            </label>
          </Card>
          <CertificateCard
            name={operatorName}
            certId={certificateId ?? "TRO-PENDING"}
            date={issueDate}
            totalScenarios={TOTAL_SCENARIOS}
            correct={totalCorrect}
          />
        </div>
      ) : (
        <Card className="mt-8 flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <ProgressRing
            value={overall.percent}
            label={`${overall.passedModules}/${overall.totalModules}`}
            sublabel="Modules"
          />
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
              <Lock className="h-3.5 w-3.5" /> Certificate locked
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              {overall.passedModules} of {overall.totalModules} modules passed
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
              {overall.passedModules === 0
                ? "No modules started. The credential stays locked until every module is passed. Open the Training Hub and begin with Module 0."
                : weakAreas.length > 0
                  ? "Your credential issues automatically the moment every module is passed. Review the missed techniques below, then continue training."
                  : "Your credential issues automatically the moment every module is passed. Finish the remaining modules — no failed scenarios are on record."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link href={`/modules/${nextIncomplete.slug}`}>
                <Button>
                  {overall.passedModules === 0 ? "Start Module 0" : "Continue Training"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Training Hub</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Progress history */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold tracking-tight">Module Progress</h2>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]/70">
          {MODULES.map((m, i) => {
            const s = scores[m.slug];
            const status = moduleStatus(m, scores);
            const pct = s ? Math.round((s.pass / s.total) * 100) : null;
            return (
              <Link
                key={m.slug}
                href={`/modules/${m.slug}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/5 ${
                  i !== 0 ? "border-t border-[var(--color-border)]/50" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {s
                      ? `${s.pass}/${s.total} correct · pass mark ${Math.round(
                          moduleThreshold(m) * 100
                        )}%`
                      : "Not started"}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  {pct !== null && (
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        status === "passed"
                          ? "text-[var(--color-go)]"
                          : "text-[var(--color-hardstop)]"
                      }`}
                    >
                      {pct}%
                    </span>
                  )}
                  <StatusPill status={status} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-xl font-bold tracking-tight">Recommended Review</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {weakAreas.map((w, i) => (
              <Link
                key={`${w.slug}-${i}`}
                href={`/modules/${w.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-[var(--color-hardstop)]/30 bg-[rgba(239,68,68,0.06)] px-4 py-3 transition-colors hover:border-[var(--color-hardstop)]/50"
              >
                <XCircle className="h-4 w-4 flex-shrink-0 text-[var(--color-hardstop)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{w.technique}</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{w.module}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {weakAreas.length === 0 && Object.keys(scores).length > 0 && !overall.certified && (
        <p className="mt-8 flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-go)]" />
          No failed scenarios on record — finish the remaining modules to certify.
        </p>
      )}
    </div>
  );
}

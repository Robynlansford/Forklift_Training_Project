"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  MessageSquare,
  Download,
  Upload,
  RotateCcw,
  Award,
  ChevronRight,
  FolderDown,
  FolderCog,
} from "lucide-react";
import { MODULES, TOTAL_SCENARIOS } from "@/lib/curriculum";
import { useProgress, moduleStatus, overallProgress } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  saveCertificationRecord,
  supportsFolderSave,
} from "@/lib/certification-file";
import { ModuleCard } from "@/components/module-card";
import { ProgressRing } from "@/components/progress-ring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export default function Dashboard() {
  const hydrated = useHydrated();
  const { operatorName, scores, certificateId, setOperatorName, resetAll, importState } =
    useProgress();
  const fileRef = useRef<HTMLInputElement>(null);

  const overall = overallProgress(scores);
  const totalCorrect = overall.totalCorrect;

  // Folder-save support is browser-dependent; detect after mount to avoid SSR mismatch.
  const [canFolderSave, setCanFolderSave] = useState(false);
  useEffect(() => setCanFolderSave(supportsFolderSave()), []);

  function buildRecord(name: string) {
    return {
      operatorName: name,
      certificateId,
      certified: overall.certified,
      savedAt: new Date().toISOString(),
      summary: {
        passedModules: overall.passedModules,
        totalModules: overall.totalModules,
        totalCorrect: overall.totalCorrect,
        totalScenarios: TOTAL_SCENARIOS,
        percent: overall.percent,
      },
      modules: MODULES.map((m) => {
        const s = scores[m.slug];
        return {
          id: m.id,
          slug: m.slug,
          title: m.title,
          status: moduleStatus(m, scores),
          pass: s?.pass ?? 0,
          total: s?.total ?? m.scenarios.length,
          percent: s ? Math.round((s.pass / s.total) * 100) : 0,
        };
      }),
      // Kept at top level so the file can also be re-imported via "Import".
      scores,
    };
  }

  async function saveRecord(forcePick = false) {
    const name = operatorName.trim();
    if (!name) {
      toast.error("Enter an operator name first");
      return;
    }
    const res = await saveCertificationRecord(name, buildRecord(name), forcePick);
    if (res.ok && res.fallback) {
      toast.success(`Downloaded ${res.fileName} — folder saving needs Chrome or Edge`);
    } else if (res.ok) {
      toast.success(`Saved ${res.fileName} → certification_status`);
    } else if (res.error === "cancelled") {
      // user dismissed the picker — no toast
    } else {
      toast.error(`Save failed: ${res.error ?? "unknown error"}`);
    }
  }

  // First module that isn't passed yet → "Continue Training" target.
  const nextModule =
    MODULES.find((m) => moduleStatus(m, scores) !== "passed") ?? MODULES[MODULES.length - 1];

  function exportJson() {
    const data = JSON.stringify({ operatorName, scores, certificateId }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tourready-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progress exported");
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        importState(parsed);
        toast.success("Progress imported");
      } catch {
        toast.error("Invalid progress file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="type-display text-4xl sm:text-5xl">Training Hub</h1>
          <p className="mt-1.5 text-[var(--color-muted)]">
            {hydrated && operatorName.trim()
              ? `Welcome back, ${operatorName.trim().split(/\s+/)[0]} — your path to a Tour-Ready Operator credential.`
              : "Your path to a Tour-Ready Operator credential."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="ghost" size="sm" onClick={() => saveRecord(false)}>
            <FolderDown className="h-4 w-4" /> Save Record
          </Button>
          {canFolderSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveRecord(true)}
              title="Pick a different folder, then save"
              aria-label="Change save folder"
            >
              <FolderCog className="h-4 w-4" /> Folder
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={exportJson}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Reset all progress on this device? This cannot be undone.")) {
                resetAll();
                toast.info("Progress reset");
              }
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Status + Quick actions */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-7">
          <ProgressRing
            value={hydrated ? overall.percent : 0}
            label={hydrated ? `${overall.passedModules}/${overall.totalModules}` : "—"}
            sublabel="Modules"
            color={overall.certified ? "var(--color-go)" : "var(--color-accent)"}
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-lg font-bold tracking-tight">Certification status</h2>
              {hydrated && overall.certified ? (
                <Badge variant="go">
                  <Award className="h-3 w-3" /> Certified
                </Badge>
              ) : (
                <Badge variant="accent">In progress</Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
              {hydrated
                ? overall.certified
                  ? "Every module passed. Your Tour-Ready Operator credential is ready to issue."
                  : `${overall.passedModules} of ${overall.totalModules} modules passed · ${totalCorrect}/${TOTAL_SCENARIOS} scenarios correct. Keep going.`
                : "Loading your progress…"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link href={`/modules/${nextModule.slug}`}>
                <Button size="sm">
                  Continue Training <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {hydrated && overall.certified && (
                <Link href="/certificate">
                  <Button size="sm" variant="secondary">
                    View Certificate
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <QuickAction
            href="/simulator"
            icon={Calculator}
            title="Safety Engine"
            body="Run lift conditions through the live derating engine."
          />
          <QuickAction
            href="/resources"
            icon={MessageSquare}
            title="Knowledge Base"
            body="Every named technique + the Quick-Reference Rule Card."
          />
          <Card className="p-5 sm:col-span-2">
            <label className="block">
              <span className="text-[13px] font-medium text-[var(--color-text)]">
                Operator name
              </span>
              <Input
                value={hydrated ? operatorName : ""}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Jordan Rivera"
                className="mt-2"
              />
              <span className="mt-2 block text-xs leading-relaxed text-[var(--color-muted)]">
                Personalizes your trainer feedback and appears on your certificate and saved
                records.
              </span>
            </label>
          </Card>
        </div>
      </div>

      {/* Modules grid */}
      <div className="mt-12 mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Curriculum</h2>
        <span className="text-xs text-[var(--color-muted)]">
          {MODULES.length} modules · pass each to certify
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => (
          <ModuleCard key={m.slug} module={m} scores={hydrated ? scores : {}} index={i} />
        ))}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: typeof Calculator;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="group">
      <motion.div whileHover={{ y: -3 }} className="h-full">
        <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-[var(--color-accent)]/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]/30">
            <Icon className="h-5 w-5 text-[var(--color-accent)]" />
          </div>
          <h3 className="flex items-center gap-1 text-sm font-bold tracking-tight">
            {title}
            <ChevronRight className="h-3.5 w-3.5 text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5" />
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">{body}</p>
        </Card>
      </motion.div>
    </Link>
  );
}

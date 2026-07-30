"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MODULES, moduleThreshold, type Module } from "./curriculum";

export interface ModuleScore {
  /** Number of scenarios passed in the most recent attempt. */
  pass: number;
  /** Total scenarios graded in the most recent attempt. */
  total: number;
  /** ISO timestamp of the attempt. */
  completedAt: string;
  /** Per-scenario verdicts, keyed by scenario id. */
  verdicts: Record<string, "PASS" | "FAIL">;
}

export interface ProgressState {
  operatorName: string;
  /** Per-module score keyed by module slug. */
  scores: Record<string, ModuleScore>;
  /** Stable per-device certification id (assigned on first certification). */
  certificateId: string | null;
  setOperatorName: (name: string) => void;
  recordModule: (slug: string, score: ModuleScore) => void;
  resetModule: (slug: string) => void;
  resetAll: () => void;
  importState: (data: Partial<ProgressState>) => void;
  /** Internal: tracks whether the persisted state has rehydrated. */
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

function makeCertId(): string {
  // Deterministic-ish readable id without external deps.
  const seed = Math.floor(performance.now() + Math.random() * 1e9)
    .toString(36)
    .toUpperCase();
  return `TRO-${seed.slice(0, 4)}-${seed.slice(4, 8).padEnd(4, "X")}`;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      operatorName: "",
      scores: {},
      certificateId: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setOperatorName: (name) => set({ operatorName: name }),
      recordModule: (slug, score) => {
        set((s) => ({ scores: { ...s.scores, [slug]: score } }));
        // Assign a certificate id the first time the operator becomes fully certified.
        const { scores, certificateId } = get();
        const allPassed = MODULES.every((m) => {
          const sc = m.slug === slug ? score : scores[m.slug];
          return sc && sc.pass / sc.total >= moduleThreshold(m);
        });
        if (allPassed && !certificateId) {
          set({ certificateId: makeCertId() });
        }
      },
      resetModule: (slug) =>
        set((s) => {
          const next = { ...s.scores };
          delete next[slug];
          return { scores: next };
        }),
      resetAll: () => set({ scores: {}, certificateId: null }),
      importState: (data) =>
        set((s) => ({
          operatorName: data.operatorName ?? s.operatorName,
          scores: data.scores ?? s.scores,
          certificateId: data.certificateId ?? s.certificateId,
        })),
    }),
    {
      name: "tourready-progress-v1",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ── Derived selectors (pure helpers) ────────────────────────────────────────

export function moduleStatus(
  module: Module,
  scores: Record<string, ModuleScore>
): "not-started" | "in-progress" | "passed" | "retry" {
  const s = scores[module.slug];
  if (!s) return "not-started";
  const ratio = s.pass / s.total;
  if (ratio >= moduleThreshold(module)) return "passed";
  return "retry";
}

export function overallProgress(scores: Record<string, ModuleScore>) {
  const passedModules = MODULES.filter((m) => moduleStatus(m, scores) === "passed").length;
  const certified = passedModules === MODULES.length;
  const totalCorrect = Object.values(scores).reduce((a, b) => a + b.pass, 0);
  return {
    passedModules,
    totalModules: MODULES.length,
    certified,
    totalCorrect,
    percent: Math.round((passedModules / MODULES.length) * 100),
  };
}

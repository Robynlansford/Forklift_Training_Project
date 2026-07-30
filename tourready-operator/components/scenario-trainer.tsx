"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  WifiOff,
  ArrowRight,
  Trophy,
} from "lucide-react";
import type { Module } from "@/lib/curriculum";
import { moduleThreshold } from "@/lib/curriculum";
import { gradeOffline, MIN_ANSWER_LENGTH, type GradeResult } from "@/lib/grading";
import { useProgress, type ModuleScore } from "@/lib/store";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

interface ChatMsg {
  id: string;
  role: "ai" | "user";
  text: string;
  verdict?: GradeResult;
  meta?: string;
}

type Phase = "intro" | "scenario" | "grading" | "done";

export function ScenarioTrainer({ module }: { module: Module }) {
  const recordModule = useProgress((s) => s.recordModule);
  const operatorName = useProgress((s) => s.operatorName);
  const firstName = operatorName.trim().split(/\s+/)[0] || "";
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [verdicts, setVerdicts] = useState<Record<string, "PASS" | "FAIL">>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const threshold = moduleThreshold(module);
  const total = module.scenarios.length;
  const passCount = Object.values(verdicts).filter((v) => v === "PASS").length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  function push(msg: Omit<ChatMsg, "id">) {
    setMessages((m) => [...m, { ...msg, id: `${Date.now()}-${Math.random()}` }]);
  }

  function begin() {
    setPhase("scenario");
    setQIndex(0);
    setVerdicts({});
    setMessages([
      {
        id: "start",
        role: "ai",
        text: `${firstName ? `${firstName} — ` : ""}${module.title}. ${total} field scenarios — no multiple choice. Answer each one exactly as you would on the floor. Here's the first.`,
      },
    ]);
    setTimeout(() => askScenario(0), 350);
  }

  function askScenario(i: number) {
    const sc = module.scenarios[i];
    push({
      role: "ai",
      text: sc.prompt,
      meta: `Scenario ${i + 1} of ${total} · drilling: ${sc.technique}`,
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function submit() {
    const answer = input.trim();
    if (answer.length < MIN_ANSWER_LENGTH || phase !== "scenario") return;
    const sc = module.scenarios[qIndex];

    push({ role: "user", text: answer });
    setInput("");
    setPhase("grading");

    // 1) Instant, offline-deterministic baseline grade.
    const offline = gradeOffline(sc, answer);

    // 2) Optional AI nuance layer (falls back gracefully).
    let result: GradeResult = offline;
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: sc.prompt,
          technique: sc.technique,
          concept: sc.concept,
          passKeywords: sc.passKeywords,
          failKeywords: sc.failKeywords,
          answer,
          offlineVerdict: offline.verdict,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as Partial<GradeResult>;
        if (data.verdict && data.feedback) {
          result = {
            verdict: data.verdict,
            feedback: data.feedback,
            technique: sc.technique,
            source: "ai",
          };
        }
      }
    } catch {
      // network unavailable — keep the offline result (venue-reliable)
    }

    const nextVerdicts = { ...verdicts, [sc.id]: result.verdict };
    setVerdicts(nextVerdicts);
    push({ role: "ai", text: result.feedback, verdict: result });

    const isLast = qIndex >= total - 1;
    if (isLast) {
      finish(nextVerdicts);
    } else {
      setPhase("scenario");
      const next = qIndex + 1;
      setQIndex(next);
      setTimeout(() => askScenario(next), 600);
    }
  }

  function finish(finalVerdicts: Record<string, "PASS" | "FAIL">) {
    const pass = Object.values(finalVerdicts).filter((v) => v === "PASS").length;
    const score: ModuleScore = {
      pass,
      total,
      completedAt: new Date().toISOString(),
      verdicts: finalVerdicts,
    };
    recordModule(module.slug, score);
    setPhase("done");
  }

  function restart() {
    setMessages([]);
    setPhase("intro");
    setQIndex(0);
    setVerdicts({});
  }

  const pct = Math.round((passCount / total) * 100);
  const passed = passCount / total >= threshold;
  const needed = Math.ceil(threshold * total);

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
          <span className="text-sm font-semibold">Interactive Scenario Trainer</span>
        </div>
        {phase !== "intro" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-muted)]">
              {passCount}/{total} correct
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-border)]">
              <motion.div
                className="h-full rounded-full bg-[var(--color-accent)]"
                animate={{ width: `${(Object.keys(verdicts).length / total) * 100}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      {phase === "intro" ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]/30">
            <Sparkles className="h-6 w-6 text-[var(--color-accent)]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">Begin Interactive Scenarios</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
            {total} real situations from the floor. Type your decision — the trainer grades it
            against the named technique and gives you instructor-level feedback.
            {" "}Pass mark: {Math.round(threshold * 100)}%.
          </p>
          <Button size="lg" className="mt-6" onClick={begin}>
            Start {total} Scenarios <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : phase === "done" ? (
        <ResultPanel
          passed={passed}
          pct={pct}
          passCount={passCount}
          total={total}
          needed={needed}
          onRetry={restart}
          module={module}
          verdicts={verdicts}
          firstName={firstName}
        />
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex max-h-[460px] min-h-[320px] flex-col gap-4 overflow-y-auto px-5 py-5"
            aria-live="polite"
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))}
            </AnimatePresence>
            {phase === "grading" && <TypingDots />}
          </div>

          {/* Composer */}
          <div className="border-t border-[var(--color-border)]/60 p-3.5">
            <div className="flex items-end gap-2.5">
              <Textarea
                ref={inputRef}
                rows={1}
                value={input}
                disabled={phase !== "scenario"}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Type your decision exactly as you'd call it on the floor…"
                aria-label="Your decision"
                className="min-h-[44px]"
              />
              <Button
                size="icon"
                onClick={submit}
                disabled={phase !== "scenario" || input.trim().length < MIN_ANSWER_LENGTH}
                aria-label="Submit answer"
                className="h-11 w-11 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          isUser
            ? "bg-[var(--color-accent)] text-black"
            : "bg-[var(--color-surface-2)] text-[var(--color-accent)] ring-1 ring-[var(--color-border)]"
        }`}
        aria-hidden="true"
      >
        {isUser ? "YOU" : "AI"}
      </div>
      <div className={`max-w-[82%] ${isUser ? "items-end" : ""}`}>
        {msg.meta && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {msg.meta}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-[var(--color-accent-soft)] text-[var(--color-text)]"
              : "border border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/50 text-[var(--color-text)]/90"
          }`}
        >
          {msg.verdict && (
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={msg.verdict.verdict === "PASS" ? "go" : "danger"}>
                {msg.verdict.verdict === "PASS" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {msg.verdict.verdict === "PASS" ? "Correct" : "Not Quite"}
              </Badge>
              <span className="text-[11px] font-medium text-[var(--color-muted)]">
                {msg.verdict.technique}
              </span>
              {msg.verdict.source === "offline" && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] text-[var(--color-muted)]"
                  title="Graded offline by the deterministic engine"
                >
                  <WifiOff className="h-3 w-3" /> offline
                </span>
              )}
            </div>
          )}
          {msg.text}
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[10px] font-bold text-[var(--color-accent)] ring-1 ring-[var(--color-border)]">
        AI
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/50 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  );
}

function ResultPanel({
  passed,
  pct,
  passCount,
  total,
  needed,
  onRetry,
  module,
  verdicts,
  firstName,
}: {
  passed: boolean;
  pct: number;
  passCount: number;
  total: number;
  needed: number;
  onRetry: () => void;
  module: Module;
  verdicts: Record<string, "PASS" | "FAIL">;
  firstName: string;
}) {
  const missed = module.scenarios.filter((s) => verdicts[s.id] === "FAIL");
  const mastered = module.scenarios
    .filter((s) => verdicts[s.id] === "PASS")
    .map((s) => s.technique)
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-5 py-10 sm:px-8"
    >
      {/* Verdict header */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${
            passed
              ? "bg-[rgba(34,197,94,0.1)] ring-[var(--color-go)]/30"
              : "bg-[rgba(239,68,68,0.1)] ring-[var(--color-hardstop)]/30"
          }`}
        >
          {passed ? (
            <Trophy className="h-7 w-7 text-[var(--color-go)]" />
          ) : (
            <RotateCcw className="h-7 w-7 text-[var(--color-hardstop)]" />
          )}
        </div>
        <h3 className="type-display text-3xl">
          {passed ? "Module Passed" : "Not Yet — Run It Back"}
        </h3>
        <p className="type-display mt-2 text-5xl text-[var(--color-text)]">
          {passCount}
          <span className="text-[var(--color-muted)]">/{total}</span>{" "}
          <span className="text-2xl text-[var(--color-accent)]">· {pct}%</span>
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
          {passed
            ? `${firstName ? `${firstName}, you` : "You"} demonstrated solid safety fundamentals under pressure.${missed.length ? " Review the misses below, then move on — or replay to lock it in." : " Clean sweep — every scenario correct."}`
            : `${firstName ? `${firstName}, you` : "You"} need ${needed} correct to pass. Safety knowledge has to be automatic under fatigue and pressure. Review your misses below, re-read the briefing, and run it again.`}
        </p>
      </div>

      {/* Where to improve — every missed scenario with the correct call */}
      {missed.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-hardstop)]/25" />
            <span className="type-eyebrow text-[var(--color-hardstop)]">
              Where to improve · {missed.length} missed
            </span>
            <div className="h-px flex-1 bg-[var(--color-hardstop)]/25" />
          </div>
          <ul className="space-y-3">
            {missed.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-xl border border-[var(--color-hardstop)]/25 bg-[rgba(239,68,68,0.05)] p-4"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-hardstop)]" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold tracking-tight text-[var(--color-text)]">
                      {s.technique}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
                      {s.prompt}
                    </p>
                    <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-[var(--color-text)]/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-go)]" />
                      <span>
                        <span className="font-semibold text-[var(--color-go)]">
                          The correct call:
                        </span>{" "}
                        {s.concept}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Techniques locked in */}
      {mastered.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-go)]/25" />
            <span className="type-eyebrow text-[var(--color-go)]">
              Locked in · {mastered.length}
            </span>
            <div className="h-px flex-1 bg-[var(--color-go)]/25" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {mastered.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-go)]/30 bg-[rgba(34,197,94,0.08)] px-3 py-1 text-xs font-medium text-[var(--color-text)]/85"
              >
                <CheckCircle2 className="h-3 w-3 text-[var(--color-go)]" /> {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Button variant={passed ? "secondary" : "primary"} onClick={onRetry}>
          <RotateCcw className="h-4 w-4" /> {passed ? "Replay Scenarios" : "Retry Module"}
        </Button>
      </div>
    </motion.div>
  );
}

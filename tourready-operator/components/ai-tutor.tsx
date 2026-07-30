"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, HardHat } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MODULES } from "@/lib/curriculum";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quiz me on the whole curriculum",
  "Hot Dog vs. Hamburger — when do I use each?",
  "Explain the PIT Classification Trap",
  "Give me a 2:00 AM rigging-zone scenario",
];

export function AiTutor() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const moduleSlug = pathname.startsWith("/modules/")
    ? pathname.split("/modules/")[1]?.split("/")[0]
    : undefined;
  const activeModule = MODULES.find((m) => m.slug === moduleSlug);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, moduleSlug }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("tutor error");
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Connection issue — try that again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI Safety Tutor" : "Open AI Safety Tutor"}
        className="no-print fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-black shadow-[0_8px_30px_-6px_rgba(249,115,22,0.6)]"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="no-print fixed bottom-24 right-6 z-50 flex h-[min(560px,75vh)] w-[min(400px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]"
            role="dialog"
            aria-label="AI Safety Tutor"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]/30">
                <HardHat className="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AI Safety Tutor</p>
                <p className="text-[11px] text-[var(--color-muted)]">
                  {activeModule ? `Context: ${activeModule.title}` : "Full-curriculum instructor"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center pt-6 text-center">
                  <Sparkles className="mb-2 h-6 w-6 text-[var(--color-accent)]" />
                  <p className="text-sm font-medium">Ask anything about safe operation.</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Explain a technique, answer a question, or run a quiz — grounded in the full
                    curriculum and works fully offline.
                  </p>
                  <div className="mt-4 flex w-full flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 px-3 py-2 text-left text-xs text-[var(--color-text)]/85 transition-colors hover:border-[var(--color-accent)]/50 hover:bg-white/5"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-text)]"
                        : "border border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/50 text-[var(--color-text)]/90"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex gap-1.5 px-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-[var(--color-border)]/60 p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Ask the tutor…"
                  aria-label="Message the AI Safety Tutor"
                  className="min-h-[40px]"
                />
                <Button size="icon" onClick={() => send(input)} disabled={busy || !input.trim()} aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

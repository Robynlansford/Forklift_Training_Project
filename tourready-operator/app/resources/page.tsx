"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Printer, BookMarked, ArrowUpRight } from "lucide-react";
import { TECHNIQUES, QUICK_REFERENCE, type TechniqueCard } from "@/lib/glossary";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "All",
  ...Array.from(new Set(TECHNIQUES.map((t) => t.category))),
] as const;

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TECHNIQUES.filter((t) => {
      const matchesCat = category === "All" || t.category === category;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.rule.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <h1 className="type-display text-4xl sm:text-5xl">Knowledge Base</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Every named technique and rule in the curriculum — searchable, cross-linked, and
            print-ready for the workstation wall.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()} className="no-print">
          <Printer className="h-4 w-4" /> Print Rule Card
        </Button>
      </div>

      {/* Quick Reference Rule Card */}
      <section className="mt-8">
        <Card className="overflow-hidden">
          <div className="border-b border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <BookMarked className="h-4 w-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-bold uppercase tracking-[0.16em]">
                Quick-Reference Rule Card
              </h2>
            </div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Post this somewhere visible at your workstation.
            </p>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                Daily Reminders
              </h3>
              <ul className="space-y-2">
                {QUICK_REFERENCE.daily.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm text-[var(--color-text)]/85">
                    <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                  Commands
                </h3>
                <ul className="space-y-2">
                  {QUICK_REFERENCE.commands.map((c) => (
                    <li key={c.cue} className="text-sm">
                      <span className="font-bold text-[var(--color-text)]">{c.cue}</span>
                      <span className="text-[var(--color-muted)]"> — {c.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <RuleBox tone="danger" title="Wind Rule" body={QUICK_REFERENCE.wind} />
                <RuleBox tone="caution" title="Fatigue Rule" body={QUICK_REFERENCE.fatigue} />
              </div>
              <div>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                  Stop-Work Phrases
                </h3>
                <ul className="space-y-1.5">
                  {QUICK_REFERENCE.stopWork.map((p) => (
                    <li
                      key={p}
                      className="rounded-md border border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 px-3 py-1.5 text-sm italic text-[var(--color-text)]/85"
                    >
                      &ldquo;{p}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Search + filter */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Technique Glossary</h2>
          <span className="text-xs text-[var(--color-muted)]">{filtered.length} entries</span>
        </div>

        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search techniques, rules, keywords…"
              className="pl-9"
              aria-label="Search techniques"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === c
                    ? "border-[var(--color-accent)]/50 bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TechniqueCardView key={t.name} t={t} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 text-center text-sm text-[var(--color-muted)]">
            No techniques match &ldquo;{query}&rdquo;.
          </div>
        )}
      </section>
    </div>
  );
}

function TechniqueCardView({ t, index }: { t: TechniqueCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link href={`/modules/${t.moduleSlug}`} className="group block h-full">
        <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-[var(--color-accent)]/50">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold leading-snug tracking-tight">{t.name}</h3>
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)]" />
          </div>
          <Badge variant="neutral" className="mb-3 w-fit">
            {t.category}
          </Badge>
          <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">{t.summary}</p>
          <p className="mt-3 border-l-2 border-[var(--color-accent)]/40 pl-3 text-[13px] font-medium leading-relaxed text-[var(--color-text)]/85">
            {t.rule}
          </p>
        </Card>
      </Link>
    </motion.div>
  );
}

function RuleBox({
  tone,
  title,
  body,
}: {
  tone: "danger" | "caution";
  title: string;
  body: string;
}) {
  const color = tone === "danger" ? "var(--color-hardstop)" : "var(--color-caution)";
  return (
    <div
      className="rounded-lg border p-3"
      style={{ borderColor: `${color}40`, background: `${color}10` }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color }}>
        {title}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text)]/85">{body}</p>
    </div>
  );
}

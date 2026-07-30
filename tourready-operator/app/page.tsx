"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Wind,
  Anchor,
  Moon,
  ShieldAlert,
  Boxes,
  Activity,
  BookOpen,
  Dumbbell,
  Sparkles,
  BadgeCheck,
  Octagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/tilt-card";
import { ScrollIntro } from "@/components/scroll-intro";
import { MODULES, TOTAL_SCENARIOS } from "@/lib/curriculum";

const HAZARDS = [
  { icon: Wind, title: "Wind & Sail Effect", body: "LED walls and fabric sails turn a 15 mph breeze into tip-over force. Learn the derating math before the boom goes up." },
  { icon: Anchor, title: "Active Rigging Zones", body: "A 2 lb shackle falling 60 ft hits like a 120 lb weight. The Up-Look Protocol makes the airspace survivable." },
  { icon: Moon, title: "2:00 AM Fatigue", body: "14 hours in, strobes firing, haze everywhere. Train the reflexes that hold when your body is failing." },
  { icon: ShieldAlert, title: "Production Pressure", body: "The truck leaves in 20 minutes and the TM is screaming. Build the language that ends the argument: STOP." },
  { icon: Boxes, title: "Custom, Expensive Gear", body: "Miss a fork pocket by an inch and you spear a $200k LED processor. Precision alignment in the dark." },
  { icon: Activity, title: "Dynamic Venues", body: "Festival mud, stage decks, ice-rink insulation, cable bridges. Floors that move and fail under load." },
];

const STEPS = [
  { icon: BookOpen, n: "01", title: "Theory", body: "Faithful, field-tested curriculum — every named technique, hard rule, and Tour Reality." },
  { icon: Dumbbell, n: "02", title: "Deliberate Practice", body: "Free-text scenarios with no multiple choice. Decide like you're on the floor at load-out." },
  { icon: Sparkles, n: "03", title: "AI Feedback", body: "Instructor-grade grading that names the technique you used — or the one you missed." },
  { icon: BadgeCheck, n: "04", title: "Certification", body: "Pass every module to earn a verifiable Tour-Ready Operator credential." },
];

/** Stop-work mantras for the scrolling LED safety ribbon. */
const RIBBON = [
  "“STOP” overrides everything",
  "Up-Look before you enter the zone",
  "One spotter — obey no one else",
  "Wind at 15 mph — the boom stays down",
  "Load compromised? It cannot travel",
  "Hamburger for heavy, low and close",
  "Every card lives in your pocket",
  "Fatigue is the highest risk on site",
];

/** Fixed mote field — deterministic values so SSR and client agree. */
const MOTES: {
  left: string;
  top: string;
  dur: string;
  delay: string;
  drift: string;
  cool?: boolean;
}[] = [
  { left: "12%", top: "58%", dur: "9s", delay: "0s", drift: "18px" },
  { left: "21%", top: "42%", dur: "12s", delay: "2.2s", drift: "-14px" },
  { left: "29%", top: "66%", dur: "10s", delay: "4.8s", drift: "10px" },
  { left: "38%", top: "50%", dur: "13s", delay: "1.4s", drift: "-20px" },
  { left: "46%", top: "62%", dur: "8.5s", delay: "3.6s", drift: "16px" },
  { left: "55%", top: "44%", dur: "11s", delay: "0.8s", drift: "-12px" },
  { left: "63%", top: "58%", dur: "9.5s", delay: "5.4s", drift: "20px", cool: true },
  { left: "71%", top: "48%", dur: "12.5s", delay: "2.8s", drift: "-16px", cool: true },
  { left: "79%", top: "64%", dur: "10.5s", delay: "4.2s", drift: "12px", cool: true },
  { left: "86%", top: "52%", dur: "9s", delay: "1.9s", drift: "-18px", cool: true },
  { left: "17%", top: "74%", dur: "11.5s", delay: "6.1s", drift: "14px" },
  { left: "50%", top: "76%", dur: "10s", delay: "7.3s", drift: "-10px" },
  { left: "68%", top: "72%", dur: "12s", delay: "3.1s", drift: "18px", cool: true },
  { left: "33%", top: "38%", dur: "13.5s", delay: "5.9s", drift: "-15px" },
];

/** Fixture positions along the lighting truss (percent across the bar). */
const FIXTURES = [
  { left: "8%", cool: false, delay: "0s" },
  { left: "30%", cool: false, delay: "1.3s" },
  { left: "50%", cool: false, delay: "0.6s" },
  { left: "70%", cool: true, delay: "2.1s" },
  { left: "92%", cool: true, delay: "1.7s" },
];

/** Count-up gauge: animates the numeric part of a stat when scrolled into view. */
function StatGauge({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/^(\d+)(.*)$/);
  const isNumeric = match !== null;
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return;
    }
    let raf = 0;
    const dur = 900;
    const start = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / dur));
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, delay, isNumeric]);

  return (
    <div ref={ref} className="min-w-[5.5rem]">
      <dt className="type-display text-4xl text-[var(--color-text)] tabular-nums sm:text-5xl">
        {isNumeric ? n : value}
        <span className="text-[var(--color-accent)]">{suffix}</span>
      </dt>
      <motion.div
        aria-hidden
        className="mt-1.5 h-0.5 origin-left bg-gradient-to-r from-[var(--color-amber)] to-transparent"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <dd className="mt-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </dd>
    </div>
  );
}

/** Word-by-word staggered reveal for the display headline. */
function StaggerLine({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  const reduce = useReducedMotion();
  if (reduce) return <span className={`inline-block ${className}`}>{text}</span>;
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: delay } },
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

/** Placard-style eyebrow: hazard chip + condensed tracked label. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden className="warn-stripe h-2.5 w-7 rounded-sm opacity-80" />
      <span className="type-eyebrow text-[var(--color-accent)]">{children}</span>
    </span>
  );
}

export default function Landing() {
  return (
    // Marketing homepage only — dashboard, module lessons, simulator,
    // certificate, and resources keep the original dark app-shell background
    // untouched. Sections with their own explicit dark background (Hero, the
    // hazard/step/CTA cards) render over this regardless; only genuinely bare
    // marketing copy (Hazards intro, "How it works" heading) needed an
    // explicit --color-canvas-ink override to read against it.
    <div className="bg-[var(--color-page-bg)]">
      {/* ── The Load-Out — scroll-scrubbed cinematic intro ──── */}
      <ScrollIntro />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]/50 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-bg-deep)]">
        {/* Lighting rig */}
        <div aria-hidden className="truss">
          {FIXTURES.map((f, i) => (
            <span
              key={i}
              className={`truss-fixture ${f.cool ? "truss-fixture--cool" : ""}`}
              style={{ left: f.left, animationDelay: f.delay }}
            />
          ))}
        </div>
        <div aria-hidden className="beacon-sweep" />
        <div aria-hidden className="beacon-sweep beacon-sweep-2" />
        <div aria-hidden className="beacon-sweep beacon-sweep-3" />
        <div aria-hidden className="haze haze-a" />
        <div aria-hidden className="haze haze-b" />

        {/* The floor */}
        <div aria-hidden className="horizon-glow" />
        <div aria-hidden className="floor-3d" />

        {/* Dust in the beams */}
        {MOTES.map((m, i) => (
          <span
            key={i}
            aria-hidden
            className={`mote ${m.cool ? "mote--cool" : ""}`}
            style={
              {
                left: m.left,
                top: m.top,
                "--mote-dur": m.dur,
                "--mote-delay": m.delay,
                "--mote-drift": m.drift,
              } as React.CSSProperties
            }
          />
        ))}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 px-3.5 py-1.5 text-xs font-medium text-[var(--color-muted)] backdrop-blur">
                <span className="beacon-dot h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                Telehandler &amp; Forklift · Concert &amp; Festival Production
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber)]/25 bg-[var(--color-bg-deep)]/80 px-3.5 py-1.5 backdrop-blur">
                <span className="led-clock text-xs">
                  02<span className="tick">:</span>00
                </span>
                <span className="type-eyebrow !tracking-[0.2em] text-[10px] text-[var(--color-muted)]">
                  Load-out in progress
                </span>
              </span>
            </span>

            <h1 className="type-display mt-7 text-[var(--color-text)] [text-shadow:0_2px_30px_rgba(5,8,16,0.7)]">
              <StaggerLine
                text="Master the Concert/Event Production Forklift Training Program."
                className="max-w-3xl text-3xl !leading-[1.04] text-[var(--color-text)]/85 sm:text-4xl lg:text-[2.9rem]"
              />
              <StaggerLine
                text="Build unbreakable Stop-Work Authority."
                className="text-hot mt-3 !block text-5xl sm:text-7xl lg:text-[5.6rem]"
                delay={0.55}
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]"
            >
              The definitive AI-powered certification platform for the operators who move the show —
              under wind, rigging, fatigue, and production pressure. Not a generic forklift course.
              Built for the floor you actually work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href="/dashboard">
                <Button size="lg" className="shadow-[var(--shadow-glow-accent)]">
                  Enter the Training Hub <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/simulator">
                <Button size="lg" variant="secondary">
                  Open Safety Engine
                </Button>
              </Link>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-14 flex flex-wrap gap-x-12 gap-y-6"
            >
              {[
                { k: `${MODULES.length}`, v: "Modules + Capstone" },
                { k: `${TOTAL_SCENARIOS}`, v: "Field scenarios" },
                { k: "25+", v: "Named techniques" },
                { k: "100%", v: "Offline-capable" },
              ].map((s, i) => (
                <StatGauge key={s.v} value={s.k} label={s.v} delay={i * 0.12} />
              ))}
            </motion.dl>
          </motion.div>
        </div>

        {/* STOP banner */}
        <div className="relative border-t border-[var(--color-border)]/50 bg-[var(--color-surface)]/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Octagon className="h-5 w-5 flex-shrink-0 fill-[var(--color-hardstop)] text-[var(--color-hardstop)]" />
            <p className="text-sm text-[var(--color-text)]/80">
              <span className="font-bold text-[var(--color-text)]">&ldquo;STOP&rdquo;</span> is the one
              command that overrides everything — issued loud, echoed by the crew, and never argued. This
              platform is built to make that reflex automatic.
            </p>
          </div>
        </div>
      </section>

      {/* ── LED safety ribbon ────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[var(--color-border)]/50 bg-[var(--color-bg-deep)]">
        <div className="hazard-tape" aria-hidden />
        <div
          className="ribbon-mask overflow-hidden py-3"
          aria-label="Stop-work safety reminders"
        >
          <div className="ribbon-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                {RIBBON.map((m) => (
                  <span key={m} className="flex items-center">
                    <span className="beacon-dot mx-5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                    <span className="type-display text-sm tracking-[0.14em] text-[var(--color-muted)]">
                      {m}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="hazard-tape" aria-hidden />
      </div>

      {/* ── Hazards ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl">
            <Eyebrow>Field conditions</Eyebrow>
            <h2 className="type-display mt-3 text-4xl text-[var(--color-canvas-ink)] sm:text-5xl">
              The hazards warehouse training never covers
            </h2>
            <p className="mt-4 text-[var(--color-muted)]">
              Concert gear doesn&apos;t behave like pallets. Every module is built around the real
              failure modes of live-event production.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]/70 shadow-[var(--shadow-glow-accent)] lg:max-w-none">
            <Image
              src="/images/TRO.jpg"
              alt="TourReady Operator — a telehandler forklift silhouetted on a concert stage under lighting rigs"
              width={1152}
              height={768}
              className="h-auto w-full"
              priority={false}
            />
          </div>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HAZARDS.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="h-full"
            >
              <TiltCard className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-accent)]/40">
                <div
                  aria-hidden
                  className="warn-stripe absolute inset-x-0 top-0 h-1 -translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                />
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-2)] ring-1 ring-[var(--color-border)] transition-all group-hover:bg-[var(--color-accent-soft)] group-hover:ring-[var(--color-accent)]/40 group-hover:shadow-[0_0_20px_-6px_var(--color-accent)]">
                  <h.icon className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-base font-bold tracking-tight">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{h.body}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-y border-[var(--color-border)]/50 bg-[var(--color-surface)]/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Eyebrow>The training loop</Eyebrow>
          <h2 className="type-display mt-3 text-4xl text-[var(--color-canvas-ink)] sm:text-5xl">How it works</h2>
          <p className="mt-4 max-w-xl text-[var(--color-muted)]">
            A deliberate-practice loop modeled on how operators actually build judgment.
          </p>
          <div className="relative mt-12 grid gap-4 md:grid-cols-4">
            <div
              aria-hidden
              className="load-path absolute left-0 right-0 top-[3.15rem] hidden h-0.5 md:block"
            />
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative rounded-[var(--radius-card)] border border-[var(--color-border)]/70 bg-[var(--color-bg)] p-6 transition-colors hover:border-[var(--color-accent)]/40"
              >
                <span className="type-display relative z-10 inline-flex h-8 items-center rounded-full bg-[var(--color-surface)] px-3 text-base text-[var(--color-accent)] ring-1 ring-[var(--color-border)] transition-all group-hover:ring-[var(--color-accent)]/50 group-hover:shadow-[0_0_16px_-4px_var(--color-accent)]">
                  {s.n}
                </span>
                <s.icon className="mt-3 h-6 w-6 text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]" />
                <h3 className="mt-4 text-base font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-accent)]/30 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg-deep)] p-10 sm:p-14">
          <div className="absolute inset-0 bg-radial-accent" />
          <div aria-hidden className="beacon-sweep" style={{ opacity: 0.5 }} />
          <div aria-hidden className="floor-3d opacity-60" />
          <div className="hazard-tape absolute inset-x-0 top-0" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 className="type-display text-4xl sm:text-6xl">
              Be the operator who calls{" "}
              <span className="text-hot">STOP</span> when it counts.
            </h2>
            <p className="mt-5 text-lg text-[var(--color-muted)]">
              That operator is the one saving the show. Start with Module 0 and work to the 2:00 AM
              arena capstone.
            </p>
            <Link href="/dashboard" className="mt-8 inline-block">
              <Button size="lg" className="shadow-[var(--shadow-glow-accent)]">
                Start Training <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

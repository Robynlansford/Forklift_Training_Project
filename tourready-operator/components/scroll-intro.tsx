"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    mountScrollWorld: (container: HTMLElement, config: Record<string, unknown>) => void;
  }
}

type SectionDef = {
  id: string;
  label: string;
  video: string;
  poster: string;
  videoBytes: number;
  posterBytes: number;
  accent: string;
  scroll: number;
  linger: number;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  cta?: { primary: { label: string; href: string }; secondary: { label: string; href: string } };
};

/* Exact byte sizes of the deployed assets — known up front because we control
   the build, so total payload (and therefore load progress) needs no
   preflight HEAD round-trip; the numbers below must match
   public/scroll-intro/{vid,img}/legN.* whenever those files are re-encoded. */
const SECTIONS: SectionDef[] = [
  {
    id: "yard",
    label: "The Yard",
    video: "/scroll-intro/vid/leg1.mp4",
    poster: "/scroll-intro/img/leg1.webp",
    videoBytes: 6746759,
    posterBytes: 187470,
    accent: "#F97316",
    scroll: 1.5,
    linger: 0.3,
    eyebrow: "23:10 · Load-in",
    title: "The Wet Ramp Slick starts before the wheels ever move.",
    body: "Aluminum loading ramps turn frictionless in active rain. Every approach is calculated — momentum, wheel-spin, a precise straight-on line — before the machine ever leaves the yard.",
    tags: ["Wet Ramp Slick", "Incline Dynamics"],
  },
  {
    id: "trailer",
    label: "Fork Pockets",
    video: "/scroll-intro/vid/leg2.mp4",
    poster: "/scroll-intro/img/leg2.webp",
    videoBytes: 4309700,
    posterBytes: 146776,
    accent: "#FBBF24",
    scroll: 1.5,
    linger: 0.35,
    eyebrow: "23:40 · Truck Pack",
    title: "Miss a slot by an inch, spear a $200k processor.",
    body: "Vertical Rib Symmetry and the Level-Fork Shadow Trick turn blind, dark-trailer alignment into a repeatable skill — not a guess, not a gouge.",
    tags: ["Vertical Rib Symmetry", "Level-Fork Shadow", "Flush-Fork Rule"],
  },
  {
    id: "dock",
    label: "Ground Crew",
    video: "/scroll-intro/vid/leg3.mp4",
    poster: "/scroll-intro/img/leg3.webp",
    videoBytes: 4613602,
    posterBytes: 122414,
    accent: "#F97316",
    scroll: 1.4,
    linger: 0.3,
    eyebrow: "00:25 · Ground Crew",
    title: "The Rear-Swing Halo Zone doesn't care how eager the crew is.",
    body: "Counterbalance forklifts steer from the rear — the tail swings. A strict 3-foot boundary and the mandatory Clear-and-Release pause keep hands off the steel until it's actually down.",
    tags: ["Rear-Swing Halo", "Clear-and-Release", "Pusher's Blindness Yield"],
  },
  {
    id: "rigging",
    label: "Up-Look",
    video: "/scroll-intro/vid/leg4.mp4",
    poster: "/scroll-intro/img/leg4.webp",
    videoBytes: 4335120,
    posterBytes: 94584,
    accent: "#22C55E",
    scroll: 1.6,
    linger: 0.4,
    eyebrow: "01:05 · Rigging Zone",
    title: "A 2 lb shackle falling 60 ft hits like a 120 lb weight.",
    body: "Active rigging turns the airspace above the floor into its own hazard zone. The Up-Look Protocol and Sail Effect wind-load math make that airspace survivable — one spotter, obeyed, every time.",
    tags: ["Up-Look Protocol", "Sail Effect Derating"],
  },
  {
    id: "capstone",
    label: "02:00",
    video: "/scroll-intro/vid/leg5.mp4",
    poster: "/scroll-intro/img/leg5.webp",
    videoBytes: 3429355,
    posterBytes: 102120,
    accent: "#EF4444",
    scroll: 1.8,
    linger: 0.55,
    eyebrow: "02:00 · Arena Load-Out",
    title: "Be the operator who calls STOP when it counts.",
    body: "Fourteen hours in. Strobes firing. The last case, alone under one work light. This is the reflex the whole curriculum is built to make automatic — and the capstone that certifies you've got it.",
    tags: ["Stop-Work Authority", "Fatigue Protocol"],
    cta: {
      primary: { label: "Enter the Training Hub", href: "/dashboard" },
      secondary: { label: "Open Safety Engine", href: "/simulator" },
    },
  },
];

const TOTAL_BYTES = SECTIONS.reduce((sum, s) => sum + s.videoBytes + s.posterBytes, 0);

/** Fetch a URL as a Blob, reporting incremental bytes via onChunk as they stream in.
 *  `mime` MUST be set explicitly: an object URL wrapping a type-less Blob plays fine
 *  in a <video> (browsers sniff container bytes) but a bare <img> does NOT sniff —
 *  without the correct `image/*` MIME on the Blob it silently never decodes
 *  (stays `complete: false` forever, no error, nothing in the console). */
async function fetchWithProgress(url: string, mime: string, onChunk: (bytes: number) => void): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  if (!res.body) {
    const blob = await res.blob();
    onChunk(blob.size);
    return blob.type ? blob : new Blob([blob], { type: mime });
  }
  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    onChunk(value.byteLength);
  }
  return new Blob(chunks, { type: mime });
}

export function ScrollIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const engineReady = useRef(false);
  const cancelledRef = useRef(false);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [phase, setPhase] = useState<"loading" | "revealing" | "ready">("loading");
  const [skipped, setSkipped] = useState(false);
  const resolvedRef = useRef<Record<string, string> | null>(null);

  function restoreOverflow() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function hideFilm() {
    const root = ref.current;
    if (!root) return;
    root.style.display = "none";
    root.style.visibility = "hidden";
    root.style.pointerEvents = "none";
    root.style.height = "0";
    root.style.overflow = "hidden";
  }

  function skipFilm() {
    if (cancelledRef.current && skipped) return;
    cancelledRef.current = true;
    restoreOverflow();
    setSkipped(true);
    setPhase("ready");
    hideFilm();
    const hero = document.getElementById("hero");
    hero?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  const tryMount = () => {
    if (
      cancelledRef.current ||
      mounted.current ||
      !ref.current ||
      !window.mountScrollWorld ||
      !resolvedRef.current
    ) {
      return;
    }
    mounted.current = true;
    const blobs = resolvedRef.current;
    window.mountScrollWorld(ref.current, {
      brand: { name: "TourReady Operator", href: "#top" },
      diveScroll: 1.5,
      connScroll: 0.9,
      hint: "scroll to begin the load-out",
      nav: false,
      atmosphere: true,
      sections: SECTIONS.map((s) => ({
        id: s.id,
        label: s.label,
        still: blobs[`${s.id}-poster`],
        clip: blobs[`${s.id}-video`],
        accent: s.accent,
        scroll: s.scroll,
        linger: s.linger,
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        tags: s.tags,
        cta: s.cta,
      })),
      connectors: [],
    });
  };

  // Engine script may finish loading before or after the preload — mount once both are true.
  useEffect(() => {
    if (phase !== "revealing") return;
    engineReady.current = true;
    tryMount();
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    // Lock scroll for the whole page while assets stream in — this is the
    // actual guarantee against catching a half-loaded scene mid-scrub: nobody
    // can move past the top of the page until every clip is a resident Blob.
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    (async () => {
      const results: Record<string, string> = {};
      try {
        await Promise.all(
          SECTIONS.flatMap((s) => [
            fetchWithProgress(s.video, "video/mp4", (n) => !cancelled && setLoadedBytes((b) => b + n)).then((blob) => {
              results[`${s.id}-video`] = URL.createObjectURL(blob);
            }),
            fetchWithProgress(s.poster, "image/webp", (n) => !cancelled && setLoadedBytes((b) => b + n)).then((blob) => {
              results[`${s.id}-poster`] = URL.createObjectURL(blob);
            }),
          ])
        );
      } catch {
        // Failed preload must never leave the document scroll-locked.
        if (!cancelled && !cancelledRef.current) {
          cancelledRef.current = true;
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          setSkipped(true);
          setPhase("ready");
        }
        return;
      }
      if (cancelled || cancelledRef.current) return;
      resolvedRef.current = results;
      // Hold the completed bar at 100% for one beat before revealing — an
      // instant cut from "loading" to "playing" reads as a glitch, not a gate.
      setTimeout(() => {
        if (!cancelled && !cancelledRef.current) setPhase("revealing");
      }, 260);
    })();

    return () => {
      cancelled = true;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (phase !== "revealing") return;
    // Give the engine one paint to mount before restoring scroll + fading the gate.
    const t = setTimeout(() => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      setPhase("ready");
    }, 60);
    return () => clearTimeout(t);
  }, [phase]);

  // The engine's layers are all `position: fixed`, so they would keep painting
  // over the rest of the landing page after the film's scroll range is spent.
  // Hide them once past it, and restore on scroll back up.
  useEffect(() => {
    if (phase !== "ready" || skipped) return;
    const onScroll = () => {
      const root = ref.current;
      if (!root) return;
      const track = root.querySelector<HTMLElement>(".sw-track");
      if (!track) return;
      const done = window.scrollY >= track.offsetHeight;
      root.style.visibility = done ? "hidden" : "";
      root.style.pointerEvents = done ? "none" : "";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [phase, skipped]);

  const pct = Math.min(100, Math.round((loadedBytes / TOTAL_BYTES) * 100));

  return (
    <>
      <Script
        src="/scroll-intro/scrub-engine.js"
        strategy="afterInteractive"
        onReady={() => {
          if (phase === "revealing") tryMount();
        }}
        onLoad={() => {
          if (phase === "revealing") tryMount();
        }}
      />

      {phase !== "ready" && !skipped && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-[var(--color-bg)] px-4 transition-opacity duration-500"
          style={{ opacity: phase === "revealing" ? 0 : 1, pointerEvents: phase === "revealing" ? "none" : "auto" }}
          aria-hidden={phase === "revealing"}
        >
          <div className="flex items-center gap-2.5">
            <span className="beacon-dot h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            <span className="type-eyebrow text-[var(--color-accent)]">Preparing the Load-Out</span>
          </div>

          <div className="led-clock text-5xl tabular-nums sm:text-6xl">
            {String(pct).padStart(2, "0")}
            <span className="tick text-[var(--color-muted)]">%</span>
          </div>

          <div className="w-[min(80vw,360px)] overflow-hidden rounded-full bg-[var(--color-surface-2)] ring-1 ring-[var(--color-border)]">
            <div
              className="h-1.5 rounded-full bg-[var(--color-accent)] transition-[width] duration-150 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="max-w-xs text-center text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Every scene loads before you scroll — no half-loaded clips mid-scrub.
          </p>

          <button
            type="button"
            onClick={skipFilm}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-white/5"
          >
            Skip film — go to training
          </button>
        </div>
      )}

      {phase === "ready" && !skipped && (
        <button
          type="button"
          onClick={skipFilm}
          className="no-print fixed right-4 top-20 z-[60] rounded-lg border border-[var(--color-border)]/70 bg-[var(--color-bg)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] backdrop-blur hover:border-[var(--color-accent)]/50 sm:right-6"
        >
          Skip film
        </button>
      )}

      {!skipped && (
        <div
          id="load-out"
          ref={ref}
          className="sw-root"
          style={
            {
              isolation: "isolate",
              "--sw-bg": "#0b1120",
              "--sw-ink": "#f8fafc",
              "--sw-ink-soft": "#94a3b8",
              "--sw-accent": "#f97316",
            } as React.CSSProperties
          }
        />
      )}
    </>
  );
}

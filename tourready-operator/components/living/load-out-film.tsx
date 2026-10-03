"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULES, TOTAL_SCENARIOS } from "@/lib/curriculum";
import { FILM_BEATS, FILM_BEAT_AT } from "@/lib/load-out";
import { useLiving, livingAsset } from "./runtime";

/**
 * THE LOAD-OUT — the home page's signature scroll film, drawn in code.
 *
 * Server-rendered as real HTML: a poster frame with the title card, then the
 * five beats as a run sheet. When the engine runs (and motion is allowed) the
 * section pins, the WebGL scene fades in over the poster, and each beat fades
 * in over its scroll range. No load gate, no scroll lock: first paint is the
 * poster and the words.
 */
export function LoadOutFilm() {
  const ref = useRef<HTMLElement>(null);
  useLiving(ref);
  return (
    <section
      ref={ref}
      id="load-out"
      className="lp-film"
      data-scene="loadout"
      data-pin=""
      data-needs="kit.js"
      aria-label="The Load-Out — one night of a concert load-out"
    >
      <div className="lp-stage">
        <picture>
          <source media="(max-width: 767px)" srcSet={livingAsset("posters/loadout-tall.webp")} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="lp-poster"
            src={livingAsset("posters/loadout-wide.webp")}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <canvas className="lp-canvas" aria-hidden="true" />
        <div className="lp-scrim" aria-hidden="true" />
        <div className="lp-labels" aria-hidden="true" />

        {/* Title card — the loading screen's words, now the film's first frame. */}
        <div className="lp-title" data-at="0,0.055">
          <p className="lp-kicker">TourReady Operator</p>
          <p className="lp-lede">Forklift &amp; telehandler training for concert and festival load-ins</p>
          <p className="lp-sub">
            {MODULES.length} modules · {TOTAL_SCENARIOS} scenarios · the hazards warehouse training
            never covers
          </p>
        </div>

        <div className="lp-chrome">
          <span className="lp-clock" data-lp-clock aria-hidden="true">
            23:10
          </span>
          <a className="lp-skip no-print" href="#hero">
            Skip film
          </a>
          <span className="lp-tag lp-schematic">Schematic · not to scale</span>
          <div className="lp-hint" data-at="0,0.02" aria-hidden="true">
            <span>scroll to begin the load-out</span>
            <i />
          </div>
        </div>
      </div>

      <div className="lp-beats">
        {FILM_BEATS.map((b, i) => (
          <article key={b.id} className="lp-beat" data-at={FILM_BEAT_AT[i]}>
            <p className="lp-eyebrow">{b.eyebrow}</p>
            <h2>{b.title}</h2>
            <p>{b.body}</p>
            <ul aria-label="Named techniques">
              {b.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {b.cta && (
              <div className="lp-ctas">
                <Link href={b.cta.primary.href}>
                  <Button size="lg" className="shadow-[var(--shadow-glow-accent)]">
                    {b.cta.primary.label} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={b.cta.secondary.href}>
                  <Button size="lg" variant="secondary">
                    {b.cta.secondary.label}
                  </Button>
                </Link>
                <Link href="/film" className="lp-textlink">
                  Watch the film version
                </Link>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

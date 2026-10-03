"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useLiving, livingAsset } from "./runtime";

/**
 * A live hero: a WebGL scene behind (or beside) real page content.
 * First paint = the poster (or nothing) + the content; the scene fades in over
 * the poster once its script loads near the viewport. Reduced motion and
 * no-WebGL2 keep the poster. The canvas is always aria-hidden — meaning lives
 * in the HTML text around it.
 */
export function LivingScene({
  name,
  needs,
  poster,
  posterTall,
  data,
  tag,
  className = "",
  artClassName = "",
  fade = true,
  overlay = false,
  mode,
  style,
  children,
}: {
  name: string;
  /** Extra engine scripts, e.g. "kit.js" for the 3D load-out world. */
  needs?: string;
  /** Poster file under public/living/posters (wide / ≥768px). */
  poster?: string;
  /** Optional portrait poster for phones. */
  posterTall?: string;
  data?: Record<string, unknown>;
  /** Honesty label, e.g. "Schematic · not to scale". */
  tag?: string;
  className?: string;
  artClassName?: string;
  /** Legibility fade from the page background over the art (on by default). */
  fade?: boolean;
  /** Draw the scene ON TOP of the children (additive light over a photo) instead of behind. */
  overlay?: boolean;
  /** Scene variant, read by the scene as data-mode. */
  mode?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLiving(ref, data);
  return (
    <div
      ref={ref}
      className={`lp-hero ${className}`}
      data-scene={name}
      data-needs={needs}
      data-mode={mode}
      style={style}
    >
      {overlay && children}
      <div className={`lp-hero-art ${overlay ? "lp-hero-art--over" : ""} ${artClassName}`} aria-hidden="true">
        {poster && (
          <picture>
            {posterTall && (
              <source media="(max-width: 767px)" srcSet={livingAsset(`posters/${posterTall}`)} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lp-poster" src={livingAsset(`posters/${poster}`)} alt="" decoding="async" />
          </picture>
        )}
        <canvas className="lp-canvas" aria-hidden="true" />
        {fade && <div className="lp-fade" />}
        <div className="lp-labels" />
        {tag && <span className="lp-tag lp-hero-tag">{tag}</span>}
      </div>
      {!overlay && children}
    </div>
  );
}

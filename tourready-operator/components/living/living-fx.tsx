"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useLiving } from "./runtime";

/**
 * A section figure drawn by public/living/fx.js — a small canvas visual built
 * from numbers that already appear in the page's text. The <figcaption> carries
 * the meaning (and the source) in real HTML; the canvas is decorative.
 */
export function LivingFx({
  name,
  data,
  tag,
  caption,
  aspect,
  aspectSmall,
  className = "",
}: {
  name: string;
  data?: Record<string, unknown>;
  /** Honesty label: "Illustration", "Schematic · not to scale", "Teaching model"… */
  tag?: string;
  caption: ReactNode;
  /** CSS aspect-ratio for the canvas, e.g. "16 / 7". */
  aspect?: string;
  aspectSmall?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useLiving(ref, data);
  const style = {
    ...(aspect ? { "--lp-ar": aspect } : {}),
    ...(aspectSmall ? { "--lp-ar-sm": aspectSmall } : {}),
  } as CSSProperties;
  return (
    <figure
      ref={ref}
      className={`lp-fig no-print ${className}`}
      data-fx={name}
      data-values={data ? JSON.stringify(data) : undefined}
      style={style}
    >
      <canvas aria-hidden="true" />
      {tag && <span className="lp-tag">{tag}</span>}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * Scroll-lit route: wraps an existing list of process steps. Each child marked
 * [data-route-item] (with a [data-route-chip] inside) lights as it passes the
 * reading line, and a rail fills between the chips. Pure enhancement — without
 * JS the list is exactly as it was.
 */
export function LivingRoute({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "ol";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useLiving(ref);
  return (
    <Tag
      ref={ref as never}
      className={`lp-route ${className}`}
      data-fx="route"
    >
      {children}
    </Tag>
  );
}

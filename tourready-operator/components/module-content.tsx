"use client";

import type { Module } from "@/lib/curriculum";
import { MODULE_FIGURES } from "@/lib/living-figures";
import { Callout } from "./callout";
import { LivingFx, LivingRoute } from "./living/living-fx";

/** Renders a module's theory sections with deliberate typographic hierarchy. */
export function ModuleContent({ module }: { module: Module }) {
  const figures = MODULE_FIGURES[module.slug] ?? [];
  return (
    <div className="space-y-10">
      {module.sections.map((section, i) => {
        const figs = figures.filter((f) => f.heading === section.heading);
        return (
          <section key={i} className="scroll-mt-24">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="select-none font-mono text-xs font-semibold text-[var(--color-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
                {section.heading}
              </h2>
            </div>

            {section.lede && (
              <p className="mb-4 border-l-2 border-[var(--color-accent)]/50 pl-4 text-[15px] font-medium leading-relaxed text-[var(--color-text)]/90">
                {section.lede}
              </p>
            )}

            {section.body?.map((p, j) => (
              <p
                key={j}
                className="mb-3 text-[15px] leading-relaxed text-[var(--color-text)]/80"
              >
                {p}
              </p>
            ))}

            {section.steps && (
              // Scroll-lit route: each step's number lights as it passes the reading line.
              <LivingRoute as="ol" className="my-4 space-y-2.5">
                {section.steps.map((step, k) => (
                  <li key={k} className="flex gap-3.5" data-route-item="">
                    <span
                      className="relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-accent)] ring-1 ring-[var(--color-border)]"
                      aria-hidden="true"
                      data-route-chip=""
                    >
                      {k + 1}
                    </span>
                    <span className="pt-0.5 text-[15px] leading-relaxed text-[var(--color-text)]/85">
                      {step}
                    </span>
                  </li>
                ))}
              </LivingRoute>
            )}

            {section.callout && (
              <div className="mt-5">
                <Callout data={section.callout} />
              </div>
            )}

            {figs.map((f) => (
              <LivingFx
                key={f.fx + f.heading}
                name={f.fx}
                data={f.data}
                tag={f.tag}
                aspect={f.aspect}
                aspectSmall={f.aspectSmall}
                caption={<span>{f.caption}</span>}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

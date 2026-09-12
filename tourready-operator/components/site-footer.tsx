import Link from "next/link";

export function SiteFooter() {
  return (
    // Permanent cream backdrop, on every page — a deliberate, stable choice
    // (not the earlier accidental site-wide flip, which was a script-injection
    // bug; see scrub-engine.js). Scoped to just the footer, so it doesn't
    // affect the dark app-shell background any page's own content sits on.
    <footer className="no-print mt-24 border-t border-[var(--color-border)]/60 bg-[var(--color-page-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-md text-xs leading-relaxed text-[var(--color-canvas-muted)]">
            <span className="font-semibold text-[var(--color-canvas-ink)]">
              TourReady Operator
            </span>{" "}
            is designed to support the formal-instruction component described in
            29 CFR 1910.178(l). It is not accredited or approved by OSHA — OSHA
            does not approve training courses — and completing it does not by
            itself make you a certified operator. It does not replace the
            practical hands-on training or the workplace evaluation the same
            standard requires; your employer, not OSHA or this platform,
            determines whether your training is adequate for the machines and
            the site you work on, and certifies you once all three are done.
            Always complete your employer&apos;s hands-on training and evaluation
            before operating any lift equipment.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-canvas-muted)]">
            <Link href="/dashboard" className="hover:text-[var(--color-canvas-ink)]">
              Training Hub
            </Link>
            <Link href="/simulator" className="hover:text-[var(--color-canvas-ink)]">
              Safety Engine
            </Link>
            <Link href="/resources" className="hover:text-[var(--color-canvas-ink)]">
              Knowledge Base
            </Link>
            <Link href="/certificate" className="hover:text-[var(--color-canvas-ink)]">
              Certification
            </Link>
          </div>
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-[var(--color-canvas-muted)]">
          Concert &amp; Festival Production · Telehandler &amp; Forklift · v1.0
        </p>
      </div>
    </footer>
  );
}

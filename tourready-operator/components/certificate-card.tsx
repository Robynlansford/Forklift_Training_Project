"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import { Download, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";

export function CertificateCard({
  name,
  certId,
  date,
  totalScenarios,
  correct,
}: {
  name: string;
  certId: string;
  date: string;
  totalScenarios: number;
  correct: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  async function download() {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#0B1120",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `TourReady-Certificate-${certId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Certificate downloaded");
    } catch {
      toast.error("Could not generate image — try the Print option.");
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-bg)] p-8 sm:p-12"
      >
        {/* Decorative texture */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-radial-accent" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent)]/40">
                <ShieldCheck className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight text-[var(--color-text)]">
                  TourReady Operator
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Concert &amp; Festival Production
                </p>
              </div>
            </div>
            <span className="rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              Certified
            </span>
          </div>

          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              This certifies that
            </p>
            <p
              className={`type-display mt-3 text-5xl sm:text-6xl ${
                name.trim()
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-muted)]"
              }`}
            >
              {name.trim() || "Name not entered"}
            </p>
            {!name.trim() && (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Enter the operator name in the field above before you print or download.
              </p>
            )}
            <div className="mt-4 h-px w-full bg-gradient-to-r from-[var(--color-accent)]/60 via-[var(--color-border)] to-transparent" />
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-text)]/85">
              has completed the full TourReady Operator curriculum and is recognized as a{" "}
              <span className="font-bold text-[var(--color-accent)]">
                Certified Tour-Ready Telehandler Operator
              </span>{" "}
              for Concert &amp; Festival Production — demonstrating mastery of Stop-Work Authority,
              the Up-Look Protocol, wind-load derating, and disciplined practice under fatigue and
              production pressure.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <Meta label="Credential ID" value={certId} />
            <Meta label="Date Issued" value={date} />
            <Meta label="Scenarios Passed" value={`${correct} / ${totalScenarios}`} />
          </div>

          <p className="mt-8 text-[10px] leading-relaxed text-[var(--color-muted)]/80">
            Satisfies formal instruction under 29 CFR 1910.178(l) — not a substitute for
            hands-on training and evaluation. Employer certifies completion of all three.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 no-print">
        <Button onClick={download}>
          <Download className="h-4 w-4" /> Download PNG
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

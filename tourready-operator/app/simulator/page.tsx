import type { Metadata } from "next";
import { SafetyEngineForm } from "@/components/safety-engine-form";

export const metadata: Metadata = {
  title: "Safety Engine Simulator — TourReady Operator",
  description:
    "Run lift conditions through the live TelehandlerSafetyEngine: ground derates, fatigue modifier, wind threshold, and falling-object impact.",
};

export default function SimulatorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="type-display text-4xl sm:text-5xl">Safety Engine Simulator</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          The same <code className="text-[var(--color-accent)]">TelehandlerSafetyEngine</code> that
          grades every lift in the platform — exposed as a standalone tool. Adjust the conditions and
          watch the verdict, estimated capacity, and reasoning update live. Runs fully offline. The
          capacity figure is a conservative teaching estimate — never a substitute for the machine&apos;s
          load chart.
        </p>
      </div>

      <div className="mt-8">
        <SafetyEngineForm />
      </div>
    </div>
  );
}

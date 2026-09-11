"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  evaluateSafety,
  GROUND_DERATE,
  GROUND_LABELS,
  STATUS_META,
  WIND_THRESHOLD_MPH,
  type SafetyInputs,
} from "@/lib/safety-engine";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Badge } from "./ui/badge";
import { AlertOctagon, Gauge, Radio, Zap } from "lucide-react";

const DEFAULTS: Required<
  Pick<
    SafetyInputs,
    | "loadWeightLbs"
    | "groundType"
    | "windSpeedMph"
    | "riggingZoneClear"
    | "commsCheckPhrase"
    | "commsCheckEchoed"
    | "pushersPresent"
    | "pushersClearedHaloZone"
    | "boomAngleDegrees"
    | "liftHeightFt"
    | "reachFt"
    | "timeOfDayHrs"
    | "shiftDurationHrs"
  >
> = {
  loadWeightLbs: 2500,
  groundType: "CONCRETE",
  windSpeedMph: 6,
  riggingZoneClear: true,
  commsCheckPhrase: "STOP",
  commsCheckEchoed: true,
  pushersPresent: 0,
  pushersClearedHaloZone: true,
  boomAngleDegrees: 45,
  liftHeightFt: 12,
  reachFt: 6,
  timeOfDayHrs: 14,
  shiftDurationHrs: 6,
};

interface Preset {
  name: string;
  tag: string;
  description: string;
  values: Partial<typeof DEFAULTS>;
}

const PRESETS: Preset[] = [
  {
    name: "Clear Daytime Pick",
    tag: "GO",
    description: "Concrete floor, light wind, fresh crew, comms confirmed.",
    values: {
      // 2,500 lb at 6 ft of reach sits inside the ~3,850 lb the moment model
      // allows here. The old linear derate allowed 7,600 lb at this reach.
      loadWeightLbs: 2500,
      groundType: "CONCRETE",
      windSpeedMph: 5,
      riggingZoneClear: true,
      commsCheckEchoed: true,
      pushersPresent: 0,
      timeOfDayHrs: 13,
      shiftDurationHrs: 4,
      reachFt: 6,
    },
  },
  {
    name: "2:00 AM LED Wall",
    tag: "Capstone",
    description: "17 mph gusts · 10,000 lb sail · 14h shift · LED sub-floor.",
    values: {
      loadWeightLbs: 10000,
      groundType: "LED_WALL",
      windSpeedMph: 17,
      riggingZoneClear: true,
      commsCheckEchoed: true,
      pushersPresent: 0,
      timeOfDayHrs: 2,
      shiftDurationHrs: 14,
      reachFt: 14,
      liftHeightFt: 25,
    },
  },
  {
    name: "Rigging Zone Hot",
    tag: "BLOCKER",
    description: "Overhead riggers active — drop zone not cleared.",
    values: {
      loadWeightLbs: 3000,
      riggingZoneClear: false,
      liftHeightFt: 60,
    },
  },
  {
    name: "Festival Mud Overload",
    tag: "HARD STOP",
    description: "Rain-soaked field, long reach, heavy pick.",
    values: {
      loadWeightLbs: 6000,
      groundType: "FESTIVAL_MUD",
      windSpeedMph: 8,
      reachFt: 12,
      timeOfDayHrs: 23,
      shiftDurationHrs: 11,
    },
  },
  {
    name: "Pushers In Halo",
    tag: "CAUTION",
    description: "Ground crew on the load, inside the 3-ft halo zone.",
    values: {
      loadWeightLbs: 3500,
      pushersPresent: 4,
      pushersClearedHaloZone: false,
    },
  },
  {
    name: "Comms Breakdown",
    tag: "BLOCKER",
    description: "STOP given but never echoed by ground crew.",
    values: {
      loadWeightLbs: 3000,
      commsCheckEchoed: false,
    },
  },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--color-text)]">{label}</span>
        {hint && <span className="text-[11px] text-[var(--color-muted)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  danger,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--color-accent)]/40"
    >
      <span className="text-[13px] font-medium text-[var(--color-text)]">{label}</span>
      <span
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
          checked
            ? danger
              ? "bg-[var(--color-hardstop)]"
              : "bg-[var(--color-go)]"
            : "bg-[var(--color-border)]"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
          style={{ left: checked ? "1.125rem" : "0.125rem" }}
        />
      </span>
    </button>
  );
}

export function SafetyEngineForm() {
  const [v, setV] = useState({ ...DEFAULTS });

  const result = useMemo(() => evaluateSafety(v), [v]);
  const meta = STATUS_META[result.status];

  function set<K extends keyof typeof DEFAULTS>(key: K, value: (typeof DEFAULTS)[K]) {
    setV((cur) => ({ ...cur, [key]: value }));
  }

  function num(key: keyof typeof DEFAULTS) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseFloat(e.target.value);
      set(key, (Number.isFinite(n) ? n : 0) as never);
    };
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(340px,400px)]">
      {/* ── Inputs ─────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Presets */}
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--color-accent)]" />
            <h2 className="text-sm font-semibold">Tour Scenario Presets</h2>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setV({ ...DEFAULTS, ...p.values })}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 p-3 text-left transition-all hover:border-[var(--color-accent)]/50 hover:bg-white/5"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[var(--color-text)]">
                    {p.name}
                  </span>
                  <Badge
                    variant={
                      p.tag === "GO"
                        ? "go"
                        : p.tag === "CAUTION"
                        ? "caution"
                        : p.tag === "HARD STOP"
                        ? "danger"
                        : p.tag === "BLOCKER"
                        ? "blocker"
                        : "accent"
                    }
                  >
                    {p.tag}
                  </Badge>
                </div>
                <p className="text-[11.5px] leading-relaxed text-[var(--color-muted)]">
                  {p.description}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Load & Environment */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Gauge className="h-4 w-4 text-[var(--color-accent)]" /> Load & Environment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Load weight" hint="lbs">
              <Input type="number" value={v.loadWeightLbs} onChange={num("loadWeightLbs")} min={0} />
            </Field>
            <Field label="Ground surface">
              <Select
                value={v.groundType}
                onChange={(e) => set("groundType", e.target.value)}
              >
                {Object.keys(GROUND_DERATE).map((g) => (
                  <option key={g} value={g}>
                    {GROUND_LABELS[g]} · ×{GROUND_DERATE[g]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Wind speed"
              hint={`${v.windSpeedMph} mph · limit ${WIND_THRESHOLD_MPH}`}
            >
              <input
                type="range"
                min={0}
                max={35}
                value={v.windSpeedMph}
                onChange={num("windSpeedMph")}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
                aria-label="Wind speed in mph"
              />
            </Field>
            <Field label="Boom angle" hint="degrees">
              <Input type="number" value={v.boomAngleDegrees} onChange={num("boomAngleDegrees")} />
            </Field>
            <Field label="Reach" hint="ft (derates capacity)">
              <Input type="number" value={v.reachFt} onChange={num("reachFt")} min={0} />
            </Field>
            <Field label="Lift height" hint="ft">
              <Input type="number" value={v.liftHeightFt} onChange={num("liftHeightFt")} min={0} />
            </Field>
          </div>
        </Card>

        {/* Fatigue */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <AlertOctagon className="h-4 w-4 text-[var(--color-accent)]" /> Fatigue Window
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Time of day" hint={`${String(v.timeOfDayHrs).padStart(2, "0")}:00`}>
              <input
                type="range"
                min={0}
                max={23}
                value={v.timeOfDayHrs}
                onChange={num("timeOfDayHrs")}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
                aria-label="Time of day (24h)"
              />
            </Field>
            <Field label="Shift duration" hint={`${v.shiftDurationHrs} h`}>
              <input
                type="range"
                min={0}
                max={18}
                step={0.5}
                value={v.shiftDurationHrs}
                onChange={num("shiftDurationHrs")}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
                aria-label="Shift duration in hours"
              />
            </Field>
          </div>
        </Card>

        {/* Comms & Crew (Hard rules) */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Radio className="h-4 w-4 text-[var(--color-accent)]" /> Commands & Crew
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pre-lift comms check" hint="the crew's stop word">
              <Input
                value={v.commsCheckPhrase}
                onChange={(e) => set("commsCheckPhrase", e.target.value)}
                placeholder="STOP"
              />
            </Field>
            <Field label="Pushers present" hint="count">
              <Input type="number" value={v.pushersPresent} onChange={num("pushersPresent")} min={0} />
            </Field>
            <Toggle
              label="Rigging zone clear"
              checked={v.riggingZoneClear}
              onChange={(b) => set("riggingZoneClear", b)}
              danger={!v.riggingZoneClear}
            />
            <Toggle
              label="Echoed back by crew"
              checked={v.commsCheckEchoed}
              onChange={(b) => set("commsCheckEchoed", b)}
              danger={!v.commsCheckEchoed}
            />
            <Toggle
              label="Pushers cleared halo zone"
              checked={v.pushersClearedHaloZone}
              onChange={(b) => set("pushersClearedHaloZone", b)}
            />
            <Button variant="ghost" onClick={() => setV({ ...DEFAULTS })}>
              Reset to defaults
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Live Output ────────────────────────────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <motion.div
          key={result.status}
          initial={{ opacity: 0.6, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-card)]"
          style={{ borderColor: meta.border, background: "var(--color-surface)" }}
        >
          <div className="px-5 py-5" style={{ background: meta.bg }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Engine Verdict
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className="inline-flex h-3 w-3 rounded-full"
                style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
              />
              <span className="text-3xl font-black tracking-tight" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-medium text-[var(--color-text)]/80">
              {meta.description}
            </p>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Reasoning
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-text)]/90">
                {result.reasoning}
              </p>
            </div>

            {result.findings.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  All findings ({result.findings.length})
                </p>
                <ul className="space-y-2">
                  {result.findings.map((f) => {
                    const fm = STATUS_META[f.severity];
                    return (
                      <li
                        key={f.title}
                        className="rounded-lg border p-2.5"
                        style={{ borderColor: `${fm.color}55`, background: fm.bg }}
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: fm.color }}
                          >
                            {fm.label}
                          </span>
                          <span className="text-[12.5px] font-semibold text-[var(--color-text)]">
                            {f.title}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text)]/80">
                          {f.detail}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-muted)]">
                  Every condition is listed at once, not one at a time — a real pre-lift read is the
                  whole picture, not the first thing that trips.
                </p>
              </div>
            )}

            {result.estimatedCapacityLbs > 0 && (
              <div className="rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 p-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] text-[var(--color-muted)]">Estimated capacity</span>
                  <span className="text-lg font-bold tabular-nums text-[var(--color-text)]">
                    {Math.round(result.estimatedCapacityLbs).toLocaleString()} lbs
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-[12px] text-[var(--color-muted)]">Load requested</span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color:
                        v.loadWeightLbs > result.estimatedCapacityLbs
                          ? "var(--color-hardstop)"
                          : "var(--color-go)",
                    }}
                  >
                    {v.loadWeightLbs.toLocaleString()} lbs
                  </span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (v.loadWeightLbs / result.estimatedCapacityLbs) * 100)}%`,
                      background:
                        v.loadWeightLbs > result.estimatedCapacityLbs
                          ? "var(--color-hardstop)"
                          : "var(--color-go)",
                    }}
                  />
                </div>
              </div>
            )}

            {result.factors && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  Derating Factors
                </p>
                <dl className="space-y-1.5 text-[13px]">
                  <Factor label="Rated capacity (data plate)" value={`${result.factors.ratedCapacity.toLocaleString()} lbs`} />
                  <Factor label="Ground derate" value={`×${result.factors.groundDerate.toFixed(2)}`} />
                  <Factor label="Reach derate (moment)" value={`×${result.factors.reachDerate.toFixed(2)}`} />
                  <Factor label="Boom-angle derate" value={`×${result.factors.boomAngleDerate.toFixed(2)}`} />
                </dl>
                <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--color-muted)]">
                  Operator fatigue is deliberately absent from this product — being tired does not
                  change where the machine tips. It is raised separately as a CAUTION. The ground
                  figure is a planning heuristic, not a measured value: soft ground is really a
                  ground-bearing-pressure calculation, which needs the machine&apos;s contact area and
                  a real read of the surface.
                </p>
              </div>
            )}

            {result.fallingObject != null && (
              <div className="rounded-lg border border-[var(--color-hardstop)]/40 bg-[rgba(239,68,68,0.08)] p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-hardstop)]">
                  Falling-Object Energy
                </p>
                <p className="mt-1 text-sm text-[var(--color-text)]/85">
                  A {result.fallingObject.weightLbs} lb object from{" "}
                  {Math.round(result.fallingObject.dropHeightFt)} ft arrives at{" "}
                  <span className="font-bold tabular-nums">
                    {Math.round(result.fallingObject.velocityMph)}
                  </span>{" "}
                  mph carrying{" "}
                  <span className="font-bold tabular-nums">
                    {Math.round(result.fallingObject.energyFtLb).toLocaleString()}
                  </span>{" "}
                  ft·lb. The airspace is a work zone.
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-muted)]">
                  Reported as energy and speed, not force — impact force depends on stopping
                  distance and cannot be derived from weight and height alone.
                </p>
              </div>
            )}
          </div>
        </motion.div>
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-[var(--color-muted)]">
          <strong className="text-[var(--color-text)]">Teaching model, not a load chart.</strong>{" "}
          Capacity here is a conservative illustration of how reach, ground and boom angle eat into a
          rating — it is not specific to any machine. The authoritative number is the placarded load
          chart on the machine in front of you. Never lift to a number this page produced.
        </p>
      </div>
    </div>
  );
}

function Factor({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="font-semibold tabular-nums text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

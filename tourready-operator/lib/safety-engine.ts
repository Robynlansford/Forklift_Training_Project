/**
 * Telehandler Safety Engine — Concert & Festival Production
 * ----------------------------------------------------------------------------
 * A TEACHING MODEL. It is not a load chart and must never be used in place of
 * one. Every capacity number it produces is a conservative illustration of how
 * reach, ground and boom angle eat into a machine's rating — the authoritative
 * number is the placarded chart on the machine in front of you.
 *
 * Evaluation runs in strict priority phases; the first failing check wins:
 *   PHASE 1 — BLOCKER    (rigging zone, STOP lexicon, command echo)
 *   PHASE 2 — HARD_STOP  (wind threshold, estimated capacity exceeded)
 *   PHASE 3 — CAUTION    (fatigue, flat boom, crew in the halo zone)
 *   PHASE 4 — GO         (all checks passed)
 *
 * Capacity model (changed 2026-09-08 after audit finding F-02):
 *   The previous model derated reach linearly with a hard floor at 0.5, so it
 *   reported an identical capacity at 15 ft of reach and at 40 ft, and erred
 *   permissive — the dangerous direction. It is now a moment balance, which is
 *   at least physically motivated: load moment = weight x horizontal distance,
 *   so capacity falls as 1/distance and never plateaus.
 * ----------------------------------------------------------------------------
 */

export type SafetyStatus = "GO" | "CAUTION" | "HARD_STOP" | "BLOCKER";

/**
 * Ground-surface margins.
 *
 * NOT measured values and NOT from any standard (audit finding F-14). These are
 * conservative planning heuristics: an ordering of how much confidence a surface
 * deserves, expressed as a multiplier so the simulator can show the effect. The
 * two-decimal form implies a precision that does not exist behind them — read
 * them as "mud deserves a lot more margin than concrete", not as engineering.
 *
 * What actually governs a pick on soft ground is ground bearing pressure: the
 * machine's weight plus load spread over its contact patch, against the ground's
 * allowable bearing capacity. That calculation needs the machine's data, the
 * outrigger or tyre contact area, and a real assessment of the ground. It is not
 * this table, and this table is not a substitute for it.
 */
export const GROUND_DERATE: Record<string, number> = {
  CONCRETE: 1.0,
  ASPHALT: 1.0,
  GRAVEL: 0.95,
  FESTIVAL_MUD: 0.7,
  STAGE_DECK: 0.85,
  GRASS: 0.8,
  DYNAMIC_TRUSS: 0.75,
  LED_WALL: 0.65,
};

/** Human-readable labels for each ground key (UI dropdowns, reports). */
export const GROUND_LABELS: Record<keyof typeof GROUND_DERATE | string, string> = {
  CONCRETE: "Concrete (arena floor)",
  ASPHALT: "Asphalt (parking lot / lot load-in)",
  GRAVEL: "Gravel (festival access road)",
  FESTIVAL_MUD: "Festival mud (rain-soaked field)",
  STAGE_DECK: "Stage deck (temporary decking)",
  GRASS: "Grass (open field)",
  DYNAMIC_TRUSS: "Dynamic truss / rolling base",
  LED_WALL: "LED wall sub-floor (processor deck)",
};

/**
 * Default rated capacity when the operator has not entered the machine's own.
 * This is a starting value for the illustration, not a spec for any machine —
 * enter the rating from the data plate.
 */
export const DEFAULT_RATED_CAPACITY_LBS = 10_000;

/** Retained for backwards compatibility with existing imports. */
export const BASE_CAPACITY_LBS = DEFAULT_RATED_CAPACITY_LBS;

/**
 * Wind speed at which high lifts stop. The curriculum states the rule as
 * "at or above 15 mph", so the comparison is >= — the previous `>` let a
 * steady 15.0 mph reading pass while the course's own scenario failed it.
 * The real limit for a given machine comes from its manual and is often lower.
 */
export const WIND_THRESHOLD_MPH = 15;

/**
 * Nominal horizontal distance from the tipping axis to the load at zero reach,
 * in feet. Anchors the moment model so a zero-reach lift scores 1.0.
 */
const PIVOT_TO_LOAD_FT = 4;

/** Boom angles at or below this (degrees from horizontal) are the steep part of
 *  every real load chart — flagged, not silently averaged away. */
const FLAT_BOOM_DEGREES = 30;

/** Shift length beyond which the engine stops issuing a clean GO. */
const FATIGUE_SHIFT_HRS = 12;

export interface SafetyInputs {
  loadWeightLbs: number;
  /** Machine's rated capacity from its data plate. Defaults to 10,000 lb. */
  ratedCapacityLbs?: number;
  groundType?: keyof typeof GROUND_DERATE | string;
  windSpeedMph?: number;
  riggingZoneClear?: boolean;
  /**
   * The phrase used in the PRE-LIFT comms check — should be "STOP".
   *
   * Renamed from `stopCommandUsed` (audit finding F-16). The old name read as
   * "a STOP was called", which inverted the gate: calling STOP means all motion
   * halts, yet the engine treated an echoed STOP as clearance to proceed. What
   * is actually being modelled is the check that crew and operator share the
   * stop word and that echo discipline works before the pick starts.
   */
  commsCheckPhrase?: string;
  /** Was the comms-check phrase echoed back by the ground crew? */
  commsCheckEchoed?: boolean;
  pushersPresent?: number;
  pushersClearedHaloZone?: boolean;
  boomAngleDegrees?: number;
  liftHeightFt?: number;
  reachFt?: number;
  timeOfDayHrs?: number;
  shiftDurationHrs?: number;
}

/** One thing the engine found wrong, or worth flagging, about this pick. */
export interface Finding {
  severity: SafetyStatus;
  /** Short label for the UI list. */
  title: string;
  detail: string;
}

/** Free-fall result for a dropped object. Energy and speed are well defined;
 *  impact *force* is not, without a stopping distance. */
export interface FallingObject {
  /** Kinetic energy at impact, ft·lb. Equals weight x drop height. */
  energyFtLb: number;
  velocityFtPerSec: number;
  velocityMph: number;
  weightLbs: number;
  dropHeightFt: number;
}

export interface SafetyResult {
  /** The most severe finding. Kept for callers that only need one verdict. */
  status: SafetyStatus;
  reasoning: string;
  /**
   * EVERY finding, most severe first — not just the first one that tripped.
   *
   * The engine used to return on the first failing check (audit finding F-15),
   * so a pick with 40 mph wind AND triple the rated load reported only the
   * wind. Fix that, resubmit, meet the next one. Real pre-lift assessment is
   * holistic, so the whole picture is returned at once.
   */
  findings: Finding[];
  /** Conservative teaching estimate. NOT a load-chart value. */
  estimatedCapacityLbs: number;
  fallingObject: FallingObject | null;
  factors: {
    ratedCapacity: number;
    groundDerate: number;
    reachDerate: number;
    boomAngleDerate: number;
  } | null;
  /** Always true — surfaced in the UI so the number is never mistaken for a chart. */
  advisory: true;
}

const GRAVITY = 32.2; // ft/s^2

/**
 * Free-fall energy and speed for a dropped object.
 *
 * The previous implementation returned `mass x velocity` — momentum, in lb·s —
 * and the UI printed it as "lb impact force". For a 2 lb shackle from 60 ft
 * that rendered as "4 lb", which reads as harmless inside the platform's most
 * severe alert (audit finding F-04).
 *
 * Impact force cannot be derived from weight and height alone; it depends on
 * how quickly the object is brought to rest. Energy and speed can, so those
 * are what we report.
 */
export function calcFallingObject(weightLbs: number, dropHeightFt: number): FallingObject {
  const velocityFtPerSec = Math.sqrt(2 * GRAVITY * dropHeightFt);
  return {
    energyFtLb: weightLbs * dropHeightFt,
    velocityFtPerSec,
    velocityMph: velocityFtPerSec * 0.681818,
    weightLbs,
    dropHeightFt,
  };
}

/**
 * Capacity remaining at a given horizontal reach, as a fraction of rating.
 *
 * Moment balance: the load's overturning moment is weight x horizontal
 * distance, so for a fixed stability moment the allowable weight falls as
 * 1/distance. Monotonic and unbounded below — it never plateaus the way the
 * old `max(1 - reach/25, 0.5)` did.
 */
export function reachCapacityFactor(reachFt: number): number {
  const d = PIVOT_TO_LOAD_FT + Math.max(0, reachFt);
  return PIVOT_TO_LOAD_FT / d;
}

/**
 * Extra margin taken as the boom flattens toward horizontal, where real charts
 * fall away fastest. Reach already carries most of this effect, so the factor
 * is deliberately mild — it exists so a flat-boom pick is never scored the same
 * as a steep one, not to model a specific machine.
 */
export function boomAngleFactor(boomAngleDegrees: number | undefined): number {
  if (boomAngleDegrees == null) return 1;
  const a = Math.max(0, Math.min(90, boomAngleDegrees));
  if (a >= 60) return 1;
  // 60° -> 1.00 down to 0° -> 0.85
  return 1 - ((60 - a) / 60) * 0.15;
}

/**
 * Operator-fatigue state.
 *
 * Fatigue is NOT folded into capacity — a tired operator does not change where
 * a machine tips (audit finding F-13). It gates the operation instead.
 */
export function isFatigueElevated(timeOfDayHrs: number, shiftDurationHrs: number): boolean {
  const lateNight = timeOfDayHrs >= 23 || (timeOfDayHrs >= 0 && timeOfDayHrs < 7);
  return shiftDurationHrs > FATIGUE_SHIFT_HRS || (lateNight && shiftDurationHrs > 10);
}
/** Severity ordering, least to most severe. */
const SEVERITY_RANK: Record<SafetyStatus, number> = {
  GO: 0,
  CAUTION: 1,
  HARD_STOP: 2,
  BLOCKER: 3,
};

/**
 * Evaluate operational conditions for a concert/festival telehandler lift.
 *
 * Collects EVERY finding rather than returning on the first failure, so the
 * operator sees the whole picture at once instead of fixing hazards one at a
 * time (audit finding F-15). `status` is the most severe finding; `findings`
 * holds all of them, most severe first.
 */
export function evaluateSafety(inputs: SafetyInputs): SafetyResult {
  const {
    loadWeightLbs,
    ratedCapacityLbs = DEFAULT_RATED_CAPACITY_LBS,
    groundType = "CONCRETE",
    windSpeedMph = 0,
    riggingZoneClear = true,
    commsCheckPhrase = "",
    commsCheckEchoed = false,
    pushersPresent = 0,
    pushersClearedHaloZone = true,
    boomAngleDegrees,
    liftHeightFt = 0,
    reachFt = 0,
    timeOfDayHrs = 12,
    shiftDurationHrs = 0,
  } = inputs;

  const findings: Finding[] = [];
  let fallingObject: FallingObject | null = null;

  // ── Overhead hazard ───────────────────────────────────────────────────────
  if (!riggingZoneClear) {
    const fallHeight = Math.max(liftHeightFt, 60.0);
    fallingObject = calcFallingObject(2.0, fallHeight);
    findings.push({
      severity: "BLOCKER",
      title: "Rigging zone not clear",
      detail:
        `A 2 lb shackle dropped from ${fallHeight.toFixed(0)} ft arrives at ` +
        `${fallingObject.velocityMph.toFixed(0)} mph carrying ${fallingObject.energyFtLb.toFixed(0)} ft·lb — ` +
        `the same energy as a ${fallingObject.energyFtLb.toFixed(0)} lb weight dropped one foot, ` +
        `concentrated on a point. STOP until the airspace is cleared.`,
    });
  }

  // ── Pre-lift comms check ──────────────────────────────────────────────────
  // Not a live STOP call — this is the check that everyone shares the stop word
  // and that echo discipline works. An unperformed check is an omission
  // (CAUTION), not a lockout; the old code treated an empty field as an
  // "Invalid command received: ''" BLOCKER (audit finding F-16).
  const phrase = commsCheckPhrase.trim();
  if (phrase === "") {
    findings.push({
      severity: "CAUTION",
      title: "Comms check not performed",
      detail:
        "No pre-lift comms check recorded. Confirm the crew's stop word and echo it back before the pick.",
    });
  } else if (phrase.toUpperCase() !== "STOP") {
    findings.push({
      severity: "BLOCKER",
      title: "Non-standard stop word",
      detail:
        `Comms check used '${phrase}'. The standard lexicon is 'STOP' — a crew that does not share ` +
        `one word does not have a working stop. Do not proceed.`,
    });
  } else if (!commsCheckEchoed) {
    findings.push({
      severity: "BLOCKER",
      title: "'STOP' not echoed",
      detail:
        "'STOP' was called and not echoed by the riggers/ground crew. An un-echoed stop word is an " +
        "unverified stop. Re-run the check before any motion.",
    });
  }

  // ── Wind ──────────────────────────────────────────────────────────────────
  if (windSpeedMph >= WIND_THRESHOLD_MPH) {
    findings.push({
      severity: "HARD_STOP",
      title: `Wind ${windSpeedMph.toFixed(1)} mph`,
      detail:
        `At or above the ${WIND_THRESHOLD_MPH} mph threshold — no high lifts. ` +
        `Check the machine's manual; its limit may be lower still.`,
    });
  }

  // ── Capacity ──────────────────────────────────────────────────────────────
  const groundDerate = GROUND_DERATE[String(groundType).toUpperCase()] ?? 0.7;
  const reachDerate = reachCapacityFactor(reachFt);
  const boomDerate = boomAngleFactor(boomAngleDegrees);
  const estimatedCapacityLbs = Math.max(
    ratedCapacityLbs * groundDerate * reachDerate * boomDerate,
    0
  );
  const factors = {
    ratedCapacity: ratedCapacityLbs,
    groundDerate,
    reachDerate,
    boomAngleDerate: boomDerate,
  };

  if (loadWeightLbs > estimatedCapacityLbs) {
    findings.push({
      severity: "HARD_STOP",
      title: "Load over estimated capacity",
      detail:
        `${loadWeightLbs.toFixed(0)} lb requested against an estimated ${estimatedCapacityLbs.toFixed(0)} lb ` +
        `available at ${reachFt.toFixed(0)} ft of reach. Shorten the reach, split the load, or reposition — ` +
        `and confirm against the machine's load chart before any pick.`,
    });
  }

  // ── Halo zone ─────────────────────────────────────────────────────────────
  if (pushersPresent > 0 && !pushersClearedHaloZone) {
    findings.push({
      severity: "CAUTION",
      title: `${pushersPresent} in the halo zone`,
      detail: "Pushers inside the 3-ft rear-swing halo. Hold all movement until they are clear.",
    });
  }

  // ── Fatigue ───────────────────────────────────────────────────────────────
  if (isFatigueElevated(timeOfDayHrs, shiftDurationHrs)) {
    findings.push({
      severity: "CAUTION",
      title: "Fatigue window",
      detail:
        `${shiftDurationHrs.toFixed(0)} h into the shift at ` +
        `${String(Math.floor(timeOfDayHrs)).padStart(2, "0")}:00 — reaction time and peripheral scanning ` +
        `are degraded. The machine's capacity is unchanged; your margin is not. Slow every movement and ` +
        `request relief before complex picks.`,
    });
  }

  // ── Flat boom ─────────────────────────────────────────────────────────────
  if (boomAngleDegrees != null && boomAngleDegrees <= FLAT_BOOM_DEGREES) {
    findings.push({
      severity: "CAUTION",
      title: `Boom flat at ${boomAngleDegrees.toFixed(0)}°`,
      detail:
        "In the range where load charts fall off fastest. Verify this exact pick on the chart before committing.",
    });
  }

  // ── Crew on the load ──────────────────────────────────────────────────────
  // Deliberately NOT a CAUTION. Pushers are present on essentially every real
  // load-out, so flagging their mere presence made GO nearly unreachable and
  // manufactured alarm fatigue (audit finding F-15). It is a standing condition
  // to work within, not an exception — only an uncleared halo is a CAUTION.
  if (pushersPresent > 0 && pushersClearedHaloZone) {
    findings.push({
      severity: "GO",
      title: `${pushersPresent} on the load`,
      detail: "Halo clear. Maintain slow speed and keep watching the ground crew.",
    });
  }

  findings.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const blocking = findings.filter((f) => f.severity !== "GO");
  const status: SafetyStatus = blocking.length ? blocking[0].severity : "GO";

  const reasoning =
    status === "GO"
      ? "Checks passed on the values entered. Confirm the pick against the machine's load chart, " +
        "maintain Up-Look protocol and keep 'STOP' readiness."
      : blocking.length === 1
        ? blocking[0].detail
        : `${blocking.length} issues found — most severe first. ${blocking[0].detail}`;

  // Capacity is meaningless once the pick is locked out.
  const reportedCapacity = status === "BLOCKER" ? 0 : estimatedCapacityLbs;

  return {
    status,
    reasoning,
    findings,
    estimatedCapacityLbs: reportedCapacity,
    fallingObject,
    factors,
    advisory: true,
  };
}

/** Visual + semantic metadata for each status — consumed across the UI. */
export const STATUS_META: Record<
  SafetyStatus,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  GO: {
    label: "GO",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.4)",
    description: "Cleared to proceed",
  },
  CAUTION: {
    label: "CAUTION",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.4)",
    description: "Proceed with active mitigation",
  },
  HARD_STOP: {
    label: "HARD STOP",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.4)",
    description: "Threshold breached — do not lift",
  },
  BLOCKER: {
    label: "BLOCKER",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.14)",
    border: "rgba(220,38,38,0.5)",
    description: "Hard rule violated — operation locked out",
  },
};

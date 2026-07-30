/**
 * Telehandler Safety Engine — Concert & Festival Production
 * ----------------------------------------------------------------------------
 * Faithful TypeScript port of the canonical Python `TelehandlerSafetyEngine`.
 * This is the SINGLE SOURCE OF TRUTH for any safety evaluation in the app.
 *
 * The evaluation runs in strict priority phases. The first failing check wins:
 *   PHASE 1 — BLOCKER    (rigging zone, STOP lexicon, command echo)
 *   PHASE 2 — HARD_STOP  (wind threshold, derated capacity exceeded)
 *   PHASE 3 — CAUTION    (pushers in halo zone / crew on load)
 *   PHASE 4 — GO         (all checks passed)
 *
 * Calculations mirror the source exactly:
 *   • Ground-type derating (concert/festival-specific surfaces)
 *   • Fatigue modifier (late-night + long-shift compounding)
 *   • Reach derating
 *   • Falling-object impact force (kinetic, lb·ft/s units as in source)
 * ----------------------------------------------------------------------------
 */

export type SafetyStatus = "GO" | "CAUTION" | "HARD_STOP" | "BLOCKER";

/** Concert/festival ground surfaces and their capacity derating multipliers. */
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

export const BASE_CAPACITY_LBS = 10_000;
export const WIND_THRESHOLD_MPH = 15;

export interface SafetyInputs {
  loadWeightLbs: number;
  groundType?: keyof typeof GROUND_DERATE | string;
  windSpeedMph?: number;
  riggingZoneClear?: boolean;
  stopCommandUsed?: string;
  commandEchoed?: boolean;
  pushersPresent?: number;
  pushersClearedHaloZone?: boolean;
  boomAngleDegrees?: number;
  liftHeightFt?: number;
  reachFt?: number;
  timeOfDayHrs?: number;
  shiftDurationHrs?: number;
}

export interface SafetyResult {
  status: SafetyStatus;
  reasoning: string;
  deratedCapacityLbs: number;
  estimatedImpactForceLbs: number | null;
  /** Breakdown of the derating math, surfaced for the simulator's reasoning panel. */
  factors: {
    base: number;
    groundDerate: number;
    fatigueDerate: number;
    reachDerate: number;
  } | null;
}

const GRAVITY = 32.2; // ft/s^2

/**
 * Falling-object impact force, ported exactly from the source:
 *   v = sqrt(2 * g * h);  m = weight / g;  impact = m * v
 * Returns the same lb·(ft/s) magnitude the source manual quotes.
 */
export function calcFallingObjectImpact(weightLbs: number, dropHeightFt: number): number {
  const velocity = Math.sqrt(2 * GRAVITY * dropHeightFt);
  const mass = weightLbs / GRAVITY;
  return mass * velocity;
}

/**
 * Fatigue modifier — compounds a late-night penalty with a long-shift penalty.
 * Mirrors the source: nights (23:00–06:59) apply 0.95; shifts >12h ramp down to
 * a 0.8 floor; shifts >10h apply 0.90.
 */
export function calcFatigueModifier(timeOfDayHrs: number, shiftDurationHrs: number): number {
  let modifier = 1.0;
  if (timeOfDayHrs >= 23 || (timeOfDayHrs >= 0 && timeOfDayHrs < 7)) {
    modifier *= 0.95;
  }
  if (shiftDurationHrs > 12) {
    modifier *= Math.max(0.8, 1.0 - (shiftDurationHrs - 12) * 0.05);
  } else if (shiftDurationHrs > 10) {
    modifier *= 0.9;
  }
  return modifier;
}

/**
 * Evaluate operational conditions for a concert/festival telehandler lift.
 * Returns the first failing safety state in strict phase priority order.
 */
export function evaluateSafety(inputs: SafetyInputs): SafetyResult {
  const {
    loadWeightLbs,
    groundType = "CONCRETE",
    windSpeedMph = 0,
    riggingZoneClear = true,
    stopCommandUsed = "",
    commandEchoed = false,
    pushersPresent = 0,
    pushersClearedHaloZone = true,
    liftHeightFt = 0,
    reachFt = 0,
    timeOfDayHrs = 12,
    shiftDurationHrs = 0,
  } = inputs;

  // ── PHASE 1: BLOCKER CHECKS ───────────────────────────────────────────────
  if (!riggingZoneClear) {
    const fallHeight = Math.max(liftHeightFt, 60.0);
    const impactForce = calcFallingObjectImpact(2.0, fallHeight);
    return {
      status: "BLOCKER",
      reasoning: `Rigging zone NOT clear. Overhead hazard confirmed (est. ${impactForce.toFixed(
        0
      )} lb impact force from typical rig height). STOP operations until cleared.`,
      deratedCapacityLbs: 0,
      estimatedImpactForceLbs: impactForce,
      factors: null,
    };
  }

  if (stopCommandUsed.toUpperCase() !== "STOP") {
    return {
      status: "BLOCKER",
      reasoning: `Invalid command received: '${stopCommandUsed}'. Standard lexicon requires 'STOP'. Do not proceed.`,
      deratedCapacityLbs: 0,
      estimatedImpactForceLbs: null,
      factors: null,
    };
  }

  if (!commandEchoed) {
    return {
      status: "BLOCKER",
      reasoning:
        "'STOP' was NOT echoed by riggers/ground crew. Confirmation required before proceeding.",
      deratedCapacityLbs: 0,
      estimatedImpactForceLbs: null,
      factors: null,
    };
  }

  // ── PHASE 2: HARD_STOP CHECKS ─────────────────────────────────────────────
  if (windSpeedMph > WIND_THRESHOLD_MPH) {
    return {
      status: "HARD_STOP",
      reasoning: `Wind speed ${windSpeedMph.toFixed(
        1
      )} mph exceeds ${WIND_THRESHOLD_MPH} mph safety threshold. Tip-over risk with elevated load.`,
      deratedCapacityLbs: 0,
      estimatedImpactForceLbs: null,
      factors: null,
    };
  }

  const groundDerate = GROUND_DERATE[String(groundType).toUpperCase()] ?? 0.7;
  const fatigueDerate = calcFatigueModifier(timeOfDayHrs, shiftDurationHrs);
  const reachDerate = Math.max(1.0 - reachFt / 25.0, 0.5);

  let finalCapacity = BASE_CAPACITY_LBS * groundDerate * fatigueDerate * reachDerate;
  finalCapacity = Math.max(finalCapacity, 100.0);

  const factors = {
    base: BASE_CAPACITY_LBS,
    groundDerate,
    fatigueDerate,
    reachDerate,
  };

  if (loadWeightLbs > finalCapacity) {
    return {
      status: "HARD_STOP",
      reasoning: `Load ${loadWeightLbs.toFixed(0)} lbs exceeds derated capacity ${finalCapacity.toFixed(
        0
      )} lbs. Reduce load or shorten reach.`,
      deratedCapacityLbs: finalCapacity,
      estimatedImpactForceLbs: null,
      factors,
    };
  }

  // ── PHASE 3: CAUTION CHECKS ───────────────────────────────────────────────
  if (pushersPresent > 0 && !pushersClearedHaloZone) {
    return {
      status: "CAUTION",
      reasoning: `Pushers (${pushersPresent}) detected in 3-ft halo zone. Hold movement until clear.`,
      deratedCapacityLbs: finalCapacity,
      estimatedImpactForceLbs: null,
      factors,
    };
  }

  if (pushersPresent > 0) {
    return {
      status: "CAUTION",
      reasoning: `Ground crew (${pushersPresent}) on load. Maintain slow speed.`,
      deratedCapacityLbs: finalCapacity,
      estimatedImpactForceLbs: null,
      factors,
    };
  }

  // ── PHASE 4: GO ───────────────────────────────────────────────────────────
  return {
    status: "GO",
    reasoning: "All safety checks passed. Maintain Up-Look protocol and 'STOP' readiness.",
    deratedCapacityLbs: finalCapacity,
    estimatedImpactForceLbs: null,
    factors,
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

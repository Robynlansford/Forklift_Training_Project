/**
 * Living Pages — section figures on module pages.
 *
 * Each figure is drawn by public/living/fx.js from the numbers below, and every
 * number is copied from the module's own text in lib/curriculum.ts (or, where
 * noted, from lib/safety-engine.ts / lib/glossary.ts, which the site also shows).
 * `source` records exactly where; the caption repeats the words on screen so
 * the canvas is never the only place a fact lives.
 */
export interface ModuleFigure {
  /** Section heading (exact) the figure belongs to. */
  heading: string;
  fx: "gauge" | "zone" | "drop" | "capacity" | "shift" | "panel" | "forks";
  data: Record<string, unknown>;
  caption: string;
  /** Honesty tag shown on the figure. */
  tag?: string;
  aspect?: string;
  aspectSmall?: string;
  source: string;
}

export const MODULE_FIGURES: Record<string, ModuleFigure[]> = {
  "heavy-physics": [
    {
      heading: "The Sail Effect (Wind-Load Derating)",
      fx: "gauge",
      data: { max: 35, limit: 15, value: 15, derate: "20–30%" },
      caption:
        "If wind is at or above 15 mph — STOP. Do not lift. If below 15 mph, derate: assume safe capacity is 20–30% lower than the chart.",
      tag: "Illustration",
      aspect: "16 / 8",
      aspectSmall: "5 / 4",
      source:
        "curriculum.ts heavy-physics › The Sail Effect, steps 2–3; dial range 0–35 mph = the Safety Engine's wind slider (components/safety-engine-form.tsx max={35}).",
    },
  ],
  "ground-crew-choreography": [
    {
      heading: "The 3-Foot Rear-Swing Halo Zone",
      fx: "zone",
      data: { mode: "halo", radius: 3 },
      caption:
        "Counterbalance machines steer from the rear — the back swings 3–4 ft opposite your turn. Tap the horn, make eye contact, confirm the 3-foot zone behind and beside you is clear, then turn.",
      tag: "Schematic · not to scale",
      aspect: "16 / 9",
      aspectSmall: "1 / 1",
      source: "curriculum.ts ground-crew-choreography › The 3-Foot Rear-Swing Halo Zone, lede + steps 1–4.",
    },
  ],
  "spotter-signals": [
    {
      heading: "The 10-Foot Zone of Safety",
      fx: "zone",
      data: { mode: "pedestrian", radius: 10 },
      caption: "Anyone inside 10 feet of the machine and the wheels stop moving. No exceptions, no ‘they'll move.’",
      tag: "Illustration",
      aspect: "16 / 9",
      aspectSmall: "1 / 1",
      source: "curriculum.ts spotter-signals › The 10-Foot Zone of Safety, body + Core Drill callout.",
    },
  ],
  "rigging-coordination": [
    {
      heading: "The Up-Look Protocol",
      fx: "drop",
      data: { weight: 2, height: 60, bandLo: 40, bandHi: 80, max: 80 },
      caption:
        "High-riggers work 40–80 feet above the floor. A 2 lb shackle dropped from 60 ft arrives at 42 mph carrying 120 ft·lb — the Safety Engine's falling-object model, which reports energy and speed rather than force. The drop plays in real fall time.",
      tag: "Illustration · real fall time",
      aspect: "16 / 9",
      aspectSmall: "4 / 5",
      source:
        "curriculum.ts rigging-coordination › whyItMatters (40–80 ft, 2 lb, 60 ft); 42 mph and 120 ft·lb from safety-engine.ts calcFallingObject(2, 60), the same numbers the simulator prints for its Rigging Zone Hot preset.",
    },
  ],
  "outdoor-festival-ops": [
    {
      heading: "Boom Extension & Leverage",
      fx: "capacity",
      data: {
        rated: 10000,
        maxReach: 30,
        grounds: [
          { key: "CONCRETE", label: "Concrete", derate: 1.0 },
          { key: "FESTIVAL_MUD", label: "Festival mud", derate: 0.7 },
        ],
        ground: "CONCRETE",
      },
      caption:
        "The farther the boom reaches, the less it can lift. Curves from the Safety Engine's teaching model: a 10,000 lb default rating, ground margins ×1.00 concrete and ×0.70 festival mud. Teaching model, not a load chart — the placarded chart on the machine is the authority.",
      tag: "Teaching model · not a load chart",
      aspect: "16 / 8",
      aspectSmall: "4 / 3",
      source:
        "safety-engine.ts DEFAULT_RATED_CAPACITY_LBS, GROUND_DERATE, reachCapacityFactor (4 ft pivot); wording from the simulator's own disclaimer.",
    },
  ],
  "fatigue-pressure": [
    {
      heading: "The Hero Operator Trap",
      fx: "shift",
      data: { max: 18, relief: 14 },
      caption:
        "Reaction time at 14+ hours is severely degraded; tunnel vision misses peripheral hazards; microsleep can drop a load or crush someone. 14+ hours = request relief before any complex lift.",
      tag: "Illustration",
      aspect: "16 / 6",
      aspectSmall: "4 / 3",
      source:
        "curriculum.ts fatigue-pressure › The Hero Operator Trap; glossary.ts QUICK_REFERENCE.fatigue; 18 h axis = the simulator's shift slider max.",
    },
  ],
  capstone: [
    {
      heading: "The Situation",
      fx: "panel",
      data: { time: "02:00", shift: 14, load: 10000, wind: 17, limit: 15, riggers: 60, truck: 45 },
      caption:
        "The Situation, all at once: 2:00 AM · 14 hours in · a 10,000 lb LED wall section · 17 mph gusting against the 15 mph limit · high-riggers active 60 ft above · the truck rolls in 45 minutes.",
      aspect: "16 / 7",
      aspectSmall: "4 / 5",
      source: "curriculum.ts capstone › The Situation (body); 15 mph limit from heavy-physics.",
    },
  ],
  "truck-pack-logistics": [
    {
      heading: "The Flush-Fork Rule",
      fx: "forks",
      data: { fork: 48, cart: 36 },
      caption:
        "48-inch forks in a 36-inch-deep cart leave tips protruding — invisible to anyone behind. Do not push the forks all the way through; keep the extra fork length visible on your side.",
      tag: "Illustration",
      aspect: "16 / 6",
      aspectSmall: "4 / 3",
      source: "curriculum.ts truck-pack-logistics › The Flush-Fork Rule, lede + steps 1–2.",
    },
  ],
};

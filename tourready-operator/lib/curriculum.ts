/**
 * ============================================================================
 *  TOURREADY OPERATOR — CENTRAL CURRICULUM (SINGLE SOURCE OF TRUTH)
 * ============================================================================
 *
 *  ▸ Everything the platform teaches and grades lives in this one file.
 *  ▸ The dashboard, module pages, interactive trainer, certification, and
 *    resources are ALL generated from the `MODULES` array below.
 *
 *  ────────────────────────────────────────────────────────────────────────
 *  HOW TO ADD A NEW MODULE (zero component changes required):
 *  ────────────────────────────────────────────────────────────────────────
 *  1. Append a new `Module` object to the `MODULES` array.
 *  2. Give it a unique `slug` (URL), an `order`, a Lucide `icon` name, and
 *     a `title` / `subtitle`.
 *  3. Add `sections` (theory) — each renders with proper hierarchy + callouts.
 *  4. Add `scenarios` (interactive practice) — each needs a `prompt`,
 *     `passKeywords`, `failKeywords`, a `technique` name, and a `concept`
 *     explanation. The generic trainer handles the rest.
 *  5. (Optional) tune `passThreshold` (defaults to 0.6 — 60%).
 *
 *  That's it. No routing, no component edits. See README "Adding a Module".
 *  ────────────────────────────────────────────────────────────────────────
 */

export type CalloutKind = "tour-reality" | "core-drill" | "hard-rule";

export interface Callout {
  kind: CalloutKind;
  title: string;
  body: string;
}

export interface ContentSection {
  /** Section heading shown in the module reader. */
  heading: string;
  /** Optional short framing line shown under the heading. */
  lede?: string;
  /** Body paragraphs (plain prose). */
  body?: string[];
  /** Ordered, numbered procedure steps. */
  steps?: string[];
  /** Optional emphasis box rendered after the body/steps. */
  callout?: Callout;
}

export interface Scenario {
  id: string;
  /** The named technique this scenario drills (always surfaced to the learner). */
  technique: string;
  /** The on-the-job situation the operator must respond to. */
  prompt: string;
  /** Concepts/keywords that indicate a correct decision. */
  passKeywords: string[];
  /** Keywords that indicate a clearly wrong / dangerous decision. */
  failKeywords: string[];
  /** Instructor explanation of the correct answer + the named rule. */
  concept: string;
}

export interface Module {
  id: number;
  slug: string;
  order: number;
  /** Lucide icon name (see components/icon.tsx mapping). */
  icon: string;
  title: string;
  subtitle: string;
  /** One-line summary for cards. */
  summary: string;
  /** Why this module matters — shown prominently at the top. */
  whyItMatters: string;
  /** Estimated minutes to complete the reading. */
  readMinutes: number;
  sections: ContentSection[];
  scenarios: Scenario[];
  /** Fraction (0–1) of scenarios that must pass. Defaults to 0.6. */
  passThreshold?: number;
}

export const DEFAULT_PASS_THRESHOLD = 0.6;

export const MODULES: Module[] = [
  // ── MODULE 0 ───────────────────────────────────────────────────────────
  {
    id: 0,
    slug: "basic-controls",
    order: 0,
    icon: "Gauge",
    title: "Basic Machine Controls",
    subtitle: "Pre-operation discipline & fundamental handling",
    summary: "Inspection, mounting, controls, and the safe load cycle that every shift starts with.",
    whyItMatters:
      "Before any concert-specific hazard exists, the fundamentals have to be automatic. A skipped pre-op or a high-traveled load ends careers in a warehouse — let alone a packed arena floor at 2:00 AM.",
    readMinutes: 8,
    sections: [
      {
        heading: "Pre-Operation Inspection",
        lede: "Do this EVERY time. If any item fails — do not operate. Report it immediately.",
        steps: [
          "Tires — no cracks, properly inflated",
          "Forks or boom — no cracks, no bent tips",
          "Under the machine — no fluid leaks on the ground",
          "Seat belt — buckles and holds",
          "Mirrors — clean and adjusted",
          "Horn — press it, confirm it works",
          "Lights — all working",
          "Parking brake — set it, confirm the machine does not roll",
        ],
        callout: {
          kind: "hard-rule",
          title: "Grounding conditions",
          body: "Cracked forks, a fluid leak under the machine, or a failed parking brake ground the machine immediately. There is no 'careful' workaround.",
        },
      },
      {
        heading: "Mounting & Starting",
        steps: [
          "Always approach from the LEFT side",
          "Use the steps and handrails — never jump up or down",
          "Sit fully back, adjust to reach all pedals, buckle the seat belt EVERY time",
          "Confirm NEUTRAL, engage the parking brake before starting",
          "Key to start; let the engine warm 30–60 seconds before moving",
          "Test horn (one tap), brakes (gentle), hydraulics (raise/lower forks slightly)",
        ],
      },
      {
        heading: "Main & Telehandler Controls",
        body: [
          "Sit-down forklift: steering wheel, accelerator and brake (right foot), parking brake, mast lift lever (pull back = up), mast tilt lever (pull back = tilt back / safer), side-shift, and horn.",
          "Telehandler-specific: boom lift, boom extend / retract, boom tilt (fork angle at the end of the boom), outriggers for tall lifts, and steering modes (2-wheel, 4-wheel, crab).",
        ],
      },
      {
        heading: "The Load Cycle",
        lede: "Pick up · Travel · Place — the same disciplined sequence every time.",
        steps: [
          "Approach straight on, stop ~1 ft from the load, lower forks to entry height, level them",
          "Drive forward slowly until forks are fully under the load; lift just to clear the ground",
          "Tilt back slightly for stability; reverse slowly away",
          "Travel with the load LOW (4–8 inches), tilted slightly back, slow, looking in your direction of travel",
          "Honk before intersections or blind corners",
          "Place: approach straight on, raise to height, lower gently until stable, tilt forward to release, back away and confirm stability",
        ],
        callout: {
          kind: "tour-reality",
          title: "Travel low or don't travel",
          body: "On a load-in floor crowded with stagehands, a load carried high is a blind battering ram. 4–8 inches, tilted back — non-negotiable.",
        },
      },
    ],
    scenarios: [
      {
        id: "m0-s1",
        technique: "Left-Side Approach",
        prompt: "Which side do you always approach the forklift from, and why?",
        passKeywords: ["left", "left side"],
        failKeywords: ["right", "either"],
        concept:
          "Always approach from the left side — the standard egress/entry point on all production machines.",
      },
      {
        id: "m0-s2",
        technique: "Low-Travel Rule",
        prompt:
          "You've picked up a 3,000 lb flight case and need to drive 40 feet to the truck bay. How do you carry it?",
        passKeywords: ["low", "4", "8 inch", "tilt back", "tilted back"],
        failKeywords: ["high", "forward", "level"],
        concept:
          "Travel with forks 4–8 inches off the ground and tilted slightly back. Never travel high.",
      },
      {
        id: "m0-s3",
        technique: "Pre-Op Grounding Conditions",
        prompt:
          "Name three items from your pre-operation inspection that would ground the machine immediately if failed.",
        passKeywords: ["crack", "leak", "brake", "seat belt", "horn", "tire"],
        failKeywords: [],
        concept:
          "Cracked forks, fluid leaks under the machine, and a failed parking brake are all immediate grounding conditions.",
      },
      {
        id: "m0-s4",
        technique: "Buckle-Every-Time Rule",
        prompt:
          "You're mounting the forklift for a quick 30-foot repositioning move. The belt is annoying and it's a short hop. Do you buckle?",
        passKeywords: ["yes", "always", "every time", "buckle", "seat belt"],
        failKeywords: ["no", "short", "skip", "quick"],
        concept:
          "Buckle the seat belt EVERY time, every move, no exceptions. In a tip-over the belt keeps you in the cage — 'short hop' is exactly when operators skip it and get crushed.",
      },
      {
        id: "m0-s5",
        technique: "Mast Tilt Direction",
        prompt:
          "You've just lifted a load clear of the ground and want to stabilize it for travel. Which way do you tilt the mast, and why is that the safer direction?",
        passKeywords: ["back", "tilt back", "pull back", "toward", "stability", "stable"],
        failKeywords: ["forward", "tilt forward", "level only"],
        concept:
          "Tilt the mast BACK (pull the lever back) to cradle the load toward the machine. Tilting back keeps the load's weight over the wheels for stability; tilting forward is only for releasing a placed load.",
      },
      {
        id: "m0-s6",
        technique: "Cold-Start Sequence",
        prompt:
          "You've climbed in and inserted the key. Before you turn it, what two things must be confirmed — and what do you do for the first 30–60 seconds?",
        passKeywords: ["neutral", "parking brake", "brake set", "warm", "warm up", "warm-up", "idle"],
        failKeywords: ["drive off", "immediately", "gear"],
        concept:
          "Confirm NEUTRAL and engage the parking brake before starting. Let the engine warm 30–60 seconds before moving, then test horn, brakes, and hydraulics.",
      },
      {
        id: "m0-s7",
        technique: "Blind-Corner Horn",
        prompt:
          "You're carrying a load toward a blind corner where a hallway meets the dock. What do you do before entering the intersection?",
        passKeywords: ["honk", "horn", "tap", "slow", "sound"],
        failKeywords: ["speed up", "keep going", "assume clear"],
        concept:
          "Honk before every intersection or blind corner and slow down. Assume someone is on the other side you cannot see — the horn is your only warning to unseen crew.",
      },
      {
        id: "m0-s8",
        technique: "Load-Placement Sequence",
        prompt:
          "You've traveled a heavy case to its spot and need to set it down cleanly. Walk the placement sequence — approach through release.",
        passKeywords: ["approach", "straight", "raise", "height", "lower", "tilt forward", "release", "back away", "stable"],
        failKeywords: ["drop", "yank", "reverse fast"],
        concept:
          "Approach straight on, raise to height, lower gently until stable, tilt the forks forward to release, then back away slowly and confirm the load's stability before leaving.",
      },
    ],
  },

  // ── MODULE 1 — LEGAL BASELINES ──────────────────────────────────────────
  {
    id: 1,
    slug: "legal-baselines",
    order: 1,
    icon: "FileCheck",
    title: "Legal Baselines & Certification",
    subtitle: "The federal floor every touring operator stands on",
    summary:
      "The OSHA 29 CFR 1910.178 three-part mandate, the PIT class certifications, and the MEWP add-ons.",
    whyItMatters:
      "A warehouse card is not a tour license. Operating a class of machine you aren't certified on — or skipping the workplace evaluation — voids insurance and drops the whole tour's liability onto you personally.",
    readMinutes: 8,
    sections: [
      {
        heading: "The Legal Reality — Who Certifies You",
        lede: "Here is how the legal reality breaks down according to OSHA standard 29 CFR 1910.178:",
        body: [
          "OSHA sets the rules, they don't teach the class: OSHA writes the safety standards and regulations that must be followed.",
          "The legal burden is 100% on the employer: OSHA explicitly states that the employer (the concert labor company, production house, or venue) is the only entity that can officially \"certify\" an operator.",
        ],
        callout: {
          kind: "hard-rule",
          title: "The official paperwork",
          body: "When you are legally certified to drive a forklift, the document must list the operator's name, the training date, the evaluation date, and the signature of the specific person who watched you drive.",
        },
      },
      {
        heading: "The OSHA 29 CFR 1910.178 Three-Part Mandate",
        lede: "Certification is not one class you sit once. It is three distinct pillars.",
        steps: [
          "Formal instruction — classroom or online: truck physics, center of gravity, load stability",
          "Practical training — hands-on maneuvers on the actual type of machine",
          "Employer evaluation — a formal performance assessment in the actual workplace",
          "Re-evaluation at least every 3 years, and after any incident, near-miss, or new equipment",
        ],
        callout: {
          kind: "hard-rule",
          title: "No evaluation, no operation",
          body: "Missing any one of the three pillars makes the certification invalid — no matter how experienced the operator is.",
        },
      },
      {
        heading: "The PIT Classification Trap",
        lede: "A certification is per-class, never universal.",
        body: [
          "Powered Industrial Truck (PIT) classes: Class 1 electric sit-down counterbalance and Class 4/5 internal-combustion counterbalance (cushion or pneumatic tire) move road cases, cable trunks, and rigging steel inside arenas and convention centers.",
          "Class 7 rough-terrain forklift / telehandler — the 'shooting boom' (Skytrak, JLG, CAT) — builds outdoor stages, moves generators, and works muddy, uncompacted terrain.",
          "A Class 1/4/5 warehouse card does NOT legally authorize a Class 7 telehandler. They are separate machines with separate certifications.",
        ],
        callout: {
          kind: "hard-rule",
          title: "Separate cert per class",
          body: "Every distinct machine class needs its own documented certification and its own hands-on evaluation. On tour, cross-training is mandatory — never assumed.",
        },
      },
      {
        heading: "MEWP Certification (ANSI A92)",
        body: [
          "Touring operators routinely run aerial machines alongside forklifts. Under the ANSI A92 standard, operators must hold MEWP (Mobile Elevating Work Platform) certification for the machines they use.",
          "Boom lifts are Type 3, Group B; scissor lifts are Type 3, Group A. They are used in tandem with forklifts to fly lighting trusses and audio arrays into position — and they are entirely separate credentials from any PIT class.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — match the card to the machine",
          body: "Before you touch a boom or scissor lift, confirm you hold a current MEWP A92 certification for that type. A forklift card covers neither.",
        },
      },
      {
        heading: "The Credentials Tour Companies Require",
        body: [
          "Beyond the federal minimum, major production companies (Live Nation, AEG) and union venues expect more: an OSHA 10 card for touring crew, OSHA 30 for production managers and site heads.",
          "The Event Safety Alliance (ESA) Event Access Safety Training (EAST) is designed for the chaotic backstage load-in. Basic rigging awareness — load capacities and hoist mechanics — is highly valued even if you're not the head rigger.",
        ],
        callout: {
          kind: "tour-reality",
          title: "Cards live in your pocket",
          body: "On tour you physically present these credentials at each venue. Keep current copies on you — an expired card at the dock is the same as no card.",
        },
      },
    ],
    scenarios: [
      {
        id: "m-legal-s1",
        technique: "OSHA Three-Part Mandate",
        prompt:
          "Name the three pillars OSHA 29 CFR 1910.178 requires for a valid forklift certification.",
        passKeywords: [
          "formal",
          "instruction",
          "classroom",
          "practical",
          "hands-on",
          "hands on",
          "evaluation",
          "employer",
          "workplace",
        ],
        failKeywords: ["just a class", "online only", "one test", "single"],
        concept:
          "Formal instruction + practical hands-on training + an employer evaluation in the actual workplace. All three, or the certification is invalid.",
      },
      {
        id: "m-legal-s2",
        technique: "PIT Classification Trap",
        prompt:
          "You're certified on a Class 1 warehouse sit-down forklift. The festival needs someone on a Class 7 rough-terrain telehandler. Are you legally cleared to operate it?",
        passKeywords: [
          "no",
          "not certified",
          "separate",
          "different class",
          "class 7",
          "need",
          "own cert",
        ],
        failKeywords: ["yes", "same", "close enough", "sure", "covered"],
        concept:
          "PIT Classification Trap: a warehouse-class card never authorizes a Class 7 telehandler. Each class needs its own documented certification and evaluation.",
      },
      {
        id: "m-legal-s3",
        technique: "MEWP A92 Requirement",
        prompt:
          "You're asked to hop on a boom lift to help fly a lighting truss. What certification must you hold beyond your forklift card?",
        passKeywords: ["mewp", "a92", "ansi", "boom", "aerial", "separate", "type 3"],
        failKeywords: ["forklift covers", "none", "same card", "nothing extra"],
        concept:
          "MEWP certification under ANSI A92 is required for boom (Type 3 Group B) and scissor (Type 3 Group A) lifts — a PIT forklift card does not cover them.",
      },
      {
        id: "m-legal-s4",
        technique: "Site-Specific Evaluation",
        prompt:
          "OSHA ties the employer evaluation to the actual workplace. The tour just rolled into a new stadium with totally different terrain and pedestrian flow. Why does that matter legally?",
        passKeywords: [
          "re-evaluate",
          "reevaluate",
          "site-specific",
          "site specific",
          "new environment",
          "each venue",
          "conditions changed",
          "assess",
        ],
        failKeywords: ["one time", "doesn't matter", "already certified", "no need"],
        concept:
          "Certification is tied to workplace conditions. Every new venue changes terrain and hazards — which is why touring operators re-assess site conditions at each stop.",
      },
      {
        id: "m-legal-s5",
        technique: "Re-Evaluation Interval",
        prompt:
          "How often does OSHA require a forklift operator to be re-evaluated, and what events force a re-evaluation before that clock runs out?",
        passKeywords: ["3 year", "three year", "every three", "incident", "near-miss", "near miss", "accident", "new equipment"],
        failKeywords: ["never", "once", "lifetime", "no re"],
        concept:
          "Re-evaluation is required at least every 3 years — and immediately after any incident, near-miss, or when the operator is put on new equipment. The 3-year clock is a ceiling, not a guarantee.",
      },
      {
        id: "m-legal-s6",
        technique: "Class 7 Identification",
        prompt:
          "The festival needs a machine to build an outdoor stage on muddy, uncompacted ground and move generators. Which PIT class is that, and what's its nickname?",
        passKeywords: ["class 7", "rough terrain", "rough-terrain", "telehandler", "shooting boom", "skytrak"],
        failKeywords: ["class 1", "class 4", "class 5", "warehouse"],
        concept:
          "That's a Class 7 rough-terrain forklift / telehandler — the 'shooting boom' (Skytrak, JLG, CAT). It's built for outdoor, uncompacted terrain and is a separate certification from any warehouse class.",
      },
      {
        id: "m-legal-s7",
        technique: "Indoor Class Selection",
        prompt:
          "Inside an arena you're moving cable trunks and rigging steel across the floor. Which PIT classes cover that work, and which is preferred for enclosed air quality?",
        passKeywords: ["class 1", "class 4", "class 5", "electric", "counterbalance", "internal combustion"],
        failKeywords: ["class 7", "telehandler", "rough terrain"],
        concept:
          "Class 1 electric sit-down and Class 4/5 internal-combustion counterbalance trucks move road cases and rigging steel indoors. Favor Class 1 electric in enclosed venues to avoid combustion fumes.",
      },
      {
        id: "m-legal-s8",
        technique: "OSHA 10 vs OSHA 30",
        prompt:
          "A major promoter like Live Nation expects safety cards beyond the federal minimum. Which card do they expect for touring crew, and which for production managers and site heads?",
        passKeywords: ["osha 10", "10 for crew", "osha 30", "30 for", "manager", "site head"],
        failKeywords: ["none", "no card", "same"],
        concept:
          "OSHA 10 is expected for touring crew; OSHA 30 for production managers and site heads. These exceed OSHA's federal minimum but are standard entry requirements at union venues and major promoters.",
      },
      {
        id: "m-legal-s9",
        technique: "Scissor Lift Classification",
        prompt:
          "You're assigned to a scissor lift to help position a lighting truss. Under ANSI A92, what MEWP type and group is a scissor lift, and does your forklift card cover it?",
        passKeywords: ["mewp", "a92", "type 3", "group a", "scissor", "separate", "does not cover", "own cert"],
        failKeywords: ["forklift card", "covered", "same", "group b"],
        concept:
          "A scissor lift is a MEWP Type 3, Group A (boom lifts are Type 3, Group B). MEWP certification under ANSI A92 is required — a PIT forklift card never covers aerial platforms.",
      },
      {
        id: "m-legal-s10",
        technique: "Rigging Awareness Value",
        prompt:
          "You're not the head rigger, but tour companies still value the Event Safety Alliance's EAST training and basic rigging awareness. Why does that credential matter for a forklift operator?",
        passKeywords: ["load", "capacity", "hoist", "rigging", "load-in", "backstage", "awareness", "east", "esa"],
        failKeywords: ["useless", "not needed", "only riggers"],
        concept:
          "ESA's Event Access Safety Training (EAST) is built for the chaotic backstage load-in. Basic rigging awareness — load capacities and hoist mechanics — makes you safer around overhead work even when you're not the rigger.",
      },
      {
        id: "m-legal-s11",
        technique: "Post-Incident Trigger",
        prompt:
          "You had a near-miss this morning — a load shifted but nothing was damaged. Your 3-year evaluation isn't due for another year. Are you clear to keep operating on your existing evaluation?",
        passKeywords: ["no", "re-evaluate", "reevaluate", "near-miss", "near miss", "before", "new evaluation", "triggers"],
        failKeywords: ["yes", "fine", "still valid", "keep going"],
        concept:
          "A near-miss forces a re-evaluation before you continue — the 3-year interval is void the moment an incident or near-miss occurs. 'Nothing was damaged' does not reset the trigger.",
      },
    ],
  },

  // ── MODULE 2 — TOURING CREDENTIALS ──────────────────────────────────────
  {
    id: 2,
    slug: "touring-credentials",
    order: 2,
    icon: "ClipboardCheck",
    title: "Touring Credentials & Site Authorization",
    subtitle: "Getting cleared to touch the keys at every new venue",
    summary:
      "The Letter of Intent protocol, the venue Safety Director / IATSE interface, and daily-check culture on rental fleets.",
    whyItMatters:
      "Touring crews cross state lines and swap fleets nightly. Grabbing a local venue's keys without authorization — or skipping the daily check on an abused rental lift — is exactly where liability and incidents begin.",
    readMinutes: 7,
    sections: [
      {
        heading: "The Letter of Intent (LOI) Protocol",
        lede: "You don't just grab the keys to a local fleet.",
        steps: [
          "Locate the venue's Safety Director or the IATSE union head on arrival",
          "Present your physical credentials (PIT class cards, MEWP, OSHA 10/30) BEFORE touching any machine",
          "Confirm you're authorized on the specific machine class in that building",
          "Get the local sign-off / work order before you operate",
        ],
        callout: {
          kind: "hard-rule",
          title: "Credentials first, keys second",
          body: "Operating a venue's equipment without presenting credentials and getting authorization is a liability and union violation — even if you're fully certified.",
        },
      },
      {
        heading: "The Union & Local-Crew Interface",
        body: [
          "Many venues are IATSE houses with strict jurisdiction over who operates equipment. Respect the local hierarchy — the venue Safety Director has final say on their floor.",
          "Never let an untrained stagehand 'borrow' the machine to save time. Authorization is per-person and per-class, and letting an uncertified operator drive is the exact shortcut the industry forbids.",
        ],
        callout: {
          kind: "tour-reality",
          title: "The local house rules win",
          body: "Your tour credentials get you in the door, but the local Safety Director and union steward set the rules on their floor. Work with them, not around them.",
        },
      },
      {
        heading: "The Site-Specific Liability Grey Area",
        body: [
          "OSHA ties evaluation to the workplace, but a tour changes workplace every night. The professional standard is to treat each new venue as a fresh hazard assessment.",
          "Walk the floor and note terrain, pedestrian flow, dock layout, floor limits, and overhead work before the first lift — and document who authorized you.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — walk it before you drive it",
          body: "At every new venue: present credentials, get authorized, then walk the actual route and note the hazards before the first pick.",
        },
      },
      {
        heading: "Daily-Check Culture on Shared Fleets",
        lede: "Rental and house lifts get abused by every department.",
        steps: [
          "Never assume the last operator left the machine safe",
          "Perform the full pre-op inspection at the START of your shift, every venue",
          "Look specifically for damage other crews caused — bent forks, cut hydraulic lines, low tires",
          "If a machine is compromised, tag it out and report it before anyone lifts gear on it",
        ],
        callout: {
          kind: "hard-rule",
          title: "The check catches the sabotage",
          body: "A stagehand from another department may have bent a fork or nicked a hose. Your pre-op is the last line before a million-dollar rig goes up on a damaged machine.",
        },
      },
    ],
    scenarios: [
      {
        id: "m-cred-s1",
        technique: "Letter of Intent Protocol",
        prompt:
          "You arrive at a new arena and the house forklift is sitting ready. Before you operate it, what must you do?",
        passKeywords: [
          "present",
          "credentials",
          "safety director",
          "iatse",
          "authorization",
          "authorized",
          "sign-off",
          "sign off",
          "loi",
          "union",
          "check in",
        ],
        failKeywords: ["grab keys", "just drive", "hop on", "start it"],
        concept:
          "LOI Protocol: present your physical credentials to the venue Safety Director / IATSE head and get authorized on that machine class before touching the keys.",
      },
      {
        id: "m-cred-s2",
        technique: "Untrained-Operator Refusal",
        prompt:
          "A local stagehand grabs the telehandler keys to 'save time' moving a generator. He has no Class 7 card. What's your position?",
        passKeywords: [
          "stop",
          "no",
          "not certified",
          "refuse",
          "authorized only",
          "unsafe",
          "not allowed",
          "can't",
        ],
        failKeywords: ["let him", "fine", "faster", "help him", "sure"],
        concept:
          "Only qualified, venue-authorized operators run the machines. 'Saving time' with an uncertified operator is exactly the shortcut the industry rules forbid.",
      },
      {
        id: "m-cred-s3",
        technique: "Fresh-Venue Hazard Walk",
        prompt:
          "The tour rolls into a stadium you've never worked. Before your first lift, what do you do to satisfy the site-specific standard?",
        passKeywords: [
          "walk",
          "assess",
          "hazard",
          "terrain",
          "route",
          "floor limit",
          "pedestrian",
          "note",
          "inspect",
          "survey",
        ],
        failKeywords: ["start lifting", "same as last", "already know", "just go"],
        concept:
          "Treat each venue as a fresh hazard assessment — walk the route and note terrain, dock, floor limits, and overhead work before the first pick.",
      },
      {
        id: "m-cred-s4",
        technique: "Daily-Check on Shared Fleet",
        prompt:
          "It's a rental telehandler that three other departments used yesterday. Why is your start-of-shift pre-op inspection non-negotiable?",
        passKeywords: [
          "abused",
          "damage",
          "bent",
          "cut",
          "leak",
          "another crew",
          "catch",
          "unsafe",
          "check",
        ],
        failKeywords: ["trust", "skip", "someone checked", "it's fine", "no need"],
        concept:
          "Shared fleets get abused. Your pre-op is the last chance to catch a bent fork or cut hydraulic line before gear goes up on a compromised machine.",
      },
      {
        id: "m-cred-s5",
        technique: "IATSE Jurisdiction",
        prompt:
          "You arrive at a union house and a stagehand tells you the venue Safety Director has to clear you before you run any machine. Who has final say on their floor?",
        passKeywords: ["safety director", "iatse", "venue", "local", "final say", "their floor", "authorize"],
        failKeywords: ["me", "tour", "ignore", "my call", "anyone"],
        concept:
          "Many venues are IATSE houses with strict jurisdiction. The venue Safety Director / IATSE head has final say over who operates equipment on their floor — respect the local hierarchy before touching a machine.",
      },
      {
        id: "m-cred-s6",
        technique: "Authorization Documentation",
        prompt:
          "You've completed your fresh-venue hazard walk and gotten cleared to operate. Beyond noting the hazards, what must you document about the authorization itself?",
        passKeywords: ["who authorized", "document", "sign-off", "sign off", "record", "name", "work order"],
        failKeywords: ["nothing", "verbal only", "no need"],
        concept:
          "Document who authorized you and on which machine class. If a question arises later, an undocumented verbal 'go ahead' leaves you personally exposed — get the sign-off on the work order.",
      },
      {
        id: "m-cred-s7",
        technique: "Tag-Out After Fleet Damage",
        prompt:
          "Your start-of-shift pre-op on the house telehandler finds a hydraulic line the previous crew nicked. What do you do before anyone lifts gear on it?",
        passKeywords: ["tag out", "tag-out", "lock out", "report", "ground", "do not operate", "red tag"],
        failKeywords: ["careful", "use anyway", "ignore", "tape it"],
        concept:
          "Tag it out and report it before anyone lifts gear on it. A compromised machine on a shared fleet is grounded — there is no 'careful' workaround for a cut hydraulic line.",
      },
      {
        id: "m-cred-s8",
        technique: "Per-Person, Per-Class Rule",
        prompt:
          "A certified co-worker offers to 'lend' you his Class 7 authorization for one lift so you don't have to wait for your own sign-off. Is that valid?",
        passKeywords: ["no", "per-person", "per person", "cannot lend", "not transferable", "own", "my own", "individual"],
        failKeywords: ["yes", "borrow", "lend", "fine"],
        concept:
          "Authorization is per-person and per-class — it cannot be lent or borrowed. Each operator needs their own documented certification and venue sign-off for the specific machine class.",
      },
      {
        id: "m-cred-s9",
        technique: "Work-Order Precondition",
        prompt:
          "The floor is busy and a machine is sitting ready with the keys in it. You have your credentials but no work order yet. Can you start moving cases?",
        passKeywords: ["no", "work order", "sign-off", "sign off", "authorization", "wait", "get cleared"],
        failKeywords: ["yes", "keys in it", "just start", "save time"],
        concept:
          "Keys in the ignition are not authorization. Get the local work order / sign-off confirming you're cleared on that machine class in that building before you operate.",
      },
      {
        id: "m-cred-s10",
        technique: "Shared-Fleet Damage Scan",
        prompt:
          "On a shared fleet you never assume the last operator left the machine safe. Name three specific things you look for that another crew might have caused.",
        passKeywords: ["bent fork", "cut hydraulic", "low tire", "leak", "damage", "brake", "cracked"],
        failKeywords: ["nothing", "trust", "assume fine"],
        concept:
          "Run the full pre-op and look specifically for other-crew damage: bent forks, cut or leaking hydraulic lines, low tires, failing brakes. Never assume the last operator left it safe.",
      },
      {
        id: "m-cred-s11",
        technique: "Arrival LOI Sequence",
        prompt:
          "You've just rolled into a new arena for the first time. Put the credential steps in order before you touch a single machine.",
        passKeywords: ["safety director", "iatse", "present", "credentials", "authorized", "class", "sign-off", "before"],
        failKeywords: ["operate first", "grab keys", "skip"],
        concept:
          "Locate the Safety Director / IATSE head, present your physical credentials, confirm you're authorized on that specific machine class, and get the sign-off — all before touching the keys.",
      },
    ],
  },

  // ── MODULE 3 — SPOTTER SIGNALS ──────────────────────────────────────────
  {
    id: 3,
    slug: "spotter-signals",
    order: 3,
    icon: "Hand",
    title: "Spotter Communication & Hand Signals",
    subtitle: "When you can't hear a word over the PA and the crowd",
    summary:
      "Standardized hand signals, the one-spotter rule, and the 10-foot Zone of Safety.",
    whyItMatters:
      "Backstage is deafening — you cannot hear a spotter shouting. Every blind or tight move depends on clear visual signals and one designated spotter. A missed signal is a crushed foot or a speared rig.",
    readMinutes: 6,
    sections: [
      {
        heading: "Why Visual, Not Verbal",
        body: [
          "On a live-event floor the PA, the crowd, and the equipment drown out voices. Operators cannot rely on shouted directions.",
          "Every blind maneuver — backing a wide load, threading a dock, placing at height — runs on standardized hand signals from a dedicated spotter.",
        ],
        callout: {
          kind: "tour-reality",
          title: "The noise never stops",
          body: "Assume you will not hear a single word your spotter says. If the move depends on hearing them, the move is unsafe.",
        },
      },
      {
        heading: "The Standardized Hand Signals",
        lede: "Learn these cold — they are the shared language of the floor.",
        steps: [
          "Raise the load — arm up, index finger pointing up, circling",
          "Lower the load — arm down, finger pointing down, circling",
          "Stop — one arm out, palm open and still",
          "Emergency stop — both arms out, hands crossing back and forth",
          "'This far to go' — hands held apart showing remaining distance, closing as you near",
          "Hold / dog everything — hands clasped together",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — slow and deliberate",
          body: "Give and read signals slowly and deliberately. Vague waving is not a signal — if it isn't one of the standard signs, you stop.",
        },
      },
      {
        heading: "The One-Spotter Rule",
        lede: "Many voices is no voice.",
        steps: [
          "Agree on ONE designated spotter before the move begins",
          "The operator takes signals from that person and no one else",
          "If you lose sight of your spotter — STOP until you regain them",
          "The only exception: an EMERGENCY STOP is obeyed instantly, from anyone",
        ],
        callout: {
          kind: "hard-rule",
          title: "One spotter, one set of eyes",
          body: "Multiple people signaling at once is chaos. You obey your one spotter — except an emergency stop, which you take from anyone, instantly.",
        },
      },
      {
        heading: "The 10-Foot Zone of Safety",
        body: [
          "In mixed pedestrian chaos, set a hard rule: if any pedestrian comes within 10 feet of the moving machine, the wheels stop entirely until they clear.",
          "Distracted stagehands wearing headphones or pushing gear will not track you — so you track them.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — 10 feet = wheels stop",
          body: "Anyone inside 10 feet of the machine and the wheels stop moving. No exceptions, no 'they'll move.'",
        },
      },
    ],
    scenarios: [
      {
        id: "m-spot-s1",
        technique: "Visual-Signal Dependency",
        prompt:
          "You're backing a wide LED cart through a dock. Your spotter is shouting directions but the PA is blasting soundcheck. How do you run this move?",
        passKeywords: [
          "hand signal",
          "hand signals",
          "visual",
          "signals",
          "see",
          "eye",
          "can't hear",
          "stop if",
        ],
        failKeywords: ["listen", "shout", "yell", "verbal", "hear him"],
        concept:
          "Backstage noise makes voice useless. Blind moves run on standardized hand signals from a dedicated spotter — if you can't see the signal, you stop.",
      },
      {
        id: "m-spot-s2",
        technique: "One-Spotter Rule",
        prompt:
          "Mid-move, two different crew members start waving contradictory signals at you. What do you do?",
        passKeywords: [
          "stop",
          "one spotter",
          "designated",
          "my spotter",
          "ignore",
          "regain",
          "single",
        ],
        failKeywords: ["pick one", "average", "keep going", "guess", "both"],
        concept:
          "One-Spotter Rule: you obey only your one designated spotter. Conflicting signals — or losing sight of your spotter — means STOP until it's resolved.",
      },
      {
        id: "m-spot-s3",
        technique: "Universal Emergency Stop",
        prompt:
          "A crew member you weren't taking signals from throws both arms out, hands crossing back and forth. Do you obey it?",
        passKeywords: ["yes", "stop", "emergency", "obey", "instantly", "anyone"],
        failKeywords: ["no", "not my spotter", "ignore", "keep going"],
        concept:
          "The emergency stop is the one signal obeyed instantly from anyone, regardless of who your designated spotter is.",
      },
      {
        id: "m-spot-s4",
        technique: "10-Foot Zone of Safety",
        prompt:
          "A distracted stagehand with headphones drifts to within about 8 feet of your moving machine. What's the rule?",
        passKeywords: [
          "stop",
          "wheels stop",
          "10 foot",
          "10 feet",
          "ten feet",
          "zone",
          "halt",
          "wait",
        ],
        failKeywords: ["honk and go", "they'll move", "continue", "drive around"],
        concept:
          "10-Foot Zone of Safety: any pedestrian within 10 feet and the wheels stop until they clear. You track them; they won't track you.",
      },
      {
        id: "m-spot-s5",
        technique: "Raise-Signal Recognition",
        prompt:
          "Your spotter holds one arm up with the index finger pointing up and circling. What are they telling you to do?",
        passKeywords: ["raise", "up", "lift", "raise the load"],
        failKeywords: ["lower", "stop", "down"],
        concept:
          "Arm up, index finger pointing up and circling = raise the load. Lowering is the mirror image: arm down, finger pointing down and circling.",
      },
      {
        id: "m-spot-s6",
        technique: "Hold / Dog-Everything Signal",
        prompt:
          "Mid-lift, your spotter suddenly clasps both hands together in front of them. What does that mean and what do you do?",
        passKeywords: ["hold", "dog", "stop", "freeze", "hands clasped", "clasp", "hold everything"],
        failKeywords: ["raise", "continue", "lower", "proceed"],
        concept:
          "Hands clasped together = 'hold / dog everything.' Freeze the load exactly where it is and hold until the spotter releases you — something in the move needs to settle.",
      },
      {
        id: "m-spot-s7",
        technique: "Lost-Spotter Stop",
        prompt:
          "You're threading a wide load through a dock and a passing cart momentarily blocks your view of your spotter. What is your immediate action?",
        passKeywords: ["stop", "halt", "wait", "regain", "lose sight", "until i see"],
        failKeywords: ["continue", "keep going", "guess", "finish"],
        concept:
          "If you lose sight of your spotter — STOP until you regain them. A blind move without your one designated spotter in view is exactly when loads clip crew or structure.",
      },
      {
        id: "m-spot-s8",
        technique: "Distance-Remaining Signal",
        prompt:
          "As you back toward a wall, your spotter holds both hands apart and slowly closes the gap between them. What information is that giving you?",
        passKeywords: ["distance", "this far", "how far", "remaining", "close", "space left", "closing"],
        failKeywords: ["stop now", "raise", "lower"],
        concept:
          "Hands held apart showing the remaining distance, closing as you near, is the 'this far to go' signal. When the hands meet, you're at the target — ease to a stop.",
      },
      {
        id: "m-spot-s9",
        technique: "Stop-Signal Recognition",
        prompt:
          "Your spotter extends one arm straight out with the palm open and held still. What does this signal mean versus the emergency stop?",
        passKeywords: ["stop", "one arm", "palm open", "still", "halt", "normal stop"],
        failKeywords: ["raise", "lower", "go", "continue"],
        concept:
          "One arm out, palm open and still = STOP. It differs from the emergency stop (both arms out, hands crossing back and forth), which is obeyed instantly from anyone.",
      },
      {
        id: "m-spot-s10",
        technique: "Visual-Over-Verbal Principle",
        prompt:
          "A new stagehand asks why the whole floor runs on hand signals instead of just calling out directions over the noise. What's the reason?",
        passKeywords: ["noise", "pa", "crowd", "can't hear", "drown", "loud", "visual", "voice useless"],
        failKeywords: ["preference", "tradition", "no reason"],
        concept:
          "On a live-event floor the PA, crowd, and equipment drown out voices. Blind maneuvers run on standardized hand signals precisely because shouted directions can't be trusted.",
      },
    ],
  },

  // ── MODULE 4 ───────────────────────────────────────────────────────────
  {
    id: 4,
    slug: "truck-pack-logistics",
    order: 4,
    icon: "Truck",
    title: "Truck Pack & Fork Pocket Logistics",
    subtitle: "Millimeter-precise packing under temporal pressure",
    summary: "Caster-Spin Alignment, friction breaking with side-shift, and the Flush-Fork Rule.",
    whyItMatters:
      "In touring production, every inch inside a 53-foot truck counts. One bad pack means the doors won't close, gear gets damaged, or the whole load shifts on the highway.",
    readMinutes: 7,
    sections: [
      {
        heading: "The Caster-Spin Alignment",
        lede: "Swivel casters turn sideways and steal 2–3 inches of pack width.",
        steps: [
          "Push the case forward until you feel the casters resist",
          "Back off ONE inch — just one inch",
          "The casters swing back to trail straight",
          "Push forward again — the case seats flush",
          "Never force it. Brute force buckles caster mounts.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — Caster-Spin Alignment",
          body: "Push · back off one inch · re-approach. Drill it until the one-inch retreat is reflexive, not a decision.",
        },
      },
      {
        heading: "Breaking Friction on a Packed Case",
        lede: "A wedged case drags its neighbor when you pull forward.",
        steps: [
          "Do NOT pull forward yet",
          "Use the SIDE-SHIFT function first",
          "Shift left and right slightly to break the lateral friction grip",
          "Once the case moves laterally, THEN pull it forward",
          "This protects the neighboring cart from lifting or tipping",
        ],
      },
      {
        heading: "The Flush-Fork Rule",
        lede: "48-inch forks in a 36-inch-deep cart leave tips protruding — invisible to anyone behind.",
        steps: [
          "Do not push the forks all the way through",
          "Keep the extra fork length visible ON YOUR SIDE",
          "The tips stay in front of the cart, where you can see them",
          "This prevents stabbing anyone standing behind the load",
        ],
        callout: {
          kind: "hard-rule",
          title: "Exposed steel is a body hazard",
          body: "Protruding fork tips have crushed feet and speared people behind loads. Keep the steel on your side, in your eyeline.",
        },
      },
      {
        heading: "Incline & Transition Physics",
        body: [
          "Suspension Droop Compensation: as a heavy machine drives into a trailer, the truck's suspension compresses and the bed drops several inches. Adjust fork height dynamically to avoid bottoming out or jamming the tips into the floor.",
          "The Wet Ramp Slick: rain turns aluminum ramps frictionless. Manage momentum, avoid wheel-spin, and approach transitions straight-on to avoid sliding off the side.",
          "The Trapped Strap Trap: ratchet straps dangle on the E-track. Visually confirm a clear tie-down path before sealing a row, or you'll destroy the gear when the case pins the strap.",
        ],
      },
    ],
    scenarios: [
      {
        id: "m1-s1",
        technique: "Caster-Spin Alignment",
        prompt:
          "You push a flight case into the truck and the swivel casters turn sideways, stealing 3 inches of pack width. What technique do you use?",
        passKeywords: ["back off", "jiggle", "reverse", "micro", "inch back"],
        failKeywords: ["push", "force", "ram"],
        concept:
          "Caster-Spin Alignment: back off one inch so casters can trail straight, then re-approach.",
      },
      {
        id: "m1-s2",
        technique: "Side-Shift Friction Break",
        prompt:
          "The case you need is wedged tight. Pulling forward just drags the neighbor case with it. What's your first hydraulic move?",
        passKeywords: ["side shift", "side-shift", "sideways", "lateral", "wiggle"],
        failKeywords: ["lift", "pull", "reverse"],
        concept:
          "Use side-shift to break lateral friction before attempting to extract. Never pull blind.",
      },
      {
        id: "m1-s3",
        technique: "Flush-Fork Rule",
        prompt:
          "Your forks are 48 inches long. The cart is only 36 inches deep. How do you protect the ground crew on the far side?",
        passKeywords: ["flush", "visible", "my side", "short side", "extra"],
        failKeywords: ["full in", "all the way"],
        concept:
          "Flush-Fork Rule: keep extra fork length visible on your side so tips don't become invisible hazards behind the load.",
      },
      {
        id: "m1-s4",
        technique: "Suspension Droop Compensation",
        prompt:
          "As you drive your heavy machine into a trailer, the truck's suspension compresses and the bed drops several inches. What must you do with your fork height, and what happens if you don't?",
        passKeywords: ["adjust", "raise", "fork height", "dynamic", "compensate", "bottom out", "jam", "drops"],
        failKeywords: ["hold steady", "ignore", "same height"],
        concept:
          "Suspension Droop Compensation: adjust fork height dynamically as the bed drops, or you'll bottom out and jam the tips into the trailer floor. The truck sinks as your weight enters it.",
      },
      {
        id: "m1-s5",
        technique: "Wet Ramp Slick",
        prompt:
          "Rain has turned the aluminum loading ramp frictionless. How do you approach and cross it, and what do you avoid?",
        passKeywords: ["straight", "straight-on", "momentum", "slow", "no wheel-spin", "wheel spin", "manage speed"],
        failKeywords: ["angle", "fast", "gun it", "spin"],
        concept:
          "The Wet Ramp Slick: approach transitions straight-on, manage momentum, and avoid wheel-spin. A wet aluminum ramp will slide the machine off the side if you cross at an angle or spin the tires.",
      },
      {
        id: "m1-s6",
        technique: "Trapped Strap Trap",
        prompt:
          "You're about to seal a packed row, but ratchet straps are dangling on the E-track. What do you confirm before setting the last case, and why?",
        passKeywords: ["clear", "tie-down", "tie down", "path", "strap", "visually confirm", "not pinned"],
        failKeywords: ["ignore", "seal it", "push through"],
        concept:
          "The Trapped Strap Trap: visually confirm a clear tie-down path before sealing a row. A case that pins a ratchet strap destroys the gear and the strap when the row is loaded against it.",
      },
      {
        id: "m1-s7",
        technique: "Caster-Spin One-Inch Rule",
        prompt:
          "A flight case's swivel casters have turned sideways and are stealing pack width. Give the exact caster-spin correction, step by step.",
        passKeywords: ["push forward", "back off", "one inch", "trail straight", "re-approach", "seat flush"],
        failKeywords: ["force", "shove", "muscle it"],
        concept:
          "Push forward until the casters resist, back off exactly one inch so they swing to trail straight, then push forward again to seat flush. Never force it — brute force buckles the caster mounts.",
      },
      {
        id: "m1-s8",
        technique: "Incline Transition Approach",
        prompt:
          "You're moving from the dock down a short ramp into the trailer with a loaded machine. How do you take the incline transition?",
        passKeywords: ["straight", "straight-on", "slow", "one tire", "gradual", "no side", "crawl"],
        failKeywords: ["angle", "fast", "diagonal"],
        concept:
          "Take incline and ramp transitions straight-on and slow so you don't slide off the side or bottom the machine. Angling a loaded machine across a transition invites a slide or a high-center.",
      },
    ],
  },

  // ── MODULE 5 ───────────────────────────────────────────────────────────
  {
    id: 5,
    slug: "fork-slot-anatomy",
    order: 5,
    icon: "ScanLine",
    title: "Fork Slot Anatomy & Precision Alignment",
    subtitle: "Skin vs. slot, blind alignment, top-heavy refusals",
    summary: "Vertical Rib Symmetry, the Level-Fork Shadow Trick, and the one-sided-lift hard refusal.",
    whyItMatters:
      "Concert equipment is custom-built and expensive. Missing the fork pocket by 1 inch means your forks punch through the cosmetic aluminum skin and destroy what's inside.",
    readMinutes: 7,
    sections: [
      {
        heading: "Skin vs. Slot",
        body: [
          "Cosmetic skin = thin aluminum or fiberglass outer panels. These are NOT for lifting. Do not touch.",
          "Fork pockets = reinforced steel guide sleeves built into the internal frame. These are your entry points.",
          "If you can't see the pockets clearly — STOP and look harder. Do not guess. Do not feel your way in while moving.",
        ],
      },
      {
        heading: "Vertical Rib Symmetry",
        lede: "In a dark truck, floor-level slots are blocked by your mast.",
        steps: [
          "Look at the TOP of the cart — not the bottom",
          "Find the top structural columns, welds, or frame handles",
          "Align your mast with the TOP center of the cart",
          "The floor slots are directly below that center point",
          "If the top looks centered, the forks are centered below",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — Read the top, trust the bottom",
          body: "Practice picking the top centerline of a cart at a glance. Symmetry up top guarantees alignment on the hidden slots below.",
        },
      },
      {
        heading: "The Level-Fork Shadow Trick",
        lede: "Confirm forks are level before entering a slot.",
        steps: [
          "Turn on your headlights",
          "Look at the shadow your forks cast on the face of the cart",
          "Both shadows should be EQUAL WIDTH and PARALLEL",
          "If one shadow is thicker — your forks are tilted",
          "Adjust tilt until both shadows are even, then enter",
        ],
      },
      {
        heading: "Never One-Side a Top-Heavy Load",
        body: [
          "Top-heavy carts (motors or heavy gear up high) will TIP the instant you lift with only one fork engaged. The center of gravity exits the stability triangle immediately.",
          "If only one pocket is accessible — STOP. Get a supervisor. Re-position the cart. Find another way.",
        ],
        callout: {
          kind: "hard-rule",
          title: "One-sided lift = hard refusal",
          body: "On a top-heavy load, a single-fork lift is not a risk to manage — it's a refusal. The cart twists, snaps casters, and tips off the ramp.",
        },
      },
    ],
    scenarios: [
      {
        id: "m2-s1",
        technique: "Vertical Rib Symmetry",
        prompt:
          "Inside a dark trailer you can't see the floor-level fork pockets on a scenic cart. How do you find the center without guessing?",
        passKeywords: ["top", "vertical rib", "mast", "symmetry", "column", "weld"],
        failKeywords: ["headlight", "guess", "feel", "slow"],
        concept:
          "Vertical Rib Symmetry: align your mast with the top structural lines. They're directly above the hidden floor slots.",
      },
      {
        id: "m2-s2",
        technique: "Level-Fork Shadow Trick",
        prompt:
          "You switch on your headlights and look at the shadows cast by your forks. One shadow is wider than the other. What does that tell you?",
        passKeywords: ["tilted", "uneven", "not level", "angled", "crooked"],
        failKeywords: ["level", "fine", "nothing"],
        concept:
          "Level-Fork Shadow Trick: uneven shadows mean the forks are tilted and will bind inside the steel guide sleeves.",
      },
      {
        id: "m2-s3",
        technique: "Top-Heavy One-Sided Refusal",
        prompt:
          "A video wall cart is top-heavy with motors at the top. Only one fork pocket is accessible. What's your call?",
        passKeywords: ["refuse", "don't", "stop", "no", "can't", "single side", "tip", "dangerous"],
        failKeywords: ["try", "go", "careful", "slow"],
        concept:
          "Single-fork lifts on top-heavy loads are an immediate refusal. The center of gravity exits the stability triangle instantly.",
      },
      {
        id: "m2-s4",
        technique: "Skin vs. Slot",
        prompt:
          "A scenic cart has a smooth aluminum outer panel that looks like a good flat surface for your forks. Do you lift on it? What are you actually looking for?",
        passKeywords: ["no", "skin", "cosmetic", "fork pocket", "slot", "reinforced", "steel", "not for lifting"],
        failKeywords: ["yes", "lift on it", "flat surface", "skin"],
        concept:
          "Cosmetic skin (thin aluminum or fiberglass panels) is NOT a lifting point. Lift only on the reinforced steel fork pockets built into the internal frame. Skin will crumple and drop the load.",
      },
      {
        id: "m2-s5",
        technique: "No-Guess Entry Rule",
        prompt:
          "In a dim trailer you can't clearly make out the fork pockets on a cart. You're on a tight clock. Do you feel your way in slowly while moving?",
        passKeywords: ["stop", "look harder", "no", "don't guess", "do not guess", "light", "confirm"],
        failKeywords: ["feel", "guess", "slowly in", "yes"],
        concept:
          "If you can't see the pockets clearly — STOP and look harder. Never feel your way in while moving. Guessing entry into hidden pockets bends forks, spears skin, and destabilizes the load.",
      },
      {
        id: "m2-s6",
        technique: "Shadow-Symmetry Check",
        prompt:
          "You turn on your headlights and study the shadows your two forks cast on the face of the cart. One shadow is clearly wider than the other. What does that tell you and what do you fix?",
        passKeywords: ["tilt", "tilted", "uneven", "adjust tilt", "level", "equal", "parallel", "shadow"],
        failKeywords: ["fine", "centered", "enter anyway"],
        concept:
          "Level-Fork Shadow Trick: both shadows should be equal width and parallel. A wider shadow means the forks are tilted and will bind in the steel sleeves — adjust tilt until the shadows match before entering.",
      },
      {
        id: "m2-s7",
        technique: "Top-Column Alignment",
        prompt:
          "You can't see the floor-level fork slots on a cart, but you can see its top structure. How do you find the hidden slot center?",
        passKeywords: ["top", "structural", "column", "weld", "frame", "align mast", "center", "above"],
        failKeywords: ["bottom", "guess", "eyeball floor"],
        concept:
          "Vertical Rib Symmetry: align your mast with the TOP center of the cart — the structural columns and welds sit directly above the hidden floor slots. If the top is centered, the forks are centered below.",
      },
      {
        id: "m2-s8",
        technique: "One-Pocket Reposition",
        prompt:
          "A cart is jammed against a wall and only one fork pocket is reachable. The cart is NOT top-heavy. What's the correct move — and how does the answer change if it were top-heavy?",
        passKeywords: ["stop", "reposition", "supervisor", "both pockets", "re-position", "another way", "refuse if top-heavy"],
        failKeywords: ["one fork", "lift it", "single"],
        concept:
          "Stop and re-position the cart (or get a supervisor) so both pockets are accessible. On a top-heavy cart, a single-fork lift is an outright refusal — the center of gravity leaves the stability triangle instantly.",
      },
    ],
  },

  // ── MODULE 6 ───────────────────────────────────────────────────────────
  {
    id: 6,
    slug: "ground-crew-choreography",
    order: 6,
    icon: "Users",
    title: "Ground Crew Choreography",
    subtitle: "You set the pace of a fast-moving human assembly line",
    summary: "Clear-and-Release Pause, the 3-Foot Halo, Pusher's Blindness Yield, and the Two-Tone Horn.",
    whyItMatters:
      "The forklift is the center of a fast-moving human assembly line. The operator controls the pace of the entire operation. One wrong move crushes someone or destroys gear.",
    readMinutes: 8,
    sections: [
      {
        heading: "The Clear-and-Release Pause",
        lede: "Stagehands reach in the moment they see gear coming — while you're still moving.",
        steps: [
          "Bring the machine to a COMPLETE STOP",
          "Shift to NEUTRAL",
          "Lower the load until casters are fully on the dock floor",
          "Wait for the load to stop moving",
          "Confirm all hands are clear of your chassis",
          'Only THEN say "All yours" and release the load',
        ],
        callout: {
          kind: "tour-reality",
          title: "Five seconds vs. a crush",
          body: "Do not rush this pause. It takes 5 seconds and it is the single most reliable way to keep hands out from between steel and steel.",
        },
      },
      {
        heading: "The 3-Foot Rear-Swing Halo Zone",
        lede: "Counterbalance machines steer from the REAR — the back swings 3–4 ft opposite your turn.",
        steps: [
          "One short horn tap (half a second)",
          "Make eye contact with anyone nearby",
          "Confirm the 3-foot zone behind and beside you is clear",
          "THEN begin your turn",
          "If anyone steps into that zone mid-turn — STOP immediately",
        ],
      },
      {
        heading: "Pusher's Blindness Yield Rule",
        body: [
          "When 4 stagehands push an 8-foot cart, the crew in the back cannot see anything ahead. They have massive rolling momentum and zero forward visibility.",
          "The forklift ALWAYS yields to active pushing crews. You can see them; they cannot see you. Stop, wait for them to clear, then proceed. Never assume they'll stop or swerve for you.",
        ],
        callout: {
          kind: "hard-rule",
          title: "The machine yields. Always.",
          body: "Right-of-way is irrelevant against a blind, momentum-loaded push crew. If there's any doubt, you stop.",
        },
      },
      {
        heading: "The Two-Tone Horn Protocol",
        body: [
          "Short tap (half second) = 'Heads up, I'm changing direction or moving nearby.' Courtesy only.",
          "Long blast (continuous) = immediate life-safety danger. Everyone stops, looks, gets clear.",
          "Never honk constantly — it trains people to ignore the horn ('horn blindness').",
        ],
      },
    ],
    scenarios: [
      {
        id: "m3-s1",
        technique: "Clear-and-Release Pause",
        prompt:
          "You back a rack out of the trailer and three stagehands rush in to grab it before your rear tires have stopped. What is your mandatory first action?",
        passKeywords: ["stop", "halt", "freeze", "clear", "release", "pause", "neutral"],
        failKeywords: ["lower", "let them", "drop", "move"],
        concept:
          "Clear-and-Release Pause: full structural stop, neutral, forks down, wait for ground to settle before any hands touch the load.",
      },
      {
        id: "m3-s2",
        technique: "3-Foot Rear-Swing Halo",
        prompt:
          "You need to make a 90-degree turn. Local crew is clustered 4 feet off your left flank. What do you do before turning?",
        passKeywords: ["horn", "tap", "eye contact", "halo", "3 foot", "clear", "wait"],
        failKeywords: ["turn", "go", "signal"],
        concept:
          "One short horn tap + eye contact confirms the 3-Foot Rear-Swing Halo is clear before any steering input.",
      },
      {
        id: "m3-s3",
        technique: "Pusher's Blindness Yield Rule",
        prompt:
          "Four stagehands are pushing an 8-foot video frame cart on a direct collision course with you. Who yields?",
        passKeywords: ["yield", "stop", "i stop", "i yield", "i wait", "they can't see", "blind"],
        failKeywords: ["they yield", "i have", "horn", "right of way"],
        concept:
          "Pusher's Blindness Yield Rule: the forklift always yields. Momentum + zero visibility = the operator must stop.",
      },
      {
        id: "m3-s4",
        technique: "Two-Tone Horn Protocol",
        prompt:
          "Explain the difference between a short horn tap and a long continuous blast — what does each mean to the ground crew?",
        passKeywords: ["short", "tap", "heads up", "courtesy", "long", "blast", "danger", "life-safety", "stop"],
        failKeywords: ["same", "no difference", "random"],
        concept:
          "Short tap (half a second) = 'heads up, I'm moving nearby' — courtesy only. Long continuous blast = immediate life-safety danger; everyone stops, looks, and gets clear.",
      },
      {
        id: "m3-s5",
        technique: "Horn-Blindness Avoidance",
        prompt:
          "A new operator leans on the horn almost constantly during load-out 'to be safe.' Why is that actually dangerous?",
        passKeywords: ["horn blindness", "ignore", "constant", "trains people", "tune out", "desensitize", "no reaction"],
        failKeywords: ["good", "safe", "fine", "more is better"],
        concept:
          "Constant honking trains crew to ignore the horn ('horn blindness'). When you then hit a real long blast for genuine danger, no one reacts. Use the horn deliberately, not continuously.",
      },
      {
        id: "m3-s6",
        technique: "Clear-and-Release Sequence",
        prompt:
          "You back a rack out of the trailer and stagehands rush in before your tires have stopped. Give the full clear-and-release sequence before any hands touch the load.",
        passKeywords: ["complete stop", "neutral", "lower", "casters", "wait", "hands clear", "settle"],
        failKeywords: ["hand it off moving", "keep rolling", "let them grab"],
        concept:
          "Clear-and-Release Pause: come to a complete stop, shift to neutral, lower the load until casters are on the floor, wait for it to stop moving, and confirm all hands are clear before anyone touches it.",
      },
      {
        id: "m3-s7",
        technique: "Halo Breach Mid-Turn",
        prompt:
          "You've tapped the horn, made eye contact, and begun a 90° turn. A stagehand steps into the 3-foot zone beside your rear end mid-turn. What do you do?",
        passKeywords: ["stop", "halt", "immediately", "freeze", "wait", "clear"],
        failKeywords: ["finish turn", "continue", "swing through"],
        concept:
          "If anyone steps into the 3-Foot Rear-Swing Halo mid-turn — STOP immediately. The rear of a forklift swings wide; finishing the turn is how the tail catches a person you already cleared.",
      },
      {
        id: "m3-s8",
        technique: "Long-Blast Response",
        prompt:
          "You're mid-move and hear a long continuous horn blast from another machine across the floor — not aimed at you specifically. What's your response?",
        passKeywords: ["stop", "look", "get clear", "everyone stops", "danger", "halt"],
        failKeywords: ["ignore", "not mine", "keep going", "continue"],
        concept:
          "A long blast is a floor-wide life-safety signal — everyone stops, looks, and gets clear, regardless of who sounded it. You never assume it 'isn't for you.'",
      },
    ],
  },

  // ── MODULE 7 — STAGING-LINE LOAD-OUT ────────────────────────────────────
  {
    id: 7,
    slug: "staging-line-loadout",
    order: 7,
    icon: "Boxes",
    title: "The Staging-Line Load-Out",
    subtitle: "The stationary forklift as a high-speed hoisting station",
    summary:
      "The staging-line chain of custody, Hot Dog vs. Hamburger fork orientation, and the stationary hand-off.",
    whyItMatters:
      "In an efficient load-out the forklift stops being a delivery runner and becomes a fixed hoisting station — the crew brings the work to the machine. A shared shorthand keeps the load-out fast AND keeps hands out from under the tines.",
    readMinutes: 8,
    sections: [
      {
        heading: "The Logistics Crew & Chain of Custody",
        lede: "Treat the loading dock as a stationary assembly line with a strict chain of custody.",
        body: [
          "The flow: pre-staged lines of cases → the Caller → the Pushers → the stationary forklift → the four truck loaders. Each role has one job and one lane.",
          "Pre-staged lines: stagehands organize cases into single-file lines on the venue floor before the doors open. The golden rule is one line equals one specific truck — cross-contaminating lines breaks the system. Because cases are lined up ahead of time, the operator never hunts blind corners for gear.",
          "The Caller stands to the side with the master pack list and calls the exact case/cart numbers and where they fit the truck's packing grid (e.g., 'A-row, bottom'). The Pushers pull those cases and wheel them to the tip of the tines. The forklift stays localized at the truck tail as a hoisting station. The four truck loaders work in pairs inside the trailer — two positioning, two strapping the next row on E-track.",
        ],
        callout: {
          kind: "tour-reality",
          title: "The machine holds still; the work comes to it",
          body: "The forklift localized at the truck tail — not running the floor — is what makes a load-out tight, fast, and safe. The crew feeds the machine.",
        },
      },
      {
        heading: "Hot Dog vs. Hamburger — Fork Orientation",
        lede: "A one-word shorthand the Caller, Pushers, and Operator all speak instantly.",
        body: [
          "HOT DOG (lengthwise): the case runs parallel to the forks — long and narrow like a hot dog in a bun. Used for narrow clearances (tight hallways, standard doors, skinny ramps) and deep 'straight-in' truck packing. Operator risk: the load extends far out front, shifting the load center forward — this reduces lifting capacity and makes the rear wheels prone to lifting under a heavy brain or audio rack.",
          "HAMBURGER (straight on / wide): the case sits sideways with its short side to the mast — short and wide like a hamburger. Used for maximum stability with heavy or top-heavy cases (a rack of power amps) and for packing two- or three-wide across a 53-foot trailer. Operator risk: the load is wide — stay hyper-aware of clearances so you don't clip door frames, walls, or the Caller at the staging line.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — the Caller calls the orientation",
          body: "The Caller yells the method with the number — 'Case 104, Hamburger!' Pushers pre-spin the case to that orientation; the operator sets tine width to match. On a Hot Dog, narrow the tines so they don't protrude past a skinny case and spear an adjacent cart.",
        },
      },
      {
        heading: "The Stationary Hand-Off",
        lede: "The physical hand-off is the danger zone — drill it until the sequence is reflex.",
        body: [
          "The three golden rules of the hand-off, drilled until reflex: (1) the Tine Buffer Zone — pushers never touch a case while you are actively scooping or lifting it; they drop the cart at the tines and step away. (2) No hands on hydraulics during the physical hand-off. (3) The Stop Trigger — if anyone steps into your turning radius before you're parked with the brake set, all vehicle movement stops immediately.",
        ],
        steps: [
          "Approach the truck tail and come to a COMPLETE stop",
          "Set the parking brake",
          "Lower the load to a manageable take-off height (a few inches above the deck)",
          "Level the forks completely FLAT to present the cases",
          "Take your hands OFF the hydraulic controls before anyone touches the load",
          "Pushers pull the cases away from the mast — never pushing toward the machine",
        ],
        callout: {
          kind: "hard-rule",
          title: "Hands off the sticks; forks flat",
          body: "During the hand-off your hands leave the hydraulic controls — an accidental input crushes fingers. Present the forks level: tilted down rolls the case off violently; tilted up wrecks the pushers' backs dragging it over the steel lip. (In transit, tilt slightly back so cases don't slide.)",
        },
      },
      {
        heading: "Communication, Boundaries & 360° Awareness",
        body: [
          "The back of a semi during load-out is a wall of noise — air brakes, shouting, stage tear-down. The operator cannot rely on hearing the Caller or Pushers, and instead watches the Loaders' hands: both hands up and open means 'Hold position'; two hands patting the head means 'Set the load down right here'; a clear wave backward means 'Clear to back up.'",
          "The No-Fly Zone: loaders and pushers get impatient and step onto the dock plate or ramp before the machine is parked. If anyone enters the forklift's operating radius before it's stopped, the operator halts immediately. A taped 'Safe Staging Boundary' on the floor marks where pushers drop carts and retreat — never standing beside the wheels or mast during a lift.",
          "The Tunnel-Vision hazard: because cases always come from the front, the operator can fixate on the space between the tines and the truck. Maintain 360° awareness — a distracted rigger can still walk behind the counterweight. And remember 'smooth is fast': jerking the levers to rush a heavy rack can pop a smaller lift's rear wheels off the ground or pitch the load forward into the loaders.",
        ],
        callout: {
          kind: "hard-rule",
          title: "Hands up = hold · patting head = set here · wave back = clear",
          body: "Read the Loaders' hands, not their voices. And anyone inside the operating radius before you're parked is an immediate stop — every time.",
        },
      },
    ],
    scenarios: [
      {
        id: "m-stage-s1",
        technique: "Hamburger Orientation",
        prompt:
          "The Caller yells 'Case 104, Hamburger!' as a rack of heavy power amps comes up. How is the case oriented on your tines, and why is that the right call for this load?",
        passKeywords: [
          "hamburger",
          "wide",
          "sideways",
          "short side",
          "close to mast",
          "stable",
          "center of gravity",
          "heavy",
        ],
        failKeywords: ["hot dog", "lengthwise", "long and narrow", "doesn't matter"],
        concept:
          "Hamburger = case sideways/wide with its short side to the mast, keeping the center of gravity close to the machine — the stable orientation for heavy or top-heavy cases.",
      },
      {
        id: "m-stage-s2",
        technique: "Hot Dog Load-Center Risk",
        prompt:
          "A skinny case is loaded 'Hot Dog' — lengthwise, extending well out in front of the machine. What changes about your machine's capacity, and what tine adjustment might you make?",
        passKeywords: [
          "load center",
          "forward",
          "capacity",
          "reduce",
          "tip",
          "rear wheel",
          "narrow",
          "tine",
        ],
        failKeywords: ["nothing", "same", "more stable", "spread wider"],
        concept:
          "Hot Dog pushes the load center forward, cutting lifting capacity and risking a rear-wheel lift. Narrow the tines so they don't protrude past a skinny case and spear an adjacent cart.",
      },
      {
        id: "m-stage-s3",
        technique: "Stationary Hand-Off",
        prompt:
          "You roll up to the truck tail with three lighting trunks. Before the pushers touch the load, what is your sequence — and where do your hands go during the hand-off?",
        passKeywords: [
          "stop",
          "parking brake",
          "lower",
          "level",
          "flat",
          "hands off",
          "off the controls",
          "stationary",
        ],
        failKeywords: ["keep moving", "while moving", "tilt down", "hold the lever"],
        concept:
          "Full stop, parking brake, lower to take-off height, forks level — then hands OFF the hydraulic controls while pushers pull the cases away from the mast.",
      },
      {
        id: "m-stage-s4",
        technique: "No-Fly Zone & Loader Hand Signals",
        prompt:
          "It's a wall of noise and a truck loader steps onto the dock plate into your operating radius before you've parked. You can't hear a word. What do you do, and what hand signals govern backing up?",
        passKeywords: [
          "stop",
          "immediately",
          "hands up",
          "hold",
          "wave",
          "clear",
          "radius",
          "no-fly",
        ],
        failKeywords: ["keep going", "honk and go", "assume", "yell back"],
        concept:
          "Anyone in the operating radius before you're parked = immediate stop. Read the Loaders' hands: both hands up = hold; two hands patting the head = set the load down here; a wave back = clear to back up.",
      },
      {
        id: "m-stage-s5",
        technique: "One-Line-One-Truck Rule",
        prompt:
          "At the staging line, cases are organized into single-file lines on the floor before doors. Why must you never pull a case from a different line to fill your truck faster?",
        passKeywords: ["one line", "one truck", "chain of custody", "cross-contaminate", "breaks the system", "wrong truck", "pack list"],
        failKeywords: ["any line", "faster", "doesn't matter", "grab nearest"],
        concept:
          "One line equals one specific truck. Cross-contaminating lines breaks the chain of custody — gear ends up on the wrong truck and the pack grid falls apart. Pull only from your truck's line.",
      },
      {
        id: "m-stage-s6",
        technique: "The Caller's Role",
        prompt:
          "During a staging-line load-out, who holds the master pack list, and what exactly do they communicate to the crew?",
        passKeywords: ["caller", "pack list", "case number", "cart number", "grid", "where it fits", "a-row", "position"],
        failKeywords: ["operator", "loader", "pusher", "no one"],
        concept:
          "The Caller stands to the side with the master pack list and calls the exact case/cart numbers plus where each fits the truck's packing grid (e.g., 'A-row, bottom'). The operator hoists; the Caller directs the sequence.",
      },
      {
        id: "m-stage-s7",
        technique: "Tine Buffer Zone",
        prompt:
          "A pusher wants to keep a hand on the case to steady it while you're actively scooping and lifting it onto the tines. Is that allowed? State the rule.",
        passKeywords: ["no", "tine buffer", "drop", "step away", "never touch", "hands off", "while lifting"],
        failKeywords: ["yes", "steady it", "hold it", "help"],
        concept:
          "Tine Buffer Zone: pushers never touch a case while you're actively scooping or lifting it. They drop the cart at the tines and step away — a hand on a rising load is how fingers and feet get caught.",
      },
      {
        id: "m-stage-s8",
        technique: "Patting-Head Loader Signal",
        prompt:
          "Inside the noisy trailer, a loader faces you and pats the top of their head with both hands. The Caller is inaudible. What are you being told to do?",
        passKeywords: ["set down", "set the load down", "put it here", "lower here", "pat", "head", "place"],
        failKeywords: ["hold", "back up", "raise", "clear"],
        concept:
          "Two hands patting the head = 'set the load down right here.' At the truck tail you watch the Loaders' hands because the Caller and air brakes drown out voices.",
      },
      {
        id: "m-stage-s9",
        technique: "Hold-Position Loader Signal",
        prompt:
          "A loader inside the trailer holds both hands up and open, palms toward you. What does that mean, and what must NOT change while you hold?",
        passKeywords: ["hold", "hold position", "both hands up", "stop", "wait", "don't move", "stay"],
        failKeywords: ["set down", "back up", "proceed", "lower"],
        concept:
          "Both hands up and open = 'Hold position.' Freeze the load and the machine — keep your hands ready but make no moves until the loader signals the next action.",
      },
      {
        id: "m-stage-s10",
        technique: "360° Tunnel-Vision Guard",
        prompt:
          "Because cases always arrive from the front, you catch yourself fixating on the gap between the tines and the truck. What hazard does that create and how do you counter it?",
        passKeywords: ["360", "behind", "counterweight", "rigger", "awareness", "tunnel vision", "check behind", "scan"],
        failKeywords: ["only front", "fine", "focus front"],
        concept:
          "Tunnel-Vision hazard: fixating forward means a distracted rigger can walk behind your counterweight unseen. Maintain 360° awareness — the danger zone is behind you as much as at the tines.",
      },
      {
        id: "m-stage-s11",
        technique: "Smooth-Is-Fast Discipline",
        prompt:
          "The Tour Manager wants the heavy amp rack moved NOW and you're tempted to jerk the levers to speed it up. What's the risk, and what's the principle?",
        passKeywords: ["smooth", "smooth is fast", "jerk", "rear wheel", "pitch forward", "tip", "gentle", "control"],
        failKeywords: ["fast", "rush", "yank", "hurry"],
        concept:
          "'Smooth is fast': jerking the levers on a heavy rack can pop a smaller lift's rear wheels off the ground or pitch the load forward into the loaders. Smooth hydraulic control is both safer and, over the shift, faster.",
      },
    ],
  },

  // ── MODULE 8 — INDOOR ARENA (TRACK A) ───────────────────────────────────
  {
    id: 8,
    slug: "indoor-arena-ops",
    order: 8,
    icon: "Building2",
    title: "Indoor Arena & Theater Operations",
    subtitle: "Track A — tight, high-pedestrian, load-limited floors",
    summary:
      "Dock-plate discipline, floor load limits, and carbon-monoxide management on combustion lifts.",
    whyItMatters:
      "Arena floors are high-agility, high-precision, high-pedestrian zones over surfaces that can't always take the weight — ice rinks, subterranean facilities, aging stages. And a fleet of propane lifts can poison the air the crew breathes.",
    readMinutes: 7,
    sections: [
      {
        heading: "The Loading Dock Bottleneck",
        lede: "The dock is the highest-stress choke point of the entire load-in.",
        steps: [
          "Confirm the dock plate is rated for your machine + load before crossing",
          "Verify the truck's wheels are chocked and the trailer can't creep",
          "Watch the dock-plate transition — it vibrates and shifts under repeated crossings",
          "Manage the cross-docking flow; don't stack up behind another lift on the plate",
        ],
        callout: {
          kind: "hard-rule",
          title: "Rated plate, chocked truck",
          body: "Never cross a dock plate you haven't confirmed is rated for the load, onto a trailer whose wheels aren't chocked. The plate failing or the truck rolling is a fatal drop.",
        },
      },
      {
        heading: "Floor Load Limits",
        body: [
          "Arena floors often sit over subterranean sports facilities, ice-rink covers, or aging theater stages. A concentrated machine load can exceed what the surface can bear.",
          "Ask the production manager or venue for the floor's weight rating (e.g., 150 lbs/sq ft) before driving a heavy machine over it. Cross-reference with stage-deck point-loading discipline.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — ask the number",
          body: "Before driving a heavy machine over any questionable surface, get the floor's rated limit in lbs/sq ft. 'It's probably fine' is not a rating.",
        },
      },
      {
        heading: "Air Quality & Carbon Monoxide",
        lede: "Propane and diesel lifts poison enclosed air fast.",
        body: [
          "A fleet of internal-combustion lifts running constantly during a heavy indoor load-in builds toxic carbon-monoxide pockets near crew and performers.",
          "Favor electric (Class 1) lifts indoors where possible. If running propane or diesel, confirm ventilation and watch for CO symptoms — headache, dizziness, nausea.",
        ],
        callout: {
          kind: "hard-rule",
          title: "Ventilate or switch to electric",
          body: "Constant combustion lifts in an enclosed arena is a carbon-monoxide hazard. Confirm ventilation, or use electric. Crew symptoms mean stop and clear the air.",
        },
      },
      {
        heading: "The Arena Squeeze Drill",
        body: [
          "The signature indoor challenge: carry a wide, unbalanced load (a lighting cable trunk) backwards through a narrow 'backstage hallway' built of road cases, around a sharp 90° turn, using a spotter — mimicking the frantic post-show arena floor.",
          "Rolling turns only, one spotter on hand signals, constant 3-ft halo awareness.",
        ],
        callout: {
          kind: "tour-reality",
          title: "Backwards, blind, on a spotter",
          body: "The real arena floor is exactly this: a wide load, a tight turn, no forward view, and total dependence on one spotter's hands.",
        },
      },
    ],
    scenarios: [
      {
        id: "m-indoor-s1",
        technique: "Dock-Plate Discipline",
        prompt:
          "You're about to drive a loaded lift across a dock plate into a 53-ft trailer. What two things must you confirm first?",
        passKeywords: [
          "rated",
          "capacity",
          "chock",
          "chocked",
          "wheels",
          "plate",
          "secured",
        ],
        failKeywords: ["just go", "looks fine", "drive across", "no check"],
        concept:
          "Confirm the dock plate is rated for the machine + load AND the truck's wheels are chocked before crossing. Either one failing is a fatal drop.",
      },
      {
        id: "m-indoor-s2",
        technique: "Floor Load Limit",
        prompt:
          "The arena floor sits over an ice rink and an underground pool. You need to drive a 12,000 lb telehandler across it. What do you get first?",
        passKeywords: [
          "floor limit",
          "load rating",
          "weight limit",
          "lbs per",
          "sq ft",
          "square foot",
          "ask",
          "rating",
        ],
        failKeywords: ["just drive", "probably fine", "go slow only", "no check"],
        concept:
          "Get the floor's rated limit (lbs/sq ft) from the venue before driving heavy over ice covers or subterranean facilities. Confirm the surface can bear the concentrated load.",
      },
      {
        id: "m-indoor-s3",
        technique: "Carbon-Monoxide Management",
        prompt:
          "Six propane lifts are running non-stop during an enclosed arena load-in and crew start reporting headaches. What's happening and what do you do?",
        passKeywords: [
          "carbon monoxide",
          "co",
          "ventilat",
          "electric",
          "fumes",
          "stop",
          "clear air",
          "air quality",
        ],
        failKeywords: ["nothing", "keep going", "it's fine", "push through"],
        concept:
          "Constant combustion lifts build toxic CO in enclosed venues. Headaches and dizziness are warning signs — ventilate, switch to electric, and clear the air.",
      },
      {
        id: "m-indoor-s4",
        technique: "Arena Squeeze",
        prompt:
          "You must move a wide, unbalanced lighting trunk backwards around a sharp 90° turn in a narrow road-case corridor. How do you run it?",
        passKeywords: [
          "spotter",
          "hand signal",
          "rolling",
          "slow",
          "backwards",
          "halo",
          "mirror",
        ],
        failKeywords: ["fast", "alone", "no spotter", "spin", "rush"],
        concept:
          "Wide unbalanced load + tight blind turn = one dedicated spotter on hand signals, rolling turns only, constant halo awareness. Never solo, never spun in place.",
      },
      {
        id: "m-indoor-s5",
        technique: "Dock-Plate Queue Discipline",
        prompt:
          "Another lift is already crossing the dock plate into the trailer as you approach with a load. What do you do, and why not follow right behind?",
        passKeywords: ["wait", "don't stack", "one at a time", "clear", "overload", "hold back", "queue"],
        failKeywords: ["follow", "right behind", "same time", "both"],
        concept:
          "Don't stack up behind another lift on the plate. Two machines' weight on one dock plate can exceed its rating and drop both — cross one at a time, only after the plate is clear.",
      },
      {
        id: "m-indoor-s6",
        technique: "Dock-Plate Transition Watch",
        prompt:
          "You're crossing a dock plate that's been used all night. What specifically do you watch for as you transition across it?",
        passKeywords: ["vibrate", "shift", "move", "transition", "seated", "gap", "watch the plate"],
        failKeywords: ["nothing", "ignore", "speed across"],
        concept:
          "Watch the dock-plate transition — it vibrates and shifts under repeated crossings and can walk out of position. Cross slowly and confirm it's still seated against the dock and trailer.",
      },
      {
        id: "m-indoor-s7",
        technique: "Carbon-Monoxide Symptoms",
        prompt:
          "Several hours into an enclosed arena load-in with combustion lifts running, crew start reporting headaches, dizziness, and nausea. What do those symptoms indicate?",
        passKeywords: ["carbon monoxide", "co", "poisoning", "fumes", "ventilate", "clear air", "toxic"],
        failKeywords: ["tired", "hungry", "normal", "dehydration"],
        concept:
          "Headache, dizziness, and nausea are classic carbon-monoxide warning signs. Internal-combustion lifts build toxic CO pockets in enclosed venues — ventilate, switch to electric, and clear the air.",
      },
      {
        id: "m-indoor-s8",
        technique: "Electric-Indoors Preference",
        prompt:
          "You get to choose between an electric Class 1 lift and a propane Class 5 lift for a long enclosed-arena load-in. Which do you favor and why?",
        passKeywords: ["electric", "class 1", "no fumes", "air quality", "enclosed", "co", "indoor"],
        failKeywords: ["propane", "class 5", "combustion", "diesel"],
        concept:
          "Favor the electric Class 1 lift indoors — it produces no combustion exhaust, protecting air quality for crew and performers in the enclosed space. Combustion lifts belong outdoors or in well-ventilated areas.",
      },
      {
        id: "m-indoor-s9",
        technique: "Floor-Rating Source",
        prompt:
          "You need to drive a heavy machine across an arena floor that sits over an ice rink. Where do you get the floor's weight rating, and what units is it in?",
        passKeywords: ["production manager", "venue", "ask", "lbs per sq ft", "lbs/sq ft", "square foot", "rating", "150"],
        failKeywords: ["guess", "assume", "no need", "eyeball"],
        concept:
          "Ask the production manager or venue for the floor's rated limit, expressed in lbs per square foot (e.g., 150 lbs/sq ft). A concentrated machine load can exceed what an ice-cover or aging stage can bear.",
      },
      {
        id: "m-indoor-s10",
        technique: "Trailer-Chock Verification",
        prompt:
          "Before you drive a loaded lift across the dock plate into a trailer, why is confirming the truck's wheels are chocked as important as the plate rating?",
        passKeywords: ["chock", "creep", "roll", "trailer moves", "gap", "drop", "pull away"],
        failKeywords: ["not important", "plate only", "ignore"],
        concept:
          "If the trailer isn't chocked it can creep forward as you drive on, opening a gap at the dock plate and dropping your machine into it. Confirm the wheels are chocked and the trailer can't move.",
      },
      {
        id: "m-indoor-s11",
        technique: "Arena Squeeze Execution",
        prompt:
          "Post-show, you must move a wide, unbalanced lighting cable trunk backwards through a narrow road-case corridor and around a sharp 90° turn. How do you run it?",
        passKeywords: ["one spotter", "hand signals", "rolling turn", "slow", "halo", "backwards", "spotter"],
        failKeywords: ["solo", "fast", "pivot", "spin in place"],
        concept:
          "Arena Squeeze: run it with one dedicated spotter on hand signals, rolling turns only, and constant 3-foot halo awareness. Never solo the move and never spin in place in a tight corridor.",
      },
    ],
  },

  // ── MODULE 9 — OUTDOOR FESTIVAL (TRACK B) ───────────────────────────────
  {
    id: 9,
    slug: "outdoor-festival-ops",
    order: 9,
    icon: "Tent",
    title: "Outdoor Festival & Telehandler Operations",
    subtitle: "Track B — rough terrain, leverage, and load charts",
    summary:
      "Reading the Load Capacity Chart, deploying stabilizers, and spotting the invisible-mud tip-over.",
    whyItMatters:
      "Outdoor festival builds run on Class 7 telehandlers ('shooting booms') across uncompacted ground. The higher and farther the boom reaches, the less it can safely lift — and a single tire sinking into hidden mud is a tip-over.",
    readMinutes: 8,
    sections: [
      {
        heading: "Reading the Load Capacity Chart",
        lede: "A telehandler's rated capacity is not one number — it's a chart.",
        body: [
          "Capacity drops as the boom extends outward and upward. The load chart maps safe capacity against boom angle and extension length.",
          "Read your actual boom position against the chart BEFORE the pick — a weight that's safe tucked in can tip you when extended.",
        ],
        callout: {
          kind: "hard-rule",
          title: "Read the chart for the actual position",
          body: "Rated capacity applies only at the boom's most favorable position. At full reach and height, safe capacity can drop by more than half. Read the chart for where the boom actually is.",
        },
      },
      {
        heading: "Boom Extension & Leverage",
        body: [
          "Every foot the boom extends out moves the load's center of gravity farther from the machine, increasing the tipping moment.",
          "Keep loads tucked in and low while traveling; only extend once positioned and stabilized. Use smooth hydraulic control — a sudden extend or drop at reach can pitch the machine forward.",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — tuck to travel, extend to place",
          body: "Carry with the boom retracted and low. Extend only when you're set, stabilized, and reading the chart for that position.",
        },
      },
      {
        heading: "Stabilizer Deployment & Frame Leveling",
        lede: "Outriggers and a level frame come before any high pick.",
        steps: [
          "Position the machine on the most solid ground available",
          "Deploy all stabilizers/outriggers onto firm footing (add cribbing or pads on soft ground)",
          "Use the chassis-leveling system to level the frame — a boom is only safe over a level base",
          "Confirm the frame is level BEFORE extending the boom",
          "Extend smoothly to the target height without jerking the controls",
        ],
        callout: {
          kind: "hard-rule",
          title: "No pads, no pick",
          body: "On soft festival ground, never extend the boom without confirmed firm bearing (cribbing/pads) under every stabilizer and a level frame.",
        },
      },
      {
        heading: "The Invisible Mud Tip-Over",
        body: [
          "Festival grounds hide washouts and soft spots under plywood, ground-protection plastic, or a thin dry crust. A telehandler carrying a generator can tip the instant one tire sinks.",
          "Actively read the terrain — probe questionable ground, watch for sinking or listing, and route over compacted paths. And the grade rule: on ramps, the load always points UPHILL.",
        ],
        callout: {
          kind: "tour-reality",
          title: "The ground lies",
          body: "A flat sheet of plywood can hide a washout that swallows a tire. Read the terrain actively; if a tire starts to sink or the machine lists, stop before the point of no return.",
        },
      },
    ],
    scenarios: [
      {
        id: "m-out-s1",
        technique: "Load Capacity Chart",
        prompt:
          "A generator weighs well under the telehandler's rated capacity, but you need it placed at full boom extension and height. Why isn't the rated number enough?",
        passKeywords: [
          "chart",
          "capacity drops",
          "extension",
          "reach",
          "derate",
          "boom position",
          "leverage",
          "less capacity",
        ],
        failKeywords: ["rated is fine", "under limit", "just lift", "no problem"],
        concept:
          "A telehandler's safe capacity drops sharply as the boom extends out and up. Read the Load Capacity Chart for the actual boom position, not just the headline rating.",
      },
      {
        id: "m-out-s2",
        technique: "Stabilizer & Frame Leveling",
        prompt:
          "You're on soft festival ground and need a high pick to a stage roof. What must you set up before extending the boom?",
        passKeywords: [
          "stabilizer",
          "outrigger",
          "cribbing",
          "pad",
          "level",
          "firm",
          "leveling",
          "solid",
        ],
        failKeywords: ["just extend", "no time", "lift it", "skip"],
        concept:
          "Deploy all stabilizers onto firm footing (cribbing/pads on soft ground) and level the frame before extending. No pads and a level base, no pick.",
      },
      {
        id: "m-out-s3",
        technique: "Invisible Mud Tip-Over",
        prompt:
          "You're crossing festival ground covered in plywood sheets with a generator on the forks. One front tire suddenly starts sinking. What do you do, and what's the hazard?",
        passKeywords: [
          "stop",
          "sink",
          "tip",
          "soft",
          "washout",
          "mud",
          "back off",
          "reverse",
        ],
        failKeywords: ["push through", "power out", "keep going", "gas it"],
        concept:
          "Invisible Mud Tip-Over: hidden soft spots under plywood can swallow a tire and tip the machine. Stop before the point of no return — never power through a sinking tire.",
      },
      {
        id: "m-out-s4",
        technique: "Uphill Load Rule",
        prompt:
          "You must move a heavy generator up a festival ramp to the stage deck. Which way does the load point, and why?",
        passKeywords: [
          "uphill",
          "up hill",
          "up the grade",
          "point up",
          "high side",
          "up the ramp",
        ],
        failKeywords: ["downhill", "down the", "forward down", "doesn't matter"],
        concept:
          "On any grade, the load always points UPHILL — ascending or descending — to keep the center of gravity behind the machine and stop a forward tip or the load sliding off.",
      },
      {
        id: "m-out-s5",
        technique: "Travel-Tucked Rule",
        prompt:
          "You're moving a load across festival ground to a stage before making a high pick. How do you carry the load while traveling, and when do you extend the boom?",
        passKeywords: ["tucked", "low", "retracted", "travel low", "extend after", "positioned", "stabilized"],
        failKeywords: ["extended", "high", "reach while driving", "boom out"],
        concept:
          "Keep loads tucked in and low while traveling; only extend the boom once you're positioned and stabilized. Every foot of extension while moving pushes the center of gravity out and invites a tip.",
      },
      {
        id: "m-out-s6",
        technique: "Cribbing on Soft Ground",
        prompt:
          "You need to set outriggers on soft festival turf for a high pick. The stabilizer feet will sink into the ground. What do you do before deploying them?",
        passKeywords: ["cribbing", "pads", "crib", "spread", "firm footing", "plate", "under outrigger"],
        failKeywords: ["straight on soft", "no pad", "just deploy"],
        concept:
          "Deploy stabilizers onto firm footing — add cribbing or pads on soft ground so the feet don't sink. An outrigger that punches into soft turf mid-lift collapses the base and drops the machine.",
      },
      {
        id: "m-out-s7",
        technique: "Level-Before-Extend Rule",
        prompt:
          "Your telehandler is on a slight slope with outriggers down. You're about to extend the boom to height. What must you confirm first, and why?",
        passKeywords: ["level", "frame level", "chassis", "before extend", "leveling system", "level base"],
        failKeywords: ["extend anyway", "close enough", "ignore level"],
        concept:
          "Use the chassis-leveling system to level the frame and confirm it BEFORE extending the boom. A boom is only safe over a level base — extending off-level throws the load outside the stability envelope.",
      },
      {
        id: "m-out-s8",
        technique: "Terrain Probing",
        prompt:
          "You're routing a loaded telehandler across festival grounds covered in ground-protection plastic and plywood. How do you decide where it's safe to drive?",
        passKeywords: ["probe", "read terrain", "compacted", "route", "solid", "watch for sinking", "listing", "test ground"],
        failKeywords: ["straight line", "assume solid", "any path"],
        concept:
          "Actively read the terrain — probe questionable ground and route over compacted paths. Festival grounds hide washouts and soft spots under plywood and plastic; a thin dry crust can swallow a tire.",
      },
      {
        id: "m-out-s9",
        technique: "Smooth-Hydraulic Control",
        prompt:
          "At full reach with a generator on the forks, you need to make a boom adjustment. Why must the input be smooth, and what does a sudden extend or drop risk?",
        passKeywords: ["smooth", "no jerk", "pitch forward", "tip", "sudden", "gradual", "momentum", "gentle"],
        failKeywords: ["fast", "jerk", "quick", "snap"],
        concept:
          "At reach, a sudden extend or drop can pitch the machine forward into a tip. Use smooth, gradual hydraulic control — the load's leverage amplifies any jerky input into a tipping force.",
      },
      {
        id: "m-out-s10",
        technique: "Chart-Before-Pick Habit",
        prompt:
          "A load is well within your telehandler's headline rating when tucked in, but the placement requires full extension and height. What do you check before committing to the pick?",
        passKeywords: ["load chart", "capacity chart", "boom position", "extension", "angle", "actual position", "derate", "before pick"],
        failKeywords: ["headline rating", "just lift", "tucked number"],
        concept:
          "Read the Load Capacity Chart for your ACTUAL boom angle and extension before the pick. A weight that's safe tucked in can tip you when extended — the headline rating only applies at minimum reach.",
      },
      {
        id: "m-out-s11",
        technique: "Sinking-Tire Response",
        prompt:
          "Mid-travel across plywood-covered ground with a generator on the forks, one front tire begins to sink. What is your immediate action and what's the hazard?",
        passKeywords: ["stop", "back off", "reverse", "sinking", "tip", "soft spot", "washout", "off the soft"],
        failKeywords: ["push through", "power out", "keep going", "speed up"],
        concept:
          "Invisible Mud Tip-Over: stop immediately and ease back off the soft spot the way you came. A sinking tire is a washout under the crust — powering forward drives the machine into a tip.",
      },
    ],
  },

  // ── MODULE 10 ──────────────────────────────────────────────────────────
  {
    id: 10,
    slug: "heavy-physics",
    order: 10,
    icon: "Wind",
    title: "Heavy Physics & Venue Dynamics",
    subtitle: "Wind, flex, cable bridges, and temporary floors",
    summary: "Sail Effect derating, truss deflection, the 45° cable crossing, and stage-deck point loads.",
    whyItMatters:
      "Concert gear doesn't behave like warehouse pallets. Wind, flex, cable bridges, and temporary floors create hazards most operators have never trained for.",
    readMinutes: 8,
    sections: [
      {
        heading: "The Sail Effect (Wind-Load Derating)",
        lede: "A 20-foot LED wall or fabric sail creates massive wind drag. Even 15 mph can tip you.",
        steps: [
          "Check the wind speed",
          "If wind is at or above 15 mph — STOP. Do not lift.",
          "If below 15 mph, derate: assume safe capacity is 20–30% LOWER than the chart",
          "Deploy ALL outriggers / stabilizers before extending the boom",
          "Keep movements slow and smooth — no quick motions",
        ],
        callout: {
          kind: "hard-rule",
          title: "15 mph = no high lifts",
          body: "At or above 15 mph with a flat surface (LED wall, fabric sail), the lift does not happen. The engine returns HARD_STOP for a reason.",
        },
      },
      {
        heading: "Truss Bundle Deflection",
        lede: "40-foot aluminum truss bows and flexes — lift it wrong and it slides off or warps.",
        steps: [
          "Spread your forks to MAXIMUM width",
          "Position forks near the OUTER THIRDS of the bundle (not the center)",
          "Lift slowly and smoothly — no jerking",
          "Drive slowly — bouncing makes the bundle flex and slide",
          "Never center-lift a long truss bundle",
        ],
      },
      {
        heading: "The 45-Degree Cable Bridge Crossing",
        lede: "Yellow cable ramps protect high-voltage lines. Crossing straight-on can crush them.",
        steps: [
          "Approach the cable ramp at a 45-DEGREE ANGLE",
          "One tire crosses at a time — not both at once",
          "Slow down to a crawl",
          "Let the machine roll over the ramp gradually",
          "Never cross straight-on at speed",
        ],
        callout: {
          kind: "tour-reality",
          title: "Crush the cable, kill the show",
          body: "Those ramps cover 3-phase feeder lines. Crush a jacket and you can short the tour's entire power grid mid-load-in.",
        },
      },
      {
        heading: "Stage Deck Point-Loading",
        body: [
          "Temporary decks have weight limits per square foot. A 12,000 lb machine concentrates that weight on four small tire contact patches.",
          "Ask the production manager for the deck's load rating (e.g., 150 lbs/sq ft). Do not drive on if you're unsure. Drive slowly — no hard stops or sharp turns. Keep moving to spread the load; stationary = concentrated point load.",
        ],
      },
    ],
    scenarios: [
      {
        id: "m4-s1",
        technique: "Sail Effect Wind-Load Derating",
        prompt:
          "You're lifting a 4,000 lb LED wall panel to 25 ft outdoors. Wind is steady at 15 mph. What must you do before raising the boom?",
        passKeywords: ["derate", "wind load", "sail", "reduce", "capacity", "stabilizer", "outrigger"],
        failKeywords: ["nothing", "proceed", "normal", "fine"],
        concept:
          "Sail Effect Wind-Load Derating: a 15 mph wind can slash safe capacity 20–30% on flat surfaces. Derate and deploy outriggers.",
      },
      {
        id: "m4-s2",
        technique: "Wide Pick-Point Configuration",
        prompt:
          "You're unloading 40-foot aluminum truss bundles from a flatbed. How do you configure your forks to prevent the truss from bowing?",
        passKeywords: ["wide", "spread", "outer third", "maximum width"],
        failKeywords: ["center", "narrow", "close"],
        concept:
          "Wide Pick-Point Configuration: fork near the outer thirds of the load. Center picks on long truss cause severe structural deflection.",
      },
      {
        id: "m4-s3",
        technique: "45-Degree Cable Bridge Crossing",
        prompt:
          "You must drive over yellow cable ramp protectors covering high-voltage feeder lines. What's the crossing technique?",
        passKeywords: ["45", "angle", "diagonal", "one tire", "stagger"],
        failKeywords: ["straight", "fast", "slow and straight", "perpendicular"],
        concept:
          "45-Degree Cable Bridge Crossing: one tire at a time over the ramp distributes weight and prevents crushing the cable jacket.",
      },
      {
        id: "m4-s4",
        technique: "Wind Hard-Stop Threshold",
        prompt:
          "You're about to raise a boom pick outdoors and the anemometer reads a steady 15 mph. What's your call?",
        passKeywords: ["stop", "15", "do not lift", "no lift", "hard stop", "threshold", "hold"],
        failKeywords: ["proceed", "careful", "lift anyway", "fine"],
        concept:
          "At or above 15 mph — STOP. Do not lift. 15 mph is a hard threshold, not a judgment call; above it the sail effect on the load can overpower the machine.",
      },
      {
        id: "m4-s5",
        technique: "Sub-Threshold Derating",
        prompt:
          "The wind is holding at 12 mph — below the stop threshold — but you're making a tall outdoor pick. How do you adjust your capacity assumption and setup?",
        passKeywords: ["derate", "20", "30", "lower", "20-30", "outriggers", "slow", "reduce capacity"],
        failKeywords: ["full capacity", "chart number", "no change"],
        concept:
          "Below 15 mph, derate: assume safe capacity is 20–30% LOWER than the chart, deploy all outriggers before extending, and keep movements slow and smooth. Wind steals capacity even under the stop threshold.",
      },
      {
        id: "m4-s6",
        technique: "Truss Outer-Thirds Pick",
        prompt:
          "You're lifting a 40-foot aluminum truss bundle off a flatbed. Where do you position your forks and how wide, to stop the truss from bowing?",
        passKeywords: ["outer thirds", "wide", "maximum width", "spread", "not center", "outer", "thirds"],
        failKeywords: ["center", "narrow", "middle", "close together"],
        concept:
          "Spread the forks to maximum width and position them near the outer thirds of the bundle. Never center-lift a long truss — a center pick causes severe structural deflection and the bundle slides.",
      },
      {
        id: "m4-s7",
        technique: "Stage-Deck Point-Loading",
        prompt:
          "You must cross a temporary stage deck rated per square foot with a 12,000 lb machine. Beyond checking the rating, how do you drive to avoid a point-load failure?",
        passKeywords: ["keep moving", "slow", "no hard stop", "no sharp turn", "spread", "don't park", "stationary"],
        failKeywords: ["stop on it", "park", "hard brake", "spin"],
        concept:
          "Stage Deck Point-Loading: drive slowly with no hard stops or sharp turns, and keep moving to spread the load. Stationary equals a concentrated point load on four small contact patches — that's what punches through a deck.",
      },
      {
        id: "m4-s8",
        technique: "Cable-Ramp Crossing",
        prompt:
          "You need to drive over yellow cable ramps covering high-voltage feeder lines. Give the exact crossing technique.",
        passKeywords: ["45", "angle", "one tire", "crawl", "slow", "gradual", "one at a time"],
        failKeywords: ["straight", "fast", "both tires", "speed"],
        concept:
          "45-Degree Cable Bridge Crossing: approach at 45°, cross one tire at a time at a crawl, letting the machine roll over gradually. Crossing straight-on at speed crushes the cable jacket and can arc-fault the feeder.",
      },
    ],
  },

  // ── MODULE 11 ──────────────────────────────────────────────────────────
  {
    id: 11,
    slug: "night-chaos",
    order: 11,
    icon: "Moon",
    title: "Night Load-In Chaos",
    subtitle: "Strobes, haze, darkness, and sensitive floors",
    summary: "Flash Blindness protocol, tire-scrubbing avoidance, and the ice-rink insulation trap.",
    whyItMatters:
      "At 2:00 AM after a long shift, your eyes and brain are not working at full capacity. The venue adds strobes, haze, and darkness. Routine moves become dangerous.",
    readMinutes: 6,
    sections: [
      {
        heading: "Flash Blindness Protocol",
        lede: "Lighting crews test strobes without warning. A flash wipes your night vision for seconds.",
        steps: [
          "STOP the machine IMMEDIATELY — velocity drops to zero",
          "Do not try to keep moving slowly — you are blind",
          "Do not lean out the cage to see better",
          "Do not trust muscle memory to finish the move",
          "Hold position. Wait for vision to return. Only then continue.",
        ],
        callout: {
          kind: "hard-rule",
          title: "Zero velocity when vision is compromised",
          body: "Every time. There is no slow-and-careful version of driving blind.",
        },
      },
      {
        heading: "Tire Scrubbing on Sensitive Floors",
        lede: "A spinning pivot turn burns through plywood and scars the hardwood underneath.",
        steps: [
          "Keep the machine ROLLING slightly during all turns",
          "Never execute a full stationary pivot (spinning in place)",
          "Use slow, arcing turns — like a car making a U-turn",
          "If space is too tight, back-and-fill in small increments rather than spinning",
        ],
        callout: {
          kind: "tour-reality",
          title: "Billed to the tour",
          body: "Gouged NBA hardwood costs thousands — and it lands on the production's invoice. Rolling turns protect the floor and the budget.",
        },
      },
      {
        heading: "Ice Rink Insulation Trap",
        body: [
          "Many arenas have temporary insulated decking over ice rinks. Parking a heavy machine in one spot compresses the panels and 'cold-sweats' where insulation meets the ice — a subtle sag that tilts your machine.",
          "Never park heavy loads long-term over arena ice decking. Keep the machine or load moving, or move to a solid perimeter edge with structural support. If you must hold, keep the load elevated — not sitting on the deck.",
        ],
      },
    ],
    scenarios: [
      {
        id: "m5-s1",
        technique: "Flash Blindness + STOP Rule",
        prompt:
          "Lighting crew fires high-intensity strobes directly above you at 1:15 AM. Your night vision is wiped out completely. What do you do?",
        passKeywords: ["stop", "freeze", "halt", "stand still", "wait"],
        failKeywords: ["slow", "lean", "edge", "keep moving", "continue"],
        concept:
          "Flash Blindness + STOP Rule: velocity drops to zero instantly. Never trust muscle memory during visual blackout.",
      },
      {
        id: "m5-s2",
        technique: "Rolling-Turn (Anti-Scrub)",
        prompt:
          "You need a tight turn on an NBA hardwood court covered with temporary plywood. What does 'tire scrubbing' mean and how do you avoid it?",
        passKeywords: ["rolling", "momentum", "don't spin", "stationary", "moving turn", "pivot"],
        failKeywords: ["reverse", "slow", "careful"],
        concept:
          "Tire Scrubbing = stationary pivot turns that burn through plywood and scar hardwood. Keep rolling momentum during all turns.",
      },
      {
        id: "m5-s3",
        technique: "Ice Rink Insulation Trap",
        prompt:
          "An arena has temporary insulated decking over an ice rink. You park a 6,000 lb stack of steel base plates center-court for 15 minutes. What risk are you ignoring?",
        passKeywords: ["ice", "compress", "sag", "tilt", "deck", "insulation", "cold", "sweat"],
        failKeywords: ["fine", "no risk", "nothing"],
        concept:
          "Ice Rink Insulation Trap: heavy stationary loads compress the insulated panels, causing cold-sweating and surface tilt.",
      },
      {
        id: "m5-s4",
        technique: "Flash-Blindness Discipline",
        prompt:
          "A strobe wipes out your night vision mid-move. Besides stopping, name two things you must NOT do while you're blind.",
        passKeywords: ["stop", "don't lean", "no lean out", "muscle memory", "don't trust", "hold", "wait for vision"],
        failKeywords: ["keep moving", "lean out", "finish", "guess"],
        concept:
          "Flash Blindness + STOP: velocity drops to zero. Do not lean out of the cage to see better and do not trust muscle memory to finish the move — hold position until vision returns.",
      },
      {
        id: "m5-s5",
        technique: "Rolling-Turn Definition",
        prompt:
          "On a plywood-covered hardwood court, what is 'tire scrubbing,' and what turning technique prevents it?",
        passKeywords: ["stationary pivot", "spin in place", "rolling", "keep rolling", "arcing", "scrub", "burn"],
        failKeywords: ["pivot", "spin", "stationary is fine"],
        concept:
          "Tire scrubbing is a stationary pivot (spinning in place) that burns through plywood and scars the floor beneath. Keep the machine rolling slightly through every turn — slow, arcing turns like a car's U-turn.",
      },
      {
        id: "m5-s6",
        technique: "Back-and-Fill Maneuver",
        prompt:
          "The turn you need is too tight to complete with a rolling arc without a stationary pivot. What's the correct alternative?",
        passKeywords: ["back and fill", "back-and-fill", "increments", "small", "multi-point", "reverse", "steps"],
        failKeywords: ["spin", "pivot", "force it", "stationary"],
        concept:
          "If space is too tight for a rolling arc, back-and-fill in small increments rather than spinning in place. Multiple small rolling moves protect the floor where a single stationary pivot would scrub it.",
      },
      {
        id: "m5-s7",
        technique: "Ice-Deck Elevated Hold",
        prompt:
          "Circumstances force you to briefly hold position over insulated decking above an ice rink. If you can't keep moving, how do you minimize the risk?",
        passKeywords: ["elevated", "keep load up", "not on deck", "perimeter", "solid edge", "don't set down", "raised"],
        failKeywords: ["set down", "park on deck", "lower", "rest it"],
        concept:
          "Never park heavy loads long-term over ice decking. If you must hold, keep the load elevated — not resting on the deck — or move to a solid perimeter edge with structural support to avoid compressing the panels.",
      },
      {
        id: "m5-s8",
        technique: "Strobe-Wipe Response",
        prompt:
          "It's 1:15 AM and the lighting crew fires high-intensity strobes directly above your position, wiping your vision completely. What is your immediate action?",
        passKeywords: ["stop", "zero", "halt", "hold", "wait", "vision returns"],
        failKeywords: ["slow", "keep going", "finish", "lean"],
        concept:
          "Velocity to zero, instantly. During a visual blackout you are blind — hold position and wait for your vision to return before continuing. Never creep forward 'slowly' while you can't see.",
      },
    ],
  },

  // ── MODULE 12 ──────────────────────────────────────────────────────────
  {
    id: 12,
    slug: "rigging-coordination",
    order: 12,
    icon: "Anchor",
    title: "Rigging Coordination & Up-Look Protocol",
    subtitle: "The airspace above you is a deadly work zone",
    summary: "The mandatory Up-Look, managing ground + overhead at once, and sling-load dynamics.",
    whyItMatters:
      "High-riggers work 40–80 feet above the floor. A 2 lb shackle falling 60 feet hits with the same force as a 120 lb weight dropped 1 foot. The airspace above you is a deadly work zone.",
    readMinutes: 7,
    sections: [
      {
        heading: "The Up-Look Protocol",
        lede: "Required before entering ANY area with active overhead rigging.",
        steps: [
          "STOP the machine at the edge of the zone",
          "Look UP — scan the entire overhead area slowly",
          "Look for dangling hardware, loose motors, active riggers",
          "Confirm the drop zone is clear",
          "Radio or verbally confirm with the rigging lead that it's safe",
          "Only after confirmation — enter the zone",
        ],
        callout: {
          kind: "core-drill",
          title: "Core Drill — 15 seconds, every time",
          body: "Stop at the edge, look up, confirm, proceed. It is mandatory and it is not negotiable when work is overhead.",
        },
      },
      {
        heading: "Ground + Overhead Simultaneously",
        lede: "Sometimes a push crew is in your path WHILE riggers work above.",
        steps: [
          'Call "STOP" — halt all ground movement first',
          'Wait for the "STOP" echo from ground crew',
          "Confirm the 3-foot halo zone is clear around your machine",
          "Now do your Up-Look — scan above you",
          "Only after BOTH ground and overhead are confirmed clear do you proceed",
        ],
        callout: {
          kind: "hard-rule",
          title: "Never manage one hazard at a time",
          body: "Clearing the ground while ignoring the sky (or vice versa) is how people get hit. Lock out, clear both, then move.",
        },
      },
      {
        heading: "Sling Lifts on Bare Forks",
        body: [
          "Slings or chains choked around bare forks lift audio arrays and structures. The load swings freely — it is not rigid. Any movement causes a pendulum effect that constantly shifts the machine's center of gravity.",
          "Slow ALL movements by at least 50%. No sudden starts, stops, or direction changes. Have a qualified rigger control the load with a tag line.",
        ],
      },
    ],
    scenarios: [
      {
        id: "m6-s1",
        technique: "Up-Look Protocol",
        prompt:
          "You back toward center stage at 2:00 AM. High-riggers are active 60 feet above. What is your first action before entering the rigging zone?",
        passKeywords: ["up-look", "look up", "scan", "overhead", "above", "clear", "sky"],
        failKeywords: ["proceed", "drive", "honk", "radio"],
        concept:
          "Up-Look Protocol: always scan the airspace before entering a rigging zone. A 2 lb shackle falling 60 ft hits with devastating force.",
      },
      {
        id: "m6-s2",
        technique: "Dual-Hazard Lockout",
        prompt:
          "A rigger drops a verbal warning while you have ground crew pushing a load in your path simultaneously. How do you handle both?",
        passKeywords: ["stop", "halo", "up-look", "both", "overhead", "clear ground"],
        failKeywords: ["ground only", "look up only", "proceed", "choose"],
        concept:
          "Call STOP, clear the 3-ft halo, then perform Up-Look. Never manage only one hazard at a time.",
      },
      {
        id: "m6-s3",
        technique: "Sling-Load Pendulum Dynamics",
        prompt:
          "You are about to pick up a 10,000 lb audio array using nylon slings choked around your bare forks. What load behavior changes compared to a rigid pallet?",
        passKeywords: ["swing", "pendulum", "center of gravity", "shift", "unstable", "sling", "dynamic"],
        failKeywords: ["same", "fine", "nothing"],
        concept:
          "Sling-suspended loads swing freely, dramatically shifting the machine's center of gravity compared to rigid pallet contact.",
      },
      {
        id: "m6-s4",
        technique: "Up-Look First Action",
        prompt:
          "You're backing toward center stage where high-riggers are active 60 feet up. What is your very first action at the edge of the rigging zone?",
        passKeywords: ["stop", "look up", "up-look", "scan", "overhead", "edge", "airspace"],
        failKeywords: ["enter", "continue", "back in", "keep going"],
        concept:
          "Up-Look Protocol: STOP at the edge of the zone and look UP, scanning the entire overhead area slowly for dangling hardware, loose motors, and active riggers before you enter.",
      },
      {
        id: "m6-s5",
        technique: "Rigging-Lead Confirmation",
        prompt:
          "Your overhead scan looks clear, but riggers are still working above. What must happen before you actually drive into the drop zone?",
        passKeywords: ["radio", "confirm", "rigging lead", "verbal", "clear", "ask", "communicate"],
        failKeywords: ["just go", "looks clear", "assume", "enter"],
        concept:
          "A clear-looking scan isn't enough while riggers are active. Radio or verbally confirm with the rigging lead that it's safe, and only enter after you get that explicit confirmation.",
      },
      {
        id: "m6-s6",
        technique: "Sling-Load Pendulum Control",
        prompt:
          "You're lifting a 10,000 lb audio array on nylon slings choked over your bare forks. How much do you slow your movements and what extra control do you add?",
        passKeywords: ["50", "half", "slow", "tag line", "rigger", "no sudden", "smooth"],
        failKeywords: ["normal speed", "fast", "no tag", "quick"],
        concept:
          "Slow ALL movements by at least 50% — no sudden starts, stops, or direction changes — and have a qualified rigger steady the load with a tag line. A suspended load swings and shifts the machine's center of gravity constantly.",
      },
      {
        id: "m6-s7",
        technique: "Dual-Hazard Lockout",
        prompt:
          "A rigger calls a verbal warning at the same moment ground crew is pushing a load across your path. How do you handle two hazards at once?",
        passKeywords: ["stop", "call stop", "clear halo", "3-foot", "up-look", "one at a time", "both"],
        failKeywords: ["manage one", "ignore overhead", "keep moving", "pick one"],
        concept:
          "Never manage only one hazard at a time. Call STOP, clear the 3-foot halo on the ground, THEN perform your Up-Look — resolve both the ground and overhead hazard before any movement.",
      },
      {
        id: "m6-s8",
        technique: "Falling-Object Physics",
        prompt:
          "Why is the Up-Look Protocol treated as non-negotiable even when riggers are '60 feet up and nowhere near you'?",
        passKeywords: ["falling", "shackle", "force", "60 ft", "small object", "kills", "impact", "distance"],
        failKeywords: ["not needed", "far away", "safe", "no risk"],
        concept:
          "A small dropped object — even a 2 lb shackle — falling 60 feet strikes with devastating, potentially fatal force. Distance below active riggers is exactly why you scan the airspace before entering.",
      },
    ],
  },

  // ── MODULE 13 ──────────────────────────────────────────────────────────
  {
    id: 13,
    slug: "fatigue-pressure",
    order: 13,
    icon: "ShieldAlert",
    title: "Fatigue, Pressure & Stop-Work Authority",
    subtitle: "The exhausted operator is the biggest risk on site",
    summary: "Reading your own fatigue, invoking Stop-Work Authority, and the Hero Operator trap.",
    whyItMatters:
      "The biggest risk on a 2:00 AM load-out is not the machine. It is the exhausted operator who pushes past their limit. Fatigue causes delayed reactions, tunnel vision, and microsleep.",
    readMinutes: 7,
    sections: [
      {
        heading: "Know Your Fatigue Signs",
        body: [
          "Watch for these in yourself: eyes that feel heavy or keep losing focus; moments where you 'wake up' and realize you zoned out; slowed reaction time; forgetting your last few moves; irritability or difficulty making simple decisions.",
          "If ANY of these happen during an operation — stop immediately.",
        ],
      },
      {
        heading: "How to Invoke Stop-Work Authority",
        lede: "Any person on the crew can halt an unsafe operation. As the operator, you have full authority.",
        steps: [
          'Say "STOP" — loudly and clearly',
          "Freeze the machine — all hydraulics and motion halt",
          'State your reason calmly: "I am fatigued and need relief." / "This load is compromised." / "The rigging zone is not clear."',
          "Do not proceed until the issue is resolved",
        ],
        callout: {
          kind: "hard-rule",
          title: "Stop-Work is a duty, not just a right",
          body: "You have the authority and the obligation to halt unsafe work. Using it is the job — not a failure to do the job.",
        },
      },
      {
        heading: "Handling Production Pressure",
        body: [
          "Scenario: the Tour Manager is screaming that the truck leaves in 20 minutes. Do NOT fold ('okay, I'll just be careful'), do not argue or get emotional, do not threaten to quit.",
          "Use professional, factual, unarguable language: 'The load is structurally compromised. It cannot travel.' · 'I am past safe operating limits. I need relief.' · 'The rigging zone is not cleared. We cannot proceed.'",
          "These phrases are objective and remove emotion. An accident cancels the tour. A 15-minute delay does not.",
        ],
        callout: {
          kind: "tour-reality",
          title: "Cold facts disarm pressure",
          body: "Strip the emotion. Objective safety statements give a professional PM something they can respect and act on — and give you nothing to argue about.",
        },
      },
      {
        heading: "The Hero Operator Trap",
        body: [
          "'Hero Operator' = someone who pushes through exhaustion and pressure to 'save the show.' Reaction time at 14+ hours is severely degraded; tunnel vision misses peripheral hazards; microsleep can drop a load or crush someone.",
          "One accident doesn't hurt one person — it shuts down the whole tour, potentially permanently. Being the operator who calls STOP when it counts IS saving the show.",
        ],
      },
    ],
    scenarios: [
      {
        id: "m7-s1",
        technique: "Stop-Work Authority (Fatigue)",
        prompt:
          "It's 4:00 AM, 14 hours into your shift. You feel a microsleep coming on. The Tour Manager demands one final lift to make the truck time. What do you do?",
        passKeywords: ["stop", "refuse", "stop-work", "fatigue", "relief", "no", "decline"],
        failKeywords: ["push through", "do it", "just one", "quick"],
        concept:
          "Stop-Work Authority: fatigue is the highest risk factor on site. Requesting relief is professionalism, not weakness.",
      },
      {
        id: "m7-s2",
        technique: "Production-Pressure Language",
        prompt:
          "The Production Manager says: 'Just push the broken cart in — this truck has to roll!' The frame welds look stressed. Give the exact professional language you use to refuse.",
        passKeywords: ["load is compromised", "stressed", "unsafe", "stop-work", "structural", "safety", "cannot"],
        failKeywords: ["okay", "slow", "shut up", "argue", "fine"],
        concept:
          "Use cold, objective terminology: 'load is compromised', 'stressed welds', 'unsafe to travel'. Strip emotion, state facts.",
      },
      {
        id: "m7-s3",
        technique: "Hero Operator Trap",
        prompt:
          "What is 'hero operator' syndrome and why is it the most dangerous thing on a 2:00 AM load-out?",
        passKeywords: ["push through", "ignore", "fatigue", "no limits", "invincible", "tired", "delayed reaction"],
        failKeywords: ["saves show", "good", "fast"],
        concept:
          "Hero Operator = someone who ignores personal limits to 'save the show'. Exhausted operators have delayed reactions, tunnel vision, and kill careers and people.",
      },
      {
        id: "m7-s4",
        technique: "Fatigue-Sign Recognition",
        prompt:
          "Name three signs of dangerous fatigue you watch for in yourself mid-operation, and what you do the moment any appear.",
        passKeywords: ["heavy eyes", "zoning out", "zoned", "slowed reaction", "forgetting", "irritable", "stop", "microsleep"],
        failKeywords: ["push through", "coffee", "keep going", "ignore"],
        concept:
          "Heavy or unfocused eyes, 'waking up' from zoning out, slowed reaction time, forgetting your last few moves, and irritability are fatigue signs. If any appear during an operation — stop immediately.",
      },
      {
        id: "m7-s5",
        technique: "Invoking Stop-Work",
        prompt:
          "You've decided to invoke Stop-Work Authority mid-lift because of a hazard. Mechanically, what do you do with the machine and how long does the stop hold?",
        passKeywords: ["freeze", "halt", "all hydraulics", "stop motion", "until resolved", "don't proceed", "no movement"],
        failKeywords: ["finish first", "lower quickly", "keep going", "brief"],
        concept:
          "Freeze the machine — all hydraulics and motion halt — and do not proceed until the issue is fully resolved. Stop-Work isn't a pause to finish the current move; it's a hard stop until it's safe.",
      },
      {
        id: "m7-s6",
        technique: "Compromised-Load Language",
        prompt:
          "A Production Manager orders you to move a cart whose frame welds look stressed. Give the exact professional language you use to refuse.",
        passKeywords: ["structurally compromised", "compromised", "cannot travel", "stressed welds", "unsafe", "not safe to travel", "factual"],
        failKeywords: ["i quit", "no way", "you're wrong", "emotional"],
        concept:
          "Use cold, objective, unarguable language: 'The load is structurally compromised. It cannot travel.' Strip emotion and state facts — objective terminology removes the argument.",
      },
      {
        id: "m7-s7",
        technique: "Pressure-Response Discipline",
        prompt:
          "The Tour Manager is screaming that the truck leaves in 20 minutes. List what you must NOT do in response, and the principle behind it.",
        passKeywords: ["don't fold", "don't argue", "don't threaten", "no quit", "factual", "objective", "delay vs accident"],
        failKeywords: ["give in", "be careful", "comply", "argue back"],
        concept:
          "Do not fold ('okay, I'll just be careful'), do not argue or get emotional, and do not threaten to quit. State objective facts instead. An accident cancels the tour; a 15-minute delay does not.",
      },
      {
        id: "m7-s8",
        technique: "Microsleep Physiology",
        prompt:
          "At 14+ hours into a shift, what does fatigue do to your reaction time and awareness, and why does a microsleep make one more lift so dangerous?",
        passKeywords: ["reaction", "delayed", "tunnel vision", "peripheral", "microsleep", "drop", "degraded", "miss hazard"],
        failKeywords: ["fine", "no effect", "adrenaline", "push"],
        concept:
          "At 14+ hours reaction time is severely degraded and tunnel vision misses peripheral hazards. A microsleep — a momentary involuntary sleep — can drop a load or crush someone in the instant you're gone.",
      },
      {
        id: "m7-s9",
        technique: "Stop-Saves-The-Show Logic",
        prompt:
          "Reframe the 'Hero Operator' instinct: explain why calling STOP when it counts protects the tour more than pushing through does.",
        passKeywords: ["accident", "cancels", "shuts down", "tour", "delay", "permanent", "saving the show", "worth it"],
        failKeywords: ["hero saves", "push through", "toughness", "just once"],
        concept:
          "One accident doesn't hurt one person — it can shut down the whole tour, potentially permanently. Being the operator who calls STOP when it counts IS saving the show; a short delay never is the disaster.",
      },
    ],
  },

  // ── CAPSTONE ─────────────────────────────────────────────────────────────
  {
    id: 14,
    slug: "capstone",
    order: 14,
    icon: "Trophy",
    title: "Capstone — The 2:00 AM Arena Load-Out",
    subtitle: "Every hazard, at once, under pressure",
    summary: "The integrated final: Up-Look, wind hard-stop, halo clearance, and Stop-Work under fatigue.",
    whyItMatters:
      "This is the test: everything compounding at once. One shortcut, one skipped step, one 'just this once' — that is how careers end and people get hurt. Passing requires all four correct.",
    readMinutes: 5,
    sections: [
      {
        heading: "The Situation",
        body: [
          "Time: 2:00 AM. Shift: 14 hours in. Load: 10,000 lb LED wall section (massive sail surface). Wind: 17 mph gusting. Rigging: high-riggers active 60 ft above center stage. Visibility: low — haze and dim house lights. Pressure: Tour Manager needs the truck to roll in 45 minutes.",
        ],
        callout: {
          kind: "hard-rule",
          title: "All four, or it's a no-pass",
          body: "The capstone is graded as an integrated whole. One skipped protocol fails the scenario — exactly as it would on the floor.",
        },
      },
      {
        heading: "The Four Decision Points",
        steps: [
          "Approaching the rigging zone — Up-Look first, radio the lead, wait for verbal 'clear' before entering.",
          "Wind hits 17 mph while raising the boom — STOP. 17 > 15 mph threshold; the LED wall is a sail. Hold.",
          "Ground crew rushes in before you signal — call STOP, wait for the echo, confirm the 3-ft halo, quick Up-Look, then hand off.",
          "You feel a microsleep coming on — stop, radio 'Operator calling STOP — requesting relief,' step down.",
        ],
      },
    ],
    scenarios: [
      {
        id: "cap-s1",
        technique: "Up-Look Protocol (Capstone)",
        prompt:
          "BRIEFING: 2:00 AM. 14 hours in. Wind 17 mph. 10,000 lb LED wall. High-riggers 60 ft up. Haze and dim light. You approach the rigging zone — what is your very first action?",
        passKeywords: ["up-look", "look up", "scan", "above", "overhead"],
        failKeywords: ["drive", "lift", "proceed"],
        concept: "Up-Look Protocol is always first in any rigging zone — period.",
      },
      {
        id: "cap-s2",
        technique: "Wind Hard-Stop (Capstone)",
        prompt:
          "As you raise the boom, wind gusts to 17 mph. Your load is the LED wall — a massive sail surface. What do you call and what do you do?",
        passKeywords: ["stop", "hard stop", "15 mph", "wind", "halt", "hold"],
        failKeywords: ["continue", "raise", "try"],
        concept:
          "HARD STOP at >15 mph wind threshold. Stop-Work Authority. LED walls derate heavily for sail effect — this is a tip-over scenario.",
      },
      {
        id: "cap-s3",
        technique: "Halo + Echo Sequence (Capstone)",
        prompt:
          "Ground crew rushes in to guide the load before you've confirmed the halo is clear. What is your protocol — in exact sequence?",
        passKeywords: ["stop", "echo", "halo", "3 foot", "clear", "up-look"],
        failKeywords: ["lower", "let them", "proceed"],
        concept:
          "Call STOP → wait for echo → confirm 3-ft halo clear → Up-Look → only then proceed.",
      },
      {
        id: "cap-s4",
        technique: "Stop-Work Under Fatigue (Capstone)",
        prompt:
          "You feel a microsleep begin. The Tour Manager is screaming. Final question: what do you do, and why does it protect the tour more than pushing through?",
        passKeywords: ["stop", "relief", "stop-work", "refuse", "fatigue", "injury", "cancel", "insurance"],
        failKeywords: ["push", "finish", "quick"],
        concept:
          "Request relief and invoke Stop-Work Authority. A fatigue accident cancels the tour permanently. A 5-minute delay does not.",
      },
      {
        id: "cap-s5",
        technique: "Sail-Surface Recognition (Capstone)",
        prompt:
          "The capstone load is a 10,000 lb LED wall section. Why does this specific load make the 17 mph wind even more dangerous than the raw number suggests?",
        passKeywords: ["sail", "surface", "wind", "derate", "large face", "catches wind", "tip", "sail effect"],
        failKeywords: ["just weight", "no difference", "fine", "solid"],
        concept:
          "An LED wall is a massive flat sail surface. Wind pushes on that whole face, so it derates far harder than a compact load — at 17 mph (over the 15 mph hard stop) it's a tip-over waiting to happen.",
      },
      {
        id: "cap-s6",
        technique: "Combined Halo + Up-Look Sequence (Capstone)",
        prompt:
          "In the capstone, riggers are 60 ft up AND ground crew rushes your load. Give the exact combined sequence before you hand off.",
        passKeywords: ["stop", "echo", "halo", "3-foot", "up-look", "then proceed", "confirm clear", "sequence"],
        failKeywords: ["hand off", "one hazard", "ground only", "keep going"],
        concept:
          "Call STOP, wait for the echo, confirm the 3-foot halo is clear, perform your Up-Look overhead, and only then proceed. Both ground and overhead must be confirmed clear — never one at a time.",
      },
      {
        id: "cap-s7",
        technique: "Low-Visibility Operation (Capstone)",
        prompt:
          "It's 2:00 AM with haze and dim house lights. How do you run your moves given the degraded visibility?",
        passKeywords: ["spotter", "slow", "hand signals", "stop if lose sight", "one spotter", "reduce speed", "visual"],
        failKeywords: ["normal speed", "solo", "guess", "muscle memory"],
        concept:
          "Low visibility means one dedicated spotter on hand signals, reduced speed, and an instant stop if you lose sight of the spotter. Haze and dim light remove your margin — slow down and lean on your spotter.",
      },
      {
        id: "cap-s8",
        technique: "Wind-Threshold Judgment (Capstone)",
        prompt:
          "The capstone wind gusts to 17 mph as you raise the boom. Against the 15 mph rule, what is your call and why is there no discretion here?",
        passKeywords: ["stop", "hard stop", "over 15", "17", "above threshold", "no discretion", "hold"],
        failKeywords: ["careful", "proceed", "judgment", "close enough"],
        concept:
          "17 mph is over the 15 mph hard-stop threshold, so it's a HARD STOP — no discretion. The threshold exists precisely so fatigue and pressure can't talk you into 'just being careful' above it.",
      },
      {
        id: "cap-s9",
        technique: "Stacked-Hazard Priority (Capstone)",
        prompt:
          "Fatigue, wind, active riggers, low light, and a screaming Tour Manager all hit at once. What single principle governs how you resolve all of them?",
        passKeywords: ["stop-work", "stop work", "safety first", "one hazard at a time", "stop", "resolve before proceed", "authority"],
        failKeywords: ["push through", "prioritize speed", "truck time", "hero"],
        concept:
          "Stop-Work Authority governs all of it: when hazards stack, you stop, resolve each before proceeding, and never trade safety for the truck time. Every individual rule ladders up to this one authority.",
      },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function moduleThreshold(m: Module): number {
  return m.passThreshold ?? DEFAULT_PASS_THRESHOLD;
}

export const TOTAL_SCENARIOS = MODULES.reduce((sum, m) => sum + m.scenarios.length, 0);

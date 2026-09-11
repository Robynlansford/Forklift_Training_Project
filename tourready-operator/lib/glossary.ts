/**
 * Knowledge Base — every named technique and rule in the curriculum.
 * Powers the searchable Resources page, the quick-reference card, and glossary.
 * Add an entry here when you introduce a new named technique in a module.
 */

export interface TechniqueCard {
  name: string;
  /** Short category for filtering. */
  category:
    | "Certification"
    | "Logistics"
    | "Alignment"
    | "Ground Crew"
    | "Physics"
    | "Night Ops"
    | "Rigging"
    | "Human Factors"
    | "Commands";
  /** The module slug this technique belongs to (for cross-linking). */
  moduleSlug: string;
  /** One-line definition. */
  summary: string;
  /** The actionable rule / drill. */
  rule: string;
}

export const TECHNIQUES: TechniqueCard[] = [
  {
    name: "OSHA Three-Part Mandate",
    category: "Certification",
    moduleSlug: "legal-baselines",
    summary: "A valid forklift certification has three required pillars.",
    rule: "Formal instruction + practical hands-on training + an employer evaluation in the actual workplace. All three, every time.",
  },
  {
    name: "PIT Classification Trap",
    category: "Certification",
    moduleSlug: "legal-baselines",
    summary: "Certification is per machine class, never universal.",
    rule: "A Class 1/4/5 warehouse card does not authorize a Class 7 telehandler. Each class needs its own cert + evaluation.",
  },
  {
    name: "MEWP A92 Certification",
    category: "Certification",
    moduleSlug: "legal-baselines",
    summary: "Aerial lifts need their own credential.",
    rule: "Boom (Type 3 Group B) and scissor (Type 3 Group A) lifts require MEWP certification under ANSI A92 — a forklift card doesn't cover them.",
  },
  {
    name: "Letter of Intent (LOI) Protocol",
    category: "Certification",
    moduleSlug: "touring-credentials",
    summary: "Get authorized at each venue before you touch the keys.",
    rule: "Present credentials to the venue Safety Director / IATSE head and get signed off on the machine class — credentials first, keys second.",
  },
  {
    name: "Daily-Check Culture",
    category: "Certification",
    moduleSlug: "touring-credentials",
    summary: "Shared rental fleets get abused by every department.",
    rule: "Full pre-op at the start of every shift, every venue. Look for bent forks, cut hoses, low tires. Tag out anything compromised.",
  },
  {
    name: "Standardized Hand Signals",
    category: "Commands",
    moduleSlug: "spotter-signals",
    summary: "Visual language for a floor too loud to hear on.",
    rule: "Raise, lower, stop, emergency-stop, distance-to-go, hold. Slow and deliberate — if it isn't a standard sign, you stop.",
  },
  {
    name: "One-Spotter Rule",
    category: "Commands",
    moduleSlug: "spotter-signals",
    summary: "One designated set of eyes runs the move.",
    rule: "Obey only your one spotter; lose sight of them and STOP. Exception: an emergency stop is obeyed instantly from anyone.",
  },
  {
    name: "10-Foot Zone of Safety",
    category: "Ground Crew",
    moduleSlug: "spotter-signals",
    summary: "A hard buffer around the moving machine.",
    rule: "Any pedestrian within 10 feet and the wheels stop until they clear. You track them; they won't track you.",
  },
  {
    name: "Dock-Plate Discipline",
    category: "Logistics",
    moduleSlug: "indoor-arena-ops",
    summary: "The dock is the highest-stress choke point.",
    rule: "Confirm the plate is rated for machine + load AND the truck's wheels are chocked before crossing. Either failing is a fatal drop.",
  },
  {
    name: "Floor Load Limit Check",
    category: "Physics",
    moduleSlug: "indoor-arena-ops",
    summary: "Arena floors sit over ice, pools, and aging stages.",
    rule: "Get the floor's rated limit (lbs/sq ft) before driving heavy over questionable surfaces. 'Probably fine' is not a rating.",
  },
  {
    name: "Carbon-Monoxide Management",
    category: "Physics",
    moduleSlug: "indoor-arena-ops",
    summary: "Combustion lifts poison enclosed air.",
    rule: "Favor electric indoors; if running propane/diesel, confirm ventilation. Headaches/dizziness = stop and clear the air.",
  },
  {
    name: "Load Capacity Chart",
    category: "Physics",
    moduleSlug: "outdoor-festival-ops",
    summary: "Telehandler capacity is a chart, not one number.",
    rule: "Capacity falls sharply as the boom extends out and up. Read the chart for the boom's actual position before the pick.",
  },
  {
    name: "Stabilizer & Frame Leveling",
    category: "Physics",
    moduleSlug: "outdoor-festival-ops",
    summary: "Outriggers and a level base before any high pick.",
    rule: "Deploy all stabilizers on firm footing (cribbing/pads on soft ground), level the frame, then extend. No pads, no pick.",
  },
  {
    name: "Invisible Mud Tip-Over",
    category: "Physics",
    moduleSlug: "outdoor-festival-ops",
    summary: "Plywood and crust hide tire-swallowing soft spots.",
    rule: "Read the terrain actively. If a tire sinks or the machine lists, stop before the point of no return — never power through.",
  },
  {
    name: "Grade Rule (Loaded vs Empty)",
    category: "Physics",
    moduleSlug: "outdoor-festival-ops",
    summary: "The heavy end goes uphill — and which end that is changes when you set the load down.",
    rule: "LOADED on a grade: the load points uphill, ascending and descending, so it cannot slide off the forks. EMPTY: the forks point downhill, because the counterweight is now the heavy end and belongs on the high side. Cal/OSHA GISO 3650(t)(14)(A) states the loaded case for grades over 10 percent. 'Forks uphill always' is the common misquote.",
  },
  {
    name: "Hot Dog vs. Hamburger",
    category: "Logistics",
    moduleSlug: "staging-line-loadout",
    summary: "One-word shorthand for how a case sits on the tines.",
    rule: "Hot Dog = lengthwise (narrow clearances, shifts load center forward). Hamburger = wide/short-side to mast (stable for heavy cases).",
  },
  {
    name: "Stationary Hand-Off",
    category: "Ground Crew",
    moduleSlug: "staging-line-loadout",
    summary: "The danger-zone case hand-off at the truck tail.",
    rule: "Full stop · parking brake · lower · forks level · hands OFF the controls. Pushers pull cases away from the mast, never toward it.",
  },
  {
    name: "Tine Buffer Zone & Stop Trigger",
    category: "Ground Crew",
    moduleSlug: "staging-line-loadout",
    summary: "The three golden rules of dock-hand-off safety.",
    rule: "Pushers never touch a case while you're scooping/lifting · no hands on hydraulics during the hand-off · anyone in the radius before you're parked = immediate stop.",
  },
  {
    name: "Staging-Line Chain of Custody",
    category: "Logistics",
    moduleSlug: "staging-line-loadout",
    summary: "The forklift is a fixed hoisting station, not a runner.",
    rule: "Pre-staged lines → Caller → Pushers → stationary forklift → 4 loaders. One line = one truck. The crew brings work to the machine.",
  },
  {
    name: "Loader Hand Signals",
    category: "Commands",
    moduleSlug: "staging-line-loadout",
    summary: "Read the loaders' hands over the wall of dock noise.",
    rule: "Both hands up = hold. Two hands patting the head = set the load down here. A wave back = clear to back up.",
  },
  {
    name: "Left-Side Approach",
    category: "Logistics",
    moduleSlug: "basic-controls",
    summary: "Always mount and approach the machine from the left.",
    rule: "Left side every time — the standard egress/entry point on production machines.",
  },
  {
    name: "Low-Travel Rule",
    category: "Logistics",
    moduleSlug: "basic-controls",
    summary: "Carry loads low and tilted back.",
    rule: "Travel with forks 4–8 inches off the ground, tilted slightly back. Never travel high.",
  },
  {
    name: "Caster-Spin Alignment",
    category: "Logistics",
    moduleSlug: "truck-pack-logistics",
    summary: "Recover swivel casters that turn sideways and steal pack width.",
    rule: "Push · back off exactly one inch so casters trail straight · re-approach. Never force it.",
  },
  {
    name: "Side-Shift Friction Break",
    category: "Logistics",
    moduleSlug: "truck-pack-logistics",
    summary: "Free a wedged case without dragging its neighbor.",
    rule: "Side-shift left/right to break lateral friction first, then extract. Never pull blind.",
  },
  {
    name: "Flush-Fork Rule",
    category: "Logistics",
    moduleSlug: "truck-pack-logistics",
    summary: "Keep over-long fork tips visible instead of protruding behind the load.",
    rule: "Keep the extra fork length on your side, in your eyeline — never spear blind behind the cart.",
  },
  {
    name: "Suspension Droop Compensation",
    category: "Logistics",
    moduleSlug: "truck-pack-logistics",
    summary: "The trailer bed drops as the machine drives in.",
    rule: "Adjust fork height dynamically on entry to avoid bottoming out or jamming the floor.",
  },
  {
    name: "Vertical Rib Symmetry",
    category: "Alignment",
    moduleSlug: "fork-slot-anatomy",
    summary: "Find hidden floor slots in the dark by reading the top of the cart.",
    rule: "Align your mast with the top structural centerline — the floor slots sit directly below it.",
  },
  {
    name: "Level-Fork Shadow Trick",
    category: "Alignment",
    moduleSlug: "fork-slot-anatomy",
    summary: "Confirm forks are level before entering a slot.",
    rule: "Headlights on; both fork shadows must be equal width and parallel. Uneven = tilted = will bind.",
  },
  {
    name: "Top-Heavy One-Sided Refusal",
    category: "Alignment",
    moduleSlug: "fork-slot-anatomy",
    summary: "A single-fork lift on a top-heavy cart is a hard refusal.",
    rule: "If only one pocket is accessible on a top-heavy load — STOP, get a supervisor, re-position.",
  },
  {
    name: "Clear-and-Release Pause",
    category: "Ground Crew",
    moduleSlug: "ground-crew-choreography",
    summary: "Full stop before any hands touch the load.",
    rule: "Complete stop · neutral · forks down · load settled · hands clear · then 'All yours.'",
  },
  {
    name: "3-Foot Rear-Swing Halo",
    category: "Ground Crew",
    moduleSlug: "ground-crew-choreography",
    summary: "The rear swings out 3–4 ft opposite your turn.",
    rule: "Tap horn + eye contact + confirm the 3-ft zone clear before steering. Step-in = immediate stop.",
  },
  {
    name: "Pusher's Blindness Yield Rule",
    category: "Ground Crew",
    moduleSlug: "ground-crew-choreography",
    summary: "Blind push crews always have right-of-way.",
    rule: "The forklift always yields to active pushing crews. You see them; they can't see you.",
  },
  {
    name: "Two-Tone Horn Protocol",
    category: "Commands",
    moduleSlug: "ground-crew-choreography",
    summary: "Precise horn use prevents 'horn blindness'.",
    rule: "Short tap = courtesy / direction change. Long blast = life-safety emergency only. Never constant.",
  },
  {
    name: "Sail Effect Wind-Load Derating",
    category: "Physics",
    moduleSlug: "heavy-physics",
    summary: "Flat surfaces turn wind into tip-over force.",
    rule: "≥15 mph = no high lift. Below that, derate capacity 20–30% and deploy all outriggers.",
  },
  {
    name: "Wide Pick-Point Configuration",
    category: "Physics",
    moduleSlug: "heavy-physics",
    summary: "Prevent long truss from bowing and sliding off.",
    rule: "Forks to max width at the outer thirds. Never center-lift a long truss bundle.",
  },
  {
    name: "45-Degree Cable Bridge Crossing",
    category: "Physics",
    moduleSlug: "heavy-physics",
    summary: "Cross cable ramps one tire at a time.",
    rule: "Approach at 45°, crawl, one tire over at a time. Never straight-on at speed.",
  },
  {
    name: "Stage Deck Point-Loading",
    category: "Physics",
    moduleSlug: "heavy-physics",
    summary: "Tire patches concentrate weight on temporary decks.",
    rule: "Confirm the deck's load rating first; keep moving to spread load; no hard stops or sharp turns.",
  },
  {
    name: "Flash Blindness Protocol",
    category: "Night Ops",
    moduleSlug: "night-chaos",
    summary: "A strobe wipes night vision for seconds.",
    rule: "Velocity to zero instantly. Don't lean out, don't trust muscle memory. Hold until vision returns.",
  },
  {
    name: "Rolling-Turn (Anti-Scrub)",
    category: "Night Ops",
    moduleSlug: "night-chaos",
    summary: "Stationary pivots gouge sensitive floors.",
    rule: "Keep rolling through every turn — arc like a U-turn or back-and-fill. Never spin in place.",
  },
  {
    name: "Ice Rink Insulation Trap",
    category: "Night Ops",
    moduleSlug: "night-chaos",
    summary: "Heavy stationary loads compress decking over ice.",
    rule: "Don't park heavy over arena ice decking. Keep moving or hold the load elevated at a solid edge.",
  },
  {
    name: "Up-Look Protocol",
    category: "Rigging",
    moduleSlug: "rigging-coordination",
    summary: "Scan the airspace before entering any rigging zone.",
    rule: "Stop at the edge · look up · confirm drop zone clear · radio the lead · then enter. Every time.",
  },
  {
    name: "Dual-Hazard Lockout",
    category: "Rigging",
    moduleSlug: "rigging-coordination",
    summary: "Manage ground and overhead hazards together.",
    rule: "Call STOP · clear the halo · Up-Look · proceed only when BOTH ground and sky are confirmed.",
  },
  {
    name: "Sling-Load Pendulum Dynamics",
    category: "Rigging",
    moduleSlug: "rigging-coordination",
    summary: "Suspended loads swing and shift the center of gravity.",
    rule: "Slow all movement 50%+. No sudden starts/stops/turns. Use a rigger and a tag line.",
  },
  {
    name: "Stop-Work Authority",
    category: "Human Factors",
    moduleSlug: "fatigue-pressure",
    summary: "Anyone can — and must — halt unsafe work.",
    rule: "Say STOP · freeze the machine · state the objective reason · don't proceed until resolved.",
  },
  {
    name: "Production-Pressure Language",
    category: "Human Factors",
    moduleSlug: "fatigue-pressure",
    summary: "Cold, factual phrases that disarm pressure.",
    rule: "'The load is compromised.' · 'The rigging zone is not clear.' · 'I'm past safe limits — I need relief.'",
  },
  {
    name: "Hero Operator Trap",
    category: "Human Factors",
    moduleSlug: "fatigue-pressure",
    summary: "Pushing through fatigue to 'save the show' backfires.",
    rule: "14+ hours = degraded reactions and tunnel vision. Calling STOP when it counts IS saving the show.",
  },
  {
    name: "Unified 'STOP' Command",
    category: "Commands",
    moduleSlug: "rigging-coordination",
    summary: "One non-negotiable word halts all motion.",
    rule: "'STOP' is the standard lexicon, echoed by ground crew. No echo = no proceed.",
  },
];

export const QUICK_REFERENCE = {
  daily: [
    "Always present credentials and get authorized at every new venue",
    "Always run the pre-op check on shared/rental fleets before lifting",
    "Always approach from the LEFT",
    "Always buckle the seat belt",
    "Always travel with forks LOW (4–8 inches)",
    "Always take signals from ONE spotter — lose sight of them and STOP",
    "Always stop the wheels for any pedestrian within 10 feet",
    "Always perform the Up-Look before entering rigging zones",
    "Always use the Clear-and-Release Pause before hands touch the load",
    "Always yield to pushing crews (Pusher's Blindness Rule)",
    "Always cross cable ramps at 45 degrees — but take loading ramps and dock transitions STRAIGHT-ON",
    "Always read the load chart for the boom's actual position (telehandler)",
    "Always put the HEAVY end uphill — loaded, that's the load; empty, that's the counterweight",
    "Always stay in the seat if it tips — grip, brace, lean away, never jump",
    "Always call STOP the instant something feels wrong",
  ],
  commands: [
    { cue: '"STOP"', meaning: "Universal command — all motion halts instantly. Must be echoed." },
    { cue: "Emergency stop (both arms crossing)", meaning: "Obeyed instantly from anyone — not just your spotter." },
    { cue: "Short tap (horn)", meaning: "Courtesy notice — changing direction / moving nearby." },
    { cue: "Long blast (horn)", meaning: "Life-safety emergency only — everyone stops and clears." },
  ],
  wind: "Wind at or above 15 mph = NO HIGH LIFTS. Especially with flat surfaces (LED walls, fabric sails).",
  fatigue: "14+ hours = request relief before any complex lift. Microsleep = immediate operational stop, no exceptions.",
  stopWork: [
    "The load is compromised. It cannot travel.",
    "The rigging zone is not clear.",
    "I am past safe operating limits. I need relief.",
  ],
};

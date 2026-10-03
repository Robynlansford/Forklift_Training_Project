# Living Pages — TourReady Operator

Branch: `living-pages` (from `main` @ e354cc5). Real build: every number traced to site text.

## Site Dossier (verified by reading the source, 2026-09-28)

1. **What it sells** (README + home copy): "Concert and festival telehandler / forklift
   training for live-event production businesses" — "a training supplement. It does not
   replace OSHA certification or supervised hands-on evaluation."
2. **Customer's problem**: warehouse courses skip the show-site hazards — "LED walls and
   fabric sails turn a 15 mph breeze into tip-over force", "A 2 lb shackle falling 60 ft",
   "14 hours in, strobes firing", "The truck leaves in 20 minutes and the TM is screaming".
3. **Transformation**: "Be the operator who calls STOP when it counts" — Stop-Work
   Authority becomes a reflex; a Tour-Ready Operator credential after every module passes.
4. **World / visual nouns**: road cases with fork pockets and vertical ribs, 53-ft trailer,
   aluminum loading ramp in rain, counterbalance forklift, telehandler boom, lighting truss,
   followspots, haze, strobes, LED wall, line arrays, riggers 40–80 ft up, shackles,
   cable ramps (45°), dock plate, hi-vis crew, hand signals, the 2:00 AM LED clock,
   the STOP octagon, hazard tape.
5. **Place**: not tied to a city (touring product). No geography used.
6. **The numbers** (source → exact text):
   | Figure | Source |
   |---|---|
   | 15 modules, 143 scenarios, 47 techniques | `lib/curriculum.ts` MODULES / TOTAL_SCENARIOS, `lib/glossary.ts` TECHNIQUES (computed on the page already) |
   | 80% pass mark | `curriculum.ts` DEFAULT_PASS_THRESHOLD = 0.8, shown "80% to pass" on module pages |
   | 15 mph wind hard stop | heavy-physics "If wind is at or above 15 mph — STOP"; engine WIND_THRESHOLD_MPH |
   | derate 20–30% below 15 mph | heavy-physics step 3 |
   | 3-ft halo, tail swings 3–4 ft | ground-crew-choreography |
   | 10-ft zone = wheels stop | spotter-signals |
   | 2 lb shackle, 60 ft, 42 mph, 120 ft·lb | rigging-coordination; engine calcFallingObject(2, 60) as printed by the simulator |
   | riggers 40–80 ft | rigging-coordination whyItMatters |
   | 48-in forks, 36-in cart | truck-pack-logistics Flush-Fork Rule |
   | 14+ hours = request relief | glossary QUICK_REFERENCE.fatigue; fatigue-pressure |
   | 02:00, 14 h, 10,000 lb, 17 mph, 60 ft, 45 min | capstone "The Situation" |
   | capacity = 10,000 × ground × 4/(4+reach) × boom | `lib/safety-engine.ts` (teaching model, labelled as such on the page) |
   | 23:10 · 23:40 · 00:25 · 01:05 · 02:00 | film beat eyebrows in `components/scroll-intro.tsx` |
7. **Process**: How it works 01 Theory → 02 Deliberate Practice → 03 AI Feedback → 04
   Certification; every module's numbered `steps`.
8. **Brand** (`app/globals.css @theme`): bg #0b1120, deep #050810, surface #111827,
   accent Safety Orange #f97316, amber #fbbf24, coolbeam #7db0ff, go #22c55e,
   hardstop #ef4444; cream canvas #f5ede0 for home marketing + footer. Barlow Condensed
   (display, uppercase) + Inter. Photography: night load-out, sodium amber, navy.
9. **Page inventory**
   | Page | Job | Interactive parts that must survive |
   |---|---|---|
   | `/` | sell | film skip, CTAs, hazard tilt cards |
   | `/dashboard` | convert/use | Save Record, Folder, Export, Import, Reset, operator name, module links |
   | `/modules/[slug]` ×15 | explain/train | ScenarioTrainer (free-text grading), prev/next, AI tutor |
   | `/simulator` | explain | presets, inputs, toggles, live verdict |
   | `/resources` | reference | search, category filter, Print Rule Card |
   | `/certificate` | convert | name input, PNG/print credential |
   | 404 | utility | link home |
10. **Baseline** (`living-pages/verify/baseline-*.json`, prod build, cold cache):
    home 10.26 MB / 59 requests, scroll locked until 8.57 s and LCP 8.55 s on 10 Mbps 4G;
    other pages 0.66–1.34 MB, FCP 0.26–0.32 s, LCP ≤ 0.74 s.

## Visual thesis

**Training is learning to see what the floor hides. Every page is an hour of the same
load-out, drawn in light by a trained operator's eye.**

## Light system (three glow roles, kept everywhere)

| Role | Token | Means |
|---|---|---|
| Beacon orange | `--color-accent` #f97316 | the machine: forks, boom, load path, capacity |
| Followspot blue | `--color-coolbeam` #7db0ff | people and the air they share: crew, spotter, riggers, wind, safety zones |
| Show-clock amber | `--color-amber` #fbbf24 | the moment of decision: the clock, a check confirmed, a step lit |

Red (`--color-hardstop`) stays signage only: the STOP octagon and HARD STOP/BLOCKER verdicts
the app already colours red. Green stays the app's existing "passed" semantic.

## Scene Map

| Page | Hero | Scene | Figures below |
|---|---|---|---|
| `/` | **Scroll film (signature)** | *The Load-Out* — one machine, one night, 23:10→02:00: wet ramp line, forks to pockets with rib guides, 3-ft tail-swing halo among crew, crane up 60 ft to the grid as a shackle falls (42 mph · 120 ft·lb), then 02:00 — all motion halts at STOP. Film copy kept verbatim as SSR beats. | scroll-lit route (How it works 01→04); glass STOP octagon (CTA) |
| `/dashboard` | Live hero | *The Run Sheet* — 15 stations down a floor lane, lit by the visitor's real saved progress | card light |
| `/modules/*` | Match-cut | *Plate* — the module's own icon drawn in light over its photo, dispersing into haze | scroll-lit steps rail (all modules); module figures: heavy-physics wind dial, ground-crew halo, spotter 10-ft zone, rigging drop, outdoor capacity curve, fatigue 14-h line, capstone instrument panel, truck-pack flush-fork |
| `/simulator` | Data hero | *The Machine* — telehandler schematic posed live from the form inputs; wind, ground, crew, drop zone, verdict light | live capacity-vs-reach curve from the engine |
| `/resources` | Live hero | *Constellation* — 47 techniques in 9 real category clusters, linked to search + filter | — |
| `/certificate` | Quiet hero | *Work light* — one cone of light at 02:00 | per-module score bars vs the 80% pass mark (visitor's own scores) |
| 404 | Quiet hero | *Beacon* — a turning amber beacon | — |
| `/film` (added) | — | the original footage film, preserved (was the home opener) | — |

**Honesty notes**: the film, runsheet, constellation, machine and zone/halo figures are
labelled "schematic · not to scale" / "illustration". The capacity curve carries the
site's own "Teaching model, not a load chart". No outside data is used, so no credits
are required. No placeholders (real build).

## Defaults taken without asking (autonomous run)

1. Replace the 9 MB gated footage film on `/` with the code-drawn signature film (first
   paint is sacred); keep the footage intact at `/film` and link it from the film's end.
2. Keep the brand's two-tone home (dark hero, cream marketing sections) — no forced dark.
3. Tone map: hue-preserving neutral curve instead of ACES (measured in a previous build:
   ACES bleaches safety orange toward white).

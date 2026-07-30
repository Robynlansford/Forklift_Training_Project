# TourReady Operator

**The AI-powered certification platform for Concert &amp; Festival Telehandler and Forklift operators.**

Master the 2:00 AM load-out and build unbreakable Stop-Work Authority. TourReady Operator turns a field-tested live-event lift curriculum into a deliberate-practice training system: faithful theory, free-text interactive scenarios with instructor-grade feedback, a live safety-derating engine, an AI tutor, and a verifiable certificate.

Built for the floor you actually work — wind and the Sail Effect, active rigging zones, festival mud, fatigue, and production pressure. Not a generic warehouse forklift course.

---

## Quick start

```bash
cd tourready-operator
npm install
npm run dev
```

Open **http://localhost:3000**.

The platform is **fully functional with no configuration** — scenario grading and the safety simulator run offline. An Anthropic API key is optional and only unlocks the nuanced AI feedback layer and the conversational tutor (see below).

### Requirements
- Node.js **18.18+** (Node 20 LTS recommended)
- npm 9+

### Production build
```bash
npm run build
npm run start
```

---

## Optional: enable full AI feedback

The trainer grades every scenario instantly with a **deterministic, offline keyword + named-technique engine**. When an Anthropic API key is present, a second pass adds nuanced, instructor-style feedback, and the **AI Safety Tutor** becomes live.

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Add your key (from <https://console.anthropic.com/>):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   # ANTHROPIC_MODEL=claude-sonnet-4-6   # optional override
   ```
3. Restart `npm run dev`.

The key is **server-side only** — it is read in Next.js route handlers (`app/api/grade`, `app/api/tutor`) and never shipped to the browser. With no key, those routes return `503` and the UI gracefully keeps the offline experience.

---

## What's inside

| Area | Route | Notes |
|------|-------|-------|
| Landing | `/` | Hero, hazard overview, how-it-works, CTA |
| Training Hub | `/dashboard` | Progress rings, certification status, module grid, export/import |
| Module + Trainer | `/modules/[slug]` | Full theory + the interactive scenario trainer |
| Safety Engine | `/simulator` | Standalone live derating simulator with tour presets |
| Knowledge Base | `/resources` | Searchable technique glossary + printable Rule Card |
| Certification | `/certificate` | Digital certificate (PNG / print), progress history, weak-area review |
| AI Tutor | floating | Context-aware chat on every page |

**Tech stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand (localStorage persistence) · lucide-react · Anthropic SDK.

### Offline-first by design
Progress persists in `localStorage` and can be exported/imported as JSON from the dashboard. Scenario grading and the safety engine require no network, so the trainer stays reliable on a venue laptop.

---

## The Safety Engine (single source of truth)

`lib/safety-engine.ts` is a faithful TypeScript port of the canonical `TelehandlerSafetyEngine`. It is the **single source of truth** for every safety evaluation in the app and powers the `/simulator` page.

It evaluates conditions in strict priority phases and returns the first failing state:

1. **BLOCKER** — rigging zone not clear · invalid (non-`STOP`) command · `STOP` not echoed
2. **HARD_STOP** — wind > 15 mph · load exceeds derated capacity
3. **CAUTION** — pushers inside the 3-ft halo zone · crew on the load
4. **GO** — all checks pass

It includes the concert-specific `GROUND_DERATE` map (`FESTIVAL_MUD`, `STAGE_DECK`, `DYNAMIC_TRUSS`, `LED_WALL`, …), the late-night + long-shift **fatigue modifier**, **reach derating**, and the **falling-object impact** calculation.

### Use the Safety Engine standalone
The simulator UI lives at **`/simulator`**. To call the engine directly in code or a script:

```ts
import { evaluateSafety } from "@/lib/safety-engine";

const result = evaluateSafety({
  loadWeightLbs: 10000,
  groundType: "LED_WALL",
  windSpeedMph: 17,
  timeOfDayHrs: 2,
  shiftDurationHrs: 14,
  reachFt: 14,
});

console.log(result.status);    // "HARD_STOP"
console.log(result.reasoning); // human-readable explanation
```

The module is pure and dependency-free, so it can be reused in tests, scripts, or other apps.

---

## ✨ Adding a new module or lesson (almost zero code)

The entire curriculum lives in **one file**: [`lib/curriculum.ts`](lib/curriculum.ts). The dashboard, module pages, the interactive trainer, routing, and certification are all generated from the `MODULES` array. **Adding a module requires no component or routing changes.**

### Steps

1. Open `lib/curriculum.ts`.
2. Append a new object to the `MODULES` array:

```ts
{
  id: 9,
  slug: "outrigger-deployment",          // becomes /modules/outrigger-deployment
  order: 9,
  icon: "Anchor",                         // any name mapped in components/icon.tsx
  title: "Outrigger Deployment & Stabilizer Math",
  subtitle: "Footprint, ground bearing, and the no-cribbing rule",
  summary: "When and how to deploy stabilizers before a high pick.",
  whyItMatters: "An un-deployed outrigger on soft ground is a tip-over waiting to happen…",
  readMinutes: 6,
  sections: [
    {
      heading: "Bearing Pressure Basics",
      lede: "The stabilizer pad spreads load — but only if the ground can take it.",
      body: ["Plain-prose paragraph…", "Another paragraph…"],
      steps: ["Step one", "Step two"],     // optional numbered procedure
      callout: {                            // optional emphasis box
        kind: "hard-rule",                  // "tour-reality" | "core-drill" | "hard-rule"
        title: "No pad, no pick",
        body: "Never extend the boom without confirmed bearing under every stabilizer.",
      },
    },
  ],
  scenarios: [
    {
      id: "m9-s1",                          // must be unique
      technique: "Bearing-Pressure Check",  // always surfaced to the learner
      prompt: "You're on festival mud and need a 30 ft pick. What do you confirm first?",
      passKeywords: ["cribbing", "pad", "bearing", "spread", "outrigger"],
      failKeywords: ["just lift", "skip", "no time"],
      concept: "Confirm bearing under every stabilizer pad — add cribbing on soft ground before any high pick.",
    },
  ],
  passThreshold: 0.6,                       // optional, defaults to 0.6 (60%)
}
```

3. (Optional, recommended) Add each new named technique to [`lib/glossary.ts`](lib/glossary.ts) so it appears in the searchable Knowledge Base and Rule Card.
4. (Optional) If you used a new `icon` string, add it to the map in [`components/icon.tsx`](components/icon.tsx) (import the Lucide icon and register it).

That's it — the module shows up on the dashboard, gets its own page and trainer, and counts toward certification automatically.

### Schema reference
All types are exported and documented in `lib/curriculum.ts`:
- `Module` — top-level lesson (theory `sections` + interactive `scenarios`)
- `ContentSection` — a theory block (`heading`, `lede?`, `body?`, `steps?`, `callout?`)
- `Callout` — emphasis box (`kind`: `tour-reality` | `core-drill` | `hard-rule`)
- `Scenario` — one graded interaction (`prompt`, `passKeywords`, `failKeywords`, `technique`, `concept`)

### How grading uses your data
1. **Offline pass (instant, always runs):** a clear `failKeyword` fails the answer; otherwise at least one `passKeyword` must appear. Feedback always names the `technique` and quotes the `concept`.
2. **AI pass (only with an API key):** the scenario `prompt`, `technique`, `concept`, and keyword lists are sent to the model for nuanced instructor feedback. On any failure or missing key, the UI keeps the offline verdict.

Because the trainer is fully generic, most future lessons need **only data** — no new components.

---

## Project structure

```
tourready-operator/
├─ app/
│  ├─ layout.tsx              # shell: header, footer, tutor, toaster
│  ├─ page.tsx                # landing
│  ├─ dashboard/page.tsx      # training hub
│  ├─ modules/[slug]/page.tsx # module detail + trainer (data-driven)
│  ├─ simulator/page.tsx      # standalone safety engine
│  ├─ resources/page.tsx      # knowledge base + rule card
│  ├─ certificate/page.tsx    # certification + progress
│  └─ api/
│     ├─ grade/route.ts       # AI nuance grading (optional)
│     └─ tutor/route.ts       # AI tutor (optional)
├─ components/                # UI primitives + feature components
├─ lib/
│  ├─ curriculum.ts           # ★ single source of truth (all content)
│  ├─ safety-engine.ts        # ★ ported TelehandlerSafetyEngine
│  ├─ glossary.ts             # named-technique knowledge base
│  ├─ grading.ts              # deterministic offline grader
│  └─ store.ts                # zustand + localStorage persistence
└─ ...
```

---

## Accessibility
Targets WCAG AA: full keyboard navigation, visible focus rings, ARIA roles/labels on interactive controls, a skip-to-content link, `aria-live` regions for the trainer and tutor, and high-contrast text tokens. Usable on a venue laptop or tablet.

---

## Disclaimer
TourReady Operator is a **training supplement**. It does **not** replace official OSHA certification or supervised hands-on training. Always complete required certifications before operating any lift equipment.

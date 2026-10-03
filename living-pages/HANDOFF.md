# Living Pages — hand-off (Tour Ready Operator)

Date: 2026-09-29 · Branch: `living-pages` (from `main` @ e354cc5) · **Nothing committed or pushed.**

## ⚠ STATUS 2026-10-03 — PAUSED, owner corrections pending

**The film's story is factually wrong (owner, 2026-09-29):**
- The forklift **never goes inside the trucks.**
- Ramps are for crew rolling/carrying cases down **by hand.**
- The forklift is used only when the ramp is removed: on a **load-in** it pulls up to the truck with the **forks already lifted.**
- Affected: `public/living/scenes/loadout.js` beats 1–2 (forklift drives up the ramp into the truck), both posters (`public/living/posters/`), and possibly the site's own beat-1 copy "Wet Ramp Slick" (`lib/load-out.ts`) — flag the copy, don't rewrite it.
- Owner has more process detail to give. **Get it before changing the film.**

**Undecided:** keep the original scroll hero (footage, still live at `/film` via `components/scroll-intro.tsx`) on the home page instead of the WebGL film. The rest of the layer (hub, simulator, KB, modules, certificate, 404, figures) doesn't depend on that choice.

## Preview (DEPLOY input: preview only)

- Preview version `8e8e7da9-cda4-415b-a7d4-b25496ca03d0`
- URL: https://8e8e7da9-tourready-operator.robynlansford.workers.dev (reachable without login — verified with curl)
- Production **unchanged**: still version `e0434863` at 100% (checked with `wrangler deployments status` after upload)
- Built from the uncommitted working tree with `opennextjs-cloudflare build` + `wrangler versions upload`
- To promote later (owner's call): `npx wrangler versions deploy 8e8e7da9-cda4-415b-a7d4-b25496ca03d0`

## Iteration pass 1 — findings → fixes

1. Black blob at the STOP octagon (NaN at the beam apex through bloom) → beam mesh encoding changed, spread clamped.
2. Last road case + STOP sign never drew (inherited reveal order) → new reveal formula, per-group order reset.
3. Film camera missed the ramp line, fork pockets, the fall and the last case → camera spline retuned (17 keys).
4. Phone: stage started 64 px below the fold; beats sat under the chat launcher → negative header margin; beats lifted to 5.25rem.
5. Knowledge Base scene fell back (kit not loaded) → `needs="kit.js"`.
6. Simulator page crashed (`this.data` shadowed the scene's `data()`) → hook renamed `onData`; engine now swallows its own errors.
7. Simulator machine cropped; labels off-frame → fit-to-frame camera, labels clamped, phone lens shift.
8. Glass STOP over-bloomed → bloom/body/letter levels lowered.
9. Capacity labels collided; forks figure overflowed → layouts fixed.
10. Hydration error under reduced motion (pre-existing TiltCard/StaggerLine) → `useHydrated` gate.
11. Phone contrast 1.84:1 on the 02:00 eyebrow → stronger phone scrim (now passes).
12. Simulator overflowed at 320 px (aspect-ratio min-height → min-width) → `min-height: 0` on phones.
13. Honesty audit: "42" is derived (verified against the engine formula and the simulator's own output); one caption paraphrased → now an exact quote.

## Iteration pass 2 — findings → fixes

1. Module plate showed nothing in frozen-clock captures → plate timeline reads the frozen clock.
2. `/favicon.ico` 404 on every fresh visit → `app/icon.svg` drawn from the existing logo glyph. All 21 routes now log 0 errors.
3. Certified state (all 15 modules passed) had never been checked → fixture built with the real scenario counts (sum 143); run sheet, certificate and score bars verified at desktop + phone.
4. Hallmark slop test found 22 contrast failures: scene labels over glow lines (run-sheet numbers, simulator labels, constellation labels) → near-opaque label/tag chips (`--lp-chip`, 92%).
5. My contrast checker was flattering (skipped chip-backed labels, ignored fade opacity, counted borders as background) → fixed; it then exposed faded labels (run sheet 0.45, constellation 0.25–0.65) → rule: a label is legible or absent.
6. The site's tutor launcher covered the film's "Schematic · not to scale" tag at desktop (clipped to "…NOT TO SC") and the scroll hint at 320 px → tag lifted above the launcher; phone hint is one compact line in the title column. No collisions at 6 viewports × 7 film positions.
7. Gate 55: all-caps film type at line-height 0.98 → 1.02.
8. Gate 13: module cards already had 4 hover effects (lift, border, image zoom, arrow); my rim light made 5 → removed from that card (file restored to `main`).
9. Gate 49 detector counted icons as text lines (false wraps) → detector fixed; every CTA is one line from 320 px up.
10. `/api/grade` returns 503 locally by design (no API key; client keeps its offline grade) → test treats that one response as expected. On the preview, `/api/grade` returned 502 once in 2 runs (its "AI grading failed" path) — pre-existing, cause not investigated.

## Critique (pass 2, per page)

- **Home film** — Does it earn its runway? Desktop yes (one machine, one shift, five real hazards). Phone runway is 470vh ≈ 4–5 screens before the hero; "Skip film" stays visible top-right. Owner call whether phones get a shorter cut.
- **Training Hub** — Does the run sheet add anything the card list doesn't? Yes: progress as a route with the forklift parked at the next station, readable at a glance; status reads from colour, labels always legible.
- **Simulator** — Does the machine tell the truth about the inputs? Boom angle, reach, wind and ground drive it live; labelled "Schematic · not to scale".
- **Knowledge Base** — Weakest link to real use: the constellation mirrors filter/search but adds atmosphere more than information.
- **Module pages** — The plate glyph is atmosphere, not information; kept to ~4 s, then it disperses and leaves the photo clean.
- **Certificate / 404** — Quiet worklight and beacon; the score bars are the useful part (real saved scores vs the 80% pass mark).

## Verified (how)

1. All 21 routes, production build + live preview: 0 console errors, every scene live — `verify/allpages.js`.
2. 32/32 interactions (simulator presets → verdict + scene + figure, KB filter/search → constellation, trainer grades offline, skip film, links) — `verify/interact.js`, local and preview.
3. Contrast: film beats desktop ×1.41 / phone ×1.19 over live WebGL (95th-percentile method); all text over any scene passes — `contrast.js`, `hallmark.js`.
4. Honesty audit ALL PASS: every drawn number exists in site source or is re-derived with the engine's formula — `honesty.js`.
5. No horizontal overflow: 9 pages × 5 widths (320–1024) — `overflow.js`. Reduced-motion and no-WebGL fallbacks captured in pass 1.

## Not verified

1. Real iPhone / Safari (WebKit), Firefox, a real mid-range Android GPU. Only headless Chrome on an RTX 5070 Ti, plus emulated phone viewports and 4× CPU throttling.
2. Screen reader (NVDA / VoiceOver) and a full keyboard-only walk-through.
3. Performance after pass 2: LCP/weight/jank figures (home LCP 8,552 → 600–760 ms, weight 10,259 → 1,034 KB, no scroll lock) were measured in pass 1, before the pass-2 CSS/label changes.
4. Print output (print CSS exists; not rendered and checked).
5. Whether the default model id `claude-sonnet-5` in `lib/anthropic.ts` is current (pre-existing code; the grade call returned 200 on one preview run).

## Flagged, not changed (the words stay the words)

1. Film beat 4 and the rigging module say the shackle "hits like a 120 lb weight" / force; the engine reports energy (120 ft·lb). Physics wording for the owner to decide.
2. README says 139 scenarios; the curriculum has 143.
3. Pre-existing: hero heading SSRs at opacity 0 (StaggerLine); How-it-works grey band; heavy hero CSS animations (cause of the remaining 50 ms frame at the film→hero boundary); `transition-all` on the module-card arrow; module cards' 4 stacked hover effects.

## UI copy I added (review)

"Skip film" · "scroll to begin the load-out" · "Schematic · not to scale" · "Schematic · your saved progress" · "Watch the film version" · figure captions and tags (each quotes or cites the curriculum; sources in `lib/living-figures.ts`).

## Maintenance

- Bump `LIVING_VERSION` in `components/living/runtime.ts` on any change under `public/living/` (served immutable for a year).
- Test hooks: `?lp=<0..1>` film position, `?lpt=<ms>` frozen clock, `?lprm` reduced motion, `?lpnogl` no WebGL, `window.__ready`, `window.Living.state`.
- Harness: `living-pages/verify/` (run against `next start -p 41958 -H 127.0.0.1`). Dev server: `living-pages/dev.cmd` on 38617.

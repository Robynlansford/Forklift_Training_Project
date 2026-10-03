Paste everything below the line into a new Claude Code session opened at `C:\AI_Projects\Web_Design\Forklift_Training_Project`.

---

Resume the Living Pages work on Tour Ready Operator (`tourready-operator/`, Next.js 15 on Cloudflare Workers via OpenNext). This is a real build, so every fact must be true.

**Read first, in order:**
1. `living-pages/HANDOFF.md`: status, both iteration passes, verified vs not verified.
2. `living-pages/PLAN.md`: thesis, light roles, Scene Map, numbers and their sources.
3. Memory note `tourready-living-pages-build`.

**Where things stand:**
- Branch `living-pages` is committed locally and not pushed.
- Preview version `8e8e7da9` is uploaded. Production is untouched (version `e0434863`).
- Never push, deploy or promote without my explicit go.

**Owner corrections. They override the current film:**
- The forklift never goes inside the trucks.
- Ramps are for crew rolling or carrying cases down by hand.
- The forklift is used only once the ramp is removed. On a load-in, it pulls up to the truck with the forks already lifted.
- Film beats 1–2 and both posters are wrong. The site's own beat-1 copy ("Wet Ramp Slick") may be wrong too: flag it, don't rewrite it.

**Step 1: ask me, and wait. Don't build yet.**
1. Walk me through a real load-in and load-out, step by step. Who does what, which machine is used when, and where the ramp and the forks are at each point.
2. Which home hero do I want: the original footage scroll hero (now at `/film`), the corrected WebGL film, or both?

**Then:** re-plan the film beats from my answers. Rebuild `public/living/scenes/loadout.js` and regenerate the posters with `living-pages/verify/poster.js`. Bump `LIVING_VERSION`, then re-run the full harness in `living-pages/verify/`:
- allpages
- interact
- contrast (desktop and phone)
- hallmark
- honesty
- overflow
- collide

Do at least 2 iteration passes, and report verified vs not verified.

**Ports:** dev 38617, prod check 41958.

**Windows gotcha:** TaskStop leaves `next start` running on its port. Stop servers by port instead.

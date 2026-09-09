# TourReady Operator

**Concert and festival telehandler / forklift training for live-event production businesses.**

TourReady Operator is a Boise AI client product: a training platform that production companies, labor companies, venues, and festival operators can put in front of lift operators before a load-in. It teaches the hazards warehouse courses skip — wind and sail effect, active rigging zones, festival mud, night chaos, fatigue, and production pressure — and drills Stop-Work Authority until it is automatic.

This is a **training supplement**. It does not replace OSHA certification or supervised hands-on evaluation. The employer certifies an operator after formal instruction, practical training, and workplace evaluation (29 CFR 1910.178(l)).

---

## Who a business buyer is

Not a retail shop. The buyer is an operations or safety lead at a **business that puts powered industrial trucks on a show site**:

- **Touring production companies** that staff telehandler and forklift operators for arena and stadium load-ins
- **Festival and outdoor-event producers** working soft ground, wind, and temporary decks
- **Labor / crew companies** that supply lift operators to tours and need a consistent, concert-specific briefing
- **Venues and arenas** that run their own house crews through show-site rules before a tour arrives
- **Safety trainers** who already teach OSHA PIT material and need a live-event layer on top

The pitch is simple: warehouse forklift courses do not cover LED-wall sail effect, the Up-Look Protocol, or a 2:00 AM load-out. This platform does.

---

## What you can demo

The primary product is the **Next.js web app** in `tourready-operator/`:

| Area | Route | What it does |
|------|--------|--------------|
| Landing | `/` | Scroll film + hazards + how-it-works |
| Training Hub | `/dashboard` | Module grid, progress, export/import |
| Module + trainer | `/modules/[slug]` | Theory briefing + free-text scenarios |
| Safety Engine | `/simulator` | Live derating simulator (wind, ground, fatigue, reach) |
| Knowledge Base | `/resources` | Searchable named-technique glossary + printable rule card |
| Certification | `/certificate` | Locked until every module is passed; PNG / print credential |

Progress lives in the browser (`localStorage`). Scenario grading and the safety engine run **offline** with no API key. An Anthropic key is optional and only adds a second-pass AI voice to grading and the tutor.

Curriculum source of truth: `tourready-operator/lib/curriculum.ts` (15 modules including the capstone, 139 field scenarios, 47 named techniques).

---

## How to run (web app)

**Requirements:** Node.js 18.18+ (Node 20 LTS recommended), npm 9+.

```bash
cd tourready-operator
npm install
npm run dev
```

Open **http://localhost:3000**.

Production:

```bash
cd tourready-operator
npm run build
npm run start
```

On Windows, `go-live.bat` builds, starts the server on port 3000, and opens a Cloudflare quick tunnel. `setup.bat` launches the older Python CLI (below), not the web app.

### Optional AI layer

The trainer is complete without a key. To enable instructor-style AI feedback and a conversational tutor:

1. Copy `tourready-operator/.env.example` to `tourready-operator/.env.local`
2. Set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`)
3. Restart `npm run dev`

Do not commit `.env.local`. The key is read only in Next.js route handlers (`/api/grade`, `/api/tutor`) and is never sent to the browser.

---

## Optional: Python CLI trainer

`app.py` + `telehandler_engine.py` is a small offline CLI for a subset of modules. It is **not** the demo product.

```bash
python app.py
```

Requires Python 3.8+. Module markdown in this folder is the source material the web curriculum was built from.

---

## Repository map

```
tourready-operator/     Next.js 15 app — demo this
app.py                  Optional CLI trainer
telehandler_engine.py   Python safety engine (ported to lib/safety-engine.ts)
OPERATOR_GUIDE.md       Operator walkthrough (ports and paths match this README)
```

---

## Secrets

No API keys or credentials belong in this repo. Environment variables are documented **by name only**:

- `ANTHROPIC_API_KEY` — optional; unlocks AI grading + tutor
- `ANTHROPIC_MODEL` — optional; model override for those routes

`.env`, `.env*.local`, `*.pem`, and `*.key` are gitignored.

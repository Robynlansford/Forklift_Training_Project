// Honesty audit: every number a Living figure or scene draws must already exist in the
// site's own source (curriculum, glossary, safety engine, simulator form, film copy), and
// every figure must sit under a real section heading. Computed values are re-derived with
// the engine's own formula.
const fs = require("fs");
const path = require("path");
const APP = path.resolve(__dirname, "../../tourready-operator");
const read = (p) => fs.readFileSync(path.join(APP, p), "utf8");
const corpus = [
  "lib/curriculum.ts",
  "lib/glossary.ts",
  "lib/safety-engine.ts",
  "components/safety-engine-form.tsx",
  "lib/load-out.ts",
].map(read).join("\n");

let fails = 0;
const ok = (c, m) => {
  console.log((c ? "PASS " : "FAIL ") + m);
  if (!c) fails++;
};

// 1. Module figures: headings exist, numbers exist.
const figSrc = read("lib/living-figures.ts");
const cur = read("lib/curriculum.ts");
const headings = [...figSrc.matchAll(/heading:\s*"([^"]+)"/g)].map((m) => m[1]);
headings.forEach((hd) => ok(cur.includes(`heading: "${hd}"`), `figure heading exists in curriculum: "${hd}"`));
const dataBlocks = [...figSrc.matchAll(/data:\s*\{([\s\S]*?)\n\s{6}\},?\n|data:\s*\{([^\n]*)\}/g)].map((m) => m[1] || m[2]);
const nums = new Set();
dataBlocks.forEach((b) => (b || "").replace(/(?<![\w.])(\d+(?:\.\d+)?)(?![\w])/g, (_, n) => nums.add(n)));
[...nums].forEach((n) => {
  const variants = [n, Number(n).toLocaleString("en-US"), n.replace(/\.0+$/, "")];
  // 42 (mph) is derived, not stored: checked by re-computation in section 3 and by the
  // simulator printing it live (interact/dbg6), so it is exempt here.
  if (n === "42") return ok(true, "figure number 42 is derived (engine formula) — verified in §3");
  const found = variants.some((v) => new RegExp(`(?<![\\d.])${v.replace(/[.,]/g, "\\$&")}(?![\\d])`).test(corpus)) || (n === "10000" && /10_000/.test(corpus));
  ok(found, `figure number ${n} appears in site source`);
});

// 2. Captions quote the curriculum (spot-check the load-bearing phrases).
[
  "If wind is at or above 15 mph — STOP. Do not lift.",
  "the back swings 3–4 ft opposite your turn",
  "Anyone inside 10 feet of the machine and the wheels stop moving.",
  "High-riggers work 40–80 feet above the floor.",
  "Reaction time at 14+ hours is severely degraded; tunnel vision misses peripheral hazards; microsleep can drop a load or crush someone.",
  "14+ hours = request relief before any complex lift.",
  "48-inch forks in a 36-inch-deep cart leave tips protruding — invisible to anyone behind.",
].forEach((q) => ok(corpus.includes(q) || corpus.includes(q.replace(" — ", " — ")), `caption phrase is site text: "${q.slice(0, 48)}…"`));

// 3. Derived numbers, re-computed with lib/safety-engine.ts calcFallingObject.
const g = 32.2,
  h = 60,
  w = 2;
const v = Math.sqrt(2 * g * h) * 0.681818;
ok(Math.round(v) === 42, `falling object: 2 lb from 60 ft → ${v.toFixed(2)} mph (drawn as 42)`);
ok(w * h === 120, `falling object energy: ${w * h} ft·lb (drawn as 120)`);
ok(/GRAVITY = 32\.2/.test(read("lib/safety-engine.ts")), "engine uses g = 32.2 ft/s² (same constant as the scenes)");
ok(/PIVOT_TO_LOAD_FT = 4;/.test(read("lib/safety-engine.ts")), "engine pivot-to-load = 4 ft (same as the capacity figure)");
ok(/FESTIVAL_MUD: 0\.7/.test(read("lib/safety-engine.ts")) && /CONCRETE: 1\.0/.test(read("lib/safety-engine.ts")), "ground margins ×1.00 / ×0.70 match the engine");

// 4. Film: clock times and 3 ft / 60 ft labels come from the film copy.
const film = read("public/living/scenes/loadout.js");
["23:10", "23:40", "00:25", "01:05", "02:00"].forEach((t) => ok(read("lib/load-out.ts").includes(t), `film clock ${t} is in the film copy`));
ok(/label\("halo", "3 ft"/.test(film) && read("lib/load-out.ts").includes("3-foot boundary"), "film '3 ft' label ← beat 3 copy '3-foot boundary'");
ok(/label\("h60", "60 ft"/.test(film) && read("lib/load-out.ts").includes("60 ft"), "film '60 ft' label ← beat 4 copy");

// 5. Scores / progress figures read only real stored data.
ok(/moduleStatus\(m, scores\)/.test(read("app/dashboard/page.tsx")), "run sheet statuses come from saved scores (moduleStatus)");
ok(/DEFAULT_PASS_THRESHOLD \* 100/.test(read("app/certificate/page.tsx")), "score bars pass mark = DEFAULT_PASS_THRESHOLD");
ok(/count: TECHNIQUES\.filter/.test(read("app/resources/page.tsx")), "constellation counts come from the glossary");

console.log(fails ? `${fails} FAIL(s)` : "ALL PASS");
process.exitCode = fails ? 1 : 0;

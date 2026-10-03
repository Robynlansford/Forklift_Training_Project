// Capture a list of pages (top of page, or scrolled to a selector) and tile them.
// Usage: node pages.js <origin> <outPrefix> <WxH> [--full] [--rm] [--nogl]
//        PAGES="/,/dashboard" SCROLLTO="selector" to override.
const { launch } = require("./shot");
const { execFileSync } = require("child_process");

const DEFAULT = [
  "/dashboard",
  "/modules/heavy-physics",
  "/simulator",
  "/resources",
  "/certificate",
  "/no-such-page",
];

(async () => {
  const [origin, prefix, size] = process.argv.slice(2);
  const rm = process.argv.includes("--rm");
  const nogl = process.argv.includes("--nogl");
  const full = process.argv.includes("--full");
  const pages = process.env.PAGES ? process.env.PAGES.split(",") : DEFAULT;
  const scrollTo = process.env.SCROLLTO || null;
  const [w, h] = size.split("x").map(Number);
  const browser = await launch();
  const outs = [];
  for (const path of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 });
    if (rm) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    if (process.env.PROGRESS) {
      // Local test fixture only: 5 modules passed, 1 needing retry (never shipped).
      // PROGRESS=all: every module passed at full marks (certified state).
      await page.evaluateOnNewDocument((all) => {
        const mk = (pass, total) => ({ pass, total, completedAt: "2026-09-20T02:00:00.000Z", verdicts: {} });
        // Real scenario counts per module (lib/curriculum.ts; they sum to 143).
        const counts = { "basic-controls": 11, "legal-baselines": 11, "touring-credentials": 11, "spotter-signals": 10, "truck-pack-logistics": 8, "fork-slot-anatomy": 8, "ground-crew-choreography": 8, "staging-line-loadout": 11, "indoor-arena-ops": 11, "outdoor-festival-ops": 12, "heavy-physics": 8, "night-chaos": 8, "rigging-coordination": 8, "fatigue-pressure": 9, "capstone": 9 };
        const scores = all
          ? Object.fromEntries(Object.entries(counts).map(([s, n]) => [s, mk(n, n)]))
          : {
              "basic-controls": mk(10, 11), "legal-baselines": mk(11, 11), "touring-credentials": mk(9, 11),
              "spotter-signals": mk(9, 10), "truck-pack-logistics": mk(7, 8), "fork-slot-anatomy": mk(4, 8),
            };
        const cert = all ? { certificateId: "TRO-TEST-0001", certificateIssuedAt: "2026-09-20T02:00:00.000Z" } : { certificateId: null, certificateIssuedAt: null };
        localStorage.setItem("tourready-progress-v1", JSON.stringify({ state: { operatorName: "Test Operator", scores, ...cert }, version: 0 }));
      }, process.env.PROGRESS === "all");
    }
    const errors = [];
    page.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errors.push(m.text().slice(0, 200)));
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
    const url = origin + path + (nogl ? (path.includes("?") ? "&" : "?") + "lpnogl" : "");
    await page.goto(url, { waitUntil: "load", timeout: 120000 });
    let ready = true;
    try {
      await page.waitForFunction("window.__ready === true", { timeout: 20000 });
    } catch (e) {
      ready = false;
    }
    if (scrollTo) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: "center" });
      }, scrollTo);
    }
    await new Promise((r) => setTimeout(r, Number(process.env.WAIT || 2600)));
    const state = await page.evaluate(() =>
      window.Living ? window.Living.state.instances.map((i) => `${i.name}:${i.live ? "live" : i.failed ? "fallback" : "…"}:${i.frames}`) : ["no-engine"]
    );
    const out = `${prefix}-${path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}.png`;
    await page.screenshot({ path: out, fullPage: full });
    outs.push(out);
    console.log(path, ready ? "ready" : "NOT READY", state.join(" "), errors.length ? errors : "");
    await page.close();
  }
  await browser.close();
  if (!full && outs.length > 1) {
    const tw = 640,
      th = Math.round((tw * h) / w);
    const cols = w < 768 ? 3 : 2;
    const rows = Math.ceil(outs.length / cols);
    const inputs = [];
    outs.forEach((o) => inputs.push("-i", o));
    let fc = outs.map((_, i) => `[${i}]scale=${tw}:${th}[s${i}]`).join(";");
    const cells = [];
    for (let i = 0; i < rows * cols; i++) {
      if (i < outs.length) cells.push(`[s${i}]`);
      else {
        fc += `;color=c=black:s=${tw}x${th}[b${i}]`;
        cells.push(`[b${i}]`);
      }
    }
    const rl = [];
    for (let r = 0; r < rows; r++) {
      fc += `;${cells.slice(r * cols, r * cols + cols).join("")}hstack=${cols}[r${r}]`;
      rl.push(`[r${r}]`);
    }
    if (rows > 1) fc += `;${rl.join("")}vstack=${rows}`;
    else fc = fc.replace(/\[r0\]$/, "");
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inputs, "-filter_complex", fc, "-frames:v", "1", `${prefix}-sheet.jpg`]);
    console.log("sheet:", `${prefix}-sheet.jpg`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Interaction proofs: every widget still works, and the Living layer follows the UI state.
// Usage: node interact.js <origin>
const { launch } = require("./shot");

function ok(cond, msg) {
  console.log((cond ? "PASS " : "FAIL ") + msg);
  if (!cond) process.exitCode = 1;
}

(async () => {
  const origin = process.argv[2];
  const browser = await launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // /api/grade answers 503 by design when no ANTHROPIC_API_KEY is set (the client keeps its
  // offline grade — see app/api/grade/route.ts). That one response is expected locally; any
  // other failed response or console error still fails the check.
  const expected503 = [];
  page.on("response", (r) => r.status() >= 500 && console.log(`  [server ${r.status()}] ${r.request().method()} ${new URL(r.url()).pathname}`));
  page.on("response", (r) => r.status() === 503 && /\/api\/grade$/.test(new URL(r.url()).pathname) && expected503.push(r.url()));
  page.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && !(/status of 503/.test(m.text()) && expected503.length) && errors.push(m.text()));

  /* ── Simulator: presets drive the verdict AND the machine scene ── */
  await page.goto(origin + "/simulator", { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 25000 });
  const clickPreset = async (name) => {
    await page.evaluate((n) => {
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes(n));
      b.click();
    }, name);
    await new Promise((r) => setTimeout(r, 1500));
  };
  const verdict = () => page.evaluate(() => [...document.querySelectorAll("span")].find((s) => /^(GO|CAUTION|HARD STOP|BLOCKER)$/.test(s.textContent.trim()) && s.className.includes("text-3xl"))?.textContent.trim());
  const sceneData = () =>
    page.evaluate(() => {
      const el = document.querySelector("[data-scene=machine]");
      return el && el.__lp ? { status: el.__lp.data.status, wind: el.__lp.data.wind, ground: el.__lp.data.ground, live: el.__lp.live } : null;
    });
  const figData = () =>
    page.evaluate(() => {
      const el = document.querySelector("[data-fx=capacity]");
      return el && el.__lp ? { ground: el.__lp.data.ground, load: el.__lp.data.load, verdict: el.__lp.data.verdict } : null;
    });
  for (const [preset, expect] of [
    ["2:00 AM LED Wall", "HARD STOP"],
    ["Rigging Zone Hot", "BLOCKER"],
    ["Festival Mud Overload", "HARD STOP"],
    ["Pushers In Halo", "CAUTION"],
    ["Clear Daytime Pick", "GO"],
  ]) {
    await clickPreset(preset);
    const v = await verdict();
    const sd = await sceneData();
    const fd = await figData();
    ok(v === expect, `simulator preset "${preset}" → verdict ${v}`);
    ok(sd && sd.live && sd.status === expect.replace(" ", "_"), `machine scene follows verdict (${sd && sd.status})`);
    ok(fd && fd.verdict === expect.replace(" ", "_"), `capacity figure follows verdict (${fd && fd.verdict}, ground ${fd && fd.ground})`);
    await page.screenshot({ path: `shots/sim-${preset.replace(/[^a-z0-9]+/gi, "_")}.png`, clip: { x: 0, y: 150, width: 1440, height: 520 } });
  }
  // slider → scene
  await page.evaluate(() => {
    const r = document.querySelector('input[aria-label="Wind speed in mph"]');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(r, "22");
    r.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 900));
  const sd2 = await sceneData();
  ok(sd2 && sd2.wind === 22, `wind slider reaches the scene (wind=${sd2 && sd2.wind})`);

  /* ── Knowledge Base: filter + search drive the constellation ── */
  await page.goto(origin + "/resources", { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 25000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Rigging").click());
  await new Promise((r) => setTimeout(r, 1800));
  const kb1 = await page.evaluate(() => {
    const el = document.querySelector("[data-scene=constellation]");
    return { active: el.__lp.data.active, cards: document.querySelectorAll("h3").length };
  });
  ok(kb1.active === "Rigging", `category filter reaches constellation (active=${kb1.active})`);
  await page.screenshot({ path: "shots/kb-rigging.png", clip: { x: 0, y: 64, width: 1440, height: 320 } });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "All").click());
  await page.type('input[aria-label="Search techniques"]', "wind");
  await new Promise((r) => setTimeout(r, 1500));
  const kb2 = await page.evaluate(() => document.querySelector("[data-scene=constellation]").__lp.data.matches);
  ok(Array.isArray(kb2) && kb2.length > 0, `search reaches constellation (matches=${JSON.stringify(kb2)})`);
  await page.screenshot({ path: "shots/kb-search.png", clip: { x: 0, y: 64, width: 1440, height: 320 } });

  /* ── Dashboard controls exist and respond (no file dialogs opened) ── */
  await page.goto(origin + "/dashboard", { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 25000 });
  const labels = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()));
  for (const l of ["Save Record", "Export", "Import", "Reset"]) ok(labels.some((x) => x.includes(l)), `dashboard button "${l}" present`);
  await page.type('input[placeholder="e.g. Jordan Rivera"]', "Test Operator");
  await new Promise((r) => setTimeout(r, 400));
  const greet = await page.evaluate(() => document.body.innerText.includes("Welcome back, Test"));
  ok(greet, "operator name input still personalises the hub");

  /* ── Module page: trainer + prev/next ── */
  await page.goto(origin + "/modules/basic-controls", { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 25000 });
  // Start the trainer and grade one answer offline (local only — nothing leaves the machine
  // unless the owner has set an API key; no lead or message is sent anywhere).
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /^Start \d+ Scenarios/.test(b.textContent.trim())).click());
  await new Promise((r) => setTimeout(r, 600));
  const hasTrainer = await page.evaluate(() => !!document.querySelector("textarea"));
  ok(hasTrainer, "scenario trainer starts and shows its answer box");
  await page.type("textarea", "Stop, check the tires, forks, fluid leaks, seat belt, mirrors, horn, lights and parking brake before operating.");
  const submitted = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Submit answer"]');
    if (!b || b.disabled) return false;
    b.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 4000));
  const graded = await page.evaluate(() => document.querySelectorAll("main textarea").length > 0 && /pass|fail|correct|missed|named|technique/i.test([...document.querySelectorAll("main div")].slice(-80).map((d) => d.innerText).join(" ")));
  ok(submitted && graded, "trainer grades an answer (offline grader)");
  const next = await page.evaluate(() => [...document.querySelectorAll("a")].some((a) => a.getAttribute("href") === "/modules/legal-baselines"));
  ok(next, "next-module link present");

  /* ── Home: film skip link + CTA links ── */
  await page.goto(origin + "/", { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 25000 });
  const links = await page.evaluate(() => [...document.querySelectorAll("a")].map((a) => a.getAttribute("href")));
  for (const h of ["/dashboard", "/simulator"]) ok(links.includes(h), `home link ${h} present`);
  // original footage hero: its "Skip film" is a button
  const findSkip = () => [...document.querySelectorAll("button, a")].find((b) => b.getClientRects().length && /skip film/i.test(b.textContent));
  await page.waitForFunction(findSkip, { timeout: 60000 });
  await page.evaluate((f) => eval(f)().click(), "(" + findSkip.toString() + ")");
  await new Promise((r) => setTimeout(r, 2600)); // html has scroll-behavior: smooth
  const heroTop = await page.evaluate(() => Math.round(document.getElementById("hero").getBoundingClientRect().top));
  ok(Math.abs(heroTop) < 90, `"Skip film" lands on the hero (top=${heroTop}px)`);

  ok(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.slice(0, 5).join(" | ") : ""));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

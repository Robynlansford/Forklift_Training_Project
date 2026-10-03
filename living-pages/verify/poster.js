// Render the signature film's first frame as clean posters (no DOM overlays), then
// encode WebP. The poster IS a frame of the scene, so the canvas fades in over an
// identical picture — no flash, no mismatch.
// Usage: node poster.js <origin> <outDir>
const { launch } = require("./shot");
const { execFileSync } = require("child_process");
const path = require("path");

(async () => {
  const [origin, outDir] = process.argv.slice(2);
  const browser = await launch();
  const jobs = [
    { name: "loadout-wide", w: 1600, h: 1000, dpr: 1, q: 72 },
    { name: "loadout-tall", w: 430, h: 932, dpr: 2, q: 70 },
  ];
  for (const j of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: j.dpr, isMobile: j.w < 768, hasTouch: j.w < 768 });
    await page.goto(`${origin}/?lp=0&lpt=2600`, { waitUntil: "load" });
    await page.waitForFunction("window.__ready === true", { timeout: 30000 });
    await page.addStyleTag({
      content:
        "header, .lp-title, .lp-chrome, .lp-scrim, .lp-labels, .lp-beats, .grain, nextjs-portal, [data-nextjs-toast], .fixed { visibility: hidden !important; } .lp-poster { display:none !important; }",
    });
    await new Promise((r) => setTimeout(r, 1500));
    const png = path.join(outDir, j.name + ".png");
    const stage = await page.$(".lp-stage");
    await stage.screenshot({ path: png });
    const webp = path.join(outDir, j.name + ".webp");
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", String(j.q), "-compression_level", "6", webp]);
    console.log(j.name, "→", webp);
    await page.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Real-GPU screenshots of Living Pages scenes.
// Usage: node shot.js <url> <out.png> [WxH] [--rm] [--nogl] [--full] [--scroll=<y>] [--wait=<ms>]
// Waits for window.__ready (fails loudly if it never fires), prints console errors
// and window.Living.state so every shot doubles as a health check.
const puppeteer = require("puppeteer-core");
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function shoot(browser, url, out, opts) {
  const page = await browser.newPage();
  const [w, h] = (opts.size || "1440x900").split("x").map(Number);
  await page.setViewport({ width: w, height: h, deviceScaleFactor: opts.dpr || 1, isMobile: w < 768, hasTouch: w < 768 });
  if (opts.rm) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(m.type() + ": " + m.text().slice(0, 240));
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 240)));
  let target = url;
  if (opts.nogl) target += (url.includes("?") ? "&" : "?") + "lpnogl";
  await page.goto(target, { waitUntil: "load", timeout: 120000 });
  let ready = true;
  try {
    await page.waitForFunction("window.__ready === true", { timeout: opts.readyTimeout || 25000 });
  } catch (e) {
    ready = false;
  }
  if (opts.scroll != null) {
    await page.evaluate((y) => window.scrollTo(0, y), opts.scroll);
  }
  await new Promise((r) => setTimeout(r, opts.wait || 1400));
  const state = await page.evaluate(() => {
    const L = window.Living;
    return L ? { ready: window.__ready, instances: L.state.instances, loadout: L.state.loadout } : { ready: window.__ready, noLiving: true };
  });
  await page.screenshot({ path: out, fullPage: !!opts.full });
  await page.close();
  return { out, ready, errors, state };
}

module.exports = { shoot, launch };

async function launch() {
  return puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"],
  });
}

if (require.main === module) {
  (async () => {
    const [url, out, size] = process.argv.slice(2);
    const flag = (n) => process.argv.find((a) => a.startsWith("--" + n));
    const val = (n) => {
      const f = flag(n);
      return f && f.includes("=") ? f.split("=")[1] : null;
    };
    const browser = await launch();
    const res = await shoot(browser, url, out, {
      size: size && /x/.test(size) ? size : "1440x900",
      rm: !!flag("rm"),
      nogl: !!flag("nogl"),
      full: !!flag("full"),
      scroll: val("scroll") != null ? Number(val("scroll")) : null,
      wait: val("wait") ? Number(val("wait")) : 1400,
      dpr: val("dpr") ? Number(val("dpr")) : 1,
    });
    await browser.close();
    console.log(JSON.stringify(res, null, 1));
    if (!res.ready) process.exitCode = 2;
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

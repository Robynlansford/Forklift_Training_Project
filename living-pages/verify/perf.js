// Living Pages — per-page performance capture (before/after comparison).
// Usage: node perf.js <origin> <out.json> [--throttle]
// Measures FCP, LCP, transferred bytes, request count, JS bytes, largest image,
// console errors, and (home only) when the page first becomes scrollable.
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const origin = process.argv[2];
const out = process.argv[3];
const throttle = process.argv.includes("--throttle");

const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const ALL = [
  "/",
  "/dashboard",
  "/modules/basic-controls",
  "/modules/heavy-physics",
  "/modules/capstone",
  "/simulator",
  "/resources",
  "/certificate",
  "/this-route-does-not-exist",
];
const PAGES = ONLY || ALL;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--window-size=1440,900"],
  });
  const results = [];
  for (const path of PAGES) {
    for (let run = 0; run < 2; run++) {
      const ctx = await browser.createBrowserContext(); // cold cache every run
      const page = await ctx.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      const cdp = await page.createCDPSession();
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      if (throttle) {
        // "Decent 4G": 10 Mbps down, 40 ms RTT.
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 40,
          downloadThroughput: (10 * 1024 * 1024) / 8,
          uploadThroughput: (5 * 1024 * 1024) / 8,
        });
      }
      const reqs = new Map();
      cdp.on("Network.responseReceived", (e) =>
        reqs.set(e.requestId, { url: e.response.url, type: e.type, mime: e.response.mimeType, bytes: 0 })
      );
      cdp.on("Network.loadingFinished", (e) => {
        const r = reqs.get(e.requestId);
        if (r) r.bytes = e.encodedDataLength;
      });
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));

      await page.evaluateOnNewDocument(() => {
        window.__lcp = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        // Last moment the document was scroll-locked (a load gate). 0 = never locked.
        window.__scrollable = 0;
        const poll = () => {
          const h = document.documentElement ? document.documentElement.style.overflow : "";
          const b = document.body ? document.body.style.overflow : "";
          if (h === "hidden" || b === "hidden") window.__scrollable = performance.now();
          if (performance.now() < 15000) setTimeout(poll, 16);
        };
        poll();
      });

      const t = Date.now();
      await page.goto(origin + path, { waitUntil: "load", timeout: 120000 });
      await new Promise((r) => setTimeout(r, throttle ? 9000 : 3500));
      const m = await page.evaluate(() => {
        const fcp = performance.getEntriesByName("first-contentful-paint")[0];
        return { fcp: fcp ? fcp.startTime : null, lcp: window.__lcp, scrollable: window.__scrollable };
      });
      const list = [...reqs.values()];
      const total = list.reduce((a, r) => a + r.bytes, 0);
      const js = list.filter((r) => /javascript/.test(r.mime)).reduce((a, r) => a + r.bytes, 0);
      const imgs = list.filter((r) => /^image\//.test(r.mime)).sort((a, b) => b.bytes - a.bytes);
      const media = list.filter((r) => /video|octet/.test(r.mime) || /\.mp4/.test(r.url)).reduce((a, r) => a + r.bytes, 0);
      if (run === 1) {
        results.push({
          path,
          fcp: Math.round(m.fcp),
          lcp: Math.round(m.lcp),
          scrollableAt: m.scrollable ? Math.round(m.scrollable) : null,
          requests: list.length,
          totalKB: Math.round(total / 1024),
          jsKB: Math.round(js / 1024),
          mediaKB: Math.round(media / 1024),
          largestImage: imgs[0] ? { url: imgs[0].url.replace(origin, ""), KB: Math.round(imgs[0].bytes / 1024) } : null,
          errors,
          wallMs: Date.now() - t,
        });
        console.log(JSON.stringify(results[results.length - 1]));
      }
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

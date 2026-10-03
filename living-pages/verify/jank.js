// Scripted scroll-through with frame timing. Budget: max frame < 50 ms.
// Usage: node jank.js <url> [WxH] [--cpu=4]   (cpu = CDP CPU throttling rate, phone-ish)
const { launch } = require("./shot");

(async () => {
  const url = process.argv[2];
  const size = (process.argv[3] && /x/.test(process.argv[3]) ? process.argv[3] : "1440x900").split("x").map(Number);
  const cpuArg = process.argv.find((a) => a.startsWith("--cpu="));
  const cpu = cpuArg ? Number(cpuArg.split("=")[1]) : 1;
  const browser = await launch();
  const page = await browser.newPage();
  await page.setViewport({ width: size[0], height: size[1], isMobile: size[0] < 768, hasTouch: size[0] < 768 });
  const cdp = await page.createCDPSession();
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  const gpu = await page.evaluate(() => {
    const c = document.createElement("canvas").getContext("webgl2");
    const d = c && c.getExtension("WEBGL_debug_renderer_info");
    return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  });
  await page.goto(url, { waitUntil: "load" });
  if (process.env.BASELINE) {
    // original site: no __ready contract — wait for its load gate to release the scroll lock
    await new Promise((r) => setTimeout(r, 1500));
    await page.waitForFunction("document.documentElement.style.overflow !== 'hidden' && document.body.style.overflow !== 'hidden'", { timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2500));
  } else await page.waitForFunction("window.__ready === true", { timeout: 30000 });
  if (process.env.CSS) await page.addStyleTag({ content: process.env.CSS });
  await new Promise((r) => setTimeout(r, 1500));
  const res = await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const total = document.documentElement.scrollHeight - innerHeight;
    const steps = Math.ceil(total / 28); // ~28 px per frame ≈ a brisk wheel scroll
    const deltas = [];
    const spikes = [];
    let last = performance.now();
    for (let i = 0; i <= steps; i++) {
      window.scrollTo(0, Math.min(total, i * 28));
      await new Promise((r) => requestAnimationFrame(r));
      const now = performance.now();
      deltas.push(now - last);
      if (now - last > 34) spikes.push({ y: Math.min(total, i * 28), ms: +(now - last).toFixed(1), near: [...document.querySelectorAll("[data-scene],[data-fx]")].filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > -innerHeight && r.top < innerHeight * 2.5; }).map((e) => e.dataset.scene || e.dataset.fx).join(",") });
      last = now;
    }
    deltas.shift();
    const s = deltas.slice().sort((a, b) => a - b);
    const p = (q) => s[Math.min(s.length - 1, Math.floor(q * s.length))];
    return {
      frames: deltas.length,
      avg: +(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1),
      p95: +p(0.95).toFixed(1),
      max: +s[s.length - 1].toFixed(1),
      over50: deltas.filter((d) => d > 50).length,
      spikes,
      instances: window.Living ? window.Living.state.instances.map((i) => `${i.name}@${i.scale}`) : [],
    };
  });
  console.log(JSON.stringify({ url, size: size.join("x"), cpu, gpu, ...res }));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

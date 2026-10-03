// Contrast audit of text over live scenes, measured the honest way:
// hide the text, screenshot exactly the area behind it, take the 95th-percentile
// background luminance (the busiest pixels), and compare with the text colour as
// resolved by the browser (canvas readback, not regex on computed styles).
// Usage: node contrast.js <origin> <WxH>
const { launch } = require("./shot");
const { PNG } = (() => {
  try {
    return require("pngjs");
  } catch (e) {
    return {};
  }
})();

function lum(r, g, b) {
  const f = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

(async () => {
  const [origin, size] = process.argv.slice(2);
  const [w, h] = (size || "1440x900").split("x").map(Number);
  const browser = await launch();
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 768, hasTouch: w < 768 });
  const beats = [
    { p: 0.02, sel: ".lp-title" },
    { p: 0.16, sel: '.lp-beat[data-at="0.09,0.24"]' },
    { p: 0.36, sel: '.lp-beat[data-at="0.28,0.43"]' },
    { p: 0.55, sel: '.lp-beat[data-at="0.47,0.63"]' },
    { p: 0.6, sel: '.lp-beat[data-at="0.47,0.63"]' },
    { p: 0.72, sel: '.lp-beat[data-at="0.67,0.81"]' },
    { p: 0.775, sel: '.lp-beat[data-at="0.67,0.81"]' },
    { p: 0.93, sel: '.lp-beat[data-at="0.85,1"]' },
    { p: 1, sel: '.lp-beat[data-at="0.85,1"]' },
  ];
  let worst = 99;
  for (const b of beats) {
    await page.goto(`${origin}/?lp=${b.p}&lpt=3000`, { waitUntil: "load" });
    await page.waitForFunction("window.__ready === true", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 900));
    const items = await page.evaluate((sel) => {
      const root = document.querySelector(sel);
      const els = [...root.querySelectorAll("h2, p, li, .lp-eyebrow")].filter((e) => e.getBoundingClientRect().height > 0);
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      return els.map((e, i) => {
        e.setAttribute("data-cx", i);
        const r = e.getBoundingClientRect();
        cv.clearRect(0, 0, 1, 1);
        cv.fillStyle = getComputedStyle(e).color;
        cv.fillRect(0, 0, 1, 1);
        const d = cv.getImageData(0, 0, 1, 1).data;
        return { i, tag: e.tagName.toLowerCase() + (e.className ? "." + String(e.className).split(" ")[0] : ""), x: r.left, y: r.top, w: r.width, h: r.height, rgb: [d[0], d[1], d[2]], size: parseFloat(getComputedStyle(e).fontSize), weight: getComputedStyle(e).fontWeight };
      });
    }, b.sel);
    // hide the words, keep everything else
    await page.addStyleTag({ content: "[data-cx]{color:transparent!important;text-shadow:none!important;border-color:transparent!important;background:transparent!important}" });
    await new Promise((r) => setTimeout(r, 300));
    for (const it of items) {
      const clip = { x: Math.max(0, it.x), y: Math.max(0, it.y), width: Math.max(1, Math.min(it.w, w - it.x)), height: Math.max(1, Math.min(it.h, h - it.y)) };
      const buf = await page.screenshot({ clip, type: "png" });
      const png = PNG.sync.read(Buffer.from(buf));
      const L = [];
      for (let k = 0; k < png.data.length; k += 4) L.push(lum(png.data[k], png.data[k + 1], png.data[k + 2]));
      L.sort((a, c) => a - c);
      const bg = L[Math.floor(L.length * 0.95)];
      const cr = ratio(lum(...it.rgb), bg);
      const large = it.size >= 24 || (it.size >= 18.66 && +it.weight >= 700);
      const need = large ? 3 : 4.5;
      worst = Math.min(worst, cr / need);
      console.log(`p=${b.p} ${it.tag.padEnd(18)} ${cr.toFixed(2)}:1 (needs ${need}) ${cr >= need ? "PASS" : "FAIL"}`);
    }
  }
  console.log("worst margin (ratio/required):", worst.toFixed(2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

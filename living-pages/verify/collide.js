// Film chrome vs the site's fixed tutor launcher and vs every beat, across the whole film.
const { launch } = require("./shot");
(async () => {
  const o = process.argv[2]; const b = await launch(); let bad = 0;
  const hit = (a, c) => a && c && a[0] < c[2] && c[0] < a[2] && a[1] < c[3] && c[1] < a[3];
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [390, 844], [375, 667], [320, 740]]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 768, hasTouch: w < 768 });
    for (const lp of [0, 0.16, 0.36, 0.55, 0.72, 0.93, 1]) {
      await p.goto(`${o}/?lp=${lp}&lpt=2000`, { waitUntil: "load" }); await p.waitForFunction("window.__ready===true"); await new Promise(r => setTimeout(r, 500));
      const r = await p.evaluate(() => {
        const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left, r.top, r.right, r.bottom] : null; };
        const vis = (e) => e && +getComputedStyle(e.closest("[data-at]") || e).opacity > 0.05;
        const bub = R(document.querySelector('[aria-label="Open AI Safety Tutor"]'));
        const tag = R(document.querySelector(".lp-schematic"));
        const hintEl = document.querySelector(".lp-hint");
        const hint = vis(hintEl) ? R(hintEl) : null;
        const beats = [...document.querySelectorAll(".lp-beat, .lp-title")].filter(vis).map(e => [...e.querySelectorAll("h2,p,a,.lp-eyebrow,li")].map(R)).flat().filter(Boolean);
        return { bub, tag, hint, beats, vw: innerWidth, vh: innerHeight };
      });
      const out = [];
      if (hit(r.tag, r.bub)) out.push("tag×launcher");
      if (hit(r.hint, r.bub)) out.push("hint×launcher");
      if (r.beats.some(x => hit(x, r.tag))) out.push("tag×beat");
      if (r.hint && r.beats.some(x => hit(x, r.hint))) out.push("hint×beat");
      if (r.tag && (r.tag[2] > r.vw || r.tag[3] > r.vh)) out.push("tag off-screen");
      if (out.length) { bad++; console.log(`FAIL ${w}x${h} lp=${lp}: ${out.join(", ")}`); }
    }
    await p.close(); console.log(`${w}x${h} checked`);
  }
  console.log(bad ? bad + " collision(s)" : "no collisions"); await b.close();
})();

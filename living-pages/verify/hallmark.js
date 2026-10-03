// Hallmark runtime gates on the Living layer: 33 (canvas/svg a11y), 44 (film fits 1280×800),
// 49 (two-line clickable text in Living containers), 56 (sticky layering), and 40 (contrast of
// every transparent-background text element over a live scene, 95th-percentile method).
// Usage: node hallmark.js <origin>
const { launch } = require("./shot");
const { PNG } = require("pngjs");
const lum = (r, g, b) => {
  const f = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const LIVING = ".lp-film, .lp-hero, .lp-fig, [data-fx=route]";
const PAGES = ["/", "/dashboard", "/certificate", "/simulator", "/resources", "/modules/heavy-physics", "/modules/capstone", "/no-such-page"];

(async () => {
  const origin = process.argv[2];
  const b = await launch();
  let fails = 0;
  const bad = (m) => { fails++; console.log("FAIL " + m); };

  // 44 — film title card and skip link inside the first 1280×800 screen
  {
    const p = await b.newPage();
    await p.setViewport({ width: 1280, height: 800 });
    await p.goto(origin + "/?lp=0&lpt=2600", { waitUntil: "load" });
    await p.waitForFunction("window.__ready === true", { timeout: 30000 });
    const r = await p.evaluate(() => {
      const t = document.querySelector(".lp-title").getBoundingClientRect();
      const s = [...document.querySelectorAll(".lp-film a")].find((a) => /skip film/i.test(a.textContent)).getBoundingClientRect();
      return { titleBottom: Math.round(t.bottom), skipBottom: Math.round(s.bottom), vh: innerHeight };
    });
    const ok = r.titleBottom <= r.vh && r.skipBottom <= r.vh;
    console.log(`${ok ? "PASS" : "FAIL"} 44 film title card at 1280×800: title bottom ${r.titleBottom}, skip ${r.skipBottom} / ${r.vh}`);
    if (!ok) fails++;
    // 56 — pinned stage must sit under the site header (header paints above)
    const z = await p.evaluate(() => {
      const hdr = document.querySelector("header");
      const stage = document.querySelector(".lp-pinned, .lp-stage");
      const zi = (e) => { let z = 0; for (let n = e; n && n !== document.body; n = n.parentElement) { const v = parseInt(getComputedStyle(n).zIndex); if (!isNaN(v)) z = Math.max(z, v); } return z; };
      window.scrollTo(0, innerHeight * 1.5);
      const hb = hdr.getBoundingClientRect();
      const top = document.elementFromPoint(hb.left + hb.width / 2, hb.top + hb.height / 2);
      return { hdrPos: getComputedStyle(hdr).position, hdrZ: zi(hdr), stageZ: zi(stage), headerOnTop: hdr.contains(top) };
    });
    const zok = z.headerOnTop;
    console.log(`${zok ? "PASS" : "FAIL"} 56 sticky layering: header ${z.hdrPos} z${z.hdrZ} over pinned stage z${z.stageZ} (hit-test ${z.headerOnTop ? "header" : "stage"})`);
    if (!zok) fails++;
    await p.close();
  }

  for (const [w, h] of [[1440, 900], [390, 844], [320, 740]]) {
    for (const path of PAGES) {
      if (w === 320 && path !== "/" && path !== "/dashboard" && path !== "/simulator") continue;
      const p = await b.newPage();
      await p.setViewport({ width: w, height: h, isMobile: w < 768, hasTouch: w < 768 });
      await p.goto(origin + path + "?lpt=2000", { waitUntil: "load", timeout: 120000 });
      await p.waitForFunction("window.__ready === true", { timeout: 30000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 900));

      // 33 + 49
      const st = await p.evaluate((LIVING) => {
        const out = { a11y: [], wrap: [] };
        document.querySelectorAll(".lp-canvas, .lp-fig canvas, [data-lp-icon], .lp-hero-art svg").forEach((e) => {
          const hidden = e.closest("[aria-hidden=true]");
          if (!hidden && !e.getAttribute("aria-label") && !e.getAttribute("role")) out.a11y.push(e.tagName + "." + String(e.className.baseVal ?? e.className).split(" ")[0]);
        });
        document.querySelectorAll(LIVING).forEach((root) =>
          root.querySelectorAll("a, button").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.height || getComputedStyle(el).visibility === "hidden") return;
            const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
            // text nodes only (an inline icon sits at a different top), half-line tolerance
            const tops = [];
            const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let n = tw.nextNode(); n; n = tw.nextNode()) {
              if (!n.textContent.trim()) continue;
              const rg = document.createRange();
              rg.selectNodeContents(n);
              [...rg.getClientRects()].filter((q) => q.width > 1).forEach((q) => tops.push(q.top));
            }
            tops.sort((x, y) => x - y);
            let lines = tops.length ? 1 : 0;
            for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] > lh * 0.5) lines++;
            if (lines > 1) out.wrap.push(`"${el.textContent.trim().slice(0, 40)}" ${lines} lines`);
          })
        );
        return out;
      }, LIVING);
      st.a11y.forEach((x) => bad(`33 ${w} ${path}: ${x} has no aria-hidden/label`));
      st.wrap.forEach((x) => bad(`49 ${w} ${path}: ${x}`));

      // 40 — text over scenes (text hidden, backgrounds kept)
      const items = await p.evaluate(() => {
        const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
        const rgb = (c) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); return [...cv.getImageData(0, 0, 1, 1).data]; };
        const els = [];
        // any text on the page that overlaps any live scene canvas (not only text inside .lp-hero)
        document.querySelectorAll(".lp-canvas, .lp-fig canvas").forEach((cvs) => {
          const ab = cvs.getBoundingClientRect();
          if (!ab.width || !ab.height || getComputedStyle(cvs).display === "none") return;
          document.querySelectorAll("h1, h2, h3, p, li, span, figcaption, .lp-label, .lp-tag, a, button").forEach((e) => {
            if (e.hasAttribute("data-hx")) return;
            if ([...e.children].some((c) => c.textContent.trim() && !/^(B|STRONG|EM|I|SMALL)$/.test(c.tagName))) return;
            const t = e.textContent.trim();
            const r = e.getBoundingClientRect();
            if (!t || r.height < 4 || r.width < 4 || r.bottom < 0 || r.top > innerHeight) return;
            const cs = getComputedStyle(e);
            if (cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return;
            // must overlap the scene art, else it is ordinary page text
            if (r.right < ab.left || r.left > ab.right || r.bottom < ab.top || r.top > ab.bottom) return;
            // measured with its own backing kept (only the text is hidden)
            e.setAttribute("data-hx", els.length);
            // effective opacity (engine fades labels): the glyphs composite over what is behind them
            let op = 1;
            for (let n = e; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
            if (op < 0.05) return; // not on screen (film beats off their window; contrast.js covers them at peak)
            const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, r.top + r.height / 2));
            const covered = hit && !e.contains(hit) && !hit.contains(e) ? hit.tagName.toLowerCase() + "." + String(hit.className).split(" ")[0] : "";
            els.push({ t: t.slice(0, 34), x: r.left, y: r.top, w: r.width, h: r.height, rgb: rgb(cs.color), op, covered, size: parseFloat(cs.fontSize), weight: +cs.fontWeight });
          });
        });
        return els;
      });
      if (items.length) {
        await p.addStyleTag({ content: "[data-hx]{color:transparent!important;text-shadow:none!important;border-color:transparent!important}" });
        await new Promise((r) => setTimeout(r, 250));
      }
      let worst = 99, worstT = "";
      for (const it of items) {
        const clip = { x: Math.max(0, it.x), y: Math.max(0, it.y), width: Math.max(1, Math.min(it.w, w - Math.max(0, it.x))), height: Math.max(1, Math.min(it.h, h - Math.max(0, it.y))) };
        const png = PNG.sync.read(Buffer.from(await p.screenshot({ clip, type: "png" })));
        const L = [];
        for (let k = 0; k < png.data.length; k += 4) L.push(lum(png.data[k], png.data[k + 1], png.data[k + 2]));
        L.sort((a, c) => a - c);
        const bgL = L[Math.floor(L.length * 0.95)];
        // alpha-composite the text over the background (linear-light approximation)
        const cr = ratio(it.op * lum(...it.rgb) + (1 - it.op) * bgL, bgL);
        const need = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700) ? 3 : 4.5;
        if (cr / need < worst) { worst = cr / need; worstT = `"${it.t}" ${cr.toFixed(2)}:1 needs ${need}`; }
        if (cr < need) bad(`40 ${w} ${path}: "${it.t}" ${cr.toFixed(2)}:1 (needs ${need}, opacity ${it.op.toFixed(2)}${it.covered ? ", covered by " + it.covered : ""})`);
      }
      console.log(`${w} ${path.padEnd(24)} text-over-scene: ${items.length} checked${items.length ? `, worst margin ×${worst.toFixed(2)} ${worstT}` : ""}`);
      await p.close();
    }
  }
  console.log(fails ? `${fails} gate failure(s)` : "ALL HALLMARK RUNTIME GATES PASS");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

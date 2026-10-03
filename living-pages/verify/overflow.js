// No horizontal scroll at the Hallmark widths, on every page.
const { launch } = require("./shot");
(async () => {
  const origin = process.argv[2];
  const pages = ["/", "/dashboard", "/modules/capstone", "/modules/heavy-physics", "/simulator", "/resources", "/certificate", "/film", "/no-such-page"];
  const widths = [320, 375, 414, 768, 1024];
  const browser = await launch();
  let fails = 0;
  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 800, isMobile: w < 768, hasTouch: w < 768 });
    const row = [];
    for (const p of pages) {
      await page.goto(origin + p, { waitUntil: "load", timeout: 120000 });
      if (p === "/film") await new Promise((r) => setTimeout(r, 2500));
      else await page.waitForFunction("window.__ready === true", { timeout: 25000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 600));
      const r = await page.evaluate(() => {
        const de = document.documentElement;
        const over = de.scrollWidth - de.clientWidth;
        let culprit = "";
        if (over > 0) {
          for (const el of document.querySelectorAll("body *")) {
            const b = el.getBoundingClientRect();
            if (b.right > de.clientWidth + 1 && b.width > 0) {
              culprit = el.tagName.toLowerCase() + "." + String(el.className).split(" ").slice(0, 2).join(".");
              break;
            }
          }
        }
        return { over, culprit };
      });
      if (r.over > 0) fails++;
      row.push(`${p}:${r.over > 0 ? "OVER " + r.over + "px " + r.culprit : "ok"}`);
    }
    console.log(w + "px  " + row.join("  "));
    await page.close();
  }
  console.log(fails ? `${fails} overflow(s)` : "no horizontal overflow");
  await browser.close();
})();

// Does a clickable label wrap on a given origin? Usage: node wrapcheck.js <origin>
const { launch } = require("./shot");
(async () => {
  const o = process.argv[2]; const b = await launch();
  for (const [w, h] of [[1440, 900], [390, 844], [320, 740]]) for (const [path, re] of [["/resources", /Print Rule Card/], ["/no-such-page", /Return to Training Hub/], ["/", /Enter the Training Hub|Open Safety Engine/]]) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 768 });
    await p.goto(o + path, { waitUntil: "load" }); await new Promise(r => setTimeout(r, 1500));
    const r = await p.evaluate((src) => { const re = new RegExp(src); return [...document.querySelectorAll("a,button")].filter(e => re.test(e.textContent) && e.getBoundingClientRect().height).map(e => { const rg = document.createRange(); rg.selectNodeContents(e); const n = new Set([...rg.getClientRects()].filter(q => q.width > 1).map(q => Math.round(q.top))).size; return `${e.textContent.trim().slice(0,24)}:${n}L w${Math.round(e.getBoundingClientRect().width)} in ${e.closest("section,header,main,div[class]")?.className.slice(0,50)}`; }); }, re.source);
    console.log(w, path, r.join(" | ")); await p.close();
  }
  await b.close();
})();

const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:1440,height:900});
  p.on("pageerror", e => console.log("PAGEERR", String(e).slice(0,400)));
  p.on("framenavigated", f => console.log("NAV", f.url()));
  await p.goto(process.argv[2] + "/simulator", {waitUntil:"load"});
  await p.waitForFunction("window.__ready === true", {timeout:25000});
  await p.evaluate(() => [...document.querySelectorAll("button")].find(x=>x.textContent.includes("2:00 AM LED Wall")).click());
  await new Promise(r=>setTimeout(r,1500));
  console.log(await p.evaluate(() => { const el=document.querySelector("[data-scene=machine]"); return JSON.stringify({has:!!el, lp: !!(el&&el.__lp), keys: el? Object.keys(el).filter(k=>k.startsWith('__')):[] , spans:[...document.querySelectorAll('span.text-3xl')].map(s=>s.textContent)}); }));
  console.log(await p.evaluate(() => [...document.querySelectorAll("button")].map(b=>b.textContent.trim().slice(0,30)).join(" | ")));
  await b.close();
})();

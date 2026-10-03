const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.goto(process.argv[2] + "/simulator", {waitUntil:"load"});
  await p.waitForFunction("window.__ready === true", {timeout:25000});
  await p.evaluate(() => [...document.querySelectorAll("button")].find(x=>x.textContent.includes("Rigging Zone Hot")).click());
  await new Promise(r=>setTimeout(r,800));
  const t = await p.evaluate(() => { const m = document.body.innerText.match(/A 2 lb object from[^\n]*/); return m ? m[0] : null; });
  console.log("SIMULATOR PRINTS:", t);
  await b.close();
})();

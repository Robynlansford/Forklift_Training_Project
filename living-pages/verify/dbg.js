const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:1440,height:900});
  p.on("pageerror", e => console.log("PAGEERR", String(e).slice(0,400)));
  p.on("console", m => { if (m.type()==="error") console.log("CONSOLE", m.text().slice(0,400)); });
  await p.goto(process.argv[2] + "/simulator", {waitUntil:"load"});
  await p.waitForFunction("window.__ready === true", {timeout:25000});
  const n = await p.evaluate(() => [...document.querySelectorAll("button")].filter(x=>x.textContent.includes("2:00 AM LED Wall")).length);
  console.log("buttons", n);
  await p.evaluate(() => [...document.querySelectorAll("button")].find(x=>x.textContent.includes("2:00 AM LED Wall")).click());
  await new Promise(r=>setTimeout(r,2000));
  console.log(await p.evaluate(() => document.body.innerText.slice(0,600)));
  await b.close();
})();

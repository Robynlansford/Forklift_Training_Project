const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  p.on("pageerror", e => console.log("PAGEERR", String(e).slice(0,160)));
  p.on("console", m => { if (m.type()==="error") console.log("ERROR", m.text().slice(0,300)); });
  p.on("response", r => { if (r.status()>=400) console.log(r.status(), r.url().slice(0,140)); });
  await p.goto(process.argv[2] + "/", {waitUntil:"load"});
  await new Promise(r=>setTimeout(r,4000));
  await b.close();
})();

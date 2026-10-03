const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  p.on("pageerror", e => console.log("PAGEERR", String(e).slice(0,600)));
  p.on("console", m => { if (m.type()==="error" || m.type()==="warning") console.log(m.type().toUpperCase(), m.text().slice(0,600)); });
  await p.goto(process.argv[2] + "/", {waitUntil:"load"});
  await new Promise(r=>setTimeout(r,5000));
  await b.close();
})();

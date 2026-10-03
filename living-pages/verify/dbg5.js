const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  p.on("pageerror", e => { const s = String(e); const i = s.indexOf("+"); console.log(s.slice(Math.max(0,i-900), i+700)); });
  await p.goto(process.argv[2] + "/", {waitUntil:"load"});
  await new Promise(r=>setTimeout(r,4000));
  await b.close();
})();

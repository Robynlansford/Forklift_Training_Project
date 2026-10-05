// Every route in production: no console errors, Living state healthy.
const { launch } = require("./shot");
const slugs = ["basic-controls","legal-baselines","touring-credentials","spotter-signals","truck-pack-logistics","fork-slot-anatomy","ground-crew-choreography","staging-line-loadout","indoor-arena-ops","outdoor-festival-ops","heavy-physics","night-chaos","rigging-coordination","fatigue-pressure","capstone"];
(async () => {
  const origin = process.argv[2];
  const b = await launch();
  const pages = ["/", "/dashboard", "/simulator", "/resources", "/certificate", ...slugs.map(s => "/modules/" + s)];
  let bad = 0;
  for (const path of pages) {
    const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
    const errs = [];
    p.on("pageerror", e => errs.push("pageerror " + String(e).slice(0, 160)));
    p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
    p.on("response", r => { if (r.status() >= 400) errs.push(r.status() + " " + r.url().slice(0, 100)); });
    await p.goto(origin + path, { waitUntil: "load", timeout: 120000 });
    let ready = "n/a";
    if (path !== "/film") ready = await p.waitForFunction("window.__ready === true", { timeout: 25000 }).then(() => "ready", () => "NOT READY");
    await new Promise(r => setTimeout(r, path === "/film" ? 6000 : 1500));
    const st = await p.evaluate(() => window.Living ? window.Living.state.instances.map(i => i.name + (i.live ? "" : i.failed ? "(fallback)" : "(…)")).join(",") : (document.querySelector(".sw-root") ? "footage-film" : "none"));
    if (errs.length || ready === "NOT READY") bad++;
    console.log(path.padEnd(38), ready.padEnd(9), st.padEnd(40), errs.length ? "ERRORS: " + errs.join(" | ") : "0 errors");
    await p.close();
  }
  console.log(bad ? bad + " page(s) with problems" : "all pages clean");
  await b.close();
})();

const { launch } = require("./shot");
const { execFileSync } = require("child_process");
(async () => {
  const origin = process.argv[2]; const b = await launch(); const outs = [];
  for (const slug of ["night-chaos", "capstone"]) for (const t of [700, 2000, 3300, 7000]) {
    const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
    await p.goto(`${origin}/modules/${slug}?lpt=${t}`, { waitUntil: "load" });
    await p.waitForFunction("window.__ready === true", { timeout: 25000 });
    await new Promise(r => setTimeout(r, 800));
    const el = await p.$("[data-scene=plate]"); const o = `shots/plate-${slug}-${t}.png`;
    await el.screenshot({ path: o }); outs.push(o); await p.close();
  }
  await b.close();
  const inp = []; outs.forEach(o => inp.push("-i", o));
  let fc = outs.map((_, i) => `[${i}]scale=480:-2[s${i}]`).join(";") + ";[s0][s1][s2][s3]hstack=4[r0];[s4][s5][s6][s7]hstack=4[r1];[r0][r1]vstack";
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inp, "-filter_complex", fc, "-frames:v", "1", "shots/plate-sheet.jpg"]);
  console.log("ok");
})();

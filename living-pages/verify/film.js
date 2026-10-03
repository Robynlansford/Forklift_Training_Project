// Capture a pinned scroll film at several frozen progress points (?lp=) and tile them.
// Usage: node film.js <baseUrl> <outPrefix> <WxH> p1,p2,... [--lpt=2000]
const { launch, shoot } = require("./shot");
const { execFileSync } = require("child_process");

(async () => {
  const [base, prefix, size, list] = process.argv.slice(2);
  const lpt = (process.argv.find((a) => a.startsWith("--lpt=")) || "--lpt=2000").split("=")[1];
  const ps = list.split(",").map(Number);
  const browser = await launch();
  const outs = [];
  for (const p of ps) {
    const url = `${base}${base.includes("?") ? "&" : "?"}lp=${p}&lpt=${lpt}`;
    const out = `${prefix}-${String(Math.round(p * 1000)).padStart(4, "0")}.png`;
    const r = await shoot(browser, url, out, { size, wait: 900 });
    outs.push(out);
    const errs = r.errors.filter((e) => !/404/.test(e));
    console.log(p, r.ready ? "ready" : "NOT READY", r.state.loadout ? r.state.loadout.clock : "", errs.length ? errs : "");
  }
  await browser.close();
  // Contact sheet (3 columns) for a quick read of the whole film.
  const [w, h] = size.split("x").map(Number);
  const tw = 480,
    th = Math.round((tw * h) / w);
  const inputs = [];
  outs.forEach((o) => inputs.push("-i", o));
  const cols = 3;
  const rows = Math.ceil(outs.length / cols);
  let fc = outs.map((_, i) => `[${i}]scale=${tw}:${th}[s${i}]`).join(";");
  const cells = [];
  for (let i = 0; i < rows * cols; i++) cells.push(i < outs.length ? `[s${i}]` : null);
  // pad missing cells with black
  const pads = [];
  cells.forEach((c, i) => {
    if (!c) {
      pads.push(`color=c=black:s=${tw}x${th}[b${i}]`);
      cells[i] = `[b${i}]`;
    }
  });
  if (pads.length) fc += ";" + pads.join(";");
  const rowLabels = [];
  for (let r = 0; r < rows; r++) {
    fc += `;${cells.slice(r * cols, r * cols + cols).join("")}hstack=${cols}[r${r}]`;
    rowLabels.push(`[r${r}]`);
  }
  if (rows > 1) fc += `;${rowLabels.join("")}vstack=${rows}`;
  else fc = fc.replace(/\[r0\]$/, "");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inputs, "-filter_complex", fc, "-frames:v", "1", `${prefix}-sheet.jpg`]);
  console.log("sheet:", `${prefix}-sheet.jpg`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

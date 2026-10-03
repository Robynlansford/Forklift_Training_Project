const { launch } = require("./shot");
(async () => {
  const b = await launch(); const p = await b.newPage(); await p.setViewport({width:320,height:800,isMobile:true,hasTouch:true});
  await p.goto(process.argv[2] + "/simulator", {waitUntil:"load"});
  await new Promise(r=>setTimeout(r,3000));
  console.log(await p.evaluate(() => {
    const de = document.documentElement; const out = [];
    for (const el of document.querySelectorAll("main *")) { const r = el.getBoundingClientRect(); if (r.right > de.clientWidth + 0.5 && r.width>0) out.push(el.tagName.toLowerCase()+"."+String(el.className).slice(0,70)+" right="+Math.round(r.right)+" w="+Math.round(r.width)); }
    return "sw="+de.scrollWidth+" cw="+de.clientWidth+"\n"+out.slice(0,12).join("\n");
  }));
  await b.close();
})();

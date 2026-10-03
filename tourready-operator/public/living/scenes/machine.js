/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "machine" · the Safety Engine's data hero
   The telehandler posed live from the simulator's own inputs:
     boom angle + reach  → boom pitch and extension (schematic, not to scale)
     load weight         → the case on the forks
     ground surface      → the deck under the wheels (mud sits the machine down)
     wind speed          → air streaks at true ft/s (mph × 1.467); ≥ limit turns them red
     rigging zone        → a shackle dropping on the load until the zone is clear
     pushers / halo      → crew figures, inside or outside the 3-ft halo
     fatigue window      → tunnel vision (the site's own words) as a tighter vignette
     verdict             → the light under the machine, in the app's status colours
   data comes from components/safety-engine-form.tsx on every change.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};
  var PI = Math.PI;
  var G_CH = 0, G_BOOM = 1, G_TELE = 2, G_CAR = 3, G_LOAD = 4, G_HALO = 5, G_CREW = 6, G_DIM = 7;

  var WIND_VS =
    "#version 300 es\nlayout(location=0) in vec2 aC; layout(location=1) in vec4 aS;\n" +
    "uniform mat4 uVP; uniform vec2 uRes; uniform float uPx; uniform vec3 uMin; uniform vec3 uSize; uniform float uDist; uniform float uSpeed;\n" +
    "out float vA; out float vS;\n" +
    "void main(){ float x = fract(aS.x + uDist*(0.85+aS.w*0.3)/uSize.x);\n" +
    " vec3 p = uMin + vec3(x, aS.y, aS.z)*uSize; float len = 0.8 + uSpeed*0.09*(0.6+aS.w);\n" +
    " vec3 q = p - vec3(len,0.0,0.0);\n" +
    " vec4 ca = uVP*vec4(p,1.0); vec4 cb = uVP*vec4(q,1.0);\n" +
    " if(ca.w<0.1||cb.w<0.1){ gl_Position=vec4(2.0,2.0,2.0,1.0); vA=0.0; vS=0.0; return; }\n" +
    " vec2 sa=ca.xy/ca.w, sb=cb.xy/cb.w; vec2 d=(sb-sa)*uRes; float dl=length(d); vec2 dir= dl>1e-4? d/dl: vec2(1.0,0.0); vec2 n=vec2(-dir.y,dir.x);\n" +
    " vec4 c = mix(ca,cb,aC.x); c.xy += n*aC.y*(max(1.0*uPx,1.0)/uRes)*c.w; gl_Position = c;\n" +
    " vA = (0.3+aS.w*0.7)*smoothstep(0.0,0.1,x)*(1.0-smoothstep(0.9,1.0,x))*mix(1.0,0.0,aC.x); vS = aC.y; }";
  var WIND_FS =
    "#version 300 es\nprecision highp float; in float vA; in float vS; uniform vec3 uC; out vec4 o;\n" +
    "void main(){ float a = 1.0-smoothstep(0.2,1.0,abs(vS)); o = vec4(uC*vA*a,0.0); }";

  var GROUND = {
    CONCRETE: { grid: [4, 0.05], wet: 0.25, sink: 0, tint: "--color-muted", tk: 0.02 },
    ASPHALT: { grid: [4, 0.012], wet: 0.4, sink: 0, tint: "--color-muted", tk: 0.012 },
    GRAVEL: { grid: [1.5, 0.02], wet: 0.9, sink: 0, tint: "--color-muted", tk: 0.02 },
    FESTIVAL_MUD: { grid: [4, 0.0], wet: 1.0, sink: 0.35, tint: "--color-accent", tk: 0.03 },
    STAGE_DECK: { grid: [2, 0.07], wet: 0.2, sink: 0, tint: "--color-accent", tk: 0.015 },
    GRASS: { grid: [4, 0.0], wet: 0.6, sink: 0.1, tint: "--color-go", tk: 0.02 },
    DYNAMIC_TRUSS: { grid: [2, 0.06], wet: 0.2, sink: 0, tint: "--color-coolbeam", tk: 0.015 },
    LED_WALL: { grid: [1, 0.09], wet: 0.2, sink: 0, tint: "--color-coolbeam", tk: 0.02 },
  };
  var VERDICT = { GO: "--color-go", CAUTION: "--color-caution", HARD_STOP: "--color-hardstop", BLOCKER: "--color-blocker" };

  L.scenes.machine = {
    init: function (gl, canvas, opts) {
      var K = L.kit,
        lin = L.lin,
        G = L.gl;
      this.gl = gl;
      this.opts = opts;
      opts.post.alphaMode = 1;
      opts.post.bloom = 0.9;
      opts.post.vignette = 0.2;
      this.data = opts.data || {};
      var pen = new G.Pen();
      K.telehandler(pen, { chassis: G_CH, boom: G_BOOM, tele: G_TELE, carriage: G_CAR }, lin("--color-accent", 1.45), lin("--color-accent", 1.9), lin("--color-accent", 0.5));
      pen.group(G_LOAD).width(1.5);
      K.roadCase(pen, [0, -0.75, 2.9], [4, 3.6, 2.6], 0, lin("--color-muted", 0.6), lin("--color-muted", 0.3), true);
      // 3-ft halo around the machine's rear (radius from the rear axle area)
      pen.group(G_HALO).color([1, 1, 1]).width(1.5);
      for (var i = 0; i < 48; i += 2) {
        var a0 = (i / 48) * PI * 2,
          a1 = ((i + 1) / 48) * PI * 2;
        pen.seg([Math.cos(a0) * 7.4, 0.06, -5 + Math.sin(a0) * 7.4], [Math.cos(a1) * 7.4, 0.06, -5 + Math.sin(a1) * 7.4]);
      }
      // crew (up to 10 figures, shown by count)
      this.crewSpots = [];
      for (var c = 0; c < 10; c++) {
        var ang = PI * 0.62 + c * 0.47;
        this.crewSpots.push([Math.cos(ang) * 10.5, -5 + Math.sin(ang) * 10.5, ang]);
      }
      this.crewCount = 10;
      for (var k = 0; k < 10; k++) {
        pen.group(8 + k);
        K.person(pen, [0, 0, 0], 0, k % 3 === 0 ? "push" : "stand", lin("--color-coolbeam", 1.2));
      }
      // reach dimension on the ground (group G_DIM, transform set per frame)
      pen.group(G_DIM).color(lin("--color-amber", 1.2)).width(1.4);
      pen.seg([0, 0.08, 0], [1, 0.08, 0]).seg([0, 0.08, -0.6], [0, 0.08, 0.6]).seg([1, 0.08, -0.6], [1, 0.08, 0.6]);
      this.lines = G.lines(gl, pen.segs);
      this.floor = K.Floor(gl, [-90, -60, 180, 140]);
      this.glows = K.Glows(gl, 16);
      this.beams = K.Beams(gl);
      // wind streaks (blue = the air; red once at/above the limit)
      this.wind = G.program(gl, WIND_VS, WIND_FS);
      var n = Math.round(700 * opts.quality);
      var d = new Float32Array(n * 4);
      for (var j = 0; j < n * 4; j++) d[j] = L.math.hash(j * 2.71 + 5.3);
      this.windN = n;
      this.windBufs = [G.buffer(gl, new Float32Array([0, -1, 1, -1, 0, 1, 1, 1])), G.buffer(gl, d)];
      this.windVao = G.vao(gl, [
        { loc: 0, buf: this.windBufs[0], size: 2 },
        { loc: 1, buf: this.windBufs[1], size: 4, divisor: 1 },
      ]);
      this.windT = 0;
      this.dropT = 0;
      this.smooth = null;
      var host = opts.el.querySelector(".lp-labels");
      this.labels = {};
      var self = this;
      ["load", "angle", "reach", "wind"].forEach(function (k2) {
        if (!host) return;
        var e = document.createElement("span");
        e.className = "lp-label " + (k2 === "wind" ? "" : "lp-label--amber");
        host.appendChild(e);
        self.labels[k2] = e;
      });
    },
    onData: function (d) {
      this.data = d || {};
    },
    resize: function (w, h, px) {
      this.w = w;
      this.h = h;
      this.px = px;
    },
    frame: function (t, p, dt) {
      var gl = this.gl,
        M4 = L.M4,
        lin = L.lin,
        S = L.math.smooth,
        G = L.gl;
      var d = this.data || {};
      // Ease every numeric input so a preset click animates instead of snapping.
      var target = {
        boom: L.math.clamp(d.boom == null ? 45 : d.boom, 0, 85),
        reach: L.math.clamp(d.reach == null ? 6 : d.reach, 0, 40),
        load: Math.max(0, d.load || 0),
        wind: Math.max(0, d.wind || 0),
      };
      if (!this.smooth) this.smooth = Object.assign({}, target);
      var k = dt === 0 ? 1 : 1 - Math.exp(-dt * 5);
      for (var key in target) this.smooth[key] += (target[key] - this.smooth[key]) * k;
      var sm = this.smooth;
      var ground = GROUND[d.ground] || GROUND.CONCRETE;
      var a = (sm.boom * PI) / 180;
      var H = sm.reach + 8.8;
      var len = L.math.clamp(H / Math.max(Math.cos(a), 0.05), 20.6, 58);
      var ext = len - 20.6;
      var sink = ground.sink;
      var chassis = M4.trs(0, -sink, 0, 0, sink ? 0.025 : 0);
      var lines = this.lines;
      lines.mat(G_CH, chassis);
      var boomM = M4.mul(chassis, M4.trs(0, 3.4, -4.2, 0, -a));
      lines.mat(G_BOOM, boomM);
      lines.mat(G_TELE, M4.mul(boomM, M4.trs(0, 0, ext)));
      var tip = M4.xform(boomM, [0, 0, 20.6 + ext]);
      var carM = M4.trs(tip[0], tip[1], tip[2], 0, 0);
      lines.mat(G_CAR, carM);
      var ls = 0.75 + Math.min(0.6, sm.load / 16000);
      lines.mat(G_LOAD, M4.mul(carM, M4.trs(0, 0, 0, 0, 0, ls)));
      lines.param(G_LOAD, 1, sm.load > 0 ? 1 : 0, 1);
      // Verdict light
      var vcol = lin(VERDICT[d.status] || "--color-go", 1);
      // Halo + crew
      var pushers = Math.max(0, Math.min(10, Math.round(d.pushers || 0)));
      var cleared = d.pushersClear !== false;
      lines.param(G_HALO, 1, pushers > 0 ? 1 : 0.35, 1);
      lines.tint(G_HALO, pushers > 0 && !cleared ? lin("--color-hardstop", 1.6) : lin("--color-coolbeam", 1.1));
      for (var c = 0; c < 10; c++) {
        var on = c < pushers;
        var sp = this.crewSpots[c];
        var inside = !cleared && c === 0;
        var r = inside ? 4.2 : 10.5;
        var ang = inside ? PI * 1.5 : sp[2];
        lines.mat(8 + c, M4.trs(Math.cos(ang) * r, 0, -5 + Math.sin(ang) * r, ang + PI / 2, 0, 1));
        lines.param(8 + c, 1, on ? 1 : 0, 1);
      }
      // reach dimension: from the chassis front to under the tip
      var front = 4.6;
      var reachLen = Math.max(0.01, tip[2] - front);
      lines.mat(G_DIM, [0, 0, reachLen, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1.6, 0, front, 1]);
      lines.param(G_DIM, 1, 1, 1);
      // Camera: side three-quarter, framing chassis → tip
      var aspect = this.w / this.h;
      var wide = aspect > 1.25;
      // Fit chassis (z ≈ -9) → tip, ground → tip height, inside the frame both ways.
      var fov = 0.7;
      var needH = Math.max(tip[1] + 9, 20);
      var needW = Math.max(tip[2] + 16, 30);
      var tanV = Math.tan(fov / 2),
        tanH = tanV * aspect;
      var dist = Math.max(needH / (2 * tanV), needW / (2 * tanH) / (wide ? 0.7 : 1)) * (wide ? 1.12 : 1.38);
      var midZ = (tip[2] - 9) / 2,
        midY = needH * 0.45;
      var orbit = Math.sin(t * 0.12) * 0.12 - 0.35;
      var eye = [-Math.cos(orbit) * dist, midY + dist * 0.18, midZ + Math.sin(orbit) * dist * 0.6];
      var tgt = [0, midY, midZ];
      var proj = M4.persp(fov, aspect, 0.5, 900);
      if (wide) proj[8] += -0.38;
      else {
        proj[8] += 0.14;
        proj[9] += 0.05;
      }
      var vp = M4.mul(proj, M4.lookAt(eye, tgt, [0, 1, 0]));
      this.vp = vp;
      var cam = { vp: vp, eye: eye, w: this.w, h: this.h, px: this.px };
      var fog = [0.004, 40];
      // Floor per ground surface
      var F = this.floor;
      F.grid = ground.grid;
      F.wet = ground.wet;
      F.gridC = lin(ground.tint, 1);
      F.base = lin(ground.tint, ground.tk);
      F.n = 0;
      F.spot(0, 0, 0, 13, 0.5, vcol);
      F.spot(1, 0, tip[2], 7, 0.18, lin("--color-accent", 1));
      F.draw(cam, fog, t);
      lines.draw(cam, fog, true, 0.14, t);
      // key light: a soft cone over the machine in the verdict colour
      this.beams.draw(cam, [{ apex: [0, 40, -2], dir: [0, -1, 0], len: 42, radius: 16, color: [vcol[0] * 0.035, vcol[1] * 0.035, vcol[2] * 0.035] }], fog);
      lines.draw(cam, fog, false, 1, t);
      // Wind streaks at true speed (mph → ft/s)
      var limit = d.limit || 15;
      var fps = sm.wind * 1.467;
      this.windT += (dt || 0) * fps;
      if (sm.wind > 0.3) {
        var wc = d.wind >= limit ? lin("--color-hardstop", 0.9) : lin("--color-coolbeam", 0.45);
        var wk = Math.min(1, sm.wind / 12);
        gl.useProgram(this.wind.prog);
        var u = this.wind.u;
        gl.uniformMatrix4fv(u.uVP, false, vp);
        gl.uniform2f(u.uRes, this.w, this.h);
        gl.uniform1f(u.uPx, this.px);
        gl.uniform3fv(u.uMin, [-10, 1, -30]);
        gl.uniform3fv(u.uSize, [20, Math.max(30, tip[1] + 12), 90]);
        gl.uniform1f(u.uDist, dt === 0 ? t * fps : this.windT);
        gl.uniform1f(u.uSpeed, fps);
        gl.uniform3fv(u.uC, [wc[0] * wk, wc[1] * wk, wc[2] * wk]);
        gl.bindVertexArray(this.windVao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.windN);
        gl.bindVertexArray(null);
      }
      // Glows: boom tip, verdict pip, falling shackle when the rigging zone is live
      var gw = this.glows;
      gw.reset();
      gw.add([tip[0], tip[1] + 0.4, tip[2]], lin("--color-accent", 2.4), 16);
      gw.add([0, 8.1, -0.6], [vcol[0] * 3, vcol[1] * 3, vcol[2] * 3], 18);
      if (d.riggingClear === false) {
        var Hd = 60,
          g = 32.2,
          T = Math.sqrt((2 * Hd) / g);
        this.dropT += dt || 0;
        var cyc = dt === 0 ? T * 0.8 : this.dropT % (T + 0.9);
        var tt = Math.min(cyc, T);
        var y = Hd - 0.5 * g * tt * tt,
          v = g * tt;
        for (var s = 0; s < 5; s++) gw.add([0, Math.max(0.2, y + s * v * 0.02), tip[2] + 1], lin("--color-hardstop", (s ? 1.2 : 4) / (1 + s)), s ? 9 : 14);
        if (cyc >= T) gw.add([0, 0.3, tip[2] + 1], lin("--color-hardstop", 4 * (1 - (cyc - T) / 0.9)), 40);
      }
      gw.draw(cam);
      // Tunnel vision when the fatigue window is open
      this.opts.post.vignette = d.fatigue ? 0.95 : 0.2;
      // Labels (inputs, exactly as entered)
      this.place("load", [tip[0], tip[1] + 4.8, tip[2] + 2], d.load > 0 ? 1 : 0, (d.load || 0).toLocaleString("en-US") + " lb");
      this.place("angle", [0, 5.2, -1.5], 1, Math.round(d.boom == null ? 45 : d.boom) + "°");
      this.place("reach", [1.6, 0.4, front + reachLen / 2], 1, Math.round(d.reach || 0) + " ft reach");
      this.place("wind", [-6, Math.max(24, tip[1] + 6), -10], sm.wind > 0.3 ? 1 : 0, Math.round(d.wind || 0) + " mph");
    },
    place: function (key, world, alpha, text) {
      var e = this.labels[key];
      if (!e) return;
      if (e.__t !== text) {
        e.textContent = text;
        e.__t = text;
      }
      var s = this.opts.project(world);
      if (!s || alpha < 0.01) {
        e.style.opacity = "0";
        return;
      }
      // keep every label fully inside the frame (half a label ≈ 3.2rem either side)
      var cw = this.w / this.px,
        ch = this.h / this.px;
      var x = Math.min(Math.max(s.x, 52), cw - 52),
        y = Math.min(Math.max(s.y, 16), ch - 16);
      e.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
      e.style.opacity = String(alpha);
    },
    dispose: function () {
      var gl = this.gl;
      this.lines.dispose();
      this.floor.dispose();
      this.glows.dispose();
      this.beams.dispose();
      gl.deleteProgram(this.wind.prog);
      this.windBufs.forEach(function (b) {
        gl.deleteBuffer(b);
      });
      gl.deleteVertexArray(this.windVao);
      for (var k in this.labels) this.labels[k].remove();
    },
  };
})();

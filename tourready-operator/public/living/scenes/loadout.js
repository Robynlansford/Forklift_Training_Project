/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "loadout" · the signature scroll film
   One machine, one night, 23:10 → 02:00, drawn as a trained operator sees it.
     23:10  wet ramp — the straight-on line up into the trailer mouth
     23:40  truck pack — forks to pockets: top-centre rib guide + level shadows
     00:25  ground crew — the tail swings; the 3-ft halo; Clear-and-Release
     01:05  rigging — stop at the edge, Up-Look, a 2 lb shackle from 60 ft
     02:00  the last case under one work light — STOP: all motion halts
   Schematic · not to scale. Every number shown comes from the site's own copy
   or from lib/safety-engine.ts (calcFallingObject) — see living-pages/PLAN.md.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};
  var PI = Math.PI;

  // Groups (see kit Pen.group): per-group transform + reveal/intensity per frame.
  var G_WORLD = 0, G_BODY = 1, G_LIFT = 2, G_CASE = 3, G_LINE = 4, G_MAST = 5, G_HALO = 6,
    G_CREW = 7, G_PUSH = 8, G_DROP = 9, G_STOP = 11, G_LAST = 12, G_RIG = 13, G_GRID = 14,
    G_YARD = 16, G_ARENA = 17, G_CASEG = 18, G_TRAILER = 19, G_LED = 20;

  var RAMP_FOOT = -24, RAMP_TOP = -40, DECK = 4;
  function rampY(z) {
    if (z >= RAMP_FOOT) return 0;
    if (z <= RAMP_TOP) return DECK;
    return ((RAMP_FOOT - z) / (RAMP_FOOT - RAMP_TOP)) * DECK;
  }

  /* Choreography — pure functions of scroll progress p (so scrubbing back works). */
  var T = L.math.track;
  var KX = [[0, 0], [0.64, 0], [0.7, -58], [0.82, -58], [0.89, -108], [1, -108]];
  var KZ = [[0, 14], [0.1, -14.5], [0.2, -14.5], [0.3, -66], [0.36, -71.25], [0.41, -71.25], [0.47, -12], [0.64, -12], [0.7, -8], [0.82, -8], [0.89, -6], [1, -6]];
  var KYAW = [[0, PI], [0.48, PI], [0.53, PI * 1.5], [1, PI * 1.5]];
  var KLIFT = [[0, 0.45], [0.29, 0.45], [0.31, 0.6], [0.37, 0.6], [0.4, 1.1], [0.53, 1.1], [0.555, 0.6], [0.565, 0.45], [1, 0.45]];

  var CAM = [
    [0.0, [-30, 15, 44], [2, 5, -8], 40],
    [0.08, [-22, 9, 22], [1, 4, -18], 42],
    [0.16, [-17, 6.5, -3], [0, 2.8, -27], 46],
    [0.23, [-13, 8, -12], [0, 4.5, -38], 46],
    [0.3, [-8, 9.5, -52], [0, 5.5, -72], 46],
    [0.36, [13.5, 7.2, -71.8], [0, 4.9, -74.4], 44],
    [0.41, [13.2, 7.8, -69.5], [0, 5.2, -73.8], 44],
    [0.47, [17, 17, -2], [0, 2, -16], 46],
    [0.55, [15, 31, 9], [-1.5, 0, -13], 46],
    [0.62, [9, 24, 9], [-6, 1, -11], 46],
    [0.665, [-4, 10, 18], [-24, 3, -9], 46],
    [0.715, [-45, 4.5, 15], [-72, 38, -6], 54],
    [0.75, [-38, 21, 50], [-72, 29, -6], 60],
    [0.8, [-41, 15, 42], [-72, 17, -6], 54],
    [0.845, [-60, 9, 24], [-80, 3, -7], 46],
    [0.92, [-112, 7.2, 27], [-113.2, 4.2, -6], 44],
    [1.0, [-112.6, 6.6, 22.5], [-113.4, 4.4, -6], 42],
  ];
  function camAt(p) {
    var n = CAM.length;
    var i = 0;
    while (i < n - 2 && p > CAM[i + 1][0]) i++;
    var t = L.math.clamp((p - CAM[i][0]) / (CAM[i + 1][0] - CAM[i][0]), 0, 1);
    var u = (i + t) / (n - 1);
    return {
      eye: L.math.spline(CAM.map(function (k) { return k[1]; }), u),
      tgt: L.math.spline(CAM.map(function (k) { return k[2]; }), u),
      fov: L.math.lerp(CAM[i][3], CAM[i + 1][3], t * t * (3 - 2 * t)),
    };
  }

  function clockAt(p) {
    // 23:10 → 23:40 → 00:25 → 01:05 → 02:00, holding through each beat.
    var mins = T([[0, 1390], [0.24, 1390], [0.28, 1420], [0.44, 1420], [0.47, 1465], [0.63, 1465], [0.67, 1505], [0.81, 1505], [0.85, 1560], [1, 1560]], p, "linear");
    var m = Math.round(mins) % 1440;
    var hh = Math.floor(m / 60), mm = m % 60;
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }

  // Free fall from the site's own model: v = √(2gh), energy = w·h (lib/safety-engine.ts).
  var DROP_H = 60, DROP_W = 2, GRAV = 32.2;
  var T_FALL = Math.sqrt((2 * DROP_H) / GRAV);
  var V_MPH = Math.sqrt(2 * GRAV * DROP_H) * 0.681818;
  var E_FTLB = DROP_W * DROP_H;
  var DROP_P0 = 0.725, DROP_P1 = 0.765;
  var DROP_AT = [-74, -6];
  var WORK_DIR = (function () {
    var d = [-117.3 + 119.6, 1.8 - 15, -6 + 14.4], l = Math.hypot(d[0], d[1], d[2]);
    return [d[0] / l, d[1] / l, d[2] / l];
  })();

  L.scenes.loadout = {
    init: function (gl, canvas, opts) {
      var K = L.kit, M4 = L.M4, lin = L.lin;
      this.gl = gl;
      this.opts = opts;
      this.q = opts.quality;
      var C = (this.C = {
        orange: lin("--color-accent", 1.55),
        orangeHot: lin("--color-accent", 2.6),
        orangeDim: lin("--color-accent", 0.55),
        blue: lin("--color-coolbeam", 1.25),
        blueDim: lin("--color-coolbeam", 0.35),
        amber: lin("--color-amber", 1.9),
        red: lin("--color-hardstop", 2.4),
        steel: lin("--color-muted", 0.2),
        steelHi: lin("--color-muted", 0.42),
        steelLo: lin("--color-muted", 0.1),
        sodium: lin("--color-amber", 0.5),
      });
      this.clear = lin("--color-bg-deep", 0.35);

      var pen = new L.gl.Pen();
      /* ── Yard: three trailers, ramp, light poles, staging line ── */
      pen.group(G_TRAILER).width(1.3);
      [-14, 0, 14].forEach(function (cx, ti) {
        var x0 = cx - 4.1, x1 = cx + 4.1, zr = -40, zf = -88;
        pen.color(C.steelHi).box([x0, DECK, zf], [x1, 13.2, zr]);
        pen.color(C.steel);
        for (var z = zr - 4; z > zf; z -= 4) {
          pen.seg([x0, DECK, z], [x0, 13.2, z]).seg([x1, DECK, z], [x1, 13.2, z]).seg([x0, 13.2, z], [x1, 13.2, z]);
        }
        for (var y = 5.5; y < 13; y += 1.5) pen.seg([x0, y, zr], [x0, y, zf]).seg([x1, y, zr], [x1, y, zf]);
        // chassis + tandem axle
        pen.color(C.steelLo).seg([x0 + 1, DECK - 0.4, zr], [x0 + 1, DECK - 0.4, zf]).seg([x1 - 1, DECK - 0.4, zr], [x1 - 1, DECK - 0.4, zf]);
        [-45, -50].forEach(function (az) {
          pen.circle([x0 + 0.6, 1.6, az], 1.6, "x", 18).circle([x1 - 0.6, 1.6, az], 1.6, "x", 18);
        });
        // landing gear
        pen.seg([x0 + 1.2, 0, -80], [x0 + 1.2, DECK - 0.4, -80]).seg([x1 - 1.2, 0, -80], [x1 - 1.2, DECK - 0.4, -80]);
        if (ti !== 1) {
          // open doors swung flat against the sides
          pen.color(C.steel).poly([[x0, DECK + 0.2, zr], [x0 - 0.3, DECK + 0.2, zr + 4], [x0 - 0.3, 12.8, zr + 4], [x0, 12.8, zr]], false);
          pen.poly([[x1, DECK + 0.2, zr], [x1 + 0.3, DECK + 0.2, zr + 4], [x1 + 0.3, 12.8, zr + 4], [x1, 12.8, zr]], false);
        }
      });
      // Cases packed in the middle trailer (rows two-across)
      pen.group(G_TRAILER);
      [-78.6, -81.4, -84.2, -87].forEach(function (z) {
        [-2.05, 2.05].forEach(function (x) {
          K.roadCase(pen, [x, DECK, z], [3.9, 3.5, 2.6], 0, C.steelHi, C.steel, false);
        });
      });
      // Ramp (aluminium, ribbed) from the ground up to the deck
      pen.group(G_WORLD).color(C.steelHi).width(1.4);
      [-3.4, 3.4].forEach(function (x) {
        pen.seg([x, 0, RAMP_FOOT], [x, DECK, RAMP_TOP]);
      });
      pen.color(C.steel);
      for (var rz = RAMP_FOOT; rz >= RAMP_TOP; rz -= 0.8) pen.seg([-3.4, rampY(rz), rz], [3.4, rampY(rz), rz]);
      // Light poles (sodium) — world light, not a role colour
      pen.group(G_YARD).color(C.steel).width(1.2);
      this.poles = [[-26, 6], [28, -10], [-30, -62]];
      this.poles.forEach(function (q) {
        pen.seg([q[0], 0, q[1]], [q[0], 30, q[1]]).seg([q[0], 30, q[1]], [q[0] * 0.92, 30, q[1]]);
      });
      // Staging line of cases at the dock (hot-dog orientation)
      for (var sc = 0; sc < 5; sc++) K.roadCase(pen.group(G_WORLD), [-16, 0, -18 - sc * 3.4], [2.6, 3.4, 3.8], PI / 2, C.steelHi, C.steel, false);

      /* ── The target case (group G_CASE, local frame) + its guides ── */
      pen.group(G_CASE).width(1.5);
      K.roadCase(pen, [0, 0, 0], [4, 3.6, 2.6], 0, C.steelHi, C.steel, true);
      pen.group(G_CASEG).color(C.amber).width(1.7);
      pen.order(0.05).seg([0, 3.6 + 1.6, 1.3], [0, 3.6, 1.3]);
      pen.order(0.4).seg([0, 3.6, 1.3], [0, 0.9, 1.3]);
      pen.order(0.7).seg([-0.35, 3.6, 1.3], [0.35, 3.6, 1.3]);
      // level-fork shadows: two equal, parallel bars above the pockets
      pen.order(0.85).seg([-1.17, 1.17, 1.32], [-0.83, 1.17, 1.32]).seg([0.83, 1.17, 1.32], [1.17, 1.17, 1.32]);
      pen.order(0.95).seg([-1.17, 1.24, 1.32], [-0.83, 1.24, 1.32]).seg([0.83, 1.24, 1.32], [1.17, 1.24, 1.32]);

      /* ── The machine ── */
      var fk = K.forklift(pen, G_BODY, G_LIFT, C.orange, C.orangeHot, C.orangeDim);
      this.fk = fk;
      pen.group(G_MAST).color(C.amber).width(1.5);
      pen.dashed([0, 0.5, 0.8], [0, 8.4, 0.8], 0.45, 0.3);

      /* ── 23:10 approach line: straight-on, up the ramp, into the trailer ── */
      pen.group(G_LINE).color(C.amber).width(1.8);
      var line = [];
      for (var lz = -19.5; lz >= -72; lz -= 1.1) line.push([0, rampY(lz) + 0.06, lz]);
      for (var li = 0; li < line.length - 1; li += 2) {
        pen.order(li / line.length).seg(line[li], line[li + 1]);
      }
      pen.color(lin("--color-amber", 0.55)).width(1.2);
      [-1.55, 1.55].forEach(function (x) {
        pen.polyReveal(line.map(function (q) { return [x, q[1], q[2]]; }), 0, 1);
      });

      /* ── 00:25 halo: swept tail arc + 3-ft boundary beyond it ── */
      var pv = [0, -12];
      var tail = Math.hypot(1.75, 5.45);
      pen.group(G_HALO).color(C.orange).width(1.8);
      var arc = [];
      for (var a = 0; a <= 32; a++) {
        // rear corner sweeps from behind (+z) round to the right (+x) on a left turn
        var th = -0.31 + (a / 32) * (PI / 2 + 0.62);
        arc.push([pv[0] + Math.sin(th) * tail, 0.08, pv[1] + Math.cos(th) * tail]);
      }
      pen.polyReveal(arc, 0, 0.5);
      pen.color(C.blue).width(1.5);
      var R = tail + 3;
      for (var d = 0; d < 48; d++) {
        if (d % 2) continue;
        var a0 = (d / 48) * PI * 2, a1 = ((d + 1) / 48) * PI * 2;
        pen.order(0.5 + (d / 48) * 0.5).seg([pv[0] + Math.cos(a0) * R, 0.08, pv[1] + Math.sin(a0) * R], [pv[0] + Math.cos(a1) * R, 0.08, pv[1] + Math.sin(a1) * R]);
      }
      this.haloLabelAt = [pv[0] + tail + 1.5, 0.1, pv[1] + 1.5];

      /* ── Crew (people = blue) ── */
      pen.group(G_CREW).order(0).width(1.4);
      [[11, -19, -2.4, "stand"], [10, -2, -2.0, "stand"], [-10.5, -21, 0.8, "stand"], [-11, -4, 1.9, "armUp"]].forEach(function (c) {
        K.person(pen, [c[0], 0, c[1]], c[2], c[3], C.blue);
      });
      pen.group(G_PUSH);
      K.person(pen, [0, 0, 0], 0, "push", C.blue);

      /* ── Arena: rigging grid at 60 ft, fixtures, LED wall, line arrays ── */
      pen.group(G_GRID).width(1.3);
      var gx = [-104, -74, -44], gz = [-30, -6, 18];
      gz.forEach(function (z) { K.truss(pen, [-104, DROP_H, z], [-44, DROP_H, z], 1.7, C.steelHi, C.steel); });
      gx.forEach(function (x) { K.truss(pen, [x, DROP_H, -30], [x, DROP_H, 18], 1.7, C.steelHi, C.steel); });
      pen.group(G_ARENA).color(C.steelLo).width(1.1);
      // chain motors / drops
      gx.forEach(function (x) { gz.forEach(function (z) { pen.seg([x, DROP_H, z], [x, 78, z]); }); });
      // walls as faint verticals + floor outline
      for (var wx = -150; wx <= -30; wx += 12) {
        pen.seg([wx, 0, -55], [wx, 70, -55]);
        pen.seg([wx, 0, 40], [wx, 70, 40]);
      }
      pen.poly([[-150, 0, -55], [-30, 0, -55], [-30, 0, 40], [-150, 0, 40]], true);
      pen.group(G_LED).color(C.blueDim).width(1.1);
      for (var ly = 8; ly <= 32; ly += 2) pen.seg([-148, ly, -22], [-148, ly, 22]);
      for (var lzz = -22; lzz <= 22; lzz += 2) pen.seg([-148, 8, lzz], [-148, 32, lzz]);
      pen.color(C.steel);
      [-27, 27].forEach(function (z) {
        for (var k = 0; k < 12; k++) {
          var y0 = 34 - k * 1.7, bend = k * k * 0.018;
          pen.box([-146.8 + bend, y0 - 1.5, z - 1.4], [-144.6 + bend, y0, z + 1.4]);
        }
      });
      // Riggers on the grid
      pen.group(G_RIG).width(1.3);
      K.person(pen, [-80, DROP_H + 0.85, -6], 1.2, "stand", C.blue);
      K.person(pen, [-68, DROP_H + 0.85, -30], -0.6, "armUp", C.blue);
      // Drop zone + height ruler
      pen.group(G_DROP).color(C.blue).width(1.5);
      var dz = 9;
      for (var q = 0; q < 40; q++) {
        if (q % 2) continue;
        var b0 = (q / 40) * PI * 2, b1 = ((q + 1) / 40) * PI * 2;
        pen.order(q / 80).seg([DROP_AT[0] + Math.cos(b0) * dz, 0.08, DROP_AT[1] + Math.sin(b0) * dz], [DROP_AT[0] + Math.cos(b1) * dz, 0.08, DROP_AT[1] + Math.sin(b1) * dz]);
      }
      pen.order(0.5).seg([DROP_AT[0] - 2, 0.08, DROP_AT[1]], [DROP_AT[0] + 2, 0.08, DROP_AT[1]]).seg([DROP_AT[0], 0.08, DROP_AT[1] - 2], [DROP_AT[0], 0.08, DROP_AT[1] + 2]);
      var ruler = [-62, -20];
      pen.color(lin("--color-coolbeam", 0.8)).width(1.3);
      pen.polyReveal([[ruler[0], 0, ruler[1]], [ruler[0], DROP_H, ruler[1]]], 0.5, 1.0);
      for (var ft = 10; ft <= DROP_H; ft += 10) pen.order(0.5 + (ft / DROP_H) * 0.5).seg([ruler[0] - 1.2, ft, ruler[1]], [ruler[0] + 1.2, ft, ruler[1]]);
      this.rulerTop = [ruler[0], DROP_H, ruler[1]];

      /* ── 02:00: the last case, one work light, STOP ── */
      pen.group(G_LAST).width(1.6);
      var lit = L.math.mix(lin("--color-amber", 0.7), lin("--color-text", 0.7), 0.5);
      K.roadCase(pen, [-117.3, 0, -6], [4, 3.6, 2.6], PI / 2, lit, L.math.mix(lit, C.steel, 0.5), true);
      pen.color(C.steel);
      pen.seg([-121, 0, -16], [-121, 15, -16]).seg([-121, 15, -16], [-119.6, 15, -14.4]);
      [[-122.5, -17], [-119.5, -17], [-121, -14.5]].forEach(function (f) { pen.seg([f[0], 0, f[1]], [-121, 4, -16]); });
      pen.group(G_STOP).color(C.red).width(2.2);
      // Faces the closing side-on camera (+z), between the fork tips and the last case.
      var sc0 = [-114.6, 10.2, -6], right = [1, 0, 0], up = [0, 1, 0];
      K.octagon(pen, sc0, right, up, 2.4);
      pen.width(1.3);
      K.octagon(pen, sc0, right, up, 2.08);
      pen.width(2.0);
      var th = 1.15, tw = th * 0.72 * 1.22 * 3 + th * 0.72;
      K.text(pen, "STOP", [sc0[0] - right[0] * tw * 0.5, sc0[1] - th * 0.5, sc0[2] - right[2] * tw * 0.5], right, up, th);
      this.stopCentre = sc0;

      this.lines = L.gl.lines(gl, pen.segs);
      this.segCount = pen.segs.length;

      /* ── Passes ── */
      this.floor = K.Floor(gl, [-200, -140, 280, 220]);
      this.floor.gridC = lin("--color-accent", 1);
      this.floor.grid = [4, 0.035];
      this.beams = K.Beams(gl);
      var q = this.q;
      this.rain = K.Rain(gl, Math.round(1700 * q), [-34, 0, -70], [70, 42, 110]);
      this.hazeYard = K.Motes(gl, Math.round(900 * q), [-30, 0, -80], [64, 30, 100], 3);
      this.hazeArena = K.Motes(gl, Math.round(2600 * q), [-150, 0, -50], [120, 64, 90], 7);
      this.hazeArena.base = lin("--color-coolbeam", 0.018);
      this.hazeYard.base = lin("--color-coolbeam", 0.012);
      this.glows = K.Glows(gl, 64);
      this.sky = this.makeSky(gl);

      /* ── DOM labels + clock ── */
      var host = opts.el.querySelector(".lp-labels");
      this.labels = {};
      var self = this;
      function label(key, text, cls) {
        if (!host) return;
        var d = document.createElement("span");
        d.className = "lp-label " + (cls || "");
        d.textContent = text;
        host.appendChild(d);
        self.labels[key] = d;
      }
      label("halo", "3 ft", "lp-label--blue");
      label("h60", "60 ft", "lp-label--blue");
      label("impact", Math.round(V_MPH) + " mph · " + Math.round(E_FTLB) + " ft·lb", "lp-label--amber");
      this.clockEl = opts.el.querySelector("[data-lp-clock]");
      this.lastClock = "";
      this.motionT = 0;
    },

    makeSky: function (gl) {
      var G = L.gl;
      var prog = G.program(
        gl,
        G.QUAD_VS,
        "#version 300 es\nprecision highp float; in vec2 vUv; uniform vec3 uTop; uniform vec3 uHor; uniform float uH; out vec4 o;\n" +
          "void main(){ float d = vUv.y-uH; vec3 c = mix(uHor, uTop, smoothstep(-0.05, 0.55, d)); c += uHor*exp(-abs(d)*16.0)*0.6; o = vec4(c,0.0); }"
      );
      var buf = G.buffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
      var vao = G.vao(gl, [{ loc: 0, buf: buf, size: 2 }]);
      return {
        draw: function (top, hor, h) {
          gl.useProgram(prog.prog);
          gl.uniform3fv(prog.u.uTop, top);
          gl.uniform3fv(prog.u.uHor, hor);
          gl.uniform1f(prog.u.uH, h);
          gl.bindVertexArray(vao);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          gl.bindVertexArray(null);
        },
        dispose: function () {
          gl.deleteProgram(prog.prog);
          gl.deleteBuffer(buf);
          gl.deleteVertexArray(vao);
        },
      };
    },

    resize: function (w, h, px) {
      this.w = w;
      this.h = h;
      this.px = px;
    },

    frame: function (t, p, dt) {
      var gl = this.gl, K = L.kit, M4 = L.M4, C = this.C, S = L.math.smooth, lin = L.lin;
      var lines = this.lines;

      // "All motion halts": ambient time slows to a stop as STOP is called at 02:00.
      var motion = 1 - S(0.88, 0.95, p);
      this.motionT += dt * motion;
      // Ambient clock (rain, haze, beacon). Frozen-clock captures (dt = 0) stay deterministic.
      var mt = dt === 0 ? t * motion : this.motionT;

      /* Machine state */
      var mx = T(KX, p), mz = T(KZ, p), yaw = T(KYAW, p), lift = T(KLIFT, p);
      // Pitch on the ramp: front axle vs rear axle heights (facing -z while on the ramp)
      var my = rampY(mz), pitch = 0;
      if (mx > -1) {
        var zr = mz + 4.45; // rear axle, behind the front one
        pitch = -Math.atan2(rampY(mz) - rampY(zr), 4.45);
        my = rampY(mz);
      }
      var bodyM = M4.trs(mx, my, mz, yaw, pitch);
      lines.mat(G_BODY, bodyM);
      lines.mat(G_LIFT, M4.mul(bodyM, M4.trs(0, lift - 0.45, 0)));
      lines.mat(G_MAST, bodyM);

      /* The case: static in the trailer, on the forks from pickup to hand-off, then pushed away */
      var caseM;
      if (p < 0.37) caseM = M4.trs(0, DECK, -75.3, 0);
      else if (p < 0.565) caseM = M4.mul(bodyM, M4.trs(0, Math.max(lift - 0.6, 0), 4.05, PI));
      else {
        var rel = M4.mul(M4.trs(0, 0, -12, PI * 1.5), M4.trs(0, 0, 4.05, PI));
        var pull = T([[0.62, 0], [0.665, 1]], p);
        caseM = M4.mul(M4.trs(0, 0, pull * 11, 0), rel);
      }
      lines.mat(G_CASE, caseM);
      lines.mat(G_CASEG, caseM);
      // pusher walks in after the pause, then pulls the case away from the mast
      var walk = T([[0.585, 0], [0.62, 1]], p);
      var pz = T([[0.62, 0], [0.665, 11]], p);
      var pusherM = M4.trs(L.math.lerp(-9, -4.05, walk), 0, L.math.lerp(-2, -9.3, walk) + pz, L.math.lerp(2.6, PI, walk));
      lines.mat(G_PUSH, pusherM);

      /* Group reveals + intensities by beat */
      var outdoor = 1 - S(0.62, 0.7, p);
      var late = S(0.86, 0.93, p); // 02:00 — everything but one light goes dark
      lines.param(G_WORLD, 1, (0.55 + 0.45 * outdoor) * (1 - 0.7 * late), 1);
      lines.param(G_TRAILER, 1, (0.8 + 0.5 * S(0.18, 0.28, p) * (1 - S(0.45, 0.52, p)) - 0.3 * S(0.5, 0.62, p)) * (1 - 0.85 * late), 1);
      lines.param(G_YARD, 1, outdoor, 1);
      lines.param(G_ARENA, 1, 0.3 + 0.7 * S(0.6, 0.7, p) * (1 - 0.8 * late), 1);
      lines.param(G_GRID, 1, (0.45 + 0.9 * S(0.66, 0.74, p)) * (1 - 0.8 * late), 1);
      lines.param(G_LED, 1, 0.7 * (1 - 0.7 * late), 1);
      lines.param(G_RIG, 1, S(0.68, 0.74, p) * (1 - late), 1);
      lines.param(G_BODY, 1, 1, 1);
      lines.param(G_LIFT, 1, 1, 1);
      lines.param(G_CASE, 1, 1 + 0.6 * S(0.29, 0.34, p) * (1 - S(0.62, 0.7, p)), 1);
      var lineOn = S(0.09, 0.2, p) * (1 - S(0.34, 0.42, p));
      lines.param(G_LINE, S(0.1, 0.18, p), lineOn, 1);
      lines.param(G_MAST, 1, S(0.29, 0.33, p) * (1 - S(0.4, 0.43, p)), 1);
      lines.param(G_CASEG, S(0.29, 0.37, p), 1 - S(0.4, 0.43, p), 1);
      var haloOn = S(0.46, 0.49, p) * (1 - S(0.62, 0.66, p));
      lines.param(G_HALO, S(0.47, 0.53, p), haloOn, 1);
      lines.param(G_CREW, 1, S(0.44, 0.48, p) * (1 - S(0.64, 0.69, p)), 1);
      lines.param(G_PUSH, 1, S(0.56, 0.59, p) * (1 - S(0.67, 0.7, p)), 1);
      var dropOn = S(0.68, 0.72, p) * (1 - S(0.81, 0.85, p));
      lines.param(G_DROP, S(0.69, 0.76, p), dropOn * (1 + 0.8 * S(0.765, 0.775, p) * (1 - S(0.79, 0.81, p))), 1);
      lines.param(G_LAST, 1, 0.35 + 1.1 * S(0.82, 0.9, p), 1);
      lines.param(G_STOP, S(0.9, 0.955, p), S(0.9, 0.93, p), 1);

      /* Camera (lens-shifted so the action clears the text column) */
      var cam = camAt(p);
      var aspect = this.w / this.h;
      var fov = cam.fov * (aspect < 1 ? 1.32 : 1);
      var proj = M4.persp((fov * PI) / 180, aspect, 0.5, 900);
      var desktop = aspect >= 1.15;
      proj[8] += desktop ? -0.26 : 0;
      proj[9] += desktop ? 0 : -0.3 - 0.16 * S(0.84, 0.92, p);
      var view = M4.lookAt(cam.eye, cam.tgt, [0, 1, 0]);
      var vp = M4.mul(proj, view);
      this.vp = vp;
      var c = { vp: vp, eye: cam.eye, w: this.w, h: this.h, px: this.px };
      var fog = [0.0052, 24];

      /* Lights for this frame (beams also light the haze + floor pools) */
      var beams = [];
      var sod = lin("--color-amber", 0.07 * outdoor * (1 - late));
      this.poles.forEach(function (q) {
        beams.push({ apex: [q[0] * 0.95, 29.6, q[1]], dir: [0, -1, 0], len: 30, radius: 9, color: sod });
      });
      var arenaOn = S(0.6, 0.7, p) * (1 - late);
      var fx = [[-98, -30, "--color-coolbeam"], [-74, 18, "--color-accent"], [-50, -30, "--color-coolbeam"], [-98, 18, "--color-accent"], [-50, 18, "--color-coolbeam"]];
      fx.forEach(function (f, i) {
        var sw = Math.sin(mt * 0.35 + i * 1.7) * 0.18;
        var dir = [sw, -1, (f[1] < 0 ? 0.28 : -0.28)];
        var dl = Math.hypot(dir[0], dir[1], dir[2]);
        beams.push({
          apex: [f[0], DROP_H - 1, f[1]],
          dir: [dir[0] / dl, dir[1] / dl, dir[2] / dl],
          len: 64,
          radius: 11,
          color: lin(f[2], 0.13 * arenaOn),
        });
      });
      // Up-Look: the operator's gaze swept up into the grid (amber = the decision)
      var up = S(0.695, 0.72, p) * (1 - S(0.79, 0.82, p));
      var head = M4.xform(bodyM, [0, 5.6, -2.3]);
      beams.push({ apex: [head[0], head[1], head[2]], dir: [-0.27, 0.963, 0.02], len: 58, radius: 12, color: lin("--color-amber", 0.2 * up) });
      // 02:00 work light
      var work = S(0.83, 0.9, p);
      var warmWhite = L.math.mix(lin("--color-amber", 1), lin("--color-text", 1), 0.55);
      beams.push({ apex: [-119.6, 15, -14.4], dir: WORK_DIR, len: 21, radius: 6.5, color: [warmWhite[0] * 0.26 * work, warmWhite[1] * 0.26 * work, warmWhite[2] * 0.26 * work] });

      /* Floor pools */
      var F = this.floor;
      F.n = 0;
      F.wet = 0.35 + 0.65 * outdoor;
      F.grid = [4, 0.03 + 0.02 * (1 - outdoor)];
      F.base = lin("--color-bg", 0.08 * (1 - 0.5 * late));
      var fi = 0;
      this.poles.forEach(function (q) {
        F.spot(fi++, q[0] * 0.95, q[1], 9, 0.16 * outdoor * (1 - late), lin("--color-amber", 1));
      });
      F.spot(fi++, 0, -34, 7, 0.22 * outdoor, lin("--color-amber", 1));
      F.spot(fi++, -74, -6, 20, 0.22 * arenaOn, lin("--color-coolbeam", 1));
      F.spot(fi++, -60, 10, 18, 0.14 * arenaOn, lin("--color-accent", 1));
      F.spot(fi++, -116.8, -7, 7.5, 0.55 * work, L.math.mix(lin("--color-amber", 1), lin("--color-text", 1), 0.5));
      var ahead = M4.xform(bodyM, [0, 0, 8]);
      F.spot(fi++, ahead[0], ahead[2], 5.5, 0.14 * (1 - late * 0.5), lin("--color-accent", 1));

      /* Draw */
      var hor = L.math.mix(lin("--color-coolbeam", 0.012), lin("--color-coolbeam", 0.02), 1 - outdoor);
      this.sky.draw(lin("--color-bg-deep", 0.12), L.math.mix(hor, lin("--color-bg-deep", 0.15), late), 0.5 + (cam.tgt[1] - cam.eye[1]) * -0.012);
      F.draw(c, fog, mt);
      lines.draw(c, fog, true, 0.16, mt);
      this.beams.draw(c, beams, fog);
      lines.draw(c, fog, false, 1, mt);
      var rainK = outdoor * (1 - S(0.4, 0.5, p) * 0.5);
      if (rainK > 0.01) {
        this.rain.color = lin("--color-coolbeam", 0.2 * rainK);
        this.rain.draw(c, mt);
      }
      this.hazeYard.lights(beams.slice(0, 3));
      if (outdoor > 0.02) this.hazeYard.draw(c, mt, fog);
      this.hazeArena.lights(beams.slice(3));
      if (outdoor < 0.98) this.hazeArena.draw(c, mt, fog);

      /* Glows: machine beacon, trailer lamps, fixtures, the shackle */
      var gw = this.glows;
      gw.reset();
      var beaconW = M4.xform(bodyM, this.fk.beacon);
      var blink = 0.55 + 0.45 * Math.max(0, Math.sin(mt * 5.2));
      gw.add([beaconW[0], beaconW[1], beaconW[2]], lin("--color-accent", 3.2 * blink), 26);
      [-14, 0, 14].forEach(function (cx) {
        [-46, -60, -74].forEach(function (z) {
          gw.add([cx, 12.8, z], lin("--color-amber", 0.9 * (1 - late)), 20);
        });
      });
      this.poles.forEach(function (q) {
        gw.add([q[0] * 0.95, 29.8, q[1]], lin("--color-amber", 2.2 * outdoor * (1 - late)), 30);
      });
      fx.forEach(function (f) {
        gw.add([f[0], DROP_H - 1, f[1]], lin(f[2], 2.4 * arenaOn), 18);
      });
      gw.add([-119.6, 15, -14.4], lin("--color-amber", 4 * work), 40);
      // Shackle: scroll-driven free fall, 60 ft in T_FALL seconds of model time
      var fall = L.math.clamp((p - DROP_P0) / (DROP_P1 - DROP_P0), 0, 1);
      if (p > DROP_P0 - 0.01 && p < 0.8) {
        var tt = fall * T_FALL;
        var y = Math.max(0.3, DROP_H - 0.5 * GRAV * tt * tt);
        var v = GRAV * tt;
        for (var k = 0; k < 6; k++) {
          var yk = Math.min(DROP_H, y + k * v * 0.018);
          gw.add([DROP_AT[0], yk, DROP_AT[1]], lin("--color-amber", (k === 0 ? 5 : 1.4) / (1 + k)), k === 0 ? 16 : 10);
        }
        if (fall >= 1) {
          var ring = S(0.765, 0.8, p);
          gw.add([DROP_AT[0], 0.3, DROP_AT[1]], lin("--color-amber", 6 * (1 - ring)), 60 * ring + 10);
        }
      }
      gl.blendFunc(gl.ONE, gl.ONE);
      gw.draw(c);

      /* DOM labels (projected; crisp text, decorative → aria-hidden container) */
      this.place("halo", this.haloLabelAt, haloOn * S(0.5, 0.53, p));
      this.place("h60", this.rulerTop, dropOn * S(0.71, 0.73, p));
      this.place("impact", [DROP_AT[0] + 1, 2.2, DROP_AT[1]], S(0.765, 0.775, p) * (1 - S(0.805, 0.83, p)));

      var clock = clockAt(p);
      if (clock !== this.lastClock && this.clockEl) {
        this.clockEl.textContent = clock;
        this.lastClock = clock;
      }
      // Publish progress for automated capture (?lp=… + window.Living.state)
      L.state.loadout = { p: Math.round(p * 1000) / 1000, clock: clock, segments: this.segCount };
    },

    place: function (key, world, alpha) {
      var d = this.labels[key];
      if (!d) return;
      if (alpha < 0.01) {
        if (d.__a !== 0) {
          d.style.opacity = "0";
          d.__a = 0;
        }
        return;
      }
      var s = this.opts.project(world);
      if (!s) return;
      d.style.transform = "translate(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px) translate(-50%,-50%)";
      d.style.opacity = alpha.toFixed(3);
      d.__a = alpha;
    },

    dispose: function () {
      this.lines.dispose();
      this.floor.dispose();
      this.beams.dispose();
      this.rain.dispose();
      this.hazeYard.dispose();
      this.hazeArena.dispose();
      this.glows.dispose();
      this.sky.dispose();
      for (var k in this.labels) this.labels[k].remove();
    },
  };
})();

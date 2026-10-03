/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "quiet" · the utility-page heroes
   Two modes (data-mode on the section):
     beacon     404 — a machine's turning beacon sweeping an empty, hazed floor
     worklight  /certificate — 02:00, one work light, haze hanging in the cone
   Deliberately small: one light, one floor, a few hundred motes.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};

  L.scenes.quiet = {
    init: function (gl, canvas, opts) {
      var K = L.kit,
        lin = L.lin;
      this.gl = gl;
      this.opts = opts;
      this.mode = opts.el.getAttribute("data-mode") || "beacon";
      opts.post.alphaMode = 1;
      opts.post.vignette = 0.2;
      opts.post.bloom = 0.8;
      this.floor = K.Floor(gl, [-80, -80, 160, 160]);
      this.floor.gridC = lin("--color-accent", 1);
      this.floor.grid = [4, 0.03];
      this.floor.base = [0, 0, 0];
      this.floor.wet = 0.5;
      this.beams = K.Beams(gl);
      this.glows = K.Glows(gl, 8);
      this.motes = K.Motes(gl, Math.round(900 * opts.quality), [-40, 0, -50], [80, 26, 60], 5);
      this.motes.base = lin("--color-coolbeam", 0.01);
      if (this.mode === "worklight") {
        var pen = new L.gl.Pen();
        var st = lin("--color-muted", 0.35);
        pen.color(st).width(1.2);
        // light tower: mast, head, tripod legs
        pen.seg([14, 0, -20], [14, 17, -20]).seg([14, 17, -20], [12.6, 17, -18.8]);
        [[16, -21.5], [12, -21.5], [14, -17.6]].forEach(function (f) {
          pen.seg([f[0], 0, f[1]], [14, 4.5, -20]);
        });
        // a single road case in the pool
        K.roadCase(pen, [5, 0, -12], [4, 3.6, 2.6], -0.5, lin("--color-muted", 0.45), lin("--color-muted", 0.22), true);
        this.lines = L.gl.lines(gl, pen.segs);
      }
    },
    resize: function (w, h, px) {
      this.w = w;
      this.h = h;
      this.px = px;
    },
    frame: function (t, p, dt) {
      var K = L.kit,
        M4 = L.M4,
        lin = L.lin;
      var aspect = this.w / this.h;
      var wide = aspect > 1.2;
      var eye, tgt, beams = [], F = this.floor;
      F.n = 0;
      this.glows.reset();
      if (this.mode === "beacon") {
        eye = [0, 7 + p * 2, 34];
        tgt = [0, 3, -10];
        var bpos = wide ? [16, 3.2, -14] : [0, 3.2, -18];
        var a = t * 2.2;
        var col = lin("--color-accent", 0.34);
        [0, Math.PI].forEach(function (off) {
          var d = [Math.cos(a + off), -0.08, Math.sin(a + off)];
          var l = Math.hypot(d[0], d[1], d[2]);
          beams.push({ apex: bpos, dir: [d[0] / l, d[1] / l, d[2] / l], len: 46, radius: 7, color: col });
        });
        var face = 0.5 + 0.5 * Math.max(Math.cos(a - Math.atan2(eye[2] - bpos[2], eye[0] - bpos[0])), Math.cos(a + Math.PI - Math.atan2(eye[2] - bpos[2], eye[0] - bpos[0])));
        this.glows.add(bpos, lin("--color-accent", 2 + 5 * Math.pow(face, 8)), 22 + 30 * Math.pow(face, 8));
        F.spot(0, bpos[0], bpos[2], 10, 0.35, lin("--color-accent", 1));
        F.spot(1, bpos[0] + Math.cos(a) * 16, bpos[2] + Math.sin(a) * 16, 8, 0.22, lin("--color-accent", 1));
        F.spot(2, bpos[0] - Math.cos(a) * 16, bpos[2] - Math.sin(a) * 16, 8, 0.22, lin("--color-accent", 1));
      } else {
        eye = [wide ? -6 : 0, 8 + p * 3, 30];
        tgt = [wide ? 2 : 3, 4, -12];
        var head = [12.6, 17, -18.8],
          tg = [5, 1.5, -12];
        var d2 = [tg[0] - head[0], tg[1] - head[1], tg[2] - head[2]],
          l2 = Math.hypot(d2[0], d2[1], d2[2]);
        var warm = L.math.mix(lin("--color-amber", 1), lin("--color-text", 1), 0.5);
        var breathe = 0.92 + 0.08 * Math.sin(t * 0.7);
        beams.push({ apex: head, dir: [d2[0] / l2, d2[1] / l2, d2[2] / l2], len: 24, radius: 8, color: [warm[0] * 0.22 * breathe, warm[1] * 0.22 * breathe, warm[2] * 0.22 * breathe] });
        this.glows.add(head, [warm[0] * 4, warm[1] * 4, warm[2] * 4], 40);
        F.spot(0, 5, -12, 9, 0.5, warm);
      }
      var proj = M4.persp(0.8, aspect, 0.5, 400);
      if (wide && this.w / this.px >= 640) proj[8] += this.mode === "beacon" ? -0.2 : -0.3;
      var cam = { vp: M4.mul(proj, M4.lookAt(eye, tgt, [0, 1, 0])), eye: eye, w: this.w, h: this.h, px: this.px };
      this.vp = cam.vp;
      var fog = [0.012, 20];
      F.draw(cam, fog, t);
      if (this.lines) {
        this.lines.draw(cam, fog, true, 0.14, t);
        this.lines.draw(cam, fog, false, 1, t);
      }
      this.beams.draw(cam, beams, fog);
      this.motes.lights(beams);
      this.motes.draw(cam, t, fog);
      this.glows.draw(cam);
    },
    dispose: function () {
      this.floor.dispose();
      this.beams.dispose();
      this.glows.dispose();
      this.motes.dispose();
      if (this.lines) this.lines.dispose();
    },
  };
})();

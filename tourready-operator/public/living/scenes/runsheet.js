/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "runsheet" · the Training Hub hero
   The curriculum as a lane on the arena floor: one station per module, Module 0
   nearest, the capstone at the far end. Stations light from the visitor's own
   saved progress (localStorage, via the page) using the app's status colours:
   passed = go green, needs retry = red, not started = dark steel. The machine
   is parked at the next station — where "Continue Training" goes.
   Schematic. data: {statuses: string[], next: number, certified: boolean}
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};
  var N = 15,
    GAP = 9;

  function stationPos(i) {
    return [Math.sin(i * 0.38) * 9 - i * 0.6, 0, -i * GAP];
  }

  L.scenes.runsheet = {
    init: function (gl, canvas, opts) {
      var K = L.kit,
        lin = L.lin;
      this.gl = gl;
      this.opts = opts;
      opts.post.alphaMode = 1;
      opts.post.vignette = 0.15;
      opts.post.bloom = 0.85;
      this.n = parseInt(opts.el.getAttribute("data-count") || N, 10) || N;
      this.data = opts.data || {};
      var pen = new L.gl.Pen();
      var steel = lin("--color-muted", 0.22);
      // Lane edges (floor tape) + dashed centreline
      var left = [],
        right = [],
        centre = [];
      for (var s = -1; s <= this.n; s += 0.25) {
        var p0 = stationPos(s),
          p1 = stationPos(s + 0.05);
        var dx = p1[0] - p0[0],
          dz = p1[2] - p0[2],
          dl = Math.hypot(dx, dz);
        var nx = -dz / dl,
          nz = dx / dl;
        left.push([p0[0] + nx * 4.2, 0.03, p0[2] + nz * 4.2]);
        right.push([p0[0] - nx * 4.2, 0.03, p0[2] - nz * 4.2]);
        centre.push([p0[0], 0.04, p0[2]]);
      }
      pen.group(0).color(steel).width(1.3).poly(left).poly(right);
      // Progress line along the centre (group 1, revealed up to the last passed station)
      pen.group(1).color(lin("--color-accent", 1.6)).width(2.2);
      for (var c = 0; c < centre.length - 1; c += 2) {
        pen.order(c / (centre.length - 1)).seg(centre[c], centre[c + 1]);
      }
      this.centreLen = centre.length;
      // Stations: ring + ticks + pillar, each its own group (2 .. 16)
      for (var i = 0; i < this.n; i++) {
        var q = stationPos(i);
        pen.group(2 + i).color([1, 1, 1]).width(1.6);
        pen.circle([q[0], 0.05, q[2]], 2.5, "y", 36);
        pen.width(1.2).circle([q[0], 0.05, q[2]], 1.5, "y", 24);
        for (var k = 0; k < 4; k++) {
          var a = (k * Math.PI) / 2 + Math.PI / 4;
          pen.seg([q[0] + Math.cos(a) * 2.8, 0.05, q[2] + Math.sin(a) * 2.8], [q[0] + Math.cos(a) * 3.5, 0.05, q[2] + Math.sin(a) * 3.5]);
        }
        pen.width(1.4).seg([q[0], 0.05, q[2]], [q[0], i === this.n - 1 ? 11 : 6.5, q[2]]);
      }
      // The parked machine (group 20)
      K.forklift(pen, 20, 21, lin("--color-accent", 1.5), lin("--color-accent", 2.4), lin("--color-accent", 0.5));
      this.lines = L.gl.lines(gl, pen.segs);
      this.floor = K.Floor(gl, [-80, -160, 160, 200]);
      this.floor.gridC = lin("--color-accent", 1);
      this.floor.grid = [4, 0.028];
      this.floor.base = [0, 0, 0];
      this.floor.wet = 0.45;
      this.glows = K.Glows(gl, 24);
      this.motes = K.Motes(gl, Math.round(700 * opts.quality), [-30, 0, -140], [60, 20, 150], 9);
      this.motes.base = lin("--color-coolbeam", 0.012);
      this.beams = K.Beams(gl);
      var host = opts.el.querySelector(".lp-labels");
      this.labels = [];
      for (var j = 0; j < this.n && host; j++) {
        var d = document.createElement("span");
        d.className = "lp-label lp-label--station";
        d.textContent = j === this.n - 1 ? "Final" : String(j);
        host.appendChild(d);
        this.labels.push(d);
      }
      this.col = {
        passed: lin("--color-go", 1.5),
        retry: lin("--color-hardstop", 1.6),
        idle: lin("--color-muted", 0.3),
        next: lin("--color-accent", 2.0),
      };
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
      var K = L.kit,
        M4 = L.M4,
        lin = L.lin,
        S = L.math.smooth;
      var d = this.data || {};
      var st = d.statuses || [];
      var next = d.next == null ? 0 : d.next;
      var lines = this.lines;
      var lastPassed = -1;
      for (var i = 0; i < this.n; i++) if (st[i] === "passed") lastPassed = i;
      // Lane progress: centre line lit up to the last passed station.
      var frac = lastPassed < 0 ? 0 : (lastPassed + 1) / (this.n + 1);
      lines.param(1, frac * 1.02, 1, 1);
      this.glows.reset();
      var beams = [];
      for (var s2 = 0; s2 < this.n; s2++) {
        var status = st[s2] || "not-started";
        var isNext = s2 === next && !d.certified;
        var c = status === "passed" ? this.col.passed : status === "retry" ? this.col.retry : isNext ? this.col.next : this.col.idle;
        var pulse = isNext ? 0.75 + 0.25 * Math.sin(t * 3) : 1;
        lines.param(2 + s2, 1, (status === "not-started" && !isNext ? 0.35 : 1) * pulse, 1);
        lines.tint(2 + s2, c);
        var q = stationPos(s2);
        this.glows.add([q[0], s2 === this.n - 1 ? 11 : 6.5, q[2]], [c[0] * 1.6 * pulse, c[1] * 1.6 * pulse, c[2] * 1.6 * pulse], status === "not-started" && !isNext ? 10 : 22);
        this.glows.add([q[0], 0.1, q[2]], [c[0] * 0.8, c[1] * 0.8, c[2] * 0.8], 34);
        if (isNext) beams.push({ apex: [q[0], 14, q[2]], dir: [0, -1, 0], len: 14, radius: 3.4, color: lin("--color-accent", 0.16 * pulse) });
      }
      // the machine, parked just short of the next station
      var target = d.certified ? this.n - 1 : Math.min(next, this.n - 1);
      var tp = stationPos(target),
        tb = stationPos(target - 0.8);
      var yaw = Math.atan2(tp[0] - tb[0], tp[2] - tb[2]);
      var mpos = [tb[0] - Math.sin(yaw) * 5.6 + Math.cos(yaw) * 0, 0, tb[2] - Math.cos(yaw) * 5.6];
      var mm = M4.trs(mpos[0], 0, mpos[2], yaw, 0, 0.62);
      lines.mat(20, mm);
      lines.mat(21, mm);
      var bw = M4.xform(mm, [0, 7.25, -2.15]);
      this.glows.add([bw[0], bw[1], bw[2]], lin("--color-accent", 3 * (0.55 + 0.45 * Math.max(0, Math.sin(t * 5.2)))), 18);
      // camera: low over the lane, drifting
      var aspect = this.w / this.h;
      var wide = aspect > 1.2;
            // The whole run in one look: Module 0 near-left, the capstone far-right.
      var eye = [70 + Math.sin(t * 0.11) * 3, 24 - p * 5, -20];
      var tgt = [-4, -5, -66];
      if (!wide) {
        eye = [62 + Math.sin(t * 0.11) * 1.5, 40, -14];
        tgt = [-4, -6, -64];
      }
      var proj = M4.persp(wide ? 0.5 : 0.9, aspect, 0.5, 500);
      // lens-shift only when the heading sits beside the art (≥ 640 css px)
      if (this.w / this.px >= 640) proj[8] += -0.26;
      var vp = M4.mul(proj, M4.lookAt(eye, tgt, [0, 1, 0]));
      this.vp = vp;
      var cam = { vp: vp, eye: eye, w: this.w, h: this.h, px: this.px };
      var fog = [0.006, 30];
      var F = this.floor;
      F.n = 0;
      F.spot(0, tp[0], tp[2], 7, 0.4, lin("--color-accent", 1));
      F.draw(cam, fog, t);
      lines.draw(cam, fog, true, 0.14, t);
      this.beams.draw(cam, beams, fog);
      lines.draw(cam, fog, false, 1, t);
      this.motes.lights(beams);
      this.motes.draw(cam, t, fog);
      this.glows.draw(cam);
      // station labels
      for (var k = 0; k < this.labels.length; k++) {
        var q2 = stationPos(k);
        var sp = this.opts.project([q2[0] + 2.4, 0.2, q2[2] + 1.2]);
        var el = this.labels[k];
        // phones: numbers would sit on the heading; the colours carry the status there
        if (this.w / this.px < 520 || !sp || sp.x < 0 || sp.x > this.w / this.px + 40) {
          el.style.opacity = "0";
          continue;
        }
        var status2 = st[k] || "not-started";
        el.style.transform = "translate(" + sp.x.toFixed(1) + "px," + sp.y.toFixed(1) + "px) translate(-50%,-50%)";
        // a label is legible or absent: status reads from colour, never from a faded label
        el.style.opacity = "1";
        el.setAttribute("data-status", k === next && !d.certified ? "next" : status2);
      }
    },
    dispose: function () {
      this.lines.dispose();
      this.floor.dispose();
      this.glows.dispose();
      this.motes.dispose();
      this.beams.dispose();
      this.labels.forEach(function (l) {
        l.remove();
      });
    },
  };
})();

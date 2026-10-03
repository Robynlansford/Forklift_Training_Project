/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "constellation" · the Knowledge Base hero
   Every named technique in lib/glossary.ts is one star; stars cluster by the
   glossary's own categories. Cluster colour follows the site's light roles:
     machine orange  Logistics · Alignment · Physics · Night Ops
     crew blue       Ground Crew · Rigging
     moment amber    Commands · Human Factors · Certification
   The page's category filter turns the ring to that cluster and dims the rest;
   a search lights only the matching stars. Schematic.
   data: {items:[{c}], categories:[{name,count}], active, matches:number[]|null}
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};
  var ROLE = {
    Logistics: "--color-accent",
    Alignment: "--color-accent",
    Physics: "--color-accent",
    "Night Ops": "--color-accent",
    "Ground Crew": "--color-coolbeam",
    Rigging: "--color-coolbeam",
    Commands: "--color-amber",
    "Human Factors": "--color-amber",
    Certification: "--color-amber",
  };
  var RING = 24;

  L.scenes.constellation = {
    init: function (gl, canvas, opts) {
      this.gl = gl;
      this.opts = opts;
      opts.post.alphaMode = 1;
      opts.post.bloom = 1.0;
      opts.post.vignette = 0;
      this.glows = L.kit.Glows(gl, 96);
      this.data = null;
      this.rot = 0;
      this.focus = [];
      this.build(opts.data || {});
    },
    build: function (d) {
      var lin = L.lin,
        G = L.gl;
      var cats = d.categories || [];
      var items = d.items || [];
      if (!cats.length) return;
      var key = cats.map(function (c) {
        return c.name + c.count;
      }).join("|");
      if (key === this.key) return;
      this.key = key;
      if (this.lines) this.lines.dispose();
      var pen = new G.Pen();
      var clusters = [];
      var n = cats.length;
      cats.forEach(function (c, ci) {
        var a = (ci / n) * Math.PI * 2;
        var centre = [Math.cos(a) * RING, Math.sin(ci * 1.7) * 3.2, Math.sin(a) * RING];
        clusters.push({ name: c.name, count: c.count, centre: centre, angle: a, stars: [], col: lin(ROLE[c.name] || "--color-accent", 1) });
      });
      var byCat = {};
      clusters.forEach(function (c) {
        byCat[c.name] = c;
      });
      items.forEach(function (it, idx) {
        var c = byCat[it.c];
        if (!c) return;
        var k = c.stars.length;
        // golden-angle spiral on a small sphere around the cluster centre
        var r = 2.2 + Math.sqrt(c.count) * 1.25;
        var y = 1 - ((k + 0.5) / c.count) * 2;
        var rr = Math.sqrt(1 - y * y);
        var th = k * 2.39996;
        c.stars.push({ idx: idx, p: [c.centre[0] + Math.cos(th) * rr * r, c.centre[1] + y * r * 0.8, c.centre[2] + Math.sin(th) * rr * r] });
      });
      // lines: ring of centres (group 0), per-cluster chains + spokes (group 1 + ci)
      pen.group(0).color(lin("--color-muted", 0.18)).width(1.1);
      for (var i = 0; i < n; i++) pen.seg(clusters[i].centre, clusters[(i + 1) % n].centre);
      clusters.forEach(function (c, ci) {
        pen.group(1 + ci).color([1, 1, 1]).width(1.3);
        for (var s = 0; s < c.stars.length; s++) {
          pen.seg(c.centre, c.stars[s].p);
          if (s) pen.seg(c.stars[s - 1].p, c.stars[s].p);
        }
      });
      this.clusters = clusters;
      this.lines = G.lines(this.gl, pen.segs);
      var host = this.opts.el.querySelector(".lp-labels");
      if (this.labels) this.labels.forEach(function (l) {
        l.remove();
      });
      this.labels = [];
      var self = this;
      clusters.forEach(function (c) {
        if (!host) return;
        var e = document.createElement("span");
        e.className = "lp-label lp-label--cluster";
        e.textContent = c.name + " · " + c.count;
        e.style.color = "rgb(" + L.srgb(L.token(ROLE[c.name] || "--color-accent")).map(function (v) {
          return Math.round(v * 255);
        }).join(",") + ")";
        host.appendChild(e);
        self.labels.push(e);
      });
    },
    onData: function (d) {
      this.data = d;
      this.build(d);
    },
    resize: function (w, h, px) {
      this.w = w;
      this.h = h;
      this.px = px;
    },
    frame: function (t, p, dt) {
      if (!this.clusters) return;
      var M4 = L.M4,
        d = this.data || this.opts.data || {};
      var active = d.active && d.active !== "All" ? d.active : null;
      var matches = d.matches || null;
      var ci = -1;
      for (var i = 0; i < this.clusters.length; i++) if (this.clusters[i].name === active) ci = i;
      // turn the ring: idle drift, or ease so the active cluster faces the camera
      var goal = ci >= 0 ? -this.clusters[ci].angle + Math.PI / 2 : this.rot + (dt || 0) * 0.06;
      if (ci >= 0) {
        var diff = ((goal - this.rot + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        this.rot += diff * (dt === 0 ? 1 : 1 - Math.exp(-(dt || 0.016) * 3));
      } else this.rot = goal;
      if (dt === 0 && ci < 0) this.rot = t * 0.06;
      var world = M4.trs(0, 0, 0, this.rot, -0.18);
      var aspect = this.w / this.h;
      var wide = aspect > 1.25;
      var eye = [0, 9, wide ? 64 : 74];
      var proj = M4.persp(0.62, aspect, 0.5, 400);
      if (this.w / this.px >= 640) proj[8] += -0.42;
      var vp = M4.mul(M4.mul(proj, M4.lookAt(eye, [0, 0, 0], [0, 1, 0])), world);
      this.vp = vp;
      var cam = { vp: vp, eye: eye, w: this.w, h: this.h, px: this.px };
      var lines = this.lines;
      var gw = this.glows;
      gw.reset();
      var self = this;
      this.clusters.forEach(function (c, k) {
        var on = !active || c.name === active ? 1 : 0.16;
        var col = c.col;
        lines.tint(1 + k, [col[0] * 0.5 * on, col[1] * 0.5 * on, col[2] * 0.5 * on]);
        c.stars.forEach(function (s, j) {
          var hit = matches ? matches.indexOf(s.idx) >= 0 : true;
          var tw = 0.8 + 0.2 * Math.sin(t * 1.3 + s.idx * 1.9);
          var kk = on * (hit ? 1 : 0.2) * tw;
          gw.add(s.p, [col[0] * 2.4 * kk, col[1] * 2.4 * kk, col[2] * 2.4 * kk], matches && hit ? 26 : 15);
        });
        gw.add(c.centre, [col[0] * 0.9 * on, col[1] * 0.9 * on, col[2] * 0.9 * on], 30);
        var lab = self.labels[k];
        if (lab) {
          var sp = M4.xform(vp, [c.centre[0], c.centre[1] + 6.5, c.centre[2]]);
          if (sp[3] <= 0) {
            lab.style.opacity = "0";
            return;
          }
          var x = (sp[0] * 0.5 + 0.5) * (self.w / self.px),
            y = (0.5 - sp[1] * 0.5) * (self.h / self.px);
          lab.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
          // A label is legible or absent (never a faded ghost): the front of the ring and the
          // filtered cluster keep theirs; the far side hands off as it turns (CSS eases the swap).
          var wc = M4.xform(world, c.centre);
          var depth = L.math.smooth(-RING * 0.9, RING * 0.6, wc[2]);
          var o = active ? (c.name === active ? 1 : 0) : depth > 0.45 ? 1 : 0;
          // phones: only the very front of the ring (or the filtered cluster) keeps a label
          if (self.w / self.px < 640) o = active ? (c.name === active ? 1 : 0) : depth > 0.8 ? 1 : 0;
          lab.style.opacity = String(o);
        }
      });
      lines.draw(cam, [0, 0], false, 1, t);
      gw.draw(cam);
    },
    dispose: function () {
      if (this.lines) this.lines.dispose();
      this.glows.dispose();
      if (this.labels) this.labels.forEach(function (l) {
        l.remove();
      });
    },
  };
})();

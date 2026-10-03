/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — fx v1 · section figures (Canvas2D) + the scroll-lit route
   Every figure draws only numbers that already appear in the page's own text
   (the React side passes them in data-values and repeats them in the
   <figcaption>). Canvases are aria-hidden; captions carry the meaning.
     route     process steps light up as they pass the reading line
     gauge     wind dial: derate band below the limit, STOP at/above it
     zone      top-down machine: rear-swing halo (3 ft) or pedestrian zone (10 ft)
     drop      a dropped object from height, in real free-fall time
     capacity  capacity vs reach from the Safety Engine's teaching model
     shift     shift hours with the relief line
     panel     the capstone's stacked hazards, one instrument each
     forks     the Flush-Fork Rule: 48-in forks, 36-in cart
     bars      per-module scores against the pass mark
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = window.Living;
  var F = L.figures;
  var TAU = Math.PI * 2;
  var clamp = L.math.clamp;
  function easeOut(x) {
    x = clamp(x, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }
  function easeInOut(x) {
    x = clamp(x, 0, 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /* ── Colour + drawing helpers ────────────────────────────────────────── */
  function palette(el) {
    function c(name, fb) {
      var s = L.srgb(L.token(name, el, fb));
      return [Math.round(s[0] * 255), Math.round(s[1] * 255), Math.round(s[2] * 255)];
    }
    return {
      machine: c("--lp-machine", "#f97316"),
      crew: c("--lp-crew", "#7db0ff"),
      moment: c("--lp-moment", "#fbbf24"),
      stop: c("--color-hardstop", "#ef4444"),
      go: c("--color-go", "#22c55e"),
      ink: c("--color-text", "#f8fafc"),
      soft: c("--color-muted", "#94a3b8"),
      line: c("--color-border", "#334155"),
      deep: c("--color-bg-deep", "#050810"),
      display: L.token("--font-display", el, "sans-serif"),
      sans: L.token("--font-sans", el, "sans-serif"),
    };
  }
  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a == null ? 1 : a) + ")";
  }
  /** Stroke the current path as emitted light: a wide soft glow, then a crisp core. */
  function glow(ctx, c, w, blur, alpha) {
    alpha = alpha == null ? 1 : alpha;
    ctx.save();
    ctx.shadowColor = rgba(c, 0.9 * alpha);
    ctx.shadowBlur = blur;
    ctx.strokeStyle = rgba(c, 0.55 * alpha);
    ctx.lineWidth = w * 2.2;
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = rgba(c, alpha);
    ctx.lineWidth = w;
    ctx.stroke();
  }
  function dot(ctx, x, y, r, c, blur, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.shadowColor = rgba(c, alpha == null ? 1 : alpha);
    ctx.shadowBlur = blur || 0;
    ctx.fillStyle = rgba(c, alpha == null ? 1 : alpha);
    ctx.fill();
    ctx.restore();
  }
  function label(ctx, P, text, x, y, size, c, align, weight, alpha, spacing) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = rgba(c);
    ctx.font = (weight || 700) + " " + size + "px " + P.display;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    if (spacing && "letterSpacing" in ctx) ctx.letterSpacing = spacing + "px";
    ctx.fillText(String(text).toUpperCase(), x, y);
    ctx.restore();
  }
  function num(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  /* ── Figure runtime ──────────────────────────────────────────────────── */
  function Figure(el, inst, def) {
    var canvas = el.querySelector("canvas");
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    var self = {
      el: el,
      data: {},
      P: palette(el),
      start: -1,
      w: 0,
      h: 0,
      dirty: true,
      t0: 0,
    };
    try {
      Object.assign(self.data, JSON.parse(el.getAttribute("data-values") || "{}"));
    } catch (e) {}
    Object.assign(self.data, inst.data || {});
    var prev = null;
    function size() {
      var cw = canvas.clientWidth,
        ch = canvas.clientHeight;
      if (!cw || !ch) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = Math.round(cw * dpr),
        H = Math.round(ch * dpr);
      if (W !== canvas.width || H !== canvas.height) {
        canvas.width = W;
        canvas.height = H;
        self.dirty = true;
      }
      self.w = cw;
      self.h = ch;
      self.dpr = dpr;
      return true;
    }
    self.frame = function (t) {
      if (!size()) return;
      var vh = window.innerHeight;
      var r = el.getBoundingClientRect();
      if (self.start < 0 && r.top < vh * 0.82) self.start = t;
      if (self.start < 0 && !L.reduced) return;
      var local = self.start < 0 ? 0 : t - self.start;
      var reveal = L.reduced ? 1 : easeOut(local / (def.duration || 1.6));
      var animating = !L.reduced && (reveal < 1 || def.loop || (self.tween && self.tween < 1));
      if (!animating && !self.dirty) return;
      if (self.tween != null && self.tween < 1) self.tween = Math.min(1, self.tween + 0.08);
      ctx.setTransform(self.dpr, 0, 0, self.dpr, 0, 0);
      ctx.clearRect(0, 0, self.w, self.h);
      def.draw(ctx, self.w, self.h, {
        r: reveal,
        t: L.reduced ? (def.still || 0) : local,
        data: self.data,
        prev: prev,
        tween: self.tween == null ? 1 : easeInOut(self.tween),
        P: self.P,
        reduced: L.reduced,
        fig: self,
      });
      self.dirty = false;
    };
    self.dataIn = function (d) {
      prev = JSON.parse(JSON.stringify(self.data));
      Object.assign(self.data, d);
      self.tween = 0;
      self.dirty = true;
    };
    // The engine calls api.data(obj) on Living.set(); values tween into place.
    var api = {
      frame: self.frame,
      destroy: function () {},
      onData: function (d) {
        self.dataIn(d);
      },
    };
    return api;
  }

  /* ── Route: the scroll-lit process rail ──────────────────────────────── */
  function Route(el) {
    var items = Array.prototype.slice.call(el.querySelectorAll("[data-route-item]"));
    if (items.length < 2) return null;
    var rail = document.createElement("span");
    rail.className = "lp-route-rail";
    rail.setAttribute("aria-hidden", "true");
    var beacon = document.createElement("span");
    beacon.className = "lp-route-beacon";
    beacon.setAttribute("aria-hidden", "true");
    el.appendChild(rail);
    el.appendChild(beacon);
    var axis = "y",
      pts = [],
      lastFill = -1;
    function layout() {
      var box = el.getBoundingClientRect();
      pts = items.map(function (it) {
        var chip = it.querySelector("[data-route-chip]") || it;
        var r = chip.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, it: it };
      });
      var dx = Math.abs(pts[pts.length - 1].x - pts[0].x),
        dy = Math.abs(pts[pts.length - 1].y - pts[0].y);
      axis = dx > dy ? "x" : "y";
      el.setAttribute("data-axis", axis);
      var a = pts[0],
        b = pts[pts.length - 1];
      if (axis === "x") {
        rail.style.cssText = "left:" + a.x + "px;top:" + (a.y - 1) + "px;width:" + (b.x - a.x) + "px;height:2px;";
      } else {
        rail.style.cssText = "left:" + (a.x - 1) + "px;top:" + a.y + "px;width:2px;height:" + (b.y - a.y) + "px;";
      }
    }
    var lw = 0,
      lh = 0;
    return {
      frame: function () {
        var box = el.getBoundingClientRect();
        if (box.width !== lw || box.height !== lh) {
          lw = box.width;
          lh = box.height;
          layout();
        }
        var line = window.innerHeight * 0.62;
        var fill;
        if (L.reduced) fill = 1;
        else {
          // Fill tracks the reading line through the chips; items light as it passes them.
          var first = box.top + pts[0].y,
            last = box.top + pts[pts.length - 1].y;
          if (axis === "x") {
            // Row layout: the whole row lights left→right as the row crosses the line.
            var rowTop = first - window.innerHeight * 0.1;
            fill = clamp((line - rowTop) / (window.innerHeight * 0.34), 0, 1);
          } else fill = clamp((line - first) / Math.max(1, last - first), 0, 1);
        }
        fill = Math.round(fill * 1000) / 1000;
        if (fill === lastFill) return;
        lastFill = fill;
        el.style.setProperty("--lp-fill", fill);
        var a = pts[0],
          b = pts[pts.length - 1];
        var bx = a.x + (b.x - a.x) * fill,
          by = a.y + (b.y - a.y) * fill;
        beacon.style.left = bx + "px";
        beacon.style.top = by + "px";
        el.style.setProperty("--lp-beacon", fill > 0.01 && fill < 0.999 ? 1 : 0);
        var n = pts.length;
        pts.forEach(function (p, i) {
          var at = n === 1 ? 0 : i / (n - 1);
          p.it.classList.toggle("lp-lit", fill >= at - 0.001);
        });
      },
      destroy: function () {
        rail.remove();
        beacon.remove();
        items.forEach(function (it) {
          it.classList.remove("lp-lit");
        });
      },
    };
  }

  /* ── Figure definitions ──────────────────────────────────────────────── */
  var FIG = {};

  /* Wind dial — data: {max, limit, value, derate} */
  FIG.gauge = {
    duration: 2.2,
    loop: false,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var max = d.max || 35,
        lim = d.limit || 15,
        val = d.value == null ? lim : d.value;
      var cx = w / 2,
        cy = h * 0.8,
        R = Math.min(w * 0.36, h * 0.68);
      var a0 = Math.PI,
        a1 = TAU;
      function ang(v) {
        return a0 + (a1 - a0) * (v / max);
      }
      // track
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.strokeStyle = rgba(P.line, 0.6);
      ctx.lineWidth = 10;
      ctx.stroke();
      // derate band (below the limit) and the STOP band (at/above)
      var rr = s.r;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, ang(lim) - 0.004);
      glow(ctx, P.moment, 4, 10, 0.35 + 0.35 * rr);
      ctx.beginPath();
      ctx.arc(cx, cy, R, ang(lim), a1);
      glow(ctx, P.stop, 5, 16, 0.3 + 0.7 * rr);
      // ticks
      for (var v = 0; v <= max; v += 5) {
        var a = ang(v);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (R - 16), cy + Math.sin(a) * (R - 16));
        ctx.lineTo(cx + Math.cos(a) * (R - 26), cy + Math.sin(a) * (R - 26));
        ctx.strokeStyle = rgba(P.soft, 0.8);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        label(ctx, P, v, cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40), 12, P.soft, "center", 600);
      }
      // limit marker
      var al = ang(lim);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(al) * (R + 14), cy + Math.sin(al) * (R + 14));
      ctx.lineTo(cx + Math.cos(al) * (R - 8), cy + Math.sin(al) * (R - 8));
      glow(ctx, P.stop, 2.5, 12);
      label(ctx, P, lim + " mph", cx + Math.cos(al) * (R + 30), cy + Math.sin(al) * (R + 30) - 4, 14, P.stop, "center", 700);
      // band labels
      label(ctx, P, "Derate " + (d.derate || "20–30%"), cx - R * 0.98, cy + 18, 12, P.moment, "left", 600, 0.9, 1.5);
      label(ctx, P, "Stop · no high lifts", cx + R * 0.98, cy + 18, 12, P.stop, "right", 700, 0.95, 1.5);
      // needle rises to the value
      var nv = val * easeOut(s.r * 1.15);
      var an = ang(nv);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(an) * (R - 30), cy + Math.sin(an) * (R - 30));
      glow(ctx, nv >= lim - 0.01 ? P.stop : P.machine, 3, 14);
      dot(ctx, cx, cy, 7, P.machine, 12);
      label(ctx, P, Math.round(nv) + " mph", cx, cy - R * 0.36, Math.max(26, R * 0.26), nv >= lim - 0.01 ? P.stop : P.ink, "center", 700);
    },
  };

  /* Zone — data: {mode: "halo"|"pedestrian", radius} */
  function machineTop(ctx, P, s, x, y, yaw, sc, colorA) {
    // counterbalance forklift, top view; origin = front axle centre, forks toward -y at yaw 0
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(yaw);
    ctx.beginPath();
    ctx.moveTo(-1.75 * sc, -0.55 * sc);
    ctx.lineTo(1.75 * sc, -0.55 * sc);
    ctx.lineTo(1.75 * sc, 4.6 * sc);
    ctx.quadraticCurveTo(1.75 * sc, 5.45 * sc, 0.9 * sc, 5.45 * sc);
    ctx.lineTo(-0.9 * sc, 5.45 * sc);
    ctx.quadraticCurveTo(-1.75 * sc, 5.45 * sc, -1.75 * sc, 4.6 * sc);
    ctx.closePath();
    glow(ctx, colorA || P.machine, 1.6, 10);
    // guard + mast
    ctx.beginPath();
    ctx.rect(-1.6 * sc, 0.95 * sc, 3.2 * sc, 2.4 * sc);
    ctx.moveTo(-1.2 * sc, -0.85 * sc);
    ctx.lineTo(1.2 * sc, -0.85 * sc);
    glow(ctx, colorA || P.machine, 1.1, 6, 0.8);
    // forks
    ctx.beginPath();
    [-1, 1].forEach(function (fx) {
      ctx.rect((fx - 0.17) * sc, -5.25 * sc, 0.34 * sc, 4.1 * sc);
    });
    glow(ctx, colorA || P.machine, 1.4, 8);
    ctx.restore();
  }
  FIG.zone = {
    duration: 1.4,
    loop: true,
    still: 2.6,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var halo = (d.mode || "halo") === "halo";
      var R = d.radius || (halo ? 3 : 10);
      var reach = halo ? 5.72 + R : R + 3.5; // ft to fit
      var sc = Math.min(w, h) / 2 / (reach + 2.5);
      var cx = w / 2,
        cy = h / 2 + (halo ? -sc * 0.2 : 0);
      // floor grid, 1 ft (halo) or 2 ft (pedestrian)
      var step = (halo ? 1 : 2) * sc;
      ctx.save();
      ctx.strokeStyle = rgba(P.line, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var gx = cx % step; gx < w; gx += step) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
      }
      for (var gy = cy % step; gy < h; gy += step) {
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
      }
      ctx.stroke();
      ctx.restore();
      var t = s.t;
      if (halo) {
        // turn cycle: hold, confirm (amber pulse), turn 90° left (tail swings right), hold, return
        var cyc = t % 7.2;
        var turn = cyc < 1.6 ? 0 : cyc < 3.4 ? easeInOut((cyc - 1.6) / 1.8) : cyc < 5.2 ? 1 : 1 - easeInOut((cyc - 5.2) / 2.0);
        if (s.reduced) turn = 0.5;
        var yaw = -turn * (Math.PI / 2);
        var tail = 5.72;
        // halo boundary: 3 ft beyond the tail's swing
        ctx.save();
        ctx.setLineDash([7, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, (tail + R) * sc * s.r, 0, TAU);
        glow(ctx, P.crew, 1.6, 10, 0.95);
        ctx.restore();
        // swept arc of the rear corner
        ctx.beginPath();
        var from = Math.PI / 2 - 0.31,
          to = from - turn * (Math.PI / 2) - 0.0001;
        ctx.arc(cx, cy, tail * sc, Math.min(from, to), Math.max(from, to));
        glow(ctx, P.machine, 2.4, 14, 0.55 + 0.45 * turn);
        // dimension: 3 ft between swing and boundary
        var da = -Math.PI / 4;
        var x1 = cx + Math.cos(da) * tail * sc,
          y1 = cy + Math.sin(da) * tail * sc;
        var x2 = cx + Math.cos(da) * (tail + R) * sc,
          y2 = cy + Math.sin(da) * (tail + R) * sc;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        glow(ctx, P.moment, 1.5, 8, s.r);
        label(ctx, P, R + " ft", (x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10, 15, P.moment, "left", 700, s.r);
        // pre-turn check: one horn tap, eye contact → amber pulse on the ring
        var pulse = cyc > 0.6 && cyc < 1.6 ? Math.sin(((cyc - 0.6) / 1.0) * Math.PI) : 0;
        if (pulse > 0 && !s.reduced) {
          ctx.beginPath();
          ctx.arc(cx, cy, (tail + R) * sc, 0, TAU);
          glow(ctx, P.moment, 2, 18, pulse * 0.8);
        }
        machineTop(ctx, P, s, cx, cy, yaw, sc);
        // crew outside the boundary
        [[-1.2, 0.05], [0.45, 0.62], [2.1, 0.02], [2.7, 0.55]].forEach(function (c) {
          var rr = (tail + R + 2.2 + c[1] * 2) * sc;
          dot(ctx, cx + Math.cos(c[0]) * rr, cy + Math.sin(c[0]) * rr, 5, P.crew, 12, s.r);
        });
      } else {
        // pedestrian zone: machine rolls; a walker crosses; inside 10 ft the wheels stop
        var cyc2 = t % 8;
        var wx = -1.1 + (cyc2 / 8) * 2.2; // walker path across, in units of reach
        var px = cx + wx * (reach + 2) * sc,
          py = cy - 2.5 * sc;
        var dist = Math.hypot(px - cx, py - cy) / sc;
        var inside = dist <= R;
        ctx.save();
        ctx.setLineDash([7, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, R * sc * s.r, 0, TAU);
        glow(ctx, inside ? P.moment : P.crew, 1.8, inside ? 18 : 10);
        ctx.restore();
        label(ctx, P, R + " ft", cx + R * sc * 0.72 + 8, cy + R * sc * 0.72, 15, P.crew, "left", 700, s.r);
        machineTop(ctx, P, s, cx, cy + 1.5 * sc, 0, sc * 0.9);
        dot(ctx, px, py, 6, P.crew, 14, s.r);
        if (inside && !s.reduced) {
          label(ctx, P, "Wheels stop", cx, cy + (R + 1.6) * sc > h - 14 ? h - 14 : cy + (R + 1.2) * sc, 15, P.moment, "center", 700, 1, 2);
          [[-1.55, 0], [1.55, 0], [-1.35, 4.45], [1.35, 4.45]].forEach(function (wv) {
            dot(ctx, cx + wv[0] * sc * 0.9, cy + 1.5 * sc + wv[1] * sc * 0.9, 4, P.moment, 12);
          });
        }
      }
    },
  };

  /* Drop — data: {weight, height, bandLo, bandHi, max} — real free-fall time */
  FIG.drop = {
    duration: 1.2,
    loop: true,
    still: 1.93,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var W = d.weight || 2,
        H = d.height || 60,
        max = d.max || 80,
        g = 32.2;
      var top = 22,
        bot = h - 26;
      function Y(ft) {
        return bot - (ft / max) * (bot - top);
      }
      var ax = Math.min(64, w * 0.14);
      // riggers' band
      if (d.bandLo != null) {
        ctx.fillStyle = rgba(P.crew, 0.1 * s.r);
        ctx.fillRect(ax, Y(d.bandHi), w - ax - 8, Y(d.bandLo) - Y(d.bandHi));
        label(ctx, P, "Riggers " + d.bandLo + "–" + d.bandHi + " ft", w - 12, Y(d.bandHi) + 13, 12, P.crew, "right", 600, s.r, 1.2);
      }
      // axis
      ctx.beginPath();
      ctx.moveTo(ax, Y(0));
      ctx.lineTo(ax, Y(max));
      ctx.strokeStyle = rgba(P.soft, 0.6);
      ctx.lineWidth = 1;
      ctx.stroke();
      for (var f = 0; f <= max; f += 10) {
        ctx.beginPath();
        ctx.moveTo(ax - 5, Y(f));
        ctx.lineTo(ax, Y(f));
        ctx.stroke();
        label(ctx, P, f, ax - 10, Y(f), 11, P.soft, "right", 600);
      }
      label(ctx, P, "ft", ax - 10, top - 12, 10, P.soft, "right", 600);
      // floor
      ctx.beginPath();
      ctx.moveTo(ax, Y(0));
      ctx.lineTo(w - 8, Y(0));
      glow(ctx, P.soft, 1, 4, 0.5);
      var colX = ax + (w - ax) * 0.42;
      // drop height marker
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(colX - 26, Y(H));
      ctx.lineTo(colX + 26, Y(H));
      glow(ctx, P.crew, 1.2, 6, s.r);
      ctx.restore();
      label(ctx, P, W + " lb from " + H + " ft", colX + 34, Y(H), 14, P.crew, "left", 700, s.r, 1);
      // fall cycle: real time t = √(2h/g), then a beat to read the numbers
      var T = Math.sqrt((2 * H) / g);
      var cyc = s.reduced ? T : (s.t % (T + 2.2));
      var tt = Math.min(cyc, T);
      var y = H - 0.5 * g * tt * tt;
      var v = g * tt;
      // trail
      for (var k = 1; k < 7; k++) {
        var yk = Math.min(H, y + k * v * 0.02);
        dot(ctx, colX, Y(yk), 4 - k * 0.45, P.moment, 6, 0.5 / k);
      }
      dot(ctx, colX, Y(Math.max(0, y)), 5.5, P.moment, 18);
      if (cyc >= T) {
        var k2 = s.reduced ? 1 : clamp((cyc - T) / 0.5, 0, 1);
        ctx.beginPath();
        ctx.ellipse(colX, Y(0), 10 + 60 * k2, 4 + 10 * k2, 0, 0, TAU);
        glow(ctx, P.moment, 1.6, 14, 1 - k2 * 0.6);
        var vmph = Math.sqrt(2 * g * H) * 0.681818;
        label(ctx, P, Math.round(vmph) + " mph · " + num(W * H) + " ft·lb", colX + 34, Y(0) - 16, 15, P.moment, "left", 700, Math.min(1, k2 * 2), 1);
      }
    },
  };

  /* Capacity vs reach — the Safety Engine's teaching model.
     data: {rated, grounds:[{key,label,derate}], ground, reach, load, boom, maxReach, verdict} */
  function boomFactor(a) {
    if (a == null) return 1;
    a = clamp(a, 0, 90);
    return a >= 60 ? 1 : 1 - ((60 - a) / 60) * 0.15;
  }
  FIG.capacity = {
    duration: 1.6,
    loop: false,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data,
        pv = s.prev || d,
        k = s.tween;
      function tw(name, fb) {
        var a = pv[name] == null ? fb : pv[name],
          b = d[name] == null ? fb : d[name];
        return typeof a === "number" && typeof b === "number" ? a + (b - a) * k : b;
      }
      var rated = d.rated || 10000;
      var maxR = d.maxReach || 30;
      var boom = boomFactor(tw("boom", 60));
      var padL = 58,
        padR = 16,
        padT = 30,
        padB = 34;
      function X(r) {
        return padL + (r / maxR) * (w - padL - padR);
      }
      function Y(c) {
        return h - padB - (c / rated) * (h - padT - padB);
      }
      // grid + axes
      ctx.strokeStyle = rgba(P.line, 0.45);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var c = 0; c <= rated; c += 2500) {
        ctx.moveTo(padL, Y(c));
        ctx.lineTo(w - padR, Y(c));
      }
      ctx.stroke();
      for (var c2 = 0; c2 <= rated; c2 += 2500) label(ctx, P, num(c2), padL - 8, Y(c2), 11, P.soft, "right", 600);
      for (var r = 0; r <= maxR; r += 5) label(ctx, P, r, X(r), h - padB + 14, 11, P.soft, "center", 600);
      label(ctx, P, "Reach (ft)", w - padR, h - 8, 11, P.soft, "right", 600, 0.9, 1.2);
      label(ctx, P, "Capacity (lb)", padL - 50, 10, 11, P.soft, "left", 600, 0.9, 1.2);
      // one curve per ground surface
      var grounds = d.grounds || [];
      var cur = d.ground;
      var n = 90;
      grounds.forEach(function (gd) {
        var active = gd.key === cur || grounds.length <= 2;
        ctx.beginPath();
        var upto = Math.max(2, Math.round(n * s.r));
        for (var i = 0; i <= upto; i++) {
          var rr = (i / n) * maxR;
          var cap = rated * gd.derate * (4 / (4 + rr)) * boom;
          if (i === 0) ctx.moveTo(X(rr), Y(cap));
          else ctx.lineTo(X(rr), Y(cap));
        }
        if (active) glow(ctx, gd.key === cur ? P.machine : P.soft, gd.key === cur ? 2.4 : 1.6, gd.key === cur ? 14 : 4, gd.key === cur ? 1 : 0.75);
        else {
          ctx.strokeStyle = rgba(P.soft, 0.22);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        if (active && s.r > 0.95) {
          // stronger curve labels above its line, the weaker below, so two never collide
          var strongest = grounds.every(function (o) {
            return o.derate <= gd.derate;
          });
          var lr = maxR * (strongest ? 0.62 : 0.8);
          var lc = rated * gd.derate * (4 / (4 + lr)) * boom;
          label(ctx, P, gd.label + " ×" + gd.derate.toFixed(2), X(lr), Y(lc) + (strongest ? -13 : 14), 12, gd.key === cur ? P.machine : P.soft, "center", 700);
        }
      });
      // operating point + requested load
      if (d.reach != null && cur) {
        var gcur = grounds.filter(function (g0) {
          return g0.key === cur;
        })[0];
        if (gcur) {
          var reach = tw("reach", 0);
          var capNow = rated * gcur.derate * (4 / (4 + Math.max(0, reach))) * boom;
          var load = tw("load", 0);
          var over = d.load > rated * gcur.derate * (4 / (4 + Math.max(0, d.reach))) * boomFactor(d.boom);
          var col = d.verdict === "BLOCKER" ? P.stop : over ? P.stop : P.go;
          if (load > 0) {
            ctx.save();
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(padL, Y(Math.min(load, rated)));
            ctx.lineTo(w - padR, Y(Math.min(load, rated)));
            glow(ctx, col, 1.4, 8, 0.9 * s.r);
            ctx.restore();
            label(ctx, P, "Load " + num(d.load) + " lb", w - padR, Y(Math.min(load, rated)) - 11, 12, col, "right", 700, s.r);
          }
          ctx.beginPath();
          ctx.moveTo(X(Math.min(reach, maxR)), Y(0));
          ctx.lineTo(X(Math.min(reach, maxR)), Y(capNow));
          ctx.strokeStyle = rgba(P.moment, 0.5 * s.r);
          ctx.lineWidth = 1;
          ctx.stroke();
          dot(ctx, X(Math.min(reach, maxR)), Y(capNow), 5.5, P.moment, 16, s.r);
          label(ctx, P, num(capNow) + " lb at " + Math.round(reach) + " ft", X(Math.min(reach, maxR)) + 10, Y(capNow) - 14, 13, P.moment, X(reach) > w * 0.7 ? "right" : "left", 700, s.r);
        }
      }
    },
  };

  /* Shift hours — data: {max, relief} */
  FIG.shift = {
    duration: 2.6,
    loop: true,
    still: 3,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var max = d.max || 18,
        rel = d.relief || 14;
      var x0 = 24,
        x1 = w - 24,
        y = h * 0.56;
      function X(v) {
        return x0 + (v / max) * (x1 - x0);
      }
      // track
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.strokeStyle = rgba(P.line, 0.8);
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.lineCap = "butt";
      // degraded zone after the relief line
      var grd = ctx.createLinearGradient(X(rel), 0, X(max), 0);
      grd.addColorStop(0, rgba(P.stop, 0.35));
      grd.addColorStop(1, rgba(P.stop, 0.05));
      ctx.fillStyle = grd;
      ctx.fillRect(X(rel), y - 26, X(max) - X(rel), 52);
      for (var v = 0; v <= max; v += 2) {
        ctx.beginPath();
        ctx.moveTo(X(v), y + 10);
        ctx.lineTo(X(v), y + 16);
        ctx.strokeStyle = rgba(P.soft, 0.7);
        ctx.lineWidth = 1;
        ctx.stroke();
        label(ctx, P, v + "h", X(v), y + 28, 11, P.soft, "center", 600);
      }
      // relief line
      ctx.beginPath();
      ctx.moveTo(X(rel), y - 34);
      ctx.lineTo(X(rel), y + 20);
      glow(ctx, P.moment, 2, 14, s.r);
      label(ctx, P, rel + "+ h · request relief", X(rel), y - 46, 14, P.moment, X(rel) > w * 0.7 ? "right" : "center", 700, s.r, 1);
      // the shift, filling hour by hour
      var cyc = s.reduced ? 1 : (s.t % 6.5) / 4.2;
      var hrs = Math.min(1, cyc) * rel;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(X(hrs), y);
      ctx.lineCap = "round";
      glow(ctx, hrs >= rel - 0.01 ? P.stop : P.machine, 5, 14);
      ctx.lineCap = "butt";
      dot(ctx, X(hrs), y, 7, hrs >= rel - 0.01 ? P.stop : P.machine, 16);
    },
  };

  /* Capstone panel — data: {time, shift, load, wind, limit, riggers, truck} */
  FIG.panel = {
    duration: 3.0,
    loop: true,
    still: 4,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var cols = w < 520 ? 2 : 3,
        rows = Math.ceil(6 / cols);
      var gap = 10,
        tw = (w - gap * (cols + 1)) / cols,
        th = (h - gap * (rows + 1)) / rows;
      var tiles = [
        { k: "Time", v: d.time || "02:00", c: P.moment },
        { k: "Shift", v: (d.shift || 14) + " h in", c: P.stop, g: (d.shift || 14) / 18 },
        { k: "Load", v: num(d.load || 10000) + " lb", c: P.machine, g: 1 },
        { k: "Wind", v: (d.wind || 17) + " mph", c: P.stop, g: (d.wind || 17) / 35, lim: (d.limit || 15) / 35 },
        { k: "Riggers", v: (d.riggers || 60) + " ft above", c: P.crew, g: (d.riggers || 60) / 80 },
        { k: "Truck rolls", v: "in " + (d.truck || 45) + " min", c: P.soft },
      ];
      tiles.forEach(function (tl, i) {
        var cx = gap + (i % cols) * (tw + gap),
          cy = gap + Math.floor(i / cols) * (th + gap);
        var on = s.reduced ? 1 : easeOut((s.r * 6.4 - i) / 1.2);
        ctx.save();
        ctx.globalAlpha = 0.25 + 0.75 * on;
        ctx.strokeStyle = rgba(tl.c, 0.25 + 0.5 * on);
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 0.5, cy + 0.5, tw - 1, th - 1);
        ctx.fillStyle = rgba(tl.c, 0.05 * on);
        ctx.fillRect(cx, cy, tw, th);
        ctx.restore();
        label(ctx, P, tl.k, cx + 12, cy + 16, 11, P.soft, "left", 600, 1, 1.8);
        label(ctx, P, tl.v, cx + 12, cy + th * 0.52, Math.min(30, th * 0.32), tl.c, "left", 700, 0.3 + 0.7 * on);
        if (tl.g != null) {
          var bx = cx + 12,
            by = cy + th - 16,
            bw = tw - 24;
          ctx.fillStyle = rgba(P.line, 0.7);
          ctx.fillRect(bx, by, bw, 3);
          ctx.fillStyle = rgba(tl.c, 0.9);
          ctx.shadowColor = rgba(tl.c);
          ctx.shadowBlur = 10;
          ctx.fillRect(bx, by, bw * tl.g * on, 3);
          ctx.shadowBlur = 0;
          if (tl.lim != null) {
            ctx.fillStyle = rgba(P.ink, 0.9);
            ctx.fillRect(bx + bw * tl.lim - 1, by - 5, 2, 13);
          }
        }
      });
      // every hazard at once: the frame pulses when all six are lit
      if (!s.reduced && s.r >= 1) {
        var pulse = 0.5 + 0.5 * Math.sin(s.t * 2.2);
        ctx.save();
        ctx.strokeStyle = rgba(P.moment, 0.25 + 0.35 * pulse);
        ctx.shadowColor = rgba(P.moment);
        ctx.shadowBlur = 16 * pulse;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(2, 2, w - 4, h - 4);
        ctx.restore();
      }
    },
  };

  /* Flush-Fork Rule — data: {fork: 48, cart: 36} (inches), side view */
  FIG.forks = {
    duration: 1.4,
    loop: true,
    still: 5,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var fork = d.fork || 48,
        cart = d.cart || 36;
      // Span: exposed length on your side (fork − cart) + fork; heights drawn flattened.
      var span = fork + (fork - cart);
      var sc = Math.min((w - 150) / span, (h * 0.5) / 26);
      var cartX = (w - span * sc) / 2 + (fork - cart) * sc,
        floor = h * 0.78;
      var cartTop = floor - 22 * sc;
      // cart
      ctx.beginPath();
      ctx.rect(cartX, cartTop, cart * sc, 19 * sc);
      glow(ctx, P.soft, 1.3, 4, 0.8);
      [0.15, 0.85].forEach(function (f) {
        dot(ctx, cartX + cart * sc * f, floor - 2.5 * sc, 2.5 * sc, P.soft, 0, 0.6);
      });
      label(ctx, P, cart + " in cart", cartX + (cart * sc) / 2, cartTop - 14, 13, P.soft, "center", 700);
      // floor
      ctx.beginPath();
      ctx.moveTo(10, floor);
      ctx.lineTo(w - 10, floor);
      ctx.strokeStyle = rgba(P.line, 0.8);
      ctx.lineWidth = 1;
      ctx.stroke();
      // cycle: wrong (pushed through) → right (flush, extra length on your side)
      var cyc = s.reduced ? 4.8 : s.t % 8;
      var wrong = cyc < 3.4;
      var ins = wrong ? easeInOut(Math.min(1, cyc / 1.4)) * fork : cart;
      if (!wrong && cyc < 4.6) ins = fork - easeInOut((cyc - 3.4) / 1.2) * (fork - cart);
      var tipX = cartX + ins * sc;
      var heelX = tipX - fork * sc;
      var fy = floor - 9 * sc;
      // mast/carriage
      ctx.beginPath();
      ctx.moveTo(heelX, fy + 2);
      ctx.lineTo(heelX, fy - 26 * sc);
      glow(ctx, P.machine, 2.4, 10);
      // fork blade
      ctx.beginPath();
      ctx.moveTo(heelX, fy);
      ctx.lineTo(tipX, fy);
      ctx.lineTo(tipX - 3, fy - 3);
      glow(ctx, P.machine, 2.4, 12);
      var protrude = tipX - (cartX + cart * sc);
      if (protrude > 1) {
        ctx.beginPath();
        ctx.moveTo(cartX + cart * sc, fy);
        ctx.lineTo(tipX, fy);
        glow(ctx, P.stop, 3.2, 18);
        label(ctx, P, "exposed tips", tipX + 8, fy + 14, 13, P.stop, "left", 700);
      }
      label(ctx, P, fork + " in fork", (heelX + tipX) / 2, fy + 18, 13, P.machine, "center", 700);
      var ok = !wrong && cyc >= 4.6;
      label(ctx, P, ok ? "✓ tips flush · extra length on your side" : wrong ? "✕ pushed all the way through" : "", 14, 22, 14, ok ? P.go : P.stop, "left", 700, wrong || ok ? 1 : 0, 1);
    },
  };

  /* Scores — data: {rows:[{label, pct|null, passed}], pass} */
  FIG.bars = {
    duration: 1.6,
    loop: false,
    draw: function (ctx, w, h, s) {
      var P = s.P,
        d = s.data;
      var rows = d.rows || [],
        pass = d.pass || 80;
      var padL = Math.min(170, w * 0.36),
        padR = 44,
        top = 26,
        rh = (h - top - 12) / Math.max(1, rows.length);
      function X(v) {
        return padL + (v / 100) * (w - padL - padR);
      }
      // pass mark
      ctx.beginPath();
      ctx.moveTo(X(pass), top - 12);
      ctx.lineTo(X(pass), h - 8);
      glow(ctx, P.moment, 1.4, 10, 0.9);
      label(ctx, P, pass + "% pass mark", X(pass), 10, 11, P.moment, "center", 700, 1, 1);
      rows.forEach(function (row, i) {
        var y = top + i * rh + rh / 2;
        ctx.save();
        ctx.font = "500 " + Math.min(12, rh * 0.62) + "px " + P.sans;
        ctx.fillStyle = rgba(P.soft);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        var t = row.label;
        while (ctx.measureText(t).width > padL - 14 && t.length > 4) t = t.slice(0, -2);
        if (t !== row.label) t = t.replace(/\s+\S*$/, "") + "…";
        ctx.fillText(t, padL - 10, y);
        ctx.restore();
        ctx.fillStyle = rgba(P.line, 0.5);
        ctx.fillRect(padL, y - rh * 0.18, w - padL - padR, rh * 0.36);
        if (row.pct == null) return;
        var c = row.passed ? P.go : P.stop;
        var ww = (X(row.pct) - padL) * easeOut(s.r * 1.2 - i * 0.03);
        ctx.save();
        ctx.fillStyle = rgba(c, 0.9);
        ctx.shadowColor = rgba(c);
        ctx.shadowBlur = 10;
        ctx.fillRect(padL, y - rh * 0.18, Math.max(0, ww), rh * 0.36);
        ctx.restore();
        label(ctx, P, row.pct + "%", padL + Math.max(0, ww) + 6, y, Math.min(12, rh * 0.62), c, "left", 700);
      });
    },
  };

  F.__mount = function (el, inst) {
    var name = el.getAttribute("data-fx");
    if (name === "route") return Route(el, inst);
    var def = FIG[name];
    if (!def) return null;
    return Figure(el, inst, def);
  };
  F.defs = FIG;
})();

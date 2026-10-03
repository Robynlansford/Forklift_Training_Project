/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "plate" · the module-page hero (match-cut)
   Over each module's photo: that module's own icon (the same Lucide glyph the
   curriculum assigns it) is drawn in beacon light, holds, then breaks into
   motes that drift off as haze through the frame — the lesson's symbol
   dissolving into the real scene. Then only slow haze and an occasional light
   sweep remain. The photo is never covered: this layer only adds light.
   Reads the glyph from an inline <svg data-lp-icon> inside the section.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};

  var PVS =
    "#version 300 es\nlayout(location=0) in vec4 aP; uniform vec2 uRes; uniform float uT; uniform float uBreak; uniform vec2 uC; uniform float uS; uniform float uPx;\n" +
    "out float vA; out float vK;\n" +
    "float h(float n){ return fract(sin(n*91.7)*43758.5453); }\n" +
    "void main(){ vec2 home = uC + aP.xy*uS; float id = aP.z;\n" +
    " float k = clamp(uBreak,0.0,1.0); float e = 1.0-pow(1.0-k,3.0);\n" +
    " vec2 dir = normalize(aP.xy + vec2(h(id)-0.5, h(id+3.1)-0.5)*0.8 + 1e-3);\n" +
    " float t = uT*(0.25+h(id+7.0)*0.5);\n" +
    " vec2 drift = vec2(sin(t*0.9+id)*14.0 + t*9.0*(h(id+1.3)-0.35), cos(t*0.7+id*1.3)*9.0 - t*4.0);\n" +
    " vec2 p = home + (dir*uRes.y*(0.18+0.42*h(id+5.0)) + drift*uPx)*e;\n" +
    " p = mod(p + uRes*0.2, uRes*1.4) - uRes*0.2;\n" +
    " gl_Position = vec4(p/uRes*2.0-1.0, 0.0, 1.0); gl_Position.y = -gl_Position.y;\n" +
    " gl_PointSize = mix(3.0, 2.0 + h(id+9.0)*3.0, e)*uPx;\n" +
    " vA = mix(1.0, 0.18 + 0.25*h(id+2.0), e); vK = h(id+4.0); }";
  var PFS =
    "#version 300 es\nprecision highp float; in float vA; in float vK; uniform vec3 uA; uniform vec3 uB; uniform float uOn; out vec4 o;\n" +
    "void main(){ vec2 q = gl_PointCoord*2.0-1.0; float r = dot(q,q); if(r>1.0) discard; o = vec4(mix(uA,uB,step(0.72,vK))*vA*uOn*(1.0-r), 0.0); }";
  var SWEEP_FS =
    "#version 300 es\nprecision highp float; in vec2 vUv; uniform float uX; uniform vec3 uC; out vec4 o;\n" +
    "void main(){ float b = vUv.x*0.9 + vUv.y*0.35 - uX; float k = exp(-b*b*90.0); o = vec4(uC*k, 0.0); }";

  /** Sample the Lucide glyph into polylines (24×24 viewBox units, centred). */
  function sampleIcon(svg) {
    var polys = [];
    var els = svg.querySelectorAll("path,circle,line,rect,polyline,polygon,ellipse");
    for (var i = 0; i < els.length; i++) {
      var g = els[i];
      if (!g.getTotalLength) continue;
      var len = 0;
      try {
        len = g.getTotalLength();
      } catch (e) {
        continue;
      }
      if (!len) continue;
      var step = 0.35,
        cur = [],
        prev = null;
      for (var s = 0; s <= len + 0.001; s += step) {
        var pt = g.getPointAtLength(Math.min(s, len));
        var q = [pt.x - 12, pt.y - 12];
        if (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) > step * 3) {
          if (cur.length > 1) polys.push(cur);
          cur = [];
        }
        cur.push(q);
        prev = q;
      }
      if (cur.length > 1) polys.push(cur);
    }
    return polys;
  }

  L.scenes.plate = {
    init: function (gl, canvas, opts) {
      var G = L.gl,
        lin = L.lin;
      this.gl = gl;
      this.opts = opts;
      opts.post.alphaMode = 1;
      opts.post.bloom = 1.05;
      opts.post.threshold = 0.45;
      opts.post.vignette = 0;
      opts.post.fringe = 0.006;
      var svg = opts.el.querySelector("svg[data-lp-icon]");
      var polys = svg ? sampleIcon(svg) : [];
      var total = 0;
      polys.forEach(function (p) {
        total += p.length;
      });
      var pen = new G.Pen();
      pen.color(lin("--color-accent", 2.2)).width(2.2);
      var run = 0,
        pts = [];
      polys.forEach(function (p) {
        for (var k = 0; k < p.length - 1; k++) {
          pen.order((run + k) / Math.max(1, total)).seg([p[k][0], p[k][1], 0], [p[k + 1][0], p[k + 1][1], 0]);
        }
        run += p.length;
        p.forEach(function (q, j) {
          if (j % 2 === 0) pts.push(q);
        });
      });
      this.empty = !pen.segs.length;
      this.lines = G.lines(gl, pen.segs.length ? pen.segs : [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]]);
      var pd = new Float32Array(pts.length * 4);
      pts.forEach(function (q, i) {
        pd.set([q[0] / 12, q[1] / 12, i + 1, 0], i * 4);
      });
      this.np = pts.length;
      this.pprog = G.program(gl, PVS, PFS);
      this.pbuf = G.buffer(gl, pd);
      this.pvao = G.vao(gl, [{ loc: 0, buf: this.pbuf, size: 4 }]);
      this.sweep = G.program(gl, G.QUAD_VS, SWEEP_FS);
      this.qbuf = G.buffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
      this.qvao = G.vao(gl, [{ loc: 0, buf: this.qbuf, size: 2 }]);
      this.C = { a: lin("--color-accent", 1.6), b: lin("--color-amber", 1.8), sweep: lin("--color-amber", 0.014) };
      this.start = -1;
    },
    resize: function (w, h, px) {
      this.w = w;
      this.h = h;
      this.px = px;
    },
    frame: function (t, p, dt) {
      var gl = this.gl,
        M4 = L.M4,
        S = L.math.smooth;
      if (this.start < 0) this.start = t;
      // ?lpt= freezes the clock: read it as the plate's own timeline so captures work.
      var lt = L.state.frozenTime != null ? t : t - this.start;
      var wide = this.w / this.h > 1.4;
      var cx = this.w * (wide ? 0.8 : 0.5),
        cy = this.h * 0.5;
      var size = this.h * (wide ? 0.34 : 0.3); // half-extent of the 24-unit glyph, in px
      // Icon: draw-in 0–1.3 s, hold, fade 2.6–3.6 s as it breaks into motes
      var reveal = S(0.15, 1.35, lt);
      var hold = 1 - S(2.5, 3.5, lt);
      var brk = S(2.4, 4.2, lt);
      // orthographic: glyph units → NDC around (cx, cy)
      var sx = (size / 12) * (2 / this.w),
        sy = (size / 12) * (2 / this.h);
      var ox = (cx / this.w) * 2 - 1,
        oy = 1 - (cy / this.h) * 2;
      var vp = [sx, 0, 0, 0, 0, -sy, 0, 0, 0, 0, 1, 0, ox, oy, 0, 1];
      this.vp = vp;
      if (!this.empty && hold > 0.001) {
        this.lines.param(0, reveal, hold * (0.85 + 0.15 * Math.sin(lt * 6)), 1);
        this.lines.draw({ vp: vp, eye: [0, 0, 10], w: this.w, h: this.h, px: this.px }, [0, 0], false, 1, t);
      }
      // Motes: sit on the glyph while it draws, then scatter into drifting haze
      if (this.np) {
        gl.useProgram(this.pprog.prog);
        var u = this.pprog.u;
        gl.uniform2f(u.uRes, this.w, this.h);
        gl.uniform1f(u.uT, Math.max(0, lt - 2.4));
        gl.uniform1f(u.uBreak, brk);
        gl.uniform2f(u.uC, cx, cy);
        gl.uniform1f(u.uS, size);
        gl.uniform1f(u.uPx, this.px);
        gl.uniform3fv(u.uA, this.C.a);
        gl.uniform3fv(u.uB, this.C.b);
        gl.uniform1f(u.uOn, reveal * (0.35 + 0.65 * S(2.2, 2.8, lt)));
        gl.bindVertexArray(this.pvao);
        gl.drawArrays(gl.POINTS, 0, this.np);
        gl.bindVertexArray(null);
      }
      // An occasional slow light sweep across the plate
      var cyc = (lt % 9) / 9;
      gl.useProgram(this.sweep.prog);
      gl.uniform1f(this.sweep.u.uX, -0.4 + cyc * 2.0);
      gl.uniform3fv(this.sweep.u.uC, this.C.sweep);
      gl.bindVertexArray(this.qvao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);
    },
    dispose: function () {
      var gl = this.gl;
      this.lines.dispose();
      gl.deleteProgram(this.pprog.prog);
      gl.deleteProgram(this.sweep.prog);
      gl.deleteBuffer(this.pbuf);
      gl.deleteBuffer(this.qbuf);
      gl.deleteVertexArray(this.pvao);
      gl.deleteVertexArray(this.qvao);
    },
  };
})();

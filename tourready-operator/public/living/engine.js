/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — engine v1 · TourReady Operator
   Boise AI · www.BOISE-AI.com

   One shared runtime for every scene and figure on the site:
     · lazy script loading (scenes only load when their section is near)
     · pinned scroll films: progress mapping + [data-at] beat fades
     · one render loop, paused off-screen and in hidden tabs
     · per-scene WebGL2 context with a shared post chain:
         HDR (RGBA16F) → dual-filter bloom → neutral tone map (hue-preserving)
         → chromatic fringe → vignette → fine grain → alpha = brightness
     · adaptive resolution from measured frame time
     · prefers-reduced-motion + no-WebGL2 + context-loss fallbacks (poster stays)
     · card/button light: pointer position published as --mx / --my
   Test hooks:  ?lp=0.5 (freeze scroll progress) · ?lpt=3000 (freeze clock, ms)
                ?lprm (force reduced motion) · ?lpnogl (force no-WebGL fallback)
                ?lpdebug (fps overlay)        · window.Living.state · window.__ready
   Scene API (scenes register themselves on window.Living.scenes[name]):
     init(gl, canvas, opts) · frame(t, progress, dt) · resize(w, h) · dispose()
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var W = window;
  var L = (W.Living = W.Living || {});
  L.scenes = L.scenes || {};
  L.figures = L.figures || {};
  if (L.__engine) return;
  L.__engine = true;

  /* ── Environment ─────────────────────────────────────────────────────── */
  var me = document.currentScript;
  var BASE = me ? me.src.replace(/engine\.js.*$/, "") : "/living/";
  var VERSION = (me && (me.src.match(/[?&]v=([^&]+)/) || [])[1]) || "1";
  var qs = new URLSearchParams(location.search);
  var P_FIX = qs.has("lp") ? clamp(parseFloat(qs.get("lp")) || 0, 0, 1) : null;
  var T_FIX = qs.has("lpt") ? (parseFloat(qs.get("lpt")) || 0) / 1000 : null;
  var DEBUG = qs.has("lpdebug");
  var FORCE_NOGL = qs.has("lpnogl");
  var mqReduce = W.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = mqReduce.matches || qs.has("lprm");
  var phone =
    W.matchMedia("(max-width: 640px)").matches ||
    (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 700);
  var DPR_CAP = phone ? 1.5 : 1.6;

  L.base = BASE;
  L.version = VERSION;
  L.reduced = reduced;
  L.phone = phone;
  L.state = {
    version: VERSION,
    reduced: reduced,
    phone: phone,
    webgl2: null,
    ready: false,
    frozenProgress: P_FIX,
    frozenTime: T_FIX,
    instances: [],
  };
  W.__ready = false;

  /* ── Small math ──────────────────────────────────────────────────────── */
  function clamp(x, a, b) {
    return x < a ? a : x > b ? b : x;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a || 1e-9), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function mix(a, b, t) {
    if (typeof a === "number") return a + (b - a) * t;
    var o = new Array(a.length);
    for (var i = 0; i < a.length; i++) o[i] = a[i] + (b[i] - a[i]) * t;
    return o;
  }
  /** Keyframe track: keys = [[p, value], ...] sorted by p. Smoothstep between keys. */
  function track(keys, p, ease) {
    if (p <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) {
      if (p <= keys[i][0]) {
        var k0 = keys[i - 1],
          k1 = keys[i];
        var t = (p - k0[0]) / (k1[0] - k0[0] || 1e-9);
        t = ease === "linear" ? t : t * t * (3 - 2 * t);
        return mix(k0[1], k1[1], t);
      }
    }
    return keys[keys.length - 1][1];
  }
  /** Catmull-Rom through vec3 points, t in 0..1 over the whole path. */
  function spline(pts, t) {
    var n = pts.length - 1;
    var f = clamp(t, 0, 1) * n;
    var i = Math.min(Math.floor(f), n - 1);
    var u = f - i;
    var p0 = pts[Math.max(i - 1, 0)],
      p1 = pts[i],
      p2 = pts[i + 1],
      p3 = pts[Math.min(i + 2, n)];
    var u2 = u * u,
      u3 = u2 * u;
    var o = [0, 0, 0];
    for (var k = 0; k < 3; k++) {
      o[k] =
        0.5 *
        (2 * p1[k] +
          (-p0[k] + p2[k]) * u +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 +
          (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3);
    }
    return o;
  }
  function hash(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  L.math = { clamp: clamp, lerp: lerp, smooth: smooth, mix: mix, track: track, spline: spline, hash: hash };

  /* ── Matrices (column-major, like GL) ─────────────────────────────────── */
  var M4 = {
    ident: function () {
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },
    persp: function (fovY, aspect, near, far) {
      var f = 1 / Math.tan(fovY / 2),
        nf = 1 / (near - far);
      return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    },
    lookAt: function (e, c, up) {
      var zx = e[0] - c[0],
        zy = e[1] - c[1],
        zz = e[2] - c[2];
      var zl = Math.hypot(zx, zy, zz) || 1;
      zx /= zl;
      zy /= zl;
      zz /= zl;
      var u = up || [0, 1, 0];
      var xx = u[1] * zz - u[2] * zy,
        xy = u[2] * zx - u[0] * zz,
        xz = u[0] * zy - u[1] * zx;
      var xl = Math.hypot(xx, xy, xz) || 1;
      xx /= xl;
      xy /= xl;
      xz /= xl;
      var yx = zy * xz - zz * xy,
        yy = zz * xx - zx * xz,
        yz = zx * xy - zy * xx;
      return [
        xx, yx, zx, 0,
        xy, yy, zy, 0,
        xz, yz, zz, 0,
        -(xx * e[0] + xy * e[1] + xz * e[2]),
        -(yx * e[0] + yy * e[1] + yz * e[2]),
        -(zx * e[0] + zy * e[1] + zz * e[2]),
        1,
      ];
    },
    mul: function (a, b) {
      var o = new Array(16);
      for (var c = 0; c < 4; c++)
        for (var r = 0; r < 4; r++) {
          o[c * 4 + r] =
            a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
      return o;
    },
    /** Translation + Y rotation + X pitch + uniform scale — enough for every rig here. */
    trs: function (x, y, z, yaw, pitch, s) {
      s = s == null ? 1 : s;
      var cy = Math.cos(yaw || 0),
        sy = Math.sin(yaw || 0),
        cp = Math.cos(pitch || 0),
        sp = Math.sin(pitch || 0);
      // R = Ry(yaw) * Rx(pitch)
      return [
        cy * s, 0, -sy * s, 0,
        sy * sp * s, cp * s, cy * sp * s, 0,
        sy * cp * s, -sp * s, cy * cp * s, 0,
        x, y, z, 1,
      ];
    },
    xform: function (m, p) {
      var x = p[0],
        y = p[1],
        z = p[2];
      var w = m[3] * x + m[7] * y + m[11] * z + m[15];
      return [
        (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
        (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
        (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
        w,
      ];
    },
  };
  L.M4 = M4;

  /* ── Colour: resolve any CSS colour (tokens included) through a canvas ── */
  var cctx = null,
    ccache = {};
  function css(c) {
    if (ccache[c]) return ccache[c];
    if (!cctx) {
      var cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      cctx = cv.getContext("2d", { willReadFrequently: true });
    }
    cctx.clearRect(0, 0, 1, 1);
    cctx.fillStyle = "#000";
    cctx.fillStyle = c;
    cctx.fillRect(0, 0, 1, 1);
    var d = cctx.getImageData(0, 0, 1, 1).data;
    return (ccache[c] = [d[0] / 255, d[1] / 255, d[2] / 255]);
  }
  function s2l(v) {
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  /** Read a CSS custom property (a design token) from an element or :root. */
  function token(name, el, fallback) {
    var v = getComputedStyle(el || document.documentElement).getPropertyValue(name).trim();
    return v || fallback || "#ffffff";
  }
  /** Token or CSS colour → linear-light RGB, multiplied by intensity k. */
  function lin(c, k) {
    if (c.charAt(0) === "-") c = token(c);
    var s = css(c);
    k = k == null ? 1 : k;
    return [s2l(s[0]) * k, s2l(s[1]) * k, s2l(s[2]) * k];
  }
  L.token = token;
  L.lin = lin;
  L.srgb = function (c) {
    if (c.charAt(0) === "-") c = token(c);
    return css(c);
  };

  /* ── Script loading ──────────────────────────────────────────────────── */
  var loads = {};
  function load(path) {
    if (loads[path]) return loads[path];
    loads[path] = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = BASE + path + "?v=" + VERSION;
      s.async = true;
      s.onload = function () {
        res();
      };
      s.onerror = function () {
        delete loads[path];
        rej(new Error("Living: failed to load " + path));
      };
      document.head.appendChild(s);
    });
    return loads[path];
  }
  L.load = load;

  /* ── WebGL helpers (shared by every scene) ───────────────────────────── */
  var GLK = {};
  GLK.shader = function (gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error("Living shader: " + log);
    }
    return s;
  };
  /** Compile + link; returns { prog, u: {name: location} } with uniforms auto-collected. */
  GLK.program = function (gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, GLK.shader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, GLK.shader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Living link: " + gl.getProgramInfoLog(p));
    var u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var info = gl.getActiveUniform(p, i);
      var name = info.name.replace(/\[0\]$/, "");
      u[name] = gl.getUniformLocation(p, info.name);
    }
    return { prog: p, u: u };
  };
  GLK.buffer = function (gl, data, target, usage) {
    var b = gl.createBuffer();
    gl.bindBuffer(target || gl.ARRAY_BUFFER, b);
    gl.bufferData(target || gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
    return b;
  };
  /** attrs: [{loc, buf, size, stride, offset, divisor, type}] → VAO */
  GLK.vao = function (gl, attrs, index) {
    var v = gl.createVertexArray();
    gl.bindVertexArray(v);
    attrs.forEach(function (a) {
      gl.bindBuffer(gl.ARRAY_BUFFER, a.buf);
      gl.enableVertexAttribArray(a.loc);
      gl.vertexAttribPointer(a.loc, a.size, a.type || gl.FLOAT, false, a.stride || 0, a.offset || 0);
      if (a.divisor) gl.vertexAttribDivisor(a.loc, a.divisor);
    });
    if (index) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bindVertexArray(null);
    return v;
  };
  GLK.QUAD_VS =
    "#version 300 es\nlayout(location=0) in vec2 aP; out vec2 vUv; void main(){ vUv = aP*0.5+0.5; gl_Position = vec4(aP,0.0,1.0); }";

  /* Thick glowing lines — the backbone of every schematic in this site.
     Segments carry: a, b (vec3), colour (linear rgb, pre-multiplied by intensity),
     group (0..23: per-group transform + reveal/intensity), width (css px), order (0..1).
     A group's reveal draws segments in `order`, so objects can be "drawn in" by light. */
  var LINE_VS =
    "#version 300 es\n" +
    "precision highp float;\n" +
    "layout(location=0) in vec2 aC;\n" +
    "layout(location=1) in vec3 aA;\n" +
    "layout(location=2) in vec3 aB;\n" +
    "layout(location=3) in vec4 aCol;\n" +
    "layout(location=4) in vec2 aW;\n" +
    "uniform mat4 uVP; uniform vec2 uRes; uniform float uPx;\n" +
    "uniform mat4 uGM[24]; uniform vec4 uGP[24]; uniform vec3 uGC[24];\n" +
    "uniform vec3 uEye; uniform vec2 uFog; uniform float uRefl; uniform float uReflK; uniform float uTime;\n" +
    "out vec3 vCol; out float vSide;\n" +
    "void main(){\n" +
    "  int g = int(aCol.a + 0.5); vec4 gp = uGP[g];\n" +
    "  vec4 wa = uGM[g] * vec4(aA,1.0); vec4 wb = uGM[g] * vec4(aB,1.0);\n" +
    "  if (uRefl > 0.5) { wa.y = -wa.y; wb.y = -wb.y;\n" +
    "    float r = sin(uTime*1.7 + wa.z*0.35)*0.06; wa.x += r; wb.x += r; }\n" +
    "  vec4 ca = uVP * wa; vec4 cb = uVP * wb;\n" +
    "  float nw = 0.05;\n" +
    "  if (ca.w < nw && cb.w < nw) { gl_Position = vec4(2.0,2.0,2.0,1.0); vCol = vec3(0.0); vSide = 0.0; return; }\n" +
    "  if (ca.w < nw) { ca = mix(ca, cb, (nw - ca.w)/(cb.w - ca.w)); }\n" +
    "  if (cb.w < nw) { cb = mix(cb, ca, (nw - cb.w)/(ca.w - cb.w)); }\n" +
    "  vec2 sa = ca.xy/ca.w, sb = cb.xy/cb.w;\n" +
    "  vec2 d = (sb - sa) * uRes; float dl = length(d);\n" +
    "  vec2 dir = dl > 1e-5 ? d/dl : vec2(1.0,0.0); vec2 n = vec2(-dir.y, dir.x);\n" +
    "  vec4 c = mix(ca, cb, aC.x);\n" +
    "  float w = max(aW.x * gp.z * uPx, 1.0);\n" +
    "  c.xy += n * aC.y * (w / uRes) * c.w;\n" +
    "  c.xy += dir * (aC.x*2.0-1.0) * (w*0.5 / uRes) * c.w;\n" +
    "  gl_Position = c;\n" +
    "  vec3 wp = mix(wa.xyz, wb.xyz, aC.x);\n" +
    "  float fog = exp(-uFog.x * max(distance(wp, uEye) - uFog.y, 0.0));\n" +
    "  float vis = 1.0 - smoothstep(gp.x*1.04 - 0.02, gp.x*1.04, aW.y);\n" +
    "  vCol = aCol.rgb * uGC[g] * gp.y * fog * vis * uReflK;\n" +
    "  vSide = aC.y;\n" +
    "}";
  var LINE_FS =
    "#version 300 es\nprecision highp float;\nin vec3 vCol; in float vSide; out vec4 o;\n" +
    "void main(){ float a = 1.0 - smoothstep(0.25, 1.0, abs(vSide)); o = vec4(vCol * a, 0.0); }";

  /** Build a line batch. segs: [[ax,ay,az, bx,by,bz, r,g,b, group, widthPx, order], ...] */
  GLK.lines = function (gl, segs) {
    var n = segs.length;
    var data = new Float32Array(n * 12);
    for (var i = 0; i < n; i++) {
      var s = segs[i],
        o = i * 12;
      data[o] = s[0];
      data[o + 1] = s[1];
      data[o + 2] = s[2];
      data[o + 3] = s[3];
      data[o + 4] = s[4];
      data[o + 5] = s[5];
      data[o + 6] = s[6];
      data[o + 7] = s[7];
      data[o + 8] = s[8];
      data[o + 9] = s[9];
      data[o + 10] = s[10];
      data[o + 11] = s[11];
    }
    var prog = gl.__lineProg || (gl.__lineProg = GLK.program(gl, LINE_VS, LINE_FS));
    var corner = gl.__lineCorner || (gl.__lineCorner = GLK.buffer(gl, new Float32Array([0, -1, 1, -1, 0, 1, 1, 1])));
    var inst = GLK.buffer(gl, data);
    var vao = GLK.vao(gl, [
      { loc: 0, buf: corner, size: 2 },
      { loc: 1, buf: inst, size: 3, stride: 48, offset: 0, divisor: 1 },
      { loc: 2, buf: inst, size: 3, stride: 48, offset: 12, divisor: 1 },
      { loc: 3, buf: inst, size: 4, stride: 48, offset: 24, divisor: 1 },
      { loc: 4, buf: inst, size: 2, stride: 48, offset: 40, divisor: 1 },
    ]);
    var GM = new Float32Array(24 * 16),
      GP = new Float32Array(24 * 4),
      GC = new Float32Array(24 * 3);
    for (var g = 0; g < 24; g++) {
      GM.set(M4.ident(), g * 16);
      GP.set([1, 1, 1, 0], g * 4);
      GC.set([1, 1, 1], g * 3);
    }
    return {
      count: n,
      GM: GM,
      GP: GP,
      /** Set a group's transform (mat4 array) */
      mat: function (g, m) {
        GM.set(m, g * 16);
      },
      /** Tint a group (linear rgb multiplier; default white). */
      tint: function (g, rgb) {
        GC.set(rgb, g * 3);
      },
      /** reveal 0..1, intensity, width multiplier */
      param: function (g, reveal, intensity, widthMul) {
        GP[g * 4] = reveal == null ? 1 : reveal;
        GP[g * 4 + 1] = intensity == null ? 1 : intensity;
        GP[g * 4 + 2] = widthMul == null ? 1 : widthMul;
      },
      /** cam: {vp, eye}; fog: [density, start]; refl: 0|1; reflK: intensity */
      draw: function (cam, fog, refl, reflK, time) {
        gl.useProgram(prog.prog);
        gl.uniformMatrix4fv(prog.u.uVP, false, cam.vp);
        gl.uniform2f(prog.u.uRes, cam.w, cam.h);
        gl.uniform1f(prog.u.uPx, cam.px);
        gl.uniformMatrix4fv(prog.u.uGM, false, GM);
        gl.uniform4fv(prog.u.uGP, GP);
        gl.uniform3fv(prog.u.uGC, GC);
        gl.uniform3fv(prog.u.uEye, cam.eye);
        gl.uniform2fv(prog.u.uFog, fog || [0, 0]);
        gl.uniform1f(prog.u.uRefl, refl ? 1 : 0);
        gl.uniform1f(prog.u.uReflK, reflK == null ? 1 : reflK);
        gl.uniform1f(prog.u.uTime, time || 0);
        gl.bindVertexArray(vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
        gl.bindVertexArray(null);
      },
      dispose: function () {
        gl.deleteBuffer(inst);
        gl.deleteVertexArray(vao);
      },
    };
  };

  /** Segment builder with a current colour/group/width, so geometry code reads like drawing. */
  GLK.Pen = function () {
    this.segs = [];
    this.c = [1, 1, 1];
    this.g = 0;
    this.w = 1.5;
    this.o = 0;
  };
  GLK.Pen.prototype = {
    color: function (rgb) {
      this.c = rgb;
      return this;
    },
    group: function (g) {
      this.g = g;
      this.o = 0; // a new group never inherits the previous group's draw-in order
      return this;
    },
    width: function (w) {
      this.w = w;
      return this;
    },
    order: function (o) {
      this.o = o;
      return this;
    },
    seg: function (a, b) {
      var c = this.c;
      this.segs.push([a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], this.g, this.w, this.o]);
      return this;
    },
    poly: function (pts, closed) {
      for (var i = 0; i < pts.length - 1; i++) this.seg(pts[i], pts[i + 1]);
      if (closed && pts.length > 2) this.seg(pts[pts.length - 1], pts[0]);
      return this;
    },
    /** Poly whose `order` ramps o0→o1 along its length (for draw-on reveals). */
    polyReveal: function (pts, o0, o1) {
      for (var i = 0; i < pts.length - 1; i++) {
        this.o = o0 + (o1 - o0) * ((i + 1) / (pts.length - 1));
        this.seg(pts[i], pts[i + 1]);
      }
      return this;
    },
    /** Axis-aligned box edges from min to max. */
    box: function (mn, mx) {
      var x0 = mn[0],
        y0 = mn[1],
        z0 = mn[2],
        x1 = mx[0],
        y1 = mx[1],
        z1 = mx[2];
      this.poly([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], true);
      this.poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], true);
      this.seg([x0, y0, z0], [x0, y1, z0]).seg([x1, y0, z0], [x1, y1, z0]);
      this.seg([x1, y0, z1], [x1, y1, z1]).seg([x0, y0, z1], [x0, y1, z1]);
      return this;
    },
    /** Circle: centre, radius, axis 'x'|'y'|'z', segments, optional arc [a0,a1]. */
    circle: function (c, r, axis, n, a0, a1) {
      n = n || 24;
      a0 = a0 || 0;
      a1 = a1 == null ? Math.PI * 2 : a1;
      var pts = [];
      for (var i = 0; i <= n; i++) {
        var a = a0 + ((a1 - a0) * i) / n,
          ca = Math.cos(a) * r,
          sa = Math.sin(a) * r;
        pts.push(
          axis === "x" ? [c[0], c[1] + ca, c[2] + sa] : axis === "z" ? [c[0] + ca, c[1] + sa, c[2]] : [c[0] + ca, c[1], c[2] + sa]
        );
      }
      return this.poly(pts, false);
    },
    dashed: function (a, b, dash, gap) {
      var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      var len = Math.hypot(d[0], d[1], d[2]);
      var step = dash + gap;
      for (var s = 0; s < len; s += step) {
        var e = Math.min(s + dash, len);
        this.seg(
          [a[0] + (d[0] * s) / len, a[1] + (d[1] * s) / len, a[2] + (d[2] * s) / len],
          [a[0] + (d[0] * e) / len, a[1] + (d[1] * e) / len, a[2] + (d[2] * e) / len]
        );
      }
      return this;
    },
  };
  L.gl = GLK;

  /* ── Post chain ──────────────────────────────────────────────────────── */
  var DOWN_FS =
    "#version 300 es\nprecision highp float; in vec2 vUv; uniform sampler2D uT; uniform vec2 uHp; uniform float uThresh; uniform float uFirst; out vec4 o;\n" +
    "vec3 pre(vec3 c){ if(uFirst<0.5) return c; float br=max(c.r,max(c.g,c.b)); float k=0.5; float soft=clamp(br-uThresh+k,0.0,2.0*k); soft=soft*soft/(4.0*k+1e-4); float w=max(soft, br-uThresh)/max(br,1e-4); return c*w; }\n" +
    "void main(){ vec3 s = pre(texture(uT,vUv).rgb)*4.0;" +
    " s += pre(texture(uT,vUv-uHp).rgb); s += pre(texture(uT,vUv+uHp).rgb);" +
    " s += pre(texture(uT,vUv+vec2(uHp.x,-uHp.y)).rgb); s += pre(texture(uT,vUv-vec2(uHp.x,-uHp.y)).rgb);" +
    " o = vec4(s/8.0,1.0); }";
  var UP_FS =
    "#version 300 es\nprecision highp float; in vec2 vUv; uniform sampler2D uT; uniform vec2 uHp; out vec4 o;\n" +
    "void main(){ vec3 s = texture(uT,vUv+vec2(-uHp.x*2.0,0.0)).rgb;" +
    " s += texture(uT,vUv+vec2(-uHp.x,uHp.y)).rgb*2.0; s += texture(uT,vUv+vec2(0.0,uHp.y*2.0)).rgb;" +
    " s += texture(uT,vUv+vec2(uHp.x,uHp.y)).rgb*2.0; s += texture(uT,vUv+vec2(uHp.x*2.0,0.0)).rgb;" +
    " s += texture(uT,vUv+vec2(uHp.x,-uHp.y)).rgb*2.0; s += texture(uT,vUv+vec2(0.0,-uHp.y*2.0)).rgb;" +
    " s += texture(uT,vUv+vec2(-uHp.x,-uHp.y)).rgb*2.0; o = vec4(s/12.0,1.0); }";
  var COMP_FS =
    "#version 300 es\nprecision highp float; in vec2 vUv;\n" +
    "uniform sampler2D uScene; uniform sampler2D uBloom; uniform float uBloomK; uniform float uExposure;\n" +
    "uniform vec3 uTint; uniform float uFringe; uniform float uVig; uniform float uGrain; uniform float uTime;\n" +
    "uniform float uAlphaMode; uniform vec2 uRes; uniform vec3 uBg; out vec4 o;\n" +
    // Khronos PBR Neutral: keeps brand hues (safety orange stays orange) where ACES bleaches them.
    "vec3 neutral(vec3 c){ float x=min(c.r,min(c.g,c.b)); float off = x<0.08 ? x-6.25*x*x : 0.04; c-=off;" +
    " float pk=max(c.r,max(c.g,c.b)); const float sc=0.76; if(pk<sc) return c; const float d=1.0-sc;" +
    " float np=1.0-d*d/(pk+d-sc); c*=np/pk; float g=1.0-1.0/(0.15*(pk-np)+1.0); return mix(c,vec3(np),g); }\n" +
    "vec3 toSrgb(vec3 c){ c=max(c,0.0); return mix(c*12.92, 1.055*pow(c,vec3(1.0/2.4))-0.055, step(0.0031308,c)); }\n" +
    "float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n" +
    "void main(){ vec2 cc = vUv-0.5; float r2 = dot(cc,cc);\n" +
    " vec2 off = cc*uFringe*r2*0.9;\n" +
    " vec3 s; s.r = texture(uScene, vUv+off).r; s.g = texture(uScene, vUv).g; s.b = texture(uScene, vUv-off).b;\n" +
    " vec3 b = texture(uBloom, vUv).rgb;\n" +
    " vec3 c = (s + b*uBloomK) * uExposure * uTint;\n" +
    " c = neutral(c);\n" +
    " c *= mix(1.0, smoothstep(0.95, 0.15, r2*2.2), uVig);\n" +
    " vec3 outc = toSrgb(c);\n" +
    " outc += (h(vUv*uRes + fract(uTime)*97.0)-0.5)*uGrain;\n" +
    " if (uAlphaMode > 0.5) { float a = clamp(max(outc.r,max(outc.g,outc.b)),0.0,1.0); o = vec4(max(outc,0.0), a); }\n" +
    " else { o = vec4(max(outc,0.0), 1.0); } }";

  function Post(gl) {
    this.gl = gl;
    this.half = !!gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");
    this.down = GLK.program(gl, GLK.QUAD_VS, DOWN_FS);
    this.up = GLK.program(gl, GLK.QUAD_VS, UP_FS);
    this.comp = GLK.program(gl, GLK.QUAD_VS, COMP_FS);
    this.quad = GLK.buffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    this.vao = GLK.vao(gl, [{ loc: 0, buf: this.quad, size: 2 }]);
    this.w = this.h = 0;
    this.targets = [];
    this.settings = {
      bloom: 0.9,
      threshold: 0.55,
      exposure: 1,
      tint: [1, 1, 1],
      fringe: 0.012,
      vignette: 0.55,
      grain: 0.028,
      alphaMode: 0,
      levels: 5,
    };
  }
  Post.prototype.target = function (w, h) {
    var gl = this.gl;
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (this.half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex: tex, fb: fb, w: w, h: h };
  };
  Post.prototype.resize = function (w, h) {
    var gl = this.gl;
    if (w === this.w && h === this.h) return;
    this.free();
    this.w = w;
    this.h = h;
    this.scene = this.target(w, h);
    var tw = w,
      th = h;
    this.mips = [];
    for (var i = 0; i < this.settings.levels; i++) {
      tw = Math.max(2, tw >> 1);
      th = Math.max(2, th >> 1);
      this.mips.push(this.target(tw, th));
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  Post.prototype.free = function () {
    var gl = this.gl;
    [this.scene].concat(this.mips || []).forEach(function (t) {
      if (!t) return;
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fb);
    });
    this.scene = null;
    this.mips = [];
  };
  /** Bind the HDR scene target; scenes draw into it additively. */
  Post.prototype.begin = function (bg) {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.scene.fb);
    gl.viewport(0, 0, this.w, this.h);
    gl.clearColor(bg ? bg[0] : 0, bg ? bg[1] : 0, bg ? bg[2] : 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  Post.prototype.end = function (time) {
    var gl = this.gl,
      S = this.settings;
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    // Downsample chain
    gl.useProgram(this.down.prog);
    gl.uniform1i(this.down.u.uT, 0);
    gl.uniform1f(this.down.u.uThresh, S.threshold);
    gl.activeTexture(gl.TEXTURE0);
    var src = this.scene;
    for (var i = 0; i < this.mips.length; i++) {
      var dst = this.mips[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform2f(this.down.u.uHp, 0.5 / src.w, 0.5 / src.h);
      gl.uniform1f(this.down.u.uFirst, i === 0 ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      src = dst;
    }
    // Upsample chain (additive into the larger level)
    gl.useProgram(this.up.prog);
    gl.uniform1i(this.up.u.uT, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    for (var j = this.mips.length - 1; j > 0; j--) {
      var s2 = this.mips[j],
        d2 = this.mips[j - 1];
      gl.bindFramebuffer(gl.FRAMEBUFFER, d2.fb);
      gl.viewport(0, 0, d2.w, d2.h);
      gl.bindTexture(gl.TEXTURE_2D, s2.tex);
      gl.uniform2f(this.up.u.uHp, 0.5 / s2.w, 0.5 / s2.h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.disable(gl.BLEND);
    // Composite to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(this.comp.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.scene.tex);
    gl.uniform1i(this.comp.u.uScene, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.mips[0].tex);
    gl.uniform1i(this.comp.u.uBloom, 1);
    gl.uniform1f(this.comp.u.uBloomK, S.bloom);
    gl.uniform1f(this.comp.u.uExposure, S.exposure);
    gl.uniform3fv(this.comp.u.uTint, S.tint);
    gl.uniform1f(this.comp.u.uFringe, S.fringe);
    gl.uniform1f(this.comp.u.uVig, S.vignette);
    gl.uniform1f(this.comp.u.uGrain, S.grain);
    gl.uniform1f(this.comp.u.uTime, time);
    gl.uniform1f(this.comp.u.uAlphaMode, S.alphaMode);
    gl.uniform2f(this.comp.u.uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(null);
  };
  Post.prototype.dispose = function () {
    var gl = this.gl;
    this.free();
    gl.deleteBuffer(this.quad);
    gl.deleteVertexArray(this.vao);
    [this.down, this.up, this.comp].forEach(function (p) {
      gl.deleteProgram(p.prog);
    });
  };

  /* ── WebGL2 capability ───────────────────────────────────────────────── */
  function webgl2Available() {
    if (FORCE_NOGL) return false;
    if (L.state.webgl2 !== null) return L.state.webgl2;
    try {
      var c = document.createElement("canvas");
      var g = c.getContext("webgl2");
      L.state.webgl2 = !!g;
      // Do NOT call loseContext here: a lost context can paint opaque white elsewhere.
    } catch (e) {
      L.state.webgl2 = false;
    }
    return L.state.webgl2;
  }

  /* ── Instances ───────────────────────────────────────────────────────── */
  var insts = [];
  var vh = W.innerHeight;

  function Instance(el) {
    this.el = el;
    this.kind = el.hasAttribute("data-scene") ? "scene" : "fx";
    this.name = el.getAttribute(this.kind === "scene" ? "data-scene" : "data-fx");
    this.pin = el.hasAttribute("data-pin");
    this.data = Object.assign({}, el.__lpPending || {});
    this.visible = false;
    this.near = false;
    this.loading = false;
    this.live = false;
    this.failed = false;
    this.frames = 0;
    this.progress = 0;
    this.t0 = performance.now();
    this.scale = 1;
    this.ema = 16;
    this.slow = 0;
    this.fast = 0;
    this.rect = null;
    this.beats = [];
    el.__lp = this;
  }

  Instance.prototype.collectBeats = function () {
    var list = this.el.querySelectorAll("[data-at]");
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var parts = list[i].getAttribute("data-at").split(",").map(parseFloat);
      out.push({ el: list[i], a: parts[0], b: parts[1], f: parts[2] || 0.035, o: -1 });
    }
    this.beats = out;
  };

  Instance.prototype.start = function () {
    var self = this;
    var el = this.el;
    el.classList.add("lp-mounted");
    if (this.kind === "fx") {
      this.loading = true;
      load("fx.js")
        .then(function () {
          if (self.dead) return;
          self.fx = L.figures.__mount(el, self);
          self.live = !!self.fx;
          self.loading = false;
          checkReady();
        })
        .catch(function () {
          self.failed = true;
          self.loading = false;
          checkReady();
        });
      return;
    }
    // Pinned films run their beats even without WebGL (poster stays as the backdrop),
    // but never under reduced motion: that path is the static poster + stacked beats.
    if (this.pin && !reduced) {
      this.collectBeats();
      el.classList.add("lp-pinned");
      this.bindFocus();
    }
    if (reduced || !webgl2Available()) {
      el.classList.add(reduced ? "lp-still" : "lp-nogl");
      this.failed = true;
      checkReady();
      return;
    }
    this.loading = true;
    var needs = (el.getAttribute("data-needs") || "").split(/\s+/).filter(Boolean);
    Promise.all(needs.map(load))
      .then(function () {
        return load("scenes/" + self.name + ".js");
      })
      .then(function () {
        if (self.dead) return;
        self.initGL();
        self.loading = false;
        checkReady();
      })
      .catch(function (e) {
        if (DEBUG) console.warn(e);
        self.loading = false;
        self.fallback();
      });
  };

  Instance.prototype.fallback = function () {
    this.failed = true;
    this.live = false;
    this.el.classList.remove("lp-live");
    this.el.classList.add("lp-nogl");
    checkReady();
  };

  Instance.prototype.initGL = function () {
    var self = this;
    var scene = L.scenes[this.name];
    if (!scene) return this.fallback();
    var canvas = this.el.querySelector("canvas.lp-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "lp-canvas";
      canvas.setAttribute("aria-hidden", "true");
      this.el.appendChild(canvas);
    }
    this.canvas = canvas;
    var gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) return this.fallback();
    this.gl = gl;
    canvas.addEventListener(
      "webglcontextlost",
      (this.onLost = function (e) {
        e.preventDefault();
        self.lost = true;
        self.fallback();
      })
    );
    try {
      this.post = new Post(gl);
      this.scene = Object.create(scene);
      this.opts = {
        el: this.el,
        canvas: canvas,
        post: this.post.settings,
        data: this.data,
        quality: phone ? 0.5 : 1,
        phone: phone,
        living: L,
        project: function (p) {
          return self.project(p);
        },
      };
      this.scene.init(gl, canvas, this.opts);
      this.resize(true);
      // First frame now, outside rAF: a hidden tab still gets a real picture.
      this.render(performance.now(), 0);
      this.live = true;
      this.el.classList.add("lp-live");
    } catch (e) {
      if (DEBUG) console.error(e);
      this.fallback();
    }
  };

  Instance.prototype.resize = function (force) {
    if (!this.canvas) return;
    // Size is read in the loop's read pass (cw/ch) so this never forces a reflow.
    var cw = this.cw || this.canvas.clientWidth,
      ch = this.ch || this.canvas.clientHeight;
    if (!cw || !ch) return;
    var dpr = Math.min(W.devicePixelRatio || 1, DPR_CAP) * this.scale;
    var w = Math.max(2, Math.round(cw * dpr)),
      h = Math.max(2, Math.round(ch * dpr));
    if (!force && w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.cssW = cw;
    this.cssH = ch;
    this.px = dpr;
    this.post.resize(w, h);
    if (this.scene.resize) this.scene.resize(w, h, dpr);
  };

  /** World point → CSS px inside the canvas (for DOM labels). Scenes publish this.vp. */
  Instance.prototype.project = function (p) {
    var vp = this.scene && this.scene.vp;
    if (!vp) return null;
    var c = M4.xform(vp, p);
    if (c[3] <= 0) return null;
    return { x: (c[0] * 0.5 + 0.5) * this.cssW, y: (0.5 - c[1] * 0.5) * this.cssH, z: c[2] };
  };

  Instance.prototype.render = function (now, dt) {
    var t = T_FIX != null ? T_FIX : (now - this.t0) / 1000;
    var gl = this.gl;
    this.post.begin(this.scene.clear || null);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    this.scene.frame(t, this.progress, T_FIX != null ? 0 : dt);
    this.post.end(t);
    this.frames++;
  };

  Instance.prototype.bindFocus = function () {
    var self = this;
    this.onFocus = function (e) {
      var beat = e.target.closest && e.target.closest("[data-at]");
      if (!beat || !self.el.classList.contains("lp-pinned")) return;
      var parts = beat.getAttribute("data-at").split(",").map(parseFloat);
      var mid = clamp((parts[0] + Math.min(parts[1], 1)) / 2, 0, 1);
      var r = self.el.getBoundingClientRect();
      var top = r.top + W.scrollY + mid * (r.height - vh);
      W.scrollTo({ top: top, behavior: "auto" });
    };
    this.el.addEventListener("focusin", this.onFocus);
  };

  Instance.prototype.updateBeats = function (p) {
    for (var i = 0; i < this.beats.length; i++) {
      var b = this.beats[i];
      var inA = b.a <= 0 ? 1 : smooth(b.a - b.f, b.a, p);
      var outB = b.b >= 1 ? 1 : 1 - smooth(b.b, b.b + b.f, p);
      var o = Math.round(inA * outB * 1000) / 1000;
      if (o === b.o) continue;
      b.o = o;
      b.el.style.setProperty("--lp-o", o);
      b.el.classList.toggle("lp-on", o > 0.5);
    }
  };

  Instance.prototype.destroy = function () {
    this.dead = true;
    if (this.onFocus) this.el.removeEventListener("focusin", this.onFocus);
    if (this.fx && this.fx.destroy) this.fx.destroy();
    if (this.scene && this.scene.dispose) {
      try {
        this.scene.dispose();
      } catch (e) {}
    }
    if (this.post && !this.lost) this.post.dispose();
    if (this.canvas && this.onLost) this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.el.classList.remove("lp-mounted", "lp-live", "lp-pinned", "lp-still", "lp-nogl");
    this.beats.forEach(function (b) {
      b.el.style.removeProperty("--lp-o");
      b.el.classList.remove("lp-on");
    });
    delete this.el.__lp;
    var i = insts.indexOf(this);
    if (i >= 0) insts.splice(i, 1);
    publish();
  };

  /* ── Public mount API (the React bridge calls these) ─────────────────── */
  L.mount = function (el) {
    if (!el) return null;
    if (el.__lp) return el.__lp;
    try {
      var inst = new Instance(el);
      insts.push(inst);
      kick();
      return inst;
    } catch (e) {
      if (DEBUG) console.warn("Living.mount", e);
      return null;
    }
  };
  L.unmount = function (el) {
    try {
      if (el && el.__lp) el.__lp.destroy();
    } catch (e) {
      if (DEBUG) console.warn("Living.unmount", e);
    }
  };
  /** Push data into a mounted scene/figure (e.g. simulator inputs, saved progress). */
  // Never throws: the Living layer must not be able to break the page it decorates.
  L.set = function (el, data) {
    if (!el) return;
    try {
      var inst = el.__lp;
      if (!inst) {
        el.__lpPending = Object.assign(el.__lpPending || {}, data);
        return;
      }
      Object.assign(inst.data, data);
      inst.dirty = true;
      if (inst.scene && typeof inst.scene.onData === "function") inst.scene.onData(inst.data);
      if (inst.fx && typeof inst.fx.onData === "function") inst.fx.onData(inst.data);
    } catch (e) {
      if (DEBUG) console.warn("Living.set", e);
    }
  };
  /** Mount everything already in the DOM (plain HTML pages). */
  L.scan = function (root) {
    (root || document).querySelectorAll("[data-scene],[data-fx]").forEach(L.mount);
  };

  /* ── Loop ────────────────────────────────────────────────────────────── */
  var running = false,
    last = 0,
    fpsEl = null,
    fpsAcc = 0,
    fpsN = 0;
  function kick() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
    // rAF never fires in a hidden tab; one timed tick still mounts + paints.
    setTimeout(function () {
      if (document.visibilityState !== "visible") step(performance.now());
    }, 120);
  }
  function loop(now) {
    if (!insts.length) {
      running = false;
      return;
    }
    step(now);
    requestAnimationFrame(loop);
  }
  function step(now) {
    var dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    vh = W.innerHeight;
    var i, inst, r;
    // Pass 1 — reads only.
    for (i = 0; i < insts.length; i++) {
      inst = insts[i];
      r = inst.el.getBoundingClientRect();
      inst.rect = r;
      inst.visible = r.bottom > 0 && r.top < vh && r.width > 0;
      inst.near = r.bottom > -vh * 1.5 && r.top < vh * 2.5;
      if (inst.canvas && inst.visible) {
        inst.cw = inst.canvas.clientWidth;
        inst.ch = inst.canvas.clientHeight;
      }
      if (inst.pin && inst.el.classList.contains("lp-pinned")) {
        var run = r.height - vh;
        inst.progress = P_FIX != null ? P_FIX : run > 0 ? clamp(-r.top / run, 0, 1) : 0;
      } else {
        inst.progress = P_FIX != null ? P_FIX : clamp((vh - r.top) / (vh + r.height), 0, 1);
      }
    }
    // Pass 2 — writes + renders.
    for (i = 0; i < insts.length; i++) {
      inst = insts[i];
      if (!inst.started && inst.near) {
        inst.started = true;
        inst.start();
      }
      if (inst.beats.length) inst.updateBeats(inst.progress);
      if (!inst.visible || document.visibilityState === "hidden") continue;
      try {
        if (inst.fx && inst.fx.frame) {
          inst.fx.frame(T_FIX != null ? T_FIX : (now - inst.t0) / 1000, inst.progress, dt);
          continue;
        }
        if (!inst.live || inst.lost) continue;
        inst.resize(false);
        var t0 = performance.now();
        inst.render(now, dt);
        adapt(inst, performance.now() - t0, dt);
      } catch (e) {
        // A scene that throws mid-frame falls back to its poster; the page carries on.
        if (DEBUG) console.warn("Living frame", inst.name, e);
        if (inst.kind === "fx") inst.fx = null;
        else inst.fallback();
      }
    }
    if (DEBUG) debug(dt);
    if (!W.__ready || ++tickN % 30 === 0) checkReady();
  }
  var tickN = 0;

  /** Adaptive resolution: frame interval drives the render scale down (and back up). */
  function adapt(inst, cpu, dt) {
    if (T_FIX != null) return;
    var ms = dt * 1000;
    if (ms <= 0 || ms > 100) return;
    inst.ema = inst.ema * 0.92 + ms * 0.08;
    if (inst.ema > 24) inst.slow++;
    else inst.slow = 0;
    if (inst.ema < 14) inst.fast++;
    else inst.fast = 0;
    if (inst.slow > 45 && inst.scale > 0.5) {
      inst.scale = Math.max(0.5, inst.scale - 0.15);
      inst.slow = 0;
      inst.resize(true);
    } else if (inst.fast > 240 && inst.scale < 1) {
      inst.scale = Math.min(1, inst.scale + 0.1);
      inst.fast = 0;
      inst.resize(true);
    }
  }

  function debug(dt) {
    if (!fpsEl) {
      fpsEl = document.createElement("div");
      fpsEl.style.cssText =
        "position:fixed;left:8px;bottom:8px;z-index:9999;font:11px/1.3 ui-monospace,monospace;color:#fbbf24;background:rgba(5,8,16,.8);padding:4px 6px;border-radius:4px;pointer-events:none";
      document.body.appendChild(fpsEl);
    }
    fpsAcc += dt;
    fpsN++;
    if (fpsAcc > 0.5) {
      fpsEl.textContent =
        Math.round(fpsN / fpsAcc) +
        " fps · " +
        insts
          .map(function (i) {
            return i.name + (i.live ? "@" + i.scale.toFixed(2) : i.failed ? "×" : "…") + " p" + i.progress.toFixed(2);
          })
          .join(" · ");
      fpsAcc = 0;
      fpsN = 0;
    }
  }

  var fontsReady = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      fontsReady = true;
      checkReady();
    });
  } else fontsReady = true;

  function publish() {
    L.state.instances = insts.map(function (i) {
      return {
        name: i.name,
        kind: i.kind,
        live: i.live,
        failed: i.failed,
        visible: i.visible,
        progress: Math.round(i.progress * 1000) / 1000,
        frames: i.frames,
        scale: i.scale,
      };
    });
  }
  /** window.__ready: fonts loaded and every in-view instance has painted or fallen back. */
  function checkReady() {
    publish();
    var ok = fontsReady;
    for (var i = 0; i < insts.length && ok; i++) {
      var inst = insts[i];
      if (!inst.near) continue;
      if (inst.failed) continue;
      if (inst.kind === "fx") ok = inst.live;
      else ok = inst.live && inst.frames >= 3;
    }
    if (ok && !W.__ready) {
      W.__ready = true;
      L.state.ready = true;
      try {
        document.dispatchEvent(new CustomEvent("living:ready"));
      } catch (e) {}
      warmSoon();
    }
  }

  /* Idle warm-up: once the page is ready, start the remaining (off-screen) scenes one
     per idle period, so script parse + shader compile never lands mid-scroll. */
  var warming = false;
  function warmSoon() {
    if (warming) return;
    warming = true;
    var ric =
      W.requestIdleCallback ||
      function (fn) {
        return setTimeout(function () {
          fn({ timeRemaining: function () {
            return 8;
          } });
        }, 200);
      };
    function next() {
      var inst = null;
      for (var i = 0; i < insts.length; i++) if (!insts[i].started) {
        inst = insts[i];
        break;
      }
      if (!inst) {
        warming = false;
        return;
      }
      ric(
        function () {
          if (!inst.started) {
            inst.started = true;
            inst.start();
          }
          setTimeout(next, 250);
        },
        { timeout: 4000 }
      );
    }
    setTimeout(next, 1200);
  }

  mqReduce.addEventListener &&
    mqReduce.addEventListener("change", function (e) {
      // Honour a live switch: remount everything under the new preference.
      reduced = L.reduced = L.state.reduced = e.matches || qs.has("lprm");
      insts.slice().forEach(function (i) {
        var el = i.el;
        i.destroy();
        L.mount(el);
      });
    });
  document.addEventListener("visibilitychange", function () {
    last = performance.now();
  });

  /* ── Card / button light: publish pointer position as --mx/--my ─────── */
  var lightTarget = null,
    lx = 0,
    ly = 0,
    lpend = false;
  document.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType === "touch") return;
      var t = e.target && e.target.closest && e.target.closest(".lp-light");
      if (lightTarget && lightTarget !== t) lightTarget.style.removeProperty("--lp-lit");
      lightTarget = t;
      if (!t) return;
      lx = e.clientX;
      ly = e.clientY;
      if (lpend) return;
      lpend = true;
      requestAnimationFrame(function () {
        lpend = false;
        if (!lightTarget) return;
        var r = lightTarget.getBoundingClientRect();
        lightTarget.style.setProperty("--mx", (((lx - r.left) / r.width) * 100).toFixed(1) + "%");
        lightTarget.style.setProperty("--my", (((ly - r.top) / r.height) * 100).toFixed(1) + "%");
        lightTarget.style.setProperty("--lp-lit", "1");
      });
    },
    { passive: true }
  );

  document.documentElement.classList.add("lp-js");
  if (reduced) document.documentElement.classList.add("lp-reduced");
  if (W.__livingQueue) W.__livingQueue.forEach(L.mount);
})();

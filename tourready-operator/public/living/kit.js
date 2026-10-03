/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — kit v1 · the load-out world, drawn in light
   Geometry (units: feet) + the render passes the 3D scenes share:
     forklift · telehandler · road case · trailer · ramp · truss · person
     vector glyphs · floor (grid, light pools, wet sheen) · volumetric beams
     haze motes lit by the beams · rain streaks · glow sprites
   Every builder writes into a Living.gl.Pen, so scenes compose them freely.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || {});
  var G = L.gl;
  var K = (L.kit = {});
  var TAU = Math.PI * 2;

  /* ── Counterbalance forklift ─────────────────────────────────────────────
     Local frame: origin at the front-axle centre on the ground, forks point +z.
     groups: gBody (chassis, guard, mast), gLift (carriage, backrest, forks). */
  K.forklift = function (pen, gBody, gLift, col, colForks, colDim) {
    var bx = 1.75;
    pen.group(gBody).color(col).width(1.6);
    // Side profiles (both sides) + cross ties
    var prof = [
      [0.55, 0.55], [0.55, 2.3], [-3.0, 2.3], [-3.3, 3.4], [-4.9, 3.4],
      [-5.28, 3.25], [-5.45, 2.8], [-5.45, 1.0], [-5.05, 0.55],
    ];
    [-bx, bx].forEach(function (x) {
      pen.poly(prof.map(function (p) { return [x, p[1], p[0]]; }), false);
      pen.seg([x, 0.55, -5.05], [x, 0.55, -5.05 + 0.6]);
      pen.seg([x, 0.55, -3.6], [x, 0.55, -0.95]); // between the wheel arches
    });
    [0, 1, 2, 3, 4, 7].forEach(function (i) {
      pen.seg([-bx, prof[i][1], prof[i][0]], [bx, prof[i][1], prof[i][0]]);
    });
    // Counterweight shading ribs
    pen.color(colDim);
    for (var r = 0; r < 3; r++) {
      var y = 1.35 + r * 0.55;
      pen.seg([-bx, y, -5.45], [bx, y, -5.45]);
    }
    pen.color(col);
    // Overhead guard: 4 posts + roof + slats
    var roofY = 7.0;
    [-1.6, 1.6].forEach(function (x) {
      pen.seg([x, 2.3, -0.45], [x, roofY, -0.95]);
      pen.seg([x, 3.4, -3.45], [x, roofY, -3.35]);
    });
    pen.poly([[-1.6, roofY, -0.95], [1.6, roofY, -0.95], [1.6, roofY, -3.35], [-1.6, roofY, -3.35]], true);
    pen.color(colDim);
    for (var s = 1; s < 5; s++) {
      var z = -0.95 - (2.4 * s) / 5;
      pen.seg([-1.6, roofY, z], [1.6, roofY, z]);
    }
    // Seat + steering
    pen.poly([[-0.7, 2.3, -2.75], [-0.7, 3.9, -2.95], [0.7, 3.9, -2.95], [0.7, 2.3, -2.75]], false);
    pen.poly([[-0.7, 2.85, -2.7], [-0.7, 2.85, -1.9], [0.7, 2.85, -1.9], [0.7, 2.85, -2.7]], false);
    pen.seg([0, 2.3, -0.55], [0, 3.6, -1.05]);
    pen.circle([0, 3.65, -1.1], 0.5, "y", 14);
    pen.color(col);
    // Mast: two uprights + crossbars + tilt cylinders
    [-1.15, 1.15].forEach(function (x) {
      pen.seg([x, 0.35, 0.85], [x, 7.35, 0.85]);
      pen.seg([x * 0.83, 0.5, 0.95], [x * 0.83, 7.1, 0.95]);
      pen.seg([x * 0.95, 1.55, 0.3], [x, 2.45, 0.85]);
    });
    [0.9, 4.0, 7.35].forEach(function (y) {
      pen.seg([-1.15, y, 0.85], [1.15, y, 0.85]);
    });
    // Wheels (dimmer, they read as rubber)
    pen.color(colDim).width(1.3);
    [-1.55, 1.55].forEach(function (x) {
      pen.circle([x - 0.35, 0.95, 0], 0.95, "x", 22);
      pen.circle([x + 0.35, 0.95, 0], 0.95, "x", 22);
      pen.circle([x, 0.95, 0], 0.42, "x", 12);
    });
    [-1.35, 1.35].forEach(function (x) {
      pen.circle([x - 0.3, 0.75, -4.45], 0.75, "x", 18);
      pen.circle([x + 0.3, 0.75, -4.45], 0.75, "x", 18);
    });
    // Beacon housing on the guard
    pen.color(col).width(1.4);
    pen.circle([0, roofY + 0.05, -2.15], 0.2, "y", 10);
    pen.circle([0, roofY + 0.4, -2.15], 0.2, "y", 10);
    // Carriage + backrest + forks (lift group)
    pen.group(gLift).color(col).width(1.6);
    pen.poly([[-1.55, 0.3, 1.15], [1.55, 0.3, 1.15], [1.55, 1.5, 1.15], [-1.55, 1.5, 1.15]], true);
    for (var bxr = -1.4; bxr <= 1.41; bxr += 0.56) pen.seg([bxr, 1.5, 1.15], [bxr, 4.0, 1.15]);
    pen.seg([-1.45, 4.0, 1.15], [1.45, 4.0, 1.15]);
    pen.color(colForks).width(2.0);
    [-1.0, 1.0].forEach(function (x) {
      [-0.17, 0.17].forEach(function (dx) {
        var fx = x + dx;
        pen.seg([fx, 1.45, 1.2], [fx, 0.05, 1.2]);
        pen.seg([fx, 1.45, 1.35], [fx, 0.2, 1.35]);
        pen.seg([fx, 0.2, 1.35], [fx, 0.17, 5.15]);
        pen.seg([fx, 0.05, 1.2], [fx, 0.02, 5.0]);
        pen.seg([fx, 0.02, 5.0], [fx, 0.12, 5.25]);
        pen.seg([fx, 0.17, 5.15], [fx, 0.12, 5.25]);
      });
      pen.seg([x - 0.17, 0.12, 5.25], [x + 0.17, 0.12, 5.25]);
    });
    return { beacon: [0, roofY + 0.25, -2.15], forkTip: 5.25, rear: -5.45, width: 3.5 };
  };

  /* ── Telehandler (for the Safety Engine) ─────────────────────────────────
     Local: origin at the boom pivot's ground projection, boom extends +z.
     groups: gChassis, gBoom (rotates about the pivot), gTele (inner section),
     gCarriage (kept level at the tip). Pivot sits at (0, 3.4, -4.2). */
  K.telehandler = function (pen, g, col, colBoom, colDim) {
    pen.group(g.chassis).color(col).width(1.6);
    var bx = 1.9;
    [-bx, bx].forEach(function (x) {
      pen.poly(
        [[x, 1.3, 4.6], [x, 2.6, 4.6], [x, 2.9, 3.4], [x, 2.9, -6.8], [x, 2.5, -8.2], [x, 1.3, -8.2]],
        false
      );
      pen.seg([x, 1.3, -8.2], [x, 1.3, 4.6]);
    });
    pen.seg([-bx, 2.9, 3.4], [bx, 2.9, 3.4]).seg([-bx, 2.9, -6.8], [bx, 2.9, -6.8]);
    pen.seg([-bx, 1.3, 4.6], [bx, 1.3, 4.6]).seg([-bx, 1.3, -8.2], [bx, 1.3, -8.2]);
    // Cab on the left side
    var cx0 = -bx,
      cx1 = -0.35;
    pen.poly([[cx0, 2.9, 1.8], [cx0, 7.6, 1.2], [cx0, 7.6, -2.6], [cx0, 2.9, -3.0]], false);
    pen.poly([[cx1, 2.9, 1.8], [cx1, 7.6, 1.2], [cx1, 7.6, -2.6], [cx1, 2.9, -3.0]], false);
    pen.seg([cx0, 7.6, 1.2], [cx1, 7.6, 1.2]).seg([cx0, 7.6, -2.6], [cx1, 7.6, -2.6]);
    pen.color(colDim);
    pen.seg([cx0, 5.1, 1.5], [cx1, 5.1, 1.5]);
    // Wheels
    [-1.95, 1.95].forEach(function (x) {
      [2.9, -5.4].forEach(function (z) {
        pen.circle([x - 0.4, 1.9, z], 1.9, "x", 24);
        pen.circle([x + 0.4, 1.9, z], 1.9, "x", 24);
        pen.circle([x, 1.9, z], 0.8, "x", 12);
      });
    });
    // Stabilizers (front)
    pen.color(col);
    [-1, 1].forEach(function (sx) {
      pen.poly([[sx * 1.7, 2.0, 5.2], [sx * 3.2, 0.4, 5.6], [sx * 3.2, 0.0, 5.6]], false);
      pen.poly([[sx * 2.8, 0.0, 5.0], [sx * 3.6, 0.0, 5.0], [sx * 3.6, 0.0, 6.2], [sx * 2.8, 0.0, 6.2]], true);
    });
    // Boom (outer) — in boom space: pivot at origin, extends +z, length 20
    pen.group(g.boom).color(colBoom).width(1.9);
    var bw = 0.75,
      bh0 = 1.2,
      len = 20;
    pen.box([-bw, -bh0 / 2, -0.8], [bw, bh0 / 2, len]);
    pen.color(colDim).width(1.2);
    for (var i = 1; i < 8; i++) pen.seg([-bw, bh0 / 2, (len * i) / 8], [bw, bh0 / 2, (len * i) / 8]);
    // Lift cylinder hint
    pen.color(colBoom).width(1.4);
    pen.seg([0, -bh0 / 2, 5.5], [0, -2.6, 1.8]);
    // Inner telescopic section (slides along +z)
    pen.group(g.tele).color(colBoom).width(1.7);
    pen.box([-bw * 0.72, -bh0 * 0.36, 2], [bw * 0.72, bh0 * 0.36, len + 0.6]);
    // Carriage + forks at the tip (kept level by its own group transform)
    pen.group(g.carriage).color(colBoom).width(1.8);
    pen.poly([[-1.9, -0.8, 0.4], [1.9, -0.8, 0.4], [1.9, 2.4, 0.4], [-1.9, 2.4, 0.4]], true);
    [-1.2, 1.2].forEach(function (x) {
      pen.seg([x, 2.0, 0.55], [x, -0.8, 0.55]).seg([x, -0.8, 0.55], [x, -0.8, 5.2]);
    });
    return { pivot: [0, 3.4, -4.2], boomLen: len };
  };

  /* ── Road case with fork pockets and vertical ribs ─────────────────────── */
  K.roadCase = function (pen, o, s, yaw, col, colDim, withPockets) {
    // o = centre-bottom (x, y, z); s = [w, h, d]; drawn axis-aligned then rotated around o.
    var c = Math.cos(yaw || 0),
      sn = Math.sin(yaw || 0);
    function P(x, y, z) {
      return [o[0] + x * c + z * sn, o[1] + y, o[2] - x * sn + z * c];
    }
    var w = s[0] / 2,
      h = s[1],
      d = s[2] / 2,
      cb = 0.45; // caster board
    pen.color(col);
    var b = [P(-w, cb, -d), P(w, cb, -d), P(w, cb, d), P(-w, cb, d)];
    var t = [P(-w, h, -d), P(w, h, -d), P(w, h, d), P(-w, h, d)];
    pen.poly(b, true).poly(t, true);
    for (var i = 0; i < 4; i++) pen.seg(b[i], t[i]);
    // Corner brackets (the road-case read)
    pen.color(colDim);
    var k = 0.35;
    [[-w, -d], [w, -d], [w, d], [-w, d]].forEach(function (q) {
      var sx = q[0] > 0 ? -1 : 1,
        sz = q[1] > 0 ? -1 : 1;
      pen.seg(P(q[0], h - k, q[1]), P(q[0] + sx * k, h, q[1])).seg(P(q[0], h - k, q[1]), P(q[0], h - k, q[1] + sz * k));
    });
    // Ribs on the front face (z = +d)
    [-w * 0.5, 0, w * 0.5].forEach(function (x) {
      pen.seg(P(x, cb + 0.15, d), P(x, h - 0.15, d));
    });
    pen.seg(P(-w, cb + (h - cb) * 0.55, d), P(w, cb + (h - cb) * 0.55, d));
    // Casters
    [[-w + 0.3, -d + 0.3], [w - 0.3, -d + 0.3], [w - 0.3, d - 0.3], [-w + 0.3, d - 0.3]].forEach(function (q) {
      pen.seg(P(q[0], cb, q[1]), P(q[0], 0.18, q[1]));
    });
    if (withPockets) {
      pen.color(col);
      [-1.0, 1.0].forEach(function (x) {
        pen.poly([P(x - 0.3, cb + 0.05, d), P(x + 0.3, cb + 0.05, d), P(x + 0.3, cb + 0.42, d), P(x - 0.3, cb + 0.42, d)], true);
      });
    }
    return { P: P };
  };

  /* ── Box truss between two points (horizontal or vertical) ────────────── */
  K.truss = function (pen, a, b, size, col, colDim, bays) {
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    var len = Math.hypot(d[0], d[1], d[2]);
    var f = [d[0] / len, d[1] / len, d[2] / len];
    var up = Math.abs(f[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    var r = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]];
    var rl = Math.hypot(r[0], r[1], r[2]);
    r = [r[0] / rl, r[1] / rl, r[2] / rl];
    var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    var hs = size / 2;
    var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    function at(t, cx, cy) {
      return [
        a[0] + d[0] * t + (r[0] * cx + u[0] * cy) * hs,
        a[1] + d[1] * t + (r[1] * cx + u[1] * cy) * hs,
        a[2] + d[2] * t + (r[2] * cx + u[2] * cy) * hs,
      ];
    }
    pen.color(col);
    corners.forEach(function (c) {
      pen.seg(at(0, c[0], c[1]), at(1, c[0], c[1]));
    });
    pen.color(colDim);
    var n = bays || Math.max(2, Math.round(len / size));
    for (var i = 0; i <= n; i++) {
      var t0 = i / n,
        t1 = (i + 1) / n;
      for (var k = 0; k < 4; k++) {
        var c0 = corners[k],
          c1 = corners[(k + 1) % 4];
        if (i < n) pen.seg(at(t0, c0[0], c0[1]), at(t1, c1[0], c1[1]));
        pen.seg(at(t0, c0[0], c0[1]), at(t0, c1[0], c1[1]));
      }
    }
  };

  /* ── Person (crew): a clean line figure, ~5.8 ft ─────────────────────── */
  K.person = function (pen, p, yaw, pose, col) {
    var c = Math.cos(yaw || 0),
      s = Math.sin(yaw || 0);
    function P(x, y, z) {
      return [p[0] + x * c + z * s, p[1] + y, p[2] - x * s + z * c];
    }
    pen.color(col);
    pen.circle(P(0, 5.35, 0), 0.34, "y", 12);
    pen.circle(P(0, 5.35, 0), 0.34, "z", 12);
    pen.seg(P(0, 5.0, 0), P(0, 3.0, 0));
    pen.seg(P(-0.62, 4.7, 0), P(0.62, 4.7, 0));
    pen.seg(P(-0.35, 3.0, 0), P(0.35, 3.0, 0));
    pen.seg(P(-0.3, 3.0, 0), P(-0.38, 0.0, 0.05)).seg(P(0.3, 3.0, 0), P(0.38, 0.0, -0.05));
    if (pose === "armUp") {
      pen.seg(P(-0.62, 4.7, 0), P(-0.78, 3.2, 0.1));
      pen.seg(P(0.62, 4.7, 0), P(0.75, 6.7, 0.1));
    } else if (pose === "push") {
      pen.seg(P(-0.62, 4.7, 0), P(-0.55, 4.1, 1.2)).seg(P(0.62, 4.7, 0), P(0.55, 4.1, 1.2));
    } else if (pose === "stop") {
      pen.seg(P(-0.62, 4.7, 0), P(-1.8, 4.75, 0.2)).seg(P(0.62, 4.7, 0), P(1.8, 4.75, 0.2));
    } else {
      pen.seg(P(-0.62, 4.7, 0), P(-0.8, 3.1, 0.05)).seg(P(0.62, 4.7, 0), P(0.8, 3.1, 0.05));
    }
    // hi-vis band
    pen.seg(P(-0.5, 4.1, 0.02), P(0.5, 4.1, 0.02));
  };

  /* ── Vector glyphs (stroke font for S T O P and digits) ────────────────
     Coordinates in a 0..1 × 0..1.4 cell. */
  var GLYPH = {
    S: [[[0.9, 1.25], [0.75, 1.4], [0.25, 1.4], [0.1, 1.25], [0.1, 0.85], [0.25, 0.72], [0.75, 0.68], [0.9, 0.55], [0.9, 0.15], [0.75, 0], [0.25, 0], [0.1, 0.15]]],
    T: [[[0.05, 1.4], [0.95, 1.4]], [[0.5, 1.4], [0.5, 0]]],
    O: [[[0.25, 0], [0.75, 0], [0.92, 0.2], [0.92, 1.2], [0.75, 1.4], [0.25, 1.4], [0.08, 1.2], [0.08, 0.2], [0.25, 0]]],
    P: [[[0.1, 0], [0.1, 1.4], [0.72, 1.4], [0.9, 1.22], [0.9, 0.86], [0.72, 0.7], [0.1, 0.7]]],
  };
  /** Draw text in a plane: origin (baseline-left), right & up unit vectors, cell height. */
  K.text = function (pen, str, origin, right, up, h) {
    var adv = 0;
    var cw = h * 0.72;
    for (var i = 0; i < str.length; i++) {
      var gl = GLYPH[str[i]];
      if (gl) {
        gl.forEach(function (stroke) {
          pen.poly(
            stroke.map(function (q) {
              var x = adv + q[0] * cw,
                y = (q[1] / 1.4) * h;
              return [origin[0] + right[0] * x + up[0] * y, origin[1] + right[1] * x + up[1] * y, origin[2] + right[2] * x + up[2] * y];
            }),
            false
          );
        });
      }
      adv += cw * 1.22;
    }
    return adv;
  };
  /** Regular octagon outline (the STOP sign), in the plane of right/up. */
  K.octagon = function (pen, c, right, up, r) {
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var a = Math.PI / 8 + (i * TAU) / 8;
      var x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      pts.push([c[0] + right[0] * x + up[0] * y, c[1] + right[1] * x + up[1] * y, c[2] + right[2] * x + up[2] * y]);
    }
    pen.poly(pts, true);
    return pts;
  };

  /* ── Floor: dark deck, grid, pools of light, wet sheen ──────────────────── */
  var FLOOR_VS =
    "#version 300 es\nlayout(location=0) in vec2 aP; uniform mat4 uVP; uniform vec4 uRect; out vec3 vW;\n" +
    "void main(){ vec2 xz = uRect.xy + (aP*0.5+0.5)*uRect.zw; vW = vec3(xz.x, 0.0, xz.y); gl_Position = uVP*vec4(vW,1.0); }";
  var FLOOR_FS =
    "#version 300 es\nprecision highp float; in vec3 vW; out vec4 o;\n" +
    "uniform vec3 uBase; uniform vec3 uGridC; uniform vec2 uGrid; uniform vec3 uEye; uniform vec2 uFog;\n" +
    "uniform vec4 uSpot[8]; uniform vec3 uSpotC[8]; uniform int uSpots; uniform float uWet; uniform float uTime;\n" +
    "float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453); }\n" +
    "float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);" +
    " return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }\n" +
    "void main(){ vec2 p = vW.xz; float dist = distance(vW, uEye);\n" +
    " vec2 q = p/uGrid.x; vec2 fw = fwidth(q); vec2 gg = abs(fract(q-0.5)-0.5)/max(fw,1e-4);\n" +
    " float line = (1.0-min(min(gg.x,gg.y),1.0)) * (1.0-smoothstep(0.35,0.9,max(fw.x,fw.y)));\n" +
    " vec3 c = uBase + uGridC*line*uGrid.y;\n" +
    " float wet = n2(p*0.35) * n2(p*1.7+3.1);\n" +
    " for(int i=0;i<8;i++){ if(i>=uSpots) break; vec4 s = uSpot[i]; float d = length(p-s.xy)/s.z;\n" +
    "  float pool = exp(-d*d*2.4); c += uSpotC[i]*s.w*(pool*(0.55+uWet*wet*1.3) + pool*line*0.6); }\n" +
    " c *= exp(-uFog.x*max(dist-uFog.y,0.0));\n" +
    " o = vec4(c,0.0); }";
  K.Floor = function (gl, rect) {
    var prog = G.program(gl, FLOOR_VS, FLOOR_FS);
    var buf = G.buffer(gl, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    var vao = G.vao(gl, [{ loc: 0, buf: buf, size: 2 }]);
    var spots = new Float32Array(32),
      spotC = new Float32Array(24);
    var self = {
      rect: rect || [-400, -400, 800, 800],
      base: [0.004, 0.006, 0.012],
      gridC: [0.9, 0.35, 0.08],
      grid: [4, 0.05],
      wet: 0.6,
      n: 0,
      spot: function (i, x, z, radius, intensity, rgb) {
        spots.set([x, z, radius, intensity], i * 4);
        spotC.set(rgb, i * 3);
        self.n = Math.max(self.n, i + 1);
      },
      draw: function (cam, fog, time) {
        gl.useProgram(prog.prog);
        gl.uniformMatrix4fv(prog.u.uVP, false, cam.vp);
        gl.uniform4fv(prog.u.uRect, self.rect);
        gl.uniform3fv(prog.u.uBase, self.base);
        gl.uniform3fv(prog.u.uGridC, self.gridC);
        gl.uniform2fv(prog.u.uGrid, self.grid);
        gl.uniform3fv(prog.u.uEye, cam.eye);
        gl.uniform2fv(prog.u.uFog, fog || [0, 0]);
        gl.uniform4fv(prog.u.uSpot, spots);
        gl.uniform3fv(prog.u.uSpotC, spotC);
        gl.uniform1i(prog.u.uSpots, self.n);
        gl.uniform1f(prog.u.uWet, self.wet);
        gl.uniform1f(prog.u.uTime, time || 0);
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
    return self;
  };

  /* ── Volumetric beams: soft cones from fixtures ───────────────────────── */
  var BEAM_VS =
    "#version 300 es\nlayout(location=0) in vec3 aP; uniform mat4 uVP; uniform mat4 uM; out vec3 vW; out float vAx; out vec3 vN;\n" +
    "void main(){ vec4 w = uM*vec4(aP.xy*aP.z, aP.z, 1.0); vW = w.xyz; vAx = aP.z; vN = mat3(uM)*vec3(aP.xy,0.0); gl_Position = uVP*w; }";
  // aP = (cos a, sin a, z): the ring direction survives at the apex (z = 0), so the
  // normal is never normalize(0) — that NaN bled through the bloom as a black octagon.
  var BEAM_FS =
    "#version 300 es\nprecision highp float; in vec3 vW; in float vAx; in vec3 vN; out vec4 o;\n" +
    "uniform vec3 uC; uniform vec3 uEye; uniform vec2 uFog;\n" +
    "void main(){ vec3 v = normalize(uEye - vW); float f = abs(dot(normalize(vN + vec3(1e-5)), v)); f = pow(f, 1.6);\n" +
    " float ax = smoothstep(0.0, 0.08, vAx) * pow(clamp(1.0-vAx, 0.0, 1.0), 1.7);\n" +
    " float fog = exp(-uFog.x*max(distance(vW,uEye)-uFog.y,0.0));\n" +
    " o = vec4(uC*f*ax*fog, 0.0); }";
  K.Beams = function (gl) {
    var prog = G.program(gl, BEAM_VS, BEAM_FS);
    var segs = 40,
      rings = 12,
      verts = [];
    for (var r = 0; r < rings; r++) {
      var z0 = r / rings,
        z1 = (r + 1) / rings;
      for (var i = 0; i < segs; i++) {
        var a0 = (i / segs) * TAU,
          a1 = ((i + 1) / segs) * TAU;
        var q = [
          [Math.cos(a0), Math.sin(a0), z0],
          [Math.cos(a1), Math.sin(a1), z0],
          [Math.cos(a0), Math.sin(a0), z1],
          [Math.cos(a1), Math.sin(a1), z1],
        ];
        verts.push.apply(verts, q[0].concat(q[1], q[2], q[2], q[1], q[3]));
      }
    }
    var count = verts.length / 3;
    var buf = G.buffer(gl, new Float32Array(verts));
    var vao = G.vao(gl, [{ loc: 0, buf: buf, size: 3 }]);
    /** beam: {apex:[x,y,z], dir:[x,y,z] (unit), len, radius, color (linear rgb × intensity)} */
    function matFor(b) {
      var f = b.dir,
        up = Math.abs(f[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
      var r = [up[1] * f[2] - up[2] * f[1], up[2] * f[0] - up[0] * f[2], up[0] * f[1] - up[1] * f[0]];
      var rl = Math.hypot(r[0], r[1], r[2]);
      r = [r[0] / rl, r[1] / rl, r[2] / rl];
      var u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
      var R = b.radius,
        Ln = b.len;
      return [r[0] * R, r[1] * R, r[2] * R, 0, u[0] * R, u[1] * R, u[2] * R, 0, f[0] * Ln, f[1] * Ln, f[2] * Ln, 0, b.apex[0], b.apex[1], b.apex[2], 1];
    }
    return {
      draw: function (cam, beams, fog) {
        gl.useProgram(prog.prog);
        gl.uniformMatrix4fv(prog.u.uVP, false, cam.vp);
        gl.uniform3fv(prog.u.uEye, cam.eye);
        gl.uniform2fv(prog.u.uFog, fog || [0, 0]);
        gl.bindVertexArray(vao);
        for (var i = 0; i < beams.length; i++) {
          var b = beams[i];
          if (!b || (b.color[0] + b.color[1] + b.color[2]) <= 0.0001) continue;
          gl.uniformMatrix4fv(prog.u.uM, false, matFor(b));
          gl.uniform3fv(prog.u.uC, b.color);
          gl.drawArrays(gl.TRIANGLES, 0, count);
        }
        gl.bindVertexArray(null);
      },
      dispose: function () {
        gl.deleteProgram(prog.prog);
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
      },
    };
  };

  /* ── Haze motes: drift in a volume, lit by up to 6 beams ─────────────────
     Stateless GPU animation: position = f(seed, time), so scroll-freeze and
     "all motion halts" (uMotion → 0) are exact. */
  var MOTE_VS =
    "#version 300 es\nlayout(location=0) in vec4 aS; uniform mat4 uVP; uniform vec3 uMin; uniform vec3 uSize;\n" +
    "uniform float uTime; uniform float uPx; uniform vec4 uBA[6]; uniform vec4 uBD[6]; uniform vec3 uBC[6]; uniform int uNB;\n" +
    "uniform vec3 uBase; uniform vec3 uEye; uniform vec2 uFog; out vec3 vC;\n" +
    "void main(){ float t = uTime*(0.4+aS.w*0.6);\n" +
    " vec3 p = uMin + fract(aS.xyz + vec3(sin(t*0.13+aS.w*9.0)*0.02 + t*0.004, t*0.011, cos(t*0.11+aS.x*7.0)*0.02))*uSize;\n" +
    " vec3 c = uBase*(0.35+0.65*aS.w);\n" +
    " for(int i=0;i<6;i++){ if(i>=uNB) break; vec3 d = p-uBA[i].xyz; float ax = dot(d, uBD[i].xyz);\n" +
    "  if(ax>0.0 && ax<uBA[i].w){ float rad = length(d-uBD[i].xyz*ax); float cone = ax*uBD[i].w;\n" +
    "   float k = 1.0-smoothstep(cone*0.55, cone, rad); c += uBC[i]*k*(1.0-ax/uBA[i].w); } }\n" +
    " float dist = distance(p,uEye); c *= exp(-uFog.x*max(dist-uFog.y,0.0));\n" +
    " vec4 cp = uVP*vec4(p,1.0); gl_Position = cp; gl_PointSize = clamp((2.2+aS.w*2.4)*uPx*(28.0/max(cp.w,1.0)), 1.0, 9.0*uPx);\n" +
    " vC = c; }";
  var MOTE_FS =
    "#version 300 es\nprecision highp float; in vec3 vC; out vec4 o;\n" +
    "void main(){ vec2 q = gl_PointCoord*2.0-1.0; float r = dot(q,q); if(r>1.0) discard; o = vec4(vC*(1.0-r)*(1.0-r), 0.0); }";
  K.Motes = function (gl, n, min, size, seed) {
    var prog = G.program(gl, MOTE_VS, MOTE_FS);
    var d = new Float32Array(n * 4);
    var s = seed || 1;
    for (var i = 0; i < n * 4; i++) d[i] = L.math.hash(i * 1.37 + s * 11.1);
    var buf = G.buffer(gl, d);
    var vao = G.vao(gl, [{ loc: 0, buf: buf, size: 4 }]);
    var BA = new Float32Array(24),
      BD = new Float32Array(24),
      BC = new Float32Array(18);
    var self = {
      min: min,
      size: size,
      base: [0.01, 0.012, 0.02],
      nb: 0,
      /** Light the motes with beams (same objects the Beams pass draws). */
      lights: function (beams) {
        self.nb = 0;
        for (var i = 0; i < beams.length && self.nb < 6; i++) {
          var b = beams[i];
          if (!b) continue;
          var k = self.nb++;
          BA.set([b.apex[0], b.apex[1], b.apex[2], b.len], k * 4);
          BD.set([b.dir[0], b.dir[1], b.dir[2], b.radius / b.len], k * 4);
          BC.set([b.color[0] * 3.2, b.color[1] * 3.2, b.color[2] * 3.2], k * 3);
        }
      },
      draw: function (cam, time, fog) {
        gl.useProgram(prog.prog);
        gl.uniformMatrix4fv(prog.u.uVP, false, cam.vp);
        gl.uniform3fv(prog.u.uMin, self.min);
        gl.uniform3fv(prog.u.uSize, self.size);
        gl.uniform1f(prog.u.uTime, time);
        gl.uniform1f(prog.u.uPx, cam.px);
        gl.uniform4fv(prog.u.uBA, BA);
        gl.uniform4fv(prog.u.uBD, BD);
        gl.uniform3fv(prog.u.uBC, BC);
        gl.uniform1i(prog.u.uNB, self.nb);
        gl.uniform3fv(prog.u.uBase, self.base);
        gl.uniform3fv(prog.u.uEye, cam.eye);
        gl.uniform2fv(prog.u.uFog, fog || [0, 0]);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.POINTS, 0, n);
        gl.bindVertexArray(null);
      },
      dispose: function () {
        gl.deleteProgram(prog.prog);
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
      },
    };
    return self;
  };

  /* ── Rain: streaks falling through a volume ─────────────────────────────── */
  var RAIN_VS =
    "#version 300 es\nlayout(location=0) in vec2 aC; layout(location=1) in vec4 aS;\n" +
    "uniform mat4 uVP; uniform vec2 uRes; uniform float uPx; uniform vec3 uMin; uniform vec3 uSize; uniform float uTime; uniform float uSpeed; uniform vec3 uWind;\n" +
    "out float vA; out float vS;\n" +
    "void main(){ float y = fract(aS.y - uTime*uSpeed*(0.8+aS.w*0.4)/uSize.y);\n" +
    " vec3 p = uMin + vec3(aS.x, y, aS.z)*uSize; vec3 q = p - (vec3(0.0,-1.0,0.0)+uWind)*(1.2+aS.w*0.8);\n" +
    " vec4 ca = uVP*vec4(p,1.0); vec4 cb = uVP*vec4(q,1.0);\n" +
    " if(ca.w<0.1||cb.w<0.1){ gl_Position=vec4(2.0,2.0,2.0,1.0); vA=0.0; vS=0.0; return; }\n" +
    " vec2 sa=ca.xy/ca.w, sb=cb.xy/cb.w; vec2 d=(sb-sa)*uRes; float dl=length(d); vec2 dir= dl>1e-4? d/dl: vec2(0.0,1.0); vec2 n=vec2(-dir.y,dir.x);\n" +
    " vec4 c = mix(ca,cb,aC.x); c.xy += n*aC.y*(max(1.0*uPx,1.0)/uRes)*c.w; gl_Position = c;\n" +
    " vA = (0.35+aS.w*0.65) * smoothstep(0.0,0.15,y) * mix(1.0,0.3,aC.x); vS = aC.y; }";
  var RAIN_FS =
    "#version 300 es\nprecision highp float; in float vA; in float vS; uniform vec3 uC; out vec4 o;\n" +
    "void main(){ float a = 1.0-smoothstep(0.2,1.0,abs(vS)); o = vec4(uC*vA*a,0.0); }";
  K.Rain = function (gl, n, min, size) {
    var prog = G.program(gl, RAIN_VS, RAIN_FS);
    var d = new Float32Array(n * 4);
    for (var i = 0; i < n * 4; i++) d[i] = L.math.hash(i * 3.11 + 0.7);
    var corner = G.buffer(gl, new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]));
    var buf = G.buffer(gl, d);
    var vao = G.vao(gl, [
      { loc: 0, buf: corner, size: 2 },
      { loc: 1, buf: buf, size: 4, divisor: 1 },
    ]);
    var self = {
      min: min,
      size: size,
      color: [0.3, 0.4, 0.6],
      speed: 38,
      wind: [0.15, 0, 0.05],
      draw: function (cam, time) {
        gl.useProgram(prog.prog);
        gl.uniformMatrix4fv(prog.u.uVP, false, cam.vp);
        gl.uniform2f(prog.u.uRes, cam.w, cam.h);
        gl.uniform1f(prog.u.uPx, cam.px);
        gl.uniform3fv(prog.u.uMin, self.min);
        gl.uniform3fv(prog.u.uSize, self.size);
        gl.uniform1f(prog.u.uTime, time);
        gl.uniform1f(prog.u.uSpeed, self.speed);
        gl.uniform3fv(prog.u.uWind, self.wind);
        gl.uniform3fv(prog.u.uC, self.color);
        gl.bindVertexArray(vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
        gl.bindVertexArray(null);
      },
      dispose: function () {
        gl.deleteProgram(prog.prog);
        gl.deleteBuffer(buf);
        gl.deleteBuffer(corner);
        gl.deleteVertexArray(vao);
      },
    };
    return self;
  };

  /* ── Glow sprites: fixtures, beacons, the falling shackle ──────────────── */
  var GLOW_VS =
    "#version 300 es\nlayout(location=0) in vec3 aP; layout(location=1) in vec4 aC;\n" +
    "uniform mat4 uVP; uniform float uPx; out vec3 vC;\n" +
    "void main(){ vec4 c = uVP*vec4(aP,1.0); gl_Position = c; gl_PointSize = c.w>0.0 ? clamp(aC.a*uPx, 1.0, 96.0*uPx) : 0.0; vC = aC.rgb; }";
  var GLOW_FS =
    "#version 300 es\nprecision highp float; in vec3 vC; out vec4 o;\n" +
    "void main(){ vec2 q = gl_PointCoord*2.0-1.0; float r = length(q); if(r>1.0) discard;\n" +
    " float core = exp(-r*r*18.0); float halo = exp(-r*r*3.5)*0.35; o = vec4(vC*(core+halo), 0.0); }";
  K.Glows = function (gl, max) {
    var prog = G.program(gl, GLOW_VS, GLOW_FS);
    var pos = new Float32Array(max * 3),
      col = new Float32Array(max * 4);
    var bp = G.buffer(gl, pos, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
    var bc = G.buffer(gl, col, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
    var vao = G.vao(gl, [
      { loc: 0, buf: bp, size: 3 },
      { loc: 1, buf: bc, size: 4 },
    ]);
    var n = 0;
    return {
      reset: function () {
        n = 0;
      },
      /** p world pos, rgb linear × intensity, size in css px */
      add: function (p, rgb, size) {
        if (n >= max) return;
        pos.set(p, n * 3);
        col.set([rgb[0], rgb[1], rgb[2], size], n * 4);
        n++;
      },
      draw: function (cam) {
        if (!n) return;
        gl.useProgram(prog.prog);
        gl.uniformMatrix4fv(prog.u.uVP, false, cam.vp);
        gl.uniform1f(prog.u.uPx, cam.px);
        gl.bindBuffer(gl.ARRAY_BUFFER, bp);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos.subarray(0, n * 3));
        gl.bindBuffer(gl.ARRAY_BUFFER, bc);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, col.subarray(0, n * 4));
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.POINTS, 0, n);
        gl.bindVertexArray(null);
      },
      dispose: function () {
        gl.deleteProgram(prog.prog);
        gl.deleteBuffer(bp);
        gl.deleteBuffer(bc);
        gl.deleteVertexArray(vao);
      },
    };
  };

  /** Camera helper: builds vp + eye and the per-frame struct the passes expect. */
  K.camera = function (eye, target, fovDeg, w, h, px, near, far) {
    var M4 = L.M4;
    var proj = M4.persp((fovDeg * Math.PI) / 180, w / h, near || 0.5, far || 900);
    var view = M4.lookAt(eye, target, [0, 1, 0]);
    return { vp: M4.mul(proj, view), eye: eye, w: w, h: h, px: px };
  };
})();

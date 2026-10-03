/* ─────────────────────────────────────────────────────────────────────────
   LIVING PAGES — scene "stopglass" · the home CTA's glass STOP octagon
   The one command that overrides everything, as an object: red glass with a
   white STOP inlay, refracting a dark stage (one orange wash, one blue
   followspot). Slow turntable, leans toward the pointer, a glint crosses the
   face now and then. Canvas alpha = brightness, so it floats over the card.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = (window.Living = window.Living || { scenes: {} });
  L.scenes = L.scenes || {};

  var VS =
    "#version 300 es\nlayout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in vec2 aUv;\n" +
    "uniform mat4 uVP; uniform mat4 uM; out vec3 vN; out vec3 vW; out vec2 vUv; out vec3 vL;\n" +
    "void main(){ vec4 w = uM*vec4(aP,1.0); vW = w.xyz; vN = mat3(uM)*aN; vUv = aUv; vL = aP; gl_Position = uVP*w; }";
  var FS =
    "#version 300 es\nprecision highp float; in vec3 vN; in vec3 vW; in vec2 vUv; in vec3 vL; out vec4 o;\n" +
    "uniform vec3 uEye; uniform vec3 uGlass; uniform vec3 uWash; uniform vec3 uSpot; uniform vec3 uWhite; uniform sampler2D uText;\n" +
    "uniform float uTime; uniform float uGlint; uniform float uFace;\n" +
    // A dark stage as the thing the glass refracts: an orange wash low-left, a blue followspot high-right.
    "vec3 env(vec3 d){ d = normalize(d); vec3 c = vec3(0.004,0.006,0.012);\n" +
    " c += uWash * pow(max(dot(d, normalize(vec3(-0.6,-0.35,0.7))),0.0), 10.0) * 1.4;\n" +
    " c += uSpot * pow(max(dot(d, normalize(vec3(0.55,0.6,0.6))),0.0), 18.0) * 1.8;\n" +
    " c += uWash * smoothstep(-0.2,-0.9,d.y)*0.12; return c; }\n" +
    "void main(){ vec3 N = normalize(vN); vec3 V = normalize(uEye - vW); if(dot(N,V)<0.0) N = -N;\n" +
    " float fres = pow(1.0 - clamp(dot(N,V),0.0,1.0), 3.0);\n" +
    " vec3 refr = env(refract(-V, N, 1.0/1.45)) * uGlass * 2.2;\n" +
    " vec3 refl = env(reflect(-V, N)) * (0.08 + 0.9*fres);\n" +
    " vec3 body = uGlass * 0.32 + refr + refl;\n" +
    // rim light along the octagon's edge (distance from centre in local xy, face only)
    " float rr = length(vL.xy); float rim = smoothstep(0.86, 1.0, rr) * uFace;\n" +
    " body += uGlass * rim * 0.9;\n" +
    // the white inlay: sRGB texture → linear before the HDR chain
    " vec3 tx = pow(texture(uText, vUv).rgb, vec3(2.2)); body = mix(body, uWhite * 1.15, tx.r * uFace);\n" +
    // glint: a narrow band sweeping diagonally across the face
    " float band = vL.x*0.8 + vL.y*0.6; float g = exp(-pow((band - uGlint)*7.0, 2.0)) * uFace;\n" +
    " body += uWhite * g * 0.55;\n" +
    " body += uGlass * fres * 0.6;\n" +
    " o = vec4(body, 0.0); }";

  function octagonPrism(thick) {
    var pos = [],
      nrm = [],
      uv = [];
    var ring = [];
    for (var i = 0; i < 8; i++) {
      var a = Math.PI / 8 + (i * Math.PI) / 4;
      ring.push([Math.cos(a), Math.sin(a)]);
    }
    var z0 = -thick / 2,
      z1 = thick / 2;
    function push(p, n, u) {
      pos.push(p[0], p[1], p[2]);
      nrm.push(n[0], n[1], n[2]);
      uv.push(u[0], u[1]);
    }
    function uvOf(p) {
      return [p[0] * 0.5 + 0.5, p[1] * 0.5 + 0.5];
    }
    for (var k = 0; k < 8; k++) {
      var a0 = ring[k],
        a1 = ring[(k + 1) % 8];
      // front + back fans
      push([0, 0, z1], [0, 0, 1], [0.5, 0.5]);
      push([a0[0], a0[1], z1], [0, 0, 1], uvOf(a0));
      push([a1[0], a1[1], z1], [0, 0, 1], uvOf(a1));
      push([0, 0, z0], [0, 0, -1], [0.5, 0.5]);
      push([a1[0], a1[1], z0], [0, 0, -1], [0, 0]);
      push([a0[0], a0[1], z0], [0, 0, -1], [0, 0]);
      // side
      var nx = (a0[0] + a1[0]) / 2,
        ny = (a0[1] + a1[1]) / 2,
        nl = Math.hypot(nx, ny);
      var n = [nx / nl, ny / nl, 0];
      push([a0[0], a0[1], z0], n, [0, 0]);
      push([a1[0], a1[1], z0], n, [0, 0]);
      push([a1[0], a1[1], z1], n, [0, 0]);
      push([a0[0], a0[1], z0], n, [0, 0]);
      push([a1[0], a1[1], z1], n, [0, 0]);
      push([a0[0], a0[1], z1], n, [0, 0]);
    }
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uv: new Float32Array(uv), count: pos.length / 3 };
  }

  function textTexture(gl, font) {
    var c = document.createElement("canvas");
    c.width = c.height = 512;
    var x = c.getContext("2d");
    x.fillStyle = "#000";
    x.fillRect(0, 0, 512, 512);
    // the white border inset, like a real sign
    x.strokeStyle = "#fff";
    x.lineWidth = 14;
    x.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = Math.PI / 8 + (i * Math.PI) / 4;
      var px = 256 + Math.cos(a) * 226,
        py = 256 - Math.sin(a) * 226;
      if (i) x.lineTo(px, py);
      else x.moveTo(px, py);
    }
    x.closePath();
    x.stroke();
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "700 196px " + font;
    x.fillText("STOP", 256, 266);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  L.scenes.stopglass = {
    init: function (gl, canvas, opts) {
      var G = L.gl,
        lin = L.lin;
      this.gl = gl;
      this.opts = opts;
      opts.post.alphaMode = 1; // brightness → alpha: composes over the CTA card
      opts.post.bloom = 0.45;
      opts.post.threshold = 0.85;
      opts.post.vignette = 0;
      opts.post.fringe = 0.004;
      opts.post.grain = 0.01;
      this.prog = G.program(gl, VS, FS);
      var m = octagonPrism(0.3);
      this.count = m.count;
      this.bufs = [G.buffer(gl, m.pos), G.buffer(gl, m.nrm), G.buffer(gl, m.uv)];
      this.vao = G.vao(gl, [
        { loc: 0, buf: this.bufs[0], size: 3 },
        { loc: 1, buf: this.bufs[1], size: 3 },
        { loc: 2, buf: this.bufs[2], size: 2 },
      ]);
      var font = L.token("--font-display", opts.el, "sans-serif");
      this.tex = textTexture(gl, font);
      var self = this;
      if (document.fonts && document.fonts.load) {
        document.fonts.load("700 196px " + font.split(",")[0]).then(function () {
          if (self.dead) return;
          gl.deleteTexture(self.tex);
          self.tex = textTexture(gl, font);
        });
      }
      this.C = {
        glass: lin("--color-hardstop", 0.55),
        wash: lin("--color-accent", 1.1),
        spot: lin("--color-coolbeam", 1.0),
        white: lin("--color-text", 1),
      };
      this.px = 0;
      this.py = 0;
      this.tx = 0;
      this.ty = 0;
      this.onMove = function (e) {
        var r = opts.el.getBoundingClientRect();
        self.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        self.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("pointermove", this.onMove, { passive: true });
    },
    resize: function (w, h) {
      this.w = w;
      this.h = h;
    },
    frame: function (t, p, dt) {
      var gl = this.gl,
        M4 = L.M4;
      var k = 1 - Math.exp(-(dt || 0.016) * 3);
      this.px += (L.math.clamp(this.tx, -1, 1) - this.px) * k;
      this.py += (L.math.clamp(this.ty, -1, 1) - this.py) * k;
      var aspect = this.w / this.h;
      var proj = M4.persp(0.62, aspect, 0.1, 50);
      var eye = [0, 0, 4.6];
      var view = M4.lookAt(eye, [0, 0, 0], [0, 1, 0]);
      var vp = M4.mul(proj, view);
      this.vp = vp;
      var yaw = Math.sin(t * 0.35) * 0.38 + this.px * 0.35 + (p - 0.5) * 0.6;
      var pitch = Math.sin(t * 0.27) * 0.08 - this.py * 0.22;
      var s = aspect < 1 ? 0.95 : 1.12;
      var m = M4.trs(0, Math.sin(t * 0.8) * 0.05, 0, yaw, pitch, s);
      var cyc = (t % 6.5) / 6.5;
      var glint = -1.6 + cyc * 4.2;
      gl.useProgram(this.prog.prog);
      var u = this.prog.u;
      gl.uniformMatrix4fv(u.uVP, false, vp);
      gl.uniformMatrix4fv(u.uM, false, m);
      gl.uniform3fv(u.uEye, eye);
      gl.uniform3fv(u.uGlass, this.C.glass);
      gl.uniform3fv(u.uWash, this.C.wash);
      gl.uniform3fv(u.uSpot, this.C.spot);
      gl.uniform3fv(u.uWhite, this.C.white);
      gl.uniform1f(u.uTime, t);
      gl.uniform1f(u.uGlint, glint);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.uniform1i(u.uText, 0);
      gl.bindVertexArray(this.vao);
      // back faces first (the far side seen through the glass), then front faces
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.FRONT);
      gl.uniform1f(u.uFace, 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, this.count);
      gl.cullFace(gl.BACK);
      gl.uniform1f(u.uFace, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, this.count);
      gl.disable(gl.CULL_FACE);
      gl.bindVertexArray(null);
    },
    dispose: function () {
      var gl = this.gl;
      this.dead = true;
      window.removeEventListener("pointermove", this.onMove);
      gl.deleteProgram(this.prog.prog);
      this.bufs.forEach(function (b) {
        gl.deleteBuffer(b);
      });
      gl.deleteVertexArray(this.vao);
      gl.deleteTexture(this.tex);
    },
  };
})();

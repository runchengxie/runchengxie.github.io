// Enrichr Library · https://enrichr.dev
// Particle wave hero: a big two-line headline over a valley of green particles that roll in slow waves. Raw WebGL1 points,
// no libraries: about 32,000 particles (the original pen's density) are laid out on the ground, packed towards a winding
// strip down the middle, and a vertex shader lifts each one by a few layered sine waves, raises the valley walls, adds a
// little per-particle jitter and swells the ground up and aside near the pointer. Low particles are deep green, middle
// ones green, and the brightest half of the high ones turn lime; they are blended additively and fade right at the camera.
// The camera bobs gently (a 0.6-unit sine every 12.6 seconds), and eases after the pointer (5% a frame) to sway and tilt.
// As the hero scrolls out of view the camera dives forward along the valley (eased 6% a frame, as in the original's
// virtual scroll): the headline grows, rises, blurs with speed and fades, and a second line flies in from the distance.
// A thin lime bar and the corner label track the dive.
// Reduced motion draws one still frame, keeps the text still and hides the scroll hint. The loop pauses off screen and in
// hidden tabs. Without WebGL the CSS background stays and the text still shows.
// mount(root, { title1 (first line), title2 (second, offset line), caption, next (line revealed on scroll), dive (scroll
//               dive depth, scene units), speed (wave speed), deep, mid, crest (particle colours), accent (lime details),
//               background })
function mount(root, o) {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wrap = root.querySelector(".ef-pwave");
  var canvas = root.querySelector(".ef-pwave__c");
  var secs = root.querySelectorAll(".ef-pwave__sec");
  var t1 = root.querySelector(".ef-pwave__t1"), t2 = root.querySelector(".ef-pwave__t2");
  var cap = root.querySelector(".ef-pwave__cap"), next = root.querySelector(".ef-pwave__next");
  var label = root.querySelector(".ef-pwave__tl"), fill = root.querySelector(".ef-pwave__fill"), hint = root.querySelector(".ef-pwave__hint");
  var opts = {}, raf = 0, visible = true, io = null, ro = null, destroyed = false, last = 0;
  var gl = null, prog = null, vb = null, u = {}, ok = false, count = 0, pr = 1;
  var time = 0, progress = 0, current = 0, vel = 0, lastLabel = "";
  var mouse = { x: 0, y: 0, sx: 0, sy: 0 }, hit = [9999, 0, 9999];
  var SEC_Z = [0, 60], SPAN_X = 260, DIVE_MAX = 200, SPAN_Z = 80 + 400 + DIVE_MAX;
  var FOV = 62 * Math.PI / 180, NEAR = 0.1, FAR = 400, TANH = Math.tan(FOV / 2);
  var LABELS = [[0, "Scroll to dive in"], [0.3, "Keep going"], [0.68, "Almost there"], [0.94, "Welcome"]];
  var DEF = {
    title1: "The Library", title2: "in motion",
    caption: "Backgrounds, heroes and text effects you can drop into a page. Each one is tuned, tested and ready to copy.",
    next: "Now start building", dive: 60, speed: 1,
    deep: "#003d28", mid: "#1a7a4c", crest: "#e6ff55", accent: "#e6ff55", background: "#0c1e18"
  };
  var view = new Float32Array(16), proj = new Float32Array(16);

  // the original pen's terrain shaders; reversed smoothsteps are written out so every GPU gives the same result
  var VS = [
    "attribute vec2 aXZ;attribute float aRnd;attribute float aSeed;",
    "uniform float uTime;uniform vec3 uMouse;uniform float uPx;uniform mat4 uView;uniform mat4 uProj;",
    "varying float vH;varying float vR;varying float vFade;",
    "float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}",
    "float terra(vec2 p){float h=0.0;",
    "h+=sin(p.x*0.045+sin(p.y*0.03)*1.7)*4.0;",
    "h+=sin(p.y*0.05+sin(p.x*0.021)*2.3)*3.2;",
    "h+=sin((p.x+p.y)*0.09+uTime*0.35)*1.1;",
    "h+=sin(p.x*0.23+p.y*0.17+uTime*0.8)*0.35;",
    "return h;}",
    "void main(){vec3 p=vec3(aXZ.x,0.0,aXZ.y);",
    "float valley=smoothstep(0.0,90.0,abs(p.x));",
    "p.y=terra(p.xz)-10.0+valley*22.0;",
    "p.y+=sin(uTime*1.4+aSeed)*0.35*aRnd;",
    "float d=distance(p.xz,uMouse.xz);float push=ss(26.0,0.0,d);",
    "p.y+=push*7.0;p.x+=push*sign(p.x-uMouse.x+0.001)*2.5;",
    "vH=p.y;vR=aRnd;vec4 mv=uView*vec4(p,1.0);",
    "vFade=ss(-6.0,-30.0,mv.z);",
    "gl_Position=uProj*mv;",
    "float size=(1.1+aRnd*2.2+push*2.0)*uPx;gl_PointSize=size*(140.0/-mv.z);",
    // fully faded points add nothing; move them off screen so they cost no fill
    "if(vFade<=0.0)gl_Position=vec4(2.0,2.0,2.0,1.0);}"
  ].join("\n");
  var FS = [
    "precision mediump float;uniform vec3 uDeep;uniform vec3 uMid;uniform vec3 uCrest;",
    "varying float vH;varying float vR;varying float vFade;",
    "float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}",
    "void main(){vec2 uv=gl_PointCoord-0.5;float a=ss(0.5,0.05,length(uv));",
    "float t=clamp((vH+14.0)/30.0,0.0,1.0);",
    "vec3 col=mix(uDeep,uMid,smoothstep(0.0,0.6,t));",
    "col=mix(col,uCrest,smoothstep(0.55,1.0,t)*step(0.55,vR));",
    "gl_FragColor=vec4(col,a*(0.4+0.6*vR)*vFade);}"
  ].join("\n");

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function rgb(h, d) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ""); var v = parseInt(m ? m[1] : d, 16); return [(v >> 16) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]; }
  function smooth(x, a, b) { if (x <= a) return 0; if (x >= b) return 1; x = (x - a) / (b - a); return x * x * (3 - 2 * x); }

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
  function setup() {
    var v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) return false;
    prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    gl.deleteShader(v); gl.deleteShader(f);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    // same density as the original (48,000 over 1,020 units of depth, 22,000 with reduced motion), over the depth this
    // hero can actually see
    count = Math.round((reduce ? 22000 : 48000) * SPAN_Z / 1020);
    var data = new Float32Array(count * 4);
    for (var i = 0; i < count; i++) {
      var x = Math.random() * 2 - 1;
      data[i * 4] = (x < 0 ? -1 : x > 0 ? 1 : 0) * Math.pow(Math.abs(x), 1.6) * SPAN_X * 0.5; // packed towards the middle
      data[i * 4 + 1] = -Math.random() * SPAN_Z + 80;
      data[i * 4 + 2] = Math.random();
      data[i * 4 + 3] = Math.random() * 6.283;
    }
    vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a1 = gl.getAttribLocation(prog, "aXZ"), a2 = gl.getAttribLocation(prog, "aRnd"), a3 = gl.getAttribLocation(prog, "aSeed");
    gl.enableVertexAttribArray(a1); gl.vertexAttribPointer(a1, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(a2); gl.vertexAttribPointer(a2, 1, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(a3); gl.vertexAttribPointer(a3, 1, gl.FLOAT, false, 16, 12);
    ["uTime", "uMouse", "uPx", "uView", "uProj", "uDeep", "uMid", "uCrest"].forEach(function (k) { u[k] = gl.getUniformLocation(prog, k); });
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // three.js AdditiveBlending
    return true;
  }
  function size() {
    pr = Math.min(window.devicePixelRatio || 1, 1.8);
    var w = Math.max(1, Math.round(wrap.clientWidth * pr)), h = Math.max(1, Math.round(wrap.clientHeight * pr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }

  // camera: position plus an XYZ Euler rotation, as three.js builds it
  function rotation(rx, ry, rz) {
    var a = Math.cos(rx), b = Math.sin(rx), c = Math.cos(ry), d = Math.sin(ry), e = Math.cos(rz), f = Math.sin(rz);
    var ae = a * e, af = a * f, be = b * e, bf = b * f;
    return [[c * e, -c * f, d], [af + be * d, ae - bf * d, -b * c], [bf - ae * d, be + af * d, a * c]]; // rows
  }
  function camera(t, aspect) {
    var pos = [mouse.sx * 6, 3 + Math.sin(t * 0.5) * 0.6 - mouse.sy * 3, -current];
    var R = rotation(-mouse.sy * 0.06, -mouse.sx * 0.1, mouse.sx * 0.02), i, j;
    // view = transpose(R) and -transpose(R) * pos, written column-major
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) view[j * 4 + i] = R[j][i];
    for (i = 0; i < 3; i++) view[12 + i] = -(R[0][i] * pos[0] + R[1][i] * pos[1] + R[2][i] * pos[2]);
    view[3] = view[7] = view[11] = 0; view[15] = 1;
    var fy = 1 / TANH;
    proj.fill(0); proj[0] = fy / aspect; proj[5] = fy; proj[10] = (FAR + NEAR) / (NEAR - FAR); proj[11] = -1; proj[14] = 2 * FAR * NEAR / (NEAR - FAR);
    // the pointer ray (unsmoothed pointer, as in the original) meets the ground plane y = -6
    var dc = [mouse.x * TANH * aspect, -mouse.y * TANH, -1];
    var dw = [R[0][0] * dc[0] + R[0][1] * dc[1] + R[0][2] * dc[2], R[1][0] * dc[0] + R[1][1] * dc[1] + R[1][2] * dc[2], R[2][0] * dc[0] + R[2][1] * dc[1] + R[2][2] * dc[2]];
    if (dw[1] !== 0) {
      var k = (-6 - pos[1]) / dw[1];
      if (k >= 0) { hit[0] = pos[0] + dw[0] * k; hit[1] = -6; hit[2] = pos[2] + dw[2] * k; }
    }
  }
  function draw() {
    if (!ok || destroyed || gl.isContextLost()) return;
    size();
    camera(time, canvas.width / canvas.height);
    var bg = rgb(opts.background, "0c1e18");
    gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u.uTime, time);
    gl.uniform3f(u.uMouse, hit[0], hit[1], hit[2]);
    gl.uniform1f(u.uPx, pr);
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniformMatrix4fv(u.uProj, false, proj);
    gl.uniform3fv(u.uDeep, rgb(opts.deep, "003d28"));
    gl.uniform3fv(u.uMid, rgb(opts.mid, "1a7a4c"));
    gl.uniform3fv(u.uCrest, rgb(opts.crest, "e6ff55"));
    gl.drawArrays(gl.POINTS, 0, count);
  }

  // the text sections: each sits at a depth along the valley and is scaled, moved, faded and blurred by its distance
  function sections() {
    var blur = Math.min(Math.abs(vel) * 2.2, 14);
    for (var i = 0; i < secs.length; i++) {
      var el = secs[i], dz = SEC_Z[i] - current;
      if (dz < -22 || dz > 90) { el.style.opacity = 0; continue; }
      var scale = 36 / (36 + Math.max(dz, -20));
      var op = dz >= 0 ? 1 - smooth(dz, 8, 70) : 1 - smooth(-dz, 2, 20);
      var b = blur * (0.4 + Math.min(Math.abs(dz) / 40, 1));
      el.style.opacity = op;
      el.style.filter = b > 0.01 ? "blur(" + b.toFixed(2) + "px)" : "none";
      el.style.transform = "translate(-50%,-50%) translateY(" + (dz >= 0 ? dz * 0.4 : dz * 2.4) + "px) scale(" + scale + ")";
    }
    var prog = opts.dive > 0 ? Math.min(1, current / opts.dive) : 0;
    fill.style.width = (prog * 100).toFixed(2) + "%";
    var lbl = LABELS[0][1];
    for (var k = 0; k < LABELS.length; k++) if (prog >= LABELS[k][0]) lbl = LABELS[k][1];
    if (lbl !== lastLabel) { label.textContent = lbl; lastLabel = lbl; }
    if (hint) hint.classList.toggle("is-gone", prog > 0.02);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    if (!visible || document.hidden) return;
    var k = dt * 60;
    time += dt * opts.speed;
    var prev = current, target = progress * opts.dive;
    current += (target - current) * (1 - Math.pow(0.94, k));
    vel = k > 0 ? (current - prev) / k : 0;
    var e = 1 - Math.pow(0.95, k);
    mouse.sx += (mouse.x - mouse.sx) * e; mouse.sy += (mouse.y - mouse.sy) * e;
    sections();
    draw();
  }
  function still() { time = 4; current = 0; vel = 0; mouse.sx = mouse.sy = mouse.x = mouse.y = 0; sections(); draw(); }

  function onScroll() {
    var r = wrap.getBoundingClientRect();
    progress = r.height > 0 ? Math.max(0, Math.min(1, -r.top / r.height)) : 0;
  }
  function onMove(e) {
    var r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    mouse.x = (e.clientX - r.left) / r.width * 2 - 1;
    mouse.y = (e.clientY - r.top) / r.height * 2 - 1;
  }
  function onLost(e) { e.preventDefault(); canvas.style.display = "none"; }

  function update(partial) {
    opts = Object.assign({}, DEF, opts, partial || {});
    opts.dive = Math.max(0, Math.min(DIVE_MAX, num(opts.dive, DEF.dive)));
    opts.speed = Math.max(0, num(opts.speed, DEF.speed));
    t1.textContent = opts.title1; t2.textContent = opts.title2; cap.textContent = opts.caption; next.textContent = opts.next;
    cap.style.display = opts.caption ? "" : "none";
    wrap.style.setProperty("--ef-pw-bg", opts.background);
    wrap.style.setProperty("--ef-pw-acc", opts.accent);
    if (destroyed) return;
    if (reduce) still(); else { sections(); draw(); }
  }

  try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) { gl = null; }
  ok = !!gl && setup();
  if (!ok) canvas.style.display = "none";
  else canvas.addEventListener("webglcontextlost", onLost);
  if (reduce) { label.textContent = "Welcome"; lastLabel = "Welcome"; LABELS = [[0, "Welcome"]]; }
  update(o);
  if (!reduce) {
    window.addEventListener("scroll", onScroll, { passive: true });
    wrap.addEventListener("pointermove", onMove);
    onScroll();
    if ("IntersectionObserver" in window) { io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }); io.observe(wrap); }
    last = performance.now(); raf = requestAnimationFrame(loop);
  }
  if ("ResizeObserver" in window) { ro = new ResizeObserver(function () { if (destroyed) return; if (!reduce) onScroll(); draw(); }); ro.observe(wrap); }
  return {
    update: update,
    destroy: function () {
      destroyed = true; cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      if (gl) {
        var ext = gl.getExtension("WEBGL_lose_context");
        if (vb) gl.deleteBuffer(vb); if (prog) gl.deleteProgram(prog);
        if (ext) ext.loseContext();
        gl = null;
      }
    }
  };
}
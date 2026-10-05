"use client";

import { useEffect, useRef, useState } from "react";

/*
  The part that produced the curve.

  This is not an illustration of a lattice. The fragment shader ray-marches the
  Acoustic Metamaterials lab's own level-set field, verbatim from
  `physics/tpms.ts` in that repository:

      F = sin x · cos y + sin y · cos z + sin z · cos x

  and fills the region |F| <= 0.615975. That isovalue is not chosen by eye: it
  is the tabulated Gyroid value for porosity 0.6 in `physics/tpmsTables.ts`
  (the row `{ phi: 0.6, iso: 0.615975, ... }`). Integrating the field over a
  unit cell at that isovalue gives a solid fraction of 0.3995, i.e. porosity
  0.6005 — the porosity the Acoustic Metamaterials lab's own absorption run
  is solved for. So the block on screen is that design, not a cousin of it.

  The field has period 2*PI per axis, so the box half-extent H = TAU renders
  exactly two unit cells across. An earlier attempt used a 4.8 mm box, which is
  0.76 of one cell — it drew a single saddle and read as an abstract blob.

  Why a shader and not a mesh: the hub ships no 3D library and a marching-cubes
  mesh fine enough to look like this is ~150 kB of vertex data. The field is
  three sine terms, so the GPU can solve it per pixel for the cost of the
  shader source. Nothing is downloaded and nothing is precomputed.
*/

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform mat3  uRot;
uniform float uIso;
uniform vec3  uSolidA, uSolidB, uCut;

const float TAU = 6.2831853;
const float H   = TAU;      // half-extent: the block is two unit cells across
const int   MAX = 300;
const float DT  = 0.075;    // under half the thinnest ligament, so nothing bands

float F(vec3 p){
  return sin(p.x)*cos(p.y) + sin(p.y)*cos(p.z) + sin(p.z)*cos(p.x);
}
vec3 G(vec3 p){
  return vec3(
    cos(p.x)*cos(p.y) - sin(p.z)*sin(p.x),
    cos(p.y)*cos(p.z) - sin(p.x)*sin(p.y),
    cos(p.z)*cos(p.x) - sin(p.y)*sin(p.z));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  float dist = H * 5.4;                    // far enough that the corners never clip
  vec3 ro = uRot * vec3(0.0, 0.0, dist);
  vec3 rd = normalize(uRot * vec3(uv * 1.05, -1.35));
  rd += vec3(1e-6);                        // keep 1/rd and sign(rd) finite on axis-parallel rays

  vec3 inv = 1.0 / rd;
  vec3 a = (-vec3(H) - ro) * inv, b = (vec3(H) - ro) * inv;
  vec3 lo = min(a, b), hi = max(a, b);
  float t0 = max(max(lo.x, lo.y), lo.z);
  float t1 = min(min(hi.x, hi.y), hi.z);
  if (t1 <= max(t0, 0.0)) { gl_FragColor = vec4(0.0); return; }
  t0 = max(t0, 0.0);

  // the slab that produced t0 is the face the ray entered through
  vec3 faceN = -sign(rd) * step(lo.yzx, lo.xyz) * step(lo.zxy, lo.xyz);

  float t = t0, tPrev = t0;
  bool hit = false, cut = false;
  for (int i = 0; i < MAX; i++) {
    if (t > t1) break;
    if (abs(F(ro + rd*t)) <= uIso) { hit = true; cut = (i == 0); break; }
    tPrev = t; t += DT;
  }
  if (!hit) { gl_FragColor = vec4(0.0); return; }

  vec3 n, base, p;
  float face = 0.0;          // -1 / +1 = which labyrinth this face looks into
  if (cut) {
    // a sawn face of the specimen: flat, so the block reads as a cut sample
    p = ro + rd*t0; n = faceN; base = uCut;
  } else {
    for (int j = 0; j < 7; j++) {          // bisect onto |F| = iso
      float m = 0.5*(tPrev + t);
      if (abs(F(ro + rd*m)) <= uIso) t = m; else tPrev = m;
    }
    p = ro + rd*t;
    float sgn = sign(F(p));
    n = normalize(sgn * G(p));
    /* The gyroid divides space into two interlocking labyrinths and the
       sheet has one face toward each; the sign of F says which. Tinting by
       it shows the bicontinuity the lab's own notes describe, rather than
       painting an arbitrary gradient over the surface. */
    face = sgn;
    base = mix(uSolidA, uSolidB, step(0.0, sgn));
  }

  // Ambient occlusion: material sitting just off the surface along the normal
  // is what makes the channels read as channels instead of as pattern.
  float ao = 0.0;
  for (int k = 1; k <= 4; k++) {
    float d = float(k) * 0.40;
    if (abs(F(p + n*d)) <= uIso) ao += 1.0 / float(k);
  }
  ao = clamp(1.0 - 0.26*ao, 0.0, 1.0);

  vec3 L1 = normalize(uRot * vec3(-0.40, 0.80, 0.55));   // key, over the left shoulder
  vec3 L2 = normalize(uRot * vec3(0.75, -0.20, 0.30));   // cool fill from below right
  vec3 V  = -rd;
  float key  = max(0.0, dot(n, L1));
  float fill = max(0.0, dot(n, L2)) * 0.22;
  float spec = pow(max(0.0, dot(n, normalize(L1 + V))), 56.0) * (cut ? 0.05 : 0.22);
  float rim  = pow(1.0 - max(0.0, dot(n, V)), 3.5) * 0.26;

  vec3 rimCol = (face == 0.0) ? uCut : mix(uSolidA, uSolidB, step(0.0, face));
  vec3 col = base * ((0.17 + 0.86*key + fill) * ao) + vec3(spec) + rimCol*rim*ao;

  // Depth fades to transparent rather than to a hard-coded background, so the
  // far side of the block recedes into whatever band the figure is sitting on
  // and the colour token stays the single source of truth.
  float depth = clamp((t - t0) / (2.0*H*1.732), 0.0, 1.0);
  float alpha = 1.0 - depth*0.62;
  gl_FragColor = vec4(col * alpha, alpha);   // premultiplied, as the context expects
}
`;

/** Column-major 3x3 for WebGL: Ry(yaw) · Rx(pitch), camera above for pitch > 0. */
function rotation(yaw: number, pitch: number): Float32Array {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return new Float32Array([
    cy, 0, -sy,
    -sy * sp, cp, -cy * sp,
    sy * cp, sp, cy * cp,
  ]);
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function GyroidSpecimen({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false, // a full-screen triangle gets nothing from MSAA; DPR is the AA here
      depth: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
    if (!gl) { setFailed(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFailed(true); return; }
    const prog = gl.createProgram();
    if (!prog) { setFailed(true); return; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uRot = gl.getUniformLocation(prog, "uRot");
    gl.uniform1f(gl.getUniformLocation(prog, "uIso"), 0.615975);
    // One colour per labyrinth. Both are lifted off the brand blue rather
    // than picked freely, so the figure still belongs to the palette.
    gl.uniform3f(gl.getUniformLocation(prog, "uSolidA"), 0.3, 0.62, 0.97);
    gl.uniform3f(gl.getUniformLocation(prog, "uSolidB"), 0.74, 0.45, 0.98);
    gl.uniform3f(gl.getUniformLocation(prog, "uCut"), 0.26, 0.29, 0.44);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const draggingRef = { current: false };
    let yaw = 0.62, pitch = 0.42;
    // 1.5x supersample, capped at 2. The silhouette of a ray-marched surface
    // has no geometry to hand to MSAA, so the backing store is the only AA
    // available; on a 1x display the cube's edges stair-step without it.
    let scale = Math.min((window.devicePixelRatio || 1) * 1.5, 2);
    let w = 0, h = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale));
      h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix3fv(uRot, false, rotation(yaw, pitch));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /*
      Adaptive resolution. Ray-marching up to 300 steps of six trig calls per
      fragment is cheap on a discrete GPU and not cheap on an integrated one,
      and the difference is invisible from here. The measure has to be the gap
      between frames, not the time spent in this callback: `drawArrays` only
      queues work, so timing around it reports a GPU-bound frame as free. If
      the first second of real frames is slow the backing store is dropped
      once — a softer block that turns smoothly beats a sharp one that stutters.
    */
    let frames = 0, elapsed = 0, downgraded = false;

    let raf = 0, running = false, last = 0;
    const frame = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!draggingRef.current) yaw += dt * 0.26;   // one turn in about 24 s
      draw();
      if (!downgraded && dt > 0) {
        elapsed += dt; frames++;
        if (frames >= 30) {
          if (elapsed / frames > 1 / 45) {
            downgraded = true;
            scale = Math.max(1, scale * 0.6);
            resize();
          }
          frames = 0; elapsed = 0;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduced.matches) return;
      running = true; last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(wrap);
    resize();
    draw();

    // Only turn while it is actually on screen and the tab is in front.
    let inView = false;
    const sync = () => (inView && !document.hidden && !reduced.matches ? start() : stop());
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, {
      threshold: 0.05,
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);

    // ---- drag to turn it ----
    let px = 0, py = 0;
    const down = (e: PointerEvent) => {
      draggingRef.current = true; setDragging(true);
      px = e.clientX; py = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      yaw += (e.clientX - px) * 0.008;
      pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - py) * 0.006));
      px = e.clientX; py = e.clientY;
      if (reduced.matches || !running) draw();   // still steerable with motion off
    };
    const up = (e: PointerEvent) => {
      draggingRef.current = false; setDragging(false);
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  // Without WebGL there is nothing honest to put here, and a stand-in picture
  // of "some lattice" is exactly the decorative imagery this page avoids. The
  // caption below carries the design either way.
  if (failed) return null;

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-square w-full ${className}`}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A rotating block of gyroid lattice, two unit cells across, at 60% porosity. The two colours are the two interlocking channels the lattice divides space into. This is the geometry the lab's acoustic solver is run on."
        className={`h-full w-full touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      />
    </div>
  );
}

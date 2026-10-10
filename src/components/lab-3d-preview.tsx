"use client";

import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

export type LabPreviewKind =
  | "lattice"
  | "microbes"
  | "molecule"
  | "diffraction"
  | "omics"
  | "logic"
  | "fraud"
  | "factory"
  | "genai"
  | "battery"
  | "sixg"
  | "cognicore"
  | "navigator";

type Lab3DPreviewProps = {
  kind: LabPreviewKind;
  name: string;
  fallbackSrc: string;
  /**
   * Hold a WebGL context and draw. False renders the poster frame alone.
   *
   * A browser gives a document on the order of sixteen WebGL contexts and
   * then starts throwing the oldest away. Thirteen previews on one page sat
   * right on that limit with the hero's own canvas beside them, so the
   * gallery only keeps the cards around the one you are looking at alive and
   * the rest hold their poster. Flipping this to false tears the context
   * down; flipping it back builds a fresh one.
   */
  live?: boolean;
  /**
   * Take pointer gestures for rotate and zoom.
   *
   * Only the card nearest the middle of the carousel does. On a touch screen
   * a preview that captures the gesture is a preview you cannot swipe past,
   * and with four of them across a row there would be nowhere left to swipe.
   */
  interactive?: boolean;
};

type Point = [number, number, number];
type Color = [number, number, number];

const palette: Record<LabPreviewKind, Color> = {
  lattice: [0.31, 0.71, 1],
  microbes: [0.26, 0.9, 0.72],
  molecule: [0.72, 0.49, 1],
  diffraction: [0.36, 0.78, 1],
  omics: [0.48, 0.6, 1],
  logic: [0.98, 0.67, 0.3],
  fraud: [0.95, 0.42, 0.55],
  factory: [0.44, 0.78, 0.98],
  genai: [0.76, 0.53, 1],
  battery: [0.32, 0.88, 0.56],
  sixg: [0.38, 0.7, 1],
  cognicore: [0.88, 0.5, 0.98],
  navigator: [0.5, 0.78, 1],
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/*
  The canvas's width over its height, for the projection below.

  Clip space is square — x and y both run -1..1 — while the card is 16:10, so
  projecting straight into it stretched every model sideways by 60%: spheres
  drew as ellipses and the lattice as a flattened box. Dividing x by the
  aspect ratio corrects it.

  Module-scoped rather than threaded through `sphere`, `line` and `cube`
  because `renderScientificModel` is synchronous: it sets this on entry and
  has produced its whole vertex list before any other card's frame can run.
*/
let aspect = 1.6;

function perspective(point: Point, rotation: { x: number; y: number }, zoom: number): [number, number, number] {
  const [x, y, z] = point;
  const cy = Math.cos(rotation.y);
  const sy = Math.sin(rotation.y);
  const cx = Math.cos(rotation.x);
  const sx = Math.sin(rotation.x);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx + 5.5;
  return [(x1 * zoom) / z2 / aspect, (y1 * zoom) / z2, z2];
}

function sphere(center: Point, radius: number, color: Color, vertices: number[], colors: number[], rotation: { x: number; y: number }, zoom: number) {
  const latitudes = 5;
  const longitudes = 8;
  for (let lat = 0; lat < latitudes; lat += 1) {
    const theta1 = (lat / latitudes) * Math.PI;
    const theta2 = ((lat + 1) / latitudes) * Math.PI;
    for (let lon = 0; lon < longitudes; lon += 1) {
      const phi1 = (lon / longitudes) * Math.PI * 2;
      const phi2 = ((lon + 1) / longitudes) * Math.PI * 2;
      const points: Point[] = [
        [center[0] + radius * Math.sin(theta1) * Math.cos(phi1), center[1] + radius * Math.cos(theta1), center[2] + radius * Math.sin(theta1) * Math.sin(phi1)],
        [center[0] + radius * Math.sin(theta2) * Math.cos(phi1), center[1] + radius * Math.cos(theta2), center[2] + radius * Math.sin(theta2) * Math.sin(phi1)],
        [center[0] + radius * Math.sin(theta2) * Math.cos(phi2), center[1] + radius * Math.cos(theta2), center[2] + radius * Math.sin(theta2) * Math.sin(phi2)],
      ];
      for (const point of points) {
        const projected = perspective(point, rotation, zoom);
        vertices.push(projected[0], projected[1]);
        colors.push(color[0], color[1], color[2]);
      }
    }
  }
}

function line(a: Point, b: Point, color: Color, vertices: number[], colors: number[], rotation: { x: number; y: number }, zoom: number) {
  const first = perspective(a, rotation, zoom);
  const second = perspective(b, rotation, zoom);
  const dx = second[0] - first[0];
  const dy = second[1] - first[1];
  const length = Math.max(0.001, Math.hypot(dx, dy));
  const width = 0.006;
  const nx = (-dy / length) * width;
  const ny = (dx / length) * width;
  const points = [[first[0] + nx, first[1] + ny], [first[0] - nx, first[1] - ny], [second[0] - nx, second[1] - ny], [first[0] + nx, first[1] + ny], [second[0] - nx, second[1] - ny], [second[0] + nx, second[1] + ny]];
  points.forEach(([x, y]) => { vertices.push(x, y); colors.push(color[0], color[1], color[2]); });
}

function cube(center: Point, size: Point, color: Color, vertices: number[], colors: number[], rotation: { x: number; y: number }, zoom: number) {
  const [sx, sy, sz] = size;
  const [x, y, z] = center;
  const corners: Point[] = [
    [x - sx, y - sy, z - sz], [x + sx, y - sy, z - sz], [x + sx, y + sy, z - sz], [x - sx, y + sy, z - sz],
    [x - sx, y - sy, z + sz], [x + sx, y - sy, z + sz], [x + sx, y + sy, z + sz], [x - sx, y + sy, z + sz],
  ];
  const faces = [[0, 1, 2, 0, 2, 3], [4, 6, 5, 4, 7, 6], [0, 4, 5, 0, 5, 1], [3, 2, 6, 3, 6, 7], [1, 5, 6, 1, 6, 2], [0, 3, 7, 0, 7, 4]];
  faces.forEach((face) => face.forEach((index) => {
    const projected = perspective(corners[index], rotation, zoom);
    vertices.push(projected[0], projected[1]);
    colors.push(color[0], color[1], color[2]);
  }));
}

function renderScientificModel(kind: LabPreviewKind, rotation: { x: number; y: number }, zoom: number, time: number, canvasAspect: number) {
  aspect = canvasAspect;
  const vertices: number[] = [];
  const colors: number[] = [];
  const main = palette[kind];
  const accent: Color = [0.72, 0.84, 1];
  const secondary: Color = [0.52, 0.4, 0.9];

  if (kind === "lattice") {
    for (let x = -2; x <= 2; x += 1) for (let y = -1; y <= 1; y += 1) for (let z = -1; z <= 1; z += 1) {
      const point: Point = [x * 0.66, y * 0.66, z * 0.66];
      sphere(point, 0.07, main, vertices, colors, rotation, zoom);
      if (x < 2) line(point, [(x + 1) * 0.66, y * 0.66, z * 0.66], accent, vertices, colors, rotation, zoom);
      if (y < 1) line(point, [x * 0.66, (y + 1) * 0.66, z * 0.66], accent, vertices, colors, rotation, zoom);
      if (z < 1) line(point, [x * 0.66, y * 0.66, (z + 1) * 0.66], accent, vertices, colors, rotation, zoom);
    }
  } else if (kind === "microbes") {
    for (let i = 0; i < 12; i += 1) {
      const angle = i * 2.2 + time * 0.0002;
      const point: Point = [Math.cos(angle) * (0.4 + (i % 3) * 0.35), Math.sin(angle * 1.4) * 0.8, Math.sin(angle) * 0.8];
      sphere(point, 0.16 + (i % 3) * 0.04, i % 2 ? main : accent, vertices, colors, rotation, zoom);
      line(point, [point[0] + Math.sin(angle) * 0.28, point[1] + 0.08, point[2] + Math.cos(angle) * 0.28], secondary, vertices, colors, rotation, zoom);
    }
  } else if (kind === "molecule" || kind === "omics" || kind === "genai" || kind === "cognicore") {
    const points: Point[] = kind === "omics"
      ? Array.from({ length: 8 }, (_, i) => [Math.sin(i * 0.8) * 0.6, i * 0.38 - 1.35, Math.cos(i * 0.8) * 0.6])
      : [[-0.9, 0.25, 0], [0, 0.8, 0.3], [0.9, 0.25, 0], [0.5, -0.7, 0.35], [-0.5, -0.7, 0.35], [0, 0, -0.55]];
    points.forEach((point, i) => {
      sphere(point, kind === "omics" ? 0.11 : 0.2 - (i % 2) * 0.035, i % 2 ? main : accent, vertices, colors, rotation, zoom);
      if (i > 0) line(points[i - 1], point, accent, vertices, colors, rotation, zoom);
    });
    if (kind === "omics") for (let i = 0; i < points.length - 2; i += 1) line(points[i], points[i + 2], secondary, vertices, colors, rotation, zoom);
  } else if (kind === "diffraction") {
    cube([0, -0.25, 0], [1.2, 0.18, 0.8], main, vertices, colors, rotation, zoom);
    cube([0, 0.25, 0], [0.58, 0.12, 0.48], accent, vertices, colors, rotation, zoom);
    sphere([0, 0.52, 0], 0.2, secondary, vertices, colors, rotation, zoom);
    for (let i = -2; i <= 2; i += 1) line([-1.3, 0.5, i * 0.2], [1.3, 0.5, i * 0.2], accent, vertices, colors, rotation, zoom);
  } else if (kind === "logic" || kind === "battery" || kind === "factory") {
    cube([0, -0.15, 0], [1.25, 0.14, 0.8], main, vertices, colors, rotation, zoom);
    const count = kind === "factory" ? 4 : 3;
    for (let i = 0; i < count; i += 1) {
      const x = (i - (count - 1) / 2) * 0.65;
      cube([x, 0.25, 0], [0.2, 0.08, 0.24], accent, vertices, colors, rotation, zoom);
      line([x - 0.45, 0.4, -0.6], [x - 0.45, 0.4, 0.6], secondary, vertices, colors, rotation, zoom);
    }
  } else if (kind === "fraud" || kind === "navigator") {
    const nodes: Point[] = [[0, 0.85, 0], [-0.8, 0.15, 0], [0.8, 0.15, 0], [-0.42, -0.75, 0], [0.42, -0.75, 0]];
    nodes.forEach((point, i) => {
      sphere(point, i === 0 ? 0.25 : 0.16, i === 0 ? main : accent, vertices, colors, rotation, zoom);
      if (i > 0) line(nodes[0], point, secondary, vertices, colors, rotation, zoom);
    });
  } else {
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI / 4;
      line([0, 0, 0], [Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0], accent, vertices, colors, rotation, zoom);
      sphere([Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0], 0.13, main, vertices, colors, rotation, zoom);
    }
    sphere([0, 0, 0], 0.24, secondary, vertices, colors, rotation, zoom);
  }

  return { vertices, colors };
}

export default function Lab3DPreview({ kind, name, fallbackSrc, live = true, interactive = true }: Lab3DPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [active, setActive] = useState(false);
  const rotationRef = useRef({ x: -0.18, y: 0.45 });
  const zoomRef = useRef(2.5);
  const dragRef = useRef<{ x: number; y: number; rotation: { x: number; y: number } } | null>(null);

  useEffect(() => {
    if (!live) return;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, powerPreference: "low-power" });
    if (!gl) { setWebglUnavailable(true); return; }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) { setWebglUnavailable(true); return; }
    gl.shaderSource(vertexShader, "attribute vec2 a_position; attribute vec3 a_color; varying vec3 v_color; void main(){gl_Position=vec4(a_position,0.0,1.0); gl_PointSize=2.2; v_color=a_color;}");
    gl.shaderSource(fragmentShader, "precision mediump float; varying vec3 v_color; void main(){gl_FragColor=vec4(v_color,0.94);}");
    gl.compileShader(vertexShader); gl.compileShader(fragmentShader);
    const program = gl.createProgram();
    if (!program) { setWebglUnavailable(true); return; }
    gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program);
    const vertexBuffer = gl.createBuffer(); const colorBuffer = gl.createBuffer();
    if (!vertexBuffer || !colorBuffer) { setWebglUnavailable(true); return; }
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getAttribLocation(program, "a_color");
    let frame = 0; let running = true; let last = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = wrapper.clientWidth; const height = wrapper.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(wrapper); resize();
    const intersectionObserver = new IntersectionObserver(([entry]) => { running = entry.isIntersecting; }, { rootMargin: "160px" });
    intersectionObserver.observe(wrapper);
    const draw = (now: number) => {
      if (running) {
        const delta = Math.min(40, now - last); last = now;
        if (!dragRef.current && !reducedMotion) rotationRef.current = { ...rotationRef.current, y: rotationRef.current.y + delta * 0.00018 };
        const model = renderScientificModel(kind, rotationRef.current, zoomRef.current, now, Math.max(0.2, canvas.width / Math.max(1, canvas.height)));
        gl.clearColor(0.035, 0.09, 0.16, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(colorLocation); gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, model.vertices.length / 2);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); intersectionObserver.disconnect(); gl.deleteBuffer(vertexBuffer); gl.deleteBuffer(colorBuffer); gl.deleteProgram(program); gl.deleteShader(vertexShader); gl.deleteShader(fragmentShader); };
  }, [kind, live]);

  /*
    Zoom is a native listener, not an `onWheel` prop.

    React registers wheel handlers on the root as PASSIVE, so a
    `preventDefault()` inside one is ignored and logs "Unable to
    preventDefault inside passive event listener invocation" to the console.
    The prop version of this never zoomed and never held the page still; it
    only produced that warning on every scroll past a card.

    Held ctrl or cmd zooms and the page stays put, which is the gesture a map
    or a drawing canvas uses. A plain wheel is left alone, so scrolling past
    the gallery works the way it does everywhere else on the page.
  */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !interactive) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      zoomRef.current = clamp(zoomRef.current - event.deltaY * 0.004, 1.4, 4.2);
    };
    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", onWheel);
  }, [interactive]);

  const reset = () => { rotationRef.current = { x: -0.18, y: 0.45 }; zoomRef.current = 2.5; };

  /*
    Gesture capture is deliberately narrow.

    `onWheel` used to call `preventDefault()` on every wheel event, which made
    the card a hole in the page: a wheel over any of the thirteen previews
    zoomed the model instead of scrolling past it. Zoom now needs ctrl or
    cmd — the convention a map or a drawing canvas uses — and a plain wheel
    scrolls the page as it does everywhere else.

    Touch is handled by `touch-action` in the stylesheet rather than here: an
    inactive preview leaves panning to the browser so the carousel can be
    swiped through, and only the active card takes the gesture.
  */
  const gestures = interactive
    ? {
        onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
          /* A finger scrolls and swipes. Capturing it here would stop the
             carousel being swiped past this card and the page being scrolled
             from it, which is a worse trade than losing touch rotation. */
          if (event.pointerType === "touch") return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = { x: event.clientX, y: event.clientY, rotation: rotationRef.current };
          setActive(true);
        },
        onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          if (!drag) return;
          rotationRef.current = {
            x: clamp(drag.rotation.x + (event.clientY - drag.y) * 0.009, -1.2, 1.2),
            y: drag.rotation.y + (event.clientX - drag.x) * 0.009,
          };
        },
        onPointerUp: () => { dragRef.current = null; setActive(false); },
        onPointerCancel: () => { dragRef.current = null; setActive(false); },
      }
    : {};

  const showControls = live && !webglUnavailable && interactive;

  return (
    <div
      ref={wrapperRef}
      className={`lab-3d-preview ${active ? "is-interacting" : ""} ${interactive ? "is-live" : ""}`}
      {...gestures}
      aria-label={
        interactive
          ? `${name} interactive scientific preview. Drag to rotate, hold ctrl and scroll to zoom.`
          : `${name} scientific preview`
      }
    >
      <Image
        src={fallbackSrc}
        alt=""
        fill
        sizes="(max-width: 639px) 88vw, (max-width: 1023px) 45vw, (max-width: 1439px) 30vw, 24vw"
        className="lab-3d-fallback object-cover"
      />
      {live && !webglUnavailable && <canvas ref={canvasRef} className="lab-3d-canvas" aria-hidden="true" />}
      <div className="lab-3d-grid" aria-hidden="true" />
      {showControls && (
        <button
          type="button"
          className="lab-3d-reset"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={reset}
          aria-label={`Reset ${name} preview`}
        >
          <RotateCcw aria-hidden="true" />
        </button>
      )}
      {showControls && <span className="lab-3d-hint" aria-hidden="true">Drag to inspect</span>}
    </div>
  );
}

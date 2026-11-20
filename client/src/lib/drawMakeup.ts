import type { Landmark } from '../types';
import { LM, dist, toPx } from './geometry';

export type MakeupLayer = { color: string; alpha: number };

export type MakeupState = {
  lipstick?: MakeupLayer;
  blush?: MakeupLayer;
  eyeshadow?: MakeupLayer;
};

// Landmark indexes from the MediaPipe Face Mesh map
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
const RIGHT_EYE_UPPER = [33, 246, 161, 160, 159, 158, 157, 173, 133];
const LEFT_EYE_UPPER = [263, 466, 388, 387, 386, 385, 384, 398, 362];
const CHEEKS = [50, 280];

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * Fills a shape with feathered edges. The shape is drawn far off the canvas and only its blurred
 * shadow lands on it, which works in every browser (ctx.filter does not work in Safari).
 */
function soft(
  ctx: CanvasRenderingContext2D,
  w: number,
  layer: MakeupLayer,
  blur: number,
  trace: () => void,
) {
  const off = w + 400;
  ctx.save();
  ctx.globalAlpha = layer.alpha;
  ctx.shadowColor = layer.color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = off;
  ctx.translate(-off, 0);
  ctx.fillStyle = layer.color;
  ctx.beginPath();
  trace();
  ctx.fill('evenodd');
  ctx.restore();
}

function trace(ctx: CanvasRenderingContext2D, lm: Landmark[], idx: number[], w: number, h: number) {
  idx.forEach((i, k) => {
    const p = toPx(lm[i], w, h);
    if (k === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
}

function drawLips(ctx: CanvasRenderingContext2D, lm: Landmark[], w: number, h: number, layer: MakeupLayer) {
  const mouthW = dist(toPx(lm[61], w, h), toPx(lm[291], w, h));
  soft(ctx, w, layer, Math.max(2, mouthW * 0.05), () => {
    trace(ctx, lm, LIPS_OUTER, w, h);
    trace(ctx, lm, LIPS_INNER, w, h);
  });
}

function drawBlush(ctx: CanvasRenderingContext2D, lm: Landmark[], w: number, h: number, layer: MakeupLayer) {
  const faceW = dist(toPx(lm[LM.faceRight], w, h), toPx(lm[LM.faceLeft], w, h));
  const r = faceW * 0.17;
  for (const i of CHEEKS) {
    const c = toPx(lm[i], w, h);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, rgba(layer.color, 0.9));
    g.addColorStop(0.45, rgba(layer.color, 0.45));
    g.addColorStop(1, rgba(layer.color, 0));
    ctx.save();
    ctx.globalAlpha = layer.alpha;
    ctx.translate(c.x, c.y);
    ctx.scale(1.2, 0.85);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawEyeshadow(ctx: CanvasRenderingContext2D, lm: Landmark[], w: number, h: number, layer: MakeupLayer) {
  for (const idx of [RIGHT_EYE_UPPER, LEFT_EYE_UPPER]) {
    const upper = idx.map((i) => toPx(lm[i], w, h));
    const eyeW = dist(upper[0], upper[upper.length - 1]);
    const n = upper.length - 1;
    // The shadow rises highest over the middle of the lid and fades to nothing at the corners
    const top = upper.map((p, k) => ({ x: p.x, y: p.y - eyeW * 0.34 * Math.sin((Math.PI * k) / n) ** 0.8 }));
    soft(ctx, w, layer, Math.max(3, eyeW * 0.16), () => {
      upper.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      [...top].reverse().forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
    });
  }
}

/**
 * Draws the makeup on its own canvas. That canvas is shown with mix-blend-mode: multiply, so the
 * color tints the skin and keeps its texture and shading instead of looking printed on.
 */
export function drawMakeup(
  ctx: CanvasRenderingContext2D,
  lm: Landmark[],
  w: number,
  h: number,
  state: MakeupState,
) {
  if (state.eyeshadow) drawEyeshadow(ctx, lm, w, h, state.eyeshadow);
  if (state.blush) drawBlush(ctx, lm, w, h, state.blush);
  if (state.lipstick) drawLips(ctx, lm, w, h, state.lipstick);
}

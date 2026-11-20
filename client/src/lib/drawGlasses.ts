import type { Adjust, Fit, Landmark } from '../types';
import { readAdjust } from './adjust';
import { LM, angle, dist, toPx } from './geometry';
import { SmoothBag } from './smoothing';

const smooth = new SmoothBag({ x: 0.5, y: 0.5, w: 0.4, r: 0.4 });

export function resetGlassesSmoothing() {
  smooth.reset();
}

/**
 * Glasses sit on the outer corners of the eyes (points 33 and 263):
 * center = middle of the two points, width = their distance x scale, rotation = tilt of the line between them.
 */
export function drawGlasses(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lm: Landmark[],
  w: number,
  h: number,
  fit: Fit,
  adj: Adjust,
) {
  const a = toPx(lm[LM.rightEyeOuter], w, h);
  const b = toPx(lm[LM.leftEyeOuter], w, h);
  const eyeDist = dist(a, b);
  const t = readAdjust(adj, w, h);

  const cx = smooth.next('x', (a.x + b.x) / 2);
  const cy = smooth.next('y', (a.y + b.y) / 2 + eyeDist * fit.offsetY);
  const width = smooth.next('w', eyeDist * fit.scale) * t.size;
  const rot = smooth.next('r', angle(a, b));
  const height = width * (img.naturalHeight / img.naturalWidth);

  ctx.save();
  ctx.globalAlpha = t.alpha;
  ctx.translate(cx + t.dx, cy + t.dy);
  ctx.rotate(rot + t.rot);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

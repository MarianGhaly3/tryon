import type { Adjust, Fit, Landmark } from '../types';
import { readAdjust } from './adjust';
import { FACE_OVAL, faceMetrics, toPx } from './geometry';
import { SmoothBag } from './smoothing';

const smooth = new SmoothBag({ x: 0.4, y: 0.4, w: 0.4, r: 0.4 });

export function resetNecklaceSmoothing() {
  smooth.reset();
}

/**
 * There is no neck landmark, so the necklace hangs from the chin (point 152) along the face axis.
 * Its top edge starts a little above the chin and the face oval is cut out before drawing, so the
 * chain disappears behind the jaw the way a real one does and only the part below the chin shows.
 * Only half of the head tilt is applied, because the neck and shoulders do not tilt like the head.
 */
export function drawNecklace(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lm: Landmark[],
  w: number,
  h: number,
  fit: Fit,
  adj: Adjust,
) {
  const f = faceMetrics(lm, w, h);
  const t = readAdjust(adj, w, h);

  const ax = f.chin.x - f.top.x;
  const ay = f.chin.y - f.top.y;
  const al = Math.hypot(ax, ay) || 1;

  const width = smooth.next('w', f.faceW * fit.scale) * t.size;
  const height = width * (img.naturalHeight / img.naturalWidth);
  const cx = smooth.next('x', f.chin.x + (ax / al) * f.faceH * fit.offsetY);
  const cy = smooth.next('y', f.chin.y + (ay / al) * f.faceH * fit.offsetY);
  const rot = smooth.next('r', f.roll * 0.5);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  FACE_OVAL.forEach((i, k) => {
    const p = toPx(lm[i], w, h);
    if (k === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.clip('evenodd');

  ctx.globalAlpha = t.alpha;
  ctx.translate(cx + t.dx, cy + t.dy);
  ctx.rotate(rot + t.rot);
  ctx.drawImage(img, -width / 2, 0, width, height);
  ctx.restore();
}

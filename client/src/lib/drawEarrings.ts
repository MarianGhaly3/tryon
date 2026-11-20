import type { Adjust, Fit, Landmark } from '../types';
import { readAdjust } from './adjust';
import { faceMetrics } from './geometry';
import { SmoothBag } from './smoothing';

const smooth = new SmoothBag({ rx: 0.5, ry: 0.5, lx: 0.5, ly: 0.5, w: 0.4 });

export function resetEarringsSmoothing() {
  smooth.reset();
}

// Landmarks 234 and 454 sit on the face edge at ear height, which is the cheek, not the lobe.
// The lobe is a little lower along the face axis and a little further out.
const LOBE_DROP = 0.15; // of face height
const LOBE_OUT = 0.03; // of face width

/**
 * Earrings hang from the earlobe. The lobe is found from the face edge, then moved down along the
 * forehead-to-chin axis and out across the face, so it follows head roll. The image is one earring:
 * it is drawn as it is on the ear on the left of the screen and mirrored on the other ear, which makes a pair.
 * `anchorX` is where the earring hangs from, as a fraction of the image width.
 */
export function drawEarrings(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lm: Landmark[],
  w: number,
  h: number,
  fit: Fit,
  adj: Adjust,
  anchorX = 0.5,
) {
  const f = faceMetrics(lm, w, h);
  const t = readAdjust(adj, w, h);

  const ax = f.chin.x - f.top.x;
  const ay = f.chin.y - f.top.y;
  const al = Math.hypot(ax, ay) || 1;
  const dx = ax / al;
  const dy = ay / al;
  const sx = f.left.x - f.right.x;
  const sy = f.left.y - f.right.y;
  const sl = Math.hypot(sx, sy) || 1;
  const ox = sx / sl;
  const oy = sy / sl;

  const earW = smooth.next('w', f.faceW * fit.scale) * t.size;
  const earH = earW * (img.naturalHeight / img.naturalWidth);
  const down = f.faceH * (LOBE_DROP + fit.offsetY);
  const out = f.faceW * LOBE_OUT;

  const showRight = f.noseRatio > 0.32;
  const showLeft = f.noseRatio < 0.68;

  const rx = smooth.next('rx', f.right.x - ox * out + dx * down) + t.dx;
  const ry = smooth.next('ry', f.right.y - oy * out + dy * down) + t.dy;
  const lx = smooth.next('lx', f.left.x + ox * out + dx * down) + t.dx;
  const ly = smooth.next('ly', f.left.y + oy * out + dy * down) + t.dy;

  const one = (x: number, y: number, flip: boolean) => {
    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.translate(x, y);
    ctx.rotate(t.rot);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -earW * anchorX, 0, earW, earH);
    ctx.restore();
  };
  // On screen the picture is mirrored, so the canvas-left ear is the ear on the right of the screen.
  if (showRight) one(rx, ry, true);
  if (showLeft) one(lx, ly, false);
}

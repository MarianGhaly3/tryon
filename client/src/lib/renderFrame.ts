import type { Adjust, AccessoryKind, Fit, Landmark } from '../types';
import { drawEarrings, resetEarringsSmoothing } from './drawEarrings';
import { drawGlasses, resetGlassesSmoothing } from './drawGlasses';
import { drawMakeup, type MakeupState } from './drawMakeup';
import { drawNecklace, resetNecklaceSmoothing } from './drawNecklace';

export type Item = { fit: Fit; img: HTMLImageElement; adj: Adjust; anchorX?: number };

export type Worn = Partial<Record<AccessoryKind, Item>>;
export type FrameState = { worn: Worn; makeup: MakeupState };

/**
 * Draws one frame on two canvases: makeup goes on its own canvas (blended with multiply by CSS),
 * and the necklace, earrings and glasses go on the accessory canvas, with glasses on top.
 */
export function renderFrame(
  acc: CanvasRenderingContext2D,
  makeup: CanvasRenderingContext2D,
  lm: Landmark[] | undefined,
  w: number,
  h: number,
  state: FrameState,
) {
  acc.clearRect(0, 0, w, h);
  makeup.clearRect(0, 0, w, h);

  if (!lm) {
    // No face: draw nothing and reset smoothing so items do not slide in from their old spot
    resetGlassesSmoothing();
    resetEarringsSmoothing();
    resetNecklaceSmoothing();
    return;
  }

  const { glasses, earrings, necklace } = state.worn;
  drawMakeup(makeup, lm, w, h, state.makeup);
  if (necklace) drawNecklace(acc, necklace.img, lm, w, h, necklace.fit, necklace.adj);
  if (earrings) drawEarrings(acc, earrings.img, lm, w, h, earrings.fit, earrings.adj, earrings.anchorX);
  if (glasses) drawGlasses(acc, glasses.img, lm, w, h, glasses.fit, glasses.adj);
}

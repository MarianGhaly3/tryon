import type { Adjust } from '../types';

/**
 * Turns the Styling Studio controls into canvas terms. The canvas is mirrored on screen (like a mirror),
 * so a move to the right on screen is a move to the left on the canvas, and rotation turns the other way.
 */
export function readAdjust(a: Adjust, w: number, h: number) {
  return {
    size: a.size / 100,
    dx: (-a.x / 100) * w,
    dy: (a.y / 100) * h,
    rot: (-a.rotation * Math.PI) / 180,
    alpha: a.opacity / 100,
  };
}

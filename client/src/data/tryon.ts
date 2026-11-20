import type { AccessoryKind, Fit } from '../types';
import meta from './tryon-meta.json';

/**
 * What the camera needs for each product photo of the design.
 * The transparent cut-outs in public/tryon are made from the design's own photos by tools/make_cutouts.py.
 *
 * glasses    scale = frame width / distance between the outer eye corners, offsetY = move down (in eye distances)
 * earrings   scale = earring width / face width, offsetY = move down from the earlobe (in face heights)
 * necklace   scale = chain width / face width, offsetY = where the top edge starts below the chin (in face heights)
 */
export type TryOn = { kind: AccessoryKind; image: string; fit: Fit; anchorX?: number };

const B = import.meta.env.BASE_URL;
const cut = (name: string) => `${B}tryon/${name}.png`;
const anchor = (name: string) => (meta as Record<string, { anchorX?: number }>)[name]?.anchorX;

export const TRYON: Record<string, TryOn> = {
  rose: { kind: 'glasses', image: cut('rose'), fit: { scale: 1.72, offsetY: 0.04 } },
  black: { kind: 'glasses', image: cut('black'), fit: { scale: 1.62, offsetY: 0.02 } },
  tortoise: { kind: 'glasses', image: cut('tortoise'), fit: { scale: 1.62, offsetY: 0.05 } },
  wire: { kind: 'glasses', image: cut('wire'), fit: { scale: 1.62, offsetY: 0.02 } },
  round: { kind: 'glasses', image: cut('round'), fit: { scale: 1.62, offsetY: 0.03 } },
  pink: { kind: 'glasses', image: cut('pink'), fit: { scale: 1.62, offsetY: 0.05 } },
  green: { kind: 'glasses', image: cut('green'), fit: { scale: 1.62, offsetY: 0.03 } },
  hoops: { kind: 'earrings', image: cut('hoops'), fit: { scale: 0.13, offsetY: -0.03 }, anchorX: anchor('hoops') },
  necklace: { kind: 'necklace', image: cut('necklace'), fit: { scale: 0.6, offsetY: -0.14 } },
};

/** Lip colors of the makeup products, taken from the product photo. */
export const LIP_COLORS: Record<number, string> = {
  5: '#c4566f', // Matte Lipstick – Rose
  9: '#a02040', // Velvet Lipstick – Berry
};

/** Slider limits of the Styling Studio controls, in the design's units. */
export const ADJUST_LIMITS = { size: [50, 150], rotation: [-45, 45], opacity: [10, 100] } as const;

/** Where the design's manual placement puts a piece (percent of the preview: center x, center y, width). */
export const PLACEMENT = {
  Glasses: { x: 50, y: 39, w: 45 },
  Earrings: { x: 25, y: 49, w: 11 },
  Necklaces: { x: 50, y: 77, w: 27 },
  Makeup: { x: 50, y: 59, w: 15 },
} as const;

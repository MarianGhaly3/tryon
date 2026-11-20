export type Landmark = { x: number; y: number; z: number };

export type Category = 'Glasses' | 'Earrings' | 'Necklaces' | 'Makeup';

/** A product exactly as the ÉCLAT design lists it (see data/products.ts). */
export type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  rating: number;
  reviews: number;
  /** Which photo of the design shows this product (see data/art.ts). */
  art: string;
  color: string;
  brand: string;
  style: string;
  tag: string;
};

export type Look = {
  id: string;
  name: string;
  ids: number[];
  art?: string;
  /** A photo taken in the studio. When missing, the design's sample photo is used. */
  photo?: string;
  date: string;
  favorite?: boolean;
  settings?: Adjust;
};

/** The controls of the Styling Studio: size and opacity in percent, x and y in percent of the frame, rotation in degrees. */
export type Adjust = { size: number; x: number; y: number; rotation: number; opacity: number };
export const NO_ADJUST: Adjust = { size: 100, x: 0, y: 0, rotation: 0, opacity: 100 };

/** How a cut-out sits on the face. Meaning differs per kind (see data/tryon.ts). */
export type Fit = { scale: number; offsetY: number };

export type AccessoryKind = 'glasses' | 'earrings' | 'necklace';

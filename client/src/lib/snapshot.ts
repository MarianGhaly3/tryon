import { ART } from '../data/art';
import { PLACEMENT } from '../data/tryon';
import { asset } from '../components/Art';
import { product } from '../data/products';
import { NO_ADJUST, type Adjust, type Category } from '../types';
import { loadImage } from './images';

type Source = {
  /** The preview box on screen: its shape decides the shape of the photo. */
  box: HTMLElement;
  video: HTMLVideoElement | null;
  image: HTMLImageElement;
  live: boolean;
  accessories: HTMLCanvasElement | null;
  makeup: HTMLCanvasElement | null;
  /** True while the face is tracked. Otherwise the pieces of the manual placement are drawn. */
  tracked: boolean;
  selected: number[];
  category: Category;
  adjust: Adjust;
};

// The preview shows the picture with object-fit: cover and object-position: center 35%
const FOCUS_Y = 0.35;

/** A photo of the preview, with the same crop, mirror and blending as on screen. */
export async function takeSnapshot(s: Source): Promise<HTMLCanvasElement> {
  const src = s.live && s.video ? s.video : s.image;
  const width = s.live && s.video ? s.video.videoWidth : s.image.naturalWidth;
  const height = s.live && s.video ? s.video.videoHeight : s.image.naturalHeight;
  if (!width || !height) throw new Error('The preview is still loading.');

  const box = s.box.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.round((width * box.height) / box.width);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available.');

  const scale = Math.max(canvas.width / width, canvas.height / height);
  const dw = width * scale;
  const dh = height * scale;
  const dx = (canvas.width - dw) / 2;
  const dy = (canvas.height - dh) * FOCUS_Y;

  ctx.save();
  if (s.live) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, dx, dy, dw, dh);
  if (s.live && s.tracked) {
    if (s.makeup) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(s.makeup, dx, dy, dw, dh);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (s.accessories) ctx.drawImage(s.accessories, dx, dy, dw, dh);
  }
  ctx.restore();

  if (s.live && !s.tracked) await drawManual(ctx, s, canvas.width, canvas.height);
  return canvas;
}

/** The design's own export: the pieces of the manual placement, blended with multiply. */
async function drawManual(ctx: CanvasRenderingContext2D, s: Source, cw: number, ch: number) {
  for (const id of s.selected) {
    const p = product(id);
    if (!p) continue;
    const a = ART[p.category === 'Makeup' ? 'lips' : p.art];
    const pos = PLACEMENT[p.category];
    const adj = p.category === s.category ? s.adjust : NO_ADJUST;
    const img = await loadImage(asset(`reference/${a[0]}.webp`));
    // Reference sheets are shown at their own size in the design: scale the crop by the sheet ratio
    const k = img.naturalWidth / a[1];
    const w = ((pos.w * adj.size) / 10000) * cw;
    const h = (w * a[6]) / a[5];
    ctx.save();
    ctx.translate(((pos.x + adj.x) / 100) * cw, ((pos.y + adj.y) / 100) * ch);
    ctx.rotate((adj.rotation * Math.PI) / 180);
    ctx.globalAlpha = adj.opacity / 100;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(img, a[3] * k, a[4] * k, a[5] * k, a[6] * k, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

export function download(blob: Blob | null, name: string) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const toBlob = (c: HTMLCanvasElement) => new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));

/** A small JPEG of the photo, small enough to keep in the browser with the saved look. */
export function thumbnail(c: HTMLCanvasElement, maxWidth = 520): string {
  const k = Math.min(1, maxWidth / c.width);
  const t = document.createElement('canvas');
  t.width = Math.round(c.width * k);
  t.height = Math.round(c.height * k);
  t.getContext('2d')?.drawImage(c, 0, 0, t.width, t.height);
  return t.toDataURL('image/jpeg', 0.82);
}

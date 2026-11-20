import type { CSSProperties } from 'react';
import { ART } from '../data/art';

const B = import.meta.env.BASE_URL;

/** A product photo of the design: a crop of one of its reference photos, shown with a CSS background. */
export default function Art({ name, cls = '', label = '', style: extra }: { name: string; cls?: string; label?: string; style?: CSSProperties }) {
  const [sheet, W, H, x, y, w, h] = ART[name] ?? ART.rose;
  const style = {
    backgroundImage: `url('${B}images/reference/${sheet}.webp')`,
    backgroundSize: `${(W / w) * 100}% ${(H / h) * 100}%`,
    backgroundPosition: `${(x / (W - w)) * 100}% ${(y / (H - h)) * 100}%`,
    '--art-ratio': w / h,
    ...extra,
  } as CSSProperties;
  return <span className={`photo-art ${cls}`.trim()} role="img" aria-label={label || name} style={style} />;
}

export const asset = (file: string) => `${B}images/${file}`;

#!/usr/bin/env python3
"""
Makes the transparent try-on images from the product photos of the ÉCLAT design.

The design shows each product as a crop of a reference sheet (client/design-source/reference/*, the images from the design).
The camera needs the same product on a transparent background, so this script

  1. crops the product out of the sheet (same coordinates the design uses in client/src/data/art.ts),
  2. removes the plain studio backdrop (fits the backdrop gradient and keys against it),
  3. cleans the edges, upscales 4x and sharpens,
  4. writes client/public/tryon/<name>.png and client/src/data/tryon-meta.json.

Needs: pillow, numpy, opencv-python (pip install pillow numpy opencv-python).

  python tools/make_cutouts.py                 rebuild everything
  python tools/make_cutouts.py --preview out.png   also write a contact sheet to check the result

To add a product of your own, use the "photo" mode (one item on a plain background, straight from the front):

  python tools/make_cutouts.py --photo my-glasses.jpg --name my-glasses --kind glasses
"""
import argparse
import json
import os

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CLIENT = os.path.normpath(os.path.join(HERE, '..', 'client'))
SHEETS = os.path.join(CLIENT, 'design-source', 'reference')
OUT = os.path.join(CLIENT, 'public', 'tryon')
META = os.path.join(CLIENT, 'src', 'data', 'tryon-meta.json')
UP = 4  # upscale factor

# name: (sheet, x, y, w, h, kind, low, high, options)
# low/high = distance from the backdrop where alpha goes 0 -> 1
# options: smooth = median-filter the edge, fill = fill holes inside the product, xmax = keep only the left part of a pair
CROPS = {
    'rose': ('mobile', 83, 1080, 165, 94, 'glasses', 16, 44, {'smooth': True, 'shrink': 2, 'fill': True}),
    'black': ('studio', 1241, 382, 116, 68, 'glasses', 34, 70, {'smooth': True, 'dark': 150}),
    'tortoise': ('studio', 1382, 380, 119, 72, 'glasses', 22, 52, {'smooth': True}),
    'wire': ('studio', 1530, 381, 111, 72, 'glasses', 14, 36, {}),
    'round': ('studio', 1097, 535, 114, 72, 'glasses', 14, 40, {'smooth': True}),
    'pink': ('studio', 1380, 535, 122, 73, 'glasses', 12, 34, {'smooth': True}),
    'green': ('studio', 1530, 538, 114, 70, 'glasses', 16, 44, {'smooth': True}),
    'hoops': ('mobile', 287, 1056, 143, 119, 'earrings', 22, 52, {'smooth': True, 'xmax': 0.53}),
    'necklace': ('mobile', 479, 1041, 144, 143, 'necklace', 16, 44, {'fill': True}),
}


def fit_backdrop(img, ring=3):
    """Quadratic surface per channel, fitted to the border pixels (outliers dropped), evaluated everywhere."""
    h, w, _ = img.shape
    yy, xx = np.mgrid[0:h, 0:w]
    xs, ys = xx / w, yy / h
    basis = np.stack([np.ones_like(xs), xs, ys, xs * ys, xs ** 2, ys ** 2], -1)
    mask = np.zeros((h, w), bool)
    mask[:ring], mask[-ring:], mask[:, :ring], mask[:, -ring:] = True, True, True, True
    out = np.zeros_like(img, dtype=np.float64)
    keep_all = mask.copy()
    for c in range(3):
        keep = mask.copy()
        for _ in range(4):
            A, b = basis[keep], img[..., c][keep]
            coef, *_ = np.linalg.lstsq(A, b, rcond=None)
            res = np.abs(basis @ coef - img[..., c])
            keep = mask & (res < 9)
            if keep.sum() < 30:
                keep = mask
                break
        out[..., c] = basis @ coef
        keep_all &= keep
    return out


def smooth_alpha(d, low, high):
    t = np.clip((d - low) / (high - low), 0, 1)
    return t * t * (3 - 2 * t)


def fill_holes(a, max_area=260):
    """Makes closed shapes solid (white enamel petals inside a gold outline are close to the backdrop colour)."""
    m = (a > 0.4).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    h, w = m.shape
    pad = np.pad(m, 1)
    flood = pad.copy()
    cv2.floodFill(flood, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 2)
    holes = (flood[1:-1, 1:-1] == 0).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(holes, connectivity=4)
    small = np.zeros(n, bool)
    small[1:] = stats[1:, cv2.CC_STAT_AREA] <= max_area  # only small holes: the gap between two chains must stay open
    return np.maximum(a, small[lab].astype(np.float64))


def key_crop(rgb, low, high, opts=None):
    """Returns float alpha (0..1) and the backdrop model."""
    opts = opts or {}
    img = rgb.astype(np.float64)
    bg = fit_backdrop(img)
    d = np.sqrt(((img - bg) ** 2).sum(-1)) * 0.75  # euclidean, scaled so it is comparable to a channel difference
    a = smooth_alpha(d, low, high)
    # drop specks that are not part of the product: keep components with a sensible size
    binary = (a > 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if n > 1:
        biggest = stats[1:, cv2.CC_STAT_AREA].max()
        keep = np.zeros(n, bool)
        keep[1:] = stats[1:, cv2.CC_STAT_AREA] >= max(6, biggest * 0.02)
        a = a * keep[lab]
    if opts.get('smooth'):
        a = cv2.medianBlur((a * 255).astype(np.uint8), 3).astype(np.float64) / 255
    if 'dark' in opts:  # cut away the soft shadow under dark frames: it is lighter than any part of the frame
        lum = rgb.astype(np.float64) @ np.array([0.299, 0.587, 0.114])
        a = a * (lum < opts['dark'])
    if opts.get('fill'):
        a = fill_holes(a)
    if 'xmax' in opts:
        a[:, int(a.shape[1] * opts['xmax']):] = 0
    return a, bg


def finish(rgb, a, bg, shrink=0):
    """Edge colour clean-up, upscale, sharpen. Returns an RGBA uint8 array."""
    h, w = a.shape
    img = rgb.astype(np.float64)
    # remove the backdrop colour that leaks into soft edges
    safe = np.clip(a, 0.08, 1)[..., None]
    fg = np.clip((img - (1 - safe) * bg) / safe, 0, 255)
    # where alpha is low the colour is unreliable: replace it with the weighted average of nearby solid colour
    num = cv2.GaussianBlur(fg * a[..., None], (0, 0), 1.6)
    den = cv2.GaussianBlur(a, (0, 0), 1.6)[..., None] + 1e-4
    near = num / den
    blend = np.clip((a - 0.35) / 0.4, 0, 1)[..., None]
    fg = fg * blend + near * (1 - blend)
    big = cv2.resize(fg.astype(np.float32), (w * UP, h * UP), interpolation=cv2.INTER_CUBIC)
    blur = cv2.GaussianBlur(big, (0, 0), 1.4)
    big = np.clip(big + (big - blur) * 0.9, 0, 255)
    ab = cv2.resize(a.astype(np.float32), (w * UP, h * UP), interpolation=cv2.INTER_CUBIC)
    ab = np.clip((ab - 0.22) / 0.56, 0, 1)
    if shrink:  # pull the edge in a little: the last pixels of an edge still carry the light backdrop
        ab = cv2.erode(ab, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=shrink)
    ab = cv2.GaussianBlur(ab, (0, 0), 0.7)
    out = np.dstack([big, ab * 255]).astype(np.uint8)
    # crop to the product
    ys, xs = np.where(out[..., 3] > 12)
    return out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def anchor_x(rgba):
    """Where an earring hangs from: the middle of its topmost solid pixels, as a fraction of the width."""
    ys, xs = np.where(rgba[..., 3] > 120)
    top = ys.min()
    sel = xs[ys <= top + max(3, rgba.shape[0] // 40)]
    return float(sel.mean() / rgba.shape[1])


def process(name, rgb, kind, low, high, opts=None):
    a, bg = key_crop(rgb, low, high, opts)
    rgba = finish(rgb, a, bg, (opts or {}).get('shrink', 0))
    meta = {'w': int(rgba.shape[1]), 'h': int(rgba.shape[0])}
    if kind == 'earrings':
        meta['anchorX'] = round(anchor_x(rgba), 3)
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name + '.png'), optimize=True)
    print(f'{name:10s} {meta}')
    return rgba, meta


def contact_sheet(items, path):
    cell_w, cell_h = 560, 330
    cols = 3
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell_w, rows * cell_h), (198, 150, 128))  # a skin-like tone
    for i, (name, rgba) in enumerate(items):
        im = Image.fromarray(rgba, 'RGBA')
        k = min((cell_w - 30) / im.width, (cell_h - 40) / im.height)
        im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
        x, y = (i % cols) * cell_w + 15, (i // cols) * cell_h + 20
        sheet.paste(im, (x, y), im)
    sheet.save(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--photo', help='your own product photo (photo mode)')
    ap.add_argument('--name', help='file name for the product (photo mode)')
    ap.add_argument('--kind', choices=['glasses', 'earrings', 'necklace'], help='product type (photo mode)')
    ap.add_argument('--low', type=int, default=16, help='lower the number to keep more faint edges')
    ap.add_argument('--high', type=int, default=44, help='backdrop distance that is fully solid')
    ap.add_argument('--preview', help='write a contact sheet PNG')
    a = ap.parse_args()

    meta = json.load(open(META)) if os.path.exists(META) else {}
    items = []
    if a.photo:
        if not (a.name and a.kind):
            ap.error('photo mode needs --name and --kind')
        rgb = np.array(Image.open(a.photo).convert('RGB'))
        if rgb.shape[1] > 700:  # keep the working size small: the fit and keying are per pixel
            k = 700 / rgb.shape[1]
            rgb = cv2.resize(rgb, (700, int(rgb.shape[0] * k)), interpolation=cv2.INTER_AREA)
        rgba, m = process(a.name, rgb, a.kind, a.low, a.high, {'smooth': a.kind == 'glasses', 'fill': a.kind == 'necklace'})
        meta[a.name] = m
        items.append((a.name, rgba))
    else:
        sheets = {}
        for name, (sheet, x, y, w, h, kind, low, high, opts) in CROPS.items():
            if sheet not in sheets:
                sheets[sheet] = np.array(Image.open(os.path.join(SHEETS, sheet + '.png')).convert('RGB'))
            rgb = sheets[sheet][y:y + h, x:x + w]
            rgba, m = process(name, rgb, kind, low, high, opts)
            meta[name] = m
            items.append((name, rgba))
    json.dump(meta, open(META, 'w'), indent=2)
    if a.preview:
        contact_sheet(items, a.preview)
        print('preview ->', a.preview)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Converts the heavy PNGs of the design (client/design-source) to WebP for the website (client/public/images).
Pixel size stays the same, so every crop coordinate in client/src/data/art.ts keeps working.
Needs: pip install pillow
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, '..', 'client', 'design-source'))
DST = os.path.normpath(os.path.join(HERE, '..', 'client', 'public', 'images'))
JOBS = [
    ('reference/mobile.png', 'reference/mobile.webp', 92),
    ('reference/studio.png', 'reference/studio.webp', 92),
    ('reference/screens.png', 'reference/screens.webp', 92),
    ('reference/looks.png', 'reference/looks.webp', 92),
    ('hero-cutout.png', 'hero-cutout.webp', 90),
    ('studio-portrait.png', 'studio-portrait.webp', 88),
]
for src, dst, q in JOBS:
    out = os.path.join(DST, dst)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(os.path.join(SRC, src))
    im.save(out, 'WEBP', quality=q, method=6)
    print(f'{src:24s} {os.path.getsize(os.path.join(SRC, src)) / 1024:7.0f} KB -> {os.path.getsize(out) / 1024:5.0f} KB')

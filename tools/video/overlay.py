"""Caption frames (RGBA PNG, 1920x1080 @ 30 fps) for the RB-Y1 overview inserted into the teaser.

The layout copies the teaser's Bandu overview: a top band and a bottom shade, a serif headline bottom-left over
two lines of Ubuntu Light, a coral progress line, and the task block top-right. Sizes and positions were measured
from the teaser frame at 20 s. Usage: python overlay.py shots.json fonts_dir out_dir
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

shots, FONTS, OUT = json.load(open(sys.argv[1]))['shots'], Path(sys.argv[2]), Path(sys.argv[3])
OUT.mkdir(parents=True, exist_ok=True)
W, H, FPS = 1920, 1080, 30
TITLE = 52
N = sum(s['frames'] for s in shots)


def serif(size):
    # Source Serif 4 at opsz 60, wght 400 (fonttools varLib.instancer): its stems and widths match the teaser's
    return ImageFont.truetype(str(FONTS / 'SS4_o60_w400.ttf'), size)


F = {'head': serif(76), 'title': serif(TITLE), 'sub': ImageFont.truetype(str(FONTS / 'Ubuntu-Light.ttf'), 36),
     'tsub': ImageFont.truetype(str(FONTS / 'Ubuntu-Light.ttf'), 25), 'mono': ImageFont.truetype(str(FONTS / 'UbuntuMono-Regular.ttf'), 30)}
INK, INK2, CORAL = (245, 243, 236), (228, 228, 222), (221, 117, 82)

# the shade: a top band and a bottom ramp shaped as measured against the teaser's clean plate, a little deeper
# because the RB-Y1 lab is far brighter than the Bandu table
y = np.arange(H, dtype=np.float32)
shade = np.maximum(0.72 * np.clip(1 - y / 330, 0, 1) ** 1.3, 0.76 * np.clip((y - 460) / 620, 0, 1) ** 1.1)
SHADE = np.zeros((H, W, 4), np.uint8)
SHADE[..., 3] = (np.repeat(shade[:, None], W, 1) * 255).astype(np.uint8)

starts = np.cumsum([0] + [s['frames'] for s in shots])
FADE_IN, FADE_OUT = (15, 36), (N - 27, N - 12)      # in after the dissolve from the grid, out before the one to Bandu


def ramp(i, a, b):
    return float(np.clip((i - a) / (b - a), 0, 1))


def text(layer, xy, s, font, fill, alpha, anchor):
    if alpha <= 0:
        return
    t = Image.new('RGBA', (W, H))
    ImageDraw.Draw(t).text(xy, s, font=font, fill=fill + (255,), anchor=anchor)
    t.putalpha(t.getchannel('A').point(lambda v: int(v * alpha)))
    layer.alpha_composite(t)


ONLY = [int(x) for x in os.environ.get('ONLY', '').split(',') if x]
for i in (ONLY or range(N)):
    g = ramp(i, *FADE_IN) * (1 - ramp(i, *FADE_OUT))
    k = int(np.searchsorted(starts, i, side='right') - 1)
    sh = shots[k]
    im = Image.new('RGBA', (W, H))
    if g > 0:
        s = SHADE.copy(); s[..., 3] = (s[..., 3] * g).astype(np.uint8)
        im.alpha_composite(Image.fromarray(s, 'RGBA'))
        text(im, (1866, 91), 'Mobile manipulation', F['title'], INK, g, 'rs')
        text(im, (1866, 119), 'six chained tasks  ·  Rainbow RB-Y1', F['tsub'], INK2, 0.92 * g, 'rs')
        text(im, (1879, 163), f"task  {sh['task']} / 6", F['mono'], INK2, g, 'rs')
        text(im, (57, 940), 'One instruction, end to end', F['head'], INK, g, 'ls')
        text(im, (57, 985), 'No demonstrations · no teleoperation', F['sub'], INK2, 0.95 * g, 'ls')
        # the step caption dissolves over 8 frames when it changes at a cut
        prev = shots[k - 1]['cap'] if k else None
        mix = ramp(i, starts[k], starts[k] + 8) if prev and prev != sh['cap'] else 1.0
        text(im, (57, 1031), sh['cap'], F['sub'], INK2, 0.95 * g * mix, 'ls')
        if mix < 1:
            text(im, (57, 1031), prev, F['sub'], INK2, 0.95 * g * (1 - mix), 'ls')
        x1 = 57 + (1863 - 57) * ramp(i, FADE_IN[0], FADE_OUT[1])
        if x1 > 58:
            d = Image.new('RGBA', (W, H)); ImageDraw.Draw(d).rectangle([57, 1050, x1, 1053], fill=CORAL + (int(255 * g),))
            im.alpha_composite(d)
    im.save(OUT / f'{i:05d}.png', compress_level=1)
print(N, 'frames')

"""Rasterize public/icon.svg into PWA/launcher PNG icons.

Maskable icons need the artwork inside the safe zone (centre 80%), so we render
the same SVG onto a padded canvas for the maskable variants.
"""
import cairosvg
from PIL import Image
import io, os

SRC = 'public/icon.svg'
OUT = 'public/icons'
os.makedirs(OUT, exist_ok=True)


def render(size: int) -> Image.Image:
    png = cairosvg.svg2png(url=SRC, output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert('RGBA')


def masked(size: int, pad_ratio: float = 0.16, bg=(124, 92, 255, 255)) -> Image.Image:
    """Full-bleed background with the logo shrunk into the maskable safe zone."""
    canvas = Image.new('RGBA', (size, size), bg)
    inner = int(size * (1 - 2 * pad_ratio))
    logo = render(inner)
    off = (size - inner) // 2
    canvas.alpha_composite(logo, (off, off))
    return canvas


for s in (192, 512):
    render(s).save(f'{OUT}/icon-{s}.png')

for s in (192, 512):
    masked(s).save(f'{OUT}/maskable-{s}.png')

apple = Image.new('RGBA', (180, 180), (124, 92, 255, 255))
apple.alpha_composite(render(180))
apple.convert('RGB').save(f'{OUT}/apple-touch-icon.png')

render(48).save(f'{OUT}/favicon-48.png')

print('icons written:', sorted(os.listdir(OUT)))

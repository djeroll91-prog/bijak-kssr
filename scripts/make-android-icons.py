"""Generate Android launcher icons (drawable density buckets) from public/icon.svg."""
import cairosvg
from PIL import Image
import io, os

SRC = 'public/icon.svg'
BASE = 'android-app/src/main/res'
# Launcher icon sizes per density bucket (48dp baseline).
BUCKETS = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}


def render(size: int):
    png = cairosvg.svg2png(url=SRC, output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert('RGBA')


for bucket, size in BUCKETS.items():
    d = os.path.join(BASE, f'drawable-{bucket}')
    os.makedirs(d, exist_ok=True)
    render(size).save(os.path.join(d, 'ic_launcher.png'))

# Fallback bucket
d = os.path.join(BASE, 'drawable')
os.makedirs(d, exist_ok=True)
render(96).save(os.path.join(d, 'ic_launcher.png'))

print('android launcher icons written')
for bucket, size in BUCKETS.items():
    print(f'  drawable-{bucket}/ic_launcher.png {size}x{size}')

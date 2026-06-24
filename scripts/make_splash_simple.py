from PIL import Image
import os

OUT_DIR = r"C:/Users/HP 240 inch G9/tnsvt-market-instinct/android/app/src/main/res"

SIZES = {
    'drawable':           512,
    'drawable-port-xxxhdpi': 1920,
    'drawable-port-xxhdpi':  1440,
    'drawable-port-xhdpi':   960,
    'drawable-port-hdpi':    640,
    'drawable-port-mdpi':    480,
    'drawable-land-xxxhdpi': 1920,
    'drawable-land-xxhdpi':  1440,
    'drawable-land-xhdpi':   960,
    'drawable-land-hdpi':    640,
    'drawable-land-mdpi':    480,
}

# Gradiente purple→black + diamante centrado + texto pequeño. SIN BLUR (pesado)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random
random.seed(7)

for folder, size in SIZES.items():
    path = os.path.join(OUT_DIR, folder)
    os.makedirs(path, exist_ok=True)
    if folder.startswith('drawable-land'):
        W = size; H = int(size * 0.5)
    else:
        W = H = size
    # Fondo
    img = Image.new('RGB', (W, H), (10, 5, 30))
    px = img.load()
    cx, cy = W/2, H/2
    for y in range(H):
        for x in range(W):
            d = math.sqrt((x-cx)**2 + (y-cy)**2) / math.sqrt(cx*cx+cy*cy)
            r = int(60 * (1-d) + 10 * d)
            g = int(20 * (1-d) + 5 * d)
            b = int(100 * (1-d) + 30 * d)
            px[x, y] = (r, g, b)
    # Diamante
    draw = ImageDraw.Draw(img)
    ds = int(min(W, H) * 0.08)
    diamond = [(cx, cy-ds), (cx+ds, cy), (cx, cy+ds), (cx-ds, cy)]
    draw.polygon(diamond, fill=(240, 192, 96), outline=(180, 130, 30))
    img.save(os.path.join(path, 'splash.png'), 'PNG', optimize=True)
    print(f"OK {folder} ({img.size[0]}x{img.size[1]})")
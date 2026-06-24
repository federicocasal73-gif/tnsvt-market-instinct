from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random, os

random.seed(42)

# Tamaños a generar (Android density buckets)
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

OUT_DIR = r"C:/Users/HP 240 inch G9/tnsvt-market-instinct/android/app/src/main/res"

def make_splash(size, landscape=False):
    if landscape:
        W = size; H = int(size * 0.5)
    else:
        W = H = size
    # Clean dark background — radial gradient similar to app theme
    bg = Image.new('RGB', (W, H), (6, 4, 15))
    px = bg.load()
    cx, cy = W/2, H/2
    maxR = math.sqrt(cx*cx + cy*cy)
    for y in range(H):
        for x in range(W):
            d = math.sqrt((x-cx)**2 + (y-cy)**2) / maxR
            if d < 0.5:
                t = d / 0.5
                r = int(8 * (1-t) + 6 * t)
                g = int(5 * (1-t) + 4 * t)
                b = int(28 * (1-t) + 15 * t)
            else:
                t = (d - 0.5) / 0.5
                r = int(6 * (1-t) + 6 * t)
                g = int(4 * (1-t) + 4 * t)
                b = int(15 * (1-t) + 15 * t)
            px[x, y] = (r, g, b)
    return bg

# Generar todos los tamaños
for folder, size in SIZES.items():
    path = os.path.join(OUT_DIR, folder)
    os.makedirs(path, exist_ok=True)
    img = make_splash(size, landscape=folder.startswith('drawable-land'))
    img.save(os.path.join(path, 'splash.png'), 'PNG', optimize=True)
    print(f"OK {folder}/splash.png ({img.size[0]}x{img.size[1]})")

print("\nAll splash screens generated — clean dark gradient, no branding.")
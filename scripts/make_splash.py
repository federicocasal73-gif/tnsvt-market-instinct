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
    # Fondo radial gradient dark purple -> black
    bg = Image.new('RGB', (W, H), (6, 4, 15))
    px = bg.load()
    cx, cy = W/2, H/2
    maxR = math.sqrt(cx*cx + cy*cy)
    for y in range(H):
        for x in range(W):
            d = math.sqrt((x-cx)**2 + (y-cy)**2) / maxR
            # interpolate (6,4,15) -> (50,20,90) -> (10,5,30)
            if d < 0.4:
                t = d / 0.4
                r = int(50 * (1-t) + 10 * t)
                g = int(20 * (1-t) + 5 * t)
                b = int(90 * (1-t) + 30 * t)
            else:
                t = (d - 0.4) / 0.6
                r = int(10 * (1-t) + 6 * t)
                g = int(5 * (1-t) + 4 * t)
                b = int(30 * (1-t) + 15 * t)
            px[x, y] = (r, g, b)
    # Partículas doradas estáticas (50 puntos con glow)
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for _ in range(60):
        x = random.randint(0, W-1)
        y = random.randint(0, H-1)
        # evitar el centro donde va el logo
        if abs(x - W/2) < W*0.18 and abs(y - H/2) < H*0.12:
            continue
        r = random.randint(2, 6)
        alpha = random.randint(120, 220)
        od.ellipse([x-r, y-r, x+r, y+r], fill=(240, 192, 96, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=1.5))
    bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
    # Texto: "T.N.S.V.T" grande + slogan "MARKET INSTINCT" abajo
    draw = ImageDraw.Draw(bg)
    # Font sizes proportional
    fs_main = int(W * 0.12)
    fs_sub = int(W * 0.038)
    # Try Cinzel if available, fallback to default
    try:
        font_main = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", fs_main)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", fs_sub)
    except:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    # Sombra dorada del logo principal
    text_main = "T.N.S.V.T"
    bbox = draw.textbbox((0, 0), text_main, font=font_main)
    tw = bbox[2] - bbox[0]; th = bbox[3] - bbox[1]
    tx = (W - tw) // 2 - bbox[0]
    ty = (H - th) // 2 - bbox[1] - int(H*0.02)
    # Sombra
    for dx, dy in [(-2,-2),(2,-2),(-2,2),(2,2),(0,-3),(0,3),(-3,0),(3,0)]:
        draw.text((tx+dx, ty+dy), text_main, font=font_main, fill=(120, 60, 20, 180))
    # Texto gold con glow
    for dx, dy in [(0,0)]:
        draw.text((tx+dx, ty+dy), text_main, font=font_main, fill=(255, 230, 160, 255))
    # Glow extra encima
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.text((tx, ty), text_main, font=font_main, fill=(255, 215, 100, 160))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=8))
    bg = Image.alpha_composite(bg, glow)
    # Slogan
    draw = ImageDraw.Draw(bg)
    text_sub = "MARKET  INSTINCT"
    bbox2 = draw.textbbox((0, 0), text_sub, font=font_sub)
    sw = bbox2[2] - bbox2[0]
    sx = (W - sw) // 2 - bbox2[0]
    sy = ty + th + int(H*0.04)
    draw.text((sx, sy), text_sub, font=font_sub, fill=(200, 160, 220, 220))
    # Diamante decorativo
    dcx, dcy = W // 2, sy + int(fs_sub * 1.8)
    ds = int(W * 0.025)
    diamond = [(dcx, dcy-ds), (dcx+ds, dcy), (dcx, dcy+ds), (dcx-ds, dcy)]
    draw.polygon(diamond, fill=(255, 215, 100, 220), outline=(180, 130, 30, 255))
    return bg.convert('RGB')

# Generar todos los tamaños
for folder, size in SIZES.items():
    path = os.path.join(OUT_DIR, folder)
    os.makedirs(path, exist_ok=True)
    img = make_splash(size, landscape=folder.startswith('drawable-land'))
    img.save(os.path.join(path, 'splash.png'), 'PNG', optimize=True)
    print(f"OK {folder}/splash.png ({img.size[0]}x{img.size[1]})")

print("\nAll splash screens generated.")
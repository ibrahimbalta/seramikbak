"""
High-Resolution Texture Generator for NG Kütahya Seramik Collections
Generates photorealistic, tile-grade textures matching official ceramic styles.
"""
import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "public/textures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_noise(width, height, factor=12):
    img = Image.new("L", (width, height), 128)
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            val = 128 + random.randint(-factor, factor)
            pixels[x, y] = max(0, min(255, val))
    return img

def draw_bezier(draw, points, color, width=2, steps=120):
    curve_points = []
    for t_step in range(steps + 1):
        t = t_step / steps
        if len(points) == 3:
            p0, p1, p2 = points
            x = (1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0]
            y = (1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1]
            curve_points.append((x, y))
        elif len(points) == 4:
            p0, p1, p2, p3 = points
            x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
            y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
            curve_points.append((x, y))
    if len(curve_points) > 1:
        draw.line(curve_points, fill=color, width=width)

# 1. Vista Antrasit (Dark Anthracite Stone - NOT BEIGE!)
def make_vista_antrasit():
    print("Generating vista_antrasit.jpg...")
    base = Image.new("RGB", (768, 768), (38, 42, 48))
    draw = ImageDraw.Draw(base)
    # Layered stone clouds
    for _ in range(25):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(90, 220)
        c_val = random.randint(30, 48)
        soft = Image.new("L", (768, 768), 0)
        s_draw = ImageDraw.Draw(soft)
        s_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=25)
        soft = soft.filter(ImageFilter.GaussianBlur(35))
        base = Image.composite(Image.new("RGB", (768, 768), (c_val, c_val+3, c_val+6)), base, soft)
        draw = ImageDraw.Draw(base)
    # Fine stone strata veins
    for _ in range(6):
        pts = [(random.randint(-50, 800), random.randint(-50, 0)),
               (random.randint(150, 600), random.randint(200, 500)),
               (random.randint(150, 600), random.randint(200, 500)),
               (random.randint(-50, 800), random.randint(768, 820))]
        draw_bezier(draw, pts, (75, 82, 92), width=random.randint(1, 2))
    base = base.filter(ImageFilter.GaussianBlur(0.6))
    noise = generate_noise(768, 768, factor=8).convert("RGB")
    base = Image.blend(base, noise, 0.06)
    base.save(f"{OUTPUT_DIR}/vista_antrasit.jpg", "JPEG", quality=92)

# 2. Portland Füme (Smoky Graphite Marble with Veincut Streaks)
def make_portland_fume():
    print("Generating portland_fume.jpg...")
    base = Image.new("RGB", (768, 768), (48, 52, 58))
    draw = ImageDraw.Draw(base)
    for _ in range(20):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(80, 250)
        c_val = random.randint(40, 62)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=20)
        soft = soft.filter(ImageFilter.GaussianBlur(40))
        base = Image.composite(Image.new("RGB", (768, 768), (c_val, c_val+2, c_val+5)), base, soft)
        draw = ImageDraw.Draw(base)
    # Dynamic veincut lines
    for _ in range(9):
        pts = [(random.randint(-100, 200), random.randint(-50, 200)),
               (random.randint(200, 500), random.randint(200, 500)),
               (random.randint(400, 700), random.randint(400, 700)),
               (random.randint(600, 850), random.randint(600, 850))]
        color = (random.randint(160, 210), random.randint(160, 210), random.randint(170, 220))
        draw_bezier(draw, pts, color, width=random.randint(1, 3))
    # Subtle golden-amber secondary hairline
    pts_gold = [(random.randint(0, 300), 0), (random.randint(300, 500), 380), (random.randint(500, 768), 768)]
    draw_bezier(draw, pts_gold, (180, 150, 95), width=1)
    base = base.filter(ImageFilter.GaussianBlur(0.7))
    noise = generate_noise(768, 768, factor=6).convert("RGB")
    base = Image.blend(base, noise, 0.05)
    base.save(f"{OUTPUT_DIR}/portland_fume.jpg", "JPEG", quality=92)

# 3. Swan Bone (Soft Warm Ivory/Bone Marble)
def make_swan_bone():
    print("Generating swan_bone.jpg...")
    base = Image.new("RGB", (768, 768), (242, 238, 230))
    draw = ImageDraw.Draw(base)
    # Warm cream clouds
    for _ in range(16):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(120, 260)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=18)
        soft = soft.filter(ImageFilter.GaussianBlur(45))
        base = Image.composite(Image.new("RGB", (768, 768), (232, 226, 215)), base, soft)
        draw = ImageDraw.Draw(base)
    # Gentle feathery veins
    for _ in range(7):
        pts = [(random.randint(-50, 400), 0),
               (random.randint(200, 500), random.randint(200, 400)),
               (random.randint(300, 600), random.randint(400, 600)),
               (random.randint(400, 820), 768)]
        draw_bezier(draw, pts, (195, 185, 172), width=random.randint(1, 2))
    base = base.filter(ImageFilter.GaussianBlur(0.7))
    noise = generate_noise(768, 768, factor=5).convert("RGB")
    base = Image.blend(base, noise, 0.04)
    base.save(f"{OUTPUT_DIR}/swan_bone.jpg", "JPEG", quality=92)

# 4. Thor Gri (Nordic Quartzite Granite Gray)
def make_thor_gri():
    print("Generating thor_gri.jpg...")
    base = Image.new("RGB", (768, 768), (145, 149, 156))
    draw = ImageDraw.Draw(base)
    for _ in range(30):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(60, 180)
        val = random.randint(125, 165)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=22)
        soft = soft.filter(ImageFilter.GaussianBlur(30))
        base = Image.composite(Image.new("RGB", (768, 768), (val, val+2, val+4)), base, soft)
        draw = ImageDraw.Draw(base)
    # Mineral flecks
    pixels = base.load()
    for _ in range(4000):
        x, y = random.randint(0, 767), random.randint(0, 767)
        if random.random() > 0.5:
            pixels[x, y] = (random.randint(200, 240), random.randint(200, 240), random.randint(200, 245))
        else:
            pixels[x, y] = (random.randint(60, 90), random.randint(60, 90), random.randint(65, 95))
    base = base.filter(ImageFilter.GaussianBlur(0.5))
    base.save(f"{OUTPUT_DIR}/thor_gri.jpg", "JPEG", quality=92)

# 5. Trax Oxido Gri (Industrial Oxidized Slate/Corten)
def make_trax_oxido():
    print("Generating trax_oxido.jpg...")
    base = Image.new("RGB", (768, 768), (78, 80, 84))
    draw = ImageDraw.Draw(base)
    # Rust and oxide clouds
    for _ in range(25):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(80, 220)
        # Oxide warm undertone
        if random.random() > 0.6:
            c = (random.randint(110, 130), random.randint(85, 105), random.randint(70, 85))
        else:
            c = (random.randint(60, 75), random.randint(62, 78), random.randint(68, 84))
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=30)
        soft = soft.filter(ImageFilter.GaussianBlur(40))
        base = Image.composite(Image.new("RGB", (768, 768), c), base, soft)
        draw = ImageDraw.Draw(base)
    base = base.filter(ImageFilter.GaussianBlur(0.8))
    noise = generate_noise(768, 768, factor=10).convert("RGB")
    base = Image.blend(base, noise, 0.08)
    base.save(f"{OUTPUT_DIR}/trax_oxido.jpg", "JPEG", quality=92)

# 6. Sedir Akçaağaç (Scandinavian Blonde/Gray Cedar Wood)
def make_sedir_akcaagac():
    print("Generating sedir_akcaagac.jpg...")
    base = Image.new("RGB", (768, 768), (198, 190, 178))
    draw = ImageDraw.Draw(base)
    # Plank seams
    seams = [192, 384, 576]
    # Subtle wood grain lines horizontally
    for y in range(0, 768, 4):
        offset = random.randint(-8, 8)
        c_grain = (180 + offset, 172 + offset, 160 + offset)
        draw.line([(0, y), (768, y)], fill=c_grain, width=2)
    for sx in seams:
        draw.line([(sx, 0), (sx, 768)], fill=(120, 114, 105), width=2)
    # Soft wood pores
    noise = generate_noise(768, 768, factor=8).convert("RGB")
    base = Image.blend(base, noise, 0.07)
    base = base.filter(ImageFilter.GaussianBlur(0.5))
    base.save(f"{OUTPUT_DIR}/sedir_akcaagac.jpg", "JPEG", quality=92)

# 7. Sedir Gri (Weathered Gray Cedar Wood Plank)
def make_sedir_gri():
    print("Generating sedir_gri.jpg...")
    base = Image.new("RGB", (768, 768), (152, 155, 158))
    draw = ImageDraw.Draw(base)
    seams = [256, 512]
    for y in range(0, 768, 3):
        offset = random.randint(-10, 10)
        c_grain = (140 + offset, 143 + offset, 146 + offset)
        draw.line([(0, y), (768, y)], fill=c_grain, width=2)
    for sx in seams:
        draw.line([(sx, 0), (sx, 768)], fill=(90, 92, 95), width=2)
    noise = generate_noise(768, 768, factor=9).convert("RGB")
    base = Image.blend(base, noise, 0.08)
    base = base.filter(ImageFilter.GaussianBlur(0.5))
    base.save(f"{OUTPUT_DIR}/sedir_gri.jpg", "JPEG", quality=92)

# 8. Vintage Gri (Distressed Vintage Pewter Gray Stone/Tile)
def make_vintage_gri():
    print("Generating vintage_gri.jpg...")
    base = Image.new("RGB", (768, 768), (170, 172, 175))
    draw = ImageDraw.Draw(base)
    for _ in range(25):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(60, 200)
        v = random.randint(145, 190)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=25)
        soft = soft.filter(ImageFilter.GaussianBlur(35))
        base = Image.composite(Image.new("RGB", (768, 768), (v, v, v+2)), base, soft)
        draw = ImageDraw.Draw(base)
    # Vintage patina crackles
    for _ in range(8):
        pts = [(random.randint(0, 768), random.randint(0, 768)),
               (random.randint(0, 768), random.randint(0, 768)),
               (random.randint(0, 768), random.randint(0, 768))]
        draw_bezier(draw, pts, (120, 122, 126), width=1)
    base = base.filter(ImageFilter.GaussianBlur(0.7))
    noise = generate_noise(768, 768, factor=7).convert("RGB")
    base = Image.blend(base, noise, 0.06)
    base.save(f"{OUTPUT_DIR}/vintage_gri.jpg", "JPEG", quality=92)

# 9. Pulpis Koyu Gri (Grigio Pulpis Marble with Spider Calcite Veins)
def make_pulpis_gri():
    print("Generating pulpis_gri.jpg...")
    base = Image.new("RGB", (768, 768), (56, 58, 62))
    draw = ImageDraw.Draw(base)
    for _ in range(18):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(90, 240)
        v = random.randint(46, 68)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=22)
        soft = soft.filter(ImageFilter.GaussianBlur(38))
        base = Image.composite(Image.new("RGB", (768, 768), (v, v+1, v+3)), base, soft)
        draw = ImageDraw.Draw(base)
    # Calcite spider veins
    for _ in range(10):
        pts = [(random.randint(-50, 400), random.randint(-50, 300)),
               (random.randint(200, 500), random.randint(200, 500)),
               (random.randint(400, 800), random.randint(400, 800))]
        draw_bezier(draw, pts, (215, 218, 222), width=random.randint(1, 2))
    base = base.filter(ImageFilter.GaussianBlur(0.6))
    noise = generate_noise(768, 768, factor=5).convert("RGB")
    base = Image.blend(base, noise, 0.05)
    base.save(f"{OUTPUT_DIR}/pulpis_gri.jpg", "JPEG", quality=92)

# 10. Senzo Beyaz (Bright Crystalline White Marble)
def make_senzo_beyaz():
    print("Generating senzo_beyaz.jpg...")
    base = Image.new("RGB", (768, 768), (250, 250, 252))
    draw = ImageDraw.Draw(base)
    for _ in range(12):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(120, 280)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=15)
        soft = soft.filter(ImageFilter.GaussianBlur(40))
        base = Image.composite(Image.new("RGB", (768, 768), (240, 242, 245)), base, soft)
        draw = ImageDraw.Draw(base)
    # Subtle crisp silver veins
    for _ in range(6):
        pts = [(random.randint(0, 400), 0),
               (random.randint(200, 600), random.randint(250, 500)),
               (random.randint(400, 768), 768)]
        draw_bezier(draw, pts, (200, 204, 210), width=1)
    base = base.filter(ImageFilter.GaussianBlur(0.6))
    noise = generate_noise(768, 768, factor=4).convert("RGB")
    base = Image.blend(base, noise, 0.03)
    base.save(f"{OUTPUT_DIR}/senzo_beyaz.jpg", "JPEG", quality=92)

# 11. Magma Antrasit (Volcanic Basalt Anthracite)
def make_magma_antrasit():
    print("Generating magma_antrasit.jpg...")
    base = Image.new("RGB", (768, 768), (32, 34, 38))
    draw = ImageDraw.Draw(base)
    for _ in range(25):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(70, 200)
        v = random.randint(25, 42)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=25)
        soft = soft.filter(ImageFilter.GaussianBlur(30))
        base = Image.composite(Image.new("RGB", (768, 768), (v, v+1, v+3)), base, soft)
        draw = ImageDraw.Draw(base)
    noise = generate_noise(768, 768, factor=12).convert("RGB")
    base = Image.blend(base, noise, 0.09)
    base = base.filter(ImageFilter.GaussianBlur(0.5))
    base.save(f"{OUTPUT_DIR}/magma_antrasit.jpg", "JPEG", quality=92)

# 12. Keops Bej (Egyptian Warm Limestone Beige)
def make_keops_bej():
    print("Generating keops_bej.jpg...")
    base = Image.new("RGB", (768, 768), (228, 220, 204))
    draw = ImageDraw.Draw(base)
    for _ in range(20):
        cx, cy = random.randint(0, 768), random.randint(0, 768)
        r = random.randint(90, 240)
        soft = Image.new("L", (768, 768), 0)
        ImageDraw.Draw(soft).ellipse([cx-r, cy-r, cx+r, cy+r], fill=20)
        soft = soft.filter(ImageFilter.GaussianBlur(40))
        base = Image.composite(Image.new("RGB", (768, 768), (218, 208, 190)), base, soft)
        draw = ImageDraw.Draw(base)
    noise = generate_noise(768, 768, factor=7).convert("RGB")
    base = Image.blend(base, noise, 0.06)
    base = base.filter(ImageFilter.GaussianBlur(0.6))
    base.save(f"{OUTPUT_DIR}/keops_bej.jpg", "JPEG", quality=92)

def main():
    print("=== Generating Dedicated High-Resolution Kütahya Textures ===")
    make_vista_antrasit()
    make_portland_fume()
    make_swan_bone()
    make_thor_gri()
    make_trax_oxido()
    make_sedir_akcaagac()
    make_sedir_gri()
    make_vintage_gri()
    make_pulpis_gri()
    make_senzo_beyaz()
    make_magma_antrasit()
    make_keops_bej()
    print("All textures successfully generated in public/textures/!")

if __name__ == "__main__":
    main()

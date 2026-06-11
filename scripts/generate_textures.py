import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter

def create_directory():
    os.makedirs("public/textures", exist_ok=True)
    os.makedirs("public/logos", exist_ok=True)

def generate_noise(width, height, factor=15):
    """Generates simple greyscale noise as a numpy-like Pillow image."""
    img = Image.new("L", (width, height), 128)
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            val = 128 + random.randint(-factor, factor)
            pixels[x, y] = max(0, min(255, val))
    return img

def draw_bezier_curve(draw, points, color, width=2):
    """Draws a smooth curve through control points to simulate marble veins."""
    # Simple Bezier interpolation
    steps = 100
    curve_points = []
    for t_step in range(steps + 1):
        t = t_step / steps
        # Quadratic Bezier with 3 points
        if len(points) == 3:
            p0, p1, p2 = points
            x = (1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0]
            y = (1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1]
            curve_points.append((x, y))
        # Cubic Bezier with 4 points
        elif len(points) == 4:
            p0, p1, p2, p3 = points
            x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
            y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
            curve_points.append((x, y))
            
    if len(curve_points) > 1:
        draw.line(curve_points, fill=color, width=width)

def make_albatros_antrasit():
    print("Generating Albatros Antrasit (Dark Marble)...")
    # Base dark charcoal color
    img = Image.new("RGB", (512, 512), (32, 35, 40))
    draw = ImageDraw.Draw(img)
    
    # Add subtle color variations (clouds)
    for _ in range(15):
        cx = random.randint(0, 512)
        cy = random.randint(0, 512)
        r = random.randint(80, 200)
        color = (random.randint(24, 28), random.randint(26, 30), random.randint(32, 36))
        # Draw soft circles
        soft_mask = Image.new("L", (512, 512), 0)
        s_draw = ImageDraw.Draw(soft_mask)
        s_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=15)
        soft_mask = soft_mask.filter(ImageFilter.GaussianBlur(30))
        img = Image.composite(Image.new("RGB", (512, 512), color), img, soft_mask)
        draw = ImageDraw.Draw(img)

    # Draw white/light grey marble veins
    for _ in range(8):
        points = [
            (random.randint(-50, 562), random.randint(-50, 0)),
            (random.randint(100, 400), random.randint(150, 350)),
            (random.randint(100, 400), random.randint(150, 350)),
            (random.randint(-50, 562), random.randint(512, 562))
        ]
        width = random.randint(1, 3)
        color = (random.randint(200, 240), random.randint(200, 240), random.randint(200, 245))
        draw_bezier_curve(draw, points, color, width=width)
        
        # Add micro hair veins branching off
        if random.random() > 0.4:
            br_points = [
                points[1],
                (points[1][0] + random.randint(-80, 80), points[1][1] + random.randint(50, 100)),
                (points[2][0] + random.randint(-80, 80), points[2][1] + random.randint(50, 100))
            ]
            draw_bezier_curve(draw, br_points, (150, 153, 160), width=1)
            
    # Apply soft blur and noise overlay
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    noise = generate_noise(512, 512, factor=6).convert("RGB")
    img = Image.blend(img, noise, 0.05)
    img.save("public/textures/albatros_antrasit.jpg", "JPEG", quality=90)

def make_calacatta_gold():
    print("Generating Calacatta Gold (White Marble)...")
    # Base white/off-white color
    img = Image.new("RGB", (512, 512), (245, 246, 248))
    draw = ImageDraw.Draw(img)
    
    # Add subtle grey clouds for texture depth
    for _ in range(10):
        cx = random.randint(0, 512)
        cy = random.randint(0, 512)
        r = random.randint(120, 250)
        color = (232, 234, 238)
        soft_mask = Image.new("L", (512, 512), 0)
        s_draw = ImageDraw.Draw(soft_mask)
        s_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=30)
        soft_mask = soft_mask.filter(ImageFilter.GaussianBlur(40))
        img = Image.composite(Image.new("RGB", (512, 512), color), img, soft_mask)
        draw = ImageDraw.Draw(img)

    # Draw soft grey and gold veins
    for _ in range(5):
        points = [
            (random.randint(-50, 562), random.randint(-50, 0)),
            (random.randint(150, 350), random.randint(100, 250)),
            (random.randint(150, 350), random.randint(250, 400)),
            (random.randint(-50, 562), random.randint(512, 562))
        ]
        # Grey vein
        draw_bezier_curve(draw, points, (160, 165, 175), width=random.randint(2, 4))
        
        # Parallel gold vein highlights
        gold_points = [(x + random.randint(-15, 15), y + random.randint(-15, 15)) for x, y in points]
        draw_bezier_curve(draw, gold_points, (200, 160, 90), width=random.randint(1, 2))
        
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    noise = generate_noise(512, 512, factor=4).convert("RGB")
    img = Image.blend(img, noise, 0.03)
    img.save("public/textures/calacatta_gold.jpg", "JPEG", quality=90)

def make_loft_beton():
    print("Generating Loft Beton (Grey Concrete)...")
    # Base concrete grey color
    img = Image.new("RGB", (512, 512), (140, 142, 146))
    
    # Overlay noise and smudge patterns to look like plaster
    noise1 = generate_noise(512, 512, factor=25).convert("RGB")
    img = Image.blend(img, noise1, 0.3)
    
    # Draw broad trowel strokes / darker plaster marks
    draw = ImageDraw.Draw(img)
    for _ in range(8):
        cx = random.randint(0, 512)
        cy = random.randint(0, 512)
        rx = random.randint(100, 250)
        ry = random.randint(50, 120)
        color = (120 + random.randint(-15, 15), 122 + random.randint(-15, 15), 125 + random.randint(-15, 15))
        
        soft_mask = Image.new("L", (512, 512), 0)
        s_draw = ImageDraw.Draw(soft_mask)
        # Randomly rotated ellipses to look like sweeps
        s_draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=40)
        soft_mask = soft_mask.filter(ImageFilter.GaussianBlur(25))
        img = Image.composite(Image.new("RGB", (512, 512), color), img, soft_mask)

    img = img.filter(ImageFilter.GaussianBlur(0.5))
    # Final high frequency concrete grain
    noise2 = generate_noise(512, 512, factor=12).convert("RGB")
    img = Image.blend(img, noise2, 0.15)
    img.save("public/textures/loft_beton.jpg", "JPEG", quality=85)

def make_teak_ahsap():
    print("Generating Teak Ahşap (Brown Wood)...")
    # Base wood brown color
    img = Image.new("RGB", (512, 512), (139, 90, 43))
    pixels = img.load()
    
    # Generate wood grain lines (semi-parallel curves with noise)
    for y in range(512):
        # Sine wave distortion representing natural grain curve
        distortion = math.sin(y / 50.0) * 15.0 + math.cos(y / 20.0) * 5.0
        for x in range(512):
            # Evaluate base coordinate + wave
            proj_x = x + distortion
            # Wood ring frequency
            val = math.sin(proj_x / 12.0)
            
            # Interpolate wood colors
            # High frequency ring noise
            noise = random.randint(-8, 8)
            if val > 0.4:
                # Darker ring
                r = 100 + noise
                g = 65 + noise
                b = 30 + noise
            elif val < -0.6:
                # Lighter wood grain
                r = 160 + noise
                g = 110 + noise
                b = 55 + noise
            else:
                # Base wood tone
                r = 125 + noise
                g = 80 + noise
                b = 38 + noise
                
            pixels[x, y] = (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))
            
    # Apply directional blur along the grain (vertical-ish)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    
    # Draw longitudinal plank joint lines to simulate flooring boards
    draw = ImageDraw.Draw(img)
    draw.line([(128, 0), (128, 512)], fill=(65, 40, 20), width=2)
    draw.line([(256, 0), (256, 512)], fill=(65, 40, 20), width=2)
    draw.line([(384, 0), (384, 512)], fill=(65, 40, 20), width=2)
    
    img.save("public/textures/teak_ahsap.jpg", "JPEG", quality=85)

def make_vista_bej():
    print("Generating Vista Bej (Beige Limestone)...")
    # Base light beige sand/limestone tone
    img = Image.new("RGB", (512, 512), (228, 218, 200))
    
    # Soft clouds / mud spots representing travertine minerals
    for _ in range(12):
        cx = random.randint(0, 512)
        cy = random.randint(0, 512)
        rx = random.randint(80, 220)
        ry = random.randint(30, 90)
        color = (215 + random.randint(-10, 10), 205 + random.randint(-10, 10), 185 + random.randint(-10, 10))
        
        soft_mask = Image.new("L", (512, 512), 0)
        s_draw = ImageDraw.Draw(soft_mask)
        s_draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=35)
        soft_mask = soft_mask.filter(ImageFilter.GaussianBlur(35))
        img = Image.composite(Image.new("RGB", (512, 512), color), img, soft_mask)

    # Limestone grain texture noise
    noise = generate_noise(512, 512, factor=10).convert("RGB")
    img = Image.blend(img, noise, 0.12)
    img.save("public/textures/vista_bej.jpg", "JPEG", quality=85)

def make_mock_logos():
    print("Generating Brand Logo placeholders...")
    brands = [
        ("Kütahya", (180, 40, 40)),
        ("Bien", (40, 100, 160)),
        ("Ege", (40, 150, 80)),
        ("Güral", (140, 60, 150))
    ]
    for name, bg_color in brands:
        # Create a simple clean logo image
        img = Image.new("RGB", (200, 80), bg_color)
        draw = ImageDraw.Draw(img)
        # We draw a nice border
        draw.rectangle([2, 2, 197, 77], outline=(255, 255, 255), width=2)
        # Write simple brand name indicator
        # Note: we use simple line indicators or circles to represent a stylized icon since fonts vary across OS
        draw.ellipse([20, 25, 55, 60], fill=(255, 255, 255))
        draw.line([(70, 30), (170, 30)], fill=(255, 255, 255), width=3)
        draw.line([(70, 42), (150, 42)], fill=(255, 255, 255), width=3)
        draw.line([(70, 54), (130, 54)], fill=(255, 255, 255), width=3)
        
        img.save(f"public/logos/{name.lower().replace('ü', 'u')}.png")

if __name__ == "__main__":
    create_directory()
    make_albatros_antrasit()
    make_calacatta_gold()
    make_loft_beton()
    make_teak_ahsap()
    make_vista_bej()
    make_mock_logos()
    print("All procedural textures and logos generated successfully!")

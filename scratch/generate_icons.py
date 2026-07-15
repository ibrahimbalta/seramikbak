import os
from PIL import Image, ImageDraw, ImageFont

def create_sb_icon(width, height, radius, start_color, end_color):
    # 1. Create a gradient square image
    base = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for y in range(height):
        for x in range(width):
            # Linear diagonal gradient factor
            t = (x + y) / (width + height)
            r = int(start_color[0] + (end_color[0] - start_color[0]) * t)
            g = int(start_color[1] + (end_color[1] - start_color[1]) * t)
            b = int(start_color[2] + (end_color[2] - start_color[2]) * t)
            base.putpixel((x, y), (r, g, b, 255))
            
    # 2. Apply rounded corner mask
    mask = Image.new("L", (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, width - 1, height - 1], radius, fill=255)
    
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    img.paste(base, (0, 0), mask)
    
    # 3. Draw white "SB" text centered
    draw = ImageDraw.Draw(img)
    
    # Font path (standard Arial Bold on Windows)
    font_path = "C:\\Windows\\Fonts\\arialbd.ttf"
    if not os.path.exists(font_path):
        font_path = "arial.ttf"  # Fallback
        
    font_size = int(height * 0.48)
    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        font = ImageFont.load_default()
        
    # Get text size and center it
    bbox = draw.textbbox((0, 0), "SB", font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (width - text_w) // 2 - bbox[0]
    y = (height - text_h) // 2 - bbox[1]
    
    # Draw the text in white
    draw.text((x, y), "SB", fill=(255, 255, 255, 255), font=font)
    
    return img

def main():
    # Colors matching the gold gradient of SeramikBak
    start_color = (212, 175, 55)  # #d4af37
    end_color = (140, 107, 48)    # #8c6b30
    
    print("Generating SB icons...")
    
    # Create public folder if not exists
    os.makedirs("public", exist_ok=True)
    os.makedirs("src/app", exist_ok=True)
    
    # 1. Generate PWA 512x512 icon
    icon_512 = create_sb_icon(512, 512, 64, start_color, end_color)
    icon_512.save("public/icon-512.png")
    print("Saved public/icon-512.png")
    
    # 2. Generate PWA 192x192 icon
    icon_192 = create_sb_icon(192, 192, 24, start_color, end_color)
    icon_192.save("public/icon-192.png")
    print("Saved public/icon-192.png")
    
    # 3. Generate favicon (ICO format contains 16x16, 32x32, 48x48 sizes)
    # We can save sizes as a list of images to a single ICO file
    sizes = [16, 32, 48]
    ico_images = []
    for sz in sizes:
        # Smaller radius for smaller sizes
        rad = max(2, sz // 8)
        img_sz = create_sb_icon(sz, sz, rad, start_color, end_color)
        ico_images.append(img_sz)
        
    # Save as ICO in public/ and src/app/
    ico_images[0].save(
        "public/favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=ico_images[1:]
    )
    print("Saved public/favicon.ico")
    
    ico_images[0].save(
        "src/app/favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=ico_images[1:]
    )
    print("Saved src/app/favicon.ico")
    
    print("Icon generation completed successfully!")

if __name__ == "__main__":
    main()

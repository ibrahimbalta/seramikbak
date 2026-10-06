import sys
import json
import base64
import os
import urllib.request
import cv2
import numpy as np

def create_tiled_texture(tile_img, target_width, target_height, tile_w_px=140, tile_h_px=280, grout_px=2, grout_color=(200, 200, 200)):
    """
    Tek bir seramik görselini alır, derz çizgileri ekleyerek
    hedef genişlik ve yükseklikte bir seramik ızgarası üretir.
    """
    if tile_img is None:
        raise ValueError("Tile image could not be loaded")

    tile_resized = cv2.resize(tile_img, (tile_w_px, tile_h_px), interpolation=cv2.INTER_AREA)

    # Etrafına derz payı ekle
    tile_with_grout = cv2.copyMakeBorder(
        tile_resized,
        top=grout_px,
        bottom=0,
        left=grout_px,
        right=0,
        borderType=cv2.BORDER_CONSTANT,
        value=grout_color
    )

    h_step, w_step = tile_with_grout.shape[:2]
    repeat_y = (target_height // h_step) + 2
    repeat_x = (target_width // w_step) + 2

    full_pattern = np.tile(tile_with_grout, (repeat_y, repeat_x, 1))
    return full_pattern[:target_height, :target_width]

def decode_image(img_input):
    if not img_input:
        return None
    if "url=" in img_input:
        import urllib.parse
        parsed_url = urllib.parse.unquote(img_input.split("url=")[1].split("&")[0])
        return decode_image(parsed_url)
    if img_input.startswith("data:"):
        # Base64 data URI
        base64_data = img_input.split("base64,")[1]
        img_bytes = base64.b64decode(base64_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    elif img_input.startswith("http://") or img_input.startswith("https://"):
        try:
            req = urllib.request.Request(img_input, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                arr = np.asarray(bytearray(resp.read()), dtype=np.uint8)
                return cv2.imdecode(arr, cv2.IMREAD_COLOR)
        except Exception as e:
            return None
    elif os.path.exists(img_input):
        return cv2.imread(img_input)
    else:
        # Check relative to cwd or public
        pub_path = os.path.join(os.getcwd(), "public", img_input.lstrip("/"))
        if os.path.exists(pub_path):
            return cv2.imread(pub_path)
    return None

def decode_image_rgba(img_input):
    if not img_input:
        return None
    if "url=" in img_input:
        import urllib.parse
        parsed_url = urllib.parse.unquote(img_input.split("url=")[1].split("&")[0])
        return decode_image_rgba(parsed_url)
    if img_input.startswith("data:"):
        base64_data = img_input.split("base64,")[1]
        img_bytes = base64.b64decode(base64_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    elif img_input.startswith("http://") or img_input.startswith("https://"):
        try:
            req = urllib.request.Request(img_input, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                arr = np.asarray(bytearray(resp.read()), dtype=np.uint8)
                return cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)
        except Exception:
            return None
    elif os.path.exists(img_input):
        return cv2.imread(img_input, cv2.IMREAD_UNCHANGED)
    else:
        pub_path = os.path.join(os.getcwd(), "public", img_input.lstrip("/"))
        if os.path.exists(pub_path):
            return cv2.imread(pub_path, cv2.IMREAD_UNCHANGED)
    return None

def extract_foreground_rembg(room_img):
    """
    Odadaki on plan nesnelerini (insanlar, mobilyalar, musluk, tezgah)
    rembg u2netp ile kesip 4 kanalli BGRA katman uretir.
    """
    try:
        from rembg import remove, new_session
        from PIL import Image
        session = new_session('u2netp')
        pil_room = Image.fromarray(cv2.cvtColor(room_img, cv2.COLOR_BGR2RGB))
        out_fg = remove(pil_room, session=session)
        fg_rgba = np.array(out_fg)
        fg_bgra = cv2.cvtColor(fg_rgba, cv2.COLOR_RGBA2BGRA)
        return fg_bgra
    except Exception as e:
        sys.stderr.write(f"Rembg extract error: {e}\n")
        return None

def apply_tiles_to_room(
    room_img,
    tile_img,
    dst_corners,
    obstacles=None,
    foreground_img=None,
    tile_size_px=(320, 640),
    grout_color=(210, 210, 210),
    grout_size=2
):
    h_room, w_room = room_img.shape[:2]

    # 1. Convert dst_corners from percentage (0-100) to absolute pixels
    corners = np.array(dst_corners, dtype=np.float32)
    if np.max(corners) <= 100.0:
        corners[:, 0] = corners[:, 0] / 100.0 * w_room
        corners[:, 1] = corners[:, 1] / 100.0 * h_room

    # Calculate real-world physical quad dimensions
    x_min, y_min = np.min(corners, axis=0)
    x_max, y_max = np.max(corners, axis=0)
    quad_w = max(100.0, float(x_max - x_min))
    quad_h = max(100.0, float(y_max - y_min))

    # Real-world physical slab scale:
    # A 60x120 cm slab: ~2 slabs high from floor to ceiling (or ~3 slabs on floor)
    aspect = float(tile_size_px[0]) / float(tile_size_px[1])
    slab_h = int(quad_h / 2.2)
    slab_w = max(20, int(slab_h * aspect))

    repeat_x = max(2, int(quad_w / slab_w) + 1)
    repeat_y = max(2, int(quad_h / slab_h) + 1)

    tex_w = repeat_x * slab_w
    tex_h = repeat_y * slab_h

    flat_pattern = create_tiled_texture(
        tile_img,
        tex_w,
        tex_h,
        tile_w_px=slab_w,
        tile_h_px=slab_h,
        grout_px=grout_size,
        grout_color=grout_color
    )

    src_corners = np.float32([
        [0, 0],
        [tex_w, 0],
        [tex_w, tex_h],
        [0, tex_h]
    ])

    # 2. Perspektif Homografi Matrisi (Warp Perspective) - Katman 2 (Orta)
    M = cv2.getPerspectiveTransform(src_corners, corners)
    warped_tiles = cv2.warpPerspective(flat_pattern, M, (w_room, h_room), flags=cv2.INTER_LINEAR)

    # 3. Alan Maskesi (Dört Köşe Poligonu)
    mask = np.zeros((h_room, w_room), dtype=np.uint8)
    cv2.fillConvexPoly(mask, corners.astype(np.int32), 255)

    # Eşyaları (küvet, ayna, lavabo) maskeden çıkar
    if obstacles and isinstance(obstacles, list):
        for obs in obstacles:
            poly = obs.get("polygon", [])
            if len(poly) >= 3:
                obs_pts = np.array(poly, dtype=np.float32)
                if np.max(obs_pts) <= 100.0:
                    obs_pts[:, 0] = obs_pts[:, 0] / 100.0 * w_room
                    obs_pts[:, 1] = obs_pts[:, 1] / 100.0 * h_room
                cv2.fillPoly(mask, [obs_pts.astype(np.int32)], 0)

    # 4. Doğal Işık & Gölge Çıkarma (Luminance Ambient Shading & Gloss)
    room_gray = cv2.cvtColor(room_img, cv2.COLOR_BGR2GRAY)
    shadow_map = cv2.GaussianBlur(room_gray, (25, 25), 0).astype(np.float32)
    
    masked_pixels = shadow_map[mask > 0]
    if len(masked_pixels) > 0:
        mean_val = np.mean(masked_pixels) + 1e-5
        lum_ratio = np.clip(shadow_map / mean_val, 0.65, 1.25)
    else:
        lum_ratio = np.ones((h_room, w_room), dtype=np.float32)

    # Soft ambient blend
    shaded_tiles = warped_tiles.astype(np.float32)
    for c in range(3):
        shaded_tiles[:, :, c] = np.clip(shaded_tiles[:, :, c] * lum_ratio, 0, 255)

    # Specular Lappato gloss (window light reflections)
    specular = np.clip((shadow_map - 180.0) / 75.0, 0, 1.0) * 0.35
    for c in range(3):
        shaded_tiles[:, :, c] = np.clip(shaded_tiles[:, :, c] + 255.0 * specular, 0, 255)

    shaded_tiles = shaded_tiles.astype(np.uint8)

    # 5. Katman 1 (En alt) + Katman 2 (Orta Seramik) Bileşimi
    mask_blurred = cv2.GaussianBlur(mask, (5, 5), 0)
    mask_3ch = cv2.merge([mask_blurred, mask_blurred, mask_blurred]) / 255.0
    result = (room_img * (1.0 - mask_3ch) + shaded_tiles * mask_3ch).astype(np.uint8)

    # 6. Katman 3 (En üst): Ön plan nesneleri (Kadın, tezgah, musluk, dolaplar şeffaf PNG)
    if foreground_img is not None:
        if foreground_img.shape[0] != h_room or foreground_img.shape[1] != w_room:
            foreground_img = cv2.resize(foreground_img, (w_room, h_room), interpolation=cv2.INTER_LINEAR)
        if len(foreground_img.shape) == 3 and foreground_img.shape[2] == 4:
            fg_alpha = (foreground_img[:, :, 3].astype(np.float32) / 255.0)[:, :, None]
            fg_bgr = foreground_img[:, :, :3]
            result = (fg_bgr * fg_alpha + result * (1.0 - fg_alpha)).astype(np.uint8)

    return result

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("OpenCV engine test mode: OK")
        return

    try:
        input_data = json.loads(sys.stdin.read())
        action = input_data.get("action", "render")

        room_raw = input_data.get("room_image")
        room_img = decode_image(room_raw)

        if room_img is None:
            print(json.dumps({"success": False, "error": "Oda görseli yüklenemedi"}))
            return

        # Sadece ön plan segmentasyonu isteniyorsa
        if action == "extract_foreground":
            fg_img = extract_foreground_rembg(room_img)
            if fg_img is None:
                print(json.dumps({"success": False, "error": "Ön plan katmanı ayrılamadı"}))
                return
            _, buffer = cv2.imencode(".png", fg_img)
            fg_b64 = "data:image/png;base64," + base64.b64encode(buffer).decode("utf-8")
            print(json.dumps({"success": True, "foreground_image": fg_b64}))
            return

        # Tam 3 Katmanlı Giydirme Renderı
        tile_raw = input_data.get("tile_image")
        tile_img = decode_image(tile_raw)
        if tile_img is None:
            tile_img = cv2.imread(os.path.join(os.getcwd(), "public", "textures", "calacatta_gold.jpg"))

        dst_corners = input_data.get("dst_corners") # [[x, y], [x, y], [x, y], [x, y]]
        obstacles = input_data.get("obstacles", [])
        foreground_raw = input_data.get("foreground_image")
        foreground_img = decode_image_rgba(foreground_raw) if foreground_raw else None

        # Eğer kullanıcı özel resim yüklediyse ve ön plan verilmediyse, rembg ile otomatik ayıkla
        if foreground_img is None and input_data.get("auto_segment", False):
            foreground_img = extract_foreground_rembg(room_img)

        tile_w = int(input_data.get("tile_w_px", 140))
        tile_h = int(input_data.get("tile_h_px", 280))
        grout_size = int(input_data.get("grout_size", 2))
        grout_color = tuple(input_data.get("grout_color", [200, 200, 200]))

        result = apply_tiles_to_room(
            room_img=room_img,
            tile_img=tile_img,
            dst_corners=dst_corners,
            obstacles=obstacles,
            foreground_img=foreground_img,
            tile_size_px=(tile_w, tile_h),
            grout_color=grout_color,
            grout_size=grout_size
        )

        # Encode result to JPEG base64
        _, buffer = cv2.imencode(".jpg", result, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        result_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

        print(json.dumps({
            "success": True,
            "rendered_image": result_b64
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    main()

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
    if img_input.startswith("data:"):
        # Base64 data URI
        base64_data = img_input.split("base64,")[1]
        img_bytes = base64.b64decode(base64_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    elif img_input.startswith("http://") or img_input.startswith("https://"):
        try:
            req = urllib.request.Request(img_input, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as resp:
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

def apply_tiles_to_room(
    room_img,
    tile_img,
    dst_corners,
    obstacles=None,
    tile_size_px=(140, 280),
    grout_color=(210, 210, 210),
    grout_size=2
):
    h_room, w_room = room_img.shape[:2]

    # 1. 2D Seramik Dokusunu Üret
    tex_w, tex_h = 2400, 2400
    flat_pattern = create_tiled_texture(
        tile_img,
        tex_w,
        tex_h,
        tile_w_px=tile_size_px[0],
        tile_h_px=tile_size_px[1],
        grout_px=grout_size,
        grout_color=grout_color
    )

    # Convert dst_corners from percentage (0-100) to absolute pixels if needed
    corners = np.array(dst_corners, dtype=np.float32)
    if np.max(corners) <= 100.0:
        corners[:, 0] = corners[:, 0] / 100.0 * w_room
        corners[:, 1] = corners[:, 1] / 100.0 * h_room

    src_corners = np.float32([
        [0, 0],
        [tex_w, 0],
        [tex_w, tex_h],
        [0, tex_h]
    ])

    # 2. Perspektif Homografi Matrisi (Warp Perspective)
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

    # 4. Doğal Işık & Gölge Çıkarma (Luminance Ambient Shading)
    room_gray = cv2.cvtColor(room_img, cv2.COLOR_BGR2GRAY)
    shadow_map = cv2.GaussianBlur(room_gray, (21, 21), 0).astype(np.float32)
    
    masked_pixels = shadow_map[mask > 0]
    if len(masked_pixels) > 0:
        mean_val = np.mean(masked_pixels) + 1e-5
        shadow_map = shadow_map / mean_val
        shadow_map = np.clip(shadow_map, 0.45, 1.35)
    else:
        shadow_map = np.ones((h_room, w_room), dtype=np.float32)

    # Multiply Blend
    shaded_tiles = warped_tiles.astype(np.float32)
    for c in range(3):
        shaded_tiles[:, :, c] = np.clip(shaded_tiles[:, :, c] * shadow_map, 0, 255)
    shaded_tiles = shaded_tiles.astype(np.uint8)

    # 5. Maske ile Odaya Giydirme (Alpha Blending)
    mask_blurred = cv2.GaussianBlur(mask, (3, 3), 0)
    mask_3ch = cv2.merge([mask_blurred, mask_blurred, mask_blurred]) / 255.0
    result = (room_img * (1.0 - mask_3ch) + shaded_tiles * mask_3ch).astype(np.uint8)

    return result

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("OpenCV engine test mode: OK")
        return

    try:
        input_data = json.loads(sys.stdin.read())
        room_raw = input_data.get("room_image")
        tile_raw = input_data.get("tile_image")
        dst_corners = input_data.get("dst_corners") # [[x, y], [x, y], [x, y], [x, y]]
        obstacles = input_data.get("obstacles", [])
        tile_w = int(input_data.get("tile_w_px", 140))
        tile_h = int(input_data.get("tile_h_px", 280))
        grout_size = int(input_data.get("grout_size", 2))
        grout_color = tuple(input_data.get("grout_color", [200, 200, 200]))

        room_img = decode_image(room_raw)
        tile_img = decode_image(tile_raw)

        if room_img is None or tile_img is None:
            print(json.dumps({"success": False, "error": "Görseller yüklenemedi"}))
            return

        result = apply_tiles_to_room(
            room_img=room_img,
            tile_img=tile_img,
            dst_corners=dst_corners,
            obstacles=obstacles,
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

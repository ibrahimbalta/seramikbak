"""
Perspective-aware texture mapping.

Takes a tile image and a floor mask, tiles the texture in a grid or
offset-brick pattern, estimates the floor's perspective from the mask
geometry, and warps the tiled texture to match.
"""

import numpy as np
import cv2


# ======================================================================
# Tiling
# ======================================================================

def create_tiled_texture(
    tile: np.ndarray,
    target_h: int,
    target_w: int,
    pattern: str = "grid",
    tile_scale: float = 1.0,
) -> np.ndarray:
    """Repeat *tile* to fill (target_h × target_w) in the chosen pattern.

    Args:
        tile: Single-tile BGR image.
        target_h, target_w: Desired output dimensions.
        pattern: ``'grid'`` (standard) or ``'brick'`` (offset every other row).
        tile_scale: Multiplier applied to the tile dimensions before tiling.

    Returns:
        BGR image of size (target_h, target_w, 3).
    """
    th, tw = tile.shape[:2]
    stw = max(1, int(tw * tile_scale))
    sth = max(1, int(th * tile_scale))
    interp = cv2.INTER_AREA if tile_scale < 1 else cv2.INTER_LINEAR
    scaled = cv2.resize(tile, (stw, sth), interpolation=interp)

    cols = target_w // stw + 3
    rows = target_h // sth + 3

    if pattern == "grid":
        tiled = np.tile(scaled, (rows, cols, 1))
    elif pattern == "brick":
        row_strip = np.tile(scaled, (1, cols + 1, 1))
        offset_strip = np.roll(row_strip, stw // 2, axis=1)
        strips = []
        for i in range(rows):
            strip = offset_strip if i % 2 else row_strip
            strips.append(strip[:, : target_w + stw, :])
        tiled = np.vstack(strips)
    else:
        raise ValueError(f"Unknown tiling pattern: {pattern!r}")

    return tiled[:target_h, :target_w].copy()


# ======================================================================
# Floor-perspective estimation
# ======================================================================

def estimate_floor_quad(mask: np.ndarray):
    """Derive a trapezoid from the binary floor mask via scan-line analysis.

    Examines the top and bottom bands of the mask to determine where the
    floor edges converge (perspective effect).

    Args:
        mask: uint8 binary mask (0/255), shape (H, W).

    Returns:
        ``np.ndarray`` of shape (4, 2) with corners [TL, TR, BR, BL]
        in pixel coordinates, or ``None`` if no valid floor quad found.
    """
    row_has_floor = np.any(mask > 0, axis=1)
    floor_rows = np.where(row_has_floor)[0]

    if len(floor_rows) < 10:
        return None

    top_row = int(floor_rows[0])
    bottom_row = int(floor_rows[-1])
    floor_height = bottom_row - top_row

    if floor_height < 10:
        return None

    band = max(5, int(floor_height * 0.10))

    # Top band -----------------------------------------------------------
    tb_start, tb_end = top_row, min(top_row + band, bottom_row)
    top_band = mask[tb_start : tb_end + 1, :]
    top_cols = np.where(np.any(top_band > 0, axis=0))[0]

    # Bottom band --------------------------------------------------------
    bb_start, bb_end = max(bottom_row - band, top_row), bottom_row
    bottom_band = mask[bb_start : bb_end + 1, :]
    bottom_cols = np.where(np.any(bottom_band > 0, axis=0))[0]

    if len(top_cols) < 2 or len(bottom_cols) < 2:
        return None

    tl = [float(top_cols[0]), float(top_row)]
    tr = [float(top_cols[-1]), float(top_row)]
    br = [float(bottom_cols[-1]), float(bottom_row)]
    bl = [float(bottom_cols[0]), float(bottom_row)]

    return np.array([tl, tr, br, bl], dtype=np.float32)


# ======================================================================
# Perspective warp
# ======================================================================

def warp_texture_to_floor(
    tiled: np.ndarray,
    floor_quad: np.ndarray,
    target_shape: tuple,
) -> np.ndarray:
    """Warp *tiled* so that its rectangle maps onto *floor_quad*.

    Args:
        tiled: Rectangular tiled texture.
        floor_quad: 4×2 destination corners [TL, TR, BR, BL].
        target_shape: (H, W) of the output image.

    Returns:
        Warped BGR image of size (*target_shape*, 3).
    """
    h, w = target_shape[:2]
    th, tw = tiled.shape[:2]

    src_pts = np.array(
        [[0, 0], [tw - 1, 0], [tw - 1, th - 1], [0, th - 1]],
        dtype=np.float32,
    )

    M = cv2.getPerspectiveTransform(src_pts, floor_quad)
    warped = cv2.warpPerspective(
        tiled, M, (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT,
    )
    return warped


# ======================================================================
def estimate_wall_quad(mask: np.ndarray):
    """Estimate a quad from the wall mask if it forms a clear quadrilateral."""
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    largest = max(contours, key=cv2.contourArea)
    if cv2.contourArea(largest) < mask.shape[0] * mask.shape[1] * 0.05:
        return None
    peri = cv2.arcLength(largest, True)
    approx = cv2.approxPolyDP(largest, 0.04 * peri, True)
    if len(approx) == 4:
        pts = approx.reshape(4, 2).astype(np.float32)
        s = pts.sum(axis=1)
        diff = np.diff(pts, axis=1)
        tl = pts[np.argmin(s)]
        br = pts[np.argmax(s)]
        tr = pts[np.argmin(diff)]
        bl = pts[np.argmax(diff)]
        return np.array([tl, tr, br, bl], dtype=np.float32)
    return None


# ======================================================================
# Public entry point
# ======================================================================

def map_texture(
    hall_img: np.ndarray,
    tile_img: np.ndarray,
    mask: np.ndarray,
    pattern: str = "grid",
    tile_scale: float = 1.0,
    surface: str = "floor",
) -> np.ndarray:
    """Map *tile_img* onto the floor or wall region of *hall_img*.

    1. Tile the texture to fill a large canvas.
    2. Estimate the surface perspective from *mask* if applicable.
    3. Warp or planar-tile the texture.
    4. Composite with the mask.

    Args:
        hall_img: Original hall image (BGR).
        tile_img: Single-tile image (BGR).
        mask: Binary surface mask (0/255).
        pattern: ``'grid'`` or ``'brick'``.
        tile_scale: Tile size multiplier (1.0 = auto-sized).
        surface: ``'floor'``, ``'wall'``, or ``'both'``.

    Returns:
        BGR image with the new texture in the target region and
        the original pixels everywhere else.
    """
    h, w = hall_img.shape[:2]

    # Handle combined surface: perspective on floor, planar on walls
    if surface == "both":
        floor_cutoff = int(h * 0.52)
        floor_mask = np.zeros_like(mask)
        floor_mask[floor_cutoff:, :] = mask[floor_cutoff:, :]

        wall_mask = np.zeros_like(mask)
        wall_mask[:floor_cutoff, :] = mask[:floor_cutoff, :]

        # Process floor with perspective
        floor_result = hall_img.copy()
        if np.any(floor_mask > 0):
            floor_result = map_texture(hall_img, tile_img, floor_mask, pattern, tile_scale, surface="floor")

        # Process wall with planar tiling
        if np.any(wall_mask > 0):
            return map_texture(floor_result, tile_img, wall_mask, pattern, tile_scale, surface="wall")
        return floor_result

    # Estimate perspective quad depending on surface
    target_quad = None
    if surface == "floor":
        target_quad = estimate_floor_quad(mask)
    elif surface == "wall":
        target_quad = estimate_wall_quad(mask)

    # Auto-calculate a reasonable tile_scale
    effective_scale = tile_scale
    if target_quad is not None and tile_scale == 1.0:
        bottom_width = abs(target_quad[2][0] - target_quad[3][0])
        desired_tiles = 8
        auto = bottom_width / (tile_img.shape[1] * desired_tiles)
        if 0.1 < auto < 10:
            effective_scale = auto
    elif surface == "wall" and tile_scale == 1.0:
        desired_tiles = 10
        effective_scale = max(0.1, min(5.0, h / (tile_img.shape[0] * desired_tiles)))

    if target_quad is None:
        # Planar tiling: natural for vertical walls and complex geometries
        tiled = create_tiled_texture(tile_img, h, w, pattern, effective_scale)
        mask_f = (mask.astype(np.float32) / 255.0)[:, :, None]
        return (tiled * mask_f + hall_img * (1 - mask_f)).astype(np.uint8)

    # Create an oversized tiled canvas so the warp has enough source pixels
    tiled_h = max(h * 2, h + 500)
    tiled_w = max(w * 2, w + 500)
    tiled = create_tiled_texture(tile_img, tiled_h, tiled_w, pattern, effective_scale)

    # Warp into perspective
    warped = warp_texture_to_floor(tiled, target_quad, (h, w))

    # Composite using the mask
    mask_f = (mask.astype(np.float32) / 255.0)[:, :, None]
    result = (warped * mask_f + hall_img * (1 - mask_f)).astype(np.uint8)

    return result

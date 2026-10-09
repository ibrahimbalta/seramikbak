"""
Color / lighting transfer and seamless blending.

After the tile texture has been warped onto the floor, this module
makes it look *real* by:
  1. Matching the luminance statistics (LAB) of the new texture to
     the original floor lighting.
  2. Preserving existing shadows/reflections via a shadow-map ratio.
  3. Feathering the mask edges for smooth transitions.
  4. Applying OpenCV Poisson (seamless) cloning as a final polish.
"""

import numpy as np
import cv2


# ======================================================================
# Lighting / colour transfer
# ======================================================================

def transfer_lighting(
    original: np.ndarray,
    new_texture: np.ndarray,
    mask: np.ndarray,
) -> np.ndarray:
    """Match luminance and ambient colour of *new_texture* to *original*.

    Works in CIE-LAB space. The L-channel (lightness) mean and standard
    deviation of the original floor region are transferred to the new
    texture, and the A/B channels receive a subtle shift for ambient
    colour consistency.

    Args:
        original: Original hall image (BGR).
        new_texture: Warped tile texture (BGR, same size).
        mask: Binary floor mask (0/255).

    Returns:
        Lighting-adjusted BGR image (same size).
    """
    floor = mask > 127
    if not np.any(floor):
        return new_texture

    orig_lab = cv2.cvtColor(original, cv2.COLOR_BGR2LAB).astype(np.float64)
    tex_lab = cv2.cvtColor(new_texture, cv2.COLOR_BGR2LAB).astype(np.float64)

    # --- L channel ---------------------------------------------------
    orig_L = orig_lab[:, :, 0][floor]
    tex_L = tex_lab[:, :, 0][floor]

    o_mean, o_std = orig_L.mean(), orig_L.std() + 1e-6
    t_mean, t_std = tex_L.mean(), tex_L.std() + 1e-6

    result_lab = tex_lab.copy()
    L = result_lab[:, :, 0]
    # Blend 70 % toward original stats so the tile's own character is
    # partially preserved
    L[:] = (L - t_mean) * (o_std / t_std) * 0.7 + o_mean
    np.clip(L, 0, 255, out=L)

    # --- A / B channels (subtle ambient shift) -----------------------
    for ch in (1, 2):
        o_ch = orig_lab[:, :, ch][floor]
        t_ch = tex_lab[:, :, ch][floor]
        shift = (o_ch.mean() - t_ch.mean()) * 0.3
        result_lab[:, :, ch] = np.clip(result_lab[:, :, ch] + shift, 0, 255)

    result = cv2.cvtColor(result_lab.astype(np.uint8), cv2.COLOR_LAB2BGR)

    # Only modify pixels inside the mask
    out = new_texture.copy()
    out[floor] = result[floor]
    return out


# ======================================================================
# Shadow preservation
# ======================================================================

def preserve_shadows(
    original: np.ndarray,
    new_texture: np.ndarray,
    mask: np.ndarray,
) -> np.ndarray:
    """Bake the original floor's lighting variations into *new_texture*.

    Computes a per-pixel *shadow map* = original_grey / blurred_grey and
    multiplies it onto the new texture so that existing cast shadows,
    reflections, and ambient-occlusion gradients carry over.

    Args:
        original: Original hall image (BGR).
        new_texture: Lighting-adjusted tile texture (BGR).
        mask: Binary floor mask (0/255).

    Returns:
        Shadow-adjusted BGR image.
    """
    floor = mask > 127
    if not np.any(floor):
        return new_texture

    gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY).astype(np.float64)

    # Heavy blur → local average brightness
    ksize = max(51, (min(gray.shape) // 6) | 1)
    blurred = cv2.GaussianBlur(gray, (ksize, ksize), 0)

    shadow = gray / (blurred + 1e-6)
    np.clip(shadow, 0.4, 1.8, out=shadow)
    shadow = cv2.GaussianBlur(shadow, (11, 11), 0)

    result = new_texture.astype(np.float64)
    for c in range(3):
        ch = result[:, :, c]
        ch[floor] *= shadow[floor]

    np.clip(result, 0, 255, out=result)
    return result.astype(np.uint8)


# ======================================================================
# Mask feathering
# ======================================================================

def feather_mask(mask: np.ndarray, radius: int = 5) -> np.ndarray:
    """Return a soft-edged float mask (0.0–1.0) strictly clamped within the mask.

    The outer boundary (mask == 0) is GUARANTEED to remain 0.0.
    Feathering only happens inwards to avoid bleeding into adjacent furniture or walls.
    """
    if radius <= 0:
        return (mask > 127).astype(np.float32)

    binary = (mask > 127).astype(np.uint8)
    dist = cv2.distanceTransform(binary, cv2.DIST_L2, 5)
    feathered = np.clip(dist / float(max(1, radius)), 0.0, 1.0)
    feathered[mask == 0] = 0.0
    return feathered


# ======================================================================
# Full blend pipeline
# ======================================================================

def blend(
    hall_img: np.ndarray,
    textured_floor: np.ndarray,
    mask: np.ndarray,
) -> np.ndarray:
    """Seamlessly composite *textured_floor* onto *hall_img*.

    Pipeline:
      1. ``transfer_lighting``  — luminance / colour matching.
      2. ``preserve_shadows``   — bake original shadows.
      3. Poisson cloning (``MIXED_CLONE``) for gradient-domain smoothing.
      4. Inward-feathered alpha compositing for clean edges without bleeding.
      5. Strict mask clamping: pixels outside *mask* remain 100% original.
    """
    binary_mask = (mask > 127).astype(np.uint8) * 255
    if not np.any(binary_mask):
        return hall_img.copy()

    # ---- Steps 1 & 2 ------------------------------------------------
    lit = transfer_lighting(hall_img, textured_floor, binary_mask)
    shadowed = preserve_shadows(hall_img, lit, binary_mask)

    # ---- Step 3: Poisson / seamless cloning --------------------------
    feathered = feather_mask(binary_mask, radius=4)
    mask3 = np.stack([feathered] * 3, axis=-1)

    result = None
    try:
        pts = np.where(binary_mask > 0)
        if len(pts[0]) > 100:
            cy = int(np.mean(pts[0]))
            cx = int(np.mean(pts[1]))

            # Erode slightly so seamlessClone doesn't pull background colors
            erode_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            clone_mask = cv2.erode(binary_mask, erode_k)

            cloned = cv2.seamlessClone(
                shadowed, hall_img, clone_mask, (cx, cy), cv2.MIXED_CLONE
            )

            # Mix: 55 % Poisson + 45 % direct (keeps texture sharpness)
            floor_blend = (
                cloned.astype(np.float64) * 0.55
                + shadowed.astype(np.float64) * 0.45
            )
            np.clip(floor_blend, 0, 255, out=floor_blend)

            blended = (
                floor_blend * mask3
                + hall_img.astype(np.float64) * (1.0 - mask3)
            )
            result = np.clip(blended, 0, 255).astype(np.uint8)
    except cv2.error:
        pass  # fall through to alpha compositing

    if result is None:
        # ---- Fallback: feathered alpha blend -----------------------------
        blended = (
            shadowed.astype(np.float64) * mask3
            + hall_img.astype(np.float64) * (1.0 - mask3)
        )
        result = np.clip(blended, 0, 255).astype(np.uint8)

    # ABSOLUTE SAFETY CLAMP: 100% original pixels outside the binary mask
    # sonuc = orijinal * (1 - maske) + seramik_uygulanmis * maske
    final = np.where(binary_mask[:, :, None] > 0, result, hall_img)
    return final

"""
Pipeline orchestrator.

Ties together segmentation, texture mapping, and blending into a
simple two-method interface consumed by the FastAPI server:
  • ``segment(hall_img)``      → binary mask
  • ``apply_tile(...)``        → final composite image
"""

import numpy as np
import cv2

from segmentation import FloorSegmentor
from texture_mapping import map_texture
from blending import blend
from utils import resize_for_processing


class FloorTilePipeline:
    """End-to-end floor tile replacement pipeline."""

    def __init__(self):
        self.segmentor = FloorSegmentor()

    # ------------------------------------------------------------------
    # Step 1: Segmentation
    # ------------------------------------------------------------------

    def segment(self, hall_img: np.ndarray, surface: str = "floor") -> np.ndarray:
        """Detect the selected surface ('floor', 'wall', or 'both') and return a binary mask (0/255).

        The image is resized to ≤ 1024 px for faster inference, then the
        mask is scaled back to the original resolution.
        """
        processed, scale = resize_for_processing(hall_img, max_size=1024)
        mask = self.segmentor.segment_surface(processed, surface=surface)

        if scale != 1.0:
            h, w = hall_img.shape[:2]
            mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)

        return mask

    # ------------------------------------------------------------------
    # Step 2: Tile application
    # ------------------------------------------------------------------

    def apply_tile(
        self,
        hall_img: np.ndarray,
        tile_img: np.ndarray,
        mask: np.ndarray,
        pattern: str = "grid",
        tile_scale: float = 1.0,
        surface: str = "floor",
    ) -> np.ndarray:
        """Replace the floor/wall with the tile texture and blend.

        Args:
            hall_img: Original hall image (BGR).
            tile_img: Single-tile image (BGR).
            mask: Binary surface mask (0/255), possibly user-refined.
            pattern: ``'grid'`` or ``'brick'``.
            tile_scale: Tile size multiplier.
            surface: ``'floor'``, ``'wall'``, or ``'both'``.

        Returns:
            Final composited BGR image.
        """
        h, w = hall_img.shape[:2]

        # Ensure mask dimensions match
        if mask.shape[:2] != (h, w):
            mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)

        # Binarise
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

        # Texture mapping (with perspective / surface adaptation)
        textured = map_texture(hall_img, tile_img, mask, pattern, tile_scale, surface=surface)

        # Seamless blending
        result = blend(hall_img, textured, mask)

        return result

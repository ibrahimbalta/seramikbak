"""
Floor segmentation using SegFormer (ADE20K).

Detects floor regions in interior/hall images using the NVIDIA SegFormer-B3
model fine-tuned on ADE20K (150 classes). Extracts the "floor" class and
applies morphological cleanup to produce a clean binary mask.
"""

import numpy as np
import cv2
import torch
from PIL import Image
from transformers import AutoImageProcessor, SegformerForSemanticSegmentation


class FloorSegmentor:
    """Semantic segmentation–based floor detector.

    Uses ``nvidia/segformer-b3-finetuned-ade-512-512`` by default.
    ADE20K class index **3** (after ``reduce_labels``) corresponds to *floor*.
    """

    # ADE20K class indices (0-indexed, after label reduction)
    WALL_CLASS = 0
    FLOOR_CLASS = 3
    RUG_CLASS = 28

    # ADE20K classes that should NEVER be covered by tiles (fixtures, openings, furniture, ceiling)
    EXCLUDE_CLASSES = (
        1,   # building
        2,   # sky
        5,   # ceiling
        7,   # bed
        8,   # windowpane
        10,  # cabinet
        12,  # person
        14,  # door
        15,  # table
        19,  # chair
        22,  # painting
        23,  # sofa
        24,  # shelf
        27,  # mirror
        30,  # armchair
        31,  # seat
        33,  # desk
        35,  # wardrobe
        36,  # lamp
        37,  # bathtub
        42,  # column
        44,  # chest of drawers
        45,  # counter
        47,  # sink
        50,  # refrigerator
        58,  # screen door
        62,  # bookcase
        64,  # coffee table
        65,  # toilet
        70,  # countertop
        71,  # stove
        73,  # kitchen island
        81,  # towel
        107, # washer
        124, # microwave
        129, # dishwasher
        145, # shower
        146, # radiator
        147, # glass
    )

    def __init__(
        self,
        model_name: str = "nvidia/segformer-b3-finetuned-ade-512-512",
    ):
        print(f"[segmentation] Loading model: {model_name} ...")
        self.processor = AutoImageProcessor.from_pretrained(model_name)
        self.model = SegformerForSemanticSegmentation.from_pretrained(model_name)
        self.model.eval()

        # Always run on CPU (per user requirement)
        self.device = torch.device("cpu")
        self.model.to(self.device)
        print("[segmentation] Model loaded successfully (CPU).")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def segment_surface(
        self,
        image: np.ndarray,
        surface: str = "floor",
        include_rugs: bool = True,
    ) -> np.ndarray:
        """Return a binary mask (0/255) for the selected surface: 'floor', 'wall', or 'both'.

        Args:
            image: BGR numpy array of the hall/room image.
            surface: 'floor', 'wall', or 'both'.
            include_rugs: Also include *rug* pixels when segmenting floors.

        Returns:
            uint8 mask — 255 where target surface was detected, 0 elsewhere.
        """
        # Convert BGR → RGB PIL Image for the processor
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(rgb)

        # Pre-process
        inputs = self.processor(images=pil_image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Forward pass
        with torch.no_grad():
            logits = self.model(**inputs).logits  # (1, C, H/4, W/4)

        # Upsample to original resolution
        h, w = image.shape[:2]
        upsampled = torch.nn.functional.interpolate(
            logits,
            size=(h, w),
            mode="bilinear",
            align_corners=False,
        )

        pred = upsampled.argmax(dim=1)[0].cpu().numpy()  # (H, W)

        # Build the mask based on surface type
        target_classes = []
        if surface in ("floor", "both"):
            target_classes.append(self.FLOOR_CLASS)
            if include_rugs:
                target_classes.append(self.RUG_CLASS)
        if surface in ("wall", "both"):
            target_classes.append(self.WALL_CLASS)

        if not target_classes:
            target_classes = [self.FLOOR_CLASS]

        mask = np.zeros((h, w), dtype=np.uint8)
        for cls_idx in target_classes:
            mask[pred == cls_idx] = 255

        # Strictly exclude fixtures, obstacles, doors, windows, ceilings, appliances
        for cls_idx in self.EXCLUDE_CLASSES:
            mask[pred == cls_idx] = 0

        # Clean up
        mask = self._cleanup_mask(mask)
        return mask

    def segment_floor(
        self,
        image: np.ndarray,
        include_rugs: bool = True,
    ) -> np.ndarray:
        """Backward-compatible helper for floor segmentation."""
        return self.segment_surface(image, surface="floor", include_rugs=include_rugs)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _cleanup_mask(mask: np.ndarray) -> np.ndarray:
        """Morphological cleanup: close small grout lines without erasing fixture cutouts."""
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel_open)

        # Remove small isolated speckle noise (< 0.2% of image area)
        # Note: connectedComponents preserves all holes/fixtures (unlike cv2.drawContours FILLED)
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        if num_labels > 1:
            img_area = mask.shape[0] * mask.shape[1]
            min_area = int(img_area * 0.002)
            cleaned = np.zeros_like(mask)
            for i in range(1, num_labels):
                if stats[i, cv2.CC_STAT_AREA] >= min_area:
                    cleaned[labels == i] = 255
            mask = cleaned

        return mask

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
        """Morphological cleanup: close gaps, remove noise, keep large blobs."""
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))

        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel_open)

        # Keep only blobs larger than 1 % of the image area
        contours, _ = cv2.findContours(
            mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        if contours:
            img_area = mask.shape[0] * mask.shape[1]
            big = [c for c in contours if cv2.contourArea(c) > img_area * 0.01]
            if big:
                mask = np.zeros_like(mask)
                cv2.drawContours(mask, big, -1, 255, cv2.FILLED)

        return mask

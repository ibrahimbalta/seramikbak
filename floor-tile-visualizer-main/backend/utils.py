"""
Utility functions for image I/O, encoding, and preprocessing.
"""

import cv2
import numpy as np
import base64


def load_image_from_bytes(file_bytes: bytes) -> np.ndarray:
    """Load an image from raw bytes into a BGR numpy array.

    Args:
        file_bytes: Raw image file bytes (PNG, JPG, etc.)

    Returns:
        BGR numpy array (H, W, 3)

    Raises:
        ValueError: If the image cannot be decoded.
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Please upload a valid PNG or JPG file.")
    return img


def encode_image_to_bytes(img: np.ndarray, fmt: str = ".png") -> bytes:
    """Encode a BGR numpy array to image bytes.

    Args:
        img: BGR numpy array
        fmt: Image format extension (e.g. '.png', '.jpg')

    Returns:
        Encoded image bytes
    """
    success, buffer = cv2.imencode(fmt, img)
    if not success:
        raise ValueError(f"Could not encode image to {fmt}")
    return buffer.tobytes()


def encode_mask_to_base64(mask: np.ndarray) -> str:
    """Encode a binary mask (uint8, 0/255) to a base64 PNG string.

    Args:
        mask: Single-channel uint8 mask

    Returns:
        Base64-encoded PNG string
    """
    success, buffer = cv2.imencode(".png", mask)
    if not success:
        raise ValueError("Could not encode mask")
    return base64.b64encode(buffer.tobytes()).decode("utf-8")


def decode_mask_from_base64(b64_str: str) -> np.ndarray:
    """Decode a base64 PNG string to a binary mask.

    Args:
        b64_str: Base64-encoded PNG string

    Returns:
        Single-channel uint8 mask (0/255)

    Raises:
        ValueError: If the string cannot be decoded.
    """
    img_bytes = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    mask = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if mask is None:
        raise ValueError("Could not decode mask from base64")
    return mask


def resize_for_processing(img: np.ndarray, max_size: int = 1024) -> tuple:
    """Resize an image so its longest side is at most *max_size* pixels.

    Args:
        img: Input image (any number of channels).
        max_size: Maximum allowed dimension.

    Returns:
        (resized_image, scale_factor) — scale_factor < 1 means it was shrunk.
    """
    h, w = img.shape[:2]
    if max(h, w) <= max_size:
        return img, 1.0

    scale = max_size / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, scale

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR.parent / "assets"
ROOMS_DIR = ASSETS_DIR / "rooms"
TEXTURES_DIR = ASSETS_DIR / "textures"
PANORAMA_DIR = ASSETS_DIR / "panorama"

# Ensure asset directories exist
ROOMS_DIR.mkdir(parents=True, exist_ok=True)
TEXTURES_DIR.mkdir(parents=True, exist_ok=True)
PANORAMA_DIR.mkdir(parents=True, exist_ok=True)

# SAM model config
SAM_MODEL_TYPE = "facebook/sam2.1-hiera-tiny"

# Upload limits
MAX_IMAGE_DIMENSION = 2048
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

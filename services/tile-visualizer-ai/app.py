"""
FastAPI server for the Floor Tile Visualizer.

Endpoints
---------
GET  /api/health     Health check.
POST /api/segment    Upload a hall image → receive the floor mask (base64 PNG).
POST /api/apply      Upload hall + tile + mask + options → receive the result PNG.

The frontend is served as static files from ``../frontend/``.
"""

import os
import sys

# Configure UTF-8 encoding for stdout/stderr if possible
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Set HF_HOME cache directory to D: drive if available to prevent filling up C:
if os.path.exists(r"D:\floor_tile_env\hf_cache"):
    os.environ.setdefault("HF_HOME", r"D:\floor_tile_env\hf_cache")

from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from pipeline import FloorTilePipeline
from utils import (
    load_image_from_bytes,
    encode_image_to_bytes,
    encode_mask_to_base64,
    decode_mask_from_base64,
)

# ======================================================================
# Application setup
# ======================================================================

pipeline: FloorTilePipeline | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    print("=" * 60)
    print("  Floor Tile Visualizer - starting up...")
    print("  Loading SegFormer model (first run downloads ~47 MB)...")
    print("=" * 60)
    pipeline = FloorTilePipeline()
    print("=" * 60)
    print("  [OK] Pipeline ready. Open http://localhost:8000")
    print("=" * 60)
    yield
    print("Shutting down.")


app = FastAPI(title="Floor Tile Visualizer", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD = 10 * 1024 * 1024  # 10 MB


# ======================================================================
# API endpoints
# ======================================================================


@app.get("/api/health")
async def health():
    return {"status": "ok", "model_loaded": pipeline is not None}


@app.post("/api/segment")
async def segment_floor(
    hall_image: UploadFile = File(...),
    surface: str = Form("floor"),
):
    """Segment the floor, wall, or both from a hall image.

    Returns JSON ``{"mask": "<base64 PNG>", "width": int, "height": int}``.
    """
    if pipeline is None:
        raise HTTPException(503, "Pipeline is still loading, please wait …")

    if surface not in ("floor", "wall", "both"):
        surface = "floor"

    try:
        img_bytes = await hall_image.read()
        if len(img_bytes) > MAX_UPLOAD:
            raise HTTPException(400, "Image too large (max 10 MB)")

        hall_img = load_image_from_bytes(img_bytes)
        mask = pipeline.segment(hall_img, surface=surface)

        return {
            "mask": encode_mask_to_base64(mask),
            "width": hall_img.shape[1],
            "height": hall_img.shape[0],
        }
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"Segmentation failed: {exc}")


@app.post("/api/apply")
async def apply_tile(
    hall_image: UploadFile = File(...),
    tile_image: UploadFile = File(...),
    mask: str = Form(...),
    pattern: str = Form("grid"),
    tile_scale: float = Form(1.0),
    surface: str = Form("floor"),
):
    """Apply a tile texture to the selected region (floor, wall, or both).

    Returns the result image as ``image/png``.
    """
    if pipeline is None:
        raise HTTPException(503, "Pipeline is still loading, please wait …")

    if surface not in ("floor", "wall", "both"):
        surface = "floor"

    try:
        hall_bytes = await hall_image.read()
        tile_bytes = await tile_image.read()

        if len(hall_bytes) > MAX_UPLOAD or len(tile_bytes) > MAX_UPLOAD:
            raise HTTPException(400, "Image too large (max 10 MB each)")

        hall_img = load_image_from_bytes(hall_bytes)
        tile_img = load_image_from_bytes(tile_bytes)
        floor_mask = decode_mask_from_base64(mask)

        if pattern not in ("grid", "brick"):
            raise HTTPException(400, "Pattern must be 'grid' or 'brick'")

        tile_scale = max(0.1, min(5.0, tile_scale))

        result = pipeline.apply_tile(
            hall_img, tile_img, floor_mask, pattern, tile_scale, surface=surface
        )
        return Response(
            content=encode_image_to_bytes(result),
            media_type="image/png",
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"Processing failed: {exc}")


# ======================================================================
# Serve frontend static files (must be LAST so API routes take priority)
# ======================================================================

_frontend = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
if os.path.isdir(_frontend):
    app.mount("/", StaticFiles(directory=_frontend, html=True), name="frontend")

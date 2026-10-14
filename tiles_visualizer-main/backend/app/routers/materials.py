from __future__ import annotations

from fastapi import APIRouter

from app.config import TEXTURES_DIR
from app.models.schemas import MaterialInfo, MaterialListResponse

router = APIRouter()


@router.get("", response_model=MaterialListResponse)
async def list_materials():
    materials = []
    for p in sorted(TEXTURES_DIR.iterdir()):
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            mat_id = p.stem
            # Parse name: replace underscores/hyphens with spaces, title case
            name = p.stem.replace("_", " ").replace("-", " ").title()
            materials.append(
                MaterialInfo(
                    id=mat_id,
                    name=name,
                    width_mm=300,  # default tile size
                    height_mm=300,
                    thumbnail_url=f"/static/textures/{p.name}",
                    texture_url=f"/static/textures/{p.name}",
                )
            )
    return MaterialListResponse(materials=materials)


@router.get("/{material_id}", response_model=MaterialInfo)
async def get_material(material_id: str):
    for p in TEXTURES_DIR.iterdir():
        if p.stem == material_id:
            name = p.stem.replace("_", " ").replace("-", " ").title()
            return MaterialInfo(
                id=material_id,
                name=name,
                width_mm=300,
                height_mm=300,
                thumbnail_url=f"/static/textures/{p.name}",
                texture_url=f"/static/textures/{p.name}",
            )
    from fastapi import HTTPException
    raise HTTPException(404, "Material not found")

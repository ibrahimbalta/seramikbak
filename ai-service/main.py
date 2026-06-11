import os
import io
import math
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image

app = FastAPI(title="SeramikBak AI Search Service", version="1.0")

# Enable CORS for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional: Load Hugging Face CLIP model for real semantic embeddings
CLIP_AVAILABLE = False
try:
    from transformers import CLIPProcessor, CLIPModel
    import torch
    print("Loading CLIP ViT-B/32 model...")
    model_name = "openai/clip-vit-base-patch32"
    model = CLIPModel.from_pretrained(model_name)
    processor = CLIPProcessor.from_pretrained(model_name)
    CLIP_AVAILABLE = True
    print("CLIP model loaded successfully!")
except Exception as e:
    print(f"Transformers/PyTorch not available or error loading: {e}. Using PIL feature extraction fallback.")

# In-memory product database mock for vector search
# In a full production setup, this would query PGVector or Pinecone
# Database products cache
PRODUCTS_CACHE = []

def load_db_products():
    """
    Connects to the SQLite database, reads all products, 
    and extracts feature vectors for their texture images.
    """
    global PRODUCTS_CACHE
    db_path = os.path.join("..", "prisma", "dev.db")
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}. Using fallback mock database.")
        PRODUCTS_CACHE = []
        return
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Fetch products from SQLite
        cursor.execute("SELECT id, name, code, color, style, finish, imageUrl FROM Product")
        rows = cursor.fetchall()
        
        loaded_products = []
        print(f"Extracting features for {len(rows)} products...")
        
        for row in rows:
            pid, name, code, color, style, finish, img_url = row
            
            # Resolve image path relative to public folder
            # img_url example: '/textures/calacatta_gold.jpg' -> '../public/textures/calacatta_gold.jpg'
            local_img_path = os.path.join("..", "public", img_url.lstrip("/"))
            
            vector = None
            if img_url and os.path.exists(local_img_path):
                try:
                    img = Image.open(local_img_path)
                    if CLIP_AVAILABLE:
                        vector = extract_clip_vector(img)
                    else:
                        vector = extract_fallback_vector(img)
                except Exception as img_err:
                    print(f"Error processing image {local_img_path}: {img_err}")
            
            if vector is None:
                # Provide a zeroed fallback vector matching the expected dimensions
                vector = [0.0] * (512 if CLIP_AVAILABLE else 6)
                
            loaded_products.append({
                "id": pid,
                "name": name,
                "code": code,
                "color": color,
                "style": style,
                "finish": finish,
                "vector": vector
            })
            
        conn.close()
        PRODUCTS_CACHE = loaded_products
        print(f"Successfully loaded {len(PRODUCTS_CACHE)} products from database with visual features!")
    except Exception as e:
        print(f"Failed to load products from database: {e}")
        PRODUCTS_CACHE = []

# Startup event to load products
import sqlite3
@app.on_event("startup")
def startup_event():
    load_db_products()

class SearchResult(BaseModel):
    productId: str
    productName: str
    productCode: str
    score: float

def cosine_similarity(v1, v2):
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def extract_fallback_vector(image: Image.Image) -> List[float]:
    """
    Extracts a simple color & brightness layout vector (6-dimensional) 
    using PIL to simulate visual matching without external ML runtimes.
    """
    img = image.resize((32, 32)).convert("RGB")
    pixels = np.array(img)
    
    # Calculate dominant channels
    r_mean = np.mean(pixels[:, :, 0]) / 255.0
    g_mean = np.mean(pixels[:, :, 1]) / 255.0
    b_mean = np.mean(pixels[:, :, 2]) / 255.0
    
    # Calculate brightness variance (contrast/texture representation)
    gray = img.convert("L")
    gray_pixels = np.array(gray)
    std_dev = np.std(gray_pixels) / 128.0
    
    # Analyze color warmth / temperature
    warmth = r_mean - b_mean
    
    # High-frequency content approximation (rough texture metric)
    diff = np.abs(gray_pixels[:-1, :-1] - gray_pixels[1:, 1:])
    texture_roughness = np.mean(diff) / 128.0
    
    # Return normalized 6-dim vector
    raw_vector = [r_mean, g_mean, b_mean, std_dev, warmth, texture_roughness]
    norm = math.sqrt(sum(x * x for x in raw_vector))
    if norm > 0:
        return [x / norm for x in raw_vector]
    return raw_vector

def extract_clip_vector(image: Image.Image) -> List[float]:
    """
    Extracts 512-dim features using Hugging Face CLIP model
    """
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        image_features = model.get_image_features(**inputs)
    # Convert tensor to normalized list
    vec = image_features[0].cpu().numpy().tolist()
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        return [x / norm for x in vec]
    return vec

@app.get("/")
def read_root():
    return {
        "status": "online",
        "clip_enabled": CLIP_AVAILABLE,
        "indexed_products_count": len(PRODUCTS_CACHE)
    }

@app.post("/reload")
def reload_products():
    load_db_products()
    return {"status": "success", "count": len(PRODUCTS_CACHE)}

@app.post("/search-visual", response_model=List[SearchResult])
async def search_visual(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    try:
        # If cache is empty, load it
        if not PRODUCTS_CACHE:
            load_db_products()
            
        # Read uploaded image bytes
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Extract visual vector
        if CLIP_AVAILABLE:
            query_vector = extract_clip_vector(image)
        else:
            query_vector = extract_fallback_vector(image)
            
        # Perform similarity search against SQLite-loaded products
        results = []
        for prod in PRODUCTS_CACHE:
            db_vector = prod["vector"]
            # Ensure vector dimensions match
            if len(db_vector) != len(query_vector):
                # Fallback to 6-dim matching if dimensions mismatch
                fallback_query_vector = extract_fallback_vector(image)
                score = cosine_similarity(fallback_query_vector, db_vector[:6])
            else:
                score = cosine_similarity(query_vector, db_vector)
                
            # Normalize score to [0, 1] range for presentation
            normalized_score = max(0.0, min(1.0, (score + 1.0) / 2.0))
            
            results.append(SearchResult(
                productId=prod["id"],
                productName=prod["name"],
                productCode=prod["code"],
                score=round(normalized_score * 100, 2)
            ))
            
        # Sort results by similarity score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visual search failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

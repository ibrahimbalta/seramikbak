/**
 * renovationUtils.js
 * ===================
 * Pure utility functions for the Room Renovation feature.
 * Framework-agnostic, suitable for both Node.js tests and browser runtime.
 */

/**
 * Resolves texture URLs safely. If URL is external (http/https),
 * wraps it with the local proxy to prevent HTML5 Canvas CORS tainting.
 * Local paths, data URIs and blob URLs are preserved directly.
 * @param {string} url 
 * @returns {string}
 */
export function resolveSafeTextureUrl(url) {
  if (!url) return '/textures/calacatta_gold.jpg';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Classifies a ceramic tile's architectural proportion based on width and height.
 * Helps determine layout step sizes and multi-face veining behavior.
 * @param {number} widthCm 
 * @param {number} heightCm 
 * @returns {{ ratio: number, isPlank: boolean, isSquare: boolean, isGrandSlab: boolean }}
 */
export function classifyTileProportion(widthCm, heightCm) {
  const w = Number(widthCm) || 60;
  const h = Number(heightCm) || 120;
  const ratio = w / h;
  const isPlank = ratio <= 0.35 || ratio >= 2.8;
  const isSquare = Math.abs(ratio - 1) < 0.15;
  const isGrandSlab = !isPlank && !isSquare;

  return { ratio, isPlank, isSquare, isGrandSlab };
}

/**
 * Prepares the surface structure expected by TilePerspectiveEngine based on active selection.
 * @param {'floor'|'walls'|'both'} activeSurface 
 * @param {Array<[number, number]>} floorQuad 
 * @param {Array<[number, number]>} wallQuad 
 * @returns {{ floor: object|null, walls: Array<object> }}
 */
export function buildSurfaces(activeSurface, floorQuad, wallQuad) {
  return {
    floor: (activeSurface === 'floor' || activeSurface === 'both') ? {
      polygon: floorQuad,
      exclude: []
    } : null,
    walls: (activeSurface === 'walls' || activeSurface === 'both') ? [
      {
        polygon: wallQuad,
        exclude: []
      }
    ] : []
  };
}

/**
 * Validates a user-uploaded image file for room remodeling.
 * Ensures MIME type is a valid image and size does not exceed threshold.
 * @param {File|{type: string, size: number}} file 
 * @param {number} maxBytes (Default 20MB)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUploadFile(file, maxBytes = 20 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'Dosya seçilmedi' };
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const type = (file.type || '').toLowerCase();
  
  if (!type.startsWith('image/') && !allowedTypes.includes(type)) {
    return { valid: false, error: 'Desteklenmeyen dosya türü (Sadece JPG, PNG, WebP desteklenir)' };
  }
  
  if (file.size > maxBytes) {
    return { valid: false, error: `Dosya boyutu çok büyük (Maksimum ${Math.round(maxBytes / (1024 * 1024))}MB)` };
  }

  return { valid: true };
}

/**
 * Clamps a percentage coordinate to [min, max] range.
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clampCoord(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(val) || 0)));
}

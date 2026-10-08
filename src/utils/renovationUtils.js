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

/**
 * Normalizes an array of [x, y] coordinates into standard 0-100 percentage space.
 * @param {Array<[number, number]>} poly 
 * @returns {Array<[number, number]>}
 */
export function normalizePolygon(poly) {
  if (!Array.isArray(poly) || poly.length === 0) return [];
  let maxVal = 0;
  for (const pt of poly) {
    if (Array.isArray(pt)) {
      maxVal = Math.max(maxVal, Number(pt[0]) || 0, Number(pt[1]) || 0);
    }
  }
  const scale = maxVal > 105 ? (maxVal > 2000 ? 100 : 10) : 1;
  return poly.map(([x, y]) => [
    clampCoord((Number(x) || 0) / scale),
    clampCoord((Number(y) || 0) / scale)
  ]);
}

/**
 * Computes a 3x3 Projective Homography matrix mapping the unit square [0,1]^2
 * to an arbitrary destination quadrilateral quad = [P0, P1, P2, P3].
 * P0: Top-Left, P1: Top-Right, P2: Bottom-Right, P3: Bottom-Left.
 * 
 * Exact closed-form perspective projection matrix (Paul Heckbert).
 * @param {Array<[number, number]>} quad 
 * @returns {{ a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number }|null}
 */
export function createHomographyFromUnitSquare(quad) {
  if (!quad || quad.length < 4) return null;
  const [p0, p1, p2, p3] = quad;
  const x0 = p0[0], y0 = p0[1];
  const x1 = p1[0], y1 = p1[1];
  const x2 = p2[0], y2 = p2[1];
  const x3 = p3[0], y3 = p3[1];

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;

  // Affine parallelogram case
  if (Math.abs(dx3) < 1e-7 && Math.abs(dy3) < 1e-7) {
    return {
      a: x1 - x0,
      b: x3 - x0,
      c: x0,
      d: y1 - y0,
      e: y3 - y0,
      f: y0,
      g: 0,
      h: 0
    };
  }

  const det = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(det) < 1e-10) {
    return null; // Degenerate / collinear points
  }

  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const h = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + h * x3;
  const c = x0;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + h * y3;
  const f = y0;

  return { a, b, c, d, e, f, g, h };
}

/**
 * Projects a point (u, v) in [0,1]^2 to destination space (x, y) using Homography H.
 * @param {object} H 
 * @param {number} u 
 * @param {number} v 
 * @returns {[number, number]|null}
 */
export function projectPoint(H, u, v) {
  if (!H) return null;
  const w = H.g * u + H.h * v + 1;
  if (Math.abs(w) < 1e-7) return null;
  return [
    (H.a * u + H.b * v + H.c) / w,
    (H.d * u + H.e * v + H.f) / w
  ];
}

/**
 * Calculates physical tile grid columns and rows preserving real-world scale and proportions.
 * E.g. 60x120 cm tiles in a 240x240 cm room patch produce 4 cols x 2 rows (1:2 ratio).
 * 60x60 cm produces 4 cols x 4 rows (1:1 ratio).
 * 20x120 cm produces 12 cols x 2 rows (wood plank ratio).
 * @param {number} tileWCm 
 * @param {number} tileHCm 
 * @param {boolean} isFloor 
 * @param {'vertical'|'horizontal'} orientation 
 * @returns {{ cols: number, rows: number, effectiveW: number, effectiveH: number, ratio: number }}
 */
export function calculateTileGrid(tileWCm = 60, tileHCm = 120, isFloor = true, orientation = 'vertical', quad = null) {
  let w = Number(tileWCm) || 60;
  let h = Number(tileHCm) || 120;

  if (orientation === 'horizontal') {
    [w, h] = [h, w];
  }

  // Standard room patch representation (240 cm floor width, 240 cm depth / 260 cm wall height)
  let roomWidthCm = 240;
  let roomDepthCm = isFloor ? 240 : 260;

  if (Array.isArray(quad) && quad.length >= 4) {
    const pTopW = Math.hypot(quad[1][0] - quad[0][0], quad[1][1] - quad[0][1]);
    const pBotW = Math.hypot(quad[2][0] - quad[3][0], quad[2][1] - quad[3][1]);
    const pAvgW = Math.max(pTopW, pBotW);
    const pAvgH = (Math.hypot(quad[3][0] - quad[0][0], quad[3][1] - quad[0][1]) + Math.hypot(quad[2][0] - quad[1][0], quad[2][1] - quad[1][1])) / 2;

    if (pAvgW > 5 && pAvgH > 5) {
      roomWidthCm = Math.max(80, Math.round((pAvgW / 100) * 320));
      roomDepthCm = Math.max(60, Math.round((pAvgH / 100) * (isFloor ? 380 : 280)));
    }
  }

  let cols = Math.max(1, Math.round(roomWidthCm / w));
  let rows = Math.max(1, Math.round(roomDepthCm / h));

  // Minimum sensible repeat counts when quad is not explicitly provided
  if (!quad) {
    if (cols < 3 && w < 100) cols = 4;
    if (rows < 2 && h < 100) rows = 3;
  }

  return { cols, rows, effectiveW: w, effectiveH: h, ratio: w / h };
}

/**
 * Computes container display dimensions preserving image aspect ratio with zero letterbox padding.
 * @param {number} imgW 
 * @param {number} imgH 
 * @param {number} maxW 
 * @param {number} maxH 
 * @returns {{ width: number, height: number, aspectRatio: number }}
 */
export function calculateDisplayedDimensions(imgW, imgH, maxW = 1100, maxH = 520) {
  if (!imgW || !imgH) return { width: maxW, height: maxH, aspectRatio: 16 / 9 };
  const aspect = imgW / imgH;
  let w = maxW;
  let h = Math.round(w / aspect);

  if (h > maxH) {
    h = maxH;
    w = Math.round(h * aspect);
  }

  return { width: w, height: h, aspectRatio: aspect };
}

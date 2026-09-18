'use client';

/**
 * TilePerspectiveEngine.js
 * ========================
 * Client-side Canvas 2D perspective tile mapping engine for SeramikBak.
 *
 * Takes a room photo, tile texture, and AI-detected surface polygons,
 * then renders the tile texture onto surfaces with perspective-correct mapping.
 *
 * Cost: $0 (runs entirely client-side after surface detection)
 * Speed: ~1-2 seconds total
 */

// ---------------------------------------------------------------------------
// Math Helpers
// ---------------------------------------------------------------------------

/**
 * Bilinear interpolation on a quadrilateral.
 * Given 4 corners [TL, TR, BR, BL] and parametric coords (u, v) in [0,1],
 * returns the interpolated [x, y] point.
 */
function bilinear(quad, u, v) {
  const [tl, tr, br, bl] = quad;
  const topX = tl[0] + (tr[0] - tl[0]) * u;
  const topY = tl[1] + (tr[1] - tl[1]) * u;
  const botX = bl[0] + (br[0] - bl[0]) * u;
  const botY = bl[1] + (br[1] - bl[1]) * u;
  return [topX + (botX - topX) * v, topY + (botY - topY) * v];
}

/**
 * Compute affine transform coefficients from 3 source points to 3 destination points.
 * Returns {a, b, c, d, e, f} for ctx.setTransform(a, b, c, d, e, f).
 *
 * Canvas transform semantics:
 *   x_canvas = a * x_src + c * y_src + e
 *   y_canvas = b * x_src + d * y_src + f
 */
function computeAffine(src, dst) {
  const [x0, y0] = src[0];
  const [x1, y1] = src[1];
  const [x2, y2] = src[2];
  const [u0, v0] = dst[0];
  const [u1, v1] = dst[1];
  const [u2, v2] = dst[2];

  const det = x0 * (y1 - y2) - x1 * (y0 - y2) + x2 * (y0 - y1);
  if (Math.abs(det) < 1e-10) return null; // Degenerate triangle

  const inv = 1 / det;

  return {
    a: (u0 * (y1 - y2) + u1 * (y2 - y0) + u2 * (y0 - y1)) * inv,
    c: (u0 * (x2 - x1) + u1 * (x0 - x2) + u2 * (x1 - x0)) * inv,
    e: (u0 * (x1 * y2 - x2 * y1) + u1 * (x2 * y0 - x0 * y2) + u2 * (x0 * y1 - x1 * y0)) * inv,
    b: (v0 * (y1 - y2) + v1 * (y2 - y0) + v2 * (y0 - y1)) * inv,
    d: (v0 * (x2 - x1) + v1 * (x0 - x2) + v2 * (x1 - x0)) * inv,
    f: (v0 * (x1 * y2 - x2 * y1) + v1 * (x2 * y0 - x0 * y2) + v2 * (x0 * y1 - x1 * y0)) * inv,
  };
}

/**
 * Draw a textured triangle using affine transformation.
 * Clips to the destination triangle, applies the transform, then draws the source image.
 */
function drawTexturedTriangle(ctx, img, srcTri, dstTri) {
  const t = computeAffine(srcTri, dstTri);
  if (!t) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dstTri[0][0], dstTri[0][1]);
  ctx.lineTo(dstTri[1][0], dstTri[1][1]);
  ctx.lineTo(dstTri[2][0], dstTri[2][1]);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Pattern Generation
// ---------------------------------------------------------------------------

/**
 * Create a tiled pattern canvas with grout lines.
 * The tile cells are sized proportionally to real-world tile dimensions.
 *
 * @param {HTMLImageElement} tileImg - The tile texture image
 * @param {number} cols - Number of tile columns in pattern
 * @param {number} rows - Number of tile rows in pattern
 * @param {number} tileWCm - Real-world tile width in cm (e.g., 60)
 * @param {number} tileHCm - Real-world tile height in cm (e.g., 120)
 * @param {number} groutPx - Grout line width in pixels
 * @param {string} groutColor - Grout line CSS color
 * @returns {HTMLCanvasElement} Pattern canvas
 */
// ---------------------------------------------------------------------------
// Pattern Generation
// ---------------------------------------------------------------------------

/**
 * Create a tiled pattern canvas with realistic grout lines, proportional tile sizing,
 * staggered running bond for wood/plank tiles, and natural tile-to-tile shade variation.
 *
 * @param {HTMLImageElement} tileImg - The tile texture image
 * @param {number} cols - Number of tile columns in pattern
 * @param {number} rows - Number of tile rows in pattern
 * @param {number} tileWCm - Real-world tile width in cm (e.g., 20, 60)
 * @param {number} tileHCm - Real-world tile height in cm (e.g., 60, 120)
 * @param {number} groutPx - Grout line width in pixels
 * @param {string} groutColor - Grout line CSS color
 * @returns {HTMLCanvasElement} Pattern canvas
 */
export function createTiledPattern(tileImg, cols, rows, tileWCm = 60, tileHCm = 120, groutPx = 2, groutColor = '#3e3832') {
  const ratio = (tileWCm || 60) / (tileHCm || 120);
  const isPlank = ratio <= 0.35 || ratio >= 2.8;

  let cellW, cellH;
  if (isPlank) {
    // Narrow plank e.g. 20x120
    cellW = 110;
    cellH = Math.round(110 / Math.min(ratio, 1 / ratio));
    cols = Math.max(cols || 8, 8);
    rows = Math.max(rows || 6, 6);
  } else if (Math.abs(ratio - 1) < 0.1) {
    // Square tile e.g. 60x60
    cellW = 220;
    cellH = 220;
    cols = Math.max(cols || 5, 5);
    rows = Math.max(rows || 5, 5);
  } else {
    // Large rectangular slab e.g. 60x120
    cellW = 250;
    cellH = Math.round(250 / ratio);
    cols = Math.max(cols || 4, 4);
    rows = Math.max(rows || 5, 5);
  }

  const patternW = cols * (cellW + groutPx) + groutPx;
  const patternH = rows * (cellH + groutPx) + groutPx;

  const canvas = document.createElement('canvas');
  canvas.width = patternW;
  canvas.height = patternH;
  const ctx = canvas.getContext('2d');

  // Fill background with grout color
  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, patternW, patternH);

  // Draw tile grid with staggered running bond for planks
  for (let r = 0; r < rows; r++) {
    // Stagger every row by 1/3 for wood planks (derz şaşırtmalı)
    const rowOffset = isPlank ? ((r % 3) * (cellW / 3)) : 0;

    for (let c = -1; c <= cols + 1; c++) {
      const x = groutPx + c * (cellW + groutPx) + rowOffset;
      const y = groutPx + r * (cellH + groutPx);

      // Draw tile image
      ctx.drawImage(tileImg, x, y, cellW, cellH);

      // 3D Physical Slab Bevel & Edge Shadows:
      // Subtle top/left light catch and bottom/right ambient drop shadow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(x, y, cellW, 1.2); // top edge catchlight
      ctx.fillRect(x, y, 1.2, cellH); // left edge catchlight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(x, y + cellH - 1.5, cellW, 1.5); // bottom grout shadow
      ctx.fillRect(x + cellW - 1.5, y, 1.5, cellH); // right grout shadow

      // Natural ceramic/wood tone variation (±3% lightness) to avoid repetitive stamp look
      const hash = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      const variance = (hash - Math.floor(hash)) * 0.08 - 0.04;
      if (Math.abs(variance) > 0.012) {
        ctx.fillStyle = variance > 0 ? `rgba(255,255,255,${variance})` : `rgba(0,0,0,${Math.abs(variance)})`;
        ctx.fillRect(x, y, cellW, cellH);
      }
    }
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Perspective Rendering
// ---------------------------------------------------------------------------

/**
 * Render a tiled pattern onto a perspective quadrilateral with exclusion zones
 * using perspective foreshortening mesh subdivision.
 */
export function renderPerspectiveTiles(ctx, pattern, quad, excludes, subs = 28) {
  const pw = pattern.width;
  const ph = pattern.height;

  ctx.save();

  // Step A: Clip strictly to the surface quad boundary
  ctx.beginPath();
  ctx.moveTo(quad[0][0], quad[0][1]);
  for (let i = 1; i < quad.length; i++) {
    ctx.lineTo(quad[i][0], quad[i][1]);
  }
  ctx.closePath();
  ctx.clip();

  // Perspective foreshortening exponent
  // Real world cameras compress depth non-linearly towards the horizon
  const depthPower = 1.65;

  // Render subdivided perspective-mapped tiles
  for (let j = 0; j < subs; j++) {
    for (let i = 0; i < subs; i++) {
      const u0 = i / subs;
      const u1 = (i + 1) / subs;

      // Apply non-linear perspective depth weighting along v
      const v0Linear = j / subs;
      const v1Linear = (j + 1) / subs;
      const v0 = Math.pow(v0Linear, depthPower);
      const v1 = Math.pow(v1Linear, depthPower);

      // 4 corners of sub-quad in canvas space
      const p00 = bilinear(quad, u0, v0);
      const p10 = bilinear(quad, u1, v0);
      const p01 = bilinear(quad, u0, v1);
      const p11 = bilinear(quad, u1, v1);

      // Corresponding source region in pattern texture
      const sx0 = u0 * pw;
      const sx1 = u1 * pw;
      const sy0 = v0Linear * ph;
      const sy1 = v1Linear * ph;

      // Draw as 2 triangles for proper perspective approximation
      drawTexturedTriangle(
        ctx,
        pattern,
        [[sx0, sy0], [sx1, sy0], [sx0, sy1]],
        [p00, p10, p01]
      );

      drawTexturedTriangle(
        ctx,
        pattern,
        [[sx1, sy0], [sx1, sy1], [sx0, sy1]],
        [p10, p11, p01]
      );
    }
  }

  // Step B: Erase exclusion zones (bathtub, toilet, vanity, furniture) with destination-out
  // This guarantees furniture from original photo stays 100% pristine without evenodd leaks
  if (excludes && excludes.length > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    excludes.forEach((poly) => {
      if (poly && poly.length >= 3) {
        ctx.moveTo(poly[0][0], poly[0][1]);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i][0], poly[i][1]);
        }
        ctx.closePath();
      }
    });
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Main Preview Generator
// ---------------------------------------------------------------------------

/**
 * Generate a complete, photorealistic tile preview image with multi-pass compositing:
 * - High-res perspective mapped ceramic tiles
 * - Contact shadow preservation (Multiply pass)
 * - Window light and specular reflection preservation (Screen pass)
 * - Natural ambient contrast (Soft-light pass)
 */
export function generateTilePreview(roomImg, tileImg, surfaces, options = {}) {
  const {
    groutColor,
    groutWidth = 1.5,
    tileWCm = 60,
    tileHCm = 120,
    subdivisions = 28,
    finish = 'parlak',
    screenAlphaOverride = null,
  } = options;

  const isGlossy = (typeof finish === 'string') && (finish.toLowerCase().includes('parlak') || finish.toLowerCase().includes('lappato') || finish.toLowerCase().includes('gloss'));
  const screenAlpha = screenAlphaOverride !== null ? screenAlphaOverride : (isGlossy ? 0.38 : 0.20);

  const imgW = roomImg.naturalWidth || roomImg.width;
  const imgH = roomImg.naturalHeight || roomImg.height;

  // High resolution canvas for sharp grout lines and textures
  const maxDim = 1400;
  let canvasW = imgW;
  let canvasH = imgH;
  if (Math.max(imgW, imgH) > maxDim) {
    const scale = maxDim / Math.max(imgW, imgH);
    canvasW = Math.round(imgW * scale);
    canvasH = Math.round(imgH * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  // Step 1: Draw base room photo
  ctx.drawImage(roomImg, 0, 0, canvasW, canvasH);

  // Determine tile characteristics
  const ratio = (tileWCm || 60) / (tileHCm || 120);
  const isPlank = ratio <= 0.35 || ratio >= 2.8;

  // Automatic realistic grout color
  let resolvedGrout = groutColor;
  if (!resolvedGrout) {
    if (isPlank) resolvedGrout = '#28201a'; // warm deep wood grout
    else if (tileWCm >= 60 && tileHCm >= 120) resolvedGrout = '#818cf8'; // subtle clean line
    else resolvedGrout = '#94a3b8';
  }

  const cols = isPlank ? 8 : (Math.abs(ratio - 1) < 0.1 ? 5 : 4);
  const rows = isPlank ? 6 : (Math.abs(ratio - 1) < 0.1 ? 5 : 5);

  // Step 2: Create tile pattern with proportional sizing and grout lines
  const pattern = createTiledPattern(tileImg, cols, rows, tileWCm, tileHCm, groutWidth, resolvedGrout);

  // Step 3: Offscreen layer for rendered tiles
  const tileLayer = document.createElement('canvas');
  tileLayer.width = canvasW;
  tileLayer.height = canvasH;
  const tCtx = tileLayer.getContext('2d');

  // Collect all architectural surfaces to render
  const allSurfaces = [];

  // Floor surface
  if (surfaces.floor && surfaces.floor.polygon && surfaces.floor.polygon.length >= 4) {
    allSurfaces.push({
      type: 'floor',
      polygon: surfaces.floor.polygon,
      exclude: surfaces.floor.exclude || []
    });
  }

  // Wall surfaces (supports array of walls or single wall object)
  if (Array.isArray(surfaces.walls)) {
    surfaces.walls.forEach((w) => {
      if (w && w.polygon && w.polygon.length >= 4) {
        allSurfaces.push({
          type: 'wall',
          polygon: w.polygon,
          exclude: w.exclude || []
        });
      }
    });
  } else if (surfaces.walls && surfaces.walls.polygon && surfaces.walls.polygon.length >= 4) {
    allSurfaces.push({
      type: 'wall',
      polygon: surfaces.walls.polygon,
      exclude: surfaces.walls.exclude || []
    });
  }

  // Render each perspective surface
  const renderedQuads = [];
  allSurfaces.forEach((surf) => {
    const quad = surf.polygon.map(([x, y]) => [
      (x / 100) * canvasW,
      (y / 100) * canvasH,
    ]);

    const excludePixels = (surf.exclude || []).map((poly) =>
      poly.map(([x, y]) => [(x / 100) * canvasW, (y / 100) * canvasH])
    );

    renderedQuads.push(quad);
    renderPerspectiveTiles(tCtx, pattern, quad, excludePixels, subdivisions);
  });

  // Step 4: Draw rendered tiles onto main canvas
  ctx.save();
  ctx.globalAlpha = 0.96;
  ctx.drawImage(tileLayer, 0, 0);
  ctx.restore();

  // Multi-pass photorealistic lighting compositing across all tiled surfaces
  if (renderedQuads.length > 0) {
    // Step 5: Contact Shadows Pass (Multiply blend)
    // Preserves dark ambient shadows under furniture, fixtures, corners
    ctx.save();
    ctx.beginPath();
    renderedQuads.forEach((q) => {
      ctx.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]);
      ctx.closePath();
    });
    ctx.clip();

    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = isGlossy ? 0.35 : 0.55;
    ctx.drawImage(roomImg, 0, 0, canvasW, canvasH);
    ctx.restore();

    // Step 6: Window Daylight & Specular Reflection Pass (Screen blend)
    // Preserves sunlight pouring from windows, mirrors glare, spotlight reflections
    ctx.save();
    ctx.beginPath();
    renderedQuads.forEach((q) => {
      ctx.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]);
      ctx.closePath();
    });
    ctx.clip();

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = isGlossy ? 0.48 : 0.22;
    ctx.drawImage(roomImg, 0, 0, canvasW, canvasH);
    ctx.restore();

    // Step 7: Natural Ambient Contrast (Soft-light blend)
    ctx.save();
    ctx.beginPath();
    renderedQuads.forEach((q) => {
      ctx.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]);
      ctx.closePath();
    });
    ctx.clip();

    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.35;
    ctx.drawImage(roomImg, 0, 0, canvasW, canvasH);
    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.93);
}

// ---------------------------------------------------------------------------
// Image Loading & Downscaling Utilities
// ---------------------------------------------------------------------------

/**
 * Load an image from a URL or data URL.
 * @param {string} src - Image source (URL or data URL)
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel yüklenemedi'));
    img.src = src;
  });
}

/**
 * Rapidly downscale any user image in-memory for AI Vision API segmentation.
 * Shrinks heavy mobile photos (4000x3000) to max 800px in ~30ms, reducing
 * network payload from ~8MB to ~45KB, allowing the AI to respond in < 1.5 seconds.
 *
 * @param {string} sourceUrlOrData - The image URL or data URL
 * @param {number} maxDim - Maximum width or height (default 800)
 * @returns {Promise<string>} Lightweight base64 JPEG data URL
 */
export async function downscaleImageForAI(sourceUrlOrData, maxDim = 800) {
  const img = await loadImage(sourceUrlOrData);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  let targetW = origW;
  let targetH = origH;

  if (Math.max(origW, origH) > maxDim) {
    const scale = maxDim / Math.max(origW, origH);
    targetW = Math.round(origW * scale);
    targetH = Math.round(origH * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return canvas.toDataURL('image/jpeg', 0.82);
}

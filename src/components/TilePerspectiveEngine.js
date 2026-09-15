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
export function createTiledPattern(tileImg, cols, rows, tileWCm, tileHCm, groutPx, groutColor) {
  // Scale tile cells proportionally to real-world dimensions
  const basePx = 100;
  const ratio = tileWCm / tileHCm;
  let cellW, cellH;
  if (ratio >= 1) {
    cellH = basePx;
    cellW = Math.round(basePx * ratio);
  } else {
    cellW = basePx;
    cellH = Math.round(basePx / ratio);
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

  // Draw each tile cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = groutPx + c * (cellW + groutPx);
      const y = groutPx + r * (cellH + groutPx);
      ctx.drawImage(tileImg, x, y, cellW, cellH);
    }
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Perspective Rendering
// ---------------------------------------------------------------------------

/**
 * Render a tiled pattern onto a perspective quadrilateral with exclusion zones.
 *
 * Uses mesh subdivision: divides the quad into NxN sub-quads, then renders
 * each as 2 affine-transformed triangles for smooth perspective approximation.
 *
 * @param {CanvasRenderingContext2D} ctx - The rendering context
 * @param {HTMLCanvasElement} pattern - The tiled pattern canvas
 * @param {Array} quad - [[x,y],...] 4 corners in pixel coords (TL, TR, BR, BL)
 * @param {Array} excludes - Array of polygons (pixel coords) to exclude
 * @param {number} subs - Number of subdivisions per axis (higher = smoother)
 */
export function renderPerspectiveTiles(ctx, pattern, quad, excludes, subs) {
  const pw = pattern.width;
  const ph = pattern.height;

  ctx.save();

  // Build clip path: main quad minus exclusion zones
  ctx.beginPath();
  ctx.moveTo(quad[0][0], quad[0][1]);
  for (let i = 1; i < quad.length; i++) {
    ctx.lineTo(quad[i][0], quad[i][1]);
  }
  ctx.closePath();

  // Cut out exclusion regions (sinks, mirrors, toilets, cabinets, etc.)
  if (excludes && excludes.length > 0) {
    excludes.forEach((poly) => {
      if (poly && poly.length >= 3) {
        ctx.moveTo(poly[0][0], poly[0][1]);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i][0], poly[i][1]);
        }
        ctx.closePath();
      }
    });
  }
  ctx.clip('evenodd');

  // Render subdivided perspective-mapped tiles
  for (let j = 0; j < subs; j++) {
    for (let i = 0; i < subs; i++) {
      const u0 = i / subs;
      const u1 = (i + 1) / subs;
      const v0 = j / subs;
      const v1 = (j + 1) / subs;

      // 4 corners of sub-quad in canvas space (bilinear interpolated)
      const p00 = bilinear(quad, u0, v0);
      const p10 = bilinear(quad, u1, v0);
      const p01 = bilinear(quad, u0, v1);
      const p11 = bilinear(quad, u1, v1);

      // Corresponding source region in pattern texture
      const sx0 = u0 * pw;
      const sx1 = u1 * pw;
      const sy0 = v0 * ph;
      const sy1 = v1 * ph;

      // Draw as 2 triangles for proper perspective approximation
      // Triangle 1: top-left triangle
      drawTexturedTriangle(
        ctx,
        pattern,
        [[sx0, sy0], [sx1, sy0], [sx0, sy1]],
        [p00, p10, p01]
      );

      // Triangle 2: bottom-right triangle
      drawTexturedTriangle(
        ctx,
        pattern,
        [[sx1, sy0], [sx1, sy1], [sx0, sy1]],
        [p10, p11, p01]
      );
    }
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Main Preview Generator
// ---------------------------------------------------------------------------

/**
 * Generate a complete tile preview image.
 *
 * @param {HTMLImageElement} roomImg - The room photo
 * @param {HTMLImageElement} tileImg - The tile texture
 * @param {Object} surfaces - { floor: { polygon, exclude }, walls: { polygon, exclude } }
 * @param {Object} options - Rendering options
 * @returns {string} Data URL of the result image (JPEG)
 */
export function generateTilePreview(roomImg, tileImg, surfaces, options = {}) {
  const {
    groutColor = '#c8c8c8',
    groutWidth = 2,
    tileWCm = 60,
    tileHCm = 120,
    opacity = 0.88,
    subdivisions = 14,
  } = options;

  const imgW = roomImg.naturalWidth || roomImg.width;
  const imgH = roomImg.naturalHeight || roomImg.height;

  // Cap canvas size for performance
  const maxDim = 1200;
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

  // Step 1: Draw original room photo as base layer
  ctx.drawImage(roomImg, 0, 0, canvasW, canvasH);

  // Step 2: Create tile pattern with proportional sizing and grout lines
  const pattern = createTiledPattern(tileImg, 8, 8, tileWCm, tileHCm, groutWidth, groutColor);

  // Step 3: Render tiles on each detected surface
  const surfaceTypes = ['floor', 'walls'];
  surfaceTypes.forEach((type) => {
    const surf = surfaces[type];
    if (!surf || !surf.polygon || surf.polygon.length < 4) return;

    // Convert percentage coordinates (0-100) to pixel coordinates
    const quad = surf.polygon.map(([x, y]) => [
      (x / 100) * canvasW,
      (y / 100) * canvasH,
    ]);

    const excludePixels = (surf.exclude || []).map((poly) =>
      poly.map(([x, y]) => [(x / 100) * canvasW, (y / 100) * canvasH])
    );

    // Draw tiles with partial opacity for natural blending
    ctx.save();
    ctx.globalAlpha = opacity;
    renderPerspectiveTiles(ctx, pattern, quad, excludePixels, subdivisions);
    ctx.restore();
  });

  // Step 4: Subtle multiply blend to preserve original shadows and lighting
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.18;
  ctx.drawImage(roomImg, 0, 0, canvasW, canvasH);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

// ---------------------------------------------------------------------------
// Image Loading Utility
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

/**
 * Utility functions for pre-processing tile images and textures.
 * Automatically detects and crops solid white or near-white background padding 
 * present in supplier catalog images (e.g. Qua Granite, etc.) to ensure seamless,
 * borderless rendering in 2D cards, 3D Studio, Photo Visualizer, and AR views.
 */

export function cropWhiteBorders(sourceImageOrCanvas) {
  if (!sourceImageOrCanvas || typeof window === 'undefined') return sourceImageOrCanvas;
  if (sourceImageOrCanvas instanceof HTMLCanvasElement) return sourceImageOrCanvas;
  if (sourceImageOrCanvas._croppedCanvas) return sourceImageOrCanvas._croppedCanvas;

  try {
    const w = sourceImageOrCanvas.width || sourceImageOrCanvas.naturalWidth;
    const h = sourceImageOrCanvas.height || sourceImageOrCanvas.naturalHeight;
    if (!w || !h || w < 10 || h < 10) return sourceImageOrCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImageOrCanvas, 0, 0);

    let imgData;
    try {
      imgData = ctx.getImageData(0, 0, w, h);
    } catch (e) {
      // Tainted canvas security fallback
      return sourceImageOrCanvas;
    }

    const data = imgData.data;

    // Helper: Is pixel a solid/near-white or transparent background pixel?
    const isBgPixel = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 20) return true; // Transparent padding
      
      // Check for near-white background (R, G, B >= 238 with low color saturation)
      if (r >= 238 && g >= 238 && b >= 238 && Math.abs(r - g) < 16 && Math.abs(r - b) < 16) {
        return true;
      }
      return false;
    };

    // Fast step sampling across canvas
    const stepX = Math.max(1, Math.floor(w / 180));
    const stepY = Math.max(1, Math.floor(h / 180));

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let nonBgCount = 0;

    for (let y = 0; y < h; y += stepY) {
      for (let x = 0; x < w; x += stepX) {
        if (!isBgPixel(x, y)) {
          nonBgCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Safety fallback: if no non-background pixels found (e.g. completely solid white image), return raw image
    if (nonBgCount === 0 || minX >= maxX || minY >= maxY) {
      return sourceImageOrCanvas;
    }

    // Exact boundary refinement
    // Refine minX
    let found = false;
    for (let x = Math.max(0, minX - stepX); x <= minX; x++) {
      for (let y = minY; y <= maxY; y += 4) {
        if (!isBgPixel(x, y)) { minX = x; found = true; break; }
      }
      if (found) break;
    }

    // Refine maxX
    found = false;
    for (let x = Math.min(w - 1, maxX + stepX); x >= maxX; x--) {
      for (let y = minY; y <= maxY; y += 4) {
        if (!isBgPixel(x, y)) { maxX = x; found = true; break; }
      }
      if (found) break;
    }

    // Refine minY
    found = false;
    for (let y = Math.max(0, minY - stepY); y <= minY; y++) {
      for (let x = minX; x <= maxX; x += 4) {
        if (!isBgPixel(x, y)) { minY = y; found = true; break; }
      }
      if (found) break;
    }

    // Refine maxY
    found = false;
    for (let y = Math.min(h - 1, maxY + stepY); y >= maxY; y--) {
      for (let x = minX; x <= maxX; x += 4) {
        if (!isBgPixel(x, y)) { maxY = y; found = true; break; }
      }
      if (found) break;
    }

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Only crop if white margins occupy at least 1.5% of canvas width/height
    if (cropW < w * 0.985 || cropH < h * 0.985) {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(sourceImageOrCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
      sourceImageOrCanvas._croppedCanvas = croppedCanvas;
      return croppedCanvas;
    }

    sourceImageOrCanvas._croppedCanvas = sourceImageOrCanvas;
    return sourceImageOrCanvas;
  } catch (err) {
    console.warn('Auto crop white borders warning:', err);
    return sourceImageOrCanvas;
  }
}

/**
 * Loads an image from a URL (using proxy if external) and returns a clean, border-cropped HTMLCanvasElement or HTMLImageElement.
 */
export function loadCleanTileImage(url) {
  return new Promise((resolve) => {
    if (!url || typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const finalUrl = (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))
      ? `/api/proxy?url=${encodeURIComponent(url)}`
      : url;

    img.onload = () => {
      const cleaned = cropWhiteBorders(img);
      resolve(cleaned);
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = finalUrl;
  });
}

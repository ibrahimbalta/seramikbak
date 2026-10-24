/**
 * imageCutout.js
 * Client-side HTML5 Canvas background removal, auto-trim, and template contrast adaptation utility.
 * Zero external dependencies; operates instantly in browser via Canvas ImageData.
 */

/**
 * Loads an image from a File, Blob, dataUrl, or HTTP(s) URL.
 * @param {File|Blob|string} source 
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Görsel yüklenemedi: ' + (err?.message || 'Geçersiz kaynak')));

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('Desteklenmeyen görsel formatı.'));
    }
  });
}

/**
 * Calculates Euclidean distance between two RGB colors (0 - 441.67).
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

/**
 * Samples background color from the 4 corners of an image.
 */
function sampleCornerColor(data, width, height) {
  const corners = [
    0, // top-left
    (width - 1) * 4, // top-right
    (height - 1) * width * 4, // bottom-left
    ((height - 1) * width + (width - 1)) * 4 // bottom-right
  ];

  let sumR = 0, sumG = 0, sumB = 0;
  for (const idx of corners) {
    sumR += data[idx];
    sumG += data[idx + 1];
    sumB += data[idx + 2];
  }

  return {
    r: Math.round(sumR / 4),
    g: Math.round(sumG / 4),
    b: Math.round(sumB / 4)
  };
}

/**
 * Removes background from an image and applies smart template adaptations.
 * 
 * @param {File|Blob|string} source - Input image
 * @param {Object} options
 * @param {number} [options.threshold=40] - Distance threshold for background detection (10 - 100)
 * @param {number} [options.feather=18] - Edge antialiasing feather range (0 - 40)
 * @param {boolean} [options.floodFill=true] - If true, only edge-connected background pixels are removed (protects internal white fills)
 * @param {boolean} [options.autoCrop=true] - Trims empty transparent padding around subject
 * @param {number} [options.padding=8] - Safety margin around trimmed subject
 * @param {'transparent'|'white-contrast'|'dark-contrast'|'grayscale'} [options.colorMode='transparent'] - Color adaptation for template
 * @param {number} [options.maxWidth=1600] - Scale down large files
 * @param {number} [options.maxHeight=1200]
 * @returns {Promise<{ dataUrl: string, width: number, height: number, hasTransparency: boolean }>}
 */
export async function removeBackgroundAndOptimize(source, options = {}) {
  const {
    threshold = 40,
    feather = 18,
    floodFill = true,
    autoCrop = true,
    padding = 8,
    colorMode = 'transparent',
    maxWidth = 1600,
    maxHeight = 1200
  } = options;

  const img = await loadImageElement(source);

  // Compute scale if exceeds max dimensions
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Draw onto base canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context oluşturulamadı.');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;
  const totalPixels = targetWidth * targetHeight;

  // Detect corner background color
  const bg = sampleCornerColor(data, targetWidth, targetHeight);

  // Mask array for transparency calculation
  // 0 = completely transparent, 255 = completely opaque
  const alphaMask = new Uint8ClampedArray(totalPixels);

  if (floodFill) {
    // Edge-seeded BFS to find connected background
    const visited = new Uint8Array(totalPixels);
    const queue = [];

    // Helper: Push edge pixels
    const pushIfBg = (x, y) => {
      const idx = y * targetWidth + x;
      if (visited[idx]) return;
      visited[idx] = 1;

      const p4 = idx * 4;
      const dist = colorDistance(data[p4], data[p4 + 1], data[p4 + 2], bg.r, bg.g, bg.b);
      if (dist <= threshold + feather) {
        queue.push(idx);
      }
    };

    // Seed all 4 borders
    for (let x = 0; x < targetWidth; x++) {
      pushIfBg(x, 0);
      pushIfBg(x, targetHeight - 1);
    }
    for (let y = 0; y < targetHeight; y++) {
      pushIfBg(0, y);
      pushIfBg(targetWidth - 1, y);
    }

    // BFS queue traversal
    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % targetWidth;
      const cy = Math.floor(curr / targetWidth);

      // Check 4-neighborhood
      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < targetWidth - 1 ? curr + 1 : -1,
        cy > 0 ? curr - targetWidth : -1,
        cy < targetHeight - 1 ? curr + targetWidth : -1
      ];

      for (const next of neighbors) {
        if (next === -1 || visited[next]) continue;
        visited[next] = 1;

        const p4 = next * 4;
        const dist = colorDistance(data[p4], data[p4 + 1], data[p4 + 2], bg.r, bg.g, bg.b);
        if (dist <= threshold + feather) {
          queue.push(next);
        }
      }
    }

    // Build alpha mask from visited background pixels
    for (let i = 0; i < totalPixels; i++) {
      if (visited[i]) {
        const p4 = i * 4;
        const dist = colorDistance(data[p4], data[p4 + 1], data[p4 + 2], bg.r, bg.g, bg.b);
        if (dist <= threshold) {
          alphaMask[i] = 0;
        } else {
          // Soft antialiased edge
          const factor = (dist - threshold) / (feather || 1);
          alphaMask[i] = Math.round(Math.min(1, Math.max(0, factor)) * data[p4 + 3]);
        }
      } else {
        // Pixel is interior or non-matching: retain original alpha
        alphaMask[i] = data[i * 4 + 3];
      }
    }
  } else {
    // Global threshold (all pixels matching bg color)
    for (let i = 0; i < totalPixels; i++) {
      const p4 = i * 4;
      const dist = colorDistance(data[p4], data[p4 + 1], data[p4 + 2], bg.r, bg.g, bg.b);
      if (dist <= threshold) {
        alphaMask[i] = 0;
      } else if (dist <= threshold + feather) {
        const factor = (dist - threshold) / (feather || 1);
        alphaMask[i] = Math.round(Math.min(1, Math.max(0, factor)) * data[p4 + 3]);
      } else {
        alphaMask[i] = data[p4 + 3];
      }
    }
  }

  // Apply alpha and color mode adaptation
  let minX = targetWidth, minY = targetHeight, maxX = 0, maxY = 0;
  let hasVisiblePixels = false;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = y * targetWidth + x;
      const p4 = idx * 4;
      const a = alphaMask[idx];
      data[p4 + 3] = a;

      if (a > 15) {
        hasVisiblePixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        // Apply template color adaptation
        if (colorMode === 'white-contrast') {
          // Turn foreground to clean crisp white while preserving alpha
          data[p4] = 255;
          data[p4 + 1] = 255;
          data[p4 + 2] = 255;
        } else if (colorMode === 'dark-contrast') {
          // Turn foreground to deep architectural graphite
          data[p4] = 15;
          data[p4 + 1] = 23;
          data[p4 + 2] = 42;
        } else if (colorMode === 'grayscale') {
          const gray = Math.round(0.299 * data[p4] + 0.587 * data[p4 + 1] + 0.114 * data[p4 + 2]);
          data[p4] = gray;
          data[p4 + 1] = gray;
          data[p4 + 2] = gray;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // If no visible pixels or autoCrop is disabled, return current canvas
  if (!autoCrop || !hasVisiblePixels) {
    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: targetWidth,
      height: targetHeight,
      hasTransparency: true
    };
  }

  // Perform auto-crop with padding
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropW = Math.min(targetWidth - cropX, (maxX - minX) + padding * 2);
  const cropH = Math.min(targetHeight - cropY, (maxY - minY) + padding * 2);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = Math.max(1, cropW);
  croppedCanvas.height = Math.max(1, cropH);
  const cropCtx = croppedCanvas.getContext('2d');

  cropCtx.drawImage(
    canvas,
    cropX, cropY, cropW, cropH,
    0, 0, cropW, cropH
  );

  return {
    dataUrl: croppedCanvas.toDataURL('image/png'),
    width: cropW,
    height: cropH,
    hasTransparency: true
  };
}

/**
 * Uploads a base64 image dataUrl to the brand upload API.
 * @param {string} base64Data 
 * @param {string} filename 
 * @param {string} [folder='seramikbak/catalogs'] 
 * @returns {Promise<string>} Saved URL
 */
export async function uploadBrandImage(base64Data, filename = 'catalog_asset.png', folder = 'seramikbak/catalogs') {
  try {
    const res = await fetch('/api/brand/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        filename,
        folder
      })
    });

    const data = await res.json();
    if (res.ok && data.success && data.url) {
      return data.url;
    }
    
    // If backend returned error but gave fallback dataUrl, use it
    if (data?.url) return data.url;
    throw new Error(data?.error || 'Yükleme başarısız oldu.');
  } catch (err) {
    console.warn('[uploadBrandImage] Sunucu yüklemesi başarısız, yerel base64 kullanılıyor:', err.message);
    // Graceful fallback to client dataUrl so user is never blocked!
    return base64Data;
  }
}

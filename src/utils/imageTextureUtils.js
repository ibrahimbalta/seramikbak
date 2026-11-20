/**
 * Utility functions for pre-processing tile images, fast RAM texture caching,
 * intelligent fallback textures, and safe white-border cropping.
 */

export const GLOBAL_TEXTURE_IMAGE_CACHE = new Map();
const IN_FLIGHT_PRELOADS = new Map();
const FAILED_EXTERNAL_URLS = new Set();

/**
 * Deterministically selects a realistic high-resolution local ceramic texture
 * matching the product's style, color, and name when an external URL is broken.
 */
export function getMatchingFallbackTexture(productOrProps = {}) {
  const style = productOrProps.style || '';
  const color = productOrProps.color || '';
  const productName = productOrProps.name || productOrProps.productName || '';

  const s = String(style).toLowerCase();
  const c = String(color).toLowerCase();
  const n = String(productName).toLowerCase();

  const isDark =
    c.includes('antrasit') ||
    c.includes('siyah') ||
    c.includes('füme') ||
    c.includes('fume') ||
    c.includes('koyu') ||
    n.includes('antrasit') ||
    n.includes('siyah') ||
    n.includes('dark') ||
    n.includes('nero');
  const isBeige =
    c.includes('bej') ||
    c.includes('krem') ||
    c.includes('fildişi') ||
    c.includes('kemik') ||
    c.includes('vizon') ||
    c.includes('grej') ||
    n.includes('bej') ||
    n.includes('bone') ||
    n.includes('ivory') ||
    n.includes('crema');
  const isBrown =
    c.includes('kahve') ||
    c.includes('ahşap') ||
    c.includes('ceviz') ||
    c.includes('meşe') ||
    n.includes('walnut') ||
    n.includes('ceviz') ||
    n.includes('brown');

  let hash = 0;
  const seedStr = `${n}_${c}_${s}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  const absHash = Math.abs(hash);

  // 1. AHŞAP / WOOD
  if (
    s.includes('ahşap') ||
    s.includes('wood') ||
    n.includes('wood') ||
    n.includes('oak') ||
    n.includes('sedir') ||
    n.includes('ceviz') ||
    n.includes('parke') ||
    n.includes('meşe')
  ) {
    if (c.includes('gri') || n.includes('gri')) return '/textures/sedir_gri.jpg';
    if (c.includes('koyu') || n.includes('dark') || n.includes('teak') || c.includes('ceviz')) {
      return '/textures/teak_ahsap.jpg';
    }
    if (n.includes('çam') || n.includes('akçaağaç') || n.includes('blonde')) {
      return '/textures/sedir_akcaagac.jpg';
    }
    const woodPool = [
      '/textures/natural_oak.jpg',
      '/textures/teak_ahsap.jpg',
      '/textures/sedir_akcaagac.jpg',
      '/textures/sedir_gri.jpg'
    ];
    return woodPool[absHash % woodPool.length];
  }

  // 2. SPECIFIC NOTABLE COLLECTIONS
  if (n.includes('vista')) {
    return isDark ? '/textures/vista_antrasit.jpg' : '/textures/vista_bej.jpg';
  }
  if (n.includes('portland')) {
    return isDark ? '/textures/portland_fume.jpg' : '/textures/vintage_gri.jpg';
  }
  if (n.includes('swan')) {
    return isDark ? '/textures/albatros_antrasit.jpg' : '/textures/swan_bone.jpg';
  }
  if (n.includes('pulpis')) {
    return '/textures/pulpis_gri.jpg';
  }
  if (n.includes('trax') || n.includes('oxido') || n.includes('corten') || c.includes('kırmızı') || c.includes('oksit')) {
    return '/textures/trax_oxido.jpg';
  }
  if (n.includes('calacatta') || n.includes('carrara') || n.includes('statuario')) {
    return isDark ? '/textures/borneo_antrasit.jpg' : '/textures/calacatta_gold.jpg';
  }

  // 3. COLOR & MATERIAL POOLS
  if (isDark) {
    if (s.includes('mermer') || n.includes('marble')) return '/textures/borneo_antrasit.jpg';
    if (s.includes('beton') || n.includes('loft') || n.includes('cement')) return '/textures/loft_beton.jpg';
    const darkPool = [
      '/textures/magma_antrasit.jpg',
      '/textures/albatros_antrasit.jpg',
      '/textures/borneo_antrasit.jpg',
      '/textures/vista_antrasit.jpg',
      '/textures/loft_beton.jpg',
      '/textures/portland_fume.jpg'
    ];
    return darkPool[absHash % darkPool.length];
  }

  if (isBrown) {
    const brownPool = ['/textures/vista_bej.jpg', '/textures/teak_ahsap.jpg', '/textures/keops_bej.jpg'];
    return brownPool[absHash % brownPool.length];
  }

  if (isBeige || c.includes('sarı') || c.includes('altın') || c.includes('gold')) {
    if (s.includes('mermer')) return '/textures/swan_bone.jpg';
    const beigePool = [
      '/textures/vista_bej.jpg',
      '/textures/keops_bej.jpg',
      '/textures/swan_bone.jpg',
      '/textures/travertino_classico.jpg'
    ];
    return beigePool[absHash % beigePool.length];
  }

  if (c.includes('gri') || c.includes('grey') || c.includes('silver') || n.includes('grey') || n.includes('gri')) {
    if (s.includes('mermer')) return '/textures/pulpis_gri.jpg';
    if (s.includes('beton')) return '/textures/concrete_light_grey.jpg';
    const greyPool = [
      '/textures/thor_gri.jpg',
      '/textures/vintage_gri.jpg',
      '/textures/pulpis_gri.jpg',
      '/textures/concrete_light_grey.jpg',
      '/textures/portland_fume.jpg'
    ];
    return greyPool[absHash % greyPool.length];
  }

  if (c.includes('beyaz') || c.includes('white') || n.includes('beyaz') || n.includes('white')) {
    const whitePool = ['/textures/senzo_beyaz.jpg', '/textures/calacatta_gold.jpg', '/textures/swan_bone.jpg'];
    return whitePool[absHash % whitePool.length];
  }

  // 4. STYLE FALLBACKS
  if (s.includes('mermer') || s.includes('marble')) {
    const marblePool = [
      '/textures/calacatta_gold.jpg',
      '/textures/senzo_beyaz.jpg',
      '/textures/swan_bone.jpg',
      '/textures/pulpis_gri.jpg',
      '/textures/borneo_antrasit.jpg'
    ];
    return marblePool[absHash % marblePool.length];
  }
  if (s.includes('beton') || s.includes('concrete')) {
    const betonPool = [
      '/textures/concrete_light_grey.jpg',
      '/textures/loft_beton.jpg',
      '/textures/vintage_gri.jpg',
      '/textures/portland_fume.jpg'
    ];
    return betonPool[absHash % betonPool.length];
  }
  if (s.includes('taş') || s.includes('stone') || s.includes('traverten')) {
    const stonePool = [
      '/textures/thor_gri.jpg',
      '/textures/travertino_classico.jpg',
      '/textures/vintage_gri.jpg',
      '/textures/magma_antrasit.jpg',
      '/textures/keops_bej.jpg'
    ];
    return stonePool[absHash % stonePool.length];
  }

  const defaultPool = [
    '/textures/thor_gri.jpg',
    '/textures/calacatta_gold.jpg',
    '/textures/vista_bej.jpg',
    '/textures/senzo_beyaz.jpg',
    '/textures/concrete_light_grey.jpg',
    '/textures/pulpis_gri.jpg'
  ];
  return defaultPool[absHash % defaultPool.length];
}

/**
 * Safely crops outer white padding frames around supplier catalog images
 * WITHOUT cropping white/light-colored ceramic tiles themselves.
 * Scans only from the 4 outer edges inward and caps maximum border trim to 22%.
 */
export function cropWhiteBorders(sourceImageOrCanvas) {
  if (!sourceImageOrCanvas || typeof window === 'undefined') return sourceImageOrCanvas;
  if (sourceImageOrCanvas instanceof HTMLCanvasElement) return sourceImageOrCanvas;
  if (sourceImageOrCanvas._croppedCanvas) return sourceImageOrCanvas._croppedCanvas;

  try {
    const w = sourceImageOrCanvas.width || sourceImageOrCanvas.naturalWidth;
    const h = sourceImageOrCanvas.height || sourceImageOrCanvas.naturalHeight;
    if (!w || !h || w < 32 || h < 32) return sourceImageOrCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImageOrCanvas, 0, 0);

    let imgData;
    try {
      imgData = ctx.getImageData(0, 0, w, h);
    } catch {
      return sourceImageOrCanvas;
    }

    const data = imgData.data;

    // Strict pure-white or transparent padding pixel check (R,G,B >= 248)
    const isPaddingPixel = (x, y) => {
      const idx = (y * w + x) * 4;
      const a = data[idx + 3];
      if (a < 20) return true;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      return r >= 248 && g >= 248 && b >= 248 && Math.abs(r - g) <= 6 && Math.abs(r - b) <= 6;
    };

    const maxCropX = Math.floor(w * 0.22);
    const maxCropY = Math.floor(h * 0.22);
    const sampleStepX = Math.max(2, Math.floor(w / 64));
    const sampleStepY = Math.max(2, Math.floor(h / 64));

    const isRowPadding = (y) => {
      let pad = 0;
      let total = 0;
      for (let x = maxCropX; x < w - maxCropX; x += sampleStepX) {
        total++;
        if (isPaddingPixel(x, y)) pad++;
      }
      return total > 0 && pad / total >= 0.96;
    };

    const isColPadding = (x) => {
      let pad = 0;
      let total = 0;
      for (let y = maxCropY; y < h - maxCropY; y += sampleStepY) {
        total++;
        if (isPaddingPixel(x, y)) pad++;
      }
      return total > 0 && pad / total >= 0.96;
    };

    let minY = 0;
    while (minY < maxCropY && isRowPadding(minY)) minY++;

    let maxY = h - 1;
    while (maxY > h - 1 - maxCropY && isRowPadding(maxY)) maxY--;

    let minX = 0;
    while (minX < maxCropX && isColPadding(minX)) minX++;

    let maxX = w - 1;
    while (maxX > w - 1 - maxCropX && isColPadding(maxX)) maxX--;

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Only crop if there was a genuine outer padding frame (>= 2% margin)
    // and the remaining tile area is at least 55% of the image
    if (
      (minX > w * 0.015 || minY > h * 0.015 || maxX < w * 0.985 || maxY < h * 0.985) &&
      cropW >= w * 0.55 &&
      cropH >= h * 0.55
    ) {
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
 * Resolves the optimal texture URL to fetch for 3D WebGL rendering.
 */
export function resolveWebGLTextureUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (FAILED_EXTERNAL_URLS.has(rawUrl)) return '';
  if (rawUrl.startsWith('/')) return rawUrl;
  if (rawUrl.includes('res.cloudinary.com') && !rawUrl.includes('f_auto')) {
    return rawUrl.replace('/upload/', '/upload/f_auto,q_auto,w_512,c_limit/');
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('//')) {
    return `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  }
  return rawUrl;
}

/**
 * Preloads a single URL into GLOBAL_TEXTURE_IMAGE_CACHE and returns a Promise<HTMLImageElement | null>.
 */
export function loadTextureImageCached(url) {
  if (!url || typeof window === 'undefined') return Promise.resolve(null);

  if (GLOBAL_TEXTURE_IMAGE_CACHE.has(url)) {
    return Promise.resolve(GLOBAL_TEXTURE_IMAGE_CACHE.get(url));
  }
  if (IN_FLIGHT_PRELOADS.has(url)) {
    return IN_FLIGHT_PRELOADS.get(url);
  }

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      IN_FLIGHT_PRELOADS.delete(url);
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        GLOBAL_TEXTURE_IMAGE_CACHE.set(url, img);
        resolve(img);
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      IN_FLIGHT_PRELOADS.delete(url);
      resolve(null);
    };

    img.src = url;
  });

  IN_FLIGHT_PRELOADS.set(url, promise);
  return promise;
}

/**
 * Preloads a product's texture (and its fallback texture) into RAM cache
 * so clicking the product in 3D Studio renders in 0ms.
 */
export async function preloadProductTexture(product) {
  if (!product || typeof window === 'undefined') return null;

  const fallbackUrl = getMatchingFallbackTexture(product);
  const rawUrl = product.textureUrl || product.imageUrl || fallbackUrl;
  const resolvedUrl = resolveWebGLTextureUrl(rawUrl);

  if (resolvedUrl && GLOBAL_TEXTURE_IMAGE_CACHE.has(resolvedUrl)) {
    return GLOBAL_TEXTURE_IMAGE_CACHE.get(resolvedUrl);
  }

  // Always ensure fallback local texture is cached in parallel (only ~25-150KB from local VPS)
  const fallbackPromise = fallbackUrl ? loadTextureImageCached(fallbackUrl) : Promise.resolve(null);

  if (!resolvedUrl || resolvedUrl === fallbackUrl) {
    return fallbackPromise;
  }

  const loaded = await loadTextureImageCached(resolvedUrl);
  if (loaded) {
    return loaded;
  }

  // Remember broken external URL so we never waste time requesting it again
  if (rawUrl) FAILED_EXTERNAL_URLS.add(rawUrl);
  const fbImg = await fallbackPromise;
  if (fbImg && resolvedUrl) {
    GLOBAL_TEXTURE_IMAGE_CACHE.set(resolvedUrl, fbImg);
  }
  return fbImg;
}

/**
 * Loads an image from a URL (using proxy if external) and returns a clean, border-cropped HTMLCanvasElement or HTMLImageElement.
 */
export async function loadCleanTileImage(url, productFallbackProps = null) {
  if (!url || typeof window === 'undefined') return null;
  const resolvedUrl = resolveWebGLTextureUrl(url);
  let img = resolvedUrl ? await loadTextureImageCached(resolvedUrl) : null;
  if (!img && productFallbackProps) {
    const fbUrl = getMatchingFallbackTexture(productFallbackProps);
    img = await loadTextureImageCached(fbUrl);
  }
  return img ? cropWhiteBorders(img) : null;
}

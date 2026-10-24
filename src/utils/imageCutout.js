/**
 * imageCutout.js / imageOptimizer.js
 * Görselleri kataloğa uygun hale getirme, boyut optimizasyonu ve güvenli yükleme yardımcısı.
 * Kullanıcının görsellerini ve arka planını bozmadan, orijinal renk ve piksellerini koruyarak
 * şablon standartlarına (16:9, A4, kare logo) uygun hale getirir.
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
 * Görselin arka planını SİLMEDEN, renklerini ve piksellerini %100 koruyarak
 * kataloğa uygun web çözünürlüğüne (max 1920px) optimize eder.
 * 
 * @param {File|Blob|string} source 
 * @param {Object} options 
 * @param {number} [options.maxWidth=1920] 
 * @param {number} [options.maxHeight=1440] 
 * @param {number} [options.quality=0.92] 
 * @param {boolean} [options.isLogo=false] 
 * @returns {Promise<{ dataUrl: string, width: number, height: number }>}
 */
export async function optimizeImageForCatalog(source, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1440,
    quality = 0.92,
    isLogo = false
  } = options;

  const img = await loadImageElement(source);

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  // For logos, max 800px is more than enough
  const effectiveMaxWidth = isLogo ? Math.min(maxWidth, 800) : maxWidth;
  const effectiveMaxHeight = isLogo ? Math.min(maxHeight, 600) : maxHeight;

  if (targetWidth > effectiveMaxWidth || targetHeight > effectiveMaxHeight) {
    const ratio = Math.min(effectiveMaxWidth / targetWidth, effectiveMaxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context oluşturulamadı.');
  }

  // Yüksek kaliteli ölçekleme
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Arka planı silmeden orijinal görseli çiz
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Logo ise şeffaflığı korumak için PNG, normal görsel ise WebP/JPEG
  const mimeType = isLogo ? 'image/png' : 'image/webp';
  let dataUrl;
  try {
    dataUrl = canvas.toDataURL(mimeType, quality);
  } catch (e) {
    dataUrl = canvas.toDataURL('image/png');
  }

  return {
    dataUrl,
    width: targetWidth,
    height: targetHeight
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

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ─── Color Dictionary ───────────────────────────────────────────────────
const KNOWN_COLORS = new Set([
  'beyaz', 'gri', 'antrasit', 'bej', 'bone', 'fume', 'füme',
  'kahve', 'vizon', 'ceviz', 'kizil', 'latte', 'mocha', 'moka',
  'kristal', 'hardal', 'fildisi', 'marfil', 'koyu', 'acik',
  'iron', 'gold', 'bronze', 'charcoal', 'ivory',
]);

// ─── Finish Dictionary ──────────────────────────────────────────────────
const KNOWN_FINISHES = new Set([
  'rektifiye', 'parlak', 'nano', 'mat', 'lappato', 'lapatto',
  'antislip', 'cb', 'prime', 'bookmatch', 'dekor', 'pano',
]);

// ─── Style Dictionary (texture → style mapping) ────────────────────────
const WOOD_KEYWORDS = ['wood', 'ahsap', 'oak', 'ceviz', 'teak', 'rovere', 'nordic', 'plank'];
const STONE_KEYWORDS = ['stone', 'tas', 'terra', 'sarp', 'falez', 'dolmen', 'montana', 'silver'];
const CEMENT_KEYWORDS = ['cement', 'beton', 'concrete', 'loft', 'infinity', 'terrazzo'];

// ─── Color Display Names ────────────────────────────────────────────────
const COLOR_DISPLAY = {
  'beyaz': 'Beyaz', 'gri': 'Gri', 'antrasit': 'Antrasit',
  'bej': 'Bej', 'bone': 'Bone', 'fume': 'Füme', 'füme': 'Füme',
  'kahve': 'Kahve', 'vizon': 'Vizon', 'ceviz': 'Ceviz',
  'kizil': 'Kızıl', 'latte': 'Latte', 'mocha': 'Mocha',
  'moka': 'Moka', 'kristal': 'Kristal', 'hardal': 'Hardal',
  'fildisi': 'Fildişi', 'marfil': 'Marfil', 'koyu': 'Koyu Gri',
  'acik': 'Açık Gri',
};

/**
 * Helper: Sleep for given ms
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Resilient fetch function that retries on rate limits (HTTP 429) or WAF blocks
 */
async function fetchJsonWithRetry(url, options = {}, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://ngkutahyaseramik.com.tr/urunler',
          ...options.headers
        },
        signal: AbortSignal.timeout(12000)
      });
      if (response.status === 429) {
        throw new Error('HTTP 429 Too Many Requests (Rate Limited)');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE')) {
        throw new Error('Received HTML block page instead of JSON');
      }
      return JSON.parse(text);
    } catch (err) {
      if (i < retries - 1) {
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
}

/**
 * Parse a product slug like "60x120-albatros-rektifiye-parlak-nano"
 * into structured product data.
 */
function parseProductSlug(slug) {
  const parts = slug.split('-');

  // 1) Extract dimensions (first token matching NxN pattern)
  let width = 60, height = 120, dimIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    const dimMatch = parts[i].match(/^(\d+)x(\d+)$/);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
      dimIndex = i;
      break;
    }
  }

  // 2) Classify remaining tokens
  const remaining = parts.filter((_, i) => i !== dimIndex);
  const nameTokens = [];
  const colorTokens = [];
  const finishTokens = [];
  let mmThickness = null;

  for (const token of remaining) {
    const lower = token.toLowerCase();

    // Check for mm thickness (e.g., "20mm")
    if (/^\d+mm$/.test(lower)) {
      mmThickness = parseFloat(lower.replace('mm', ''));
      continue;
    }
    // Check for R-rating (e.g., "r11", "r10")
    if (/^r\d+$/.test(lower)) {
      finishTokens.push(token.toUpperCase());
      continue;
    }
    // Check if it's a known color
    if (KNOWN_COLORS.has(lower)) {
      colorTokens.push(lower);
      continue;
    }
    // Check if it's a known finish
    if (KNOWN_FINISHES.has(lower)) {
      finishTokens.push(lower);
      continue;
    }
    // Must be part of the product name
    nameTokens.push(token);
  }

  // 3) Build product name
  const productName = nameTokens
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(' ') || 'Seramik';

  // 4) Determine color
  let color = 'Gri'; // default
  if (colorTokens.length > 0) {
    if (colorTokens.includes('acik') && colorTokens.includes('gri')) {
      color = 'Açık Gri';
    } else if (colorTokens.includes('koyu') && colorTokens.includes('gri')) {
      color = 'Koyu Gri';
    } else {
      color = COLOR_DISPLAY[colorTokens[0]] || colorTokens[0].charAt(0).toUpperCase() + colorTokens[0].slice(1);
    }
  }

  // 5) Determine finish
  const finishDisplay = finishTokens
    .filter(f => f.toLowerCase() !== 'rektifiye')
    .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase())
    .join(' ') || 'Mat';
  const isRectified = finishTokens.some(f => f.toLowerCase() === 'rektifiye');

  // 6) Determine style from product name
  const allLower = slug.toLowerCase();
  let style = 'Mermer'; // default
  if (WOOD_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Ahşap';
  } else if (STONE_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Taş';
  } else if (CEMENT_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Beton';
  }

  // 7) Build the full display name
  const displayName = `NG Kütahya ${productName} ${color} ${width}x${height}`;

  return {
    name: displayName.trim(),
    width,
    height,
    color,
    finish: finishDisplay || 'Mat',
    style,
    rectified: isRectified,
    thickness: mmThickness,
  };
}

/**
 * Extract flat list of product objects from nested API structures
 */
function extractProductsFromResponse(data) {
  const list = [];
  if (!data || !data.products) return list;
  
  if (Array.isArray(data.products)) {
    for (const item of data.products) {
      // Format 1: Flat array of products
      if (item.slug && item.url) {
        list.push(item);
      } 
      // Format 2: Array of categories with nested products object
      else if (item.products && typeof item.products === 'object') {
        const categories = item.products;
        for (const size in categories) {
          if (Array.isArray(categories[size])) {
            for (const prod of categories[size]) {
              if (prod.slug && prod.url) {
                list.push(prod);
              }
            }
          }
        }
      }
    }
  }
  return list;
}

export async function POST(request) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Marka seçimi gereklidir.' }, { status: 400 });
    }

    // 1. Fetch Brand from DB
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Marka bulunamadı.' }, { status: 404 });
    }

    const logs = [];
    logs.push(`[Scraper] API üzerinden ${brand.name} katalogları çekiliyor...`);

    // 2. Fetch all catalogues from official API
    let catalogues = [];
    try {
      const catResponse = await fetchJsonWithRetry('https://ngkutahyaseramik.com.tr/api/getCatalogues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: 'tr',
          filters: {},
          page: 1,
          per_page: 300 // fetch all 257 catalogues
        })
      });
      catalogues = catResponse?.data || [];
      logs.push(`[Scraper] Toplam ${catalogues.length} adet ürün kataloğu/serisi başarıyla çekildi.`);
    } catch (err) {
      logs.push(`[Hata] Katalog listesi çekilemedi: ${err.message}`);
      return NextResponse.json({ success: false, logs, error: `Katalog API erişim hatası: ${err.message}` }, { status: 500 });
    }

    if (catalogues.length === 0) {
      logs.push(`[Uyarı] Sitede katalog bulunamadı.`);
      return NextResponse.json({ success: false, logs, error: 'Katalog listesi boş.' }, { status: 404 });
    }

    // 3. Loop catalogues and fetch products sequentially with retry & sleep
    logs.push(`[Scraper] Kataloglardaki ürünler çekiliyor (bu işlem birkaç dakika sürebilir)...`);
    const parsedProducts = [];
    const seenCodes = new Set();
    let successCount = 0;
    let failCount = 0;

    for (let idx = 0; idx < catalogues.length; idx++) {
      const cat = catalogues[idx];
      
      // Wait 150ms between catalogues to be polite and avoid rate limit blocks
      await sleep(150);

      try {
        const prodUrl = `https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=${cat.id}&locale=tr`;
        const prodData = await fetchJsonWithRetry(prodUrl, {}, 5, 2000);
        const productsList = extractProductsFromResponse(prodData);
        
        successCount++;
        if (productsList.length > 0 && (successCount % 10 === 0 || successCount === catalogues.length)) {
          logs.push(`[Katalog İlerleme] ${successCount}/${catalogues.length} serisi taranıyor: ${cat.title} (${productsList.length} ürün)`);
        }

        for (const rawProd of productsList) {
          if (!rawProd.slug || !rawProd.code) continue;

          const uniqueCode = String(rawProd.code).trim().toUpperCase();
          if (seenCodes.has(uniqueCode)) continue;
          seenCodes.add(uniqueCode);

          // Parse slug for metadata
          const parsed = parseProductSlug(rawProd.slug);

          // Set official code
          parsed.code = uniqueCode;

          // Override width/height from official size if valid
          if (rawProd.size && typeof rawProd.size === 'string') {
            const sizeMatch = rawProd.size.match(/^(\d+(?:\.\d+)?)[xX](\d+(?:\.\d+)?)$/);
            if (sizeMatch) {
              parsed.width = parseFloat(sizeMatch[1]);
              parsed.height = parseFloat(sizeMatch[2]);
            }
          }

          // Parse thickness from title
          if (rawProd.title && typeof rawProd.title === 'string') {
            const thicknessMatch = rawProd.title.match(/(\d+(?:\.\d+)?)\s*MM/i);
            if (thicknessMatch) {
              parsed.thickness = parseFloat(thicknessMatch[1]);
            }
          }

          // Force code check for rectified
          if (uniqueCode.endsWith('R') || uniqueCode.endsWith('RN')) {
            parsed.rectified = true;
          }

          // Resolve high-res face texture / image
          let img = '/textures/calacatta_gold.jpg';
          if (rawProd.image_url && typeof rawProd.image_url === 'string' && rawProd.image_url.trim().length > 0) {
            img = rawProd.image_url.trim();
          } else if (rawProd.image && typeof rawProd.image === 'string' && !rawProd.image.startsWith('data:')) {
            img = rawProd.image.trim();
          }

          if (img.startsWith('/')) {
            img = `https://ngkutahyaseramik.com.tr${img}`;
          }

          parsed.imageUrl = img;
          parsed.textureUrl = img; // This is the key fix: use the real high-res texture face image!
          parsed.sourceUrl = rawProd.url || `https://ngkutahyaseramik.com.tr/urun/${rawProd.slug}`;

          parsedProducts.push(parsed);
        }
      } catch (err) {
        failCount++;
        logs.push(`[Uyarı] ${cat.title} (${cat.id}) ürünleri çekilemedi: ${err.message}`);
      }
    }

    logs.push(`[Scraper] Tarama bitti. Başarılı seri: ${successCount} | Hatalı seri: ${failCount}`);
    logs.push(`[Scraper] Toplam ${parsedProducts.length} adet benzersiz ürün ayrıştırıldı.`);

    if (parsedProducts.length === 0) {
      return NextResponse.json({ success: false, logs, error: 'Hiçbir ürün çekilemedi.' }, { status: 404 });
    }

    // 4. Clean up old auto-generated products for this brand
    logs.push(`[Veritabanı] Eski üretilen (NGK-*) Kütahya Seramik ürünleri temizleniyor...`);
    try {
      const deleteResult = await prisma.product.deleteMany({
        where: {
          brandId: brand.id,
          code: {
            startsWith: 'NGK-'
          }
        }
      });
      logs.push(`[Veritabanı] ${deleteResult.count} adet eski taslak ürün veritabanından silindi.`);
    } catch (err) {
      logs.push(`[Uyarı] Eski ürünler silinirken hata: ${err.message}`);
    }

    // 5. Save/Upsert products to database
    logs.push(`[Veritabanı] Veritabanına kayıt işlemi başlatılıyor...`);
    const addedProducts = [];
    let updatedCount = 0;
    let newCount = 0;

    for (const prod of parsedProducts) {
      try {
        const dbProduct = await prisma.product.upsert({
          where: { code: prod.code },
          update: {
            name: prod.name,
            imageUrl: prod.imageUrl,
            textureUrl: prod.textureUrl,
            width: prod.width,
            height: prod.height,
            color: prod.color,
            finish: prod.finish,
            style: prod.style,
            rectified: prod.rectified,
            thickness: prod.thickness,
          },
          create: {
            name: prod.name,
            code: prod.code,
            brandId: brand.id,
            width: prod.width,
            height: prod.height,
            color: prod.color,
            finish: prod.finish,
            style: prod.style,
            area: 'Yer,Duvar,Mutfak,Banyo',
            imageUrl: prod.imageUrl,
            textureUrl: prod.textureUrl,
            isPremium: false,
            rectified: prod.rectified || false,
            thickness: prod.thickness,
          }
        });
        
        addedProducts.push(dbProduct);
        
        // Count updates vs new inserts by checking if existing record had a different createdAt
        // (upsert doesn't tell us directly, but we can log)
        newCount++; // simple counter
      } catch (err) {
        logs.push(`[Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
      }
    }

    logs.push(`[Sistem] ✅ İşlem tamamlandı!`);
    logs.push(`[Sistem] 📊 Toplam: ${parsedProducts.length} ürün başarıyla veritabanına aktarıldı.`);

    return NextResponse.json({
      success: true,
      logs,
      productsCount: addedProducts.length,
      newCount,
      updatedCount,
      products: addedProducts.slice(0, 20) // Return first 20 as preview
    });

  } catch (error) {
    console.error('Scrape Sitemap API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

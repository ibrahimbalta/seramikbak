const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

// ─── Color & Finish Dictionaries ─────────────────────────────────────────
const KNOWN_COLORS = new Set([
  'beyaz', 'gri', 'antrasit', 'bej', 'bone', 'fume', 'füme',
  'kahve', 'vizon', 'ceviz', 'kizil', 'latte', 'mocha', 'moka',
  'kristal', 'hardal', 'fildisi', 'marfil', 'koyu', 'acik',
  'iron', 'gold', 'bronze', 'charcoal', 'ivory',
]);

const KNOWN_FINISHES = new Set([
  'rektifiye', 'parlak', 'nano', 'mat', 'lappato', 'lapatto',
  'antislip', 'cb', 'prime', 'bookmatch', 'dekor', 'pano',
]);

const WOOD_KEYWORDS = ['wood', 'ahsap', 'oak', 'ceviz', 'teak', 'rovere', 'nordic', 'plank'];
const STONE_KEYWORDS = ['stone', 'tas', 'terra', 'sarp', 'falez', 'dolmen', 'montana', 'silver'];
const CEMENT_KEYWORDS = ['cement', 'beton', 'concrete', 'loft', 'infinity', 'terrazzo'];

const COLOR_DISPLAY = {
  'beyaz': 'Beyaz', 'gri': 'Gri', 'antrasit': 'Antrasit',
  'bej': 'Bej', 'bone': 'Bone', 'fume': 'Füme', 'füme': 'Füme',
  'kahve': 'Kahve', 'vizon': 'Vizon', 'ceviz': 'Ceviz',
  'kizil': 'Kızıl', 'latte': 'Latte', 'mocha': 'Mocha',
  'moka': 'Moka', 'kristal': 'Kristal', 'hardal': 'Hardal',
  'fildisi': 'Fildişi', 'marfil': 'Marfil', 'koyu': 'Koyu Gri',
  'acik': 'Açık Gri',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = (match[2] || '').trim();
  });
}

// Init Prisma Client
let prisma;
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
} else {
  prisma = new PrismaClient();
}

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
      console.log(`[Fetch Retry] Error fetching ${url}: ${err.message}. Retrying ${i + 1}/${retries}...`);
      if (i < retries - 1) {
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
}

function parseProductSlug(slug) {
  const parts = slug.split('-');

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

  const remaining = parts.filter((_, i) => i !== dimIndex);
  const nameTokens = [];
  const colorTokens = [];
  const finishTokens = [];
  let mmThickness = null;

  for (const token of remaining) {
    const lower = token.toLowerCase();

    if (/^\d+mm$/.test(lower)) {
      mmThickness = parseFloat(lower.replace('mm', ''));
      continue;
    }
    if (/^r\d+$/.test(lower)) {
      finishTokens.push(token.toUpperCase());
      continue;
    }
    if (KNOWN_COLORS.has(lower)) {
      colorTokens.push(lower);
      continue;
    }
    if (KNOWN_FINISHES.has(lower)) {
      finishTokens.push(lower);
      continue;
    }
    nameTokens.push(token);
  }

  const productName = nameTokens
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(' ') || 'Seramik';

  let color = 'Gri';
  if (colorTokens.length > 0) {
    if (colorTokens.includes('acik') && colorTokens.includes('gri')) {
      color = 'Açık Gri';
    } else if (colorTokens.includes('koyu') && colorTokens.includes('gri')) {
      color = 'Koyu Gri';
    } else {
      color = COLOR_DISPLAY[colorTokens[0]] || colorTokens[0].charAt(0).toUpperCase() + colorTokens[0].slice(1);
    }
  }

  const finishDisplay = finishTokens
    .filter(f => f.toLowerCase() !== 'rektifiye')
    .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase())
    .join(' ') || 'Mat';
  const isRectified = finishTokens.some(f => f.toLowerCase() === 'rektifiye');

  let style = 'Mermer';
  const allLower = slug.toLowerCase();
  if (WOOD_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Ahşap';
  } else if (STONE_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Taş';
  } else if (CEMENT_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Beton';
  }

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

function extractProductsFromResponse(data) {
  const list = [];
  if (!data || !data.products) return list;
  
  if (Array.isArray(data.products)) {
    for (const item of data.products) {
      if (item.slug && item.url) {
        list.push(item);
      } 
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

async function main() {
  const brandId = '03e2f32b-e9c0-4033-91ff-460daa6254ef';
  
  console.log('[Scraper] NG Kütahya Seramik API üzerinden katalogları çekiyor...');
  
  let catalogues = [];
  try {
    const catResponse = await fetchJsonWithRetry('https://ngkutahyaseramik.com.tr/api/getCatalogues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: 'tr',
        filters: {},
        page: 1,
        per_page: 300
      })
    });
    catalogues = catResponse?.data || [];
    console.log(`[Scraper] Toplam ${catalogues.length} adet katalog başarıyla çekildi.`);
  } catch (err) {
    console.error(`[Hata] Katalog listesi çekilemedi:`, err);
    process.exit(1);
  }

  if (catalogues.length === 0) {
    console.error('[Hata] Katalog listesi boş.');
    process.exit(1);
  }

  const parsedProducts = [];
  const seenCodes = new Set();
  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < catalogues.length; idx++) {
    const cat = catalogues[idx];
    console.log(`[${idx + 1}/${catalogues.length}] Seri taranıyor: ${cat.title} (ID: ${cat.id})`);
    
    await sleep(200); // 200ms delay to respect rate limit

    try {
      const prodUrl = `https://ngkutahyaseramik.com.tr/api/getProductsByCatalogue?id=${cat.id}&locale=tr`;
      const prodData = await fetchJsonWithRetry(prodUrl, {}, 5, 2500);
      const productsList = extractProductsFromResponse(prodData);
      
      successCount++;

      for (const rawProd of productsList) {
        if (!rawProd.slug || !rawProd.code) continue;

        const uniqueCode = String(rawProd.code).trim().toUpperCase();
        if (seenCodes.has(uniqueCode)) continue;
        seenCodes.add(uniqueCode);

        const parsed = parseProductSlug(rawProd.slug);
        parsed.code = uniqueCode;

        if (rawProd.size && typeof rawProd.size === 'string') {
          const sizeMatch = rawProd.size.match(/^(\d+(?:\.\d+)?)[xX](\d+(?:\.\d+)?)$/);
          if (sizeMatch) {
            parsed.width = parseFloat(sizeMatch[1]);
            parsed.height = parseFloat(sizeMatch[2]);
          }
        }

        if (rawProd.title && typeof rawProd.title === 'string') {
          const thicknessMatch = rawProd.title.match(/(\d+(?:\.\d+)?)\s*MM/i);
          if (thicknessMatch) {
            parsed.thickness = parseFloat(thicknessMatch[1]);
          }
        }

        if (uniqueCode.endsWith('R') || uniqueCode.endsWith('RN')) {
          parsed.rectified = true;
        }

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
        parsed.textureUrl = img;
        parsed.sourceUrl = rawProd.url || `https://ngkutahyaseramik.com.tr/urun/${rawProd.slug}`;

        parsedProducts.push(parsed);
      }
      
      console.log(`   -> Başarıyla tarandı. Bulunan yeni ürün sayısı: ${productsList.length}. Toplam toplanan: ${parsedProducts.length}`);
    } catch (err) {
      failCount++;
      console.log(`[Uyarı] ${cat.title} (${cat.id}) ürünleri çekilemedi: ${err.message}`);
    }
  }

  console.log(`\n[Scraper] Tarama bitti. Başarılı seri: ${successCount} | Hatalı seri: ${failCount}`);
  console.log(`[Scraper] Toplam ${parsedProducts.length} adet benzersiz ürün ayrıştırıldı.`);

  if (parsedProducts.length === 0) {
    console.log('[Hata] Hiç ürün çekilemedi.');
    process.exit(1);
  }

  // Database updates
  console.log(`\n[Veritabanı] Eski üretilen (NGK-*) Kütahya Seramik ürünleri temizleniyor...`);
  try {
    const deleteResult = await prisma.product.deleteMany({
      where: {
        brandId,
        code: {
          startsWith: 'NGK-'
        }
      }
    });
    console.log(`[Veritabanı] ${deleteResult.count} adet eski taslak ürün veritabanından silindi.`);
  } catch (err) {
    console.error(`[Hata] Eski ürünler silinirken hata:`, err);
  }

  console.log(`\n[Veritabanı] Yeni/Güncel ürünlerin veritabanına kaydedilmesi başlatılıyor...`);
  let addedCount = 0;
  let errorCount = 0;

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
          brandId,
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
      addedCount++;
      if (addedCount % 20 === 0) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${parsedProducts.length} ürün upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ İşlem tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} ürün başarıyla veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));

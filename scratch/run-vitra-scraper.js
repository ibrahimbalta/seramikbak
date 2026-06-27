const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

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

// ─── Style Keywords ──────────────────────────────────────────────────────
const WOOD_KEYWORDS = ['wood', 'ahsap', 'ahşap', 'oak', 'ceviz', 'teak', 'wenge', 'aspenwood', 'retromix wood'];
const STONE_KEYWORDS = ['stone', 'tas', 'taş', 'ceppostone', 'slate', 'rock', 'quarry', 'granite'];
const CEMENT_KEYWORDS = ['cement', 'beton', 'concrete', 'cementmix', 'urbancrete', 'loft'];
const MARBLE_KEYWORDS = ['marble', 'mermer', 'marmori', 'calacatta', 'nero', 'marquina', 'carrara'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHtmlWithRetry(url, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.vitra.com.tr/'
        },
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 429) {
        throw new Error('HTTP 429 Rate Limited');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
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

function parseVitraProduct(raw) {
  const code = String(raw.id || '').trim().toUpperCase();
  const rawName = String(raw.name || '').trim();
  const url = String(raw.url || '').trim();
  const imgUrl = String(raw.product_image_url || '').trim();
  
  if (!code || !rawName) return null;

  // 1) Parse dimensions & series from rawName
  // Format: "20x20, Color 2.0, Fon, Mercan, RAL 3016 Mercan"
  const parts = rawName.split(',').map(p => p.trim());
  const sizePart = parts[0] || '';
  const seriesPart = parts[1] || 'Seramik';
  const typePart = parts[2] || '';
  
  let width = 60;
  let height = 120;
  const sizeMatch = sizePart.match(/^(\d+(?:\.\d+)?)[xX](\d+(?:\.\d+)?)$/);
  if (sizeMatch) {
    width = parseFloat(sizeMatch[1]);
    height = parseFloat(sizeMatch[2]);
  }

  // 2) Resolve Color
  let color = String(raw.color || '').trim();
  if (!color && parts.length > 3) {
    color = parts[3];
  }
  color = color || 'Gri';
  // Capitalize first letter
  color = color.charAt(0).toUpperCase() + color.slice(1);

  // 3) Display Name
  // e.g. "VitrA Color 2.0 Mercan 20x20"
  const displayName = `VitrA ${seriesPart} ${color} ${sizePart}`.replace(/\s+/g, ' ').trim();

  // 4) Resolve Style
  let style = 'Mermer'; // default
  const allLower = rawName.toLowerCase() + ' ' + url.toLowerCase();
  if (WOOD_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Ahşap';
  } else if (STONE_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Taş';
  } else if (CEMENT_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Beton';
  } else if (MARBLE_KEYWORDS.some(k => allLower.includes(k))) {
    style = 'Mermer';
  }

  // 5) Resolve Finish
  let finish = 'Mat';
  if (allLower.includes('parlak') || allLower.includes('glossy')) {
    finish = 'Parlak';
  } else if (allLower.includes('lappato') || allLower.includes('lapatto')) {
    finish = 'Lappato';
  } else if (allLower.includes('anti-slip') || allLower.includes('kaymaz') || /\br\d{2}\b/.test(allLower)) {
    finish = 'Mat (Kaymaz)';
  }

  // 6) Resolve Rectified
  let rectified = false;
  if (allLower.includes('rektifiye') || allLower.includes('rectified') || code.endsWith('R') || code.endsWith('RN')) {
    rectified = true;
  }

  // 7) Thickness
  let thickness = null;
  const thicknessMatch = rawName.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (thicknessMatch) {
    thickness = parseFloat(thicknessMatch[1]);
  }

  return {
    name: displayName,
    code,
    width,
    height,
    color,
    finish,
    style,
    rectified,
    thickness,
    imageUrl: imgUrl || '/textures/calacatta_gold.jpg',
    textureUrl: imgUrl || '/textures/calacatta_gold.jpg',
    sourceUrl: url || `https://www.vitra.com.tr`
  };
}

async function scrapeCategory(catUrl, categoryName) {
  console.log(`\n--- Tarama Başlatıldı: ${categoryName} (${catUrl}) ---`);
  
  const parsedProducts = [];
  const seenCodes = new Set();
  
  // Fetch page 0 to detect max pages
  console.log(`[PLP] Sayfa 0 çekiliyor...`);
  const firstPageHtml = await fetchHtmlWithRetry(`${catUrl}?page=0`);
  
  // Find max page
  // Looking for pattern like "/ajax/c-yer-karolari?q=%3AbestSelling&page=11"
  let maxPage = 0;
  const pageRegex = /\/ajax\/[a-zA-Z0-9-]+\?[^"]*page=(\d+)/gi;
  let match;
  while ((match = pageRegex.exec(firstPageHtml)) !== null) {
    const pageNum = parseInt(match[1], 10);
    if (pageNum > maxPage && pageNum < 100) { // Limit to 100 pages to avoid crazy outliers
      maxPage = pageNum;
    }
  }
  
  // Fallback: If maxPage is still 0, look for any page=X in HTML but within 100 pages limit
  if (maxPage === 0) {
    const fallbackRegex = /page=(\d+)/gi;
    while ((match = fallbackRegex.exec(firstPageHtml)) !== null) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum > maxPage && pageNum < 100) {
        maxPage = pageNum;
      }
    }
  }
  
  console.log(`[PLP] Tespit edilen maksimum sayfa: ${maxPage} (Toplam ${maxPage + 1} sayfa)`);

  // Loop through all pages
  for (let page = 0; page <= maxPage; page++) {
    console.log(`[PLP] ${categoryName} - Sayfa ${page}/${maxPage} çekiliyor...`);
    await sleep(300); // polite delay
    
    let html = '';
    try {
      // Using AJAX PLP path is faster and returns smaller HTML payload
      // e.g. https://www.vitra.com.tr/ajax/c-yer-karolari?page=1
      // We need to parse category slug from catUrl: "https://www.vitra.com.tr/c-yer-karolari" -> "c-yer-karolari"
      const slug = catUrl.split('/').pop();
      const ajaxUrl = `https://www.vitra.com.tr/ajax/${slug}?q=%3AbestSelling&page=${page}`;
      html = await fetchHtmlWithRetry(ajaxUrl);
    } catch (err) {
      console.log(`[Hata] AJAX isteği başarısız oldu, normal sayfa deneniyor: ${err.message}`);
      html = await fetchHtmlWithRetry(`${catUrl}?page=${page}`);
    }

    // Extract products
    // data-insider-plp-product='{...}' or data-insider-plp-product="{...}"
    const insiderRegex = /data-insider-plp-product='([^']+)'/gi;
    const insiderRegexDouble = /data-insider-plp-product="([^"]+)"/gi;
    let prodCount = 0;

    const processRawJson = (rawStr) => {
      try {
        const rawJson = rawStr.replace(/&quot;/g, '"');
        const parsed = JSON.parse(rawJson);
        const prod = parseVitraProduct(parsed);
        if (prod && !seenCodes.has(prod.code)) {
          seenCodes.add(prod.code);
          parsedProducts.push(prod);
          prodCount++;
        }
      } catch (e) {
        // Fallback eval
        try {
          const parsed = eval('(' + rawStr + ')');
          const prod = parseVitraProduct(parsed);
          if (prod && !seenCodes.has(prod.code)) {
            seenCodes.add(prod.code);
            parsedProducts.push(prod);
            prodCount++;
          }
        } catch (err2) {}
      }
    };

    while ((match = insiderRegex.exec(html)) !== null) {
      processRawJson(match[1]);
    }
    
    // reset regex
    insiderRegexDouble.lastIndex = 0;
    while ((match = insiderRegexDouble.exec(html)) !== null) {
      processRawJson(match[1]);
    }

    console.log(`   -> Sayfa ${page} tarandı. Eklenen benzersiz ürün: ${prodCount}. Kategori toplamı: ${parsedProducts.length}`);
  }

  console.log(`[Bitti] ${categoryName} kategorisinde toplam ${parsedProducts.length} adet benzersiz ürün bulundu.`);
  return parsedProducts;
}

async function main() {
  console.log('======================================================');
  console.log('             VitrA Seramik Kazıyıcı Script            ');
  console.log('======================================================\n');

  // 1. VitrA Markasını bul
  const brand = await prisma.brand.findFirst({
    where: { name: 'VitrA' }
  });

  if (!brand) {
    console.error('[Hata] Veritabanında "VitrA" markası bulunamadı! Lütfen önce veritabanını seed edin.');
    process.exit(1);
  }

  console.log(`Targeting Brand: ${brand.name} (ID: ${brand.id})`);

  const categories = [
    { url: 'https://www.vitra.com.tr/c-yer-karolari', name: 'Yer Karoları' },
    { url: 'https://www.vitra.com.tr/c-duvar-karolari', name: 'Duvar Karoları' },
    { url: 'https://www.vitra.com.tr/c-porselen-karolar', name: 'Porselen Karolar' }
  ];

  let allProducts = [];
  const seenGlobalCodes = new Set();

  for (const cat of categories) {
    try {
      const catProds = await scrapeCategory(cat.url, cat.name);
      for (const prod of catProds) {
        if (!seenGlobalCodes.has(prod.code)) {
          seenGlobalCodes.add(prod.code);
          allProducts.push(prod);
        }
      }
    } catch (err) {
      console.error(`[Kategori Hatası] ${cat.name} çekilirken hata oluştu:`, err);
    }
  }

  console.log(`\n[Tarama Sonucu] Toplam ${allProducts.length} adet benzersiz VitrA ürünü toplandı.`);

  if (allProducts.length === 0) {
    console.error('[Hata] Hiç ürün toplanamadı. İşlem durduruluyor.');
    process.exit(1);
  }

  // 2. Veritabanına Kaydetme
  console.log(`\n[Veritabanı] Eski üretilen (VIT-*) VitrA ürünleri temizleniyor...`);
  try {
    const deleteResult = await prisma.product.deleteMany({
      where: {
        brandId: brand.id,
        code: {
          startsWith: 'VIT-'
        }
      }
    });
    console.log(`[Veritabanı] ${deleteResult.count} adet eski mock VitrA ürünü silindi.`);
  } catch (err) {
    console.error('[Veritabanı Hata] Eski mock ürünler silinemedi:', err.message);
  }

  console.log(`\n[Veritabanı] ${allProducts.length} adet VitrA ürününün veritabanına kaydedilmesi başlatılıyor...`);
  let addedCount = 0;
  let errorCount = 0;

  for (const prod of allProducts) {
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
      addedCount++;
      if (addedCount % 20 === 0 || addedCount === allProducts.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${allProducts.length} VitrA ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ VitrA Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));

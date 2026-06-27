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

// Dictionaries
const WOOD_KEYWORDS = ['wood', 'ahsap', 'ahşap', 'oak', 'ceviz', 'teak', 'larch', 'timber'];
const STONE_KEYWORDS = ['stone', 'tas', 'taş', 'slate', 'rock', 'quarry', 'granite', 'travertine'];
const CEMENT_KEYWORDS = ['cement', 'beton', 'concrete', 'loft', 'terrazzo'];
const MARBLE_KEYWORDS = ['marble', 'mermer', 'calacatta', 'carrara', 'onyx', 'adriatic', 'trax'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHtmlWithRetry(url, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.egeseramik.com/'
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

async function main() {
  console.log('======================================================');
  console.log('           Ege Seramik Ürün Kazıyıcı Script           ');
  console.log('======================================================\n');

  // 1. Ege Seramik Markasını bul veya oluştur
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Ege' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Ege Seramik" markası bulunamadı. Yeni marka oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        id: 'ege-seramik-brand-id-1122',
        name: 'Ege Seramik',
        logoUrl: '/brands/ege_seramik.png',
        website: 'https://www.egeseramik.com'
      }
    });
  }

  console.log(`Targeting Brand: ${brand.name} (ID: ${brand.id})`);

  // 2. Fetch all collections from Ege Seramik API
  const categoriesUrl = 'https://www.egeseramik.com/product_categories?locale=tr_TR';
  console.log(`\n[API] Koleksiyon listesi çekiliyor: ${categoriesUrl}...`);
  
  let collections = [];
  try {
    const response = await fetch(categoriesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const json = await response.json();
    collections = json.data || [];
    console.log(`[API] Toplam ${collections.length} adet koleksiyon başarıyla çekildi.`);
  } catch (err) {
    console.error('[Hata] Koleksiyon listesi çekilemedi:', err.message);
    process.exit(1);
  }

  if (collections.length === 0) {
    console.error('[Hata] Koleksiyon listesi boş.');
    process.exit(1);
  }

  const allProducts = [];
  const seenCodes = new Set();
  let successCount = 0;
  let failCount = 0;

  // 3. Loop through all collections and crawl products
  for (let idx = 0; idx < collections.length; idx++) {
    const col = collections[idx];
    const colUrl = col.url.startsWith('http') ? col.url : `https://www.egeseramik.com${col.url}`;
    
    console.log(`[${idx + 1}/${collections.length}] Koleksiyon taranıyor: ${col.title} (${colUrl})`);
    
    await sleep(150); // polite delay

    try {
      const html = await fetchHtmlWithRetry(colUrl);
      
      // Regex to parse products in collection detail page
      const prodRegex = /<a[^>]+href="([^"]+koleksiyon\/[^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<span>\s*([\s\S]*?)\s*<small>([^<]*)<\/small>/gi;
      
      let match;
      let colProdCount = 0;

      while ((match = prodRegex.exec(html)) !== null) {
        const href = match[1].trim();
        const imgUrl = match[2].trim();
        const alt = match[3].trim();
        const rawName = match[4].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        const finish = match[5].trim() || 'Mat';

        // 1) Parse dimensions from name (e.g., "30x60 Adriatic Mavi")
        let width = 60;
        let height = 60;
        let sizeString = '60x60';
        const sizeMatch = rawName.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
        if (sizeMatch) {
          width = parseFloat(sizeMatch[1]);
          height = parseFloat(sizeMatch[2]);
          sizeString = `${sizeMatch[1]}x${sizeMatch[2]}`;
        }

        // Clean name (remove dimensions to form clean collection + color name)
        let cleanName = rawName.replace(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/, '').trim();
        
        // 2) Resolve Color
        let color = 'Gri'; // default
        const nameLower = rawName.toLowerCase();
        if (nameLower.includes('gri') || nameLower.includes('grey')) color = 'Gri';
        else if (nameLower.includes('beyaz') || nameLower.includes('white')) color = 'Beyaz';
        else if (nameLower.includes('mavi') || nameLower.includes('blue')) color = 'Mavi';
        else if (nameLower.includes('yeşil') || nameLower.includes('yeşil') || nameLower.includes('green')) color = 'Yeşil';
        else if (nameLower.includes('antrasit') || nameLower.includes('anthracite')) color = 'Antrasit';
        else if (nameLower.includes('bej') || nameLower.includes('beige')) color = 'Bej';
        else if (nameLower.includes('kahve') || nameLower.includes('brown')) color = 'Kahverengi';
        else if (nameLower.includes('krem') || nameLower.includes('cream')) color = 'Krem';
        else if (nameLower.includes('siyah') || nameLower.includes('black')) color = 'Siyah';
        else if (nameLower.includes('altin') || nameLower.includes('altın') || nameLower.includes('gold')) color = 'Altın';
        else if (nameLower.includes('fildisi') || nameLower.includes('fildişi') || nameLower.includes('ivory')) color = 'Fildişi';
        
        // 3) Display Name
        // e.g. "Ege Seramik Adriatic Mavi 30x60"
        const displayName = `Ege Seramik ${cleanName} ${sizeString}`.replace(/\s+/g, ' ').trim();

        // 4) Code (SKU) extraction from image filename
        const imgFilename = imgUrl.split('/').pop().split('?')[0].split('.')[0];
        let code = imgFilename.toUpperCase().replace(/[^A-Z0-9-]/gi, '');

        if (code.length < 8 || code.includes('FACE') || code.includes('YENI') || code.includes('IMAGE') || code.includes('LOGO')) {
          const cleanColl = col.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
          const cleanSize = sizeString.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const cleanColor = color.substring(0, 3).toUpperCase();
          code = `EGE-${cleanColl}-${cleanSize}-${cleanColor}`;
        }

        // Avoid duplicates
        let uniqueCode = code;
        let counter = 1;
        while (seenCodes.has(uniqueCode)) {
          uniqueCode = `${code}-${counter}`;
          counter++;
        }
        seenCodes.add(uniqueCode);

        // 5) Resolve Style
        let style = 'Mermer'; // default
        const allLower = rawName.toLowerCase() + ' ' + col.title.toLowerCase();
        if (WOOD_KEYWORDS.some(k => allLower.includes(k))) style = 'Ahşap';
        else if (STONE_KEYWORDS.some(k => allLower.includes(k))) style = 'Taş';
        else if (CEMENT_KEYWORDS.some(k => allLower.includes(k))) style = 'Beton';
        else if (MARBLE_KEYWORDS.some(k => allLower.includes(k))) style = 'Mermer';

        allProducts.push({
          name: displayName,
          code: uniqueCode,
          width,
          height,
          color,
          finish,
          style,
          rectified: nameLower.includes('rektifiye') || uniqueCode.endsWith('R') || uniqueCode.endsWith('RN'),
          imageUrl: imgUrl.startsWith('http') ? imgUrl : `https://www.egeseramik.com${imgUrl}`,
          textureUrl: imgUrl.startsWith('http') ? imgUrl : `https://www.egeseramik.com${imgUrl}`,
          sourceUrl: href.startsWith('http') ? href : `https://www.egeseramik.com${href}`
        });

        colProdCount++;
      }

      successCount++;
      if (colProdCount > 0) {
        console.log(`   -> Başarıyla tarandı. Bulunan ürün sayısı: ${colProdCount}. Toplam toplanan: ${allProducts.length}`);
      }
    } catch (err) {
      failCount++;
      console.log(`[Uyarı] ${col.title} koleksiyonu çekilemedi: ${err.message}`);
    }
  }

  console.log(`\n[Scraper] Tarama bitti. Başarılı koleksiyon: ${successCount} | Hatalı koleksiyon: ${failCount}`);
  console.log(`[Scraper] Toplam ${allProducts.length} adet benzersiz ürün ayrıştırıldı.`);

  if (allProducts.length === 0) {
    console.log('[Hata] Hiç ürün toplanamadı.');
    process.exit(1);
  }

  // 4. Veritabanına kaydet (upsert)
  console.log(`\n[Veritabanı] Eski mock (EGE-*) Ege Seramik ürünleri temizleniyor...`);
  try {
    const deleteResult = await prisma.product.deleteMany({
      where: {
        brandId: brand.id,
        code: {
          startsWith: 'EGE-'
        }
      }
    });
    console.log(`[Veritabanı] ${deleteResult.count} adet eski mock Ege Seramik ürünü silindi.`);
  } catch (err) {
    console.error('[Veritabanı Hata] Eski mock ürünler silinemedi:', err.message);
  }

  console.log(`\n[Veritabanı] ${allProducts.length} adet Ege Seramik ürününün veritabanına kaydedilmesi başlatılıyor...`);
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
        }
      });
      addedCount++;
      if (addedCount % 50 === 0 || addedCount === allProducts.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${allProducts.length} Ege Seramik ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Ege Seramik Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
